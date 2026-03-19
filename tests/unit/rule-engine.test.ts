import { describe, it, expect } from "vitest";
import { applyRules, matchesConditions } from "@/lib/utils/rule-engine";
import type { EmailMessage } from "@/lib/types/email";
import type { Rule } from "@/lib/types/rules";

describe("rule-engine", () => {
  const mockEmail: EmailMessage = {
    id: "email-1",
    subject: "Meeting Tomorrow",
    bodyPreview: "Let's discuss the project roadmap",
    receivedDateTime: "2026-03-18T10:00:00Z",
    sentDateTime: "2026-03-18T09:00:00Z",
    isRead: false,
    hasAttachments: true,
    flag: { flagStatus: "notFlagged" },
    from: {
      name: "John Doe",
      address: "john@example.com",
    },
    toRecipients: [
      {
        name: "Jane Smith",
        address: "jane@example.com",
      },
    ],
  };

  const homeAccountId = "test-home-account-id";

  describe("applyRules", () => {
    it("should return emails unchanged when no rules", () => {
      const result = applyRules([mockEmail], [], homeAccountId);
      expect(result.emails).toEqual([mockEmail]);
      expect(result.sideEffects).toEqual([]);
      expect(result.matchCounts.size).toBe(0);
    });

    it("should return emails unchanged when no active rules", () => {
      const inactiveRule: Rule = {
        id: "rule-1",
        name: "Inactive Rule",
        active: false,
        priority: 1,
        conditions: [
          { field: "from", operator: "contains", value: "john", logic: "AND" },
        ],
        actions: [{ type: "mark_read" }],
        stopProcessing: false,
        emailCount: 0,
        createdAt: new Date(),
        userId: "user-1",
      };

      const result = applyRules([mockEmail], [inactiveRule], homeAccountId);
      expect(result.emails).toEqual([mockEmail]);
      expect(result.sideEffects).toEqual([]);
    });

    it("should mark email as read and queue side effect", () => {
      const rule: Rule = {
        id: "rule-1",
        name: "Mark from John as read",
        active: true,
        priority: 1,
        conditions: [
          { field: "from", operator: "contains", value: "john", logic: "AND" },
        ],
        actions: [{ type: "mark_read" }],
        stopProcessing: false,
        emailCount: 0,
        createdAt: new Date(),
        userId: "user-1",
      };

      const result = applyRules([mockEmail], [rule], homeAccountId);

      expect(result.emails[0].isRead).toBe(true);
      expect(result.sideEffects).toHaveLength(1);
      expect(result.sideEffects[0]).toEqual({
        emailId: "email-1",
        homeAccountId,
        action: "markRead",
        ruleId: "rule-1",
      });
      expect(result.matchCounts.get("rule-1")).toBe(1);
    });

    it("should mark email as important and queue side effect", () => {
      const rule: Rule = {
        id: "rule-2",
        name: "Star important emails",
        active: true,
        priority: 1,
        conditions: [
          { field: "subject", operator: "contains", value: "meeting", logic: "AND" },
        ],
        actions: [{ type: "mark_important" }],
        stopProcessing: false,
        emailCount: 0,
        createdAt: new Date(),
        userId: "user-1",
      };

      const result = applyRules([mockEmail], [rule], homeAccountId);

      expect(result.emails[0]?.flag?.flagStatus).toBe("flagged");
      expect(result.sideEffects).toHaveLength(1);
      expect(result.sideEffects[0]?.action).toBe("markImportant");
    });

    it("should archive email and remove from results", () => {
      const rule: Rule = {
        id: "rule-3",
        name: "Archive newsletters",
        active: true,
        priority: 1,
        conditions: [
          { field: "from", operator: "contains", value: "newsletter", logic: "AND" },
        ],
        actions: [{ type: "archive" }],
        stopProcessing: false,
        emailCount: 0,
        createdAt: new Date(),
        userId: "user-1",
      };

      const newsletterEmail = {
        ...mockEmail,
        from: { name: "Newsletter", address: "newsletter@example.com" },
      };

      const result = applyRules([newsletterEmail], [rule], homeAccountId);

      expect(result.emails).toHaveLength(0);
      expect(result.sideEffects).toHaveLength(1);
      expect(result.sideEffects[0].action).toBe("archive");
    });

    it("should delete email and remove from results", () => {
      const rule: Rule = {
        id: "rule-4",
        name: "Delete spam",
        active: true,
        priority: 1,
        conditions: [
          { field: "subject", operator: "contains", value: "spam", logic: "AND" },
        ],
        actions: [{ type: "delete" }],
        stopProcessing: false,
        emailCount: 0,
        createdAt: new Date(),
        userId: "user-1",
      };

      const spamEmail = {
        ...mockEmail,
        subject: "You won spam prize",
      };

      const result = applyRules([spamEmail], [rule], homeAccountId);

      expect(result.emails).toHaveLength(0);
      expect(result.sideEffects).toHaveLength(1);
      expect(result.sideEffects[0].action).toBe("delete");
    });

    it("should skip inbox (hide from UI) without side effect", () => {
      const rule: Rule = {
        id: "rule-5",
        name: "Skip inbox for promotions",
        active: true,
        priority: 1,
        conditions: [
          { field: "subject", operator: "contains", value: "promo", logic: "AND" },
        ],
        actions: [{ type: "skip_inbox" }],
        stopProcessing: false,
        emailCount: 0,
        createdAt: new Date(),
        userId: "user-1",
      };

      const promoEmail = {
        ...mockEmail,
        subject: "Promo: 50% off!",
      };

      const result = applyRules([promoEmail], [rule], homeAccountId);

      expect(result.emails).toHaveLength(0);
      expect(result.sideEffects).toHaveLength(0); // No side effect for skip_inbox
    });

    it("should forward email with valid recipient", () => {
      const rule: Rule = {
        id: "rule-6",
        name: "Forward urgent emails",
        active: true,
        priority: 1,
        conditions: [
          { field: "subject", operator: "contains", value: "urgent", logic: "AND" },
        ],
        actions: [{ type: "forward", value: "manager@example.com" }],
        stopProcessing: false,
        emailCount: 0,
        createdAt: new Date(),
        userId: "user-1",
      };

      const urgentEmail = {
        ...mockEmail,
        subject: "URGENT: Action required",
      };

      const result = applyRules([urgentEmail], [rule], homeAccountId);

      expect(result.sideEffects).toHaveLength(1);
      expect(result.sideEffects[0]).toEqual({
        emailId: urgentEmail.id,
        homeAccountId,
        action: "forward",
        value: "manager@example.com",
        ruleId: "rule-6",
      });
    });

    it("should ignore forward action with empty recipient", () => {
      const rule: Rule = {
        id: "rule-7",
        name: "Forward without recipient",
        active: true,
        priority: 1,
        conditions: [
          { field: "subject", operator: "contains", value: "test", logic: "AND" },
        ],
        actions: [{ type: "forward", value: "   " }],
        stopProcessing: false,
        emailCount: 0,
        createdAt: new Date(),
        userId: "user-1",
      };

      const result = applyRules([mockEmail], [rule], homeAccountId);

      expect(result.sideEffects).toHaveLength(0);
    });

    it("should apply multiple actions from one rule", () => {
      const rule: Rule = {
        id: "rule-8",
        name: "Mark read and star",
        active: true,
        priority: 1,
        conditions: [
          // "from" field matches against "name address" (both), so we need full match
          { field: "from", operator: "is", value: "john doe john@example.com", logic: "AND" },
        ],
        actions: [{ type: "mark_read" }, { type: "mark_important" }],
        stopProcessing: false,
        emailCount: 0,
        createdAt: new Date(),
        userId: "user-1",
      };

      const result = applyRules([mockEmail], [rule], homeAccountId);

      expect(result.emails[0]?.isRead).toBe(true);
      expect(result.emails[0]?.flag?.flagStatus).toBe("flagged");
      expect(result.sideEffects).toHaveLength(2);
    });

    it("should respect priority ordering", () => {
      const rule1: Rule = {
        id: "rule-low",
        name: "Low priority",
        active: true,
        priority: 10,
        conditions: [
          { field: "from", operator: "contains", value: "john", logic: "AND" },
        ],
        actions: [{ type: "mark_read" }],
        stopProcessing: false,
        emailCount: 0,
        createdAt: new Date(),
        userId: "user-1",
      };

      const rule2: Rule = {
        id: "rule-high",
        name: "High priority",
        active: true,
        priority: 1,
        conditions: [
          { field: "from", operator: "contains", value: "john", logic: "AND" },
        ],
        actions: [{ type: "mark_important" }],
        stopProcessing: false,
        emailCount: 0,
        createdAt: new Date(),
        userId: "user-1",
      };

      const result = applyRules([mockEmail], [rule1, rule2], homeAccountId);

      // High priority rule should be applied first
      expect(result.sideEffects[0].ruleId).toBe("rule-high");
      expect(result.sideEffects[1].ruleId).toBe("rule-low");
    });

    it("should stop processing when stopProcessing is true", () => {
      const rule1: Rule = {
        id: "rule-stop",
        name: "Stop after this",
        active: true,
        priority: 1,
        conditions: [
          { field: "from", operator: "contains", value: "john", logic: "AND" },
        ],
        actions: [{ type: "mark_read" }],
        stopProcessing: true,
        emailCount: 0,
        createdAt: new Date(),
        userId: "user-1",
      };

      const rule2: Rule = {
        id: "rule-skipped",
        name: "Should be skipped",
        active: true,
        priority: 2,
        conditions: [
          { field: "from", operator: "contains", value: "john", logic: "AND" },
        ],
        actions: [{ type: "mark_important" }],
        stopProcessing: false,
        emailCount: 0,
        createdAt: new Date(),
        userId: "user-1",
      };

      const result = applyRules([mockEmail], [rule1, rule2], homeAccountId);

      expect(result.emails[0]?.isRead).toBe(true);
      expect(result.emails[0]?.flag?.flagStatus).toBe("notFlagged"); // Second rule not applied
      expect(result.sideEffects).toHaveLength(1);
      expect(result.matchCounts.get("rule-skipped")).toBeUndefined();
    });

    it("should deduplicate side effects for same email/action", () => {
      const rule1: Rule = {
        id: "rule-1",
        name: "Mark read 1",
        active: true,
        priority: 1,
        conditions: [
          { field: "from", operator: "contains", value: "john", logic: "AND" },
        ],
        actions: [{ type: "mark_read" }],
        stopProcessing: false,
        emailCount: 0,
        createdAt: new Date(),
        userId: "user-1",
      };

      const rule2: Rule = {
        id: "rule-2",
        name: "Mark read 2",
        active: true,
        priority: 2,
        conditions: [
          { field: "subject", operator: "contains", value: "meeting", logic: "AND" },
        ],
        actions: [{ type: "mark_read" }],
        stopProcessing: false,
        emailCount: 0,
        createdAt: new Date(),
        userId: "user-1",
      };

      const result = applyRules([mockEmail], [rule1, rule2], homeAccountId);

      // Should only have one markRead side effect despite two rules matching
      const markReadEffects = result.sideEffects.filter(e => e.action === "markRead");
      expect(markReadEffects).toHaveLength(1);
    });

    it("should handle label action (no-op)", () => {
      const rule: Rule = {
        id: "rule-label",
        name: "Add label",
        active: true,
        priority: 1,
        conditions: [
          { field: "from", operator: "contains", value: "john", logic: "AND" },
        ],
        actions: [{ type: "label", value: "important" }],
        stopProcessing: false,
        emailCount: 0,
        createdAt: new Date(),
        userId: "user-1",
      };

      const result = applyRules([mockEmail], [rule], homeAccountId);

      // Label action is no-op, email should remain unchanged
      expect(result.emails).toEqual([mockEmail]);
      expect(result.sideEffects).toHaveLength(0);
    });

    it("should process multiple emails independently", () => {
      const email1 = { ...mockEmail, id: "email-1", from: { name: "John", address: "john@example.com" } };
      const email2 = { ...mockEmail, id: "email-2", from: { name: "Jane", address: "jane@example.com" } };

      const rule: Rule = {
        id: "rule-1",
        name: "Mark John emails as read",
        active: true,
        priority: 1,
        conditions: [
          { field: "from", operator: "contains", value: "john", logic: "AND" },
        ],
        actions: [{ type: "mark_read" }],
        stopProcessing: false,
        emailCount: 0,
        createdAt: new Date(),
        userId: "user-1",
      };

      const result = applyRules([email1, email2], [rule], homeAccountId);

      expect(result.emails).toHaveLength(2);
      expect(result.emails[0].isRead).toBe(true);  // John's email marked read
      expect(result.emails[1].isRead).toBe(false); // Jane's email unchanged
      expect(result.matchCounts.get("rule-1")).toBe(1);
    });
  });

  describe("matchesConditions", () => {
    it("should return false for empty conditions", () => {
      expect(matchesConditions(mockEmail, [])).toBe(false);
    });

    it("should match 'from' field with 'contains' operator", () => {
      const conditions = [
        { field: "from" as const, operator: "contains" as const, value: "john", logic: "AND" as const },
      ];
      expect(matchesConditions(mockEmail, conditions)).toBe(true);
    });

    it("should match 'from' field with 'is' operator", () => {
      const conditions = [
        { field: "from" as const, operator: "is" as const, value: "john doe john@example.com", logic: "AND" as const },
      ];
      expect(matchesConditions(mockEmail, conditions)).toBe(true);
    });

    it("should match 'subject' field", () => {
      const conditions = [
        { field: "subject" as const, operator: "contains" as const, value: "meeting", logic: "AND" as const },
      ];
      expect(matchesConditions(mockEmail, conditions)).toBe(true);
    });

    it("should match 'to' field", () => {
      const conditions = [
        { field: "to" as const, operator: "contains" as const, value: "jane", logic: "AND" as const },
      ];
      expect(matchesConditions(mockEmail, conditions)).toBe(true);
    });

    it("should match 'keywords' field (subject + bodyPreview)", () => {
      const conditions = [
        { field: "keywords" as const, operator: "contains" as const, value: "roadmap", logic: "AND" as const },
      ];
      expect(matchesConditions(mockEmail, conditions)).toBe(true);
    });

    it("should use starts_with operator", () => {
      const conditions = [
        { field: "subject" as const, operator: "starts_with" as const, value: "meeting", logic: "AND" as const },
      ];
      expect(matchesConditions(mockEmail, conditions)).toBe(true);
    });

    it("should use ends_with operator", () => {
      const email = { ...mockEmail, subject: "Call tomorrow" };
      const conditions = [
        { field: "subject" as const, operator: "ends_with" as const, value: "tomorrow", logic: "AND" as const },
      ];
      expect(matchesConditions(email, conditions)).toBe(true);
    });

    it("should use not_contains operator", () => {
      const conditions = [
        { field: "subject" as const, operator: "not_contains" as const, value: "spam", logic: "AND" as const },
      ];
      expect(matchesConditions(mockEmail, conditions)).toBe(true);
    });

    it("should handle AND logic", () => {
      const conditions = [
        { field: "from" as const, operator: "contains" as const, value: "john", logic: "AND" as const },
        { field: "subject" as const, operator: "contains" as const, value: "meeting", logic: "AND" as const },
      ];
      expect(matchesConditions(mockEmail, conditions)).toBe(true);
    });

    it("should handle OR logic", () => {
      const conditions = [
        { field: "from" as const, operator: "contains" as const, value: "jane", logic: "OR" as const },
        { field: "subject" as const, operator: "contains" as const, value: "meeting", logic: "AND" as const },
      ];
      expect(matchesConditions(mockEmail, conditions)).toBe(true);
    });

    it("should handle mixed AND/OR logic", () => {
      const conditions = [
        { field: "from" as const, operator: "contains" as const, value: "jane", logic: "OR" as const },  // false
        { field: "subject" as const, operator: "contains" as const, value: "meeting", logic: "AND" as const },  // true
        { field: "subject" as const, operator: "contains" as const, value: "tomorrow", logic: "AND" as const },  // true
      ];
      // (false OR true) AND true = true
      expect(matchesConditions(mockEmail, conditions)).toBe(true);
    });

    it("should return false when conditions don't match", () => {
      const conditions = [
        { field: "from" as const, operator: "contains" as const, value: "jane", logic: "AND" as const },
      ];
      expect(matchesConditions(mockEmail, conditions)).toBe(false);
    });

    it("should ignore blank condition values", () => {
      const conditions = [
        { field: "from" as const, operator: "contains" as const, value: "   ", logic: "AND" as const },
      ];
      expect(matchesConditions(mockEmail, conditions)).toBe(false);
    });

    it("should be case-insensitive", () => {
      const conditions = [
        { field: "from" as const, operator: "contains" as const, value: "JOHN", logic: "AND" as const },
      ];
      expect(matchesConditions(mockEmail, conditions)).toBe(true);
    });

    it("should handle emails without toRecipients", () => {
      const emailNoRecipients = { ...mockEmail, toRecipients: undefined };
      const conditions = [
        { field: "to" as const, operator: "contains" as const, value: "jane", logic: "AND" as const },
      ];
      expect(matchesConditions(emailNoRecipients as EmailMessage, conditions)).toBe(false);
    });
  });
});
