-- ============================================================
-- USJ Technologies — Migration: Failed Searches + Cart Leads
-- Creates: failed_searches, cart_leads, guest_cart_items
-- ============================================================

-- ── Failed Searches ─────────────────────────────────────────
CREATE TABLE failed_searches (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  search_term  TEXT NOT NULL,
  results_count INT DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_failed_searches_term ON failed_searches(search_term);
CREATE INDEX idx_failed_searches_created ON failed_searches(created_at);

ALTER TABLE failed_searches ENABLE ROW LEVEL SECURITY;

-- Anyone (including anon) can insert a failed search
CREATE POLICY "anon_insert_failed_searches"
  ON failed_searches FOR INSERT
  WITH CHECK (true);

-- Managers and admins can read failed searches
CREATE POLICY "manager_or_admin_read_failed_searches"
  ON failed_searches FOR SELECT
  USING (is_manager_or_above());

-- ── Cart Leads ──────────────────────────────────────────────
CREATE TABLE cart_leads (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  phone      TEXT NOT NULL,
  user_id    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cart_leads_phone ON cart_leads(phone);
CREATE INDEX idx_cart_leads_user ON cart_leads(user_id);
CREATE INDEX idx_cart_leads_created ON cart_leads(created_at);

ALTER TABLE cart_leads ENABLE ROW LEVEL SECURITY;

-- Anyone (including anon) can insert a cart lead
CREATE POLICY "anon_insert_cart_leads"
  ON cart_leads FOR INSERT
  WITH CHECK (true);

-- Managers and admins can read cart leads
CREATE POLICY "manager_or_admin_read_cart_leads"
  ON cart_leads FOR SELECT
  USING (is_manager_or_above());

-- Managers and admins have full access for management
CREATE POLICY "manager_or_admin_all_cart_leads"
  ON cart_leads FOR ALL
  USING (is_manager_or_above());

-- ── Guest Cart Items ────────────────────────────────────────
CREATE TABLE guest_cart_items (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id      UUID NOT NULL REFERENCES cart_leads(id) ON DELETE CASCADE,
  product_id   UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  brand_name   TEXT,
  image_url    TEXT,
  quantity     INT DEFAULT 1,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_guest_cart_items_lead ON guest_cart_items(lead_id);

ALTER TABLE guest_cart_items ENABLE ROW LEVEL SECURITY;

-- Anyone (including anon) can insert guest cart items
CREATE POLICY "anon_insert_guest_cart_items"
  ON guest_cart_items FOR INSERT
  WITH CHECK (true);

-- Managers and admins can read guest cart items
CREATE POLICY "manager_or_admin_read_guest_cart_items"
  ON guest_cart_items FOR SELECT
  USING (is_manager_or_above());

-- Managers and admins have full access for management
CREATE POLICY "manager_or_admin_all_guest_cart_items"
  ON guest_cart_items FOR ALL
  USING (is_manager_or_above());