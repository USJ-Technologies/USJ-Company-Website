-- ============================================================
-- USJ Technologies — Migration 016: Security Hardening
-- Pre-production audit fixes. Run in Supabase SQL Editor.
--
-- Fixes:
--   1. CRITICAL: profiles.role self-escalation — any authenticated
--      user could UPDATE their own role to 'admin' because
--      "users_update_own_profile" (migration 002) had no WITH CHECK,
--      so it implicitly allowed changing every column including role.
--   2. HIGH: any authenticated user (not just admin/manager) could
--      upload/overwrite/delete files in the product-images bucket.
--   3. HIGH: the resumes bucket was publicly readable/listable —
--      anyone with the anon key could list and download every job
--      applicant's resume (PII exposure).
--   4. MEDIUM (hardening): is_admin() lacked an explicit search_path,
--      unlike its sibling functions added in migration 012.
--   5. LOW (hygiene): invited_roles entries are never consumed, so a
--      stale pre-assigned admin/manager invite for an email stays
--      valid forever even after the intended hire never joins.
-- ============================================================

-- 1. Prevent privilege escalation via self profile update -----
--    RLS policies can't reliably protect a single column (a
--    self-referencing subquery in WITH CHECK has well-known
--    timing pitfalls against the row mid-UPDATE), so this is
--    enforced with a trigger instead: non-admins attempting to
--    change their own `role` get a hard error, regardless of
--    which UPDATE policy let the statement through.
CREATE OR REPLACE FUNCTION public.prevent_role_self_escalation()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role AND NOT is_admin() THEN
    RAISE EXCEPTION 'Only admins can change a profile''s role';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_role_self_escalation ON profiles;
CREATE TRIGGER trg_prevent_role_self_escalation
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_role_self_escalation();

-- 2. Restrict product-images storage writes to managers/admins ---
DROP POLICY IF EXISTS "auth_upload_product_images_storage" ON storage.objects;
DROP POLICY IF EXISTS "auth_update_product_images_storage" ON storage.objects;
DROP POLICY IF EXISTS "auth_delete_product_images_storage" ON storage.objects;

CREATE POLICY "manager_upload_product_images_storage"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'product-images' AND is_manager_or_above());

CREATE POLICY "manager_update_product_images_storage"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'product-images' AND is_manager_or_above());

CREATE POLICY "manager_delete_product_images_storage"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'product-images' AND is_manager_or_above());

-- 3. Lock down resumes bucket reads to managers/admins only -------
--    (applicants never need to read their own upload back — the
--    frontend only constructs the public URL string and stores it;
--    it doesn't fetch the file through the Storage API.)
DROP POLICY IF EXISTS "public_read_resumes" ON storage.objects;
CREATE POLICY "team_read_resumes" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'resumes' AND is_manager_or_above());

-- 4. Harden is_admin() against search_path hijacking -------------
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;

-- 5. Consume invited_roles entries once applied -------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  assigned_role TEXT;
BEGIN
  SELECT role INTO assigned_role
  FROM invited_roles
  WHERE email = LOWER(NEW.email);

  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(assigned_role, 'customer')
  )
  ON CONFLICT (id) DO NOTHING;

  IF assigned_role IS NOT NULL THEN
    DELETE FROM invited_roles WHERE email = LOWER(NEW.email);
  END IF;

  RETURN NEW;
END;
$$;

-- Verify
SELECT policyname, cmd, roles FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects'
  AND policyname IN (
    'manager_upload_product_images_storage',
    'manager_update_product_images_storage',
    'manager_delete_product_images_storage',
    'team_read_resumes'
  );

SELECT tgname, tgenabled FROM pg_trigger WHERE tgname = 'trg_prevent_role_self_escalation';
