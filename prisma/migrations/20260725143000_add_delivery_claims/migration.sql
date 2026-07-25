-- Add durable delivery claims for scheduled drafts and undo-send emails.
ALTER TABLE "drafts"
  ADD COLUMN IF NOT EXISTS "scheduleLastError" TEXT;

ALTER TABLE "pending_emails"
  ADD COLUMN IF NOT EXISTS "deliveryStatus" TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS "claimedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "attemptCount" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "lastError" TEXT,
  ADD COLUMN IF NOT EXISTS "deliveredAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX IF NOT EXISTS "pending_emails_deliveryStatus_sendAt_claimedAt_idx"
  ON "pending_emails"("deliveryStatus", "sendAt", "claimedAt");

-- Rule executions double as distributed claims. completedActions lets a retry
-- resume without repeating actions that already succeeded.
ALTER TABLE "rule_executions"
  ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'processing',
  ADD COLUMN IF NOT EXISTS "completedActions" JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS "claimedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "attemptCount" INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS "lastError" TEXT,
  ADD COLUMN IF NOT EXISTS "completedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Rows created before this migration represent completed executions.
UPDATE "rule_executions"
SET "status" = 'completed',
    "completedAt" = COALESCE("completedAt", "createdAt")
WHERE "status" = 'processing';
