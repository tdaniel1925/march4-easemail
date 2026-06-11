import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

const receiptsQuerySchema = z.object({
  // Comma-separated message ids; empty/missing is tolerated (returns [])
  messageIds: z.string().max(25600).optional(),
});

const createReceiptSchema = z.object({
  messageId: z.string().max(512).refine((s) => s.trim().length > 0, "Invalid messageId"),
  recipientEmail: z.string().email().max(320),
});

/** GET /api/mail/receipts?messageIds=id1,id2,...
 *  Returns read receipt status for a list of sent message IDs.
 */
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsedQuery = receiptsQuerySchema.safeParse({
    messageIds: req.nextUrl.searchParams.get("messageIds") ?? undefined,
  });
  if (!parsedQuery.success) {
    return NextResponse.json({ error: "Invalid request", details: parsedQuery.error.flatten() }, { status: 400 });
  }
  const messageIdsParam = parsedQuery.data.messageIds ?? "";
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

  const parsed = createReceiptSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
  }
  const { messageId, recipientEmail } = parsed.data;

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
