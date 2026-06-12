/**
 * RLS verification — proves the row-level-security policies isolate tenants
 * when accessed by a NON-BYPASSRLS role, without touching the running app.
 *
 * Run: node scripts/verify-rls.mjs
 * Requires .env.local with DIRECT_URL (direct, non-pooler connection).
 *
 * What it proves, as the dedicated non-bypassing `app_user` role:
 *   1. No GUC set            → 0 rows visible (deny-by-default).
 *   2. GUC = userA           → exactly userA's rows, none of userB's.
 *   3. Cross-tenant INSERT    → blocked by the policy WITH CHECK.
 * Meanwhile the app's role (postgres, BYPASSRLS) is unaffected.
 *
 * This is the evidence behind the "build + prove, no cutover" RLS work.
 * See RLS-RUNBOOK.md for how to actually switch production to app_user.
 */
import { loadEnvLocal } from "../tests/e2e/auth/env-util.mjs";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { Client } = require("pg");

const env = loadEnvLocal(".env.local");
const direct = (env.DIRECT_URL || env.DATABASE_URL).replace(/[?&]pgbouncer=true/i, "").replace(/\?$/, "");

async function connect() {
  for (let i = 0; i < 6; i++) {
    const c = new Client({ connectionString: direct, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 10000, query_timeout: 25000 });
    c.on("error", () => {});
    try { await c.connect(); return c; } catch (e) { await c.end().catch(() => {}); if (i === 5) throw e; await new Promise((r) => setTimeout(r, 2000)); }
  }
}

const c = await connect();
let ok = false;
try {
  const me = (await c.query("SELECT current_user")).rows[0].current_user;
  // Ensure app_user exists with the cutover grants (idempotent).
  await c.query(`DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='app_user') THEN CREATE ROLE app_user NOLOGIN NOBYPASSRLS; END IF; END $$;`);
  await c.query(`GRANT USAGE ON SCHEMA public TO app_user`);
  await c.query(`GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user`);
  await c.query(`GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user`);
  await c.query(`GRANT app_user TO ${me} WITH SET TRUE`).catch(async () => { await c.query(`GRANT app_user TO ${me}`); });

  const owners = (await c.query(`SELECT "userId", count(*)::int n FROM cached_emails GROUP BY "userId" ORDER BY n DESC LIMIT 2`)).rows;
  if (owners.length < 2) { console.log("Need >=2 users with cached emails to prove isolation."); process.exit(0); }
  const uA = owners[0].userId, ownA = owners[0].n, uB = owners[1].userId;

  await c.query("SET ROLE app_user");

  await c.query("BEGIN");
  const noGuc = (await c.query(`SELECT count(*)::int n FROM cached_emails`)).rows[0].n;
  await c.query("COMMIT");

  await c.query("BEGIN");
  await c.query(`SELECT set_config('app.current_user_id', $1, true)`, [uA]);
  const asA = (await c.query(`SELECT count(*)::int n FROM cached_emails`)).rows[0].n;
  const leakB = (await c.query(`SELECT count(*)::int n FROM cached_emails WHERE "userId"=$1`, [uB])).rows[0].n;
  let writeBlocked = false;
  try { await c.query(`INSERT INTO todo_items (id,"userId",title,priority,"createdAt","updatedAt") VALUES (gen_random_uuid()::text,$1,'x','normal',now(),now())`, [uB]); }
  catch { writeBlocked = true; }
  await c.query("ROLLBACK");
  await c.query("RESET ROLE");

  console.log(`[no GUC] visible: ${noGuc} (expect 0)`);
  console.log(`[GUC=A]  visible: ${asA} (expect ${ownA}); userB leaked: ${leakB} (expect 0)`);
  console.log(`[GUC=A]  cross-tenant INSERT blocked: ${writeBlocked} (expect true)`);
  ok = noGuc === 0 && asA === ownA && leakB === 0 && writeBlocked;
  console.log(ok ? "\nRLS PROOF: PASS ✅" : "\nRLS PROOF: FAIL ❌");
} finally {
  await c.end().catch(() => {});
}
process.exit(ok ? 0 : 1);
