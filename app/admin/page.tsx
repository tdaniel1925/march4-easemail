import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { isAdminEmail } from "@/lib/admin";
import Sidebar from "@/components/Sidebar";
import { StoreInitializer } from "@/components/StoreInitializer";
import AdminClient from "@/components/admin/AdminClient";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (!isAdminEmail(user.email ?? "")) redirect("/inbox");

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { msAccounts: { orderBy: { isDefault: "desc" } } },
  });
  if (!dbUser) redirect("/onboarding");
  const defaultAccount = dbUser.msAccounts[0];

  // ── All users with their connected accounts ─────────────────────────────────
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      msAccounts: {
        select: { homeAccountId: true, msEmail: true, isDefault: true, connectedAt: true },
        orderBy: { isDefault: "desc" },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  // ── Sync stats — cached item counts per user ─────────────────────────────────
  const [emailCounts, calCounts, contactCounts] = await Promise.all([
    prisma.cachedEmail.groupBy({ by: ["userId"], _count: { id: true } }),
    prisma.cachedCalendarEvent.groupBy({ by: ["userId"], _count: { id: true } }),
    prisma.cachedContact.groupBy({ by: ["userId"], _count: { id: true } }),
  ]);

  const syncStats = users.map((u) => ({
    userId: u.id,
    email: u.email,
    cachedEmails: emailCounts.find((r) => r.userId === u.id)?._count.id ?? 0,
    cachedCalEvents: calCounts.find((r) => r.userId === u.id)?._count.id ?? 0,
    cachedContacts: contactCounts.find((r) => r.userId === u.id)?._count.id ?? 0,
  }));

  // ── Email rules across all users ─────────────────────────────────────────────
  const emailRules = await prisma.emailRule.findMany({
    include: { user: { select: { email: true, name: true } } },
    orderBy: [{ userId: "asc" }, { priority: "asc" }],
  });

  // ── Signatures across all users ──────────────────────────────────────────────
  const signatures = await prisma.signature.findMany({
    include: { user: { select: { id: true, email: true, name: true } } },
    orderBy: [{ userId: "asc" }, { isDefault: "desc" }, { createdAt: "asc" }],
  });

  const userName = dbUser.name ?? defaultAccount?.displayName ?? user.email ?? "You";

  return (
    <div className="flex" style={{ height: "100vh", overflow: "hidden" }}>
      <StoreInitializer accounts={dbUser.msAccounts} inboxUnread={0} />
      <Sidebar
        userName={userName}
        userEmail={defaultAccount?.msEmail ?? user.email ?? ""}
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
