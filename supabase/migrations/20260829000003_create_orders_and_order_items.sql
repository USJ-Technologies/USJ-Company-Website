-- ============================================================
-- USJ Technologies — Migration: Create Orders & Order Items Tables
--
-- Scaffolding for future e-commerce checkout integration.
-- Allows vendor attribution even before payment splitting.
--
-- Creates:
-- - orders table (user's full order)
-- - order_items table (line items, each with vendor_id for attribution)
--
-- Run in Supabase SQL Editor.
-- ============================================================

-- 1. Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reference_number    TEXT NOT NULL UNIQUE DEFAULT 'ORD-' || UPPER(SUBSTR(MD5(RANDOM()::TEXT), 1, 8)),
  status              TEXT NOT NULL DEFAULT 'pending'
                      CONSTRAINT orders_status_check
                      CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  total_amount        DECIMAL(12, 2),
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- 2. Create order_items table (line items per order, with vendor attribution)
CREATE TABLE IF NOT EXISTS order_items (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id            UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id          UUID NOT NULL REFERENCES products(id) ON DELETE SET NULL,
  vendor_id           UUID REFERENCES vendors(id) ON DELETE SET NULL,  -- Allows tracking vendor per item
  quantity            INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price          DECIMAL(10, 2) NOT NULL,
  subtotal            DECIMAL(12, 2),
  status              TEXT DEFAULT 'pending'
                      CONSTRAINT order_items_status_check
                      CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_order_items_vendor_id ON order_items(vendor_id);

-- Enable RLS
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Verification
SELECT table_name FROM information_schema.tables
WHERE table_name IN ('orders', 'order_items');
