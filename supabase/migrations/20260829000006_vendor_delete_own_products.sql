-- ============================================================
-- USJ Technologies — Migration: Allow vendors to delete own products
--
-- Vendors could not delete products (no DELETE policy). The vendor
-- portal UI exposed delete, but RLS silently blocked it.
-- ============================================================

DROP POLICY IF EXISTS "vendor_delete_own_products" ON products;
CREATE POLICY "vendor_delete_own_products" ON products
  FOR DELETE TO authenticated
  USING (is_vendor() AND vendor_id = get_vendor_id());
