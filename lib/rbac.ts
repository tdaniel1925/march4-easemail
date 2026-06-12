import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { isAdminEmail } from "@/lib/admin";

/**
 * Role-based access control.
 *
 * Roles (stored on User.role):
 *  - "member"      — default; can only touch their own data.
 *  - "org_admin"   — can manage users/resources WITHIN their own org (tenant).
 *  - "super_admin" — cross-org platform admin.
 *
 * Bootstrap: any email in the ADMIN_EMAILS allowlist is treated as super_admin
 * regardless of the DB column, so the platform owner never locks themselves out
 * and existing deployments keep working before roles are assigned.
 */

export type Role = "member" | "org_admin" | "super_admin";

export interface AuthContext {
  userId: string;
  email: string;
  orgId: string;
  role: Role;
}

const RANK: Record<Role, number> = { member: 0, org_admin: 1, super_admin: 2 };

export function roleAtLeast(role: Role, min: Role): boolean {
  return RANK[role] >= RANK[min];
}

/**
 * Resolves the current authenticated user's full RBAC context, or null if not
 * signed in. The effective role is max(DB role, allowlist→super_admin).
 */
export async function getAuthContext(): Promise<AuthContext | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { orgId: true, role: true, email: true },
  });
  if (!dbUser) return null;

  let role = (dbUser.role as Role) ?? "member";
  if (isAdminEmail(user.email ?? "")) role = "super_admin"; // bootstrap
  if (!["member", "org_admin", "super_admin"].includes(role)) role = "member";

  return { userId: user.id, email: dbUser.email, orgId: dbUser.orgId, role };
}

/** Returns the context only if the user is at least `min` role, else null. */
export async function requireRole(min: Role): Promise<AuthContext | null> {
  const ctx = await getAuthContext();
  if (!ctx) return null;
  return roleAtLeast(ctx.role, min) ? ctx : null;
}

/** super_admin only (cross-org). */
export function requireSuperAdmin() {
  return requireRole("super_admin");
}

/** org_admin or super_admin. Scope writes to ctx.orgId unless super_admin. */
export function requireOrgAdmin() {
  return requireRole("org_admin");
}

/**
 * True if `actor` may act on a resource owned by `targetOrgId`.
 * super_admin: any org. org_admin: only their own org. member: never (use
 * per-user ownership checks instead).
 */
export function canActOnOrg(actor: AuthContext, targetOrgId: string): boolean {
  if (actor.role === "super_admin") return true;
  if (actor.role === "org_admin") return actor.orgId === targetOrgId;
  return false;
}
