import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({ prisma: {} }));

describe("mergeMsalCaches", () => {
  it("retains secondary-account tokens while updating the login account", async () => {
    const { mergeMsalCaches } = await import("@/lib/microsoft/msal");
    const existing = JSON.stringify({
      Account: { secondary: { username: "secondary@example.com" } },
      RefreshToken: { secondaryToken: { secret: "old-secondary" } },
    });
    const incoming = JSON.stringify({
      Account: { primary: { username: "primary@example.com" } },
      RefreshToken: { primaryToken: { secret: "new-primary" } },
    });

    expect(JSON.parse(mergeMsalCaches(existing, incoming))).toEqual({
      Account: {
        secondary: { username: "secondary@example.com" },
        primary: { username: "primary@example.com" },
      },
      RefreshToken: {
        secondaryToken: { secret: "old-secondary" },
        primaryToken: { secret: "new-primary" },
      },
    });
  });
});
