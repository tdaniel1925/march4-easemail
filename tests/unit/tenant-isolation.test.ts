import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync } from "fs";
import { join } from "path";

/**
 * TENANT ISOLATION GUARD (static analysis, CI-enforced)
 *
 * The app connects to Postgres as a superuser that bypasses RLS, so tenant
 * isolation is enforced in the application layer: every Prisma mutation on a
 * tenant-scoped model MUST be filtered by a tenant key. This test scans the API
 * routes and fails the build if a mutation could touch another tenant's row —
 * making the "filter by userId" convention impossible to forget silently.
 *
 * Pattern allowed:
 *   - where includes `userId` (the tenant key), OR
 *   - delete/update by `id` that is provably an ownership-verified id (the route
 *     fetched the row by userId first). We approximate this by requiring that a
 *     bare `where: { id }` mutation appears in a file that ALSO performs a
 *     userId-scoped findFirst/findMany/findUnique earlier (ownership check).
 *
 * This is defense-in-depth and a regression gate, not a replacement for the
 * eventual move to a non-superuser DB role with real RLS.
 */

// Models whose rows belong to a single tenant (user). Mutations must be scoped.
const TENANT_SCOPED_MODELS = [
  "draft",
  "signature",
  "cachedFolder",
  "cachedEmail",
  "cachedCalendarEvent",
  "cachedContact",
  "emailRule",
  "emailAttachment",
  "aiGeneratedReply",
  "cachedSearchResult",
  "syncStatus",
  "notificationLog",
  "snoozedEmail",
  "readReceipt",
  "todoItem",
  "emailTemplate",
  "followUpReminder",
  "pendingEmail",
  "emailDeltaLink",
  "webhookSubscription",
  "msConnectedAccount",
  "imapConnectedAccount",
  "jmapConnectedAccount",
  "msalTokenCache",
];

const MUTATIONS = ["update", "updateMany", "delete", "deleteMany", "upsert"];

const API_DIR = join(process.cwd(), "app", "api");

// Admin routes legitimately mutate other users' rows (after requireAdmin()).
const ADMIN_PREFIX = join("app", "api", "admin");

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (entry === "route.ts") out.push(full);
  }
  return out;
}

/**
 * Returns the snippet of source from a mutation call's `.modelMutation(` to the
 * matching close paren, so we can inspect its arguments (the `where` clause).
 */
function extractCallArgs(src: string, startIdx: number): string {
  let depth = 0;
  let i = src.indexOf("(", startIdx);
  if (i === -1) return "";
  const begin = i;
  for (; i < src.length; i++) {
    if (src[i] === "(") depth++;
    else if (src[i] === ")") {
      depth--;
      if (depth === 0) return src.slice(begin, i + 1);
    }
  }
  return src.slice(begin);
}

describe("tenant isolation (static guard over app/api)", () => {
  const routeFiles = walk(API_DIR);

  it("finds route files to scan", () => {
    expect(routeFiles.length).toBeGreaterThan(50);
  });

  for (const file of routeFiles) {
    const rel = file.replace(process.cwd() + "\\", "").replace(process.cwd() + "/", "");
    const isAdmin = rel.includes(ADMIN_PREFIX) || rel.includes("admin/");
    // Cron janitors run system-wide (no user context) and clean up by time
    // predicates (expiresAt). They are exempt, but must be CRON_SECRET-guarded.
    const isCron = rel.includes(join("api", "cron")) || rel.includes("api/cron/");

    it(`tenant-scoped mutations are tenant-filtered: ${rel}`, () => {
      const src = readFileSync(file, "utf8");
      // A cron janitor must be CRON_SECRET-guarded to earn its exemption.
      if (isCron) {
        expect(
          /CRON_SECRET/.test(src),
          `${rel} mutates tenant data without user scope but is not CRON_SECRET-guarded`
        ).toBe(true);
        return;
      }
      // Whole-file signal that the route performs an ownership check by userId.
      const hasOwnershipCheck =
        /findFirst\s*\(\s*\{[\s\S]*?userId/.test(src) ||
        /findUnique\s*\(\s*\{[\s\S]*?userId/.test(src) ||
        /findMany\s*\(\s*\{[\s\S]*?userId/.test(src) ||
        /verifyAccountOwnership/.test(src) ||
        /requireAdmin/.test(src);

      const violations: string[] = [];

      for (const model of TENANT_SCOPED_MODELS) {
        for (const mut of MUTATIONS) {
          const needle = `.${model}.${mut}(`;
          let idx = src.indexOf(needle);
          while (idx !== -1) {
            const call = extractCallArgs(src, idx + needle.length - 1);
            const wherePart = call.match(/where\s*:\s*\{[\s\S]*?\}/);
            const whereStr = wherePart ? wherePart[0] : "";
            const tenantScoped = /\buserId\b/.test(whereStr) || /\borgId\b/.test(whereStr);
            // A bare id-only mutation is allowed ONLY when the route does an
            // ownership check elsewhere (verified-then-mutate-by-id), or is admin.
            const idOnly = /\bid\b/.test(whereStr) && !tenantScoped;
            const ok =
              tenantScoped || (idOnly && (hasOwnershipCheck || isAdmin)) || (isAdmin && hasOwnershipCheck);
            if (!ok) {
              violations.push(`${model}.${mut} — where: ${whereStr || "(none)"}`);
            }
            idx = src.indexOf(needle, idx + needle.length);
          }
        }
      }

      expect(
        violations,
        `Unscoped tenant mutation(s) in ${rel} — every update/delete on a tenant-owned model must filter by userId/orgId, or operate on an ownership-verified id:\n  ${violations.join(
          "\n  "
        )}`
      ).toEqual([]);
    });
  }
});
