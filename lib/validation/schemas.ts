import { z } from "zod";

// ============================================================================
// Shared helpers
// ============================================================================

/** Any string parseable by new Date() — ISO with or without offset. */
export const dateStringSchema = z
  .string()
  .min(1, "Date is required")
  .max(64, "Date string too long")
  .refine((s) => !isNaN(new Date(s).getTime()), "Invalid date");

/** Provider account id (Microsoft homeAccountId / imap:xxx / jmap:xxx). */
export const accountIdSchema = z.string().min(1, "Account ID is required").max(512);

// ============================================================================
// Email Schemas
// ============================================================================

export const sendEmailSchema = z.object({
  to: z.array(z.object({
    email: z.string().email("Invalid email address"),
    name: z.string().optional(),
  })).min(1, "At least one recipient is required"),
  cc: z.array(z.object({
    email: z.string().email("Invalid email address"),
    name: z.string().optional(),
  })).optional(),
  bcc: z.array(z.object({
    email: z.string().email("Invalid email address"),
    name: z.string().optional(),
  })).optional(),
  subject: z.string().min(1, "Subject is required").max(500, "Subject too long"),
  body: z.string().min(1, "Email body is required"),
  attachments: z.array(z.object({
    name: z.string(),
    contentBytes: z.string(), // base64
    contentType: z.string(),
    size: z.number().max(25 * 1024 * 1024, "Attachment too large (max 25MB)"),
  })).optional(),
  importance: z.enum(["low", "normal", "high"]).optional(),
  isReadReceiptRequested: z.boolean().optional(),
});

export const searchEmailSchema = z.object({
  q: z.string().min(1, "Search query is required").max(200, "Query too long"),
  accountId: z.string().optional(),
});

export const markReadSchema = z.object({
  messageId: z.string().min(1, "Message ID is required"),
  isRead: z.boolean(),
});

export const starEmailSchema = z.object({
  messageId: z.string().min(1, "Message ID is required"),
  flagStatus: z.enum(["notFlagged", "flagged"]),
});

export const moveEmailSchema = z.object({
  messageId: z.string().min(1, "Message ID is required"),
  destinationId: z.string().min(1, "Destination folder ID is required"),
});

export const deleteEmailSchema = z.object({
  messageId: z.string().min(1, "Message ID is required"),
});

// ============================================================================
// Calendar Schemas
// ============================================================================

// Matches EventBody consumed by app/api/calendar/event/route.ts (flat shape,
// NOT the Graph nested shape — the route builds the Graph payload itself).
export const createEventSchema = z.object({
  homeAccountId: accountIdSchema.optional(),
  subject: z.string().min(1, "Event title is required").max(500, "Title too long"),
  start: dateStringSchema,
  end: dateStringSchema,
  isAllDay: z.boolean().optional(),
  location: z.string().max(500, "Location too long").optional(),
  body: z.string().max(100_000, "Body too long").optional(),
  attendees: z.array(z.string().email("Invalid attendee email").max(320)).max(200).optional(),
  timeZone: z.string().max(100).optional(),
  reminderMinutes: z.number().int().min(0).max(40320).nullable().optional(),
  showAs: z.enum(["busy", "free", "tentative"]).optional(),
  // Client sends "daily" | "weekly" | "monthly" | null; the route also
  // tolerates the literal string "null" — preserve that.
  recurrence: z.enum(["daily", "weekly", "monthly", "null"]).nullable().optional(),
});

export const updateEventSchema = createEventSchema.extend({
  eventId: z.string().min(1, "Event ID is required").max(512),
  homeAccountId: accountIdSchema,
});

export const deleteEventSchema = z.object({
  eventId: z.string().min(1, "Event ID is required").max(512),
  homeAccountId: accountIdSchema,
});

// Matches app/api/calendar/nl-create/route.ts ({ text, now, timeZone? })
export const nlCreateEventSchema = z.object({
  text: z.string().min(1, "Input text is required").max(2000, "Input too long"),
  now: dateStringSchema,
  timeZone: z.string().max(100).optional(),
});

// Matches app/api/calendar/parse-invite/route.ts
export const parseInviteSchema = z.object({
  subject: z.string().max(1000).optional(),
  fromAddress: z.string().max(320).optional(),
  body: z.string().max(500_000).optional(),
  bodyPreview: z.string().max(10_000).optional(),
  receivedDateTime: z
    .string()
    .max(64)
    .refine((s) => !isNaN(new Date(s).getTime()), "Invalid date")
    .optional(),
});

// Matches app/api/calendar/respond/route.ts (Graph action verbs)
export const respondEventSchema = z.object({
  eventId: z.string().min(1, "Event ID is required").max(512),
  homeAccountId: accountIdSchema,
  response: z.enum(["accept", "decline", "tentativelyAccept"]),
});

// ============================================================================
// Rule Schemas
// ============================================================================

// Literals below are the EXACT sets implemented by the rule engine
// (lib/utils/rule-engine.ts evaluateOne/applyRules + lib/types/rules.ts).
export const ruleConditionSchema = z.object({
  id: z.string().max(128).optional(),
  field: z.enum(["subject", "from", "to", "keywords"]),
  operator: z.enum(["contains", "is", "starts_with", "ends_with", "not_contains"]),
  value: z.string().max(1000, "Condition value too long"),
  logic: z.enum(["AND", "OR"]).default("AND"),
});

export const ruleActionSchema = z.object({
  id: z.string().max(128).optional(),
  type: z.enum(["archive", "label", "forward", "mark_important", "skip_inbox", "mark_read", "delete"]),
  value: z.string().max(320).optional(),
});

// Matches app/api/rules/route.ts POST (priority is computed server-side)
export const createRuleSchema = z.object({
  name: z.string().min(1, "Rule name is required").max(100, "Name too long"),
  conditions: z.array(ruleConditionSchema).max(50).default([]),
  actions: z.array(ruleActionSchema).max(50).default([]),
  stopProcessing: z.boolean().optional(),
});

// Matches app/api/rules/[id]/route.ts PUT (id comes from the URL)
export const updateRuleSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  active: z.boolean().optional(),
  conditions: z.array(ruleConditionSchema).max(50).optional(),
  actions: z.array(ruleActionSchema).max(50).optional(),
  stopProcessing: z.boolean().optional(),
});

// Matches app/api/rules/apply-action/route.ts — SideEffect actions from
// lib/utils/rule-engine.ts (markRead | markImportant | archive | delete | forward)
export const applyRuleActionSchema = z.object({
  emailId: z.string().min(1, "Email ID is required").max(512),
  homeAccountId: accountIdSchema,
  action: z.enum(["markRead", "markImportant", "archive", "delete", "forward"]),
  value: z.string().max(320).optional(),
  ruleId: z.string().max(128).optional(),
});

// Matches app/api/rules/reorder/route.ts
export const reorderRulesSchema = z.object({
  ids: z.array(z.string().min(1).max(128)).min(1, "ids array required").max(500),
});

// Matches app/api/rules/[id]/increment/route.ts (count <= 0 is a no-op there)
export const incrementRuleCountSchema = z.object({
  count: z.number().int().max(1_000_000).optional(),
});

// ============================================================================
// Signature Schemas
// ============================================================================

// Matches app/api/signatures/route.ts POST
export const createSignatureSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  html: z.string().max(100_000, "Signature too long").optional(),
  title: z.string().max(100, "Title too long").optional(),
  company: z.string().max(100, "Company too long").optional(),
  phone: z.string().max(50, "Phone too long").optional(),
  defaultNew: z.boolean().optional(),
  defaultReplies: z.boolean().optional(),
  account: z.string().max(512).optional(),
  isDefault: z.boolean().optional(),
});

// Matches app/api/signatures/[id]/route.ts PUT (id comes from the URL)
export const updateSignatureSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  html: z.string().max(100_000).optional(),
  title: z.string().max(100).optional(),
  company: z.string().max(100).optional(),
  phone: z.string().max(50).optional(),
  defaultNew: z.boolean().optional(),
  defaultReplies: z.boolean().optional(),
  account: z.string().max(512).optional(),
  isDefault: z.boolean().optional(),
});

// ============================================================================
// Contact Schemas
// ============================================================================

// Matches app/api/contacts/route.ts POST (flat fields, optional email)
export const createContactSchema = z.object({
  displayName: z.string().min(1, "Name is required").max(255, "Name too long"),
  email: z.string().email("Invalid email address").max(320).optional(),
  phone: z.string().max(50, "Phone too long").optional(),
  company: z.string().max(100, "Company too long").optional(),
  title: z.string().max(100, "Job title too long").optional(),
  homeAccountId: accountIdSchema.optional(),
});

// Matches app/api/contacts/[id]/route.ts PATCH (id comes from the URL)
export const updateContactSchema = z.object({
  displayName: z.string().min(1).max(255).optional(),
  email: z.string().email().max(320).optional(),
  phone: z.string().max(50).optional(),
  company: z.string().max(100).optional(),
  title: z.string().max(100).optional(),
  homeAccountId: accountIdSchema.optional(),
});

// ============================================================================
// Draft Schemas
// ============================================================================

export const createDraftSchema = z.object({
  subject: z.string().max(500, "Subject too long").optional(),
  body: z.string().optional(),
  to: z.array(z.object({
    email: z.string().email(),
    name: z.string().optional(),
  })).optional(),
  scheduledAt: z.string().datetime("Invalid schedule date").optional(),
});

export const updateDraftSchema = z.object({
  id: z.string().min(1, "Draft ID is required"),
  subject: z.string().max(500).optional(),
  body: z.string().optional(),
  to: z.array(z.object({
    email: z.string().email(),
    name: z.string().optional(),
  })).optional(),
  scheduledAt: z.string().datetime().optional(),
});

// ============================================================================
// AI Schemas
// ============================================================================

export const aiReplySchema = z.object({
  originalEmail: z.string().min(1, "Original email is required"),
  senderName: z.string().optional(),
  tone: z.enum(["professional", "friendly", "formal"]).optional(),
});

export const aiRemixSchema = z.object({
  text: z.string().min(1, "Text is required").max(10000, "Text too long"),
  tone: z.enum(["professional", "casual", "formal", "friendly"]).optional(),
  length: z.enum(["shorter", "same", "longer"]).optional(),
  formality: z.enum(["more", "same", "less"]).optional(),
  preset: z.string().optional(),
});

export const aiDictateSchema = z.object({
  transcript: z.string().min(1, "Transcript is required").max(5000, "Transcript too long"),
});

// ============================================================================
// Teams Schemas
// ============================================================================

// Matches app/api/teams/chats/[id]/send/route.ts (chat id comes from the URL)
export const sendTeamsMessageSchema = z.object({
  content: z.string().min(1, "Message is required").max(28_000, "Message too long"),
  homeAccountId: accountIdSchema.optional(),
});

// Matches app/api/teams/channels/[id]/send/route.ts (channel id from the URL)
export const sendChannelMessageSchema = z.object({
  content: z.string().min(1, "Message is required").max(28_000, "Message too long"),
  teamId: z.string().min(1, "Team ID is required").max(512),
  homeAccountId: accountIdSchema.optional(),
});

// Matches app/api/calendar/teams-meeting/route.ts
export const createTeamsMeetingSchema = z.object({
  subject: z.string().min(1, "Subject is required").max(500, "Subject too long"),
  startDateTime: dateStringSchema,
  endDateTime: dateStringSchema,
  homeAccountId: accountIdSchema.optional(),
});

// ============================================================================
// Helper function to validate request body
// ============================================================================

export function validateRequestBody<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}
