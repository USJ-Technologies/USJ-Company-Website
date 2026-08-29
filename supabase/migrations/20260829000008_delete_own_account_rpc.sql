-- ============================================================
-- USJ Technologies — Migration: delete_own_account RPC
--
-- Self-service account deletion via Postgres (no Edge Function required).
-- Authenticated users re-authenticate in the app, then call this RPC.
-- ============================================================

CREATE OR REPLACE FUNCTION public.close_vendor_for_account_deletion(p_vendor_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE products
  SET is_active = false
  WHERE vendor_id = p_vendor_id;

  UPDATE vendors
  SET
    status = 'closed',
    business_name = 'Closed Account',
    contact_info = '{}'::jsonb,
    kyc_document_urls = ARRAY[]::text[],
    gst_number = NULL,
    pan_number = NULL,
    storefront_description = NULL,
    logo_url = NULL,
    created_by = NULL,
    updated_at = NOW()
  WHERE id = p_vendor_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.delete_own_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID := auth.uid();
  user_role TEXT;
  linked_vendor_id UUID;
  vendor_row RECORD;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT role, vendor_id
  INTO user_role, linked_vendor_id
  FROM profiles
  WHERE id = uid;

  IF user_role IN ('admin', 'manager', 'staff') THEN
    RAISE EXCEPTION 'Team accounts must be removed by an administrator.';
  END IF;

  IF linked_vendor_id IS NOT NULL THEN
    PERFORM public.close_vendor_for_account_deletion(linked_vendor_id);
  END IF;

  FOR vendor_row IN
    SELECT id
    FROM vendors
    WHERE created_by = uid
      AND (linked_vendor_id IS NULL OR id <> linked_vendor_id)
  LOOP
    PERFORM public.close_vendor_for_account_deletion(vendor_row.id);
  END LOOP;

  DELETE FROM auth.users WHERE id = uid;
END;
$$;

REVOKE ALL ON FUNCTION public.close_vendor_for_account_deletion(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.close_vendor_for_account_deletion(UUID) TO service_role;

REVOKE ALL ON FUNCTION public.delete_own_account() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_own_account() TO authenticated;
