import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireOrgAdmin, canActOnOrg } from "@/lib/rbac";
import { audit } from "@/lib/audit";

// ─── DELETE /api/admin/legal-holds/[id] — release (not delete) a hold ─────────
// Releasing sets releasedAt; the record is retained for the audit trail.

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireOrgAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const hold = await prisma.legalHold.findUnique({ where: { id }, select: { id: true, orgId: true, releasedAt: true } });
  if (!hold) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!canActOnOrg(admin, hold.orgId)) {
    return NextResponse.json({ error: "Forbidden — other organization" }, { status: 403 });
  }
  if (hold.releasedAt) {
    return NextResponse.json({ error: "Hold already released" }, { status: 409 });
  }

  const released = await prisma.legalHold.update({
    where: { id },
    data: { releasedAt: new Date() },
  });

  void audit({
    action: "legal_hold.release",
    userId: admin.userId,
    actorEmail: admin.email,
    orgId: hold.orgId,
    target: id,
    req,
  });

  return NextResponse.json(released);
}
