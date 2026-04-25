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

  // Fire background sync regardless — keeps cache fresh for next request
  void Promise.allSettled(
    accounts.map((acc) => syncCalendar(user.id, acc.accountId))
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
    return NextResponse.json({ events });
  }

  // ── Cache empty — fall back to Graph (first load only) ────────────────────
  const graphPath =
    `/me/calendarView` +
    `?startDateTime=${encodeURIComponent(weekStart.toISOString())}` +
    `&endDateTime=${encodeURIComponent(weekEnd.toISOString())}` +
    `&$select=${CALENDAR_SELECT}` +
    `&$top=200`;

  const results = await Promise.allSettled(
    accounts.map((acc) =>
      graphGet<GraphCalEventList>(user.id, acc.accountId, graphPath).then((data) =>
        (data.value ?? []).map((e) => mapGraphEvent(e, acc.accountId, acc.email))
      )
    )
  );

  const events: CalEvent[] = results
    .filter((r): r is PromiseFulfilledResult<CalEvent[]> => r.status === "fulfilled")
    .flatMap((r) => r.value)
    .sort((a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime());

  const requiresReauth = results.some(
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
