import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getActivePolicies, getHeldUserIds } from "@/lib/retention";
import { audit } from "@/lib/audit";

// ─── GET /api/cron/retention ──────────────────────────────────────────────────
// Enforces per-org data-retention windows by purging cached data older than the
// configured number of days. Users under an active legal hold are ALWAYS
// skipped. A window of 0 means "keep forever" and is a no-op.
//
// Auth: Bearer CRON_SECRET. Idempotent and safe to run repeatedly.

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function cutoff(days: number): Date | null {
  if (!days || days <= 0) return null;
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
  }
  if (req.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const policies = await getActivePolicies();
  if (policies.length === 0) {
    return NextResponse.json({ ok: true, note: "no retention policies configured", purged: {} });
  }

  const heldUserIds = await getHeldUserIds();

  const totals = { emails: 0, calendar: 0, contacts: 0, auditLogs: 0, orgsProcessed: 0, usersSkippedOnHold: 0 };

  for (const policy of policies) {
    // Users in this org, minus anyone under legal hold.
    const orgUsers = await prisma.user.findMany({
      where: { orgId: policy.orgId },
      select: { id: true },
    });
    const eligibleUserIds = orgUsers.map((u) => u.id).filter((id) => !heldUserIds.has(id));
    totals.usersSkippedOnHold += orgUsers.length - eligibleUserIds.length;
    if (eligibleUserIds.length === 0) continue;
    totals.orgsProcessed++;

    const emailCut = cutoff(policy.cachedEmailDays);
    if (emailCut) {
      const r = await prisma.cachedEmail.deleteMany({
        where: { userId: { in: eligibleUserIds }, receivedDateTime: { lt: emailCut } },
      });
      totals.emails += r.count;
    }

    const calCut = cutoff(policy.cachedCalendarDays);
    if (calCut) {
      const r = await prisma.cachedCalendarEvent.deleteMany({
        where: { userId: { in: eligibleUserIds }, endDateTime: { lt: calCut } },
      });
      totals.calendar += r.count;
    }

    const contactCut = cutoff(policy.cachedContactDays);
    if (contactCut) {
      const r = await prisma.cachedContact.deleteMany({
        where: { userId: { in: eligibleUserIds }, updatedAt: { lt: contactCut } },
      });
      totals.contacts += r.count;
    }

    // Audit-log retention is org-scoped by the org's user ids (+ null-user system
    // events are never purged here — they are kept until an explicit policy).
    const auditCut = cutoff(policy.auditLogDays);
    if (auditCut) {
      const r = await prisma.auditLog.deleteMany({
        where: { userId: { in: eligibleUserIds }, createdAt: { lt: auditCut } },
      });
      totals.auditLogs += r.count;
    }
  }

  if (totals.emails + totals.calendar + totals.contacts + totals.auditLogs > 0) {
    void audit({
      action: "retention.purge",
      metadata: { ...totals },
    });
  }

  return NextResponse.json({ ok: true, purged: totals });
}
