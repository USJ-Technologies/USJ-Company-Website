-- ============================================================
-- USJ Technologies — Migration 004: Team Members
-- ============================================================

CREATE TABLE team_members (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  role          TEXT NOT NULL,
  department    TEXT,
  bio           TEXT,
  image_url     TEXT,
  email         TEXT,
  linkedin_url  TEXT,
  display_order INT DEFAULT 0,
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Public read, admin write
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "team_public_read" ON team_members
  FOR SELECT USING (is_active = true);

CREATE POLICY "team_admin_all" ON team_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

-- Seed initial team
INSERT INTO team_members (name, role, department, bio, display_order) VALUES
  ('Ujjwal Singh Jeena', 'Founder & CEO', 'Leadership', 'Visionary entrepreneur with expertise in government procurement, technology integration, and startup building. Leading USJ Technologies from Dehradun to serve India.', 1),
  ('Technology Lead', 'CTO & Head of Products', 'Technology', 'Engineering excellence with deep expertise in electronics, networking systems, and defence-grade technologies.', 2),
  ('Operations Lead', 'Head of Operations & GeM', 'Operations', 'Specialist in government e-marketplace, tender management, and compliance frameworks across India.', 3);
