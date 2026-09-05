-- ============================================================
-- USJ Technologies — Migration: drop the orphan
-- trg_vendor_approval / handle_vendor_approval() trigger
--
-- THIS IS THE ACTUAL CAUSE OF THE 23514 APPROVAL FAILURE.
-- 20260906000004 and 20260906000005 did not fix it. They are not
-- wrong — the constraint and the RPC they wrote are correct and should
-- stay — but neither addressed the real writer.
--
-- SYMPTOM
--   Approving a USJ Partner fails with
--     new row for relation "profiles" violates check constraint
--     "profiles_role_check"   (code 23514)
--   with role = `vendor` in the failing row, even though:
--     - no profile anywhere holds 'vendor'   (verified: 0 rows)
--     - profiles_role_check permits usj_partner (verified)
--     - set_partner_status() assigns 'usj_partner' (verified, single
--       overload, body clean)
--
-- CAUSE
--   An AFTER UPDATE trigger on usj_partners that exists ONLY in the
--   live database — it appears in no migration in this repo, so it was
--   created by hand in the SQL Editor during the 20260829 vendor phase
--   and never captured in version control:
--
--     CREATE TRIGGER trg_vendor_approval AFTER UPDATE ON usj_partners
--       FOR EACH ROW EXECUTE FUNCTION handle_vendor_approval();
--
--     -- body:
--     IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
--       UPDATE profiles SET role = 'vendor'
--        WHERE partner_id = NEW.id AND role = 'customer';
--     END IF;
--
--   set_partner_status() sets usj_partners.status = 'approved' as its
--   first write. That fires this trigger, which immediately writes the
--   pre-rename literal 'vendor' into profiles.role. The constraint
--   rejects it and the whole RPC rolls back — including
--   set_partner_status()'s own correct 'usj_partner' write, which never
--   even gets to run.
--
--   The rename in 20260903000001 renamed this trigger's TABLE
--   (vendors → usj_partners) but not the literal in its body, and
--   20260906000002's rewrite loop only substituted `vendor_id` and
--   `vendors` — a bare role literal 'vendor' matches neither. So the
--   trigger survived every previous cleanup intact.
--
-- WHY DROP RATHER THAN REPAIR
--   It is pure duplicated logic. set_partner_status() already performs
--   exactly this promotion and demotion, in one place, with the correct
--   role values and a guard that protects staff/manager/admin accounts:
--
--     v_role := CASE WHEN p_status = 'approved'
--                    THEN 'usj_partner' ELSE 'customer' END;
--     UPDATE public.profiles SET partner_id = ..., role = v_role
--      WHERE ... AND role IN ('customer', 'usj_partner') ...
--
--   Rewriting the trigger to say 'usj_partner' would leave two
--   independent writers racing on the same column — the exact
--   condition that produced this bug. The RPC is the single documented
--   entry point for partner review (PartnersAdminPage.jsx calls
--   nothing else), so the trigger is removed outright.
--
-- Run in Supabase SQL Editor. Idempotent — safe to re-run.
-- ============================================================

BEGIN;

DROP TRIGGER  IF EXISTS trg_vendor_approval    ON public.usj_partners;
DROP FUNCTION IF EXISTS public.handle_vendor_approval();

COMMIT;

-- ============================================================
-- Verification
-- ============================================================

-- (a) Must be empty. The trigger is gone.
SELECT t.tgname
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
WHERE c.relname = 'usj_partners' AND NOT t.tgisinternal;

-- (b) Must be empty. No function anywhere still mentions vendor.
SELECT p.oid::regprocedure AS signature
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public' AND p.prokind = 'f'
  AND p.prosrc ILIKE '%vendor%';

-- (c) Remaining triggers on profiles. Expect exactly two:
--     set_profiles_updated_at and trg_prevent_role_self_escalation,
--     both 'O'. Neither writes role.
SELECT t.tgname, pr.proname, t.tgenabled
FROM pg_trigger t
JOIN pg_class c  ON c.oid = t.tgrelid
JOIN pg_proc  pr ON pr.oid = t.tgfoid
WHERE c.relname = 'profiles' AND NOT t.tgisinternal;

-- (d) After approving from the UI, this should show
--     Vijay sales test / approved / usj_partner.
SELECT p.email, p.role, up.business_name, up.status
FROM profiles p
JOIN usj_partners up ON up.id = p.partner_id
ORDER BY up.status, up.business_name;
