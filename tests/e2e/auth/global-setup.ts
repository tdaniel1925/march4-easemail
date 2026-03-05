/**
 * Playwright Global Setup — Auto Auth
 *
 * Runs ONCE before all tests. Uses the Supabase Admin API to generate a
 * magic-link for the test account, navigates to it in a headless browser,
 * and saves the resulting authenticated session to tests/e2e/auth/session.json.
 *
 * Requires in .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   TEST_USER_EMAIL  (defaults to info@tonnerow.com)
 */

import { chromium, type FullConfig } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

const SESSION_PATH = path.join(__dirname, "session.json");
const ENV_PATH = path.join(__dirname, "../../../.env.local");

export default async function globalSetup(config: FullConfig) {
  // Load .env.local so env vars are available in this Node process
  if (fs.existsSync(ENV_PATH)) {
    dotenv.config({ path: ENV_PATH });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const testEmail   = process.env.TEST_USER_EMAIL ?? "info@tonnerow.com";
  const baseURL     = (config.projects[0]?.use?.baseURL as string | undefined)
                      ?? "http://localhost:4000";

  if (!supabaseUrl || !serviceKey) {
    throw new Error(
      "global-setup: missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local"
    );
  }

  // ── 1. Generate magic link via Admin API ───────────────────────────────────
  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email: testEmail,
    options: { redirectTo: `${baseURL}/auth/callback` },
  });

  if (error || !data?.properties?.action_link) {
    throw new Error(`global-setup: failed to generate magic link — ${error?.message ?? "no action_link"}`);
  }

  const magicLink = data.properties.action_link;

  // ── 2. Navigate in headless browser → let auth/callback complete ───────────
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page    = await context.newPage();

  // Magic link: Supabase verifies token → redirects to /auth/callback → /inbox
  await page.goto(magicLink, { waitUntil: "networkidle", timeout: 20000 });

  // Wait until we're past the /auth/callback redirect (any other page)
  await page.waitForFunction(
    () => !window.location.pathname.startsWith("/auth/callback"),
    { timeout: 15000 }
  );

  // ── 3. Save authenticated cookies ─────────────────────────────────────────
  await context.storageState({ path: SESSION_PATH });
  await browser.close();

  console.log(`\n✅  Playwright auth session saved → ${SESSION_PATH}\n`);
}
