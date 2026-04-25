import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { getAllAccounts } from "@/lib/providers/registry";
import { syncCalendar } from "@/lib/sync/calendar-sync";
import { isReauthError } from "@/lib/microsoft/auth-errors";
import { graphGet } from "@/lib/microsoft/graph";
import {
  type CalEvent,
  type GraphCalEventList,
  mapGraphEvent,
  CALENDAR_SELECT,
} from "@/lib/types/calendar";

function addDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

// ─── GET /api/calendar/week?start={YYYY-MM-DD} ────────────────────────────────
// Cache-first: returns cached events instantly (~5ms), falls back to Graph if
// cache is empty. Background sync keeps cache fresh for subsequent requests.

export async function GET(req: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const startParam = req.nextUrl.searchParams.get("start");
  if (!startParam || isNaN(Date.parse(`${startParam}T00:00:00`))) {
    return NextResponse.json({ error: "start param required (YYYY-MM-DD)" }, { status: 400 });
  }

  const accounts = await getAllAccounts(user.id);
  if (!accounts.length) {
    return NextResponse.json({ error: "No connected accounts" }, { status: 400 });
  }

  const weekStart = new Date(`${startParam}T00:00:00`);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  const emailByAccount = new Map(accounts.map((a) => [a.accountId, a.email]));

  // ── Cache-first: return instantly if we have data ─────────────────────────
  const cached = await prisma.cachedCalendarEvent.findMany({
    where: {
      userId: user.id,
      startDateTime: { lte: weekEnd },
      endDateTime: { gte: weekStart },
    },
    orderBy: { startDateTime: "asc" },
  });

  // Fire background sync for MS accounts — keeps cache fresh
  const msAccounts = accounts.filter((a) => a.providerType === "microsoft");
  const jmapAccounts = accounts.filter((a) => a.providerType === "jmap");
  void Promise.allSettled(
    msAccounts.map((acc) => syncCalendar(user.id, acc.accountId))
  ).catch(() => {});

  if (cached.length > 0) {
    const events: CalEvent[] = cached.map((e) => ({
      id: e.id,
      subject: e.subject || "(no subject)",
      startDateTime: e.startDateTime.toISOString(),
      endDateTime: e.endDateTime.toISOString(),
      timeZone: e.timeZone ?? "UTC",
      isAllDay: e.isAllDay,
      location: e.location ?? undefined,
      bodyPreview: e.bodyPreview || undefined,
      organizer:
        e.organizerName || e.organizerEmail
          ? { name: e.organizerName ?? "", address: e.organizerEmail ?? "" }
          : undefined,
      attendees: (e.attendees as { name: string; address: string; responseStatus?: string }[]) ?? [],
      onlineMeetingUrl: e.onlineMeetingUrl ?? undefined,
      responseStatus: (e.responseStatus as CalEvent["responseStatus"]) ?? "none",
      accountHomeId: e.homeAccountId,
      accountEmail: emailByAccount.get(e.homeAccountId) ?? "",
      isRecurring: e.isRecurring,
    }));

    // Also fetch JMAP events (not in MS cache)
    if (jmapAccounts.length > 0) {
      const { JmapProvider } = await import("@/lib/providers/jmap");
      const provider = new JmapProvider();
      const jmapResults = await Promise.allSettled(
        jmapAccounts.map((acc) =>
          provider.fetchEvents(user.id, acc.accountId, startParam, addDays(startParam, 6))
        )
      );
      for (const r of jmapResults) {
        if (r.status === "fulfilled") {
          events.push(...r.value.map((e) => ({
            id: e.id,
            subject: e.subject,
            startDateTime: e.startDateTime,
            endDateTime: e.endDateTime,
            timeZone: e.timeZone,
            isAllDay: e.isAllDay,
            location: e.location,
            bodyPreview: e.bodyPreview,
            organizer: e.organizer,
            attendees: e.attendees,
            onlineMeetingUrl: e.onlineMeetingUrl,
            responseStatus: (e.responseStatus as CalEvent["responseStatus"]) ?? "none",
            accountHomeId: e.id.split(":")[0] + ":" + e.id.split(":")[1],
            accountEmail: emailByAccount.get(e.id.substring(0, e.id.lastIndexOf(":"))) ?? "",
            isRecurring: e.isRecurring,
          })));
        }
      }
      events.sort((a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime());
    }

    return NextResponse.json({ events });
  }

  // ── Cache empty — fall back to provider APIs (first load only) ────────────
  const graphPath =
    `/me/calendarView` +
    `?startDateTime=${encodeURIComponent(weekStart.toISOString())}` +
    `&endDateTime=${encodeURIComponent(weekEnd.toISOString())}` +
    `&$select=${CALENDAR_SELECT}` +
    `&$top=200`;

  const [msResults, jmapResults] = await Promise.all([
    Promise.allSettled(
      msAccounts.map((acc) =>
        graphGet<GraphCalEventList>(user.id, acc.accountId, graphPath).then((data) =>
          (data.value ?? []).map((e) => mapGraphEvent(e, acc.accountId, acc.email))
        )
      )
    ),
    (async () => {
      if (jmapAccounts.length === 0) return [] as PromiseSettledResult<CalEvent[]>[];
      const { JmapProvider } = await import("@/lib/providers/jmap");
      const provider = new JmapProvider();
      return Promise.allSettled(
        jmapAccounts.map((acc) =>
          provider.fetchEvents(user.id, acc.accountId, startParam, addDays(startParam, 6)).then((evts) =>
            evts.map((e): CalEvent => ({
              id: e.id, subject: e.subject, startDateTime: e.startDateTime, endDateTime: e.endDateTime,
              timeZone: e.timeZone, isAllDay: e.isAllDay, location: e.location, bodyPreview: e.bodyPreview,
              organizer: e.organizer, attendees: e.attendees, onlineMeetingUrl: e.onlineMeetingUrl,
              responseStatus: (e.responseStatus as CalEvent["responseStatus"]) ?? "none",
              accountHomeId: acc.accountId, accountEmail: acc.email, isRecurring: e.isRecurring,
            }))
          )
        )
      );
    })(),
  ]);

  const results = [...msResults, ...jmapResults];

  const events: CalEvent[] = results
    .filter((r): r is PromiseFulfilledResult<CalEvent[]> => r.status === "fulfilled")
    .flatMap((r) => r.value)
    .sort((a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime());

  const requiresReauth = msResults.some(
    (r) => r.status === "rejected" && isReauthError(r.reason)
  );

  const errors = results
    .filter((r): r is PromiseRejectedResult => r.status === "rejected")
    .map((r) => String(r.reason));

  return NextResponse.json({
    events,
    ...(requiresReauth ? { requiresReauth: true } : {}),
    ...(errors.length ? { errors } : {}),
  });
}
