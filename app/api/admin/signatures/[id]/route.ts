import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireOrgAdmin, canActOnOrg } from "@/lib/rbac";
import { audit } from "@/lib/audit";
import { z } from "zod";

const adminUpdateSignatureSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  title: z.string().max(100).optional(),
  company: z.string().max(100).optional(),
  phone: z.string().max(50).optional(),
  isDefault: z.boolean().optional(),
});

/** Loads a signature with its owner's org, returns null if not found. */
async function loadWithOrg(id: string) {
  return prisma.signature.findUnique({
    where: { id },
    select: { id: true, userId: true, user: { select: { orgId: true } } },
  });
}

// ─── PATCH /api/admin/signatures/[id] ────────────────────────────────────────

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireOrgAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const parsed = adminUpdateSignatureSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { name, title, company, phone, isDefault } = parsed.data;

  const existing = await loadWithOrg(id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!canActOnOrg(admin, existing.user.orgId)) {
    return NextResponse.json({ error: "Forbidden — signature belongs to another organization" }, { status: 403 });
  }

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
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireOrgAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;

  const existing = await loadWithOrg(id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!canActOnOrg(admin, existing.user.orgId)) {
    return NextResponse.json({ error: "Forbidden — signature belongs to another organization" }, { status: 403 });
  }

  await prisma.signature.delete({ where: { id } });

  void audit({
    action: "admin.signature_delete",
    userId: admin.userId,
    actorEmail: admin.email,
    orgId: existing.user.orgId,
    target: id,
    metadata: { targetUserId: existing.userId },
    req,
  });
  return NextResponse.json({ ok: true });
}
