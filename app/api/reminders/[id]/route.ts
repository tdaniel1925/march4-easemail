import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateReminderSchema = z.object({
  status: z.enum(["pending", "triggered", "replied", "dismissed"]).optional(),
  // Equivalent to the previous manual new Date()/isNaN guard
  remindAt: z
    .string()
    .max(64)
    .refine((s) => !isNaN(new Date(s).getTime()), "remindAt must be a valid date")
    .optional(),
});

// ─── PATCH /api/reminders/[id] ──────────────────────────────────────────────
// Update reminder status (dismiss, snooze)

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const parsed = updateReminderSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const { status, remindAt } = parsed.data;

    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (remindAt) updateData.remindAt = new Date(remindAt);

    const reminder = await prisma.followUpReminder.updateMany({
      where: { id, userId: user.id },
      data: updateData,
    });

    if (reminder.count === 0) {
      return NextResponse.json({ error: "Reminder not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[PATCH /api/reminders/[id]] Error:", error);
    return NextResponse.json({ error: "Failed to update reminder" }, { status: 500 });
  }
}

// ─── DELETE /api/reminders/[id] ─────────────────────────────────────────────

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const result = await prisma.followUpReminder.deleteMany({
      where: { id, userId: user.id },
    });

    if (result.count === 0) {
      return NextResponse.json({ error: "Reminder not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[DELETE /api/reminders/[id]] Error:", error);
    return NextResponse.json({ error: "Failed to delete reminder" }, { status: 500 });
  }
}
