-- ============================================================
-- USJ Technologies — Migration 012: Role-Based Access Control
-- Adds granular team roles (manager, staff) and the invited_roles
-- table so admins can pre-assign roles before team members register.
-- Run in Supabase SQL Editor.
-- ============================================================

-- 1. Extend profiles.role to include 'manager' and 'staff'
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('customer', 'admin', 'manager', 'staff'));

-- 2. Table for pre-assigning roles to emails before they register
CREATE TABLE IF NOT EXISTS invited_roles (
  email      TEXT PRIMARY KEY,
  role       TEXT NOT NULL DEFAULT 'staff'
               CONSTRAINT invited_roles_role_check
               CHECK (role IN ('admin', 'manager', 'staff')),
  notes      TEXT,
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE invited_roles ENABLE ROW LEVEL SECURITY;

-- Only admins can manage role invitations
CREATE POLICY "admin_manage_invited_roles" ON invited_roles
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- 3. Update the new-user trigger to auto-apply pre-assigned roles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  assigned_role TEXT;
BEGIN
  -- Check if admin pre-assigned a role for this email
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

  RETURN NEW;
END;
$$;

-- 4. Helper role-check functions (used in RLS policies below)
CREATE OR REPLACE FUNCTION public.is_manager_or_above()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role IN ('admin', 'manager')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_staff_or_above()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role IN ('admin', 'manager', 'staff')
  );
$$;

-- 5. Allow admin to update any profile (needed for role management UI)
CREATE POLICY "admin_update_all_profiles" ON profiles
  FOR UPDATE TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- 6. Extend quote_requests access to staff/manager
--    (existing admin_all_quotes and user_read_own_quotes policies stay; we add)
DROP POLICY IF EXISTS "team_read_all_quotes" ON quote_requests;
CREATE POLICY "team_read_all_quotes" ON quote_requests
  FOR SELECT TO authenticated
  USING (is_staff_or_above());

DROP POLICY IF EXISTS "team_update_quote_status" ON quote_requests;
CREATE POLICY "team_update_quote_status" ON quote_requests
  FOR UPDATE TO authenticated
  USING (is_staff_or_above())
  WITH CHECK (is_staff_or_above());

-- 7. Extend quote_items read access to staff/manager
DROP POLICY IF EXISTS "team_read_all_quote_items" ON quote_items;
CREATE POLICY "team_read_all_quote_items" ON quote_items
  FOR SELECT TO authenticated
  USING (is_staff_or_above());

-- 8. Allow managers to manage products & catalog
DROP POLICY IF EXISTS "manager_all_products" ON products;
CREATE POLICY "manager_all_products" ON products
  FOR ALL TO authenticated
  USING (is_manager_or_above())
  WITH CHECK (is_manager_or_above());

DROP POLICY IF EXISTS "manager_all_product_images" ON product_images;
CREATE POLICY "manager_all_product_images" ON product_images
  FOR ALL TO authenticated
  USING (is_manager_or_above())
  WITH CHECK (is_manager_or_above());

DROP POLICY IF EXISTS "manager_all_brands" ON brands;
CREATE POLICY "manager_all_brands" ON brands
  FOR ALL TO authenticated
  USING (is_manager_or_above())
  WITH CHECK (is_manager_or_above());

DROP POLICY IF EXISTS "manager_all_categories" ON categories;
CREATE POLICY "manager_all_categories" ON categories
  FOR ALL TO authenticated
  USING (is_manager_or_above())
  WITH CHECK (is_manager_or_above());

DROP POLICY IF EXISTS "manager_all_certs" ON certifications;
CREATE POLICY "manager_all_certs" ON certifications
  FOR ALL TO authenticated
  USING (is_manager_or_above())
  WITH CHECK (is_manager_or_above());

-- Verify
SELECT name, email, role FROM profiles WHERE role != 'customer' ORDER BY role, created_at;
SELECT * FROM invited_roles ORDER BY created_at;
