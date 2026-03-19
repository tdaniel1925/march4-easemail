/**
 * Playwright Global Setup — Auto Auth
 *
 * Runs ONCE before all tests. Automates the Microsoft OAuth login flow
 * in a headless browser and saves the resulting authenticated session
 * to tests/e2e/auth/session.json.
 *
 * Requires in .env.local:
 *   TEST_USER_EMAIL     (defaults to info@tonnerow.com)
 *   TEST_USER_PASSWORD  (defaults to 4Xkilla1@)
 */

import { chromium, type FullConfig } from "@playwright/test";
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

  const testEmail    = process.env.TEST_USER_EMAIL ?? "info@tonnerow.com";
  const testPassword = process.env.TEST_USER_PASSWORD ?? "4Xkilla1@";
  const baseURL      = (config.projects[0]?.use?.baseURL as string | undefined)
                       ?? "http://localhost:3000";

  console.log(`\n🔐  Logging in with Microsoft account: ${testEmail}\n`);

  // ── 1. Open browser and navigate to login page ────────────────────────────
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page    = await context.newPage();

  console.log(`📍  Navigating to ${baseURL}/login`);
  try {
    await page.goto(`${baseURL}/login`, { waitUntil: 'networkidle', timeout: 30000 });
    console.log(`✅  Login page loaded`);
  } catch (error) {
    console.error(`❌  Failed to load login page:`, error);
    await page.screenshot({ path: 'login-page-timeout.png' });
    throw error;
  }

  // ── 2. Click "Sign in with Microsoft" button ───────────────────────────────
  console.log(`🔘  Clicking "Sign in with Microsoft" button`);
  await page.click('a[href="/api/auth/microsoft"]');

  // ── 3. Fill in Microsoft credentials ───────────────────────────────────────
  try {
    // Wait for Microsoft login page (or intermediate redirect)
    console.log(`⏳  Waiting for Microsoft login page...`);
    await page.waitForURL(/login\.microsoftonline\.com|microsoftonline\.com/, { timeout: 30000 });

    // Enter email
    await page.fill('input[type="email"]', testEmail);
    await page.click('input[type="submit"], button[type="submit"]');

    // Wait for password page
    await page.waitForTimeout(2000);

    // Enter password
    await page.fill('input[type="password"]', testPassword);
    await page.click('input[type="submit"], button[type="submit"]');

    // Handle "Stay signed in?" prompt (click Yes)
    await page.waitForTimeout(2000);
    try {
      await page.click('input[type="submit"][value="Yes"], button:has-text("Yes")', { timeout: 5000 });
    } catch {
      // Prompt might not appear, that's ok
    }

    // ── 4. Wait for redirect back to app ───────────────────────────────────
    await page.waitForURL(`${baseURL}/inbox`, { timeout: 30000 });

    console.log(`✅  Successfully logged in and redirected to /inbox\n`);

  } catch (error) {
    console.error(`❌  Microsoft login failed:`, error);
    await page.screenshot({ path: 'login-failure.png' });
    throw new Error(`global-setup: Microsoft login failed — ${error}`);
  }

  // ── 5. Save authenticated cookies ──────────────────────────────────────────
  await context.storageState({ path: SESSION_PATH });
  await browser.close();

  console.log(`✅  Playwright auth session saved → ${SESSION_PATH}\n`);
}
