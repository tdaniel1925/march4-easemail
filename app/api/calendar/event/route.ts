import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { graphFetch, graphGet } from "@/lib/microsoft/graph";
import { mapGraphEvent, type CalEvent, type GraphCalEvent, CALENDAR_SELECT } from "@/lib/types/calendar";

interface EventBody {
  homeAccountId: string;
  subject: string;
  start: string;          // ISO datetime
  end: string;            // ISO datetime
  isAllDay?: boolean;
  location?: string;
  body?: string;
  attendees?: string[];   // email addresses
  timeZone?: string;
  reminderMinutes?: number | null; // Reminder in minutes (null = no reminder)
  showAs?: string;        // busy | free | tentative
  recurrence?: string | null;    // daily | weekly | monthly | null
}

function buildGraphPayload(data: EventBody) {
  const tz = data.timeZone ?? "UTC";

  // Build recurrence pattern for Graph API
  let recurrencePattern = null;
  if (data.recurrence && data.recurrence !== "null") {
    const startDate = new Date(data.start).toISOString().split("T")[0];
    recurrencePattern = {
      pattern: {
        type: data.recurrence, // "daily" | "weekly" | "monthly"
        interval: 1,
      },
      range: {
        type: "noEnd",
        startDate,
      },
    };
  }

  return {
    subject: data.subject,
    ...(data.body ? { body: { contentType: "text", content: data.body } } : {}),
    start: { dateTime: data.start, timeZone: tz },
    end: { dateTime: data.end, timeZone: tz },
    isAllDay: data.isAllDay ?? false,
    ...(data.location ? { location: { displayName: data.location } } : {}),
    ...(data.attendees?.length
      ? {
          attendees: data.attendees.map((a) => ({
            emailAddress: { address: a },
            type: "required",
          })),
        }
      : {}),
    ...(data.reminderMinutes !== undefined && data.reminderMinutes !== null
      ? {
          isReminderOn: true,
          reminderMinutesBeforeStart: data.reminderMinutes,
        }
      : { isReminderOn: false }),
    ...(data.showAs ? { showAs: data.showAs } : {}),
    ...(recurrencePattern ? { recurrence: recurrencePattern } : {}),
  };
}

// ── POST — create event ───────────────────────────────────────────────────────
export async function POST(req: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await req.json() as EventBody;
  if (!data.homeAccountId || !data.subject || !data.start || !data.end) {
    return NextResponse.json({ error: "homeAccountId, subject, start, end required" }, { status: 400 });
  }

  try {
    const res = await graphFetch(user.id, data.homeAccountId, "/me/events", {
      method: "POST",
      body: JSON.stringify(buildGraphPayload(data)),
    });
    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: `Graph error: ${err}` }, { status: res.status });
    }
    const created = await res.json() as GraphCalEvent;
    const event: CalEvent = mapGraphEvent(created, data.homeAccountId, "");
    return NextResponse.json({ ok: true, event });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// ── PATCH — update event ──────────────────────────────────────────────────────
export async function PATCH(req: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { eventId, ...data } = await req.json() as EventBody & { eventId: string };
  if (!eventId || !data.homeAccountId) {
    return NextResponse.json({ error: "eventId and homeAccountId required" }, { status: 400 });
  }

  try {
    // FIX CRITICAL SECURITY: Verify event ownership before allowing update
    const cachedEvent = await prisma.cachedCalendarEvent.findFirst({
      where: {
        id: eventId,
        userId: user.id,
        homeAccountId: data.homeAccountId,
      },
    });

    if (!cachedEvent) {
      return NextResponse.json(
        { error: "Event not found or access denied" },
        { status: 404 }
      );
    }

    // Only proceed if ownership verified
    const res = await graphFetch(user.id, data.homeAccountId, `/me/events/${eventId}`, {
      method: "PATCH",
      body: JSON.stringify(buildGraphPayload(data)),
    });
    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: `Graph error: ${err}` }, { status: res.status });
    }
    const updated = await graphGet<GraphCalEvent>(
      user.id, data.homeAccountId, `/me/events/${eventId}?$select=${CALENDAR_SELECT}`
    );
    const event: CalEvent = mapGraphEvent(updated, data.homeAccountId, "");

    // FIX: Update cache after successful modification
    await prisma.cachedCalendarEvent.update({
      where: { id: eventId },
      data: {
        subject: updated.subject || "",
        bodyPreview: updated.bodyPreview || "",
        startDateTime: new Date(updated.start.dateTime),
        endDateTime: new Date(updated.end.dateTime),
        isAllDay: updated.isAllDay || false,
        location: updated.location?.displayName || null,
        organizerName: updated.organizer?.emailAddress?.name || null,
        organizerEmail: updated.organizer?.emailAddress?.address || null,
        onlineMeetingUrl: updated.onlineMeeting?.joinUrl || null,
        attendees: updated.attendees || [],
        reminderMinutes: data.reminderMinutes ?? null,
        showAs: data.showAs || "busy",
        recurrence: data.recurrence || null,
      },
    });

    return NextResponse.json({ ok: true, event });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// ── DELETE — delete event ─────────────────────────────────────────────────────
export async function DELETE(req: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { eventId, homeAccountId } = await req.json() as { eventId: string; homeAccountId: string };
  if (!eventId || !homeAccountId) {
    return NextResponse.json({ error: "eventId and homeAccountId required" }, { status: 400 });
  }

  try {
    // FIX CRITICAL SECURITY: Verify event ownership before allowing deletion
    const cachedEvent = await prisma.cachedCalendarEvent.findFirst({
      where: {
        id: eventId,
        userId: user.id,
        homeAccountId: homeAccountId,
      },
    });

    if (!cachedEvent) {
      return NextResponse.json(
        { error: "Event not found or access denied" },
        { status: 404 }
      );
    }

    // Only proceed if ownership verified
    const res = await graphFetch(user.id, homeAccountId, `/me/events/${eventId}`, { method: "DELETE" });
    if (!res.ok && res.status !== 204) {
      const err = await res.text();
      return NextResponse.json({ error: `Graph error: ${err}` }, { status: res.status });
    }

    // FIX: Clean up cache after successful deletion
    await prisma.cachedCalendarEvent.delete({
      where: { id: eventId },
    }).catch(() => {
      // Event might already be deleted by sync - not fatal
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
