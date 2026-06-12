# 🍞 Row-Level Security — Status & Cutover Runbook

## Status: BUILT & PROVEN, NOT CUT OVER (by design)

RLS policies are deployed to production and **dormant**. The app connects as the
`postgres` role, which has `BYPASSRLS = true`, so the policies do not affect the
running app at all (verified: all pages + DB-backed APIs return 200 after the
policies were applied). The application-layer tenant guard
(`tests/unit/tenant-isolation.test.ts`, CI-enforced) remains the active
protection. RLS is the **database-level defense-in-depth layer** that becomes
enforcing the moment the app uses a non-bypassing role.

## What's in place

- **Migration `20260612150000_enable_rls`** — enables + FORCEs RLS on all 31
  tenant tables with a `tenant_isolation` policy keyed on per-request GUCs:
  - user-scoped tables: `"userId" = app_current_user_id()`
  - `audit_logs` / `legal_holds`: owner rows OR `userId IS NULL` (system rows)
  - org-scoped (`org_contacts`, `retention_policies`): `"orgId" = app_current_org_id()`
  - `users`: own row OR same-org; `organizations`: own org
  - Helper functions `app_current_user_id()` / `app_current_org_id()` read the GUCs.
- **`lib/prisma-rls.ts`** — `withTenant(ctx, fn)` runs `fn` inside a transaction
  that does `SET LOCAL app.current_user_id/org_id` via `set_config(..., true)`.
  Transaction-scoped, so it is safe under the transaction-mode pooler (a value
  cannot leak to another request reusing the pooled connection). Not yet wired
  into request paths (dormant until cutover).
- **`app_user` role** — a `NOLOGIN NOBYPASSRLS` role with `SELECT/INSERT/UPDATE/
  DELETE` + sequence + schema-usage grants. This is the intended cutover role.
- **`scripts/verify-rls.mjs`** — repeatable proof. Last run:
  - no GUC → 0 rows visible (deny-by-default) ✅
  - GUC=userA → exactly userA's 18,402 rows, 0 of userB's 15,391 ✅
  - cross-tenant INSERT blocked by WITH CHECK ✅

## Cutover runbook (a SEPARATE, deliberate change — not done here)

Cutover means the running app authenticates as a non-bypassing role so RLS is
enforced in production. Do this only with a tested rollback. Steps:

1. **Wire `withTenant` into request paths.** Every authenticated route that
   touches tenant data must run its Prisma work inside `withTenant({ userId,
   orgId }, tx => ...)` so the GUCs are set. Routes that legitimately cross
   tenants (cron janitors, the migrate endpoint, admin super-admin paths) must
   keep using a bypassing connection or an explicit elevated path.
2. **Give `app_user` a login + connection string.** `ALTER ROLE app_user LOGIN
   PASSWORD '...';` then build a pooler DATABASE_URL for it. Keep the `postgres`
   URL available as the rollback.
3. **Stage it.** Point a preview deployment's DATABASE_URL at `app_user`, run
   the full e2e suite, and confirm every flow works under RLS (watch for any
   route that forgot `withTenant` — it will see 0 rows).
4. **Cut over production** by switching DATABASE_URL to the `app_user` pooler
   URL. **Rollback** = switch DATABASE_URL back to the `postgres` URL (instant).
5. Re-run `node scripts/verify-rls.mjs` to confirm enforcement.

## Why it's staged this way

Switching the production DB role is the one change that can take the live app
down (a missed `withTenant` makes a route silently return empty). It is built
and proven here so the risky part — verifying every query path under the
constrained role — can be done deliberately against a preview environment, with
an instant DATABASE_URL rollback, rather than rushed against the live law-firm DB.
