-- ============================================================
-- USJ Technologies — Migration: Product Price Matching
--
-- Lets a USJ Partner see what every other approved partner
-- currently charges for the same product while they are listing it.
--
-- Two columns, one derived and one explicit. The effective group of
-- "listings of the same physical product" is:
--
--     COALESCE(canonical_key, match_key)
--
-- an opaque string; NULL means ungrouped (no comparison possible).
--
-- match_key      GENERATED, normalized 'BRAND|MODEL' (uppercase, all
--                non-alphanumerics stripped) so 'Tenda' / 'AC-23' and
--                'TENDA' / 'AC23' collapse to the same 'TENDA|AC23'.
--                NULL when model is blank — otherwise every model-less
--                Tenda product would be grouped together. Generated, so
--                it needs no backfill, stays correct as rows change, and
--                cannot be written to by a partner.
--
-- canonical_key  Written only by the owning partner, via the
--                partner_update_own_products policy:
--                  · "yes, same product"      → the matched group's key.
--                    Pins the link so it survives later brand/model
--                    edits, and lets a partner join a group whose
--                    brand/model is spelled differently
--                    ('Tenda Networks' vs 'TENDA').
--                  · "no, different product"  → the row's own id. Nothing
--                    else can ever match that value, so the row becomes
--                    a group of one. This is why no separate dismissals
--                    table is needed.
--
-- Adding a STORED generated column rewrites the table; fine at this
-- catalogue size.
--
-- Re-runnable: uses IF NOT EXISTS guards. Run in Supabase SQL Editor.
-- ============================================================

-- 1. Derived match key ---------------------------------------------
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS match_key TEXT
  GENERATED ALWAYS AS (
    CASE
      WHEN regexp_replace(upper(COALESCE(model, '')), '[^A-Z0-9]', '', 'g') = '' THEN NULL
      ELSE regexp_replace(upper(COALESCE(brand_name, '')), '[^A-Z0-9]', '', 'g')
           || '|' ||
           regexp_replace(upper(model), '[^A-Z0-9]', '', 'g')
    END
  ) STORED;

-- 2. Explicit, partner-confirmed group key -------------------------
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS canonical_key TEXT;

-- 3. Indexes -------------------------------------------------------
-- Partial: only rows that actually participate in a group.
CREATE INDEX IF NOT EXISTS idx_products_match_key
  ON products (match_key)
  WHERE match_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_products_canonical_key
  ON products (canonical_key)
  WHERE canonical_key IS NOT NULL;

-- ------------------------------------------------------------
-- Verification
-- ------------------------------------------------------------
SELECT column_name, data_type, is_generated, generation_expression
FROM information_schema.columns
WHERE table_name = 'products'
  AND column_name IN ('match_key', 'canonical_key')
ORDER BY column_name;

-- Spot-check the grouping across partner listings
SELECT brand_name, model, match_key, canonical_key,
       COALESCE(canonical_key, match_key) AS group_key,
       COUNT(*) AS listings
FROM products
WHERE partner_id IS NOT NULL
GROUP BY brand_name, model, match_key, canonical_key
ORDER BY group_key NULLS LAST;
