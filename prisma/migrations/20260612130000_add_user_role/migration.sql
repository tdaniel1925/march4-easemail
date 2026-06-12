-- RBAC role on users. Idempotent (applied via /api/cron/migrate through the pooler).
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "role" TEXT NOT NULL DEFAULT 'member';
CREATE INDEX IF NOT EXISTS "users_orgId_role_idx" ON "users"("orgId", "role");
