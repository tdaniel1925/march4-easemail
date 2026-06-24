/**
 * Server-side rules engine.
 *
 * Runs a user's active rules against cached emails and executes the matching
 * actions THROUGH THE PROVIDER (Microsoft / IMAP / JMAP), so every action hits
 * the real mailbox AND updates the local cache — the inbox reflects it
 * immediately. This is the authoritative execution path; the client-side
 * applyRules is only an optimistic preview.
 *
 * Idempotency: each (emailId, ruleId) pair is recorded in RuleExecution so a
 * rule never re-fires on the same message across sync runs.
 */

import { prisma } from "@/lib/prisma";
import { getProvider } from "@/lib/providers/registry";
import { matchesConditions } from "@/lib/utils/rule-engine";
import type { Rule } from "@/lib/types/rules";
import type { EmailMessage } from "@/lib/types/email";

/** Minimal cached-email shape we need to evaluate + act on a message. */
interface CachedEmailRow {
  id: string;
  homeAccountId: string;
  subject: string;
  bodyPreview: string;
  fromName: string;
  fromAddress: string;
  toRecipients: unknown;
  isRead: boolean;
}

/** Build the EmailMessage shape the pure matcher expects from a cache row. */
function toEmailMessage(row: CachedEmailRow): EmailMessage {
  const to = Array.isArray(row.toRecipients)
    ? (row.toRecipients as { name?: string; address?: string }[]).map((r) => ({
        name: r.name ?? "",
        address: r.address ?? "",
      }))
    : [];
  return {
    id: row.id,
    subject: row.subject ?? "",
    bodyPreview: row.bodyPreview ?? "",
    from: { name: row.fromName ?? "", address: row.fromAddress ?? "" },
    toRecipients: to,
    isRead: row.isRead,
    receivedDateTime: "",
    sentDateTime: "",
    hasAttachments: false,
    flag: { flagStatus: "notFlagged" },
  } as EmailMessage;
}

/** Resolve a folder target from a rule action value (folder id or name). */
async function resolveFolderId(
  userId: string,
  accountId: string,
  value: string | undefined,
  fallbackWellKnown: string | null
): Promise<string | null> {
  if (value?.trim()) {
    // value may be a folder id (`accountId:...` / Graph id) or a folder name.
    const byId = await prisma.cachedFolder.findFirst({
      where: { userId, homeAccountId: accountId, id: value.trim() },
      select: { id: true },
    });
    if (byId) return byId.id;
    const byName = await prisma.cachedFolder.findFirst({
      where: { userId, homeAccountId: accountId, displayName: { equals: value.trim(), mode: "insensitive" } },
      select: { id: true },
    });
    if (byName) return byName.id;
    // Not found — create it on the provider + cache, then use it.
    try {
      const provider = getProvider(accountId);
      const created = await provider.createFolder(userId, accountId, value.trim(), null);
      await prisma.cachedFolder.upsert({
        where: { id: created.id },
        update: { userId, homeAccountId: accountId, displayName: created.displayName, parentFolderId: created.parentFolderId },
        create: {
          id: created.id, userId, homeAccountId: accountId,
          displayName: created.displayName, parentFolderId: created.parentFolderId,
          unreadCount: 0, totalCount: 0, wellKnownName: null,
        },
      });
      return created.id;
    } catch (e) {
      console.error("[rules] createFolder failed:", (e as Error).message);
      return null;
    }
  }
  // No explicit target — fall back to a well-known folder (e.g. archive for skip_inbox).
  if (fallbackWellKnown) {
    const wk = await prisma.cachedFolder.findFirst({
      where: { userId, homeAccountId: accountId, wellKnownName: fallbackWellKnown },
      select: { id: true },
    });
    return wk?.id ?? null;
  }
  return null;
}

export interface ServerApplyResult {
  processed: number;
  matched: number;
  actionsRun: number;
  errors: number;
}

/**
 * Apply active rules to the given cached emails for one account.
 * Pass the rows you want evaluated (e.g. newly-synced inbox messages).
 */
export async function applyRulesServer(
  userId: string,
  accountId: string,
  rows: CachedEmailRow[],
  rules: Rule[]
): Promise<ServerApplyResult> {
  const result: ServerApplyResult = { processed: 0, matched: 0, actionsRun: 0, errors: 0 };
  const active = rules.filter((r) => r.active).sort((a, b) => a.priority - b.priority);
  if (active.length === 0) return result;

  const provider = getProvider(accountId);

  for (const row of rows) {
    result.processed++;
    const email = toEmailMessage(row);

    for (const rule of active) {
      if (!matchesConditions(email, rule.conditions)) continue;

      // Idempotency guard — skip if this rule already ran on this email.
      const already = await prisma.ruleExecution.findUnique({
        where: { ruleId_emailId: { ruleId: rule.id, emailId: row.id } },
      }).catch(() => null);
      if (already) continue;

      result.matched++;
      let ran = false;
      let moved = false;

      for (const action of rule.actions) {
        try {
          switch (action.type) {
            case "mark_read":
              await provider.markRead(userId, accountId, row.id, true);
              ran = true;
              break;
            case "mark_important":
              await provider.flagMessage(userId, accountId, row.id, true);
              ran = true;
              break;
            case "label":
              if (action.value?.trim()) {
                await provider.addCategories(userId, accountId, row.id, [action.value.trim()]);
                ran = true;
              }
              break;
            case "forward":
              if (action.value?.trim()) {
                await provider.forwardMessage(userId, accountId, row.id, action.value.trim());
                ran = true;
              }
              break;
            case "move_to_folder":
            case "skip_inbox": {
              if (moved) break; // a message can only live in one folder
              const fallback = action.type === "skip_inbox" ? "archive" : null;
              const dest = await resolveFolderId(userId, accountId, action.value, fallback);
              if (dest) {
                await provider.moveMessage(userId, accountId, row.id, dest);
                ran = true;
                moved = true;
              }
              break;
            }
            case "archive": {
              if (moved) break;
              const dest = await resolveFolderId(userId, accountId, undefined, "archive");
              if (dest) { await provider.moveMessage(userId, accountId, row.id, dest); moved = true; }
              ran = true;
              break;
            }
            case "delete":
              if (!moved) { await provider.deleteMessage(userId, accountId, row.id); moved = true; }
              ran = true;
              break;
          }
          if (ran) result.actionsRun++;
        } catch (e) {
          result.errors++;
          console.error(`[rules] action ${action.type} failed on ${row.id}:`, (e as Error).message);
        }
      }

      // Record execution (idempotency) + bump the rule's match tally.
      await prisma.ruleExecution.create({
        data: { ruleId: rule.id, emailId: row.id, userId },
      }).catch(() => {});
      await prisma.emailRule.updateMany({
        where: { id: rule.id, userId },
        data: { emailCount: { increment: 1 } },
      }).catch(() => {});

      if (rule.stopProcessing || moved) break;
    }
  }

  return result;
}
