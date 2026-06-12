import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireOrgAdmin, canActOnOrg } from "@/lib/rbac";
import { audit } from "@/lib/audit";
import { z } from "zod";

const adminCreateSignatureSchema = z.object({
  userId: z.string().min(1, "userId required").max(128),
  name: z.string().min(1, "name required").max(100),
  title: z.string().max(100).optional(),
  company: z.string().max(100).optional(),
  phone: z.string().max(50).optional(),
  isDefault: z.boolean().optional(),
});

// ─── GET /api/admin/signatures — signatures within the admin's org ────────────
// super_admin sees all orgs; org_admin sees only their own org's users.

export async function GET() {
  const admin = await requireOrgAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const sigs = await prisma.signature.findMany({
    where: admin.role === "super_admin" ? {} : { user: { orgId: admin.orgId } },
    include: { user: { select: { id: true, email: true, name: true } } },
    orderBy: [{ userId: "asc" }, { isDefault: "desc" }, { createdAt: "asc" }],
  });

  return NextResponse.json(sigs);
}

// ─── POST /api/admin/signatures — create signature for a user in-scope ────────

export async function POST(req: NextRequest) {
  const admin = await requireOrgAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parsed = adminCreateSignatureSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { userId, name, title, company, phone, isDefault } = parsed.data;

  if (!userId.trim()) return NextResponse.json({ error: "userId required" }, { status: 400 });
  if (!name.trim()) return NextResponse.json({ error: "name required" }, { status: 400 });

  // Verify target user exists AND is within the admin's authority (org scope).
  const target = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, orgId: true } });
  if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });
  if (!canActOnOrg(admin, target.orgId)) {
    return NextResponse.json({ error: "Forbidden — user is in another organization" }, { status: 403 });
  }

  if (isDefault) {
    await prisma.signature.updateMany({
      where: { userId },
      data: { isDefault: false },
    });
  }

  const sig = await prisma.signature.create({
    data: {
      userId,
      name: name.trim(),
      title: title?.trim() ?? null,
      company: company?.trim() ?? null,
      phone: phone?.trim() ?? null,
      isDefault: isDefault ?? false,
    },
    include: { user: { select: { id: true, email: true, name: true } } },
  });

  void audit({
    action: "admin.signature_assign",
    userId: admin.userId,
    actorEmail: admin.email,
    orgId: target.orgId,
    target: sig.id,
    metadata: { targetUserId: userId },
    req,
  });
  return NextResponse.json(sig, { status: 201 });
}
