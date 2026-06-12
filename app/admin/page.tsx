import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getUserWithAccounts } from "@/lib/utils/get-user-accounts";
import { getAuthContext, roleAtLeast } from "@/lib/rbac";
import Sidebar from "@/components/Sidebar";
import { StoreInitializer } from "@/components/StoreInitializer";
import AdminClient from "@/components/admin/AdminClient";
import { getUnreadCount } from "@/lib/utils/get-unread-count";

export default async function AdminPage() {
  const ctx = await getAuthContext();
  if (!ctx) redirect("/login");
  // org_admin and super_admin may enter; members are bounced.
  if (!roleAtLeast(ctx.role, "org_admin")) redirect("/inbox");
  const user = { id: ctx.userId, email: ctx.email };

  const dbUser = await getUserWithAccounts(user.id);
  if (!dbUser) redirect("/onboarding");
  const defaultAccount = dbUser.defaultAccount;
  if (!defaultAccount) redirect("/onboarding");

  // Scope every cross-user query to the admin's org unless super_admin.
  const isSuper = ctx.role === "super_admin";
  const orgScope = isSuper ? {} : { orgId: ctx.orgId };
  const userOrgScope = isSuper ? {} : { user: { orgId: ctx.orgId } };

  // ── Users with their connected accounts (org-scoped) ────────────────────────
  const users = await prisma.user.findMany({
    where: orgScope,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      msAccounts: {
        select: { homeAccountId: true, msEmail: true, isDefault: true, connectedAt: true },
        orderBy: { isDefault: "desc" },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  // ── Sync stats — cached item counts per in-scope user ───────────────────────
  const scopedUserIds = users.map((u) => u.id);
  const countScope = isSuper ? {} : { userId: { in: scopedUserIds } };
  const [emailCounts, calCounts, contactCounts] = await Promise.all([
    prisma.cachedEmail.groupBy({ by: ["userId"], where: countScope, _count: { id: true } }),
    prisma.cachedCalendarEvent.groupBy({ by: ["userId"], where: countScope, _count: { id: true } }),
    prisma.cachedContact.groupBy({ by: ["userId"], where: countScope, _count: { id: true } }),
  ]);

  const syncStats = users.map((u) => ({
    userId: u.id,
    email: u.email,
    cachedEmails: emailCounts.find((r) => r.userId === u.id)?._count.id ?? 0,
    cachedCalEvents: calCounts.find((r) => r.userId === u.id)?._count.id ?? 0,
    cachedContacts: contactCounts.find((r) => r.userId === u.id)?._count.id ?? 0,
  }));

  // ── Email rules (org-scoped) ─────────────────────────────────────────────────
  const emailRules = await prisma.emailRule.findMany({
    where: userOrgScope,
    include: { user: { select: { email: true, name: true } } },
    orderBy: [{ userId: "asc" }, { priority: "asc" }],
  });

  // ── Signatures (org-scoped) ──────────────────────────────────────────────────
  const signatures = await prisma.signature.findMany({
    where: userOrgScope,
    include: { user: { select: { id: true, email: true, name: true } } },
    orderBy: [{ userId: "asc" }, { isDefault: "desc" }, { createdAt: "asc" }],
  });

  const userName = dbUser.name ?? defaultAccount?.displayName ?? user.email ?? "You";

  const unreadCount = await getUnreadCount(user.id, defaultAccount.homeAccountId);

  return (
    <div className="flex" style={{ height: "100vh", overflow: "hidden" }}>
      <StoreInitializer accounts={dbUser.msAccounts} imapAccounts={dbUser.imapAccounts} jmapAccounts={dbUser.jmapAccounts} inboxUnread={unreadCount} />
      <Sidebar
        userName={userName}
        userEmail={defaultAccount?.email ?? user.email ?? ""}
        isAdmin
      />
      <AdminClient
        users={users.map((u) => ({
          ...u,
          createdAt: u.createdAt.toISOString(),
          msAccounts: u.msAccounts.map((a) => ({
            ...a,
            connectedAt: a.connectedAt.toISOString(),
          })),
        }))}
        syncStats={syncStats}
        emailRules={emailRules.map((r) => ({
          id: r.id,
          name: r.name,
          active: r.active,
          priority: r.priority,
          emailCount: r.emailCount,
          userId: r.userId,
          userEmail: r.user.email,
          userName: r.user.name ?? r.user.email,
        }))}
        signatures={signatures.map((s) => ({
          id: s.id,
          userId: s.userId,
          name: s.name,
          title: s.title ?? "",
          company: s.company ?? "",
          phone: s.phone ?? "",
          isDefault: s.isDefault,
          userEmail: s.user.email,
          userName: s.user.name ?? s.user.email,
        }))}
      />
    </div>
  );
}
