-- ============================================================
-- USJ Technologies — Migration: USJ Partner status review RPC
--
-- Reviewing a USJ Partner application needs two writes, and no
-- single role can perform both under the current RLS:
--
--   1. usj_partners.status → 'approved'      -- managers can do this
--                                               (team_all_usj_partners)
--   2. profiles.role       → 'usj_partner'   -- admins ONLY. The only
--      UPDATE policies on profiles are `users_update_own_profile`
--      (auth.uid() = id) and `admin_update_all_profiles` (is_admin()),
--      so a manager silently updates zero rows.
--
-- The admin UI only ever did (1). An "approved" partner's account
-- therefore kept role='customer', and PartnerRoute bounced them
-- straight back to /login?type=usj_partner — approval granted no
-- access at all.
--
-- Widening `admin_update_all_profiles` to managers would let them
-- rewrite every column of every profile, so the promotion is exposed
-- as a narrow SECURITY DEFINER function instead. It only ever writes
-- `role`, only on profiles linked to the partner under review, only
-- for callers who are manager or above, and it refuses to touch
-- staff/manager/admin accounts.
--
-- Run in Supabase SQL Editor.
-- ============================================================

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

-- Callable by signed-in users only; the manager check above is what
-- actually authorises it.
REVOKE ALL     ON FUNCTION public.set_partner_status(UUID, TEXT, TEXT) FROM PUBLIC;
REVOKE ALL     ON FUNCTION public.set_partner_status(UUID, TEXT, TEXT) FROM anon;
GRANT  EXECUTE ON FUNCTION public.set_partner_status(UUID, TEXT, TEXT) TO authenticated;

-- ------------------------------------------------------------
-- Backfill: partners already marked approved whose linked account
-- was never promoted (every approval made before this migration).
--
-- prevent_role_self_escalation() (migration 016) rejects any role
-- change when the caller isn't an admin, and auth.uid() is NULL in
-- the SQL Editor — so the trigger is disabled for the backfill only,
-- exactly as migration 20260903000001 does.
-- ------------------------------------------------------------
ALTER TABLE profiles DISABLE TRIGGER trg_prevent_role_self_escalation;

UPDATE profiles p
   SET role = 'usj_partner'
  FROM usj_partners up
 WHERE p.partner_id = up.id
   AND up.status    = 'approved'
   AND p.role       = 'customer';

ALTER TABLE profiles ENABLE TRIGGER trg_prevent_role_self_escalation;

-- Verification
SELECT p.id AS profile_id, p.role, up.business_name, up.status
FROM profiles p
JOIN usj_partners up ON up.id = p.partner_id
ORDER BY up.status, up.business_name;
