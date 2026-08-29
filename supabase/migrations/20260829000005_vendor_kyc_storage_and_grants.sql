-- ============================================================
-- USJ Technologies — Migration: Vendor KYC Storage & Table Grants
--
-- Sets up:
-- - Grants for new tables (vendors, orders, order_items)
-- - Storage bucket for vendor KYC documents
-- - Storage policies for KYC uploads
--
-- Run in Supabase SQL Editor.
-- ============================================================

-- 1. Grant authenticated users access to tables
-- (New tables need explicit grants; RLS policies handle row-level access)
GRANT SELECT, INSERT, UPDATE, DELETE ON vendors TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON orders TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON order_items TO authenticated;

-- 2. Grant anon (public) read-only access to vendors (for storefront display)
GRANT SELECT ON vendors TO anon;

-- 3. Create vendor-kyc storage bucket (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('vendor-kyc', 'vendor-kyc', true) 
ON CONFLICT (id) DO NOTHING;
-- 4. Storage policy: allow authenticated users to upload their own KYC docs
-- INSERT policy for vendor-kyc bucket
DROP POLICY IF EXISTS "vendor_upload_kyc" ON storage.objects;
CREATE POLICY "vendor_upload_kyc" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'vendor-kyc' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- 5. Storage policy: allow only admins and the uploader to read KYC docs
-- SELECT policy for vendor-kyc bucket
DROP POLICY IF EXISTS "vendor_read_kyc" ON storage.objects;
CREATE POLICY "vendor_read_kyc" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'vendor-kyc'
    AND (
      auth.uid()::text = (storage.foldername(name))[1]  -- Uploader can read their own
      OR is_admin()  -- Admin can read all
    )
  );

-- 6. Storage policy: only admins can delete KYC docs
-- DELETE policy for vendor-kyc bucket
DROP POLICY IF EXISTS "admin_delete_kyc" ON storage.objects;
CREATE POLICY "admin_delete_kyc" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'vendor-kyc'
    AND is_admin()
  );

-- Verification
SELECT grantee, privilege_type
FROM information_schema.tables t
JOIN information_schema.role_table_grants r ON t.table_name = r.table_name
WHERE t.table_name IN ('vendors', 'orders', 'order_items')
ORDER BY t.table_name, grantee;
