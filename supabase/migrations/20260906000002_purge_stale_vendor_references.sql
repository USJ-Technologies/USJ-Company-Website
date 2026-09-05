-- ============================================================
-- USJ Technologies — Migration: purge stale "vendor" references
-- from function bodies
--
-- SYMPTOM
--   Approving or rejecting a USJ Partner in the admin UI fails with
--   `column "vendor_id" does not exist`, even though the schema is
--   fully renamed (verified against the live project: no `vendors`
--   table, and no `vendor_id` on profiles / products / order_items).
--
-- CAUSE
--   `ALTER TABLE ... RENAME COLUMN` in 20260903000001 rewrote every
--   dependent *parse tree* — RLS policies, CHECK constraints, defaults,
--   indexes, views. It did NOT rewrite function bodies, because plpgsql
--   and sql function bodies are stored as plain text and are only
--   re-parsed when the function next runs.
--
--   So any function that still spells `vendor_id` or `vendors` compiled
--   fine at rename time and only blows up when something calls it —
--   here, a trigger firing on the UPDATE inside set_partner_status().
--
-- FIX
--   1. Drop the legacy helpers the rename superseded (idempotent —
--      20260903000001 already drops these; repeated here because this
--      migration must be able to run standalone).
--   2. Rewrite any *remaining* public function whose body still names
--      `vendor_id` / `vendors`, by round-tripping pg_get_functiondef()
--      through a textual substitution and re-issuing it.
--
--      This is safe because the DB provably has no `vendor_id` column
--      and no `vendors` table: every function matched here is already
--      broken, so a rewrite can only ever improve it. And it is
--      all-or-nothing — the loop runs inside the transaction below, so
--      if any rewritten body fails to compile the whole migration rolls
--      back and nothing changes.
--
--   Policies are reported but never dropped: a leftover `vendor_*`
--   policy cannot cause this error (its expression was auto-rewritten),
--   and silently removing a security policy is not something a bug fix
--   should do.
--
-- Run in Supabase SQL Editor. Idempotent — safe to re-run.
-- ============================================================

BEGIN;

-- ------------------------------------------------------------
-- 1. Legacy helpers replaced by is_usj_partner() /
--    is_approved_usj_partner() / get_partner_id() /
--    close_usj_partner_for_account_deletion()
-- ------------------------------------------------------------
DROP FUNCTION IF EXISTS public.is_vendor();
DROP FUNCTION IF EXISTS public.is_approved_vendor();
DROP FUNCTION IF EXISTS public.get_vendor_id();
DROP FUNCTION IF EXISTS public.close_vendor_for_account_deletion(UUID);

-- ------------------------------------------------------------
-- 2. Rewrite whatever is left
--
--    Substring replace, not word-boundary replace: a parameter named
--    `p_vendor_id` has to move to `p_partner_id` in both its
--    declaration and its uses, or the rewritten body won't compile.
--    `vendor_id` is replaced before `vendors` so the longer token wins.
-- ------------------------------------------------------------
DO $do$
DECLARE
  r       RECORD;
  new_def TEXT;
  n       INT := 0;
BEGIN
  FOR r IN
    SELECT p.oid,
           p.proname,
           pg_get_function_identity_arguments(p.oid) AS args,
           pg_get_functiondef(p.oid)                 AS def
    FROM pg_proc p
    JOIN pg_namespace ns ON ns.oid = p.pronamespace
    WHERE ns.nspname = 'public'
      AND p.prokind  = 'f'                -- plain functions only; pg_get_functiondef() errors on aggregates
      AND (p.prosrc LIKE '%vendor_id%' OR p.prosrc LIKE '%vendors%')
  LOOP
    new_def := replace(replace(r.def, 'vendor_id', 'partner_id'), 'vendors', 'usj_partners');

    RAISE NOTICE 'Rewriting stale function: public.%(%)', r.proname, r.args;
    EXECUTE new_def;
    n := n + 1;
  END LOOP;

  IF n = 0 THEN
    RAISE NOTICE 'No function bodies still reference vendor_id / vendors.';
  ELSE
    RAISE NOTICE 'Rewrote % function(s).', n;
  END IF;
END
$do$;

COMMIT;

-- ============================================================
-- Verification — every one of these should come back empty
-- (except the last two, which are informational)
-- ============================================================

-- (a) Functions whose body still mentions vendor in any form.
--     Anything left here needs a hand-written fix; paste it back.
SELECT n.nspname       AS schema,
       p.proname       AS function,
       pg_get_function_identity_arguments(p.oid) AS args,
       pg_get_functiondef(p.oid)                 AS definition
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname NOT IN ('pg_catalog', 'information_schema')
  AND p.prokind = 'f'
  AND p.prosrc ILIKE '%vendor%'
ORDER BY 1, 2;

-- (b) Any column anywhere still called vendor_id
SELECT table_schema, table_name, column_name
FROM information_schema.columns
WHERE column_name = 'vendor_id';

-- (c) Leftover vendor-era policies (reported, not dropped)
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies
WHERE policyname ILIKE '%vendor%'
ORDER BY 1, 2, 3;

-- (d) Informational: every trigger that fires on the tables
--     set_partner_status() writes to. This is what actually runs
--     during approve / reject.
SELECT c.relname  AS table_name,
       t.tgname   AS trigger_name,
       p.proname  AS function_name,
       t.tgenabled AS enabled
FROM pg_trigger t
JOIN pg_class  c ON c.oid = t.tgrelid
JOIN pg_proc   p ON p.oid = t.tgfoid
WHERE NOT t.tgisinternal
  AND c.relname IN ('usj_partners', 'profiles', 'products', 'order_items')
ORDER BY 1, 2;

-- (e) Informational: the live body of the review RPC, to confirm it
--     matches 20260906000001 and nothing has replaced it.
SELECT pg_get_functiondef(p.oid) AS set_partner_status_definition
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public' AND p.proname = 'set_partner_status';
