-- ============================================================
-- USJ Technologies — Migration 001: Blog Posts
-- Creates blog_posts table with RLS policies for public reads and admin writes.
-- ============================================================

CREATE TABLE IF NOT EXISTS blog_posts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  slug          TEXT UNIQUE NOT NULL,
  excerpt       TEXT,
  content       TEXT NOT NULL,
  cover_image   TEXT,
  category      TEXT,
  published     BOOLEAN DEFAULT false,
  published_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_published_blog_posts" ON blog_posts
  FOR SELECT USING (published = true);

CREATE POLICY "admin_manage_blog_posts" ON blog_posts
  FOR ALL USING (is_admin() OR auth.role() = 'service_role')
  WITH CHECK (is_admin() OR auth.role() = 'service_role');
