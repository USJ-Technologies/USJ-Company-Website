-- ============================================================
-- USJ Technologies — Migration: Add Photos to Product Reviews
-- ============================================================

-- 1. Add images column
ALTER TABLE product_reviews ADD COLUMN images TEXT[] DEFAULT '{}';

-- 2. Create storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('review-images', 'review-images', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Setup storage policies
DROP POLICY IF EXISTS "public_read_review_images" ON storage.objects;
DROP POLICY IF EXISTS "public_upload_review_images" ON storage.objects;
DROP POLICY IF EXISTS "manager_delete_review_images" ON storage.objects;

-- Public can view images
CREATE POLICY "public_read_review_images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'review-images');

-- Public can upload images (anyone can submit a review with images)
CREATE POLICY "public_upload_review_images"
ON storage.objects FOR INSERT TO public
WITH CHECK (bucket_id = 'review-images');

-- Managers can delete images
CREATE POLICY "manager_delete_review_images"
ON storage.objects FOR DELETE TO public
USING (bucket_id = 'review-images' AND is_manager_or_above());
