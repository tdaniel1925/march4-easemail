import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireOrgAdmin, canActOnOrg } from "@/lib/rbac";
import { audit } from "@/lib/audit";
import { z } from "zod";

// Create / list legal holds. org_admin manages holds within their own org.

const createSchema = z.object({
  // Either a whole-org hold (omit userId) or a single-user hold.
  userId: z.string().min(1).max(128).optional(),
  reason: z.string().min(1, "reason required").max(2000),
});

// ─── GET /api/admin/legal-holds — list holds for the admin's org ──────────────
export async function GET() {
  const admin = await requireOrgAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const holds = await prisma.legalHold.findMany({
    where: admin.role === "super_admin" ? {} : { orgId: admin.orgId },
    orderBy: [{ releasedAt: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json(holds);
}

// ─── POST /api/admin/legal-holds — place a hold ───────────────────────────────
export async function POST(req: NextRequest) {
  const admin = await requireOrgAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { userId, reason } = parsed.data;

  // Determine the org the hold applies to and verify authority over it.
  let orgId = admin.orgId;
  if (userId) {
    const target = await prisma.user.findUnique({ where: { id: userId }, select: { orgId: true } });
    if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });
    orgId = target.orgId;
  }
  if (!canActOnOrg(admin, orgId)) {
    return NextResponse.json({ error: "Forbidden — other organization" }, { status: 403 });
  }

  const hold = await prisma.legalHold.create({
    data: { orgId, userId: userId ?? null, reason: reason.trim(), createdByUserId: admin.userId },
  });

  void audit({
    action: "legal_hold.create",
    userId: admin.userId,
    actorEmail: admin.email,
    orgId,
    target: hold.id,
    metadata: { scope: userId ? "user" : "org", targetUserId: userId ?? null },
    req,
  });

  return NextResponse.json(hold, { status: 201 });
}
