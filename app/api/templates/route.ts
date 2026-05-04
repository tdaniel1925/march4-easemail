import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

// ─── GET /api/templates ──────────────────────────────────────────────────────

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const templates = await prisma.emailTemplate.findMany({
    where: { userId: user.id },
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  return NextResponse.json(templates);
}

// ─── POST /api/templates ─────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, subject, body, variables, category } = await req.json() as {
    name: string;
    subject?: string;
    body: string;
    variables?: string[];
    category?: string;
  };

  if (!name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  if (!body?.trim()) {
    return NextResponse.json({ error: "Body is required" }, { status: 400 });
  }

  const template = await prisma.emailTemplate.create({
    data: {
      userId: user.id,
      name: name.trim(),
      subject: subject?.trim() || null,
      body: body.trim(),
      variables: variables ?? [],
      category: category?.trim() || null,
    },
  });

  return NextResponse.json(template);
}
