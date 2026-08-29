-- ============================================================
-- USJ Technologies — Migration: Vendor RLS Policies
--
-- Row-level security policies for:
-- - Vendors can only modify their own products
-- - Vendors can only view order_items for their own products
-- - Admin/manager retain full visibility
-- - Public can read approved vendor products
--
-- Run in Supabase SQL Editor.
-- ============================================================

-- 1. Update existing product RLS to include vendor access (not already there)
-- Drop existing public/admin policies to rebuild with vendor support
DROP POLICY IF EXISTS "public_read_products" ON products;

-- Public can read active products (from any vendor or platform)
CREATE POLICY "public_read_products" ON products
  FOR SELECT USING (is_active = true);

-- Admin/manager: full access (existing)
-- DROP POLICY IF EXISTS "admin_all_products" ON products;
-- (Note: admin_all_products already exists from migration 012, no change needed)

-- Vendors: can only SELECT their own products
DROP POLICY IF EXISTS "vendor_read_own_products" ON products;
CREATE POLICY "vendor_read_own_products" ON products
  FOR SELECT TO authenticated
  USING (
    is_vendor() AND vendor_id = get_vendor_id()
  );

-- Vendors: can only INSERT/UPDATE their own products
DROP POLICY IF EXISTS "vendor_insert_update_own_products" ON products;
CREATE POLICY "vendor_insert_update_own_products" ON products
  FOR INSERT TO authenticated
  WITH CHECK (
    is_vendor() AND vendor_id = get_vendor_id()
  );

DROP POLICY IF EXISTS "vendor_update_own_products" ON products;
CREATE POLICY "vendor_update_own_products" ON products
  FOR UPDATE TO authenticated
  USING (is_vendor() AND vendor_id = get_vendor_id())
  WITH CHECK (is_vendor() AND vendor_id = get_vendor_id());

-- Vendors: cannot delete their own products (only admin can)
-- This prevents accidental bulk deletion

-- 2. RLS policies for orders table
-- Users can read their own orders
DROP POLICY IF EXISTS "user_read_own_orders" ON orders;
CREATE POLICY "user_read_own_orders" ON orders
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Users can insert their own orders
DROP POLICY IF EXISTS "user_insert_own_orders" ON orders;
CREATE POLICY "user_insert_own_orders" ON orders
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Admin can read/update all orders
DROP POLICY IF EXISTS "admin_all_orders" ON orders;
CREATE POLICY "admin_all_orders" ON orders
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- 3. RLS policies for order_items table
-- Users can read order_items for their own orders
DROP POLICY IF EXISTS "user_read_own_order_items" ON order_items;
CREATE POLICY "user_read_own_order_items" ON order_items
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_items.order_id AND o.user_id = auth.uid()
    )
  );

-- Vendors can read order_items for their own products
DROP POLICY IF EXISTS "vendor_read_own_order_items" ON order_items;
CREATE POLICY "vendor_read_own_order_items" ON order_items
  FOR SELECT TO authenticated
  USING (
    is_vendor() AND vendor_id = get_vendor_id()
  );

-- Users can insert order_items for their own orders
DROP POLICY IF EXISTS "user_insert_own_order_items" ON order_items;
CREATE POLICY "user_insert_own_order_items" ON order_items
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_items.order_id AND o.user_id = auth.uid()
    )
  );

-- Admin can read/update all order_items
DROP POLICY IF EXISTS "admin_all_order_items" ON order_items;
CREATE POLICY "admin_all_order_items" ON order_items
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Verification
SELECT tablename, policyname FROM pg_policies
WHERE tablename IN ('products', 'orders', 'order_items')
ORDER BY tablename, policyname;
