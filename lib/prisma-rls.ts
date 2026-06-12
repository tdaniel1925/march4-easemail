import { prisma } from "@/lib/prisma";
import type { PrismaClient } from "@/lib/generated/prisma";

/**
 * GUC-wrapped tenant-scoped Prisma execution (RLS enforcement layer).
 *
 * Runs `fn` inside a transaction that first sets the per-request tenant GUCs
 * (`app.current_user_id`, `app.current_org_id`) with SET LOCAL. The RLS
 * policies (migration 20260612150000_enable_rls) read these GUCs, so when the
 * app connects with a non-BYPASSRLS role, cross-tenant rows become invisible
 * at the database level — defense in depth behind the app-layer guard.
 *
 * SET LOCAL is transaction-scoped, which is REQUIRED for correctness under the
 * transaction-mode pooler: the value cannot leak to another request that reuses
 * the pooled connection. (Verified: SET LOCAL inside a tx works on the pooler.)
 *
 * STATUS: not yet wired into request paths. The app currently connects as a
 * BYPASSRLS role, so this is dormant. It is unit/integration-proven against a
 * constrained role in tests/ before any production cutover.
 */

type TxClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

export interface TenantContext {
  userId: string;
  orgId?: string | null;
}

export async function withTenant<T>(
  ctx: TenantContext,
  fn: (tx: TxClient) => Promise<T>,
  client: PrismaClient = prisma
): Promise<T> {
  if (!ctx.userId) throw new Error("withTenant requires a userId");

  return client.$transaction(async (tx) => {
    // Parameterized SET LOCAL via set_config (avoids string interpolation).
    // is_local = true → scoped to this transaction only.
    await tx.$executeRaw`SELECT set_config('app.current_user_id', ${ctx.userId}, true)`;
    await tx.$executeRaw`SELECT set_config('app.current_org_id', ${ctx.orgId ?? ""}, true)`;
    return fn(tx as unknown as TxClient);
  }) as Promise<T>;
}
