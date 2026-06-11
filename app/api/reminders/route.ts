import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const reminderStatusSchema = z.enum(["pending", "triggered", "replied", "dismissed"]);

const createReminderSchema = z.object({
  messageId: z.string().min(1, "messageId is required").max(512),
  // Equivalent to the previous manual new Date()/isNaN guard
  remindAt: z
    .string()
    .min(1, "remindAt is required")
    .max(64)
    .refine((s) => !isNaN(new Date(s).getTime()), "remindAt must be a valid date"),
  recipient: z.string().min(1, "recipient is required").max(320),
  subject: z.string().min(1, "subject is required").max(1000),
  conversationId: z.string().max(512).nullable().optional(),
  homeAccountId: z.string().max(512).nullable().optional(),
});

// ─── GET /api/reminders ─────────────────────────────────────────────────────
// List user's follow-up reminders (optionally filter by status)

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const rawStatus = req.nextUrl.searchParams.get("status");
  let status: string | null = null;
  if (rawStatus !== null) {
    const parsedStatus = reminderStatusSchema.safeParse(rawStatus);
    if (!parsedStatus.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsedStatus.error.flatten() },
        { status: 400 }
      );
    }
    status = parsedStatus.data;
  }

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
    const parsed = createReminderSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const { messageId, remindAt, recipient, subject, conversationId, homeAccountId } = parsed.data;

    const remindAtDate = new Date(remindAt);

    const reminder = await prisma.followUpReminder.create({
      data: {
        userId: user.id,
        messageId,
        conversationId: conversationId || null,
        homeAccountId: homeAccountId || null,
        subject,
        recipient,
        remindAt: remindAtDate,
        status: "pending",
      },
    });

    return NextResponse.json(reminder, { status: 201 });
  } catch (error) {
    console.error("[POST /api/reminders] Error:", error);
    return NextResponse.json({ error: "Failed to create reminder" }, { status: 500 });
  }
}
