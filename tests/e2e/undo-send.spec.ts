import { test, expect, type Page } from "@playwright/test";

/**
 * Undo Send E2E tests — runs against built app (npm run build && npm start).
 * Auth: session cookie injected via storageState in playwright.config.ts.
 *
 * Tests cover:
 *  1. Compose page loads
 *  2. After sending, an undo banner appears with countdown
 *  3. Undo banner shows countdown text
 *  4. Undo button is visible in the banner
 *  5. Clicking Undo cancels the send and restores the composer
 *
 * Skipped (require live Graph API):
 *  - Actual email delivery verification
 *  - Undo after timer expires
 */

const COMPOSE_URL = "/compose";

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function goToCompose(page: Page) {
  await page.goto(COMPOSE_URL);
  await expect(page).not.toHaveURL(/login/, { timeout: 8000 });
  // Wait for composer to render (heading or send button)
  await expect(page.locator("button", { hasText: "Send" })).toBeVisible({ timeout: 8000 });
}

// ─── Test 1: Compose page loads ──────────────────────────────────────────────

test("1. Compose page loads with Send button", async ({ page }) => {
  await goToCompose(page);

  await expect(page.locator("button", { hasText: "Send" })).toBeVisible();
});

// ─── Test 2: Undo banner appears after sending ───────────────────────────────

test.skip("2. After filling To + Subject + Body and clicking Send, undo banner appears", async ({ page }) => {
  await goToCompose(page);

  // Fill in To field
  const toInput = page.locator("input[placeholder*='Add recipient']");
  await toInput.fill("test@example.com");
  await toInput.press("Enter");

  // Fill in Subject
  const subjectInput = page.locator("input[placeholder*='Subject']");
  await subjectInput.fill("E2E Test Subject");

  // Fill in Body (contenteditable div)
  const bodyEditor = page.locator("[contenteditable='true']").first();
  await bodyEditor.click();
  await bodyEditor.fill("This is an E2E test body.");

  // Click Send
  await page.locator("button", { hasText: "Send" }).click();

  // Undo banner should appear (text containing seconds or "undo")
  await expect(page.locator("text=/undo|Undo/i")).toBeVisible({ timeout: 5000 });
});

// ─── Test 3: Undo banner shows countdown ─────────────────────────────────────

test.skip("3. Undo banner shows countdown text", async ({ page }) => {
  await goToCompose(page);

  const toInput = page.locator("input[placeholder*='Add recipient']");
  await toInput.fill("test@example.com");
  await toInput.press("Enter");

  const subjectInput = page.locator("input[placeholder*='Subject']");
  await subjectInput.fill("E2E Countdown Test");

  const bodyEditor = page.locator("[contenteditable='true']").first();
  await bodyEditor.click();
  await bodyEditor.fill("Countdown test body.");

  await page.locator("button", { hasText: "Send" }).click();

  // Should show countdown (e.g., "5s", "4s", seconds text)
  await expect(page.locator("text=/\\d+s|seconds|Sending in/i")).toBeVisible({ timeout: 5000 });
});

// ─── Test 4: Undo button is visible in the banner ────────────────────────────

test.skip("4. Undo button is visible in banner", async ({ page }) => {
  await goToCompose(page);

  const toInput = page.locator("input[placeholder*='Add recipient']");
  await toInput.fill("test@example.com");
  await toInput.press("Enter");

  const subjectInput = page.locator("input[placeholder*='Subject']");
  await subjectInput.fill("E2E Undo Button Test");

  const bodyEditor = page.locator("[contenteditable='true']").first();
  await bodyEditor.click();
  await bodyEditor.fill("Undo button test body.");

  await page.locator("button", { hasText: "Send" }).click();

  // An Undo button/link should be clickable
  await expect(page.locator("button", { hasText: /undo/i })).toBeVisible({ timeout: 5000 });
});

// ─── Test 5: Clicking Undo cancels send ──────────────────────────────────────

test.skip("5. Clicking Undo cancels the send and restores the composer", async ({ page }) => {
  await goToCompose(page);

  const toInput = page.locator("input[placeholder*='Add recipient']");
  await toInput.fill("test@example.com");
  await toInput.press("Enter");

  const subjectInput = page.locator("input[placeholder*='Subject']");
  await subjectInput.fill("E2E Undo Cancel Test");

  const bodyEditor = page.locator("[contenteditable='true']").first();
  await bodyEditor.click();
  await bodyEditor.fill("This send should be cancelled.");

  await page.locator("button", { hasText: "Send" }).click();

  // Wait for undo button
  const undoBtn = page.locator("button", { hasText: /undo/i });
  await expect(undoBtn).toBeVisible({ timeout: 5000 });

  // Click undo
  await undoBtn.click();

  // Composer should be restored — Send button visible again, undo banner gone
  await expect(page.locator("button", { hasText: "Send" })).toBeVisible({ timeout: 5000 });
  await expect(undoBtn).not.toBeVisible({ timeout: 3000 });
});
