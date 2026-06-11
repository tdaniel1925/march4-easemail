import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createTemplateSchema = z.object({
  name: z.string().min(1, "Name is required").max(200, "Name too long"),
  subject: z.string().max(500, "Subject too long").optional(),
  body: z.string().min(1, "Body is required").max(200_000, "Body too long"),
  variables: z.array(z.string().max(100)).max(100).optional(),
  category: z.string().max(100, "Category too long").optional(),
});

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

  const parsed = createTemplateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { name, subject, body, variables, category } = parsed.data;

  if (!name.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  if (!body.trim()) {
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
