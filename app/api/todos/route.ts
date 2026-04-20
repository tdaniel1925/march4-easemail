import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
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
    const body = await req.json();
    const { text, priority } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "text is required" }, { status: 400 });
    }

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
