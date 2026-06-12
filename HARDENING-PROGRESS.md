# 🍞 Enterprise Hardening — Progress & Status

Honest status of the enterprise-readiness work. Updated as items land.

## ✅ Done this session

### 1. Tenant isolation — application-layer enforcement + regression gate
**Finding:** the app connects to Postgres as the `postgres` superuser, which **bypasses RLS**. RLS is disabled on all 31 tables. So tenant isolation is enforced only in application code (every Prisma mutation filtered by `userId`), which was a *convention*, not a *guarantee*.

**Done:**
- Added `tests/unit/tenant-isolation.test.ts` — a static guard that scans all 88 API routes and **fails CI** if any `update/delete/updateMany/deleteMany/upsert` on a tenant-scoped model isn't filtered by `userId`/`orgId` (or isn't an ownership-verified `id`, or a CRON_SECRET-guarded janitor). 89/89 pass.
- Fixed 2 real gaps it surfaced:
  - `rules/reorder` — per-row `update({where:{id}})` → `updateMany({where:{id, userId}})` (tenant-safe by construction, not just by a preceding check).
  - `mail/receipt-webhook` — removed the cross-tenant fallback that updated read receipts by `messageId` across ALL users when the subscription owner couldn't be resolved; now skips the write instead.

**Still open (planned, NOT a quick fix):** true DB-level RLS requires migrating the app off the `postgres` superuser to a dedicated non-superuser role, re-granting privileges, and solving the transaction-pooler GUC problem (`SET LOCAL app.current_user_id` inside every transaction). That's a deliberate, separately-tested migration — the app-layer guard above is the correct interim and a permanent defense-in-depth layer.

### 2. CI pipeline (was entirely missing)
**Done:** `.github/workflows/ci.yml` — gates every push/PR to `master` on type-check → lint → unit tests (incl. the tenant guard) → production build, with pinned pnpm 9.15.2 / Node 22 and placeholder env. This is the safety net that makes all other verification automatic. Lockfile confirmed in sync for `--frozen-lockfile`.

## 🟡 Already present (corrected from the earlier review)

### 3. Observability — Sentry is wired, just dormant
Correction to my earlier analysis: `@sentry/nextjs` IS fully integrated — `instrumentation.ts`, `sentry.{client,server,edge}.config.ts`, and `withSentryConfig` in `next.config.ts`. It fails safe (`enabled: !!NEXT_PUBLIC_SENTRY_DSN`), so it's simply inactive until you set the DSN.
**Action for you (1 env var):** set `NEXT_PUBLIC_SENTRY_DSN` (and `SENTRY_AUTH_TOKEN` for source maps) in Vercel → error/trace reporting goes live. No code change needed.

### Deploy/migrations (fixed earlier today)
`GET /api/cron/migrate` applies pending SQL migrations through the pooler (the Vercel build can't reach the direct DB port). Auto-runs every 10 min. See memory `easemail-deploy-db`.

## ✅ Done (cont.)

### 4. Audit logging — see item 4 above (append-only AuditLog + lib/audit.ts, wired into send/disconnect/signout + admin actions).

### 5. RBAC / per-org admin
**Was:** `isAdminEmail` global env allowlist, used in 3 places; org_admins reaching admin surfaces would have seen ALL tenants' data.
**Done:**
- `User.role` column (`member` | `org_admin` | `super_admin`) + idempotent migration (applied to prod via the pooler; all 11 users default to `member`).
- `lib/rbac.ts`: `getAuthContext` (resolves effective role; ADMIN_EMAILS bootstraps super_admin so the owner never locks out), `requireRole`/`requireOrgAdmin`/`requireSuperAdmin`, `canActOnOrg`, `roleAtLeast`. Pure-logic unit tests in `tests/unit/rbac.test.ts`.
- Admin signature routes (`/api/admin/signatures`, `[id]`) migrated off the global allowlist to `requireOrgAdmin` + `canActOnOrg` org-scoping; GET/list now filtered to the admin's org unless super_admin.
- `app/admin/page.tsx` gated by role and **all cross-user queries org-scoped** (users, sync stats, rules, signatures) — an org_admin sees only their tenant.
- New `PATCH /api/admin/users/[id]/role` to grant/revoke roles: org_admin can manage member|org_admin in its own org only; only super_admin can grant super_admin; no self-role-change (anti-escalation). Audited as `admin.role_change`.
- tenant-isolation guard updated to recognize RBAC-guarded routes.

### 6. Data retention + legal hold
**Was:** none. A law-firm SaaS must retain/purge on a policy and freeze data under litigation hold.
**Done:**
- `RetentionPolicy` (per-org, days-to-keep per cached data class; 0 = keep forever) and `LegalHold` (whole-org or single-user; releasing sets `releasedAt`, never hard-deleted) models + idempotent migration (applied to prod via the pooler).
- `lib/retention.ts`: `getHeldUserIds`, `isUserUnderHold`, `getActivePolicies`.
- `GET /api/cron/retention` (CRON_SECRET-guarded, daily 03:30): purges cached emails/calendar/contacts/audit-logs older than each org's window, **always skipping users under an active legal hold**; audited as `retention.purge`.
- Admin APIs (org_admin scoped, audited): `GET/PUT /api/admin/retention` (policy), `GET/POST /api/admin/legal-holds`, `DELETE /api/admin/legal-holds/[id]` (release).

### 7. Fail-closed rate limiting
**Was:** a single Upstash limiter that failed OPEN — if Redis erred OR Upstash was simply unconfigured, every limit became a no-op, so auth/send/AI endpoints lost all protection during an outage.
**Done (`lib/rate-limit.ts`):**
- Per-limiter `failClosed` flag — ON for `auth`, `send`, `ai` (abuse/spend-sensitive); OFF for `read`/`general`.
- A bounded per-instance **in-memory fallback limiter** so fail-closed limiters still enforce caps when Upstash isn't configured (local/CI/current prod) instead of allowing everything.
- On a store ERROR, fail-closed limiters fall back to the in-memory limiter and reject if over (instead of blanket-allow); fail-open limiters still pass through.
- `withRateLimit` accepts a limiter key (`"auth"`) or the legacy instance; existing callers keep working.
- Unit tests in `tests/unit/rate-limit.test.ts`.

### 8. Sync/provider test coverage (started)
**Was:** the provider transform/parse helpers — exactly where this session's real bugs lived (header-injection escaping, timezone-naive datetime parsing, cid/image rewriting, base64url) — were unexported and untested.
**Done:**
- Extracted `formatAddress` + `parseGraphDateTime` into `lib/providers/mime-helpers.ts` (pure, dependency-free) and pointed imap.ts / calendar-sync.ts at it (behavior-preserving).
- `tests/unit/provider-helpers.test.ts` (14 tests): header-injection escaping incl. the `Evil" <attacker@…>` breakout case; offset-less Graph datetime parsed as UTC; provider-type routing; `proxyExternalImages` rewrites http(s) but skips cid/data/blob/relative/api; AES-256-GCM round-trip, fresh-IV, and tamper-rejection.
- Total unit tests now 215 (was 100 at the start of hardening).
**Sync orchestration harness (done for email):** `tests/unit/email-sync.test.ts` runs the REAL `syncEmails` control flow against faked boundaries only — `graphFetch` (scripted Response queue) + an in-memory Prisma fake. 6 tests cover the bug-prone paths: first-sync upsert + delta-link persist, nextLink pagination, `@removed` deletion (user-scoped), 410 → token reset, resume-from-stored-token, and non-410 error propagation. The pattern (mock the network + DB boundaries, exercise real logic) covers three distinct sync shapes:
- `tests/unit/email-sync.test.ts` (6) — delta-token resume, nextLink pagination, `@removed` deletion (user-scoped), 410 reset, error propagation.
- `tests/unit/folder-sync.test.ts` (4) — top-level persist with ownership, recursive child fetch, top-level pagination, per-branch resilience (a failing child branch doesn't kill the sync).
- `tests/unit/contact-sync.test.ts` (3) — pagination, displayName filtering + first-email selection, transactional delete-then-recreate full refresh (scoped to the account).
Total unit tests now 228.
**Still open:** calendar-sync (deferred — richest shape: recurrence/all-day/attendee mapping; best paired with calendar feature verification).

### 9. DB-level RLS — built & proven (no cutover, by design)
**Was:** the planned architectural item. The app connects as `postgres` (BYPASSRLS=true), so tenant isolation was app-layer only.
**Done (Phase 1 — "build + prove, no cutover"):**
- Migration `20260612150000_enable_rls`: RLS enabled + FORCEd on all 31 tenant tables with a `tenant_isolation` policy keyed on per-request GUCs (`app.current_user_id` / `app.current_org_id`) via `app_current_user_id()`/`app_current_org_id()` helpers. Applied to prod; **dormant** (the app's role bypasses it) — live app verified unaffected (all pages + DB APIs 200).
- `lib/prisma-rls.ts` `withTenant(ctx, fn)`: runs queries in a tx with transaction-scoped `SET LOCAL` GUCs (safe under the transaction-mode pooler; verified SET LOCAL works on the pooler).
- Dedicated `app_user` NOBYPASSRLS role with the cutover grants.
- `scripts/verify-rls.mjs` — repeatable PROOF: as `app_user`, no-GUC → 0 rows; GUC=userA → exactly userA's 18,402 rows and 0 of userB's; cross-tenant INSERT blocked by WITH CHECK. PASS.
- `RLS-RUNBOOK.md` — the deliberate cutover procedure (wire `withTenant` into routes → give `app_user` a login → stage on a preview → switch DATABASE_URL, with instant rollback).
**Cutover staged & blocker found (2026-06-12):** attempting the cutover surfaced an architectural blocker BEFORE any prod change — a custom non-bypassing role authenticates on the direct connection but is **rejected by the Supabase pooler** (Supavisor only authenticates known roles), and the app must use the pooler (Vercel can't reach :5432). The per-tx GUC Prisma mechanism is itself proven (`scripts/prove-rls-client.mjs` PASS as `app_user` on a direct connection). So full enforcement needs either the `authenticator`→`SET ROLE authenticated` flow over the pooler or a direct-connection runtime — both larger than a cutover. Details + options in `RLS-RUNBOOK.md`. The `app_user` role was re-locked to NOLOGIN/NOBYPASSRLS after probing (verified). Infrastructure (`lib/tenant-context.ts` ALS, `lib/prisma-rls.ts` `withTenant`) is in place for whichever enforcement path is chosen. **Net:** RLS policies proven-correct and dormant; app-layer guard remains the active enforcement.

## ⬜ Remaining enterprise gaps (in priority order)
6. **Data retention / e-discovery / legal hold** — none. Required for a law-firm SaaS.
7. **Rate limiting** — single Upstash limiter that fails open; needs per-route policy and a fail-closed option for auth endpoints.
8. **Test coverage depth** — ~26 test files for 42k LOC; the sync engine and send/schedule/delete money-paths need real coverage beyond smoke e2e.
9. **DB-level RLS** — the planned non-superuser-role migration from item 1.
10. **Per-page polish** — remaining lower-severity items in `PAGE-REVIEW-REPORT.md` (mobile inbox widths, help-shortcut docs, etc.).

## Verdict (unchanged)
Sound foundation; the work is reinforcement, not rewrite. Items 1–3 (the core of "is this safe to run for real customers") are now either done or one-env-var away. 4–6 are the genuine build-out for selling to enterprise legal buyers.
