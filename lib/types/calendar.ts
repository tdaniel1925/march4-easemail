// ─── Core Calendar Types ──────────────────────────────────────────────────────

export interface CalEvent {
  id: string;
  subject: string;
  startDateTime: string;   // ISO 8601
  endDateTime: string;     // ISO 8601
  isAllDay: boolean;
  location?: string;
  bodyPreview?: string;
  organizer?: { name: string; address: string };
  attendees: { name: string; address: string; responseStatus?: string }[];
  onlineMeetingUrl?: string;
  responseStatus?: "none" | "organizer" | "accepted" | "declined" | "tentativelyAccepted" | "notResponded";
  accountHomeId: string;   // which connected account this event belongs to
  accountEmail: string;    // display label for that account
  isRecurring?: boolean;
}

export type CalendarView = "day" | "week" | "month" | "agenda" | "year";

export type EventType = "court" | "deposition" | "client" | "deadline" | "internal" | "other";

// ─── Graph API shapes (used by API routes only) ───────────────────────────────

export interface GraphCalEvent {
  id: string;
  subject: string;
  start: { dateTime: string; timeZone: string };
  end: { dateTime: string; timeZone: string };
  isAllDay: boolean;
  location?: { displayName: string };
  bodyPreview?: string;
  organizer?: { emailAddress: { name: string; address: string } };
  attendees?: {
    emailAddress: { name: string; address: string };
    status: { response: string };
  }[];
  onlineMeeting?: { joinUrl: string };
  responseStatus?: { response: string };
  recurrence?: object | null;
}

export interface GraphCalEventList {
  value: GraphCalEvent[];
}

// ─── Helper to map Graph shape → CalEvent ────────────────────────────────────

export function mapGraphEvent(
  e: GraphCalEvent,
  accountHomeId: string,
  accountEmail: string
): CalEvent {
  return {
    id: e.id,
    subject: e.subject ?? "(no subject)",
    startDateTime: e.start.dateTime,
    endDateTime: e.end.dateTime,
    isAllDay: e.isAllDay ?? false,
    location: e.location?.displayName || undefined,
    bodyPreview: e.bodyPreview || undefined,
    organizer: e.organizer
      ? { name: e.organizer.emailAddress.name, address: e.organizer.emailAddress.address }
      : undefined,
    attendees: (e.attendees ?? []).map((a) => ({
      name: a.emailAddress.name,
      address: a.emailAddress.address,
      responseStatus: a.status?.response,
    })),
    onlineMeetingUrl: e.onlineMeeting?.joinUrl || undefined,
    responseStatus: (e.responseStatus?.response as CalEvent["responseStatus"]) ?? "none",
    accountHomeId,
    accountEmail,
    isRecurring: e.recurrence != null,
  };
}

// ─── Graph calendarView $select fields ───────────────────────────────────────

export const CALENDAR_SELECT =
  "id,subject,start,end,isAllDay,location,bodyPreview,organizer,attendees,onlineMeeting,responseStatus,recurrence";
