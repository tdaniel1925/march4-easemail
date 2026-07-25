import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Rule } from "@/lib/types/rules";

type ExecutionRow = {
  id: string;
  ruleId: string;
  emailId: string;
  userId: string;
  status: string;
  completedActions: number[];
  claimedAt: Date;
  attemptCount: number;
  lastError: string | null;
  completedAt: Date | null;
};

let execution: ExecutionRow | null = null;

const ruleExecution = {
  create: vi.fn(async ({ data }: { data: Partial<ExecutionRow> }) => {
    if (execution) throw new Error("P2002");
    execution = {
      id: "execution-1",
      ruleId: data.ruleId!,
      emailId: data.emailId!,
      userId: data.userId!,
      status: data.status ?? "processing",
      completedActions: [],
      claimedAt: data.claimedAt ?? new Date(),
      attemptCount: 1,
      lastError: null,
      completedAt: null,
    };
    return execution;
  }),
  findUnique: vi.fn(async () => execution),
  updateMany: vi.fn(async () => {
    if (!execution || execution.status === "processing") return { count: 0 };
    execution.status = "processing";
    execution.attemptCount += 1;
    execution.lastError = null;
    execution.claimedAt = new Date();
    return { count: 1 };
  }),
  update: vi.fn(async ({ data }: { data: Partial<ExecutionRow> }) => {
    if (!execution) throw new Error("missing execution");
    Object.assign(execution, data);
    return execution;
  }),
};

const emailRule = { updateMany: vi.fn(async () => ({ count: 1 })) };
const cachedFolder = {
  findFirst: vi.fn(async () => null),
  upsert: vi.fn(),
};
const prismaFake = { ruleExecution, emailRule, cachedFolder };

const provider = {
  markRead: vi.fn(),
  flagMessage: vi.fn(),
  addCategories: vi.fn(),
  forwardMessage: vi.fn(),
  moveMessage: vi.fn(),
  deleteMessage: vi.fn(),
  createFolder: vi.fn(),
};

vi.mock("@/lib/prisma", () => ({ prisma: prismaFake }));
vi.mock("@/lib/providers/registry", () => ({
  getProvider: () => provider,
}));
vi.mock("@/lib/utils/rule-engine", () => ({
  matchesConditions: () => true,
}));

const rule: Rule = {
  id: "rule-1",
  name: "Important client mail",
  active: true,
  priority: 1,
  emailCount: 0,
  stopProcessing: false,
  conditions: [],
  actions: [
    { type: "mark_read" },
    { type: "forward", value: "records@example.com" },
  ],
};

const row = {
  id: "message-1",
  homeAccountId: "account-1",
  subject: "Subject",
  bodyPreview: "Preview",
  fromName: "Client",
  fromAddress: "client@example.com",
  toRecipients: [],
  isRead: false,
};

beforeEach(() => {
  execution = null;
  vi.clearAllMocks();
  provider.markRead.mockResolvedValue(undefined);
  provider.forwardMessage.mockResolvedValue(undefined);
});

describe("applyRulesServer delivery claims", () => {
  it("retries only unfinished actions after a provider failure", async () => {
    provider.forwardMessage.mockRejectedValueOnce(new Error("Graph unavailable"));
    const { applyRulesServer } = await import("@/lib/rules/apply-server");

    const first = await applyRulesServer("user-1", "account-1", [row], [rule]);

    expect(first.errors).toBe(1);
    expect(execution?.status).toBe("failed");
    expect(execution?.completedActions).toEqual([0]);
    expect(provider.markRead).toHaveBeenCalledTimes(1);
    expect(provider.forwardMessage).toHaveBeenCalledTimes(1);

    const second = await applyRulesServer("user-1", "account-1", [row], [rule]);

    expect(second.errors).toBe(0);
    expect(execution?.status).toBe("completed");
    expect(execution?.completedActions).toEqual([0, 1]);
    expect(provider.markRead).toHaveBeenCalledTimes(1);
    expect(provider.forwardMessage).toHaveBeenCalledTimes(2);
  });

  it("skips work already claimed by another worker", async () => {
    execution = {
      id: "execution-1",
      ruleId: rule.id,
      emailId: row.id,
      userId: "user-1",
      status: "processing",
      completedActions: [],
      claimedAt: new Date(),
      attemptCount: 1,
      lastError: null,
      completedAt: null,
    };
    const { applyRulesServer } = await import("@/lib/rules/apply-server");

    const result = await applyRulesServer("user-1", "account-1", [row], [rule]);

    expect(result.matched).toBe(0);
    expect(provider.markRead).not.toHaveBeenCalled();
    expect(provider.forwardMessage).not.toHaveBeenCalled();
  });
});
