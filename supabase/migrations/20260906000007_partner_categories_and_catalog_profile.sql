-- ============================================================
-- USJ Technologies — Migration: partner catalog profile
--
-- Adds "what a partner sells" to the application, and enforces it.
--
-- WHY A SEPARATE TAXONOMY
--   public.categories is brand-scoped (categories.brand_id) and only
--   populated for 3 of 11 brands — ENTER (29), ZOOOK (28), TENDA (16).
--   It is a description of those brands' product lines, not a
--   marketplace taxonomy: it carries duplicates across brands
--   ("Keyboard" vs "Keyboards", "BT Speakers" vs "Bluetooth Speakers")
--   and lifecycle entries like "EOL". Making a partner register against
--   it would imply a brand affiliation they do not have.
--
--   So partners register against a new, curated, brand-neutral
--   partner_categories list. The 726-product first-party catalog and
--   its categories table are left completely untouched.
--
-- WHAT THIS ENABLES
--   1. Review    — admin sees business type, segments, brands, capacity
--   2. Gating    — a partner may only list products in segments they
--                  registered for (RLS, enforced server-side)
--   3. Storefront— public "Deals in: …" chips
--
-- SAFE TO APPLY: zero partner-owned products exist today
--   (SELECT count(*) FROM products WHERE partner_id IS NOT NULL = 0),
--   so the new gating policy has nothing to invalidate.
--
-- Run in Supabase SQL Editor. Idempotent — safe to re-run.
-- ============================================================

BEGIN;

-- ------------------------------------------------------------
-- 1. The taxonomy partners register against
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.partner_categories (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT        NOT NULL UNIQUE,
  slug          TEXT        NOT NULL UNIQUE,
  description   TEXT,
  display_order INT         NOT NULL DEFAULT 0,
  is_active     BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seeded by slug so re-running never duplicates, and so an admin's
-- later rename of `name` is not reverted by a re-run.
INSERT INTO public.partner_categories (name, slug, display_order) VALUES
  ('Networking',              'networking',              10),
  ('Surveillance & Security', 'surveillance-security',   20),
  ('Audio',                   'audio',                   30),
  ('Computer Peripherals',    'computer-peripherals',    40),
  ('Displays & Monitors',     'displays-monitors',       50),
  ('Computing Hardware',      'computing-hardware',      60),
  ('Storage & NAS',           'storage-nas',             70),
  ('Power & UPS',             'power-ups',               80),
  ('Smart Home & IoT',        'smart-home-iot',          90),
  ('Printing & Consumables',  'printing-consumables',   100),
  ('Cables & Connectors',     'cables-connectors',      110),
  ('Wearables',               'wearables',              120)
ON CONFLICT (slug) DO NOTHING;

-- ------------------------------------------------------------
-- 2. Which segments each partner registered for
--
--    ON DELETE RESTRICT on the category: a segment that partners have
--    registered against must be deactivated (is_active = false), not
--    deleted, so historical applications stay readable.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.usj_partner_categories (
  partner_id  UUID NOT NULL REFERENCES public.usj_partners(id)      ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.partner_categories(id) ON DELETE RESTRICT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (partner_id, category_id)
);

CREATE INDEX IF NOT EXISTS idx_usj_partner_categories_category
  ON public.usj_partner_categories(category_id);

-- ------------------------------------------------------------
-- 3. The rest of the catalog profile, on the partner row
--
--    All nullable / defaulted: the 4 existing applications predate
--    these fields and must stay readable and reviewable.
-- ------------------------------------------------------------
ALTER TABLE public.usj_partners
  ADD COLUMN IF NOT EXISTS business_type          TEXT,
  ADD COLUMN IF NOT EXISTS brands_carried         TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS sku_count              INT,
  ADD COLUMN IF NOT EXISTS monthly_capacity       INT,
  ADD COLUMN IF NOT EXISTS authorization_doc_urls TEXT[] NOT NULL DEFAULT '{}';

ALTER TABLE public.usj_partners
  DROP CONSTRAINT IF EXISTS usj_partners_business_type_check;
ALTER TABLE public.usj_partners
  ADD CONSTRAINT usj_partners_business_type_check
  CHECK (business_type IS NULL OR business_type IN (
    'manufacturer', 'distributor', 'reseller', 'importer', 'system_integrator'
  ));

-- Guard against negatives from a hand-edited API call; the UI already
-- constrains these, RLS does not.
ALTER TABLE public.usj_partners
  DROP CONSTRAINT IF EXISTS usj_partners_sku_count_check;
ALTER TABLE public.usj_partners
  ADD CONSTRAINT usj_partners_sku_count_check
  CHECK (sku_count IS NULL OR sku_count >= 0);

ALTER TABLE public.usj_partners
  DROP CONSTRAINT IF EXISTS usj_partners_monthly_capacity_check;
ALTER TABLE public.usj_partners
  ADD CONSTRAINT usj_partners_monthly_capacity_check
  CHECK (monthly_capacity IS NULL OR monthly_capacity >= 0);

-- ------------------------------------------------------------
-- 4. Products carry the segment they are listed under
--
--    Nullable, and deliberately separate from products.category_id:
--    first-party products keep using the brand-scoped categories,
--    partner products use this. NULL means "first-party" — the RLS in
--    step 6 requires a non-NULL value for partner writes.
-- ------------------------------------------------------------
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS partner_category_id UUID
    REFERENCES public.partner_categories(id) ON DELETE RESTRICT;

CREATE INDEX IF NOT EXISTS idx_products_partner_category
  ON public.products(partner_category_id);

-- ------------------------------------------------------------
-- 5. RLS
-- ------------------------------------------------------------
ALTER TABLE public.partner_categories     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usj_partner_categories ENABLE ROW LEVEL SECURITY;

-- The taxonomy is public reference data: the signup form has to render
-- it for signed-out applicants, so this is readable by anon.
DROP POLICY IF EXISTS "public_read_partner_categories" ON public.partner_categories;
CREATE POLICY "public_read_partner_categories" ON public.partner_categories
  FOR SELECT USING (is_active);

DROP POLICY IF EXISTS "team_all_partner_categories" ON public.partner_categories;
CREATE POLICY "team_all_partner_categories" ON public.partner_categories
  FOR ALL TO authenticated
  USING (is_manager_or_above())
  WITH CHECK (is_manager_or_above());

-- Public sees the segments of APPROVED partners only — this is what
-- drives the storefront chips. A pending applicant's segments stay
-- private until they are approved.
DROP POLICY IF EXISTS "public_read_approved_partner_categories" ON public.usj_partner_categories;
CREATE POLICY "public_read_approved_partner_categories" ON public.usj_partner_categories
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.usj_partners up
      WHERE up.id = usj_partner_categories.partner_id
        AND up.status = 'approved'
    )
  );

-- An applicant writes their own rows during signup, and can still read
-- them back while the application is pending. Scoped by created_by,
-- which mirrors users_insert_usj_partners on the parent table.
DROP POLICY IF EXISTS "users_manage_own_partner_categories" ON public.usj_partner_categories;
CREATE POLICY "users_manage_own_partner_categories" ON public.usj_partner_categories
  FOR ALL TO authenticated
  USING (
    partner_id IN (SELECT id FROM public.usj_partners WHERE created_by = auth.uid())
  )
  WITH CHECK (
    partner_id IN (SELECT id FROM public.usj_partners WHERE created_by = auth.uid())
  );

DROP POLICY IF EXISTS "team_all_usj_partner_categories" ON public.usj_partner_categories;
CREATE POLICY "team_all_usj_partner_categories" ON public.usj_partner_categories
  FOR ALL TO authenticated
  USING (is_manager_or_above())
  WITH CHECK (is_manager_or_above());

GRANT SELECT                         ON public.partner_categories     TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE         ON public.partner_categories     TO authenticated;
GRANT SELECT                         ON public.usj_partner_categories TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE         ON public.usj_partner_categories TO authenticated;

-- ------------------------------------------------------------
-- 6. Gating: a partner may only list in segments they registered for
--
--    SECURITY DEFINER because the check reads usj_partner_categories
--    rows the *caller* may not be able to see under its own RLS during
--    an INSERT on products.
--
--    Returns FALSE for NULL, so a partner cannot list an uncategorised
--    product. First-party rows are written by team policies, which do
--    not call this.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.partner_may_list_in(p_category_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER SET search_path = public
AS $$
  SELECT p_category_id IS NOT NULL
     AND EXISTS (
       SELECT 1
       FROM usj_partner_categories upc
       WHERE upc.partner_id  = get_partner_id()
         AND upc.category_id = p_category_id
     );
$$;

REVOKE ALL     ON FUNCTION public.partner_may_list_in(UUID) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.partner_may_list_in(UUID) TO authenticated;

-- Recreated from 20260903000001 with the segment check added. The USING
-- clause is intentionally NOT gated: a partner must still be able to
-- read and edit a product whose segment was later deactivated or
-- removed from their registration — otherwise the row becomes
-- invisible and unfixable. Only the WITH CHECK (what they write)
-- enforces the segment.
DROP POLICY IF EXISTS "partner_insert_own_products" ON public.products;
CREATE POLICY "partner_insert_own_products" ON public.products
  FOR INSERT TO authenticated
  WITH CHECK (
    is_usj_partner()
    AND partner_id = get_partner_id()
    AND partner_may_list_in(partner_category_id)
  );

DROP POLICY IF EXISTS "partner_update_own_products" ON public.products;
CREATE POLICY "partner_update_own_products" ON public.products
  FOR UPDATE TO authenticated
  USING (is_usj_partner() AND partner_id = get_partner_id())
  WITH CHECK (
    is_usj_partner()
    AND partner_id = get_partner_id()
    AND partner_may_list_in(partner_category_id)
  );

COMMIT;

-- ============================================================
-- Verification
-- ============================================================

-- (a) 12 seeded segments.
SELECT count(*) AS segments FROM public.partner_categories WHERE is_active;

-- (b) New columns present on usj_partners.
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'usj_partners'
  AND column_name IN ('business_type','brands_carried','sku_count',
                      'monthly_capacity','authorization_doc_urls')
ORDER BY column_name;

-- (c) Both product policies must mention partner_may_list_in.
SELECT policyname, cmd, with_check
FROM pg_policies
WHERE tablename = 'products' AND policyname LIKE 'partner_%'
ORDER BY policyname;

-- (d) Existing applications survive untouched (business_type NULL is
--     expected for the 4 that predate this migration).
SELECT business_name, status, business_type, brands_carried,
       sku_count, monthly_capacity
FROM public.usj_partners
ORDER BY created_at;
