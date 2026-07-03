-- ============================================================
-- USJ Technologies — Migration 017: Product FAQs
-- Adds a JSONB faqs field to the products table for product-specific FAQ entries.
-- Expected format: ARRAY OF OBJECTS WITH question AND answer STRINGS
-- Example:
-- [
--   {"question": "Is this product available on the GeM portal?", "answer": "Yes, it is available for government procurement."},
--   {"question": "Do you offer installation support?", "answer": "Yes, our team can assist with installation and configuration."}
-- ]
-- Run in Supabase SQL Editor.
-- ============================================================

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS faqs JSONB DEFAULT '[]';

-- Verify
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'products' AND column_name = 'faqs';
