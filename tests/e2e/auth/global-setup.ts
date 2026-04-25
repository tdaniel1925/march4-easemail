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
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SESSION_PATH = path.join(__dirname, "session.json");
const ENV_PATH = path.join(__dirname, "../../../.env.local");

export default async function globalSetup(config: FullConfig) {
  // Load .env.local so env vars are available in this Node process
  if (fs.existsSync(ENV_PATH)) {
    dotenv.config({ path: ENV_PATH });
  }

  const testEmail    = process.env.TEST_USER_EMAIL ?? "info@tonnerow.com";
  const testPassword = process.env.TEST_USER_PASSWORD ?? "4Xkilla1@";
  const baseURL      = process.env.PLAYWRIGHT_BASE_URL
                       ?? (config.projects[0]?.use?.baseURL as string | undefined)
                       ?? "http://localhost:3000";

  console.log(`\n🔐  Logging in with Microsoft account: ${testEmail}`);
  console.log(`📍  Base URL: ${baseURL}\n`);

  // ── 1. Open browser and navigate to login page ────────────────────────────
  const browser = await chromium.launch({
    headless: false,  // Show browser for debugging
    slowMo: 100       // Slow down actions
  });
  const context = await browser.newContext();
  const page    = await context.newPage();

  // Enable detailed logging
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err));
  page.on('requestfailed', req => console.error('REQUEST FAILED:', req.url(), req.failure()?.errorText));

  console.log(`📍  Navigating to ${baseURL}/login`);
  try {
    const response = await page.goto(`${baseURL}/login`, {
      waitUntil: 'domcontentloaded',  // Changed from networkidle
      timeout: 60000  // Increased timeout
    });
    console.log(`✅  Login page loaded (status: ${response?.status()})`);
  } catch (error) {
    console.error(`❌  Failed to load login page:`, error);
    await page.screenshot({ path: 'login-page-timeout.png' });
    throw error;
  }

  // ── 2. Click "Sign in with Microsoft" button ───────────────────────────────
  console.log(`🔘  Looking for "Sign in with Microsoft" button`);
  await page.screenshot({ path: 'debug-login-page.png', fullPage: true });

  const loginButton = await page.locator('a[href="/api/auth/microsoft"]').first();
  if (await loginButton.count() > 0) {
    console.log(`✅  Found login button, clicking...`);
    await loginButton.click();
  } else {
    console.error(`❌  Login button not found`);
    await page.screenshot({ path: 'login-button-not-found.png', fullPage: true });
    throw new Error('Sign in with Microsoft button not found');
  }

  // ── 3. Fill in Microsoft credentials ───────────────────────────────────────
  try {
    // Wait for Microsoft login page (or intermediate redirect)
    console.log(`⏳  Waiting for Microsoft login page...`);
    await page.waitForURL(/login\.microsoftonline\.com|microsoftonline\.com/, { timeout: 60000 });
    console.log(`✅  Reached Microsoft login page: ${page.url()}`);
    await page.screenshot({ path: 'debug-ms-login.png', fullPage: true });

    // Enter email
    console.log(`📧  Entering email: ${testEmail}`);
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.fill('input[type="email"]', testEmail);
    await page.screenshot({ path: 'debug-email-entered.png', fullPage: true });

    console.log(`🔘  Clicking Next button`);
    await page.click('input[type="submit"], button[type="submit"]');

    // Wait for password page
    console.log(`⏳  Waiting for password page...`);
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'debug-password-page.png', fullPage: true });

    // Enter password
    console.log(`🔒  Entering password`);
    await page.waitForSelector('input[type="password"]', { timeout: 10000 });
    await page.fill('input[type="password"]', testPassword);
    await page.screenshot({ path: 'debug-password-entered.png', fullPage: true });

    console.log(`🔘  Clicking Sign In button`);
    await page.click('input[type="submit"], button[type="submit"]');

    // Handle "Stay signed in?" prompt (click Yes)
    console.log(`⏳  Checking for "Stay signed in?" prompt...`);
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'debug-after-signin.png', fullPage: true });

    try {
      const staySignedInBtn = await page.locator('input[type="submit"][value="Yes"], button:has-text("Yes")').first();
      if (await staySignedInBtn.count() > 0) {
        console.log(`✅  Found "Stay signed in?" - clicking Yes`);
        await staySignedInBtn.click({ timeout: 5000 });
      }
    } catch {
      console.log(`ℹ️  No "Stay signed in?" prompt (this is ok)`);
    }

    // ── 4. Wait for redirect back to app ───────────────────────────────────
    console.log(`⏳  Waiting for redirect to ${baseURL}/inbox...`);
    await page.waitForURL(`${baseURL}/inbox`, { timeout: 60000 });
    await page.screenshot({ path: 'debug-inbox-loaded.png', fullPage: true });

    console.log(`✅  Successfully logged in and redirected to /inbox\n`);

  } catch (error) {
    console.error(`❌  Microsoft login failed:`, error);
    console.error(`Current URL: ${page.url()}`);
    await page.screenshot({ path: 'login-failure.png', fullPage: true });
    const html = await page.content();
    fs.writeFileSync('login-failure.html', html);
    console.error(`Saved screenshots and HTML for debugging`);
    throw new Error(`global-setup: Microsoft login failed — ${error}`);
  }

  // ── 5. Save authenticated cookies ──────────────────────────────────────────
  console.log(`💾  Saving session to ${SESSION_PATH}...`);
  await context.storageState({ path: SESSION_PATH });

  console.log(`✅  Playwright auth session saved → ${SESSION_PATH}`);
  console.log(`🔍  Keeping browser open for 5 seconds for verification...`);
  await page.waitForTimeout(5000);

  await browser.close();
  console.log(`✅  Browser closed, setup complete\n`);
}
