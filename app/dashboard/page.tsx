import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { graphGet } from "@/lib/microsoft/graph";
import Sidebar from "@/components/Sidebar";
import { StoreInitializer } from "@/components/StoreInitializer";
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

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { msAccounts: { orderBy: { isDefault: "desc" } } },
  });
  if (!dbUser) redirect("/onboarding");

  const defaultAccount = dbUser.msAccounts.find((a) => a.isDefault) ?? dbUser.msAccounts[0];
  if (!defaultAccount) redirect("/onboarding");

  // Fetch today's calendar events across all accounts
  const userTimeZone = dbUser.preferredTimeZone || "America/Chicago";
  const now = new Date();
  const userDateStr = now.toLocaleString("en-US", { timeZone: userTimeZone });
  const userDate = new Date(userDateStr);
  const startOfDay = new Date(userDate.getFullYear(), userDate.getMonth(), userDate.getDate()).toISOString();
  const endOfDay = new Date(userDate.getFullYear(), userDate.getMonth(), userDate.getDate(), 23, 59, 59).toISOString();

  let events: GraphEventList["value"] = [];
  try {
    const results = await Promise.allSettled(
      dbUser.msAccounts.map((acc) =>
        graphGet<GraphEventList>(
          user.id,
          acc.homeAccountId,
          `/me/calendarView?startDateTime=${encodeURIComponent(startOfDay)}&endDateTime=${encodeURIComponent(endOfDay)}&$top=10&$select=id,subject,start,end,location,attendees&$orderby=start/dateTime`
        )
      )
    );
    events = results
      .filter((r): r is PromiseFulfilledResult<GraphEventList> => r.status === "fulfilled")
      .flatMap((r) => r.value.value ?? [])
      .sort((a, b) => new Date(a.start.dateTime).getTime() - new Date(b.start.dateTime).getTime())
      .slice(0, 6);
  } catch {
    // Not fatal
  }

  // Fetch top unread emails across all accounts
  let recentUnread: (EmailMessage & { accountName?: string })[] = [];
  try {
    const results = await Promise.allSettled(
      dbUser.msAccounts.map(acc =>
        graphGet<GraphMessageList>(
          user.id,
          acc.homeAccountId,
          `/me/messages?$filter=isRead eq false&$top=3&$select=id,subject,bodyPreview,receivedDateTime,isRead,hasAttachments,flag,from,toRecipients,ccRecipients&$orderby=receivedDateTime desc`
        )
      )
    );

    recentUnread = results
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
          ccRecipients: (m.ccRecipients ?? []).map((r) => ({ name: r.emailAddress.name, address: r.emailAddress.address })),
          accountName: dbUser.msAccounts[idx].displayName || undefined,
        }))
      )
      .sort((a, b) => new Date(b.receivedDateTime).getTime() - new Date(a.receivedDateTime).getTime())
      .slice(0, 10);
  } catch {
    // Not fatal
  }

  // Fetch weekly email activity data (last 7 days)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  let emailsData = [0, 0, 0, 0, 0, 0, 0]; // Mon-Sun default
  try {
    const emailCounts = await prisma.cachedEmail.groupBy({
      by: ['receivedDateTime'],
      where: {
        userId: user.id,
        homeAccountId: defaultAccount.homeAccountId,
        receivedDateTime: { gte: sevenDaysAgo },
      },
      _count: { id: true },
    });

    // Transform to [Mon, Tue, Wed, Thu, Fri, Sat, Sun] counts
    const dayCountsMap: Record<number, number> = {};
    emailCounts.forEach((item) => {
      const date = new Date(item.receivedDateTime);
      const dayOfWeek = date.getDay(); // 0=Sunday, 1=Monday, etc.
      dayCountsMap[dayOfWeek] = (dayCountsMap[dayOfWeek] || 0) + item._count.id;
    });

    // Remap to Mon=0, Tue=1, ..., Sun=6 format
    emailsData = [
      dayCountsMap[1] || 0, // Monday
      dayCountsMap[2] || 0, // Tuesday
      dayCountsMap[3] || 0, // Wednesday
      dayCountsMap[4] || 0, // Thursday
      dayCountsMap[5] || 0, // Friday
      dayCountsMap[6] || 0, // Saturday
      dayCountsMap[0] || 0, // Sunday
    ];
  } catch {
    // Not fatal, use defaults
  }

  const userName = dbUser.name ?? defaultAccount.displayName ?? user.email ?? "You";

  // Get real unread count
  const unreadCount = await getUnreadCount(user.id, defaultAccount.homeAccountId);

  // Fetch drafts count across all accounts
  let draftsCount = 0;
  try {
    const draftsResults = await Promise.allSettled(
      dbUser.msAccounts.map(acc =>
        graphGet<{ value: unknown[] }>(
          user.id,
          acc.homeAccountId,
          `/me/mailFolders/drafts/messages?$top=1&$count=true&$select=id`
        )
      )
    );
    draftsCount = draftsResults
      .filter((r): r is PromiseFulfilledResult<{ value: unknown[]; "@odata.count"?: number }> => r.status === "fulfilled")
      .reduce((sum, r) => sum + (r.value["@odata.count"] ?? r.value.value?.length ?? 0), 0);
  } catch {
    // Not fatal
  }

  // Get oldest unread email
  let hoursWaiting = 0;
  try {
    const oldestUnread = await prisma.cachedEmail.findFirst({
      where: {
        userId: user.id,
        homeAccountId: defaultAccount.homeAccountId,
        isRead: false,
      },
      orderBy: { receivedDateTime: 'asc' },
      select: { receivedDateTime: true }
    });
    if (oldestUnread) {
      hoursWaiting = Math.floor((Date.now() - new Date(oldestUnread.receivedDateTime).getTime()) / 3600000);
    }
  } catch {
    // Not fatal
  }

  // Get sent emails for the week (for dual chart)
  let sentData = [0, 0, 0, 0, 0, 0, 0];
  try {
    const sentResults = await Promise.allSettled(
      dbUser.msAccounts.map(acc =>
        graphGet<GraphMessageList>(
          user.id,
          acc.homeAccountId,
          `/me/mailFolders/sentitems/messages?$filter=sentDateTime ge ${sevenDaysAgo.toISOString()}&$select=sentDateTime&$top=999`
        )
      )
    );

    const allSent = sentResults
      .filter((r): r is PromiseFulfilledResult<GraphMessageList> => r.status === "fulfilled")
      .flatMap(r => r.value.value ?? []);

    const sentDayMap: Record<number, number> = {};
    allSent.forEach((msg) => {
      const date = new Date(msg.receivedDateTime); // Note: Graph API uses receivedDateTime even for sent
      const dayOfWeek = date.getDay();
      sentDayMap[dayOfWeek] = (sentDayMap[dayOfWeek] || 0) + 1;
    });

    sentData = [
      sentDayMap[1] || 0,
      sentDayMap[2] || 0,
      sentDayMap[3] || 0,
      sentDayMap[4] || 0,
      sentDayMap[5] || 0,
      sentDayMap[6] || 0,
      sentDayMap[0] || 0,
    ];
  } catch {
    // Not fatal
  }

  // Get attachments count for today
  let attachmentsToday = 0;
  try {
    const startOfToday = new Date(userDate.getFullYear(), userDate.getMonth(), userDate.getDate()).toISOString();
    attachmentsToday = await prisma.cachedEmail.count({
      where: {
        userId: user.id,
        homeAccountId: defaultAccount.homeAccountId,
        hasAttachments: true,
        receivedDateTime: { gte: startOfToday }
      }
    });
  } catch {
    // Not fatal
  }

  // Get yesterday's unread count for trend
  const yesterdayStart = new Date(Date.now() - 24 * 60 * 60 * 1000);
  yesterdayStart.setHours(0, 0, 0, 0);
  const yesterdayEnd = new Date(yesterdayStart);
  yesterdayEnd.setHours(23, 59, 59, 999);

  let yesterdayUnread = 0;
  try {
    yesterdayUnread = await prisma.cachedEmail.count({
      where: {
        userId: user.id,
        homeAccountId: defaultAccount.homeAccountId,
        isRead: false,
        receivedDateTime: {
          gte: yesterdayStart,
          lte: yesterdayEnd
        }
      }
    });
  } catch {
    // Not fatal
  }

  return (
    <div className="flex" style={{ height: "100vh", overflow: "hidden" }}>
      <StoreInitializer accounts={dbUser.msAccounts} inboxUnread={unreadCount} />
      <Sidebar
        userName={userName}
        userEmail={defaultAccount.msEmail}
      />
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
    </div>
  );
}
