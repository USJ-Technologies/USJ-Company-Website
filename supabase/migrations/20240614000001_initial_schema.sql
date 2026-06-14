-- ============================================================
-- USJ Technologies — Supabase PostgreSQL Schema
-- Migration 001: Initial Schema
-- ============================================================

-- ── Brands ───────────────────────────────────────────────────
CREATE TABLE brands (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name      TEXT NOT NULL UNIQUE,
  slug      TEXT NOT NULL UNIQUE,
  logo_url  TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Categories ───────────────────────────────────────────────
CREATE TABLE categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  brand_id    UUID REFERENCES brands(id) ON DELETE SET NULL,
  description TEXT,
  image_url   TEXT,
  display_order INT DEFAULT 0,
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Products ─────────────────────────────────────────────────
CREATE TABLE products (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT NOT NULL,
  slug              TEXT NOT NULL UNIQUE,
  sku               TEXT,
  model             TEXT,
  description       TEXT,
  brand_id          UUID REFERENCES brands(id) ON DELETE SET NULL,
  category_id       UUID REFERENCES categories(id) ON DELETE SET NULL,
  -- Denormalized for fast reads without joins
  brand_name        TEXT,
  category_name     TEXT,
  specifications    JSONB DEFAULT '{}',
  key_features      TEXT[] DEFAULT '{}',
  in_box            TEXT[] DEFAULT '{}',
  product_url       TEXT,
  primary_image_url TEXT,
  is_active         BOOLEAN DEFAULT true,
  is_featured       BOOLEAN DEFAULT false,
  is_b2b            BOOLEAN DEFAULT false,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Full-text search index on products
CREATE INDEX idx_products_search ON products
  USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '') || ' ' || COALESCE(brand_name, '') || ' ' || COALESCE(category_name, '')));

CREATE INDEX idx_products_brand    ON products(brand_id);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_slug     ON products(slug);
CREATE INDEX idx_products_active   ON products(is_active);
CREATE INDEX idx_products_featured ON products(is_featured);

-- ── Product Images ───────────────────────────────────────────
CREATE TABLE product_images (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id    UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url           TEXT NOT NULL,
  is_primary    BOOLEAN DEFAULT false,
  display_order INT DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_product_images_product ON product_images(product_id);

-- ── Profiles (extends Supabase auth.users) ───────────────────
CREATE TABLE profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name         TEXT,
  email        TEXT,
  phone        TEXT,
  organization TEXT,
  role         TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create a profile row on new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (id, name, email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'name',
    NEW.email
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ── Cart Items (guest + signed-in users) ─────────────────────
CREATE TABLE cart_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id  TEXT,              -- for anonymous / guest carts
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity    INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT cart_must_have_owner CHECK (user_id IS NOT NULL OR session_id IS NOT NULL)
);

CREATE INDEX idx_cart_user    ON cart_items(user_id);
CREATE INDEX idx_cart_session ON cart_items(session_id);

-- ── Quote Requests ───────────────────────────────────────────
CREATE TABLE quote_requests (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reference_number TEXT NOT NULL UNIQUE DEFAULT 'QR-' || UPPER(SUBSTR(MD5(RANDOM()::TEXT), 1, 8)),
  name             TEXT NOT NULL,
  email            TEXT NOT NULL,
  phone            TEXT,
  organization     TEXT,
  message          TEXT,
  status           TEXT DEFAULT 'new' CHECK (status IN ('new', 'in_review', 'responded', 'closed')),
  admin_notes      TEXT,
  responded_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_quotes_status ON quote_requests(status);
CREATE INDEX idx_quotes_email  ON quote_requests(email);

-- ── Quote Line Items ─────────────────────────────────────────
CREATE TABLE quote_items (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id     UUID NOT NULL REFERENCES quote_requests(id) ON DELETE CASCADE,
  product_id   UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_sku  TEXT,
  brand_name   TEXT,
  image_url    TEXT,
  quantity     INT NOT NULL DEFAULT 1,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_quote_items_quote ON quote_items(quote_id);

-- ── Ventures ─────────────────────────────────────────────────
CREATE TABLE ventures (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  tagline       TEXT,
  description   TEXT,
  logo_url      TEXT,
  website_url   TEXT,
  category      TEXT,
  status        TEXT DEFAULT 'live' CHECK (status IN ('live', 'coming_soon')),
  is_revealed   BOOLEAN DEFAULT true,
  display_order INT DEFAULT 0,
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── Certifications ───────────────────────────────────────────
CREATE TABLE certifications (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  issuing_body  TEXT,
  issue_date    DATE,
  cert_id       TEXT,
  description   TEXT,
  image_url     TEXT,
  is_visible    BOOLEAN DEFAULT true,
  display_order INT DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── Projects ─────────────────────────────────────────────────
CREATE TABLE projects (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  description   TEXT,
  client        TEXT,
  image_url     TEXT,
  category      TEXT,
  year          INT,
  is_featured   BOOLEAN DEFAULT false,
  display_order INT DEFAULT 0,
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── Updated_at trigger ───────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_products_updated_at    BEFORE UPDATE ON products      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_profiles_updated_at    BEFORE UPDATE ON profiles      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_cart_updated_at        BEFORE UPDATE ON cart_items    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_quotes_updated_at      BEFORE UPDATE ON quote_requests FOR EACH ROW EXECUTE FUNCTION set_updated_at();
