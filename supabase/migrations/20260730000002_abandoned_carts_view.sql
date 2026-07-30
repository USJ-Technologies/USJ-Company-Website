-- ============================================================
-- USJ Technologies — Migration: Abandoned Carts View + pg_cron
-- ============================================================

-- ── Abandoned Carts View ────────────────────────────────────
-- Unions guest abandoned carts (from cart_leads) and logged-in
-- abandoned carts (from cart_items) into a single admin view.
--
-- A cart is "abandoned" if no quote_requests row exists for
-- that person within 24 hours of the cart activity.
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE VIEW abandoned_carts_view AS

-- Guest abandoned: cart_leads with no matching quote_requests by phone
SELECT
  cl.id,
  cl.name,
  cl.phone,
  cl.user_id,
  cl.created_at,
  'guest' AS user_type,
  COALESCE(
    json_agg(
      json_build_object(
        'id', gci.id,
        'product_name', gci.product_name,
        'brand_name', gci.brand_name,
        'image_url', gci.image_url,
        'quantity', gci.quantity
      )
    ) FILTER (WHERE gci.id IS NOT NULL),
    '[]'::json
  ) AS items
FROM cart_leads cl
LEFT JOIN guest_cart_items gci ON gci.lead_id = cl.id
WHERE NOT EXISTS (
  SELECT 1 FROM quote_requests qr
  WHERE qr.phone = cl.phone
    AND qr.created_at >= cl.created_at
)
AND cl.created_at <= NOW() - INTERVAL '24 hours'
GROUP BY cl.id, cl.name, cl.phone, cl.user_id, cl.created_at

UNION ALL

-- Logged-in abandoned: cart_items with no quote_requests from that user
-- after the cart item was added (24h+ window)
SELECT
  ci.user_id AS id,
  COALESCE(p_profile.name, p_profile.email, 'Unknown') AS name,
  COALESCE(p_profile.phone, '') AS phone,
  ci.user_id,
  MIN(ci.created_at) AS created_at,
  'registered' AS user_type,
  COALESCE(
    json_agg(
      json_build_object(
        'id', ci.id,
        'product_name', prod.name,
        'brand_name', prod.brand_name,
        'image_url', prod.primary_image_url,
        'quantity', ci.quantity
      )
    ) FILTER (WHERE ci.id IS NOT NULL),
    '[]'::json
  ) AS items
FROM cart_items ci
JOIN products prod ON prod.id = ci.product_id
JOIN profiles p_profile ON p_profile.id = ci.user_id
WHERE NOT EXISTS (
  SELECT 1 FROM quote_requests qr
  WHERE qr.user_id = ci.user_id
    AND qr.created_at >= ci.created_at
)
AND ci.created_at <= NOW() - INTERVAL '24 hours'
GROUP BY ci.user_id, p_profile.name, p_profile.email, p_profile.phone;

-- ── pg_cron schedule (optional — requires pg_cron extension) ─
-- Uncomment the following lines if pg_cron is enabled on your Supabase plan.
-- This schedules a daily invocation of the send-abandoned-cart-email function.
--
-- SELECT cron.schedule(
--   'daily-abandoned-cart-email',
--   '0 9 * * *',  -- 9:00 AM UTC daily (2:30 PM IST)
--   $$
--   SELECT net.http_post(
--     url := current_setting('app.settings.supabase_url') || '/functions/v1/send-abandoned-cart-email',
--     headers := jsonb_build_object(
--       'Content-Type', 'application/json',
--       'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
--     ),
--     body := '{}'::jsonb
--   );
--   $$
-- );
