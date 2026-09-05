-- ============================================================
-- USJ Technologies — Migration: fix the role-escalation guard's
-- stale role list
--
-- SYMPTOM
--   A Manager approving a USJ Partner gets
--   `You do not have permission to assign this role.`
--   An Admin approving the same partner succeeds.
--
-- CAUSE
--   prevent_role_self_escalation() (migration 016) allows a manager to
--   move an account between the two non-privileged roles:
--
--     ELSIF is_manager_or_above()
--       AND NEW.role IN ('vendor', 'customer')
--       AND OLD.role IN ('vendor', 'customer')
--
--   20260903000001 recreated it with 'usj_partner' in place of
--   'vendor', but the live database is running the 016 body — a re-run
--   of the security-hardening script, or a migration-ordering skew,
--   replaced the corrected version.
--
--   set_partner_status() promotes the applicant from 'customer' to
--   'usj_partner'. With the stale list, 'usj_partner' is not an
--   allowed target, so the ELSIF is false and the ELSE raises. is_admin()
--   short-circuits above it, which is why only Managers hit this.
--
--   Note this is also why *rejecting* a pending applicant appeared to
--   work: rejection sets role 'customer', and a never-promoted
--   applicant is already 'customer', so the `role IS DISTINCT FROM`
--   filter in set_partner_status matches zero rows and the trigger
--   never fires.
--
-- FIX
--   Recreate the function with the correct role values.
--
-- WHY THIS STAYS AN ALLOWLIST
--   It is tempting to make this drift-proof by inverting it to
--   `NEW.role NOT IN ('admin', 'manager', 'staff')`. Don't. The two
--   sets are equal today, but they fail in opposite directions: an
--   allowlist that misses a new role blocks a legitimate action (what
--   just happened — noisy, safe, fixed in minutes), while a denylist
--   that misses a new *privileged* role silently lets every manager
--   assign it. A security guard should fail closed. If a role is added
--   to profiles_role_check, update this list deliberately.
--
-- Run in Supabase SQL Editor. Idempotent — safe to re-run.
-- ============================================================

CREATE OR REPLACE FUNCTION public.prevent_role_self_escalation()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF is_admin() THEN
      RETURN NEW;
    ELSIF is_manager_or_above()
      AND NEW.role IN ('usj_partner', 'customer')
      AND OLD.role IN ('usj_partner', 'customer') THEN
      RETURN NEW;
    ELSE
      RAISE EXCEPTION 'You do not have permission to assign this role.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- The trigger itself is recreated defensively: 20260906000001 and
-- 20260903000001 both DISABLE it around their backfills, and a script
-- that aborted between DISABLE and ENABLE would leave it off — which
-- would drop the guard entirely rather than merely misfire it.
DROP TRIGGER IF EXISTS trg_prevent_role_self_escalation ON profiles;
CREATE TRIGGER trg_prevent_role_self_escalation
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_role_self_escalation();

-- ------------------------------------------------------------
-- Verification
-- ------------------------------------------------------------

-- (a) Must return TRUE. Returns FALSE if a stale body is live again.
SELECT p.prosrc LIKE '%usj_partner%' AND p.prosrc NOT LIKE '%''vendor''%'
         AS role_guard_is_current
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public' AND p.proname = 'prevent_role_self_escalation';

-- (b) Must return 'O' (enabled, origin). 'D' means disabled — the guard
--     is off and any user could rewrite their own role.
SELECT t.tgname, t.tgenabled
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
WHERE c.relname = 'profiles' AND t.tgname = 'trg_prevent_role_self_escalation';

-- (c) Approved partners whose linked account was never promoted.
--     Should be empty; anything listed can be re-approved from the UI
--     now that the guard permits it.
SELECT up.business_name, up.status, p.id AS profile_id, p.role
FROM usj_partners up
JOIN profiles p ON p.partner_id = up.id
WHERE up.status = 'approved' AND p.role <> 'usj_partner';
