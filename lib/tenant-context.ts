import { AsyncLocalStorage } from "node:async_hooks";

/**
 * Per-request tenant context, propagated via AsyncLocalStorage.
 *
 * Set once per request (right after auth resolves the user), then read by the
 * RLS-aware Prisma client so every query runs with the correct
 * `app.current_user_id` / `app.current_org_id` GUCs — without each route having
 * to thread a tenant-scoped client through its calls.
 */

export interface TenantContext {
  userId: string;
  orgId?: string | null;
  /**
   * Explicit cross-tenant escape hatch for code that legitimately operates
   * across tenants (cron janitors, the migrate/retention endpoints, super-admin
   * paths). When true, the RLS client uses the unscoped connection.
   */
  bypass?: boolean;
}

const storage = new AsyncLocalStorage<TenantContext>();

/** Runs `fn` with the given tenant context in scope. */
export function runWithTenant<T>(ctx: TenantContext, fn: () => T): T {
  return storage.run(ctx, fn);
}

/** Returns the current request's tenant context, or undefined outside a request. */
export function getTenantContext(): TenantContext | undefined {
  return storage.getStore();
}
