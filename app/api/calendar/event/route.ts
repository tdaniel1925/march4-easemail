import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
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
    // Note: recurrence is handled separately in Microsoft Graph API
    // For now, we store it in our DB but Graph needs specific recurrence pattern object
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
    const res = await graphFetch(user.id, homeAccountId, `/me/events/${eventId}`, { method: "DELETE" });
    if (!res.ok && res.status !== 204) {
      const err = await res.text();
      return NextResponse.json({ error: `Graph error: ${err}` }, { status: res.status });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
