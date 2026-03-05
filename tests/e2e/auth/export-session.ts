/**
 * Run with: npx ts-node tests/e2e/auth/export-session.ts
 *
 * Opens a browser, lets you log in, then saves the session cookies
 * to tests/e2e/auth/session.json for Playwright to reuse.
 */
import { chromium } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
const OUT = path.join(__dirname, "session.json");

async function main() {
  console.log("Opening browser — log in with your Microsoft account.");
  console.log("The browser will close automatically once you reach /inbox.\n");

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(BASE_URL);

  // Wait until the user is redirected to /inbox (login complete)
  await page.waitForURL("**/inbox", { timeout: 3 * 60 * 1000 });
  console.log("✓ Logged in. Saving session…");

  const storageState = await context.storageState();
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(storageState, null, 2));

  console.log(`✓ Session saved to: ${OUT}`);
  console.log("You can now run: npm run test:e2e\n");

  await browser.close();
}

main().catch((e) => { console.error(e); process.exit(1); });
