import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { getUserWithAccounts } from "@/lib/utils/get-user-accounts";
import { getActiveAccountId } from "@/lib/utils/get-active-account";
import { getUnreadCount } from "@/lib/utils/get-unread-count";
import { prisma } from "@/lib/prisma";
import { graphGet } from "@/lib/microsoft/graph";
import { mapCachedEmail, mapGraphMessage } from "@/lib/utils/email-helpers";
import { detectProviderType, getProvider } from "@/lib/providers/registry";
import Sidebar from "@/components/Sidebar";
import { StoreInitializer } from "@/components/StoreInitializer";
import AppShell from "@/components/AppShell";
import { pathToView, type AppView } from "@/lib/stores/data-cache";
import type { EmailMessage } from "@/lib/types/email";
import type {
  CalEvent,
  GraphCalEventList,
} from "@/lib/types/calendar";
import { mapGraphEvent, CALENDAR_SELECT } from "@/lib/types/calendar";
import type { GraphMessagesResponse } from "@/lib/types/graph";

// ─── Graph shapes for dashboard ──────────────────────────────────────────────

interface GraphEventList {
  value: {
    id: string;
    subject: string;
    start: { dateTime: string; timeZone: string };
    end: { dateTime: string; timeZone: string };
    location?: { displayName: string };
    attendees?: { emailAddress: { name: string } }[];
  }[];
}

interface GraphMessageList {
  value: {
    id: string;
    subject: string;
    bodyPreview: string;
    receivedDateTime: string;
    isRead: boolean;
    hasAttachments: boolean;
    flag: { flagStatus: string };
    from: { emailAddress: { name: string; address: string } };
    toRecipients: { emailAddress: { name: string; address: string } }[];
    ccRecipients: { emailAddress: { name: string; address: string } }[];
  }[];
}

// ─── Layout ──────────────────────────────────────────────────────────────────

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const dbUser = await getUserWithAccounts(user.id);
  if (!dbUser) redirect("/onboarding");

  const dbDefault = dbUser.defaultAccount;
  if (!dbDefault) redirect("/onboarding");

  const savedAccountId = await getActiveAccountId();
  const activeAccount = (savedAccountId
    ? dbUser.allAccounts.find((a) => a.homeAccountId === savedAccountId)
    : null) ?? dbDefault;

  const userName = dbUser.name ?? activeAccount.displayName ?? user.email ?? "You";
  const userTimeZone = dbUser.preferredTimeZone || "America/Chicago";

  // Determine initial view from the request URL
  const headersList = await headers();
  const url = headersList.get("x-url") || headersList.get("x-invoke-path") || "";
  const pathname = url ? new URL(url, "http://localhost").pathname : "/inbox";
  const { view: initialView, folderId: initialFolderId, emailId: initialEmailId } = pathToView(pathname);

  // ── Fetch all initial data in parallel ─────────────────────────────────────
  const providerType = detectProviderType(activeAccount.homeAccountId);

  // Shared promises to avoid duplicate queries
  const sharedUnreadPromise = getUnreadCount(user.id, activeAccount.homeAccountId).catch(() => 0);
  const sharedInboxFolderPromise = prisma.cachedFolder.findFirst({
    where: { userId: user.id, homeAccountId: activeAccount.homeAccountId, wellKnownName: "inbox" },
  }).catch(() => null);

  // Inbox data
  const inboxPromise = (async (): Promise<{ emails: EmailMessage[]; nextLink: string | null; unreadCount: number }> => {
    try {
      const [inboxFolder, unreadCount] = await Promise.all([
        sharedInboxFolderPromise,
        sharedUnreadPromise,
      ]);

      let emails: EmailMessage[] = [];
      let nextLink: string | null = null;

      if (inboxFolder && inboxFolder.homeAccountId === activeAccount.homeAccountId) {
        const cached = await prisma.cachedEmail.findMany({
          where: { userId: user.id, homeAccountId: activeAccount.homeAccountId, folderId: inboxFolder.id },
          orderBy: { receivedDateTime: "desc" },
          take: 50,
        });
        if (cached.length > 0) {
          emails = cached.map(mapCachedEmail) as EmailMessage[];
          if (cached.length === 50) nextLink = cached[cached.length - 1].id;
        }
      }

      if (emails.length === 0) {
        if (providerType !== "microsoft") {
          const provider = getProvider(activeAccount.homeAccountId);
          const result = await provider.fetchEmails(user.id, activeAccount.homeAccountId, "inbox", { top: 50 });
          const { mapNormalizedEmail } = await import("@/lib/utils/email-helpers");
          emails = result.emails.map(mapNormalizedEmail);
          nextLink = result.nextCursor ?? null;
        } else {
          const data = await graphGet<GraphMessagesResponse>(
            user.id, activeAccount.homeAccountId,
            "/me/mailFolders/inbox/messages?$top=50&$select=id,subject,bodyPreview,receivedDateTime,isRead,hasAttachments,flag,from,body,conversationId&$orderby=receivedDateTime desc"
          );
          emails = data.value.map(mapGraphMessage);
          nextLink = data["@odata.nextLink"] ?? null;
        }
      }

      return { emails, nextLink, unreadCount: unreadCount || emails.filter((e) => !e.isRead).length };
    } catch {
      return { emails: [], nextLink: null, unreadCount: 0 };
    }
  })();

  // Calendar data
  const calendarPromise = (async (): Promise<{ events: CalEvent[]; weekStart: string }> => {
    try {
      const now = new Date();
      const dayOfWeek = now.getDay();
      const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - daysFromMonday);
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);
      const weekStartStr = weekStart.toISOString().split("T")[0];

      const graphPath =
        `/me/calendarView?startDateTime=${encodeURIComponent(weekStart.toISOString())}` +
        `&endDateTime=${encodeURIComponent(weekEnd.toISOString())}` +
        `&$select=${CALENDAR_SELECT}&$top=200`;

      const [msResults, jmapResults] = await Promise.all([
        Promise.allSettled(
          dbUser.msAccounts.map((acc) =>
            graphGet<GraphCalEventList>(user.id, acc.homeAccountId, graphPath).then((data) =>
              (data.value ?? []).map((e) => mapGraphEvent(e, acc.homeAccountId, acc.msEmail))
            )
          )
        ),
        Promise.allSettled(
          dbUser.jmapAccounts.map(async (acc) => {
            const { JmapProvider } = await import("@/lib/providers/jmap");
            const provider = new JmapProvider();
            const jmapEvents = await provider.fetchEvents(user.id, acc.accountId, weekStartStr, weekEnd.toISOString().split("T")[0]);
            return jmapEvents.map((e): CalEvent => ({
              id: e.id, subject: e.subject, startDateTime: e.startDateTime, endDateTime: e.endDateTime,
              timeZone: e.timeZone, isAllDay: e.isAllDay, location: e.location, bodyPreview: e.bodyPreview,
              organizer: e.organizer, attendees: e.attendees, onlineMeetingUrl: e.onlineMeetingUrl,
              responseStatus: e.responseStatus as CalEvent["responseStatus"],
              accountHomeId: acc.accountId, accountEmail: acc.email, isRecurring: e.isRecurring, recurrence: e.recurrence,
            }));
          })
        ),
      ]);

      const events: CalEvent[] = [
        ...msResults.filter((r): r is PromiseFulfilledResult<CalEvent[]> => r.status === "fulfilled").flatMap((r) => r.value),
        ...jmapResults.filter((r): r is PromiseFulfilledResult<CalEvent[]> => r.status === "fulfilled").flatMap((r) => r.value),
      ].sort((a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime());

      return { events, weekStart: weekStartStr };
    } catch {
      return { events: [], weekStart: new Date().toISOString().split("T")[0] };
    }
  })();

  // Dashboard data
  const dashboardPromise = (async () => {
    try {
      const now = new Date();
      const userDateStr = now.toLocaleString("en-US", { timeZone: userTimeZone });
      const userDate = new Date(userDateStr);
      const startOfDay = new Date(userDate.getFullYear(), userDate.getMonth(), userDate.getDate()).toISOString();
      const endOfDay = new Date(userDate.getFullYear(), userDate.getMonth(), userDate.getDate(), 23, 59, 59).toISOString();

      // Today's events
      let dashEvents: GraphEventList["value"] = [];
      try {
        const todayDateStr = startOfDay.split("T")[0];
        const [msResults, jmapResults] = await Promise.all([
          Promise.allSettled(
            dbUser.msAccounts.map((acc) =>
              graphGet<GraphEventList>(user.id, acc.homeAccountId,
                `/me/calendarView?startDateTime=${encodeURIComponent(startOfDay)}&endDateTime=${encodeURIComponent(endOfDay)}&$top=10&$select=id,subject,start,end,location,attendees&$orderby=start/dateTime`
              )
            )
          ),
          (async () => {
            if (!dbUser.jmapAccounts.length) return [] as PromiseSettledResult<GraphEventList>[];
            const { JmapProvider } = await import("@/lib/providers/jmap");
            const provider = new JmapProvider();
            return Promise.allSettled(
              dbUser.jmapAccounts.map(async (acc) => {
                const jmapEvents = await provider.fetchEvents(user.id, acc.accountId, todayDateStr, todayDateStr);
                return {
                  value: jmapEvents.map((e) => ({
                    id: e.id, subject: e.subject,
                    start: { dateTime: e.startDateTime, timeZone: e.timeZone },
                    end: { dateTime: e.endDateTime, timeZone: e.timeZone },
                    location: e.location ? { displayName: e.location } : undefined,
                    attendees: e.attendees.map((a) => ({ emailAddress: { name: a.name } })),
                  })),
                } as GraphEventList;
              })
            );
          })(),
        ]);
        dashEvents = [...msResults, ...jmapResults]
          .filter((r): r is PromiseFulfilledResult<GraphEventList> => r.status === "fulfilled")
          .flatMap((r) => r.value.value ?? [])
          .sort((a, b) => new Date(a.start.dateTime).getTime() - new Date(b.start.dateTime).getTime())
          .slice(0, 6);
      } catch {}

      // Unread emails
      let recentUnread: (EmailMessage & { accountName?: string })[] = [];
      try {
        const [msResults, jmapResults] = await Promise.all([
          Promise.allSettled(
            dbUser.msAccounts.map(acc =>
              graphGet<GraphMessageList>(user.id, acc.homeAccountId,
                `/me/messages?$filter=isRead eq false&$top=3&$select=id,subject,bodyPreview,receivedDateTime,isRead,hasAttachments,flag,from,toRecipients,ccRecipients&$orderby=receivedDateTime desc`
              )
            )
          ),
          (async () => {
            if (!dbUser.jmapAccounts.length) return [] as PromiseSettledResult<{ emails: EmailMessage[]; accountName: string }>[];
            const { JmapProvider } = await import("@/lib/providers/jmap");
            const provider = new JmapProvider();
            return Promise.allSettled(
              dbUser.jmapAccounts.map(async (acc) => {
                const result = await provider.fetchEmails(user.id, acc.accountId, "inbox", { top: 3, filter: "unread" });
                return {
                  emails: result.emails.map((e) => ({
                    id: e.id, subject: e.subject || "(no subject)", bodyPreview: e.bodyPreview,
                    receivedDateTime: e.receivedDateTime, isRead: e.isRead, hasAttachments: e.hasAttachments,
                    flag: { flagStatus: e.flagStatus as "flagged" | "notFlagged" },
                    from: { name: e.from.name, address: e.from.address }, toRecipients: e.toRecipients,
                  })),
                  accountName: acc.displayName ?? acc.email,
                };
              })
            );
          })(),
        ]);

        const msEmails = msResults
          .filter((r): r is PromiseFulfilledResult<GraphMessageList> => r.status === "fulfilled")
          .flatMap((r, idx) =>
            (r.value.value ?? []).map((m) => ({
              id: m.id, subject: m.subject ?? "(no subject)", bodyPreview: m.bodyPreview ?? "",
              receivedDateTime: m.receivedDateTime, isRead: m.isRead, hasAttachments: m.hasAttachments,
              flag: { flagStatus: (m.flag?.flagStatus === "flagged" ? "flagged" : "notFlagged") as "flagged" | "notFlagged" },
              from: { name: m.from?.emailAddress?.name ?? "Unknown", address: m.from?.emailAddress?.address ?? "" },
              toRecipients: (m.toRecipients ?? []).map((r) => ({ name: r.emailAddress.name, address: r.emailAddress.address })),
              accountName: dbUser.msAccounts[idx]?.displayName || undefined,
            }))
          );

        const jmapEmails = (jmapResults as PromiseSettledResult<{ emails: EmailMessage[]; accountName: string }>[])
          .filter((r): r is PromiseFulfilledResult<{ emails: EmailMessage[]; accountName: string }> => r.status === "fulfilled")
          .flatMap((r) => r.value.emails.map((e) => ({ ...e, accountName: r.value.accountName })));

        recentUnread = [...msEmails, ...jmapEmails]
          .sort((a, b) => new Date(b.receivedDateTime).getTime() - new Date(a.receivedDateTime).getTime())
          .slice(0, 10);
      } catch {}

      // Parallel stats
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const startOfTodayDate = new Date(userDate.getFullYear(), userDate.getMonth(), userDate.getDate());
      const yesterdayStart = new Date(Date.now() - 24 * 60 * 60 * 1000);
      yesterdayStart.setHours(0, 0, 0, 0);
      const yesterdayEnd = new Date(yesterdayStart);
      yesterdayEnd.setHours(23, 59, 59, 999);

      const [receivedRows, unreadCount, oldestUnread, sentRows, attachmentsToday, yesterdayUnread, draftsResult] = await Promise.all([
        prisma.cachedEmail.findMany({
          where: { userId: user.id, homeAccountId: activeAccount.homeAccountId, receivedDateTime: { gte: sevenDaysAgo }, isDraft: false },
          select: { receivedDateTime: true },
        }).catch(() => [] as { receivedDateTime: Date }[]),
        sharedUnreadPromise,
        prisma.cachedEmail.findFirst({
          where: { userId: user.id, homeAccountId: activeAccount.homeAccountId, isRead: false },
          orderBy: { receivedDateTime: "asc" as const },
          select: { receivedDateTime: true },
        }).catch(() => null),
        prisma.cachedEmail.findMany({
          where: { userId: user.id, sentDateTime: { gte: sevenDaysAgo }, isDraft: false, NOT: { sentDateTime: null }, folderId: { in: ["sentitems", "sentItems", "SentItems"] } },
          select: { sentDateTime: true },
        }).catch(() => [] as { sentDateTime: Date | null }[]),
        prisma.cachedEmail.count({
          where: { userId: user.id, homeAccountId: activeAccount.homeAccountId, hasAttachments: true, receivedDateTime: { gte: startOfTodayDate } },
        }).catch(() => 0),
        prisma.cachedEmail.count({
          where: { userId: user.id, homeAccountId: activeAccount.homeAccountId, isRead: false, receivedDateTime: { gte: yesterdayStart, lte: yesterdayEnd } },
        }).catch(() => 0),
        Promise.allSettled(
          dbUser.msAccounts.map(acc =>
            graphGet<{ value: unknown[]; "@odata.count"?: number }>(user.id, acc.homeAccountId, `/me/mailFolders/drafts/messages?$top=1&$count=true&$select=id`)
          )
        ).catch(() => [] as PromiseSettledResult<{ value: unknown[] }>[]),
      ]);

      // Process emailsData
      const dayCountsMap: Record<number, number> = {};
      receivedRows.forEach(({ receivedDateTime }) => {
        const day = new Date(receivedDateTime).getDay();
        dayCountsMap[day] = (dayCountsMap[day] ?? 0) + 1;
      });
      const emailsData = [dayCountsMap[1] ?? 0, dayCountsMap[2] ?? 0, dayCountsMap[3] ?? 0, dayCountsMap[4] ?? 0, dayCountsMap[5] ?? 0, dayCountsMap[6] ?? 0, dayCountsMap[0] ?? 0];

      const sentDayMap: Record<number, number> = {};
      sentRows.forEach(({ sentDateTime }) => {
        if (!sentDateTime) return;
        const day = new Date(sentDateTime).getDay();
        sentDayMap[day] = (sentDayMap[day] ?? 0) + 1;
      });
      const sentData = [sentDayMap[1] ?? 0, sentDayMap[2] ?? 0, sentDayMap[3] ?? 0, sentDayMap[4] ?? 0, sentDayMap[5] ?? 0, sentDayMap[6] ?? 0, sentDayMap[0] ?? 0];

      let hoursWaiting = 0;
      if (oldestUnread) hoursWaiting = Math.floor((Date.now() - new Date(oldestUnread.receivedDateTime).getTime()) / 3600000);

      const draftsCount = (draftsResult as PromiseSettledResult<{ value: unknown[]; "@odata.count"?: number }>[])
        .filter((r): r is PromiseFulfilledResult<{ value: unknown[]; "@odata.count"?: number }> => r.status === "fulfilled")
        .reduce((sum, r) => sum + (r.value["@odata.count"] ?? r.value.value?.length ?? 0), 0);

      return {
        userName: userName.split(" ")[0],
        events: dashEvents.map((e) => ({
          id: e.id, subject: e.subject ?? "(no subject)",
          startDateTime: e.start.dateTime, endDateTime: e.end.dateTime,
          location: e.location?.displayName ?? "", attendeeCount: e.attendees?.length ?? 0,
        })),
        recentUnread,
        eventsToday: dashEvents.length,
        emailsData,
        sentData,
        draftsCount,
        hoursWaiting,
        attachmentsToday,
        unreadTrend: unreadCount - yesterdayUnread,
      };
    } catch {
      return {
        userName: userName.split(" ")[0],
        events: [], recentUnread: [], eventsToday: 0,
        emailsData: [0, 0, 0, 0, 0, 0, 0], sentData: [0, 0, 0, 0, 0, 0, 0],
        draftsCount: 0, hoursWaiting: 0, attachmentsToday: 0, unreadTrend: 0,
      };
    }
  })();

  // Await all data in parallel
  const [inboxData, calendarData, dashboardData] = await Promise.all([
    inboxPromise,
    calendarPromise,
    dashboardPromise,
  ]);

  // Build accounts list for AccountsClient
  const accountsList = [
    ...dbUser.msAccounts.map((a) => ({
      id: a.id, msEmail: a.msEmail, email: a.msEmail,
      displayName: a.displayName ?? a.msEmail, homeAccountId: a.homeAccountId,
      isDefault: a.isDefault, connectedAt: a.connectedAt.toISOString(), providerType: "microsoft" as const,
    })),
    ...dbUser.imapAccounts.map((a) => ({
      id: a.id, msEmail: a.email, email: a.email,
      displayName: a.displayName ?? a.email, homeAccountId: a.accountId,
      isDefault: a.isDefault, connectedAt: a.connectedAt.toISOString(), providerType: "imap" as const,
    })),
    ...dbUser.jmapAccounts.map((a) => ({
      id: a.id, msEmail: a.email, email: a.email,
      displayName: a.displayName ?? a.email, homeAccountId: a.accountId,
      isDefault: a.isDefault, connectedAt: a.connectedAt.toISOString(), providerType: "jmap" as const,
    })),
  ];

  // Build compose accounts
  const composeAccounts = dbUser.allAccounts.map((a) => ({
    id: a.id ?? "", homeAccountId: a.homeAccountId, msEmail: a.email,
    displayName: a.displayName, isDefault: a.isDefault,
  }));

  return (
    <div className="flex" style={{ height: "100vh", overflow: "hidden" }}>
      <StoreInitializer
        accounts={dbUser.msAccounts}
        imapAccounts={dbUser.imapAccounts}
        jmapAccounts={dbUser.jmapAccounts}
        inboxUnread={inboxData.unreadCount}
      />
      <Sidebar userName={userName} userEmail={activeAccount.email} />
      <AppShell
        initialEmails={inboxData.emails}
        initialNextLink={inboxData.nextLink}
        totalUnread={inboxData.unreadCount}
        initialEvents={calendarData.events}
        weekStart={calendarData.weekStart}
        userTimeZone={userTimeZone}
        dashboardData={dashboardData}
        profile={{ name: dbUser.name ?? "", email: activeAccount.email }}
        composeAccounts={composeAccounts}
        accountsList={accountsList}
        userName={userName}
        userEmail={activeAccount.email}
        initialView={initialView}
        initialFolderId={initialFolderId}
        initialEmailId={initialEmailId}
      />
    </div>
  );
}
