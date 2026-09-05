-- ============================================================
-- USJ Technologies — Migration: purge stale 'vendor' role VALUES
--
-- SYMPTOM
--   Any write touching certain profiles fails with
--     new row for relation "profiles" violates check constraint
--     "profiles_role_check"
--   and the reported failing row contains role = `vendor` — a value
--   nothing in the current codebase ever assigns.
--
-- CAUSE
--   Two separate things, and the second is what makes it confusing.
--
--   1. Stale DATA. 20260903000001 backfilled 'vendor' → 'usj_partner'
--      and then re-added profiles_role_check without 'vendor'. At least
--      one profile still holds 'vendor', so it predates or side-stepped
--      that backfill (a partial SQL Editor run, or a write made while
--      the constraint was dropped between its lines 123 and 137).
--
--   2. Postgres re-validates a table's CHECK constraints against the
--      ENTIRE new tuple on every UPDATE — not just the columns named in
--      the SET list. So an UPDATE that only sets `partner_id`, such as
--      BecomeSellerPage's
--          .from('profiles').update({ partner_id: partnerData.id })
--      still drags the untouched, now-illegal role='vendor' through the
--      check and fails. That is why the error names a column the
--      failing statement never wrote, and why the row looks frozen:
--      every write to it fails, so it can never be repaired in place by
--      normal application traffic.
--
--   20260906000002 does not cover this. It rewrote stale FUNCTION
--   BODIES, substituting only `vendor_id` → `partner_id` and `vendors`
--   → `usj_partners`. A bare role literal 'vendor' matches neither
--   pattern, and that migration never inspected table data at all.
--
-- FIX
--   1. Drop the constraint, repair the data, re-add the constraint.
--      Order matters: ADD CONSTRAINT validates existing rows, so it
--      cannot be re-added while a 'vendor' row survives.
--   2. Repair to the value the current model actually implies, rather
--      than the blanket 'usj_partner' the rename used: only a profile
--      whose linked partner is APPROVED keeps partner access. Everyone
--      else drops to 'customer'. This matches set_partner_status()'s
--      own rule (`CASE WHEN p_status = 'approved' ...`) and avoids
--      silently granting the partner dashboard to a pending or rejected
--      applicant.
--   3. Re-assert the canonical set_partner_status() body, so a live
--      copy still assigning the bare 'vendor' literal cannot
--      reintroduce the bad value on the next approval.
--
-- Run in Supabase SQL Editor. Idempotent — safe to re-run.
-- ============================================================

BEGIN;

-- ------------------------------------------------------------
-- 0. Before picture — what we are about to change.
-- ------------------------------------------------------------
DO $$
DECLARE
  n INT;
BEGIN
  SELECT COUNT(*) INTO n FROM profiles WHERE role = 'vendor';
  RAISE NOTICE 'Profiles carrying the stale role ''vendor'': %', n;
END $$;

-- ------------------------------------------------------------
-- 1. Drop the constraint so the repair can land.
--
--    Whatever its current definition — the post-rename list, or the
--    narrower migration-012 list if a re-run of the RBAC script
--    reinstated it — step 3 replaces it with the correct one.
-- ------------------------------------------------------------
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- ------------------------------------------------------------
-- 2. Repair the data.
--
--    prevent_role_self_escalation() rejects any role change when the
--    caller isn't an admin, and auth.uid() is NULL in the SQL Editor.
--    Disabled for the backfill only, exactly as 20260903000001 and
--    20260906000001 do. 20260906000003 recreates the trigger
--    defensively for the case where a run aborts in this window.
-- ------------------------------------------------------------
--    Guarded on existence rather than issued bare: ALTER TABLE ...
--    DISABLE TRIGGER has no IF EXISTS, so on a database where the
--    guard was never installed the bare form aborts the whole
--    migration over a trigger this repair does not actually need.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    WHERE c.relname = 'profiles'
      AND t.tgname  = 'trg_prevent_role_self_escalation'
  ) THEN
    ALTER TABLE profiles DISABLE TRIGGER trg_prevent_role_self_escalation;
  END IF;
END $$;

UPDATE profiles p
   SET role = CASE
                WHEN EXISTS (
                  SELECT 1 FROM usj_partners up
                   WHERE up.id = p.partner_id
                     AND up.status = 'approved'
                ) THEN 'usj_partner'
                ELSE 'customer'
              END
 WHERE p.role = 'vendor';

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    WHERE c.relname = 'profiles'
      AND t.tgname  = 'trg_prevent_role_self_escalation'
  ) THEN
    ALTER TABLE profiles ENABLE TRIGGER trg_prevent_role_self_escalation;
  END IF;
END $$;

-- ------------------------------------------------------------
-- 3. Re-add the constraint with the current, correct role set.
--    Now validates cleanly because step 2 removed every 'vendor'.
-- ------------------------------------------------------------
ALTER TABLE profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('customer', 'admin', 'manager', 'staff', 'usj_partner'));

-- ------------------------------------------------------------
-- 4. Re-assert the review RPC (verbatim from 20260906000001).
--
--    If the live body still assigned the bare 'vendor' literal, the
--    next approval would write the illegal value straight back and
--    re-break the row. Re-applying the known-good definition closes
--    that loop. No-op when the live copy is already current.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_partner_status(
  p_partner_id UUID,
  p_status     TEXT,
  p_notes      TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_partner  public.usj_partners;
  v_role     TEXT;
  v_promoted INT;
BEGIN
  IF NOT is_manager_or_above() THEN
    RAISE EXCEPTION 'Only managers and admins can review USJ Partner applications.'
      USING ERRCODE = '42501';
  END IF;

  IF p_status NOT IN ('pending', 'approved', 'suspended', 'rejected') THEN
    RAISE EXCEPTION 'Unknown USJ Partner status: %', p_status
      USING ERRCODE = '22023';
  END IF;

  UPDATE public.usj_partners
     SET status       = p_status,
         contact_info = CASE
                          WHEN p_notes IS NULL OR btrim(p_notes) = '' THEN contact_info
                          ELSE COALESCE(contact_info, '{}'::jsonb)
                               || jsonb_build_object('review_notes', p_notes)
                        END,
         updated_at   = NOW()
   WHERE id = p_partner_id
   RETURNING * INTO v_partner;

  IF v_partner.id IS NULL THEN
    RAISE EXCEPTION 'USJ Partner % not found.', p_partner_id
      USING ERRCODE = 'P0002';
  END IF;

  v_role := CASE WHEN p_status = 'approved' THEN 'usj_partner' ELSE 'customer' END;

  UPDATE public.profiles
     SET partner_id = p_partner_id,
         role = v_role
   WHERE (partner_id = p_partner_id OR id = v_partner.created_by)
     AND role IN ('customer', 'usj_partner')
     AND role IS DISTINCT FROM v_role;

  GET DIAGNOSTICS v_promoted = ROW_COUNT;

  RETURN jsonb_build_object(
    'partner',          to_jsonb(v_partner),
    'profiles_updated', v_promoted,
    'assigned_role',    v_role
  );
END;
$$;

REVOKE ALL     ON FUNCTION public.set_partner_status(UUID, TEXT, TEXT) FROM PUBLIC;
REVOKE ALL     ON FUNCTION public.set_partner_status(UUID, TEXT, TEXT) FROM anon;
GRANT  EXECUTE ON FUNCTION public.set_partner_status(UUID, TEXT, TEXT) TO authenticated;

COMMIT;

-- ============================================================
-- Verification
-- ============================================================

-- (a) Must be empty. Any row here means the repair did not land.
SELECT id, email, role, partner_id
FROM profiles
WHERE role = 'vendor';

-- (b) The live constraint. Must list exactly:
--     customer, admin, manager, staff, usj_partner
SELECT pg_get_constraintdef(c.oid) AS profiles_role_check
FROM pg_constraint c
JOIN pg_class cl ON cl.oid = c.conrelid
WHERE cl.relname = 'profiles' AND c.conname = 'profiles_role_check';

-- (c) Must return 'O' (enabled). 'D' means step 2 aborted mid-way and
--     the role-escalation guard is still off — re-run this migration,
--     or 20260906000003, before doing anything else.
SELECT t.tgname, t.tgenabled
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
WHERE c.relname = 'profiles' AND t.tgname = 'trg_prevent_role_self_escalation';

-- (d) Must be empty. Any function still assigning a bare 'vendor'
--     role literal will re-break a profile the next time it runs;
--     20260906000002's rewrite loop does not catch this pattern.
SELECT n.nspname AS schema,
       p.proname AS function,
       pg_get_function_identity_arguments(p.oid) AS args
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.prokind = 'f'
  AND p.prosrc LIKE '%''vendor''%'
ORDER BY 1, 2;

-- (e) Every profile linked to a partner, with the partner's status.
--     Sanity check: approved → usj_partner, everything else → customer.
SELECT p.email, p.role, up.business_name, up.status
FROM profiles p
JOIN usj_partners up ON up.id = p.partner_id
ORDER BY up.status, up.business_name;
