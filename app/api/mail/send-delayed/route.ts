import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { withRateLimit, rateLimiters } from "@/lib/rate-limit";

const recipientSchema = z.object({
  emailAddress: z.object({
    address: z.string().email().max(320),
    name: z.string().max(320).optional(),
  }),
});

const sendDelayedSchema = z.object({
  to: z.array(recipientSchema).min(1).max(500),
  cc: z.array(recipientSchema).max(500).optional(),
  bcc: z.array(recipientSchema).max(500).optional(),
  subject: z.string().max(998).refine((s) => s.trim().length > 0, "Subject required"),
  body: z.object({
    contentType: z.string().max(50).optional(),
    content: z.string().min(1).max(200000),
  }),
  attachments: z.array(z.object({
    name: z.string().max(255),
    contentType: z.string().max(255).optional(),
    data: z.string().max(35_000_000), // base64; ~25MB binary (size checks below)
  })).max(25).optional(),
  fromHomeAccountId: z.string().min(1).max(512).optional(),
  draftId: z.string().min(1).max(512).optional(),
  importance: z.enum(["normal", "high"]).optional(),
  isReadReceiptRequested: z.boolean().optional(),
});

// ─── POST /api/mail/send-delayed ─────────────────────────────────────────────
// Stores email in PendingEmail table instead of sending immediately.
// Returns pendingId + sendAt so client can show undo countdown.

async function sendDelayedHandler(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let requestBody;
  try {
    requestBody = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = sendDelayedSchema.safeParse(requestBody);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
  }
  const {
    to,
    cc,
    bcc,
    subject,
    body,
    attachments,
    fromHomeAccountId,
    draftId,
    importance,
    isReadReceiptRequested,
  } = parsed.data;

  // Validate attachments size (mirrors /api/mail/send; shape enforced by schema)
  if (attachments && attachments.length > 0) {
    let totalBytes = 0;
    for (const att of attachments) {
      const sizeBytes = Math.ceil(att.data.length * 0.75); // base64 to bytes approximation
      if (sizeBytes > 25 * 1024 * 1024) {
        return NextResponse.json(
          { error: `Attachment "${att.name}" exceeds 25MB limit` },
          { status: 400 }
        );
      }
      totalBytes += sizeBytes;
    }
    if (totalBytes > 25 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Total attachments exceed 25MB limit" },
        { status: 400 }
      );
    }
  }

  // Get user's undo send delay preference
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { undoSendDelay: true },
  });

  const delaySeconds = dbUser?.undoSendDelay ?? 10;
  const now = new Date();
  const sendAt = new Date(now.getTime() + delaySeconds * 1000);

  // Store the full send payload
  const payload = {
    to,
    cc,
    bcc,
    subject,
    body,
    attachments,
    fromHomeAccountId,
    draftId,
    importance,
    isReadReceiptRequested,
  };

  const pending = await prisma.pendingEmail.create({
    data: {
      userId: user.id,
      payload: payload as any,
      sendAt,
      cancelled: false,
    },
  });

  return NextResponse.json({
    pendingId: pending.id,
    sendAt: sendAt.toISOString(),
    canCancelUntil: sendAt.toISOString(),
    delaySeconds,
  });
}

// Export with rate limiting (30 emails per hour)
export const POST = withRateLimit(sendDelayedHandler, rateLimiters.send);
