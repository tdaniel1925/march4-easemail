import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { getAllAccounts } from "@/lib/providers/registry";
import { syncCalendar } from "@/lib/sync/calendar-sync";
import { isReauthError } from "@/lib/microsoft/auth-errors";
import type { CalEvent } from "@/lib/types/calendar";

// ─── GET /api/calendar/week?start={YYYY-MM-DD} ────────────────────────────────
// Fetches events for the given week across ALL connected accounts.

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

  // Sync calendar cache in background for each account
  const syncResults = await Promise.allSettled(
    accounts.map((acc) => syncCalendar(user.id, acc.accountId))
  );

  // Detect reauth errors
  const requiresReauth = syncResults.some(
    (r) => r.status === "rejected" && isReauthError(r.reason)
  );

  // Read from cache
  const cached = await prisma.cachedCalendarEvent.findMany({
    where: {
      userId: user.id,
      startDateTime: { lte: weekEnd },
      endDateTime: { gte: weekStart },
    },
    orderBy: { startDateTime: "asc" },
  });

  const emailByAccount = new Map(accounts.map((a) => [a.accountId, a.email]));

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

  const errors = syncResults
    .filter((r): r is PromiseRejectedResult => r.status === "rejected")
    .map((r) => String(r.reason));

  return NextResponse.json({
    events,
    ...(requiresReauth ? { requiresReauth: true } : {}),
    ...(errors.length ? { errors } : {}),
  });
}
