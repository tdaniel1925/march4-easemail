import { graphFetch } from "@/lib/microsoft/graph";
import { prisma } from "@/lib/prisma";
import { detectProviderType } from "@/lib/providers/registry";
import { JmapProvider } from "@/lib/providers/jmap";
import type { NormalizedCalendarEvent } from "@/lib/providers/types";

const GRAPH_BASE = "https://graph.microsoft.com/v1.0";
const CALENDAR_DELTA_KEY = "calendar";
const MAX_PAGES = 100;
// Note: timeZone is NOT a top-level event property — it's nested inside start.timeZone / end.timeZone
// which are automatically included when selecting start and end
const CAL_SELECT =
  "id,subject,bodyPreview,start,end,isAllDay,location,organizer,responseStatus,onlineMeeting,attendees,recurrence";

interface CalDeltaResponse {
  value: CalDeltaItem[];
  "@odata.nextLink"?: string;
  "@odata.deltaLink"?: string;
}

interface CalDeltaItem {
  id: string;
  subject?: string;
  bodyPreview?: string;
  start?: { dateTime: string; timeZone?: string };
  end?: { dateTime: string; timeZone?: string };
  isAllDay?: boolean;
  location?: { displayName: string };
  organizer?: { emailAddress: { name: string; address: string } };
  responseStatus?: { response: string };
  onlineMeeting?: { joinUrl: string };
  attendees?: {
    emailAddress: { name: string; address: string };
    status: { response: string };
  }[];
  recurrence?: object | null;
  "@removed"?: { reason: string };
}

export async function syncCalendar(
  userId: string,
  homeAccountId: string
): Promise<void> {
  // Non-Microsoft accounts — route through their provider's fetchEvents()
  if (detectProviderType(homeAccountId) !== "microsoft") {
    const provider = homeAccountId.startsWith("jmap:") ? new JmapProvider() : null;
    if (!provider) return; // imap has no calendar support yet

    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const twoYearsAhead = new Date();
    twoYearsAhead.setFullYear(twoYearsAhead.getFullYear() + 2);

    const events = await provider.fetchEvents(
      userId,
      homeAccountId,
      oneYearAgo.toISOString(),
      twoYearsAhead.toISOString()
    );

    await Promise.all(
      events.map((e: NormalizedCalendarEvent) =>
        prisma.cachedCalendarEvent.upsert({
          where: { id: e.id },
          update: {
            subject: e.subject,
            bodyPreview: e.bodyPreview ?? "",
            startDateTime: new Date(e.startDateTime),
            endDateTime: new Date(e.endDateTime),
            isAllDay: e.isAllDay,
            location: e.location ?? null,
            organizerName: e.organizer?.name ?? null,
            organizerEmail: e.organizer?.address ?? null,
            responseStatus: e.responseStatus ?? "none",
            onlineMeetingUrl: e.onlineMeetingUrl ?? null,
            attendees: JSON.parse(JSON.stringify(e.attendees ?? [])),
            isRecurring: e.isRecurring ?? false,
            timeZone: e.timeZone ?? "UTC",
            syncedAt: new Date(),
          },
          create: {
            id: e.id,
            userId,
            homeAccountId,
            subject: e.subject,
            bodyPreview: e.bodyPreview ?? "",
            startDateTime: new Date(e.startDateTime),
            endDateTime: new Date(e.endDateTime),
            isAllDay: e.isAllDay,
            location: e.location ?? null,
            organizerName: e.organizer?.name ?? null,
            organizerEmail: e.organizer?.address ?? null,
            responseStatus: e.responseStatus ?? "none",
            onlineMeetingUrl: e.onlineMeetingUrl ?? null,
            attendees: JSON.parse(JSON.stringify(e.attendees ?? [])),
            isRecurring: e.isRecurring ?? false,
            timeZone: e.timeZone ?? "UTC",
          },
        })
      )
    );
    return;
  }

  const deltaRecord = await prisma.emailDeltaLink.findUnique({
    where: {
      userId_homeAccountId_folderId: {
        userId,
        homeAccountId,
        folderId: CALENDAR_DELTA_KEY,
      },
    },
  });

  let initialPath: string;
  if (deltaRecord?.deltaToken && deltaRecord.deltaToken.startsWith("http")) {
    const fullUrl = deltaRecord.deltaToken;
    initialPath = fullUrl.startsWith(GRAPH_BASE)
      ? fullUrl.slice(GRAPH_BASE.length)
      : fullUrl;
  } else {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const twoYearsAhead = new Date();
    twoYearsAhead.setFullYear(twoYearsAhead.getFullYear() + 2);
    initialPath =
      `/me/calendarView/delta` +
      `?startDateTime=${encodeURIComponent(oneYearAgo.toISOString())}` +
      `&endDateTime=${encodeURIComponent(twoYearsAhead.toISOString())}` +
      `&$select=${CAL_SELECT}&$top=100`;
  }

  let path: string | null = initialPath;
  let lastDeltaLink: string | null = null;
  let pageCount = 0;

  while (path && pageCount < MAX_PAGES) {
    pageCount++;

    const res = await graphFetch(userId, homeAccountId, path);

    if (res.status === 410) {
      await prisma.emailDeltaLink.deleteMany({
        where: { userId, homeAccountId, folderId: CALENDAR_DELTA_KEY },
      });
      return;
    }

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Calendar delta sync failed ${res.status}: ${err}`);
    }

    const data: CalDeltaResponse = await res.json();
    const items = data.value ?? [];

    const toDelete: string[] = [];
    const toUpsert: CalDeltaItem[] = [];

    for (const item of items) {
      if (item["@removed"]) {
        toDelete.push(item.id);
      } else {
        toUpsert.push(item);
      }
    }

    if (toDelete.length > 0) {
      await prisma.cachedCalendarEvent.deleteMany({
        where: { id: { in: toDelete }, userId },
      });
    }

    if (toUpsert.length > 0) {
      await Promise.all(
        toUpsert.map((e) => {
          const startDateTime = e.start?.dateTime ? new Date(e.start.dateTime) : new Date();
          const endDateTime = e.end?.dateTime ? new Date(e.end.dateTime) : new Date();
          const timeZone = e.start?.timeZone || "UTC";
          const attendees = JSON.parse(
            JSON.stringify(
              (e.attendees ?? []).map((a) => ({
                name: a.emailAddress.name,
                address: a.emailAddress.address,
                responseStatus: a.status?.response,
              }))
            )
          );

          return prisma.cachedCalendarEvent.upsert({
            where: { id: e.id },
            update: {
              subject: e.subject ?? "",
              bodyPreview: e.bodyPreview ?? "",
              startDateTime,
              endDateTime,
              isAllDay: e.isAllDay ?? false,
              location: e.location?.displayName ?? null,
              organizerName: e.organizer?.emailAddress?.name ?? null,
              organizerEmail: e.organizer?.emailAddress?.address ?? null,
              responseStatus: e.responseStatus?.response ?? "none",
              onlineMeetingUrl: e.onlineMeeting?.joinUrl ?? null,
              attendees,
              isRecurring: e.recurrence != null,
              timeZone,
              syncedAt: new Date(),
            },
            create: {
              id: e.id,
              userId,
              homeAccountId,
              subject: e.subject ?? "",
              bodyPreview: e.bodyPreview ?? "",
              startDateTime,
              endDateTime,
              isAllDay: e.isAllDay ?? false,
              location: e.location?.displayName ?? null,
              organizerName: e.organizer?.emailAddress?.name ?? null,
              organizerEmail: e.organizer?.emailAddress?.address ?? null,
              responseStatus: e.responseStatus?.response ?? "none",
              onlineMeetingUrl: e.onlineMeeting?.joinUrl ?? null,
              attendees,
              isRecurring: e.recurrence != null,
              timeZone,
            },
          });
        })
      );
    }

    lastDeltaLink = data["@odata.deltaLink"] ?? null;
    if (lastDeltaLink) {
      path = null;
    } else {
      const next = data["@odata.nextLink"] ?? null;
      path = next
        ? next.startsWith(GRAPH_BASE)
          ? next.slice(GRAPH_BASE.length)
          : next
        : null;
    }
  }

  if (lastDeltaLink) {
    await prisma.emailDeltaLink.upsert({
      where: {
        userId_homeAccountId_folderId: {
          userId,
          homeAccountId,
          folderId: CALENDAR_DELTA_KEY,
        },
      },
      update: { deltaToken: lastDeltaLink, updatedAt: new Date() },
      create: {
        userId,
        homeAccountId,
        folderId: CALENDAR_DELTA_KEY,
        deltaToken: lastDeltaLink,
        updatedAt: new Date(),
      },
    });
  }
}
