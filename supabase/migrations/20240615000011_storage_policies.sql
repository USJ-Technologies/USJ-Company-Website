-- ============================================================
-- USJ Technologies — Migration 011: Storage Bucket Policies
-- Sets up RLS for the product-images Storage bucket so that:
--   • Anyone can read (public product images & cert images)
--   • Only authenticated users (admin) can upload / update / delete
-- Idempotent: uses DROP IF EXISTS before each CREATE POLICY.
-- ============================================================

DROP POLICY IF EXISTS "public_read_product_images_storage"   ON storage.objects;
DROP POLICY IF EXISTS "auth_upload_product_images_storage"   ON storage.objects;
DROP POLICY IF EXISTS "auth_update_product_images_storage"   ON storage.objects;
DROP POLICY IF EXISTS "auth_delete_product_images_storage"   ON storage.objects;

-- Public read access to everything in the product-images bucket
CREATE POLICY "public_read_product_images_storage"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'product-images');

-- Authenticated users can upload new files
CREATE POLICY "auth_upload_product_images_storage"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'product-images');

-- Authenticated users can update (overwrite) existing files
CREATE POLICY "auth_update_product_images_storage"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'product-images');

-- Authenticated users can delete files
CREATE POLICY "auth_delete_product_images_storage"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'product-images');

-- Verify
SELECT policyname, cmd, roles
FROM pg_policies
WHERE tablename = 'objects' AND schemaname = 'storage'
ORDER BY policyname;
