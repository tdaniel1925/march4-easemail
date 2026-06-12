import { describe, it, expect, beforeEach, vi } from "vitest";

/**
 * Integration-style harness for syncEmails — the email delta-sync orchestration.
 *
 * Only the two boundaries are faked:
 *  - graphFetch (the network) → a scripted queue of Responses per test.
 *  - prisma (the DB) → a faithful in-memory fake of the handful of operations
 *    sync uses (emailDeltaLink find/upsert/deleteMany, cachedEmail
 *    upsert/deleteMany). Everything else — pagination, @removed handling,
 *    410 token reset, deltaLink persistence, field mapping — is the REAL code.
 */

// ── In-memory prisma fake ──────────────────────────────────────────────────────
interface CachedEmailRow {
  id: string;
  userId: string;
  homeAccountId: string;
  folderId: string;
  isRead: boolean;
  flagStatus: string;
  subject: string;
  [k: string]: unknown;
}
interface DeltaRow {
  userId: string;
  homeAccountId: string;
  folderId: string;
  deltaToken: string;
}

const db = {
  cachedEmails: new Map<string, CachedEmailRow>(),
  deltaLinks: new Map<string, DeltaRow>(),
};
const deltaKey = (u: string, h: string, f: string) => `${u}|${h}|${f}`;

const prismaFake = {
  emailDeltaLink: {
    findUnique: vi.fn(async ({ where }: { where: { userId_homeAccountId_folderId: { userId: string; homeAccountId: string; folderId: string } } }) => {
      const k = where.userId_homeAccountId_folderId;
      return db.deltaLinks.get(deltaKey(k.userId, k.homeAccountId, k.folderId)) ?? null;
    }),
    deleteMany: vi.fn(async ({ where }: { where: { userId: string; homeAccountId: string; folderId: string } }) => {
      db.deltaLinks.delete(deltaKey(where.userId, where.homeAccountId, where.folderId));
      return { count: 1 };
    }),
    upsert: vi.fn(async ({ where, update, create }: { where: { userId_homeAccountId_folderId: { userId: string; homeAccountId: string; folderId: string } }; update: { deltaToken: string }; create: DeltaRow }) => {
      const k = where.userId_homeAccountId_folderId;
      const key = deltaKey(k.userId, k.homeAccountId, k.folderId);
      const existing = db.deltaLinks.get(key);
      if (existing) {
        existing.deltaToken = update.deltaToken;
        return existing;
      }
      db.deltaLinks.set(key, create);
      return create;
    }),
  },
  cachedEmail: {
    deleteMany: vi.fn(async ({ where }: { where: { id: { in: string[] }; userId: string } }) => {
      let count = 0;
      for (const id of where.id.in) {
        const row = db.cachedEmails.get(id);
        if (row && row.userId === where.userId) {
          db.cachedEmails.delete(id);
          count++;
        }
      }
      return { count };
    }),
    upsert: vi.fn(async ({ where, update, create }: { where: { id: string }; update: Partial<CachedEmailRow>; create: CachedEmailRow }) => {
      const existing = db.cachedEmails.get(where.id);
      if (existing) {
        Object.assign(existing, update);
        return existing;
      }
      db.cachedEmails.set(create.id, create);
      return create;
    }),
  },
};

// graphFetch queue — each call shifts the next scripted Response.
// Signature mirrors graphFetch(userId, homeAccountId, path, options?, scopes?)
// so call args (notably the path at index 2) are typed.
let graphQueue: Response[] = [];
const graphFetchMock = vi.fn(
  async (_userId: string, _homeAccountId: string, _path: string): Promise<Response> => {
    const next = graphQueue.shift();
    if (!next) throw new Error("graphFetch called more times than scripted");
    return next;
  }
);

vi.mock("@/lib/prisma", () => ({ prisma: prismaFake }));
vi.mock("@/lib/microsoft/graph", () => ({ graphFetch: graphFetchMock }));

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

const U = "user-1", H = "home-1", F = "inbox";

beforeEach(() => {
  db.cachedEmails.clear();
  db.deltaLinks.clear();
  graphQueue = [];
  graphFetchMock.mockClear();
});

describe("syncEmails", () => {
  it("first sync: upserts messages and persists the delta link", async () => {
    const { syncEmails } = await import("@/lib/sync/email-sync");
    graphQueue = [
      jsonResponse({
        value: [
          { id: "m1", subject: "Hello", isRead: false, from: { emailAddress: { name: "A", address: "a@x.com" } }, receivedDateTime: "2026-06-12T10:00:00Z" },
          { id: "m2", subject: "World", isRead: true, receivedDateTime: "2026-06-12T11:00:00Z" },
        ],
        "@odata.deltaLink": "https://graph.microsoft.com/v1.0/delta?$deltatoken=TOKEN1",
      }),
    ];

    await syncEmails(U, H, F);

    expect(db.cachedEmails.size).toBe(2);
    expect(db.cachedEmails.get("m1")?.subject).toBe("Hello");
    expect(db.cachedEmails.get("m1")?.fromAddress).toBe("a@x.com");
    expect(db.cachedEmails.get("m2")?.isRead).toBe(true);
    // delta link persisted for next run
    expect(db.deltaLinks.get(deltaKey(U, H, F))?.deltaToken).toContain("deltatoken=TOKEN1");
  });

  it("follows nextLink across pages before persisting the final delta link", async () => {
    const { syncEmails } = await import("@/lib/sync/email-sync");
    graphQueue = [
      jsonResponse({
        value: [{ id: "p1", subject: "Page1", receivedDateTime: "2026-06-12T10:00:00Z" }],
        "@odata.nextLink": "https://graph.microsoft.com/v1.0/me/mailFolders/inbox/messages/delta?$skiptoken=NEXT",
      }),
      jsonResponse({
        value: [{ id: "p2", subject: "Page2", receivedDateTime: "2026-06-12T10:05:00Z" }],
        "@odata.deltaLink": "https://graph.microsoft.com/v1.0/delta?$deltatoken=FINAL",
      }),
    ];

    await syncEmails(U, H, F);

    expect(graphFetchMock).toHaveBeenCalledTimes(2);
    expect(db.cachedEmails.size).toBe(2);
    expect(db.deltaLinks.get(deltaKey(U, H, F))?.deltaToken).toContain("deltatoken=FINAL");
  });

  it("@removed items are deleted from the cache (scoped to the user)", async () => {
    const { syncEmails } = await import("@/lib/sync/email-sync");
    db.cachedEmails.set("gone", { id: "gone", userId: U, homeAccountId: H, folderId: F, isRead: false, flagStatus: "notFlagged", subject: "old" });
    db.cachedEmails.set("other-user", { id: "other-user", userId: "user-2", homeAccountId: H, folderId: F, isRead: false, flagStatus: "notFlagged", subject: "theirs" });
    graphQueue = [
      jsonResponse({
        value: [{ id: "gone", "@removed": { reason: "deleted" } }, { id: "other-user", "@removed": { reason: "deleted" } }],
        "@odata.deltaLink": "https://graph.microsoft.com/v1.0/delta?$deltatoken=T",
      }),
    ];

    await syncEmails(U, H, F);

    expect(db.cachedEmails.has("gone")).toBe(false); // our row removed
    expect(db.cachedEmails.has("other-user")).toBe(true); // another user's row untouched
  });

  it("410 Gone clears the stored delta token and returns (next run does a full sync)", async () => {
    const { syncEmails } = await import("@/lib/sync/email-sync");
    db.deltaLinks.set(deltaKey(U, H, F), { userId: U, homeAccountId: H, folderId: F, deltaToken: "http://expired" });
    graphQueue = [new Response("Gone", { status: 410 })];

    await syncEmails(U, H, F);

    expect(db.deltaLinks.has(deltaKey(U, H, F))).toBe(false);
    expect(graphFetchMock).toHaveBeenCalledTimes(1);
  });

  it("resumes from a stored http delta token instead of starting fresh", async () => {
    const { syncEmails } = await import("@/lib/sync/email-sync");
    db.deltaLinks.set(deltaKey(U, H, F), {
      userId: U, homeAccountId: H, folderId: F,
      deltaToken: "https://graph.microsoft.com/v1.0/me/mailFolders/inbox/messages/delta?$deltatoken=RESUME",
    });
    graphQueue = [jsonResponse({ value: [], "@odata.deltaLink": "https://graph.microsoft.com/v1.0/delta?$deltatoken=T2" })];

    await syncEmails(U, H, F);

    // The first (and only) graphFetch call should have used the resume path.
    const firstCallPath = graphFetchMock.mock.calls[0]?.[2];
    expect(firstCallPath).toContain("$deltatoken=RESUME");
  });

  it("throws on a non-410 error response (so the cron records the failure)", async () => {
    const { syncEmails } = await import("@/lib/sync/email-sync");
    graphQueue = [new Response("Server error", { status: 500 })];
    await expect(syncEmails(U, H, F)).rejects.toThrow(/failed 500/);
  });
});
