import { z } from "zod";

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

export const createEventSchema = z.object({
  subject: z.string().min(1, "Event title is required").max(255, "Title too long"),
  body: z.string().optional(),
  start: z.object({
    dateTime: z.string().datetime("Invalid start date"),
    timeZone: z.string().optional(),
  }),
  end: z.object({
    dateTime: z.string().datetime("Invalid end date"),
    timeZone: z.string().optional(),
  }),
  location: z.string().max(255, "Location too long").optional(),
  attendees: z.array(z.object({
    emailAddress: z.object({
      address: z.string().email("Invalid attendee email"),
      name: z.string().optional(),
    }),
  })).optional(),
  isOnlineMeeting: z.boolean().optional(),
  onlineMeetingProvider: z.enum(["teamsForBusiness", "unknown"]).optional(),
});

export const nlCreateEventSchema = z.object({
  input: z.string().min(1, "Input text is required").max(500, "Input too long"),
});

export const respondEventSchema = z.object({
  eventId: z.string().min(1, "Event ID is required"),
  response: z.enum(["accepted", "tentativelyAccepted", "declined"]),
  comment: z.string().max(500, "Comment too long").optional(),
});

// ============================================================================
// Rule Schemas
// ============================================================================

export const createRuleSchema = z.object({
  name: z.string().min(1, "Rule name is required").max(100, "Name too long"),
  conditions: z.array(z.object({
    field: z.enum(["from", "subject", "body"]),
    operator: z.enum(["contains", "equals", "startsWith", "endsWith"]),
    value: z.string().min(1, "Condition value is required"),
  })).min(1, "At least one condition is required"),
  actions: z.array(z.object({
    type: z.enum(["move", "markAsRead", "flag", "delete", "categorize"]),
    value: z.string().optional(),
  })).min(1, "At least one action is required"),
  priority: z.number().int().min(0).optional(),
  stopProcessing: z.boolean().optional(),
});

export const updateRuleSchema = z.object({
  id: z.string().min(1, "Rule ID is required"),
  name: z.string().min(1).max(100).optional(),
  conditions: z.array(z.object({
    field: z.enum(["from", "subject", "body"]),
    operator: z.enum(["contains", "equals", "startsWith", "endsWith"]),
    value: z.string().min(1),
  })).optional(),
  actions: z.array(z.object({
    type: z.enum(["move", "markAsRead", "flag", "delete", "categorize"]),
    value: z.string().optional(),
  })).optional(),
  priority: z.number().int().min(0).optional(),
  stopProcessing: z.boolean().optional(),
  isEnabled: z.boolean().optional(),
});

export const applyRuleActionSchema = z.object({
  messageId: z.string().min(1, "Message ID is required"),
  action: z.object({
    type: z.enum(["move", "markAsRead", "flag", "delete", "categorize"]),
    value: z.string().optional(),
  }),
});

// ============================================================================
// Signature Schemas
// ============================================================================

export const createSignatureSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  title: z.string().max(100, "Title too long").optional(),
  company: z.string().max(100, "Company too long").optional(),
  phone: z.string().max(50, "Phone too long").optional(),
  isDefault: z.boolean().optional(),
});

export const updateSignatureSchema = z.object({
  id: z.string().min(1, "Signature ID is required"),
  name: z.string().min(1).max(100).optional(),
  title: z.string().max(100).optional(),
  company: z.string().max(100).optional(),
  phone: z.string().max(50).optional(),
  isDefault: z.boolean().optional(),
});

// ============================================================================
// Contact Schemas
// ============================================================================

export const createContactSchema = z.object({
  displayName: z.string().min(1, "Name is required").max(255, "Name too long"),
  emailAddress: z.string().email("Invalid email address"),
  phone: z.string().max(50, "Phone too long").optional(),
  jobTitle: z.string().max(100, "Job title too long").optional(),
  company: z.string().max(100, "Company too long").optional(),
});

export const updateContactSchema = z.object({
  id: z.string().min(1, "Contact ID is required"),
  displayName: z.string().min(1).max(255).optional(),
  emailAddress: z.string().email().optional(),
  phone: z.string().max(50).optional(),
  jobTitle: z.string().max(100).optional(),
  company: z.string().max(100).optional(),
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

export const sendTeamsMessageSchema = z.object({
  chatId: z.string().min(1, "Chat ID is required"),
  message: z.string().min(1, "Message is required").max(10000, "Message too long"),
});

export const sendChannelMessageSchema = z.object({
  channelId: z.string().min(1, "Channel ID is required"),
  message: z.string().min(1, "Message is required").max(10000, "Message too long"),
});

export const createTeamsMeetingSchema = z.object({
  subject: z.string().min(1, "Subject is required").max(255, "Subject too long"),
  start: z.string().datetime("Invalid start date"),
  end: z.string().datetime("Invalid end date"),
  attendees: z.array(z.string().email()).optional(),
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
