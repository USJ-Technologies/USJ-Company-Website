-- ============================================================
-- USJ Technologies — Migration: Rename "vendor" → "USJ Partner"
--
-- Terminology rename across the whole schema:
--   table      vendors                        → usj_partners
--   column     profiles.vendor_id             → profiles.partner_id
--   column     products.vendor_id             → products.partner_id
--   column     order_items.vendor_id          → order_items.partner_id
--   role value 'vendor'                       → 'usj_partner'
--   function   is_vendor()                    → is_usj_partner()
--   function   is_approved_vendor()           → is_approved_usj_partner()
--   function   get_vendor_id()                → get_partner_id()
--   function   close_vendor_for_account_...   → close_usj_partner_for_account_...
--   bucket     vendor-kyc                     → partner-kyc (new uploads)
--
-- Earlier migrations (20260829*) are left untouched: they are already
-- applied upstream, and rewriting applied history would desync
-- `supabase db reset` from the remote. This migration rolls the schema
-- forward instead.
--
-- Idempotent: safe to re-run. Every rename is guarded.
--
-- NOTE ON STORAGE: existing KYC objects physically live under the
-- `vendor-kyc` bucket prefix and cannot be moved by SQL. That bucket is
-- kept readable/deletable for legacy documents; all NEW uploads go to
-- `partner-kyc`. See step 9.
--
-- Run in Supabase SQL Editor.
-- ============================================================

BEGIN;

-- ------------------------------------------------------------
-- 1. Drop policies that depend on the old helper functions.
--    Dropped explicitly rather than with CASCADE: if an unknown
--    policy also depends on these functions, the DROP FUNCTION in
--    step 2 must fail loudly rather than silently removing a
--    security policy.
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "vendor_read_own_products"           ON products;
DROP POLICY IF EXISTS "vendor_insert_update_own_products"  ON products;
DROP POLICY IF EXISTS "vendor_update_own_products"          ON products;
DROP POLICY IF EXISTS "vendor_delete_own_products"          ON products;
DROP POLICY IF EXISTS "vendor_read_own_order_items"         ON order_items;
DROP POLICY IF EXISTS "manager_upload_product_images_storage" ON storage.objects;

DROP POLICY IF EXISTS "public_read_approved_vendors" ON vendors;
DROP POLICY IF EXISTS "users_read_own_vendor"        ON vendors;
DROP POLICY IF EXISTS "users_insert_vendors"         ON vendors;
DROP POLICY IF EXISTS "team_all_vendors"             ON vendors;

-- ------------------------------------------------------------
-- 2. Drop the old helper + account-deletion functions
-- ------------------------------------------------------------
DROP FUNCTION IF EXISTS public.is_vendor();
DROP FUNCTION IF EXISTS public.is_approved_vendor();
DROP FUNCTION IF EXISTS public.get_vendor_id();
DROP FUNCTION IF EXISTS public.close_vendor_for_account_deletion(UUID);

-- ------------------------------------------------------------
-- 3. Rename the table
-- ------------------------------------------------------------
ALTER TABLE IF EXISTS public.vendors RENAME TO usj_partners;

-- ------------------------------------------------------------
-- 4. Rename the vendor_id columns → partner_id
--    (ALTER TABLE ... RENAME COLUMN has no IF EXISTS)
-- ------------------------------------------------------------
DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY['profiles', 'products', 'order_items']) LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = t AND column_name = 'vendor_id'
    ) THEN
      EXECUTE format('ALTER TABLE public.%I RENAME COLUMN vendor_id TO partner_id', t);
    END IF;
  END LOOP;
END $$;

-- ------------------------------------------------------------
-- 5. Rename constraints and indexes to match
--    'vendors' → 'usj_partners' first, then any leftover
--    'vendor' → 'partner' (so vendors_pkey → usj_partners_pkey,
--    products_vendor_id_fkey → products_partner_id_fkey).
-- ------------------------------------------------------------
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT cl.relname AS tbl, c.conname
    FROM pg_constraint c
    JOIN pg_class cl     ON cl.oid = c.conrelid
    JOIN pg_namespace n  ON n.oid = cl.relnamespace
    WHERE n.nspname = 'public' AND c.conname LIKE '%vendor%'
  LOOP
    EXECUTE format(
      'ALTER TABLE public.%I RENAME CONSTRAINT %I TO %I',
      r.tbl, r.conname,
      replace(replace(r.conname, 'vendors', 'usj_partners'), 'vendor', 'partner')
    );
  END LOOP;

  FOR r IN
    SELECT indexname FROM pg_indexes
    WHERE schemaname = 'public' AND indexname LIKE '%vendor%'
  LOOP
    EXECUTE format(
      'ALTER INDEX public.%I RENAME TO %I',
      r.indexname,
      replace(replace(r.indexname, 'vendors', 'usj_partners'), 'vendor', 'partner')
    );
  END LOOP;
END $$;

-- ------------------------------------------------------------
-- 6. Migrate the role value: 'vendor' → 'usj_partner'
--    Constraint is dropped first so the UPDATE can land.
-- ------------------------------------------------------------
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- prevent_role_self_escalation() (migration 016) blocks any role change
-- when the caller isn't an admin. In the SQL Editor auth.uid() is NULL,
-- so is_admin() is false and this backfill would raise. Disable the
-- trigger for the duration of the UPDATE only.
ALTER TABLE profiles DISABLE TRIGGER trg_prevent_role_self_escalation;

UPDATE profiles SET role = 'usj_partner' WHERE role = 'vendor';

ALTER TABLE profiles ENABLE TRIGGER trg_prevent_role_self_escalation;

ALTER TABLE profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('customer', 'admin', 'manager', 'staff', 'usj_partner'));

-- Role-change trigger referenced the old value (migration 016)
CREATE OR REPLACE FUNCTION public.prevent_role_self_escalation()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF is_admin() THEN
      RETURN NEW;
    ELSIF is_manager_or_above()
      AND NEW.role IN ('usj_partner', 'customer')
      AND OLD.role IN ('usj_partner', 'customer') THEN
      RETURN NEW;
    ELSE
      RAISE EXCEPTION 'You do not have permission to assign this role.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- ------------------------------------------------------------
-- 7. Recreate the helper functions under the new names
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_usj_partner()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'usj_partner'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_approved_usj_partner()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles p
    JOIN usj_partners up ON p.partner_id = up.id
    WHERE p.id = auth.uid()
      AND p.role = 'usj_partner'
      AND up.status = 'approved'
  );
$$;

CREATE OR REPLACE FUNCTION public.get_partner_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER SET search_path = public
AS $$
  SELECT partner_id FROM profiles
  WHERE id = auth.uid() AND role = 'usj_partner'
  LIMIT 1;
$$;

-- ------------------------------------------------------------
-- 8. Recreate the RLS policies under the new names
-- ------------------------------------------------------------

-- usj_partners table
CREATE POLICY "public_read_approved_usj_partners" ON usj_partners
  FOR SELECT USING (status = 'approved');

CREATE POLICY "users_read_own_usj_partner" ON usj_partners
  FOR SELECT TO authenticated
  USING (
    auth.uid() = created_by
    OR id IN (SELECT partner_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "users_insert_usj_partners" ON usj_partners
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "team_all_usj_partners" ON usj_partners
  FOR ALL TO authenticated
  USING (is_manager_or_above())
  WITH CHECK (is_manager_or_above());

-- products
CREATE POLICY "partner_read_own_products" ON products
  FOR SELECT TO authenticated
  USING (is_usj_partner() AND partner_id = get_partner_id());

CREATE POLICY "partner_insert_own_products" ON products
  FOR INSERT TO authenticated
  WITH CHECK (is_usj_partner() AND partner_id = get_partner_id());

CREATE POLICY "partner_update_own_products" ON products
  FOR UPDATE TO authenticated
  USING (is_usj_partner() AND partner_id = get_partner_id())
  WITH CHECK (is_usj_partner() AND partner_id = get_partner_id());

CREATE POLICY "partner_delete_own_products" ON products
  FOR DELETE TO authenticated
  USING (is_usj_partner() AND partner_id = get_partner_id());

-- order_items
CREATE POLICY "partner_read_own_order_items" ON order_items
  FOR SELECT TO authenticated
  USING (is_usj_partner() AND partner_id = get_partner_id());

-- product-images storage (recreated from migration 016 with the new fn)
CREATE POLICY "manager_upload_product_images_storage"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'product-images'
  AND (is_manager_or_above() OR is_approved_usj_partner())
);

-- ------------------------------------------------------------
-- 9. KYC storage: new partner-kyc bucket, legacy vendor-kyc kept
--    readable so already-uploaded documents stay accessible.
-- ------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('partner-kyc', 'partner-kyc', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "vendor_upload_kyc"  ON storage.objects;
DROP POLICY IF EXISTS "vendor_read_kyc"    ON storage.objects;
DROP POLICY IF EXISTS "admin_delete_kyc"   ON storage.objects;
DROP POLICY IF EXISTS "partner_upload_kyc" ON storage.objects;
DROP POLICY IF EXISTS "partner_read_kyc"   ON storage.objects;
DROP POLICY IF EXISTS "partner_delete_kyc" ON storage.objects;

-- New uploads: partner-kyc only, into the uploader's own folder
CREATE POLICY "partner_upload_kyc" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'partner-kyc'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Reads: uploader or admin, across both the new and legacy buckets
CREATE POLICY "partner_read_kyc" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id IN ('partner-kyc', 'vendor-kyc')
    AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR is_admin()
    )
  );

-- Deletes: admin only, across both buckets
CREATE POLICY "partner_delete_kyc" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id IN ('partner-kyc', 'vendor-kyc')
    AND is_admin()
  );

-- ------------------------------------------------------------
-- 10. Account-deletion functions
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.close_usj_partner_for_account_deletion(p_partner_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE products
  SET is_active = false
  WHERE partner_id = p_partner_id;

  UPDATE usj_partners
  SET
    status = 'closed',
    business_name = 'Closed Account',
    contact_info = '{}'::jsonb,
    kyc_document_urls = ARRAY[]::text[],
    gst_number = NULL,
    pan_number = NULL,
    storefront_description = NULL,
    logo_url = NULL,
    created_by = NULL,
    updated_at = NOW()
  WHERE id = p_partner_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.delete_own_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID := auth.uid();
  user_role TEXT;
  linked_partner_id UUID;
  partner_row RECORD;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT role, partner_id
  INTO user_role, linked_partner_id
  FROM profiles
  WHERE id = uid;

  IF user_role IN ('admin', 'manager', 'staff') THEN
    RAISE EXCEPTION 'Team accounts must be removed by an administrator.';
  END IF;

  IF linked_partner_id IS NOT NULL THEN
    PERFORM public.close_usj_partner_for_account_deletion(linked_partner_id);
  END IF;

  FOR partner_row IN
    SELECT id
    FROM usj_partners
    WHERE created_by = uid
      AND (linked_partner_id IS NULL OR id <> linked_partner_id)
  LOOP
    PERFORM public.close_usj_partner_for_account_deletion(partner_row.id);
  END LOOP;

  DELETE FROM auth.users WHERE id = uid;
END;
$$;

REVOKE ALL ON FUNCTION public.close_usj_partner_for_account_deletion(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.close_usj_partner_for_account_deletion(UUID) TO service_role;

REVOKE ALL ON FUNCTION public.delete_own_account() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_own_account() TO authenticated;

-- ------------------------------------------------------------
-- 11. Re-state grants (they survive a rename; explicit for clarity)
-- ------------------------------------------------------------
GRANT SELECT, INSERT, UPDATE, DELETE ON usj_partners TO authenticated;
GRANT SELECT ON usj_partners TO anon;

COMMIT;

-- ------------------------------------------------------------
-- Verification
-- ------------------------------------------------------------
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name IN ('vendors', 'usj_partners');

SELECT table_name, column_name FROM information_schema.columns
WHERE table_schema = 'public' AND column_name IN ('vendor_id', 'partner_id')
ORDER BY table_name;

SELECT role, COUNT(*) FROM profiles GROUP BY role ORDER BY role;

SELECT tablename, policyname FROM pg_policies
WHERE policyname LIKE '%vendor%' OR policyname LIKE '%partner%'
ORDER BY tablename, policyname;
