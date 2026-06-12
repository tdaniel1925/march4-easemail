import { prisma } from "@/lib/prisma";

/**
 * Data-retention + legal-hold helpers.
 *
 * Retention purges cached data older than a per-org window. Legal hold is
 * absolute: while ANY active hold covers a user (directly or via a whole-org
 * hold), that user's data is NEVER purged, regardless of the retention window.
 */

/** Returns the set of userIds currently under an active legal hold. */
export async function getHeldUserIds(): Promise<Set<string>> {
  const holds = await prisma.legalHold.findMany({
    where: { releasedAt: null },
    select: { orgId: true, userId: true },
  });

  const held = new Set<string>();
  const heldOrgIds: string[] = [];
  for (const h of holds) {
    if (h.userId) held.add(h.userId);
    else heldOrgIds.push(h.orgId); // whole-org hold
  }

  if (heldOrgIds.length > 0) {
    const orgUsers = await prisma.user.findMany({
      where: { orgId: { in: heldOrgIds } },
      select: { id: true },
    });
    for (const u of orgUsers) held.add(u.id);
  }
  return held;
}

/** True if the given user is covered by any active legal hold. */
export async function isUserUnderHold(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { orgId: true } });
  if (!user) return false;
  const hold = await prisma.legalHold.findFirst({
    where: {
      releasedAt: null,
      OR: [{ userId }, { userId: null, orgId: user.orgId }],
    },
    select: { id: true },
  });
  return !!hold;
}

export interface RetentionPolicyView {
  cachedEmailDays: number;
  cachedCalendarDays: number;
  cachedContactDays: number;
  auditLogDays: number;
}

/** Returns each org's retention policy (only orgs that have one set). */
export async function getActivePolicies(): Promise<
  Array<{ orgId: string } & RetentionPolicyView>
> {
  const policies = await prisma.retentionPolicy.findMany();
  return policies.map((p) => ({
    orgId: p.orgId,
    cachedEmailDays: p.cachedEmailDays,
    cachedCalendarDays: p.cachedCalendarDays,
    cachedContactDays: p.cachedContactDays,
    auditLogDays: p.auditLogDays,
  }));
}
