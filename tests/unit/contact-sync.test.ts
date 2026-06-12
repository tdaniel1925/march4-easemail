import { describe, it, expect, beforeEach, vi } from "vitest";

/**
 * Harness for syncContacts. Mocks only graphGet (network) + prisma (DB).
 * Exercises the REAL pagination, displayName filtering, first-email selection,
 * and the transactional delete-then-recreate full refresh.
 */

interface ContactRow { id: string; userId: string; homeAccountId: string; displayName: string; emailAddress: string; [k: string]: unknown }
const db = { contacts: new Map<string, ContactRow>() };

const prismaFake = {
  cachedContact: {
    deleteMany: vi.fn(async ({ where }: { where: { userId: string; homeAccountId: string } }) => {
      let count = 0;
      for (const [id, row] of db.contacts) {
        if (row.userId === where.userId && row.homeAccountId === where.homeAccountId) { db.contacts.delete(id); count++; }
      }
      return { count };
    }),
    createMany: vi.fn(async ({ data }: { data: ContactRow[] }) => {
      for (const row of data) db.contacts.set(row.id, row);
      return { count: data.length };
    }),
  },
  // syncContacts wraps the two ops in $transaction([...]) — await the array.
  $transaction: vi.fn(async (ops: Promise<unknown>[]) => Promise.all(ops)),
};

let pages: unknown[] = [];
const graphGetMock = vi.fn(async () => {
  const next = pages.shift();
  if (next === undefined) throw new Error("graphGet called more than scripted");
  return next;
});

vi.mock("@/lib/prisma", () => ({ prisma: prismaFake }));
vi.mock("@/lib/microsoft/graph", () => ({ graphGet: graphGetMock }));

const U = "user-1", H = "home-1";
beforeEach(() => {
  db.contacts.clear();
  pages = [];
  graphGetMock.mockClear();
  prismaFake.$transaction.mockClear();
  prismaFake.cachedContact.deleteMany.mockClear();
  prismaFake.cachedContact.createMany.mockClear();
});

describe("syncContacts", () => {
  it("maps contacts (first email, fallbacks) and filters out nameless ones", async () => {
    const { syncContacts } = await import("@/lib/sync/contact-sync");
    pages = [
      { value: [
        { id: "c1", displayName: "Alice", emailAddresses: [{ address: "alice@x.com" }, { address: "alt@x.com" }], jobTitle: "CEO" },
        { id: "c2", displayName: "", emailAddresses: [{ address: "noname@x.com" }] }, // filtered (no name)
        { id: "c3", displayName: "Bob" }, // no email → empty string
      ] },
    ];

    await syncContacts(U, H);

    expect(db.contacts.size).toBe(2);
    expect(db.contacts.get("c1")?.emailAddress).toBe("alice@x.com"); // first address
    expect(db.contacts.get("c1")?.jobTitle).toBe("CEO");
    expect(db.contacts.has("c2")).toBe(false); // nameless filtered out
    expect(db.contacts.get("c3")?.emailAddress).toBe(""); // fallback
  });

  it("paginates across nextLink pages", async () => {
    const { syncContacts } = await import("@/lib/sync/contact-sync");
    pages = [
      { value: [{ id: "p1", displayName: "P1" }], "@odata.nextLink": "https://graph.microsoft.com/v1.0/me/contacts?$skiptoken=N" },
      { value: [{ id: "p2", displayName: "P2" }] },
    ];

    await syncContacts(U, H);

    expect(graphGetMock).toHaveBeenCalledTimes(2);
    expect(db.contacts.size).toBe(2);
  });

  it("full refresh: pre-existing rows for the account are cleared before recreate", async () => {
    const { syncContacts } = await import("@/lib/sync/contact-sync");
    db.contacts.set("stale", { id: "stale", userId: U, homeAccountId: H, displayName: "Stale", emailAddress: "" });
    db.contacts.set("keep-other-account", { id: "keep-other-account", userId: U, homeAccountId: "home-2", displayName: "Other", emailAddress: "" });
    pages = [{ value: [{ id: "fresh", displayName: "Fresh" }] }];

    await syncContacts(U, H);

    expect(db.contacts.has("stale")).toBe(false); // cleared by full refresh
    expect(db.contacts.has("fresh")).toBe(true);
    expect(db.contacts.has("keep-other-account")).toBe(true); // other account untouched
    expect(prismaFake.$transaction).toHaveBeenCalledOnce();
  });
});
