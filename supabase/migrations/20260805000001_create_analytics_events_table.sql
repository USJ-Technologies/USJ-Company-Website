-- ============================================================
-- USJ Technologies — Supabase PostgreSQL Schema
-- Migration: Create analytics_events table for first-party event tracking
-- ============================================================

CREATE TABLE analytics_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name  TEXT NOT NULL,
  user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id  TEXT,
  metadata    JSONB,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_analytics_events_event_name ON analytics_events(event_name);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at);

ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY public_insert_analytics_events ON analytics_events
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'anon');

CREATE POLICY service_select_analytics_events ON analytics_events
  FOR SELECT
  USING (auth.role() = 'service_role' OR auth.role() = 'dashboard');
