import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

// ─── GET /api/templates/[id] ─────────────────────────────────────────────────

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const template = await prisma.emailTemplate.findFirst({
    where: { id, userId: user.id },
  });

  if (!template) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(template);
}

// ─── PATCH /api/templates/[id] ───────────────────────────────────────────────

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { name, subject, body, variables, category } = await req.json() as {
    name?: string;
    subject?: string | null;
    body?: string;
    variables?: string[];
    category?: string | null;
  };

  // Verify ownership
  const existing = await prisma.emailTemplate.findFirst({
    where: { id, userId: user.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const template = await prisma.emailTemplate.update({
    where: { id },
    data: {
      ...(name !== undefined && { name: name.trim() }),
      ...(subject !== undefined && { subject: subject?.trim() || null }),
      ...(body !== undefined && { body: body.trim() }),
      ...(variables !== undefined && { variables }),
      ...(category !== undefined && { category: category?.trim() || null }),
    },
  });

  return NextResponse.json(template);
}

// ─── DELETE /api/templates/[id] ──────────────────────────────────────────────

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  // Verify ownership
  const existing = await prisma.emailTemplate.findFirst({
    where: { id, userId: user.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.emailTemplate.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
