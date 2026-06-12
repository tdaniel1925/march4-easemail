import { describe, it, expect, beforeEach, vi } from "vitest";

/**
 * Harness for syncCalendar (Microsoft delta path). Mocks only graphFetch
 * (network) + prisma (DB). Exercises the REAL delta mechanics plus the
 * calendar-specific field mapping: UTC-safe datetime parsing, attendee
 * mapping, isRecurring derivation, all-day flag, @removed deletion.
 */

interface EventRow { id: string; userId: string; homeAccountId: string; subject: string; startDateTime: Date; endDateTime: Date; isAllDay: boolean; isRecurring: boolean; timeZone: string; attendees: unknown; responseStatus: string; [k: string]: unknown }
interface DeltaRow { userId: string; homeAccountId: string; folderId: string; deltaToken: string }

const db = { events: new Map<string, EventRow>(), deltas: new Map<string, DeltaRow>() };
const dk = (u: string, h: string, f: string) => `${u}|${h}|${f}`;

const prismaFake = {
  emailDeltaLink: {
    findUnique: vi.fn(async ({ where }: { where: { userId_homeAccountId_folderId: { userId: string; homeAccountId: string; folderId: string } } }) => {
      const k = where.userId_homeAccountId_folderId;
      return db.deltas.get(dk(k.userId, k.homeAccountId, k.folderId)) ?? null;
    }),
    deleteMany: vi.fn(async ({ where }: { where: { userId: string; homeAccountId: string; folderId: string } }) => {
      db.deltas.delete(dk(where.userId, where.homeAccountId, where.folderId));
      return { count: 1 };
    }),
    upsert: vi.fn(async ({ where, update, create }: { where: { userId_homeAccountId_folderId: { userId: string; homeAccountId: string; folderId: string } }; update: { deltaToken: string }; create: DeltaRow }) => {
      const k = where.userId_homeAccountId_folderId;
      const key = dk(k.userId, k.homeAccountId, k.folderId);
      const existing = db.deltas.get(key);
      if (existing) { existing.deltaToken = update.deltaToken; return existing; }
      db.deltas.set(key, create); return create;
    }),
  },
  cachedCalendarEvent: {
    deleteMany: vi.fn(async ({ where }: { where: { id: { in: string[] }; userId: string } }) => {
      let count = 0;
      for (const id of where.id.in) { const r = db.events.get(id); if (r && r.userId === where.userId) { db.events.delete(id); count++; } }
      return { count };
    }),
    upsert: vi.fn(async ({ where, update, create }: { where: { id: string }; update: Partial<EventRow>; create: EventRow }) => {
      const existing = db.events.get(where.id);
      if (existing) { Object.assign(existing, update); return existing; }
      db.events.set(create.id, create); return create;
    }),
  },
};

let graphQueue: Response[] = [];
const graphFetchMock = vi.fn(async (_u: string, _h: string, _p: string): Promise<Response> => {
  const next = graphQueue.shift();
  if (!next) throw new Error("graphFetch called more than scripted");
  return next;
});

vi.mock("@/lib/prisma", () => ({ prisma: prismaFake }));
vi.mock("@/lib/microsoft/graph", () => ({ graphFetch: graphFetchMock }));

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}
const U = "user-1", H = "home-1"; // microsoft (no imap:/jmap: prefix)

beforeEach(() => {
  db.events.clear(); db.deltas.clear(); graphQueue = []; graphFetchMock.mockClear();
  Object.values(prismaFake).forEach((m) => Object.values(m).forEach((fn) => (fn as { mockClear?: () => void }).mockClear?.()));
});

describe("syncCalendar (Microsoft delta path)", () => {
  it("maps event fields: UTC-safe datetimes, attendees, recurrence, all-day", async () => {
    const { syncCalendar } = await import("@/lib/sync/calendar-sync");
    graphQueue = [
      json({
        value: [
          {
            id: "e1", subject: "Standup",
            // offset-less Graph datetime — must be parsed as UTC, not server-local.
            start: { dateTime: "2026-06-12T09:00:00.0000000", timeZone: "Pacific Standard Time" },
            end: { dateTime: "2026-06-12T09:30:00.0000000", timeZone: "Pacific Standard Time" },
            isAllDay: false,
            organizer: { emailAddress: { name: "Boss", address: "boss@x.com" } },
            attendees: [{ emailAddress: { name: "Al", address: "al@x.com" }, status: { response: "accepted" } }],
            recurrence: { pattern: { type: "daily" } },
          },
        ],
        "@odata.deltaLink": "https://graph.microsoft.com/v1.0/delta?$deltatoken=T",
      }),
    ];

    await syncCalendar(U, H);

    const e = db.events.get("e1")!;
    expect(e.subject).toBe("Standup");
    expect(e.startDateTime.toISOString()).toBe("2026-06-12T09:00:00.000Z"); // UTC, no shift
    expect(e.endDateTime.toISOString()).toBe("2026-06-12T09:30:00.000Z");
    expect(e.timeZone).toBe("Pacific Standard Time");
    expect(e.isRecurring).toBe(true); // derived from recurrence != null
    expect(e.isAllDay).toBe(false);
    expect(e.organizerEmail).toBe("boss@x.com");
    expect(e.attendees).toEqual([{ name: "Al", address: "al@x.com", responseStatus: "accepted" }]);
  });

  it("non-recurring event has isRecurring false", async () => {
    const { syncCalendar } = await import("@/lib/sync/calendar-sync");
    graphQueue = [json({
      value: [{ id: "e2", subject: "One-off", start: { dateTime: "2026-06-12T10:00:00Z" }, end: { dateTime: "2026-06-12T11:00:00Z" } }],
      "@odata.deltaLink": "https://graph.microsoft.com/v1.0/delta?$deltatoken=T",
    })];
    await syncCalendar(U, H);
    expect(db.events.get("e2")?.isRecurring).toBe(false);
  });

  it("paginates via nextLink, then persists the final delta link", async () => {
    const { syncCalendar } = await import("@/lib/sync/calendar-sync");
    graphQueue = [
      json({ value: [{ id: "a", subject: "A", start: { dateTime: "2026-06-12T10:00:00Z" }, end: { dateTime: "2026-06-12T11:00:00Z" } }], "@odata.nextLink": "https://graph.microsoft.com/v1.0/me/calendarView/delta?$skiptoken=N" }),
      json({ value: [{ id: "b", subject: "B", start: { dateTime: "2026-06-12T12:00:00Z" }, end: { dateTime: "2026-06-12T13:00:00Z" } }], "@odata.deltaLink": "https://graph.microsoft.com/v1.0/delta?$deltatoken=FINAL" }),
    ];
    await syncCalendar(U, H);
    expect(graphFetchMock).toHaveBeenCalledTimes(2);
    expect(db.events.size).toBe(2);
    expect(db.deltas.get(dk(U, H, "calendar"))?.deltaToken).toContain("deltatoken=FINAL");
  });

  it("@removed events are deleted (scoped to the user)", async () => {
    const { syncCalendar } = await import("@/lib/sync/calendar-sync");
    db.events.set("gone", { id: "gone", userId: U, homeAccountId: H, subject: "x", startDateTime: new Date(), endDateTime: new Date(), isAllDay: false, isRecurring: false, timeZone: "UTC", attendees: [], responseStatus: "none" });
    db.events.set("theirs", { id: "theirs", userId: "user-2", homeAccountId: H, subject: "y", startDateTime: new Date(), endDateTime: new Date(), isAllDay: false, isRecurring: false, timeZone: "UTC", attendees: [], responseStatus: "none" });
    graphQueue = [json({ value: [{ id: "gone", "@removed": { reason: "deleted" } }, { id: "theirs", "@removed": { reason: "deleted" } }], "@odata.deltaLink": "https://graph.microsoft.com/v1.0/delta?$deltatoken=T" })];
    await syncCalendar(U, H);
    expect(db.events.has("gone")).toBe(false);
    expect(db.events.has("theirs")).toBe(true); // another user's event untouched
  });

  it("410 clears the stored delta token", async () => {
    const { syncCalendar } = await import("@/lib/sync/calendar-sync");
    db.deltas.set(dk(U, H, "calendar"), { userId: U, homeAccountId: H, folderId: "calendar", deltaToken: "http://expired" });
    graphQueue = [new Response("Gone", { status: 410 })];
    await syncCalendar(U, H);
    expect(db.deltas.has(dk(U, H, "calendar"))).toBe(false);
  });
});
