-- Add missing indexes for hot query paths
CREATE INDEX IF NOT EXISTS "drafts_userId_updatedAt_idx" ON "drafts"("userId", "updatedAt" DESC);
CREATE INDEX IF NOT EXISTS "drafts_scheduledAt_scheduledSent_idx" ON "drafts"("scheduledAt", "scheduledSent");
CREATE INDEX IF NOT EXISTS "cached_emails_userId_conversationId_idx" ON "cached_emails"("userId", "conversationId");
