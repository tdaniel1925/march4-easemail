import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { getAllAccounts } from "@/lib/providers/registry";
import { syncCalendar } from "@/lib/sync/calendar-sync";
import type { CalEvent } from "@/lib/types/calendar";

// ─── GET /api/calendar/range?start={YYYY-MM-DD}&end={YYYY-MM-DD} ──────────────
// Returns events from cache immediately, fires background sync to keep cache fresh.

export async function GET(req: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const startParam = req.nextUrl.searchParams.get("start");
  const endParam = req.nextUrl.searchParams.get("end");
  if (!startParam || !endParam) {
    return NextResponse.json({ error: "start and end params required (YYYY-MM-DD)" }, { status: 400 });
  }

  const rangeStart = new Date(`${startParam}T00:00:00`);
  const rangeEnd = new Date(`${endParam}T23:59:59.999`);

  const accounts = await getAllAccounts(user.id);

  // Fire background sync — don't block the response
  if (accounts.length > 0) {
    void Promise.allSettled(
      accounts.map((acc) => syncCalendar(user.id, acc.accountId))
    ).catch(() => {});
  }

  const emailByAccount = new Map(accounts.map((a) => [a.accountId, a.email]));

  // Return cached data immediately
  const cached = await prisma.cachedCalendarEvent.findMany({
    where: {
      userId: user.id,
      startDateTime: { lte: rangeEnd },
      endDateTime: { gte: rangeStart },
    },
    orderBy: { startDateTime: "asc" },
  });

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
