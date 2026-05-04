import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

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
    const body = await req.json();
    const { status, remindAt } = body;

    const validStatuses = ["pending", "triggered", "replied", "dismissed"];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

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
