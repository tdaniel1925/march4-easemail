import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireOrgAdmin, canActOnOrg, type Role } from "@/lib/rbac";
import { audit } from "@/lib/audit";
import { z } from "zod";

const setRoleSchema = z.object({
  role: z.enum(["member", "org_admin", "super_admin"]),
});

// ─── PATCH /api/admin/users/[id]/role — grant/revoke a user's role ────────────
// Authorization rules:
//  - super_admin: may set any role on any user (cross-org).
//  - org_admin:   may set member|org_admin on users WITHIN their own org only,
//                 and may NOT grant super_admin (no privilege escalation).
//  - A user cannot change their own role (prevents self-lockout/escalation).

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireOrgAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const parsed = setRoleSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const newRole = parsed.data.role as Role;

  if (id === admin.userId) {
    return NextResponse.json({ error: "You cannot change your own role" }, { status: 400 });
  }

  const target = await prisma.user.findUnique({
    where: { id },
    select: { id: true, orgId: true, role: true, email: true },
  });
  if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });

  if (!canActOnOrg(admin, target.orgId)) {
    return NextResponse.json({ error: "Forbidden — user is in another organization" }, { status: 403 });
  }

  // Only a super_admin can grant or revoke super_admin.
  if ((newRole === "super_admin" || target.role === "super_admin") && admin.role !== "super_admin") {
    return NextResponse.json({ error: "Only a super admin can manage super-admin roles" }, { status: 403 });
  }

  const updated = await prisma.user.update({
    where: { id },
    data: { role: newRole },
    select: { id: true, email: true, role: true, orgId: true },
  });

  void audit({
    action: "admin.role_change",
    userId: admin.userId,
    actorEmail: admin.email,
    orgId: target.orgId,
    target: id,
    metadata: { from: target.role, to: newRole, targetEmail: target.email },
    req,
  });

  return NextResponse.json(updated);
}
