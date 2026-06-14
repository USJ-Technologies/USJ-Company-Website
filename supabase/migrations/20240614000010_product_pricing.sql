-- ============================================================
-- USJ Technologies — Migration 010: Product Pricing
-- Adds unit_price column to products table.
-- Null = "Price on Request" (B2B quote model).
-- Run in Supabase SQL Editor.
-- ============================================================

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS unit_price NUMERIC(12,2) DEFAULT NULL;

-- Verify
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'products' AND column_name = 'unit_price';
