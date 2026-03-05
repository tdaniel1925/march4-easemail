import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { graphGet } from "@/lib/microsoft/graph";
import {
  type CalEvent,
  type GraphCalEventList,
  mapGraphEvent,
  CALENDAR_SELECT,
} from "@/lib/types/calendar";

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

  const accounts = await prisma.msConnectedAccount.findMany({
    where: { userId: user.id },
    orderBy: { isDefault: "desc" },
  });
  if (!accounts.length) {
    return NextResponse.json({ error: "No connected accounts" }, { status: 400 });
  }

  const weekStart = new Date(`${startParam}T00:00:00`);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  const graphPath =
    `/me/calendarView` +
    `?startDateTime=${encodeURIComponent(weekStart.toISOString())}` +
    `&endDateTime=${encodeURIComponent(weekEnd.toISOString())}` +
    `&$select=${CALENDAR_SELECT}` +
    `&$top=200`;

  // Fetch from all accounts in parallel — partial failures don't break the page
  const results = await Promise.allSettled(
    accounts.map((acc) =>
      graphGet<GraphCalEventList>(user.id, acc.homeAccountId, graphPath).then((data) =>
        (data.value ?? []).map((e) => mapGraphEvent(e, acc.homeAccountId, acc.msEmail))
      )
    )
  );

  const events: CalEvent[] = results
    .filter((r): r is PromiseFulfilledResult<CalEvent[]> => r.status === "fulfilled")
    .flatMap((r) => r.value)
    .sort((a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime());

  const errors = results
    .filter((r): r is PromiseRejectedResult => r.status === "rejected")
    .map((r) => String(r.reason));

  return NextResponse.json({ events, ...(errors.length ? { errors } : {}) });
}
