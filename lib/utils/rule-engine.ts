/**
 * Pure rule engine — no async, no side effects, no external imports.
 * Call applyRules() after fetching emails. Fire the returned sideEffects
 * via Promise.allSettled (never let them throw to the user).
 */

import type { EmailMessage } from "@/lib/types/email";
import type { Rule, Condition } from "@/lib/types/rules";

// ─── Side effect descriptor ───────────────────────────────────────────────────

export interface SideEffect {
  emailId: string;
  homeAccountId: string;
  action: "markRead" | "markImportant" | "archive" | "delete" | "forward";
  value?: string; // forward: recipient address
}

// ─── Result ───────────────────────────────────────────────────────────────────

export interface ApplyResult {
  emails: EmailMessage[];
  sideEffects: SideEffect[];
  /** ruleId → number of emails matched, for incrementing emailCount */
  matchCounts: Map<string, number>;
}

// ─── Main entry point ─────────────────────────────────────────────────────────

export function applyRules(
  emails: EmailMessage[],
  rules: Rule[],
  homeAccountId: string
): ApplyResult {
  const activeRules = rules
    .filter((r) => r.active)
    .sort((a, b) => a.priority - b.priority);

  if (activeRules.length === 0) {
    return { emails, sideEffects: [], matchCounts: new Map() };
  }

  const resultEmails: EmailMessage[] = [];
  const sideEffects: SideEffect[] = [];
  const matchCounts = new Map<string, number>();

  for (const email of emails) {
    let mutated = { ...email };
    let removed = false;

    for (const rule of activeRules) {
      if (!matchesConditions(email, rule.conditions)) continue;

      // Tally match
      matchCounts.set(rule.id, (matchCounts.get(rule.id) ?? 0) + 1);

      // Apply each action
      for (const action of rule.actions) {
        switch (action.type) {
          case "mark_read":
            mutated = { ...mutated, isRead: true };
            // Deduplicate — only queue once per email
            if (!sideEffects.some((s) => s.emailId === email.id && s.action === "markRead")) {
              sideEffects.push({ emailId: email.id, homeAccountId, action: "markRead" });
            }
            break;

          case "mark_important":
            mutated = { ...mutated, flag: { flagStatus: "flagged" } };
            if (!sideEffects.some((s) => s.emailId === email.id && s.action === "markImportant")) {
              sideEffects.push({ emailId: email.id, homeAccountId, action: "markImportant" });
            }
            break;

          case "archive":
            removed = true;
            if (!sideEffects.some((s) => s.emailId === email.id && s.action === "archive")) {
              sideEffects.push({ emailId: email.id, homeAccountId, action: "archive" });
            }
            break;

          case "delete":
            removed = true;
            if (!sideEffects.some((s) => s.emailId === email.id && s.action === "delete")) {
              sideEffects.push({ emailId: email.id, homeAccountId, action: "delete" });
            }
            break;

          case "skip_inbox":
            // Hide from UI only — no Graph call
            removed = true;
            break;

          case "forward":
            if (action.value?.trim()) {
              sideEffects.push({
                emailId: email.id,
                homeAccountId,
                action: "forward",
                value: action.value.trim(),
              });
            }
            break;

          case "label":
            // MS Graph has no user-defined labels; no-op for now
            break;
        }
      }

      if (rule.stopProcessing) break;
    }

    if (!removed) resultEmails.push(mutated);
  }

  return { emails: resultEmails, sideEffects, matchCounts };
}

// ─── Condition evaluation ─────────────────────────────────────────────────────

export function matchesConditions(email: EmailMessage, conditions: Condition[]): boolean {
  if (!conditions.length) return false;

  let result = evaluateOne(email, conditions[0]);

  for (let i = 1; i < conditions.length; i++) {
    const logic = conditions[i - 1].logic;
    const cur = evaluateOne(email, conditions[i]);
    result = logic === "AND" ? result && cur : result || cur;
  }

  return result;
}

function evaluateOne(email: EmailMessage, condition: Condition): boolean {
  const { field, operator, value } = condition;
  if (!value.trim()) return false; // blank condition values never match

  const val = value.toLowerCase().trim();
  let target = "";

  switch (field) {
    case "subject":
      target = email.subject.toLowerCase();
      break;
    case "from":
      target = `${email.from.name} ${email.from.address}`.toLowerCase();
      break;
    case "to":
      // EmailMessage.toRecipients optional — skip gracefully
      target = (email.toRecipients ?? [])
        .map((r) => `${r.name} ${r.address}`)
        .join(" ")
        .toLowerCase();
      break;
    case "keywords":
      target = `${email.subject} ${email.bodyPreview}`.toLowerCase();
      break;
    default:
      return false;
  }

  switch (operator) {
    case "contains":     return target.includes(val);
    case "is":           return target === val;
    case "starts_with":  return target.startsWith(val);
    case "ends_with":    return target.endsWith(val);
    case "not_contains": return !target.includes(val);
    default:             return false;
  }
}
