-- Allow managers to approve USJ Partner applications.
-- This is intentionally idempotent so it can be applied before or after the
-- more detailed partner-review migrations dated 20260906.

CREATE OR REPLACE FUNCTION public.prevent_role_self_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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

CREATE OR REPLACE FUNCTION public.set_partner_status(
  p_partner_id UUID,
  p_status TEXT,
  p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_partner public.usj_partners;
  v_role TEXT;
  v_profiles_updated INT;
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
  SET status = p_status,
      contact_info = CASE
        WHEN p_notes IS NULL OR btrim(p_notes) = '' THEN contact_info
        ELSE COALESCE(contact_info, '{}'::jsonb)
          || jsonb_build_object('review_notes', p_notes)
      END,
      updated_at = NOW()
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

  GET DIAGNOSTICS v_profiles_updated = ROW_COUNT;

  RETURN jsonb_build_object(
    'partner', to_jsonb(v_partner),
    'profiles_updated', v_profiles_updated,
    'assigned_role', v_role
  );
END;
$$;

REVOKE ALL ON FUNCTION public.set_partner_status(UUID, TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.set_partner_status(UUID, TEXT, TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION public.set_partner_status(UUID, TEXT, TEXT) TO authenticated;