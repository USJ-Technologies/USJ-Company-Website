-- ============================================================
-- USJ Technologies — Migration 013: Careers Platform
-- Creates job_postings and job_applications tables with RLS,
-- and provisions a resumes storage bucket.
-- ============================================================

-- ── Job Postings ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS job_postings (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title            TEXT NOT NULL,
  slug             TEXT UNIQUE,
  department       TEXT NOT NULL DEFAULT 'Technology',
  location         TEXT NOT NULL DEFAULT 'Dehradun, Uttarakhand',
  type             TEXT NOT NULL DEFAULT 'full_time'
                     CONSTRAINT job_postings_type_check
                     CHECK (type IN ('full_time', 'part_time', 'internship', 'contract', 'remote')),
  experience       TEXT DEFAULT 'mid'
                     CONSTRAINT job_postings_experience_check
                     CHECK (experience IN ('entry', 'mid', 'senior', 'lead')),
  description      TEXT,
  requirements     TEXT[] DEFAULT '{}',
  responsibilities TEXT[] DEFAULT '{}',
  salary_min       INTEGER,
  salary_max       INTEGER,
  deadline         DATE,
  is_active        BOOLEAN DEFAULT true,
  is_featured      BOOLEAN DEFAULT false,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_job_postings_active    ON job_postings(is_active);
CREATE INDEX IF NOT EXISTS idx_job_postings_dept      ON job_postings(department);

-- ── Job Applications ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS job_applications (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id       UUID NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
  job_title    TEXT,
  name         TEXT NOT NULL,
  email        TEXT NOT NULL,
  phone        TEXT,
  linkedin_url TEXT,
  resume_url   TEXT,
  cover_note   TEXT,
  status       TEXT NOT NULL DEFAULT 'new'
                 CONSTRAINT job_applications_status_check
                 CHECK (status IN ('new', 'reviewing', 'shortlisted', 'rejected', 'hired')),
  admin_notes  TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_job_apps_job_id ON job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_job_apps_status ON job_applications(status);
CREATE INDEX IF NOT EXISTS idx_job_apps_email  ON job_applications(email);

-- ── Row Level Security ────────────────────────────────────────
ALTER TABLE job_postings    ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

-- Public can read active job postings (no auth required)
CREATE POLICY "public_read_active_jobs" ON job_postings
  FOR SELECT USING (is_active = true);

-- Admins / managers can do full CRUD on job postings
CREATE POLICY "team_manage_jobs" ON job_postings
  FOR ALL TO authenticated
  USING (is_manager_or_above())
  WITH CHECK (is_manager_or_above());

-- Anyone can submit a job application (anon or authenticated)
CREATE POLICY "public_submit_application" ON job_applications
  FOR INSERT WITH CHECK (true);

-- Admins / managers can read and manage all applications
CREATE POLICY "team_manage_applications" ON job_applications
  FOR ALL TO authenticated
  USING (is_manager_or_above())
  WITH CHECK (is_manager_or_above());

-- ── Resumes Storage Bucket ────────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
  VALUES ('resumes', 'resumes', true)
  ON CONFLICT (id) DO NOTHING;

-- Anyone can upload a resume (one-time during application)
DROP POLICY IF EXISTS "public_upload_resumes" ON storage.objects;
CREATE POLICY "public_upload_resumes" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'resumes');

-- Anyone can read resumes (links are UUID-based so effectively private)
DROP POLICY IF EXISTS "public_read_resumes" ON storage.objects;
CREATE POLICY "public_read_resumes" ON storage.objects
  FOR SELECT USING (bucket_id = 'resumes');

-- Only team can delete resume files
DROP POLICY IF EXISTS "team_delete_resumes" ON storage.objects;
CREATE POLICY "team_delete_resumes" ON storage.objects
  FOR DELETE USING (bucket_id = 'resumes' AND is_manager_or_above());
