import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { applyRulesServer } from "@/lib/rules/apply-server";
import type { Rule } from "@/lib/types/rules";

// ─── GET /api/cron/apply-rules ────────────────────────────────────────────────
// Server-side rules sweep. For each user with active rules, applies them to
// recently-synced inbox emails (idempotent via RuleExecution). Runs every
// minute after the sync cron so incoming mail is auto-processed without the
// inbox being open. Auth: Bearer CRON_SECRET.

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Only look at recently-synced mail so the sweep stays cheap.
const LOOKBACK_MS = 24 * 60 * 60 * 1000;
const PER_ACCOUNT_LIMIT = 200;

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
  }
  if (req.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Users who have at least one active rule.
  const ruleRows = await prisma.emailRule.findMany({
    where: { active: true },
    orderBy: [{ userId: "asc" }, { priority: "asc" }],
  });
  if (ruleRows.length === 0) {
    return NextResponse.json({ ok: true, note: "no active rules", totals: {} });
  }

  const rulesByUser = new Map<string, Rule[]>();
  for (const r of ruleRows) {
    const list = rulesByUser.get(r.userId) ?? [];
    list.push({
      id: r.id,
      name: r.name,
      priority: r.priority,
      active: r.active,
      conditions: (r.conditions as unknown as Rule["conditions"]) ?? [],
      actions: (r.actions as unknown as Rule["actions"]) ?? [],
      emailCount: r.emailCount,
      stopProcessing: r.stopProcessing,
    });
    rulesByUser.set(r.userId, list);
  }

  const since = new Date(Date.now() - LOOKBACK_MS);
  const totals = { processed: 0, matched: 0, actionsRun: 0, errors: 0, users: 0 };

  for (const [userId, rules] of rulesByUser) {
    totals.users++;
    // Inbox folders for this user, per account. Many synced folders never get
    // wellKnownName populated (Graph doesn't $select it reliably), so also match
    // the folder literally named "Inbox" — otherwise most accounts are skipped.
    const inboxFolders = await prisma.cachedFolder.findMany({
      where: {
        userId,
        OR: [
          { wellKnownName: "inbox" },
          { displayName: { equals: "Inbox", mode: "insensitive" } },
        ],
      },
      select: { id: true, homeAccountId: true },
    });

    for (const folder of inboxFolders) {
      // Candidate emails: recently synced, in this inbox, not yet processed by
      // every rule. We over-select and let RuleExecution dedupe per rule.
      const rows = await prisma.cachedEmail.findMany({
        where: {
          userId,
          homeAccountId: folder.homeAccountId,
          folderId: folder.id,
          syncedAt: { gte: since },
        },
        select: {
          id: true, homeAccountId: true, subject: true, bodyPreview: true,
          fromName: true, fromAddress: true, toRecipients: true, isRead: true,
        },
        orderBy: { syncedAt: "desc" },
        take: PER_ACCOUNT_LIMIT,
      });
      if (rows.length === 0) continue;

      try {
        const r = await applyRulesServer(userId, folder.homeAccountId, rows, rules);
        totals.processed += r.processed;
        totals.matched += r.matched;
        totals.actionsRun += r.actionsRun;
        totals.errors += r.errors;
      } catch (e) {
        totals.errors++;
        console.error(`[cron/apply-rules] user ${userId} account ${folder.homeAccountId}:`, (e as Error).message);
      }
    }
  }

  return NextResponse.json({ ok: true, totals });
}
