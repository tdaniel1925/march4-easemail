import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { graphGet } from "@/lib/microsoft/graph";
import {
  type CalEvent,
  type GraphCalEvent,
  type GraphCalEventList,
  mapGraphEvent,
  CALENDAR_SELECT,
} from "@/lib/types/calendar";

const GRAPH_BASE = "https://graph.microsoft.com/v1.0";

type PagedCalEventList = GraphCalEventList & { "@odata.nextLink"?: string };

async function fetchAllPages(
  userId: string,
  homeAccountId: string,
  initialPath: string
): Promise<GraphCalEvent[]> {
  const all: GraphCalEvent[] = [];
  let path: string | null = initialPath;
  while (path) {
    const data: PagedCalEventList = await graphGet<PagedCalEventList>(userId, homeAccountId, path);
    all.push(...(data.value ?? []));
    const next: string | null = data["@odata.nextLink"] ?? null;
    path = next ? (next.startsWith(GRAPH_BASE) ? next.slice(GRAPH_BASE.length) : next) : null;
  }
  return all;
}

// ─── GET /api/calendar/range?start={YYYY-MM-DD}&end={YYYY-MM-DD} ──────────────
// Fetches events for an arbitrary date range across ALL connected accounts.

export async function GET(req: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const startParam = req.nextUrl.searchParams.get("start");
  const endParam = req.nextUrl.searchParams.get("end");
  if (!startParam || !endParam) {
    return NextResponse.json({ error: "start and end params required (YYYY-MM-DD)" }, { status: 400 });
  }

  const accounts = await prisma.msConnectedAccount.findMany({
    where: { userId: user.id },
    orderBy: { isDefault: "desc" },
  });
  if (!accounts.length) return NextResponse.json({ events: [] });

  const rangeStart = new Date(`${startParam}T00:00:00`);
  const rangeEnd = new Date(`${endParam}T23:59:59.999`);

  const graphPath =
    `/me/calendarView` +
    `?startDateTime=${encodeURIComponent(rangeStart.toISOString())}` +
    `&endDateTime=${encodeURIComponent(rangeEnd.toISOString())}` +
    `&$select=${CALENDAR_SELECT}` +
    `&$top=100`;

  const results = await Promise.allSettled(
    accounts.map((acc) =>
      fetchAllPages(user.id, acc.homeAccountId, graphPath).then((events) =>
        events.map((e) => mapGraphEvent(e, acc.homeAccountId, acc.msEmail))
      )
    )
  );

  const events: CalEvent[] = results
    .filter((r): r is PromiseFulfilledResult<CalEvent[]> => r.status === "fulfilled")
    .flatMap((r) => r.value)
    .sort((a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime());

  return NextResponse.json({ events });
}
