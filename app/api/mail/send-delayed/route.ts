import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

// ─── POST /api/mail/send-delayed ─────────────────────────────────────────────
// Stores email in PendingEmail table instead of sending immediately.
// Returns pendingId + sendAt so client can show undo countdown.

export async function POST(req: NextRequest) {
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
