import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { isAdminEmail } from "@/lib/admin";

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  if (!isAdminEmail(user.email ?? "")) return null;
  return user;
}

// ─── PATCH /api/admin/signatures/[id] ────────────────────────────────────────

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const { name, title, company, phone, isDefault } = await req.json() as {
    name?: string;
    title?: string;
    company?: string;
    phone?: string;
    isDefault?: boolean;
  };

  const existing = await prisma.signature.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (isDefault) {
    await prisma.signature.updateMany({
      where: { userId: existing.userId, id: { not: id } },
      data: { isDefault: false },
    });
  }

  const sig = await prisma.signature.update({
    where: { id },
    data: {
      ...(name !== undefined ? { name: name.trim() } : {}),
      ...(title !== undefined ? { title: title?.trim() ?? null } : {}),
      ...(company !== undefined ? { company: company?.trim() ?? null } : {}),
      ...(phone !== undefined ? { phone: phone?.trim() ?? null } : {}),
      ...(isDefault !== undefined ? { isDefault } : {}),
    },
    include: { user: { select: { id: true, email: true, name: true } } },
  });

  return NextResponse.json(sig);
}

// ─── DELETE /api/admin/signatures/[id] ───────────────────────────────────────

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;

  const existing = await prisma.signature.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.signature.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
