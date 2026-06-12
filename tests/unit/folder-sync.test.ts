import { describe, it, expect, beforeEach, vi } from "vitest";

/**
 * Harness for syncFolders. Mocks only the boundaries:
 *  - graphGet (network) → keyed by request path so recursion is realistic.
 *  - prisma (DB) → in-memory cachedFolder upsert.
 * Exercises the REAL pagination + recursive-children + per-branch resilience.
 */

interface FolderRow { id: string; userId: string; homeAccountId: string; displayName: string; parentFolderId: string | null; wellKnownName: string | null; [k: string]: unknown }
const db = { folders: new Map<string, FolderRow>() };

const prismaFake = {
  cachedFolder: {
    upsert: vi.fn(async ({ where, update, create }: { where: { id: string }; update: Partial<FolderRow>; create: FolderRow }) => {
      const existing = db.folders.get(where.id);
      if (existing) { Object.assign(existing, update); return existing; }
      db.folders.set(create.id, create);
      return create;
    }),
  },
};

// graphGet responses keyed by a substring of the request path.
let routes: Array<{ match: string; reply: unknown | (() => never) }> = [];

// The default route-based implementation. Re-installed in beforeEach so a test
// that overrides it with mockImplementation does not leak into the next test.
const routeImpl = async (_u: string, _h: string, path: string) => {
  const r = routes.find((x) => path.includes(x.match));
  if (!r) throw new Error(`no scripted route for path: ${path}`);
  if (typeof r.reply === "function") return (r.reply as () => never)();
  return r.reply;
};
const graphGetMock = vi.fn(routeImpl);

vi.mock("@/lib/prisma", () => ({ prisma: prismaFake }));
vi.mock("@/lib/microsoft/graph", () => ({ graphGet: graphGetMock }));

const U = "user-1", H = "home-1";
beforeEach(() => {
  db.folders.clear();
  routes = [];
  graphGetMock.mockReset();
  graphGetMock.mockImplementation(routeImpl);
});

describe("syncFolders", () => {
  it("fetches top-level folders and persists them with ownership", async () => {
    const { syncFolders } = await import("@/lib/sync/folder-sync");
    routes = [
      { match: "/me/mailFolders?", reply: { value: [
        { id: "inbox", displayName: "Inbox", unreadItemCount: 3, totalItemCount: 10, childFolderCount: 0, wellKnownName: "inbox" },
        { id: "sent", displayName: "Sent", unreadItemCount: 0, totalItemCount: 5, childFolderCount: 0, wellKnownName: "sentitems" },
      ] } },
    ];

    const refs = await syncFolders(U, H);

    expect(db.folders.size).toBe(2);
    expect(db.folders.get("inbox")?.userId).toBe(U);
    expect(db.folders.get("inbox")?.wellKnownName).toBe("inbox");
    expect(refs).toEqual([
      { folderId: "inbox", wellKnownName: "inbox" },
      { folderId: "sent", wellKnownName: "sentitems" },
    ]);
  });

  it("recurses into child folders", async () => {
    const { syncFolders } = await import("@/lib/sync/folder-sync");
    routes = [
      { match: "/me/mailFolders?", reply: { value: [
        { id: "parent", displayName: "Parent", unreadItemCount: 0, totalItemCount: 0, childFolderCount: 1 },
      ] } },
      { match: "/me/mailFolders/parent/childFolders", reply: { value: [
        { id: "child", displayName: "Child", unreadItemCount: 1, totalItemCount: 2, childFolderCount: 0, parentFolderId: "parent" },
      ] } },
    ];

    await syncFolders(U, H);

    expect(db.folders.has("parent")).toBe(true);
    expect(db.folders.has("child")).toBe(true);
    expect(db.folders.get("child")?.parentFolderId).toBe("parent");
  });

  it("follows nextLink pagination at the top level", async () => {
    const { syncFolders } = await import("@/lib/sync/folder-sync");
    let firstCall = true;
    // Custom impl: first top-level call returns a nextLink, second returns page 2.
    graphGetMock.mockImplementation(async (_u: string, _h: string, path: string) => {
      if (path.includes("skiptoken=PAGE2")) {
        return { value: [{ id: "f2", displayName: "F2", unreadItemCount: 0, totalItemCount: 0, childFolderCount: 0 }] };
      }
      if (path.includes("/me/mailFolders?") && firstCall) {
        firstCall = false;
        return {
          value: [{ id: "f1", displayName: "F1", unreadItemCount: 0, totalItemCount: 0, childFolderCount: 0 }],
          "@odata.nextLink": "https://graph.microsoft.com/v1.0/me/mailFolders?$skiptoken=PAGE2",
        };
      }
      throw new Error(`unexpected path ${path}`);
    });

    await syncFolders(U, H);

    expect(db.folders.has("f1")).toBe(true);
    expect(db.folders.has("f2")).toBe(true);
  });

  it("a failing child branch does not kill the whole sync (siblings still saved)", async () => {
    const { syncFolders } = await import("@/lib/sync/folder-sync");
    routes = [
      { match: "/me/mailFolders?", reply: { value: [
        { id: "ok", displayName: "OK", unreadItemCount: 0, totalItemCount: 0, childFolderCount: 0 },
        { id: "bad", displayName: "Bad", unreadItemCount: 0, totalItemCount: 0, childFolderCount: 1 },
      ] } },
      { match: "/me/mailFolders/bad/childFolders", reply: () => { throw new Error("Graph 500 on this branch"); } },
    ];

    await syncFolders(U, H);

    // The healthy top-level folders are still persisted despite the bad branch.
    expect(db.folders.has("ok")).toBe(true);
    expect(db.folders.has("bad")).toBe(true);
  });
});
