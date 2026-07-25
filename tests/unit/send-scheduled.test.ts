import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const draft = {
  findMany: vi.fn(),
  updateMany: vi.fn(),
  update: vi.fn(),
  findFirst: vi.fn(),
  delete: vi.fn(),
};
const pendingEmail = {
  findMany: vi.fn(),
  updateMany: vi.fn(),
  update: vi.fn(),
};
const msConnectedAccount = { findFirst: vi.fn() };
const prismaFake = { draft, pendingEmail, msConnectedAccount };

const graphFetch = vi.fn();
const provider = { sendEmail: vi.fn() };

vi.mock("@/lib/prisma", () => ({ prisma: prismaFake }));
vi.mock("@/lib/microsoft/graph", () => ({ graphFetch }));
vi.mock("@/lib/providers/registry", () => ({
  verifyAccountOwnership: vi.fn(),
  detectProviderType: (accountId: string) =>
    accountId.startsWith("imap:") ? "imap" :
    accountId.startsWith("jmap:") ? "jmap" :
    "microsoft",
  getProvider: () => provider,
}));

function cronRequest() {
  return new NextRequest("http://localhost/api/cron/send-scheduled", {
    headers: { authorization: "Bearer test-cron-secret" },
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  process.env.CRON_SECRET = "test-cron-secret";
  draft.findMany.mockResolvedValue([]);
  pendingEmail.findMany.mockResolvedValue([]);
  draft.updateMany.mockResolvedValue({ count: 0 });
  pendingEmail.updateMany.mockResolvedValue({ count: 0 });
});

describe("send-scheduled delivery claims", () => {
  it("does not send records claimed by another worker", async () => {
    draft.findMany.mockResolvedValue([
      {
        id: "draft-1",
        userId: "user-1",
        homeAccountId: "account-1",
        attachments: [],
      },
    ]);
    pendingEmail.findMany.mockResolvedValue([
      {
        id: "pending-1",
        userId: "user-1",
        payload: {},
      },
    ]);
    const { GET } = await import("@/app/api/cron/send-scheduled/route");

    const response = await GET(cronRequest());
    const body = await response.json();

    expect(body.sent).toBe(0);
    expect(body.pendingSent).toBe(0);
    expect(graphFetch).not.toHaveBeenCalled();
    expect(provider.sendEmail).not.toHaveBeenCalled();
  });

  it("marks a claimed pending email sent after Graph accepts it", async () => {
    pendingEmail.findMany.mockResolvedValue([
      {
        id: "pending-1",
        userId: "user-1",
        payload: {
          to: [{ emailAddress: { address: "client@example.com" } }],
          subject: "Status",
          body: { contentType: "HTML", content: "<p>Ready</p>" },
          fromHomeAccountId: "account-1",
        },
      },
    ]);
    pendingEmail.updateMany.mockResolvedValue({ count: 1 });
    msConnectedAccount.findFirst.mockResolvedValue({
      homeAccountId: "account-1",
    });
    graphFetch.mockResolvedValue(new Response(null, { status: 202 }));
    pendingEmail.update.mockResolvedValue({});
    const { GET } = await import("@/app/api/cron/send-scheduled/route");

    const response = await GET(cronRequest());
    const body = await response.json();

    expect(body.pendingSent).toBe(1);
    expect(graphFetch).toHaveBeenCalledTimes(1);
    expect(pendingEmail.update).toHaveBeenCalledWith({
      where: { id: "pending-1" },
      data: expect.objectContaining({
        deliveryStatus: "sent",
        deliveredAt: expect.any(Date),
      }),
    });
  });

  it("fails a scheduled draft instead of silently dropping oversized attachments", async () => {
    draft.findMany.mockResolvedValue([
      {
        id: "draft-oversized",
        userId: "user-1",
        homeAccountId: "account-1",
        attachments: [{ name: "large.bin", data: "A".repeat(35_000_000) }],
      },
    ]);
    draft.updateMany
      .mockResolvedValueOnce({ count: 1 })
      .mockResolvedValueOnce({ count: 1 });
    const { GET } = await import("@/app/api/cron/send-scheduled/route");

    const response = await GET(cronRequest());
    const body = await response.json();

    expect(body.sent).toBe(0);
    expect(body.failed).toBe(1);
    expect(graphFetch).not.toHaveBeenCalled();
    expect(draft.updateMany).toHaveBeenLastCalledWith({
      where: { id: "draft-oversized", scheduledSent: false },
      data: { scheduleLastError: expect.stringContaining("25MB") },
    });
  });
});
