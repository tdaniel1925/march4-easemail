import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { graphFetch } from "@/lib/microsoft/graph";
import { mapGraphEvent, type CalEvent, type GraphCalEvent, CALENDAR_SELECT } from "@/lib/types/calendar";
import { verifyAccountOwnership, getAllAccounts } from "@/lib/providers/registry";
import { z } from "zod";
import {
  createEventSchema,
  updateEventSchema,
  deleteEventSchema,
} from "@/lib/validation/schemas";

type EventBody = z.infer<typeof createEventSchema>;

// Graph returns dateTimes as NAIVE strings (no offset). With the
// `Prefer: outlook.timezone="UTC"` header they are UTC — append "Z" so
// new Date() doesn't parse them as server-local time.
const GRAPH_PREFER_UTC = { Prefer: 'outlook.timezone="UTC"' };

function parseGraphDateTime(dateTime: string): Date {
  const hasOffset = /Z$|[+-]\d{2}:\d{2}$/i.test(dateTime);
  return new Date(hasOffset ? dateTime : `${dateTime}Z`);
}

const WEEKDAY_NAMES = [
  "sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday",
] as const;

// `partial` = true for PATCH: only emit fields the client explicitly sent, so
// untouched fields (body, reminder, showAs, recurrence, attendees) are preserved
// by Graph rather than reset to defaults.
function buildGraphPayload(data: EventBody, partial = false) {
  const tz = data.timeZone ?? "UTC";

  // For all-day events Graph requires the end to be the EXCLUSIVE next-day
  // midnight (start = date 00:00, end = date+1 00:00). Normalise both ends.
  const isAllDay = data.isAllDay ?? false;
  let startDateTime = data.start;
  let endDateTime = data.end;
  if (isAllDay) {
    const startDay = data.start.split("T")[0];
    const endDaySource = data.end.split("T")[0];
    // Graph rejects an all-day event whose end is not strictly after start.
    // If client sent end == start (or earlier), roll end forward to start+1 day.
    const nextDay = (d: string) => {
      const dt = new Date(`${d}T00:00:00Z`);
      dt.setUTCDate(dt.getUTCDate() + 1);
      return dt.toISOString().split("T")[0];
    };
    startDateTime = `${startDay}T00:00:00`;
    endDateTime = `${endDaySource > startDay ? endDaySource : nextDay(startDay)}T00:00:00`;
  }

  // Build recurrence pattern for Graph API
  let recurrencePattern = null;
  if (data.recurrence && data.recurrence !== "null") {
    const start = new Date(startDateTime);
    const startDate = start.toISOString().split("T")[0];

    // Graph requires extra fields per pattern type:
    //   weekly          → daysOfWeek (derived from the event start weekday)
    //   absoluteMonthly → dayOfMonth (derived from the event start date)
    // The client only sends "daily" | "weekly" | "monthly".
    let pattern: Record<string, unknown>;
    if (data.recurrence === "weekly") {
      pattern = { type: "weekly", interval: 1, daysOfWeek: [WEEKDAY_NAMES[start.getUTCDay()]] };
    } else if (data.recurrence === "monthly") {
      pattern = { type: "absoluteMonthly", interval: 1, dayOfMonth: start.getUTCDate() };
    } else {
      pattern = { type: data.recurrence, interval: 1 };
    }

    recurrencePattern = {
      pattern,
      range: {
        type: "noEnd",
        startDate,
      },
    };
  }

  // Detect if event body contains a Teams meeting URL — if so, mark as online meeting
  // so Graph API includes the join link in the ICS invite sent to attendees
  const hasTeamsUrl = data.body?.includes("teams.microsoft.com") ?? false;

  return {
    subject: data.subject,
    // In partial (PATCH) mode, only overwrite the body when the client actually
    // sent one — otherwise the existing Graph body is preserved.
    ...(data.body !== undefined && (!partial || data.body)
      ? { body: { contentType: "HTML", content: data.body } }
      : {}),
    start: { dateTime: startDateTime, timeZone: tz },
    end: { dateTime: endDateTime, timeZone: tz },
    isAllDay,
    ...(data.location ? { location: { displayName: data.location } } : {}),
    ...(data.attendees?.length
      ? {
          attendees: data.attendees.map((a) => ({
            emailAddress: { address: a, name: a },
            type: "required" as const,
          })),
        }
      : {}),
    // Tell Graph to send invites when attendees are present
    // responseRequested ensures attendees get the ICS invitation email
    ...(data.attendees?.length ? { responseRequested: true } : {}),
    // Mark as online Teams meeting when a Teams URL is present
    ...(hasTeamsUrl
      ? { isOnlineMeeting: true, onlineMeetingProvider: "teamsForBusiness" }
      : {}),
    // reminder/showAs/recurrence: in partial mode only set when explicitly
    // provided, so a drag-drop or other partial PATCH never strips them.
    ...(data.reminderMinutes !== undefined && data.reminderMinutes !== null
      ? { isReminderOn: true, reminderMinutesBeforeStart: data.reminderMinutes }
      : partial ? {} : { isReminderOn: false }),
    ...(data.showAs ? { showAs: data.showAs } : {}),
    ...(recurrencePattern
      ? { recurrence: recurrencePattern }
      : partial ? {} : {}),
  };
}

// ── POST — create event ───────────────────────────────────────────────────────
export async function POST(req: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = createEventSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const data = parsed.data;

  // Resolve account: use provided homeAccountId or fall back to default
  let accountId = data.homeAccountId;
  if (!accountId) {
    const accounts = await getAllAccounts(user.id);
    const defaultAccount = accounts.find((a) => a.isDefault) ?? accounts[0];
    if (!defaultAccount) return NextResponse.json({ error: "No connected account" }, { status: 404 });
    accountId = defaultAccount.accountId;
  }

  // Verify ownership
  const account = await verifyAccountOwnership(user.id, accountId);
  if (!account) return NextResponse.json({ error: "Account not found" }, { status: 404 });

  try {
    const createRes = await graphFetch(user.id, accountId, "/me/events", {
      method: "POST",
      headers: GRAPH_PREFER_UTC,
      body: JSON.stringify(buildGraphPayload(data)),
    });
    if (!createRes.ok) {
      const err = await createRes.text();
      return NextResponse.json({ error: `Graph error: ${err}` }, { status: createRes.status });
    }
    const created = await createRes.json() as GraphCalEvent;
    const event: CalEvent = mapGraphEvent(created, accountId, account.email ?? "");

    // Cache the event immediately so it persists across page navigations
    const attendees = JSON.parse(JSON.stringify(
      (created.attendees ?? []).map((a) => ({
        name: a.emailAddress?.name ?? "",
        address: a.emailAddress?.address ?? "",
        responseStatus: a.status?.response,
      }))
    ));
    await prisma.cachedCalendarEvent.upsert({
      where: {
        userId_homeAccountId_id: { userId: user.id, homeAccountId: accountId, id: created.id },
      },
      update: {
        subject: created.subject ?? "",
        startDateTime: parseGraphDateTime(created.start.dateTime),
        endDateTime: parseGraphDateTime(created.end.dateTime),
        timeZone: data.timeZone ?? created.start.timeZone ?? "UTC",
        isAllDay: created.isAllDay ?? false,
        location: created.location?.displayName ?? null,
        bodyPreview: data.body ?? "",
        attendees,
        organizerName: created.organizer?.emailAddress?.name ?? "",
        organizerEmail: created.organizer?.emailAddress?.address ?? "",
        responseStatus: created.responseStatus?.response ?? "organizer",
        onlineMeetingUrl: created.onlineMeeting?.joinUrl ?? null,
        isRecurring: created.recurrence != null,
        reminderMinutes: data.reminderMinutes ?? null,
        showAs: data.showAs ?? "busy",
        recurrence: data.recurrence ?? null,
        syncedAt: new Date(),
      },
      create: {
        id: created.id,
        userId: user.id,
        homeAccountId: accountId,
        subject: created.subject ?? "",
        startDateTime: parseGraphDateTime(created.start.dateTime),
        endDateTime: parseGraphDateTime(created.end.dateTime),
        timeZone: data.timeZone ?? created.start.timeZone ?? "UTC",
        isAllDay: created.isAllDay ?? false,
        location: created.location?.displayName ?? null,
        bodyPreview: data.body ?? "",
        attendees,
        organizerName: created.organizer?.emailAddress?.name ?? "",
        organizerEmail: created.organizer?.emailAddress?.address ?? "",
        responseStatus: created.responseStatus?.response ?? "organizer",
        onlineMeetingUrl: created.onlineMeeting?.joinUrl ?? null,
        isRecurring: created.recurrence != null,
        reminderMinutes: data.reminderMinutes ?? null,
        showAs: data.showAs ?? "busy",
        recurrence: data.recurrence ?? null,
      },
    }).catch(() => {}); // Non-fatal — sync will pick it up

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

  const parsedPatch = updateEventSchema.safeParse(await req.json().catch(() => null));
  if (!parsedPatch.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsedPatch.error.flatten() },
      { status: 400 }
    );
  }
  const { eventId, ...data } = parsedPatch.data;

  // Verify account ownership before any data access
  const account = await verifyAccountOwnership(user.id, data.homeAccountId);
  if (!account) return NextResponse.json({ error: "Account not found" }, { status: 404 });

  try {
    // Verify event ownership — select only the DB primary key to avoid using raw request value
    const cachedEvent = await prisma.cachedCalendarEvent.findFirst({
      where: {
        id: eventId,
        userId: user.id,
        homeAccountId: data.homeAccountId,
      },
      select: { id: true },
    });

    if (!cachedEvent) {
      return NextResponse.json(
        { error: "Event not found or access denied" },
        { status: 404 }
      );
    }

    // Use the DB-verified ID for all subsequent operations — never the raw request value
    const verifiedEventId = cachedEvent.id;

    const res = await graphFetch(user.id, data.homeAccountId, `/me/events/${verifiedEventId}`, {
      method: "PATCH",
      headers: GRAPH_PREFER_UTC,
      body: JSON.stringify(buildGraphPayload(data, true)),
    });
    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: `Graph error: ${err}` }, { status: res.status });
    }
    const getRes = await graphFetch(
      user.id, data.homeAccountId, `/me/events/${verifiedEventId}?$select=${CALENDAR_SELECT}`,
      { headers: GRAPH_PREFER_UTC }
    );
    if (!getRes.ok) {
      const err = await getRes.text();
      return NextResponse.json({ error: `Graph error: ${err}` }, { status: getRes.status });
    }
    const updated = await getRes.json() as GraphCalEvent;
    const event: CalEvent = mapGraphEvent(updated, data.homeAccountId, account.email ?? "");

    // Cache the same mapped attendee shape that POST writes ({name,address,
    // responseStatus}) so rendering after an edit matches a freshly-created event.
    const mappedAttendees = JSON.parse(JSON.stringify(
      (updated.attendees ?? []).map((a) => ({
        name: a.emailAddress?.name ?? "",
        address: a.emailAddress?.address ?? "",
        responseStatus: a.status?.response,
      }))
    ));

    // Partial-update semantics: only overwrite reminder/showAs/recurrence in the
    // cache when the PATCH explicitly included them — otherwise keep what's cached.
    await prisma.cachedCalendarEvent.update({
      where: {
        userId_homeAccountId_id: {
          userId: user.id,
          homeAccountId: data.homeAccountId,
          id: verifiedEventId,
        },
      },
      data: {
        subject: updated.subject || "",
        bodyPreview: updated.bodyPreview || "",
        startDateTime: parseGraphDateTime(updated.start.dateTime),
        endDateTime: parseGraphDateTime(updated.end.dateTime),
        isAllDay: updated.isAllDay || false,
        location: updated.location?.displayName || null,
        organizerName: updated.organizer?.emailAddress?.name || null,
        organizerEmail: updated.organizer?.emailAddress?.address || null,
        onlineMeetingUrl: updated.onlineMeeting?.joinUrl || null,
        attendees: mappedAttendees,
        ...(data.reminderMinutes !== undefined ? { reminderMinutes: data.reminderMinutes } : {}),
        ...(data.showAs !== undefined ? { showAs: data.showAs } : {}),
        ...(data.recurrence !== undefined ? { recurrence: data.recurrence } : {}),
        timeZone: data.timeZone ?? "UTC",
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

  const parsedDelete = deleteEventSchema.safeParse(await req.json().catch(() => null));
  if (!parsedDelete.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsedDelete.error.flatten() },
      { status: 400 }
    );
  }
  const { eventId, homeAccountId } = parsedDelete.data;

  // Verify account ownership before any data access
  const ownershipCheck = await verifyAccountOwnership(user.id, homeAccountId);
  if (!ownershipCheck) return NextResponse.json({ error: "Account not found" }, { status: 404 });

  try {
    // Verify event ownership — select only the DB primary key to avoid using raw request value
    const cachedEvent = await prisma.cachedCalendarEvent.findFirst({
      where: {
        id: eventId,
        userId: user.id,
        homeAccountId: homeAccountId,
      },
      select: { id: true },
    });

    if (!cachedEvent) {
      return NextResponse.json(
        { error: "Event not found or access denied" },
        { status: 404 }
      );
    }

    // Use the DB-verified ID for all subsequent operations — never the raw request value
    const verifiedEventId = cachedEvent.id;

    const res = await graphFetch(user.id, homeAccountId, `/me/events/${verifiedEventId}`, { method: "DELETE" });
    if (!res.ok && res.status !== 204) {
      const err = await res.text();
      return NextResponse.json({ error: `Graph error: ${err}` }, { status: res.status });
    }

    // Clean up cache after successful deletion
    await prisma.cachedCalendarEvent.delete({
      where: {
        userId_homeAccountId_id: { userId: user.id, homeAccountId, id: verifiedEventId },
      },
    }).catch(() => {
      // Event might already be deleted by sync — not fatal
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
