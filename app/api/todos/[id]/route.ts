import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

type Params = Promise<{ id: string }>;

export async function PATCH(req: NextRequest, { params }: { params: Params }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();

    // Security: Ensure user owns this todo
    const existing = await prisma.todoItem.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    const updated = await prisma.todoItem.update({
      where: { id },
      data: {
        text: body.text !== undefined ? body.text : undefined,
        done: body.done !== undefined ? body.done : undefined,
        priority: body.priority !== undefined ? body.priority : undefined,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PATCH /api/todos/[id]] Error:", error);
    return NextResponse.json({ error: "Failed to update todo" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Params }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    // Security: Ensure user owns this todo
    const existing = await prisma.todoItem.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    await prisma.todoItem.delete({
      where: { id },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[DELETE /api/todos/[id]] Error:", error);
    return NextResponse.json({ error: "Failed to delete todo" }, { status: 500 });
  }
}
