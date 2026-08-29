-- ============================================================
-- USJ Technologies — Migration: Add Vendor Support to Profiles & Products
--
-- Changes:
-- - Extend profiles.role to include 'vendor'
-- - Add vendor_id to profiles (links user to the vendor they manage)
-- - Add vendor_id to products (nullable; NULL = platform-owned / USJ)
--
-- Run in Supabase SQL Editor.
-- ============================================================

-- 1. Extend profiles.role CHECK constraint to include 'vendor'
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('customer', 'admin', 'manager', 'staff', 'vendor'));

-- 2. Add vendor_id to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL;

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_profiles_vendor_id ON profiles(vendor_id);

-- 3. Add vendor_id to products (nullable — NULL means platform-owned)
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL;

-- Create index for fast vendor product lookups
CREATE INDEX IF NOT EXISTS idx_products_vendor_id ON products(vendor_id);

-- 4. Helper function: check if current user is a vendor
CREATE OR REPLACE FUNCTION public.is_vendor()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'vendor'
  );
$$;

-- 5. Helper function: check if current user's vendor is approved
CREATE OR REPLACE FUNCTION public.is_approved_vendor()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles p
    JOIN vendors v ON p.vendor_id = v.id
    WHERE p.id = auth.uid() 
      AND p.role = 'vendor' 
      AND v.status = 'approved'
  );
$$;

-- 6. Helper function: get current user's vendor_id
CREATE OR REPLACE FUNCTION public.get_vendor_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER SET search_path = public
AS $$
  SELECT vendor_id FROM profiles
  WHERE id = auth.uid() AND role = 'vendor'
  LIMIT 1;
$$;

-- Verification
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'profiles' AND column_name = 'vendor_id';

SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'products' AND column_name = 'vendor_id';
