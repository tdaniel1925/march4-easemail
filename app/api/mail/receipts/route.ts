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

  await prisma.readReceipt.upsert({
    where: { messageId_recipientEmail: { messageId: body.messageId, recipientEmail: body.recipientEmail } },
    create: { userId: user.id, messageId: body.messageId, recipientEmail: body.recipientEmail },
    update: {},
  });

  return NextResponse.json({ ok: true });
}
