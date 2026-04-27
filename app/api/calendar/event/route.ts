import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { graphFetch, graphGet, graphPost } from "@/lib/microsoft/graph";
import { mapGraphEvent, type CalEvent, type GraphCalEvent, CALENDAR_SELECT } from "@/lib/types/calendar";
import { verifyAccountOwnership, getAllAccounts } from "@/lib/providers/registry";

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

  // Detect if event body contains a Teams meeting URL — if so, mark as online meeting
  // so Graph API includes the join link in the ICS invite sent to attendees
  const hasTeamsUrl = data.body?.includes("teams.microsoft.com") ?? false;

  return {
    subject: data.subject,
    ...(data.body ? { body: { contentType: "HTML", content: data.body } } : {}),
    start: { dateTime: data.start, timeZone: tz },
    end: { dateTime: data.end, timeZone: tz },
    isAllDay: data.isAllDay ?? false,
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
  if (!data.subject || !data.start || !data.end) {
    return NextResponse.json({ error: "subject, start, end required" }, { status: 400 });
  }

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
    const created = await graphPost<GraphCalEvent>(user.id, accountId, "/me/events", buildGraphPayload(data));
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
      where: { id: created.id },
      update: {
        subject: created.subject ?? "",
        startDateTime: new Date(created.start.dateTime),
        endDateTime: new Date(created.end.dateTime),
        timeZone: created.start.timeZone ?? data.timeZone ?? "UTC",
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
        startDateTime: new Date(created.start.dateTime),
        endDateTime: new Date(created.end.dateTime),
        timeZone: created.start.timeZone ?? data.timeZone ?? "UTC",
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

  const { eventId, ...data } = await req.json() as EventBody & { eventId: string };
  if (!eventId || !data.homeAccountId) {
    return NextResponse.json({ error: "eventId and homeAccountId required" }, { status: 400 });
  }

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
      body: JSON.stringify(buildGraphPayload(data)),
    });
    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: `Graph error: ${err}` }, { status: res.status });
    }
    const updated = await graphGet<GraphCalEvent>(
      user.id, data.homeAccountId, `/me/events/${verifiedEventId}?$select=${CALENDAR_SELECT}`
    );
    const event: CalEvent = mapGraphEvent(updated, data.homeAccountId, account.email ?? "");

    // Update cache after successful modification
    await prisma.cachedCalendarEvent.update({
      where: { id: verifiedEventId },
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

  const { eventId, homeAccountId } = await req.json() as { eventId: string; homeAccountId: string };
  if (!eventId || !homeAccountId) {
    return NextResponse.json({ error: "eventId and homeAccountId required" }, { status: 400 });
  }

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
      where: { id: verifiedEventId },
    }).catch(() => {
      // Event might already be deleted by sync — not fatal
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
