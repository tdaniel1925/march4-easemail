import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserWithAccounts } from "@/lib/utils/get-user-accounts";
import { prisma } from "@/lib/prisma";
import { graphGet } from "@/lib/microsoft/graph";
import DashboardClient from "@/components/dashboard/DashboardClient";
import type { EmailMessage } from "@/lib/types/email";
import { getUnreadCount } from "@/lib/utils/get-unread-count";

// ─── Graph shapes ─────────────────────────────────────────────────────────────

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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const dbUser = await getUserWithAccounts(user.id);
  if (!dbUser) redirect("/onboarding");

  const dbDefault = dbUser.defaultAccount;
  if (!dbDefault) redirect("/onboarding");
  const { getActiveAccountId } = await import("@/lib/utils/get-active-account");
  const savedAccountId = await getActiveAccountId();
  const defaultAccount = (savedAccountId ? dbUser.allAccounts.find((a) => a.homeAccountId === savedAccountId) : null) ?? dbDefault;

  // Fetch today's calendar events across all accounts
  const userTimeZone = dbUser.preferredTimeZone || "America/Chicago";
  const now = new Date();
  const userDateStr = now.toLocaleString("en-US", { timeZone: userTimeZone });
  const userDate = new Date(userDateStr);
  const startOfDay = new Date(userDate.getFullYear(), userDate.getMonth(), userDate.getDate()).toISOString();
  const endOfDay = new Date(userDate.getFullYear(), userDate.getMonth(), userDate.getDate(), 23, 59, 59).toISOString();

  // Fetch today's events from ALL providers (MS + JMAP) in parallel
  let events: GraphEventList["value"] = [];
  try {
    const todayDateStr = startOfDay.split("T")[0];
    const [msResults, jmapResults] = await Promise.all([
      Promise.allSettled(
        dbUser.msAccounts.map((acc) =>
          graphGet<GraphEventList>(
            user.id,
            acc.homeAccountId,
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
                id: e.id,
                subject: e.subject,
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
    events = [...msResults, ...jmapResults]
      .filter((r): r is PromiseFulfilledResult<GraphEventList> => r.status === "fulfilled")
      .flatMap((r) => r.value.value ?? [])
      .sort((a, b) => new Date(a.start.dateTime).getTime() - new Date(b.start.dateTime).getTime())
      .slice(0, 6);
  } catch {
    // Not fatal
  }

  // Fetch top unread emails from ALL providers (MS + JMAP)
  let recentUnread: (EmailMessage & { accountName?: string })[] = [];
  try {
    const [msResults, jmapResults] = await Promise.all([
      Promise.allSettled(
        dbUser.msAccounts.map(acc =>
          graphGet<GraphMessageList>(
            user.id,
            acc.homeAccountId,
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
                id: e.id,
                subject: e.subject || "(no subject)",
                bodyPreview: e.bodyPreview,
                receivedDateTime: e.receivedDateTime,
                isRead: e.isRead,
                hasAttachments: e.hasAttachments,
                flag: { flagStatus: e.flagStatus as "flagged" | "notFlagged" },
                from: { name: e.from.name, address: e.from.address },
                toRecipients: e.toRecipients,
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
          id: m.id,
          subject: m.subject ?? "(no subject)",
          bodyPreview: m.bodyPreview ?? "",
          receivedDateTime: m.receivedDateTime,
          isRead: m.isRead,
          hasAttachments: m.hasAttachments,
          flag: { flagStatus: (m.flag?.flagStatus === "flagged" ? "flagged" : "notFlagged") as "flagged" | "notFlagged" },
          from: { name: m.from?.emailAddress?.name ?? "Unknown", address: m.from?.emailAddress?.address ?? "" },
          toRecipients: (m.toRecipients ?? []).map((r) => ({ name: r.emailAddress.name, address: r.emailAddress.address })),
          accountName: dbUser.msAccounts[idx]?.displayName || undefined,
        }))
      );

    const jmapEmails = (jmapResults as PromiseSettledResult<{ emails: EmailMessage[]; accountName: string }>[])
      .filter((r): r is PromiseFulfilledResult<{ emails: EmailMessage[]; accountName: string }> => r.status === "fulfilled")
      .flatMap((r) =>
        r.value.emails.map((e) => ({ ...e, accountName: r.value.accountName }))
      );

    recentUnread = [...msEmails, ...jmapEmails]
      .sort((a, b) => new Date(b.receivedDateTime).getTime() - new Date(a.receivedDateTime).getTime())
      .slice(0, 10);
  } catch {
    // Not fatal
  }

  // Fetch all independent dashboard data in parallel
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const startOfTodayDate = new Date(userDate.getFullYear(), userDate.getMonth(), userDate.getDate());
  const yesterdayStart = new Date(Date.now() - 24 * 60 * 60 * 1000);
  yesterdayStart.setHours(0, 0, 0, 0);
  const yesterdayEnd = new Date(yesterdayStart);
  yesterdayEnd.setHours(23, 59, 59, 999);

  const [
    receivedRowsResult,
    unreadCountResult,
    oldestUnreadResult,
    sentRowsResult,
    attachmentsTodayResult,
    yesterdayUnreadResult,
    draftsResult,
  ] = await Promise.all([
    // Weekly email activity data (last 7 days)
    prisma.cachedEmail.findMany({
      where: {
        userId: user.id,
        homeAccountId: defaultAccount.homeAccountId,
        receivedDateTime: { gte: sevenDaysAgo },
        isDraft: false,
      },
      select: { receivedDateTime: true },
    }).catch(() => [] as { receivedDateTime: Date }[]),

    // Real unread count
    getUnreadCount(user.id, defaultAccount.homeAccountId).catch(() => 0),

    // Oldest unread email
    prisma.cachedEmail.findFirst({
      where: {
        userId: user.id,
        homeAccountId: defaultAccount.homeAccountId,
        isRead: false,
      },
      orderBy: { receivedDateTime: 'asc' as const },
      select: { receivedDateTime: true },
    }).catch(() => null),

    // Sent emails for the week (for dual chart)
    prisma.cachedEmail.findMany({
      where: {
        userId: user.id,
        sentDateTime: { gte: sevenDaysAgo },
        isDraft: false,
        NOT: { sentDateTime: null },
        folderId: { in: ["sentitems", "sentItems", "SentItems"] },
      },
      select: { sentDateTime: true },
    }).catch(() => [] as { sentDateTime: Date | null }[]),

    // Attachments count for today
    prisma.cachedEmail.count({
      where: {
        userId: user.id,
        homeAccountId: defaultAccount.homeAccountId,
        hasAttachments: true,
        receivedDateTime: { gte: startOfTodayDate },
      },
    }).catch(() => 0),

    // Yesterday's unread count for trend
    prisma.cachedEmail.count({
      where: {
        userId: user.id,
        homeAccountId: defaultAccount.homeAccountId,
        isRead: false,
        receivedDateTime: {
          gte: yesterdayStart,
          lte: yesterdayEnd,
        },
      },
    }).catch(() => 0),

    // Drafts count across all accounts
    Promise.allSettled(
      dbUser.msAccounts.map(acc =>
        graphGet<{ value: unknown[] }>(
          user.id,
          acc.homeAccountId,
          `/me/mailFolders/drafts/messages?$top=1&$count=true&$select=id`
        )
      )
    ).catch(() => [] as PromiseSettledResult<{ value: unknown[] }>[]),
  ]);

  // Process weekly received email data
  // Map JS day (0=Sun…6=Sat) → Mon-first index [Mon=0 … Sun=6]
  let emailsData = [0, 0, 0, 0, 0, 0, 0];
  {
    const dayCountsMap: Record<number, number> = {};
    receivedRowsResult.forEach(({ receivedDateTime }) => {
      const day = new Date(receivedDateTime).getDay(); // 0=Sun
      dayCountsMap[day] = (dayCountsMap[day] ?? 0) + 1;
    });
    emailsData = [
      dayCountsMap[1] ?? 0, // Monday
      dayCountsMap[2] ?? 0, // Tuesday
      dayCountsMap[3] ?? 0, // Wednesday
      dayCountsMap[4] ?? 0, // Thursday
      dayCountsMap[5] ?? 0, // Friday
      dayCountsMap[6] ?? 0, // Saturday
      dayCountsMap[0] ?? 0, // Sunday
    ];
  }

  const userName = dbUser.name ?? defaultAccount.displayName ?? user.email ?? "You";
  const unreadCount = unreadCountResult;

  // Process oldest unread → hoursWaiting
  let hoursWaiting = 0;
  if (oldestUnreadResult) {
    hoursWaiting = Math.floor((Date.now() - new Date(oldestUnreadResult.receivedDateTime).getTime()) / 3600000);
  }

  // Process sent email data
  let sentData = [0, 0, 0, 0, 0, 0, 0];
  {
    const sentDayMap: Record<number, number> = {};
    sentRowsResult.forEach(({ sentDateTime }) => {
      if (!sentDateTime) return;
      const day = new Date(sentDateTime).getDay(); // 0=Sun
      sentDayMap[day] = (sentDayMap[day] ?? 0) + 1;
    });
    sentData = [
      sentDayMap[1] ?? 0,
      sentDayMap[2] ?? 0,
      sentDayMap[3] ?? 0,
      sentDayMap[4] ?? 0,
      sentDayMap[5] ?? 0,
      sentDayMap[6] ?? 0,
      sentDayMap[0] ?? 0,
    ];
  }

  const attachmentsToday = attachmentsTodayResult;
  const yesterdayUnread = yesterdayUnreadResult;

  // Process drafts count
  const draftsCount = (draftsResult as PromiseSettledResult<{ value: unknown[]; "@odata.count"?: number }>[])
    .filter((r): r is PromiseFulfilledResult<{ value: unknown[]; "@odata.count"?: number }> => r.status === "fulfilled")
    .reduce((sum, r) => sum + (r.value["@odata.count"] ?? r.value.value?.length ?? 0), 0);

  return (
      <DashboardClient
        userName={userName.split(" ")[0]}
        events={events.map((e) => ({
          id: e.id,
          subject: e.subject ?? "(no subject)",
          startDateTime: e.start.dateTime,
          endDateTime: e.end.dateTime,
          location: e.location?.displayName ?? "",
          attendeeCount: e.attendees?.length ?? 0,
        }))}
        recentUnread={recentUnread}
        eventsToday={events.length}
        emailsData={emailsData}
        sentData={sentData}
        draftsCount={draftsCount}
        hoursWaiting={hoursWaiting}
        attachmentsToday={attachmentsToday}
        unreadTrend={unreadCount - yesterdayUnread}
      />
  );
}
