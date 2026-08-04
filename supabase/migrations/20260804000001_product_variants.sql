-- ============================================================
-- USJ Technologies — Migration: Product Variants (size/capacity)
-- Groups products that are the same model in different sizes
-- (e.g. HP v236w 16GB / 32GB / 64GB / 128GB pen drives) so the
-- product page can show a "Available Sizes" selector.
--
-- variant_group : shared key across all sizes of one model
--                 (e.g. 'hp-v236w'). NULL = standalone product.
-- variant_label : short label shown on the selector button
--                 (e.g. '16GB', '32GB'). Sorted for display.
--
-- Re-runnable: uses IF NOT EXISTS guards. Run in Supabase SQL Editor.
-- ============================================================

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS variant_group TEXT DEFAULT NULL;

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS variant_label TEXT DEFAULT NULL;

-- Index so fetching all siblings in a group is fast.
-- Partial index: only rows that actually belong to a group.
CREATE INDEX IF NOT EXISTS idx_products_variant_group
  ON products (variant_group)
  WHERE variant_group IS NOT NULL;

-- Verify
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'products'
  AND column_name IN ('variant_group', 'variant_label')
ORDER BY column_name;
