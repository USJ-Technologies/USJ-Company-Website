-- ============================================================
-- USJ Technologies — Migration: force-replace set_partner_status()
--
-- SYMPTOM
--   After 20260906000004 repaired the stale role DATA, approving a
--   partner STILL fails:
--     new row for relation "profiles" violates check constraint
--     "profiles_role_check"  (code 23514)
--   and the failing row again contains role = `vendor`.
--
-- WHY THIS IS A DIFFERENT BUG
--   20260906000004 proved the stored value is now correct — the
--   profile reads 'customer', confirmed by its verification query (e).
--   So the illegal 'vendor' in the new tuple is being INTRODUCED by the
--   write itself, not dragged along from the existing row.
--
--   The only writer is set_partner_status(). Therefore the live body
--   still contains
--     v_role := CASE WHEN p_status = 'approved' THEN 'vendor' ... END;
--   i.e. a pre-rename body. 20260906000002 made that body *runnable*
--   again (it substituted vendor_id → partner_id, which is why the
--   earlier `column "vendor_id" does not exist` error disappeared) but
--   its rewrite never touched the bare role literal 'vendor'. The
--   function went from failing loudly to succeeding wrongly.
--
-- WHY 20260906000004 STEP 4 DID NOT FIX IT
--   That step used CREATE OR REPLACE, which only replaces an EXACT
--   signature. A stale overload with different parameter types — say
--   (uuid, text) from before p_notes was added — survives untouched
--   beside the new one, and PostgREST resolves the RPC call by the
--   argument names the client sends, so it can keep dispatching to the
--   stale overload. CREATE OR REPLACE cannot see it, and nothing in
--   the previous migration would have reported it.
--
-- FIX
--   Drop EVERY overload of public.set_partner_status by signature,
--   then create exactly one canonical definition. This is the only
--   form that is robust against unknown overloads.
--
--   Safe: the function is called from exactly one place,
--   PartnersAdminPage.jsx's supabase.rpc('set_partner_status', ...),
--   and the canonical body below is the repo's own definition from
--   20260906000001. Atomic — if the create fails the drops roll back.
--
-- Run in Supabase SQL Editor. Idempotent — safe to re-run.
-- ============================================================

BEGIN;

-- ------------------------------------------------------------
-- 1. Report what is live, then drop all of it.
-- ------------------------------------------------------------
DO $$
DECLARE
  r RECORD;
  n INT := 0;
BEGIN
  FOR r IN
    SELECT p.oid::regprocedure AS sig,
           p.prosrc LIKE '%''vendor''%' AS bad
    FROM pg_proc p
    JOIN pg_namespace ns ON ns.oid = p.pronamespace
    WHERE ns.nspname = 'public' AND p.proname = 'set_partner_status'
  LOOP
    RAISE NOTICE 'Dropping % (assigns bare ''vendor'': %)', r.sig, r.bad;
    EXECUTE format('DROP FUNCTION %s', r.sig);
    n := n + 1;
  END LOOP;

  RAISE NOTICE 'Dropped % overload(s) of set_partner_status.', n;
END $$;

-- ------------------------------------------------------------
-- 2. One canonical definition (verbatim from 20260906000001).
-- ------------------------------------------------------------
CREATE FUNCTION public.set_partner_status(
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

  -- Only an approved partner keeps dashboard access; every other
  -- status drops the account back to a plain customer.
  v_role := CASE WHEN p_status = 'approved' THEN 'usj_partner' ELSE 'customer' END;

  -- The role filter is a guard, not an optimisation: it stops a staff,
  -- manager or admin account that also happens to own a partner
  -- application from being demoted to 'customer' on rejection.
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

-- ------------------------------------------------------------
-- 3. Same treatment for any OTHER public function still assigning a
--    bare 'vendor' role literal. Reported, not auto-rewritten: unlike
--    the vendor_id → partner_id rename in 20260906000002, the correct
--    replacement here depends on context ('usj_partner' in an approval
--    path, 'customer' in a demotion path), so a blind substitution
--    could silently grant partner access. Anything listed needs a
--    hand-written fix.
-- ------------------------------------------------------------
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT p.oid::regprocedure AS sig
    FROM pg_proc p
    JOIN pg_namespace ns ON ns.oid = p.pronamespace
    WHERE ns.nspname = 'public'
      AND p.prokind = 'f'
      AND p.prosrc LIKE '%''vendor''%'
  LOOP
    RAISE WARNING 'Still assigns a bare ''vendor'' literal: %', r.sig;
  END LOOP;
END $$;

COMMIT;

-- ============================================================
-- Verification
-- ============================================================

-- (a) Exactly ONE row, and still_assigns_vendor must be false.
--     More than one row means an overload was recreated since.
SELECT p.oid::regprocedure AS signature,
       p.prosrc LIKE '%''vendor''%' AS still_assigns_vendor
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public' AND p.proname = 'set_partner_status';

-- (b) Must be empty across the whole schema.
SELECT p.oid::regprocedure AS signature
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public' AND p.prokind = 'f'
  AND p.prosrc LIKE '%''vendor''%';

-- (c) Must be empty — no profile should hold the illegal value.
SELECT id, email, role FROM profiles WHERE role = 'vendor';

-- (d) Must return 'O'. 'D' means the role-escalation guard is off and
--     any signed-in user could rewrite their own role to 'admin'.
SELECT t.tgname, t.tgenabled
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
WHERE c.relname = 'profiles' AND t.tgname = 'trg_prevent_role_self_escalation';
