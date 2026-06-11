import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { getAllAccounts } from "@/lib/providers/registry";
import { syncCalendar } from "@/lib/sync/calendar-sync";
import type { CalEvent } from "@/lib/types/calendar";
import { z } from "zod";

const dayString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD")
  .refine((s) => !isNaN(new Date(`${s}T00:00:00`).getTime()), "Invalid date");

const rangeQuerySchema = z.object({ start: dayString, end: dayString });

// ─── GET /api/calendar/range?start={YYYY-MM-DD}&end={YYYY-MM-DD} ──────────────
// Returns events from cache immediately, fires background sync to keep cache fresh.

export async function GET(req: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsedQuery = rangeQuerySchema.safeParse({
    start: req.nextUrl.searchParams.get("start") ?? undefined,
    end: req.nextUrl.searchParams.get("end") ?? undefined,
  });
  if (!parsedQuery.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsedQuery.error.flatten() },
      { status: 400 }
    );
  }
  const { start: startParam, end: endParam } = parsedQuery.data;

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
