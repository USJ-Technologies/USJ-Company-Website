-- ============================================================
-- USJ Technologies — Migration: Create Product Reviews
-- Creates: product_reviews table
-- ============================================================

CREATE TABLE product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  product_slug TEXT NOT NULL,
  reviewer_name TEXT NOT NULL,
  reviewer_email TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_title TEXT,
  review_body TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT false,
  is_verified_purchase BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_product_reviews_slug ON product_reviews(product_slug);
CREATE INDEX idx_product_reviews_approved ON product_reviews(is_approved);

-- Enable RLS
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a review
CREATE POLICY "public_insert_reviews"
  ON product_reviews FOR INSERT
  WITH CHECK (true);

-- Public can only see approved reviews
CREATE POLICY "public_read_approved_reviews"
  ON product_reviews FOR SELECT
  USING (is_approved = true);

-- Managers/Admins can read all reviews (including pending)
CREATE POLICY "manager_read_all_reviews"
  ON product_reviews FOR SELECT
  USING (is_manager_or_above());

-- Managers/Admins can update reviews (for approval/moderation)
CREATE POLICY "manager_update_reviews"
  ON product_reviews FOR UPDATE
  USING (is_manager_or_above());

-- Managers/Admins can delete reviews (for moderation)
CREATE POLICY "manager_delete_reviews"
  ON product_reviews FOR DELETE
  USING (is_manager_or_above());

-- Verification select
SELECT * FROM product_reviews LIMIT 0;
