import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireOrgAdmin, canActOnOrg } from "@/lib/rbac";
import { audit } from "@/lib/audit";
import { z } from "zod";

// Manage the retention policy for an org. org_admin manages their own org;
// super_admin may pass an explicit orgId.

const days = z.coerce.number().int().min(0).max(36500); // 0..100y; 0 = forever
const upsertSchema = z.object({
  orgId: z.string().min(1).max(64).optional(),
  cachedEmailDays: days.optional(),
  cachedCalendarDays: days.optional(),
  cachedContactDays: days.optional(),
  auditLogDays: days.optional(),
});

// ─── GET /api/admin/retention — current policy for the admin's org ────────────
export async function GET(req: NextRequest) {
  const admin = await requireOrgAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const orgId =
    admin.role === "super_admin"
      ? new URL(req.url).searchParams.get("orgId") ?? admin.orgId
      : admin.orgId;

  const policy = await prisma.retentionPolicy.findUnique({ where: { orgId } });
  return NextResponse.json(
    policy ?? {
      orgId,
      cachedEmailDays: 0,
      cachedCalendarDays: 0,
      cachedContactDays: 0,
      auditLogDays: 0,
    }
  );
}

// ─── PUT /api/admin/retention — upsert the policy ─────────────────────────────
export async function PUT(req: NextRequest) {
  const admin = await requireOrgAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parsed = upsertSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const orgId = parsed.data.orgId ?? admin.orgId;
  if (!canActOnOrg(admin, orgId)) {
    return NextResponse.json({ error: "Forbidden — other organization" }, { status: 403 });
  }
  // org_admin cannot retarget another org even by passing orgId.
  if (admin.role !== "super_admin" && orgId !== admin.orgId) {
    return NextResponse.json({ error: "Forbidden — other organization" }, { status: 403 });
  }

  const data = {
    cachedEmailDays: parsed.data.cachedEmailDays ?? 0,
    cachedCalendarDays: parsed.data.cachedCalendarDays ?? 0,
    cachedContactDays: parsed.data.cachedContactDays ?? 0,
    auditLogDays: parsed.data.auditLogDays ?? 0,
  };

  const policy = await prisma.retentionPolicy.upsert({
    where: { orgId },
    update: data,
    create: { orgId, ...data },
  });

  void audit({
    action: "retention.policy_update",
    userId: admin.userId,
    actorEmail: admin.email,
    orgId,
    target: orgId,
    metadata: data,
    req,
  });

  return NextResponse.json(policy);
}
