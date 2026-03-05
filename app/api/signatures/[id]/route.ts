import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

// ─── PUT /api/signatures/[id] ─────────────────────────────────────────────────

export async function PUT(req: NextRequest, { params }: Params) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const sig = await prisma.signature.findFirst({ where: { id, userId: user.id } });
  if (!sig) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { name, title, company, phone, isDefault } = await req.json() as {
    name?: string;
    title?: string;
    company?: string;
    phone?: string;
    isDefault?: boolean;
  };

  if (isDefault) {
    await prisma.signature.updateMany({
      where: { userId: user.id },
      data: { isDefault: false },
    });
  }

  const updated = await prisma.signature.update({
    where: { id },
    data: {
      ...(name !== undefined && { name: name.trim() }),
      ...(title !== undefined && { title: title.trim() || null }),
      ...(company !== undefined && { company: company.trim() || null }),
      ...(phone !== undefined && { phone: phone.trim() || null }),
      ...(isDefault !== undefined && { isDefault }),
    },
  });

  return NextResponse.json(updated);
}

// ─── DELETE /api/signatures/[id] ─────────────────────────────────────────────

export async function DELETE(_req: NextRequest, { params }: Params) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const sig = await prisma.signature.findFirst({ where: { id, userId: user.id } });
  if (!sig) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.signature.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
