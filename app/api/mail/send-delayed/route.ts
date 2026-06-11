import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { withRateLimit, rateLimiters } from "@/lib/rate-limit";

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
  } = requestBody as {
    to: { emailAddress: { address: string } }[];
    cc?: { emailAddress: { address: string } }[];
    bcc?: { emailAddress: { address: string } }[];
    subject: string;
    body: { contentType: string; content: string };
    attachments?: { name: string; contentType: string; data: string }[];
    fromHomeAccountId?: string;
    draftId?: string;
    importance?: "normal" | "high";
    isReadReceiptRequested?: boolean;
  };

  // Input validation
  if (!to?.length) {
    return NextResponse.json({ error: "At least one recipient required" }, { status: 400 });
  }
  if (!subject?.trim()) {
    return NextResponse.json({ error: "Subject required" }, { status: 400 });
  }
  if (!body?.content) {
    return NextResponse.json({ error: "Email body required" }, { status: 400 });
  }

  // Validate attachments size and shape (mirrors /api/mail/send)
  if (attachments && attachments.length > 0) {
    let totalBytes = 0;
    for (const att of attachments) {
      if (!att || typeof att.name !== "string" || typeof att.data !== "string") {
        return NextResponse.json({ error: "Invalid attachment format" }, { status: 400 });
      }
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
