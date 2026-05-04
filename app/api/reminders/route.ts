import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

// ─── GET /api/reminders ─────────────────────────────────────────────────────
// List user's follow-up reminders (optionally filter by status)

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const status = req.nextUrl.searchParams.get("status");

  try {
    const reminders = await prisma.followUpReminder.findMany({
      where: {
        userId: user.id,
        ...(status ? { status } : {}),
      },
      orderBy: { remindAt: "asc" },
    });

    return NextResponse.json(reminders);
  } catch (error) {
    console.error("[GET /api/reminders] Error:", error);
    return NextResponse.json({ error: "Failed to fetch reminders" }, { status: 500 });
  }
}

// ─── POST /api/reminders ────────────────────────────────────────────────────
// Create a follow-up reminder

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { messageId, remindAt, recipient, subject, conversationId, homeAccountId } = body;

    if (!messageId || !remindAt || !recipient || !subject) {
      return NextResponse.json(
        { error: "messageId, remindAt, recipient, and subject are required" },
        { status: 400 }
      );
    }

    const reminder = await prisma.followUpReminder.create({
      data: {
        userId: user.id,
        messageId,
        conversationId: conversationId || null,
        homeAccountId: homeAccountId || null,
        subject,
        recipient,
        remindAt: new Date(remindAt),
        status: "pending",
      },
    });

    return NextResponse.json(reminder, { status: 201 });
  } catch (error) {
    console.error("[POST /api/reminders] Error:", error);
    return NextResponse.json({ error: "Failed to create reminder" }, { status: 500 });
  }
}
