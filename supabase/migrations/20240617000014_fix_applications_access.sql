-- ============================================================
-- USJ Technologies — Migration 014: Fix job_applications access
--
-- Problem: authenticated admins/managers cannot SELECT from
-- job_applications because:
--   1. Table-level GRANTs may not cover the new table
--      (ALTER DEFAULT PRIVILEGES only covers future tables
--       at the time it ran; retroactive tables need explicit grants)
--   2. The combined FOR ALL policy interacts unexpectedly with
--      the FOR INSERT public_submit_application policy
--
-- Fix: add explicit grants + split FOR ALL into per-operation
-- policies so there is zero ambiguity about what each role can do.
-- ============================================================

-- ── 1. Explicit table-level grants ───────────────────────────
-- authenticated role needs SELECT/INSERT/UPDATE/DELETE
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.job_applications TO authenticated;
-- anon role only needs INSERT (public applications from website)
GRANT INSERT ON TABLE public.job_applications TO anon;

-- Also ensure job_postings grants are solid (for count embed)
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.job_postings TO authenticated;
GRANT SELECT ON TABLE public.job_postings TO anon;

-- ── 2. Drop the combined FOR ALL policy ───────────────────────
-- FOR ALL with USING + WITH CHECK is correct per spec, but
-- splitting it avoids subtle interactions with the INSERT-only
-- public policy and makes the intent crystal clear.
DROP POLICY IF EXISTS "team_manage_applications" ON job_applications;

-- ── 3. Re-create as explicit per-operation policies ───────────

-- Managers/admins can read all applications
CREATE POLICY "team_select_applications" ON job_applications
  FOR SELECT TO authenticated
  USING (is_manager_or_above());

-- Managers/admins can update status and notes
CREATE POLICY "team_update_applications" ON job_applications
  FOR UPDATE TO authenticated
  USING    (is_manager_or_above())
  WITH CHECK (is_manager_or_above());

-- Managers/admins can delete applications (cascade from job delete)
CREATE POLICY "team_delete_applications" ON job_applications
  FOR DELETE TO authenticated
  USING (is_manager_or_above());

-- public_submit_application (FOR INSERT WITH CHECK (true)) is kept as-is.
-- It already covers both anon and authenticated INSERT.
