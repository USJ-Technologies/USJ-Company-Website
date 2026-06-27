-- ============================================================
-- USJ Technologies — Migration 015: Product MRP
-- Adds mrp (Maximum Retail Price) column to products table.
-- unit_price remains "our price"; mrp is shown struck-through
-- alongside it on the storefront when set and higher than unit_price.
-- Run in Supabase SQL Editor.
-- ============================================================

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS mrp NUMERIC(12,2) DEFAULT NULL;

-- Verify
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'products' AND column_name = 'mrp';
