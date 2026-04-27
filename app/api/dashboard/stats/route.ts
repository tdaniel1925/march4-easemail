import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { verifyAccountOwnership, detectProviderType, getProvider } from "@/lib/providers/registry";
import { mapCachedEmail } from "@/lib/utils/email-helpers";
import type { EmailMessage } from "@/lib/types/email";

export interface DashboardStats {
  unreadCount: number;
  draftCount: number;
  totalInboxCount: number;
  sentCount: number;
  attachmentsToday: number;
  hoursWaiting: number;
  recentUnread: EmailMessage[];
  /** Mon–Sun received counts for the current ISO week */
  weeklyReceived: number[];
  /** Mon–Sun sent counts for the current ISO week */
  weeklySent: number[];
  unreadTrend: number;
}

/** Return Monday of the current ISO week at midnight UTC */
function weekStart(): Date {
  const now = new Date();
  const day = now.getUTCDay(); // 0=Sun
  const diff = (day === 0 ? -6 : 1 - day); // shift so Mon=0
  const mon = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + diff));
  return mon;
}

/** Return midnight UTC for today */
function todayStart(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const homeAccountId = req.nextUrl.searchParams.get("homeAccountId");
  if (!homeAccountId) {
    return NextResponse.json({ error: "homeAccountId required" }, { status: 400 });
  }

  const account = await verifyAccountOwnership(user.id, homeAccountId);
  if (!account) return NextResponse.json({ error: "Account not found" }, { status: 404 });

  const providerType = detectProviderType(homeAccountId);

  // ── IMAP / JMAP provider path ──────────────────────────────────────────────
  if (providerType !== "microsoft") {
    try {
      const provider = getProvider(homeAccountId);
      const result = await provider.fetchEmails(user.id, homeAccountId, "inbox", {
        top: 10,
        filter: "unread",
      });

      const recentUnread: EmailMessage[] = result.emails.slice(0, 5).map((e) => ({
        id: e.id,
        subject: e.subject,
        bodyPreview: e.bodyPreview,
        receivedDateTime: e.receivedDateTime,
        isRead: e.isRead,
        from: e.from,
        hasAttachments: e.hasAttachments,
      }));

      const stats: DashboardStats = {
        unreadCount: recentUnread.length,
        draftCount: 0,
        totalInboxCount: 0,
        sentCount: 0,
        attachmentsToday: 0,
        hoursWaiting: 0,
        recentUnread,
        weeklyReceived: [0, 0, 0, 0, 0, 0, 0],
        weeklySent: [0, 0, 0, 0, 0, 0, 0],
        unreadTrend: 0,
      };

      return NextResponse.json(stats);
    } catch (err) {
      console.error("[dashboard/stats] provider error:", err);
      return NextResponse.json({ error: String(err) }, { status: 500 });
    }
  }

  // ── Microsoft / cache-first path ───────────────────────────────────────────
  try {
    const monStart = weekStart();
    const todayUTC = todayStart();

    const [
      inboxFolder,
      draftsFolder,
      sentFolder,
    ] = await Promise.all([
      prisma.cachedFolder.findFirst({
        where: { userId: user.id, homeAccountId, wellKnownName: "inbox" },
      }),
      prisma.cachedFolder.findFirst({
        where: { userId: user.id, homeAccountId, wellKnownName: "drafts" },
      }),
      prisma.cachedFolder.findFirst({
        where: { userId: user.id, homeAccountId, wellKnownName: "sentitems" },
      }),
    ]);

    const [
      unreadCount,
      draftCount,
      totalInboxCount,
      sentCount,
      recentUnreadRows,
      weeklyInboxRows,
      weeklySentRows,
      attachmentsTodayCount,
      oldestUnread,
    ] = await Promise.all([
      // unread in inbox
      inboxFolder
        ? prisma.cachedEmail.count({
            where: { userId: user.id, homeAccountId, folderId: inboxFolder.id, isRead: false },
          })
        : Promise.resolve(0),

      // drafts count
      draftsFolder
        ? prisma.cachedEmail.count({
            where: { userId: user.id, homeAccountId, folderId: draftsFolder.id },
          })
        : Promise.resolve(0),

      // total inbox
      inboxFolder
        ? prisma.cachedEmail.count({
            where: { userId: user.id, homeAccountId, folderId: inboxFolder.id },
          })
        : Promise.resolve(0),

      // sent count (total)
      sentFolder
        ? prisma.cachedEmail.count({
            where: { userId: user.id, homeAccountId, folderId: sentFolder.id },
          })
        : Promise.resolve(0),

      // recent unread (up to 5)
      inboxFolder
        ? prisma.cachedEmail.findMany({
            where: { userId: user.id, homeAccountId, folderId: inboxFolder.id, isRead: false },
            orderBy: { receivedDateTime: "desc" },
            take: 5,
          })
        : Promise.resolve([]),

      // inbox emails this week for chart
      inboxFolder
        ? prisma.cachedEmail.findMany({
            where: {
              userId: user.id,
              homeAccountId,
              folderId: inboxFolder.id,
              receivedDateTime: { gte: monStart },
            },
            select: { receivedDateTime: true },
          })
        : Promise.resolve([]),

      // sent emails this week for chart
      sentFolder
        ? prisma.cachedEmail.findMany({
            where: {
              userId: user.id,
              homeAccountId,
              folderId: sentFolder.id,
              sentDateTime: { gte: monStart },
            },
            select: { sentDateTime: true },
          })
        : Promise.resolve([]),

      // attachments received today in inbox
      inboxFolder
        ? prisma.cachedEmail.count({
            where: {
              userId: user.id,
              homeAccountId,
              folderId: inboxFolder.id,
              hasAttachments: true,
              receivedDateTime: { gte: todayUTC },
            },
          })
        : Promise.resolve(0),

      // oldest unread to compute hoursWaiting
      inboxFolder
        ? prisma.cachedEmail.findFirst({
            where: { userId: user.id, homeAccountId, folderId: inboxFolder.id, isRead: false },
            orderBy: { receivedDateTime: "asc" },
            select: { receivedDateTime: true },
          })
        : Promise.resolve(null),
    ]);

    // Build Mon–Sun arrays (index 0=Mon … 6=Sun)
    const weeklyReceived = [0, 0, 0, 0, 0, 0, 0];
    for (const row of weeklyInboxRows) {
      const d = new Date(row.receivedDateTime);
      const dayUTC = d.getUTCDay(); // 0=Sun
      const idx = dayUTC === 0 ? 6 : dayUTC - 1;
      weeklyReceived[idx]++;
    }

    const weeklySent = [0, 0, 0, 0, 0, 0, 0];
    for (const row of weeklySentRows) {
      if (!row.sentDateTime) continue;
      const d = new Date(row.sentDateTime);
      const dayUTC = d.getUTCDay();
      const idx = dayUTC === 0 ? 6 : dayUTC - 1;
      weeklySent[idx]++;
    }

    // hoursWaiting — hours since oldest unread arrived
    const hoursWaiting = oldestUnread
      ? Math.floor((Date.now() - new Date(oldestUnread.receivedDateTime).getTime()) / 3600000)
      : 0;

    // unreadTrend — difference vs yesterday's unread (approximate: compare today's inbox arrivals
    // vs yesterday's, using receivedDateTime for the day before)
    const yesterdayStart = new Date(todayUTC.getTime() - 86400000);
    const yesterdayCount = inboxFolder
      ? await prisma.cachedEmail.count({
          where: {
            userId: user.id,
            homeAccountId,
            folderId: inboxFolder.id,
            isRead: false,
            receivedDateTime: { gte: yesterdayStart, lt: todayUTC },
          },
        })
      : 0;
    const todayUnreadCount = inboxFolder
      ? await prisma.cachedEmail.count({
          where: {
            userId: user.id,
            homeAccountId,
            folderId: inboxFolder.id,
            isRead: false,
            receivedDateTime: { gte: todayUTC },
          },
        })
      : 0;
    const unreadTrend = todayUnreadCount - yesterdayCount;

    const recentUnread: EmailMessage[] = recentUnreadRows.map(mapCachedEmail);

    const stats: DashboardStats = {
      unreadCount,
      draftCount,
      totalInboxCount,
      sentCount,
      attachmentsToday: attachmentsTodayCount,
      hoursWaiting,
      recentUnread,
      weeklyReceived,
      weeklySent,
      unreadTrend,
    };

    return NextResponse.json(stats);
  } catch (err) {
    console.error("[dashboard/stats] error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
