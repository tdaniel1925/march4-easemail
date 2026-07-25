import { beforeEach, describe, expect, it, vi } from "vitest";

const acquireTokenSilent = vi.fn();
const createMsalClient = vi.fn(() => ({}));

vi.mock("@/lib/microsoft/msal", () => ({
  GRAPH_SCOPES: ["scope"],
  TEAMS_SCOPES: ["teams-scope"],
  acquireTokenSilent,
  createMsalClient,
}));

describe("graphPost", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    acquireTokenSilent.mockResolvedValue("access-token");
  });

  it.each([202, 204])(
    "accepts an empty %s response without attempting to parse JSON",
    async (status) => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue(new Response(null, { status }))
      );
      const { graphPost } = await import("@/lib/microsoft/graph");

      await expect(
        graphPost("user-1", "account-1", "/me/sendMail", { message: {} })
      ).resolves.toBeUndefined();
    }
  );

  it("returns JSON for Graph endpoints that include a response body", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        Response.json({ id: "message-1" }, { status: 201 })
      )
    );
    const { graphPost } = await import("@/lib/microsoft/graph");

    await expect(
      graphPost<{ id: string }>(
        "user-1",
        "account-1",
        "/me/messages/message-1/move",
        { destinationId: "archive" }
      )
    ).resolves.toEqual({ id: "message-1" });
  });
});
