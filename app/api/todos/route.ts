import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createTodoSchema = z.object({
  text: z.string().min(1, "text is required").max(2000, "text too long"),
  priority: z.enum(["low", "normal", "high"]).optional(),
});

export async function GET(_req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const todos = await prisma.todoItem.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(todos);
  } catch (error) {
    console.error("[GET /api/todos] Error:", error);
    return NextResponse.json({ error: "Failed to fetch todos" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const parsed = createTodoSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const { text, priority } = parsed.data;

    const todo = await prisma.todoItem.create({
      data: {
        userId: user.id,
        text,
        priority: priority || "normal",
        done: false,
      },
    });

    return NextResponse.json(todo);
  } catch (error) {
    console.error("[POST /api/todos] Error:", error);
    return NextResponse.json({ error: "Failed to create todo" }, { status: 500 });
  }
}
