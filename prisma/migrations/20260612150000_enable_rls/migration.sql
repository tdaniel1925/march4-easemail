-- ─── Row-Level Security (defense-in-depth tenant isolation) ──────────────────
--
-- Enables RLS on every tenant-scoped table and adds a policy that restricts
-- rows to the current request's user, read from the `app.current_user_id`
-- session GUC (set per-transaction by the GUC-wrapped Prisma client).
--
-- IMPORTANT: this is enforced ONLY for DB roles that do NOT have BYPASSRLS.
-- The app currently connects as `postgres` (BYPASSRLS = true), so these
-- policies are DORMANT until/unless the app is switched to a constrained role.
-- That cutover is intentionally NOT part of this migration. These policies are
-- harmless to existing access (the current role bypasses them) and provide the
-- enforcement layer the moment a non-bypassing role is used.
--
-- Idempotent: safe to re-run (applied via /api/cron/migrate through the pooler).

-- Helper: current user id from the request GUC (empty string when unset).
CREATE OR REPLACE FUNCTION app_current_user_id() RETURNS text
  LANGUAGE sql STABLE AS $$ SELECT current_setting('app.current_user_id', true) $$;

-- Helper: current org id from the request GUC (set alongside user id).
CREATE OR REPLACE FUNCTION app_current_org_id() RETURNS text
  LANGUAGE sql STABLE AS $$ SELECT current_setting('app.current_org_id', true) $$;

-- ── User-scoped tables: a row is visible iff its userId matches the GUC. ──────
DO $$
DECLARE
  t text;
  user_tables text[] := ARRAY[
    'ai_generated_replies','cached_calendar_events','cached_contacts','cached_emails',
    'cached_folders','cached_search_results','drafts','email_attachments',
    'email_delta_links','email_rules','email_templates','follow_up_reminders',
    'imap_connected_accounts','jmap_connected_accounts','migration_status',
    'ms_connected_accounts','msal_token_cache','notification_log','pending_emails',
    'read_receipts','signatures','snoozed_emails','sync_status','todo_items',
    'webhook_subscriptions'
  ];
BEGIN
  FOREACH t IN ARRAY user_tables LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS tenant_isolation ON %I', t);
    EXECUTE format(
      'CREATE POLICY tenant_isolation ON %I USING ("userId" = app_current_user_id()) WITH CHECK ("userId" = app_current_user_id())',
      t
    );
  END LOOP;
END $$;

-- ── audit_logs / legal_holds: userId may be NULL (system rows). Owner sees
--    their own rows; NULL-user rows are visible to all (system/global events). ─
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['audit_logs','legal_holds'] LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS tenant_isolation ON %I', t);
    EXECUTE format(
      'CREATE POLICY tenant_isolation ON %I USING ("userId" IS NULL OR "userId" = app_current_user_id())',
      t
    );
  END LOOP;
END $$;

-- ── Org-scoped tables: visible iff orgId matches the request's org GUC. ──────
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['org_contacts','retention_policies'] LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS tenant_isolation ON %I', t);
    EXECUTE format(
      'CREATE POLICY tenant_isolation ON %I USING ("orgId" = app_current_org_id()) WITH CHECK ("orgId" = app_current_org_id())',
      t
    );
  END LOOP;
END $$;

-- ── users: a user may see their own row OR co-members of their org. ──────────
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE users FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON users;
CREATE POLICY tenant_isolation ON users
  USING (id = app_current_user_id() OR "orgId" = app_current_org_id())
  WITH CHECK (id = app_current_user_id());

-- organizations: a user may see their own org row.
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON organizations;
CREATE POLICY tenant_isolation ON organizations
  USING (id = app_current_org_id());
