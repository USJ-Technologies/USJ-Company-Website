-- ============================================================
-- USJ Technologies — Migration 006: Static Content + Constraints
-- Run this in Supabase SQL Editor to seed ventures & certifications
-- ============================================================

-- Add unique constraint so upsert works on future seed runs
ALTER TABLE ventures        ADD CONSTRAINT ventures_name_unique        UNIQUE (name);
ALTER TABLE certifications  ADD CONSTRAINT certifications_name_unique  UNIQUE (name);

-- ── Ventures ─────────────────────────────────────────────────

INSERT INTO ventures (name, tagline, description, website_url, category, status, is_revealed, is_active, display_order)
VALUES
  (
    'Bail & Beyond Law Chambers',
    'Expert Legal Services for Bail & Criminal Matters',
    'Professional legal services specializing in bail applications, criminal defense, and legal consultation across Uttarakhand.',
    'https://bailandbeyond.com',
    'Legal Services',
    'live',
    true,
    true,
    1
  ),
  (
    'Chalo Kumbh',
    'Experience the Sacred Kumbh Mela',
    'Your complete digital companion for Kumbh Mela — bookings, guides, and a vibrant community for pilgrims from across India and the world.',
    'https://chalokumbh.com',
    'Pilgrimage & Travel',
    'live',
    true,
    true,
    2
  ),
  (
    'Doon Travelers',
    'Explore Uttarakhand & Beyond',
    'Curated travel packages from Dehradun to the Himalayas, Char Dham, and beyond. Expert local guides and premium experiences.',
    null,
    'Tours & Travel',
    'coming_soon',
    false,
    true,
    3
  )
ON CONFLICT (name) DO UPDATE SET
  tagline       = EXCLUDED.tagline,
  description   = EXCLUDED.description,
  website_url   = EXCLUDED.website_url,
  category      = EXCLUDED.category,
  status        = EXCLUDED.status,
  is_revealed   = EXCLUDED.is_revealed,
  display_order = EXCLUDED.display_order;

-- ── Certifications ───────────────────────────────────────────

INSERT INTO certifications (name, issuing_body, description, is_visible, display_order)
VALUES
  (
    'Startup India Recognized',
    'Department for Promotion of Industry and Internal Trade (DPIIT)',
    'Recognized under the Startup India initiative by the Government of India for our innovative technology solutions.',
    true,
    1
  ),
  (
    'GeM Registered Seller',
    'Government e-Marketplace (GeM)',
    'Registered seller on the Government e-Marketplace portal for procurement of technology products by government departments.',
    true,
    2
  ),
  (
    'MSME / Udyam Registered',
    'Ministry of Micro, Small and Medium Enterprises',
    'Udyam Registration Certificate under Ministry of MSME, Government of India.',
    true,
    3
  ),
  (
    'ISO Compliant Processes',
    'Quality Management',
    'Our procurement and delivery processes follow ISO-aligned quality management standards.',
    true,
    4
  )
ON CONFLICT (name) DO UPDATE SET
  issuing_body  = EXCLUDED.issuing_body,
  description   = EXCLUDED.description,
  is_visible    = EXCLUDED.is_visible,
  display_order = EXCLUDED.display_order;

-- Verify
SELECT 'ventures' AS table_name, COUNT(*) FROM ventures
UNION ALL
SELECT 'certifications', COUNT(*) FROM certifications;
