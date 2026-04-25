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
// Returns week events immediately from Graph, fires background sync to keep cache fresh.

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

  // Fire background sync — don't block the response
  const syncPromise = Promise.allSettled(
    accounts.map((acc) => syncCalendar(user.id, acc.accountId))
  );

  // Fetch live from Graph for immediate response
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

  // Check for reauth errors from Graph fetch
  const requiresReauth = results.some(
    (r) => r.status === "rejected" && isReauthError(r.reason)
  );

  const errors = results
    .filter((r): r is PromiseRejectedResult => r.status === "rejected")
    .map((r) => String(r.reason));

  // Wait for background sync to finish (best-effort, don't fail if it errors)
  void syncPromise.catch(() => {});

  return NextResponse.json({
    events,
    ...(requiresReauth ? { requiresReauth: true } : {}),
    ...(errors.length ? { errors } : {}),
  });
}
