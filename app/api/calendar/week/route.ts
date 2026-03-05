import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { graphGet } from "@/lib/microsoft/graph";
import type { CalEvent } from "@/components/calendar/CalendarClient";

// ─── Graph shapes ─────────────────────────────────────────────────────────────

interface GraphEvent {
  id: string;
  subject: string;
  start: { dateTime: string; timeZone: string };
  end: { dateTime: string; timeZone: string };
  location?: { displayName: string };
  attendees?: { emailAddress: { name: string; address: string } }[];
  bodyPreview?: string;
}

interface GraphEventList {
  value: GraphEvent[];
}

// ─── GET /api/calendar/week?start={isoDate} ───────────────────────────────────

export async function GET(req: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startParam = req.nextUrl.searchParams.get("start");
  if (!startParam) {
    return NextResponse.json(
      { error: "start query param required (ISO date)" },
      { status: 400 }
    );
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { msAccounts: { orderBy: { isDefault: "desc" } } },
  });
  if (!dbUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const defaultAccount =
    dbUser.msAccounts.find((a) => a.isDefault) ?? dbUser.msAccounts[0];
  if (!defaultAccount) {
    return NextResponse.json(
      { error: "No connected account" },
      { status: 400 }
    );
  }

  // Build date range: startParam is Monday, weekEnd = Monday + 6 days at 23:59:59
  const weekStartDate = new Date(`${startParam}T00:00:00`);
  const weekEndDate = new Date(weekStartDate);
  weekEndDate.setDate(weekStartDate.getDate() + 6);
  weekEndDate.setHours(23, 59, 59, 999);

  try {
    const eventsData = await graphGet<GraphEventList>(
      user.id,
      defaultAccount.homeAccountId,
      `/me/calendarView?startDateTime=${encodeURIComponent(weekStartDate.toISOString())}&endDateTime=${encodeURIComponent(weekEndDate.toISOString())}&$top=50&$select=id,subject,start,end,location,attendees,bodyPreview&$orderby=start/dateTime`
    );

    const events: CalEvent[] = (eventsData.value ?? []).map((e) => ({
      id: e.id,
      subject: e.subject ?? "(no subject)",
      startDateTime: e.start.dateTime,
      endDateTime: e.end.dateTime,
      location: e.location?.displayName ?? "",
      attendeeCount: e.attendees?.length ?? 0,
    }));

    return NextResponse.json({ events });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to fetch calendar events: ${message}` },
      { status: 500 }
    );
  }
}
