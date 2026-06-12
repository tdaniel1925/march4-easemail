import { NextRequest, NextResponse } from "next/server";
import { readFileSync, readdirSync, existsSync } from "fs";
import { join } from "path";
import { Pool } from "pg";

// ─── GET /api/cron/migrate ────────────────────────────────────────────────────
// Applies pending SQL migrations from prisma/migrations through the POOLER
// connection (the Vercel build environment cannot reach Supabase's direct
// :5432 port, so `prisma db push`/`migrate deploy` can't run at build time —
// see CLAUDE.md / memory). Each migration's filename is recorded in a tracking
// table so re-runs are no-ops. Migrations must be written idempotently
// (IF NOT EXISTS / ADD COLUMN IF NOT EXISTS) as a belt-and-braces guard.
//
// Auth: Bearer CRON_SECRET. Call once after each deploy (Vercel cron or a
// post-deploy webhook). Safe to call repeatedly.

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const TRACKING_TABLE = "_applied_sql_migrations";

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
  }
  if (req.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rawUrl = process.env.DATABASE_URL;
  if (!rawUrl) {
    return NextResponse.json({ error: "DATABASE_URL not set" }, { status: 500 });
  }
  const connectionString = rawUrl.replace(/[?&]pgbouncer=true/i, "").replace(/\?$/, "");
  const ca = process.env.DATABASE_CA_CERT;
  const pool = new Pool({
    connectionString,
    ssl: ca ? { rejectUnauthorized: true, ca } : { rejectUnauthorized: false },
    max: 1,
  });

  const applied: string[] = [];
  const skipped: string[] = [];
  try {
    await pool.query(
      `CREATE TABLE IF NOT EXISTS "${TRACKING_TABLE}" (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())`
    );

    const migrationsDir = join(process.cwd(), "prisma", "migrations");
    if (!existsSync(migrationsDir)) {
      return NextResponse.json({ ok: true, applied, skipped, note: "no migrations dir" });
    }

    // Sorted directory names == chronological order (timestamp-prefixed).
    const dirs = readdirSync(migrationsDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
      .sort();

    const done = new Set(
      (await pool.query(`SELECT name FROM "${TRACKING_TABLE}"`)).rows.map((r) => r.name as string)
    );

    for (const dir of dirs) {
      if (done.has(dir)) {
        skipped.push(dir);
        continue;
      }
      const sqlPath = join(migrationsDir, dir, "migration.sql");
      if (!existsSync(sqlPath)) {
        skipped.push(dir);
        continue;
      }
      const sql = readFileSync(sqlPath, "utf8");
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        await client.query(sql);
        await client.query(`INSERT INTO "${TRACKING_TABLE}"(name) VALUES ($1) ON CONFLICT DO NOTHING`, [dir]);
        await client.query("COMMIT");
        applied.push(dir);
      } catch (err) {
        await client.query("ROLLBACK").catch(() => {});
        // Stop on first failure so a broken migration doesn't cascade.
        return NextResponse.json(
          {
            ok: false,
            applied,
            skipped,
            failed: dir,
            error: err instanceof Error ? err.message : String(err),
          },
          { status: 500 }
        );
      } finally {
        client.release();
      }
    }

    return NextResponse.json({ ok: true, applied, skipped });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  } finally {
    await pool.end().catch(() => {});
  }
}
