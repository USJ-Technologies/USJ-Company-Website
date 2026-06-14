-- ============================================================
-- USJ Technologies — Row Level Security Policies
-- Migration 002: RLS Policies
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE brands         ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories     ENABLE ROW LEVEL SECURITY;
ALTER TABLE products       ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items     ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_items    ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventures       ENABLE ROW LEVEL SECURITY;
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects       ENABLE ROW LEVEL SECURITY;

-- ── Helper: check if current user is admin ───────────────────
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;

-- ── Public catalog (read-only, no auth required) ─────────────
CREATE POLICY "public_read_brands"      ON brands         FOR SELECT USING (true);
CREATE POLICY "public_read_categories"  ON categories     FOR SELECT USING (is_active = true);
CREATE POLICY "public_read_products"    ON products       FOR SELECT USING (is_active = true);
CREATE POLICY "public_read_images"      ON product_images FOR SELECT USING (true);
CREATE POLICY "public_read_ventures"    ON ventures       FOR SELECT USING (is_active = true);
CREATE POLICY "public_read_certs"       ON certifications FOR SELECT USING (is_visible = true);
CREATE POLICY "public_read_projects"    ON projects       FOR SELECT USING (is_active = true);

-- ── Profiles ─────────────────────────────────────────────────
CREATE POLICY "users_read_own_profile"   ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_update_own_profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "admin_read_all_profiles"  ON profiles FOR SELECT USING (is_admin());

-- ── Cart (user owns their cart rows; guests use session_id) ──
-- Signed-in users see only their rows
CREATE POLICY "user_cart_select" ON cart_items FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "user_cart_insert" ON cart_items FOR INSERT
  WITH CHECK (user_id = auth.uid() OR (user_id IS NULL AND session_id IS NOT NULL));

CREATE POLICY "user_cart_update" ON cart_items FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "user_cart_delete" ON cart_items FOR DELETE
  USING (user_id = auth.uid());

-- Guest carts use session_id (no auth) — handled via anon key on frontend
-- Frontend manages guest carts fully in localStorage; only sync on login

-- ── Quote Requests ───────────────────────────────────────────
-- Anyone (even anon) can submit a quote
CREATE POLICY "anyone_submit_quote" ON quote_requests FOR INSERT WITH CHECK (true);

-- Signed-in users see only their own quotes
CREATE POLICY "user_read_own_quotes" ON quote_requests FOR SELECT
  USING (user_id = auth.uid());

-- Quote items: same visibility as parent quote
CREATE POLICY "anyone_insert_quote_items" ON quote_items FOR INSERT WITH CHECK (true);

CREATE POLICY "user_read_own_quote_items" ON quote_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM quote_requests qr
      WHERE qr.id = quote_items.quote_id AND qr.user_id = auth.uid()
    )
  );

-- ── Admin: full access to everything ─────────────────────────
CREATE POLICY "admin_all_brands"      ON brands         FOR ALL USING (is_admin());
CREATE POLICY "admin_all_categories"  ON categories     FOR ALL USING (is_admin());
CREATE POLICY "admin_all_products"    ON products       FOR ALL USING (is_admin());
CREATE POLICY "admin_all_images"      ON product_images FOR ALL USING (is_admin());
CREATE POLICY "admin_all_ventures"    ON ventures       FOR ALL USING (is_admin());
CREATE POLICY "admin_all_certs"       ON certifications FOR ALL USING (is_admin());
CREATE POLICY "admin_all_projects"    ON projects       FOR ALL USING (is_admin());
CREATE POLICY "admin_all_quotes"      ON quote_requests FOR ALL USING (is_admin());
CREATE POLICY "admin_all_quote_items" ON quote_items    FOR ALL USING (is_admin());
CREATE POLICY "admin_all_cart"        ON cart_items     FOR ALL USING (is_admin());
