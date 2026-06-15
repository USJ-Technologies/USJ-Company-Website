-- ============================================================
-- USJ Technologies — Migration 011: Storage Bucket Policies
-- Sets up RLS for the product-images Storage bucket so that:
--   • Anyone can read (public product images & cert images)
--   • Only authenticated users (admin) can upload / update / delete
-- Run in Supabase SQL Editor.
-- ============================================================

-- Enable RLS on storage.objects if not already enabled
-- (Supabase enables this by default on new projects)

-- Public read access to everything in the product-images bucket
CREATE POLICY "public_read_product_images_storage"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'product-images');

-- Authenticated users (admins) can upload new files
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
