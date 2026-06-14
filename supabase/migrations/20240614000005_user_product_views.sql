-- ============================================================
-- USJ Technologies — Migration 005: User Product View Tracking
-- Enables activity-based product recommendations
-- ============================================================

CREATE TABLE user_product_views (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id    UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  brand_name    TEXT,
  category_name TEXT,
  viewed_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Fast lookups per user sorted by recency
CREATE INDEX idx_views_user_time    ON user_product_views(user_id, viewed_at DESC);
CREATE INDEX idx_views_product      ON user_product_views(product_id);

ALTER TABLE user_product_views ENABLE ROW LEVEL SECURITY;

-- Users can only insert/read their own views
CREATE POLICY "views_user_insert" ON user_product_views
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "views_user_select" ON user_product_views
  FOR SELECT USING (auth.uid() = user_id);

-- Admins can see everything (for analytics)
CREATE POLICY "views_admin_all" ON user_product_views
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

-- Auto-cleanup: keep only last 200 views per user to prevent table bloat
CREATE OR REPLACE FUNCTION prune_old_views()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  DELETE FROM user_product_views
  WHERE user_id = NEW.user_id
    AND id NOT IN (
      SELECT id FROM user_product_views
      WHERE user_id = NEW.user_id
      ORDER BY viewed_at DESC
      LIMIT 200
    );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_prune_views
  AFTER INSERT ON user_product_views
  FOR EACH ROW EXECUTE FUNCTION prune_old_views();
