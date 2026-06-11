import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

/** GET /api/mail/receipts?messageIds=id1,id2,...
 *  Returns read receipt status for a list of sent message IDs.
 */
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const messageIdsParam = req.nextUrl.searchParams.get("messageIds") ?? "";
  const messageIds = messageIdsParam.split(",").map((id) => id.trim()).filter(Boolean);

  if (!messageIds.length) {
    return NextResponse.json({ receipts: [] });
  }

  const receipts = await prisma.readReceipt.findMany({
    where: { userId: user.id, messageId: { in: messageIds } },
    select: {
      messageId: true,
      recipientEmail: true,
      deliveredAt: true,
      readAt: true,
    },
  });

  return NextResponse.json({ receipts });
}

/** POST /api/mail/receipts — create a read receipt record after sending */
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null) as {
    messageId: string;
    recipientEmail: string;
  } | null;

  if (!body?.messageId || !body.recipientEmail) {
    return NextResponse.json({ error: "messageId and recipientEmail required" }, { status: 400 });
  }

  const { messageId, recipientEmail } = body;

  // Validate inputs
  if (typeof messageId !== "string" || !messageId.trim() || messageId.length > 512) {
    return NextResponse.json({ error: "Invalid messageId" }, { status: 400 });
  }
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (
    typeof recipientEmail !== "string" ||
    recipientEmail.length > 320 ||
    !EMAIL_REGEX.test(recipientEmail)
  ) {
    return NextResponse.json({ error: "Invalid recipientEmail" }, { status: 400 });
  }

  // Ownership-aware create: a (messageId, recipientEmail) row claimed by
  // another user must not be silently re-used or overwritten.
  const existing = await prisma.readReceipt.findFirst({
    where: { messageId, recipientEmail },
  });

  if (existing) {
    if (existing.userId !== user.id) {
      return NextResponse.json({ error: "Receipt already exists" }, { status: 409 });
    }
    return NextResponse.json({ ok: true });
  }

  try {
    await prisma.readReceipt.create({
      data: { userId: user.id, messageId, recipientEmail },
    });
  } catch {
    // Unique constraint race — another request created the row first
    return NextResponse.json({ error: "Receipt already exists" }, { status: 409 });
  }

  return NextResponse.json({ ok: true });
}
