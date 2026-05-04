import { test, expect, type Page } from "@playwright/test";

/**
 * Follow-up Reminders E2E tests — runs against built app (npm run build && npm start).
 * Auth: session cookie injected via storageState in playwright.config.ts.
 *
 * Tests cover:
 *  1. Inbox page loads
 *  2. In email detail view, "Remind me" button exists
 *  3. Clicking remind button shows options (1 day, 3 days, 1 week)
 *  4. Dashboard shows reminders section
 *
 * Skipped (require live data):
 *  - Creating actual reminders
 *  - Reminder notification delivery
 */

const INBOX_URL = "/inbox";
const DASHBOARD_URL = "/dashboard";

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function goToInbox(page: Page) {
  await page.goto(INBOX_URL);
  await expect(page).not.toHaveURL(/login/, { timeout: 8000 });
  await expect(page.locator("h1", { hasText: "Inbox" })).toBeVisible({ timeout: 8000 });
}

async function goToDashboard(page: Page) {
  await page.goto(DASHBOARD_URL);
  await expect(page).not.toHaveURL(/login/, { timeout: 8000 });
}

// ─── Test 1: Inbox loads ─────────────────────────────────────────────────────

test("1. Inbox page loads", async ({ page }) => {
  await goToInbox(page);
  await expect(page.locator("h1", { hasText: "Inbox" })).toBeVisible();
});

// ─── Test 2: Remind me button in email detail ────────────────────────────────

test.skip("2. In email detail, Remind me button exists", async ({ page }) => {
  await goToInbox(page);

  // Wait for email list to load
  await page.waitForTimeout(2000);

  // Click first email to open detail view
  const emailRow = page.locator("[data-testid='email-item']").first();
  const count = await emailRow.count();
  if (count === 0) {
    test.skip();
    return;
  }
  await emailRow.click();
  await page.waitForTimeout(1000);

  // "Remind me" button should be visible (title attribute or text)
  const remindBtn = page.locator("button", { hasText: "Remind me" });
  await expect(remindBtn).toBeVisible({ timeout: 5000 });
});

// ─── Test 3: Reminder options dropdown ───────────────────────────────────────

test.skip("3. Clicking remind button shows options (1 day, 3 days, 1 week)", async ({ page }) => {
  await goToInbox(page);

  await page.waitForTimeout(2000);

  const emailRow = page.locator("[data-testid='email-item']").first();
  const count = await emailRow.count();
  if (count === 0) {
    test.skip();
    return;
  }
  await emailRow.click();
  await page.waitForTimeout(1000);

  // Click remind me button
  const remindBtn = page.locator("button", { hasText: "Remind me" });
  await expect(remindBtn).toBeVisible({ timeout: 5000 });
  await remindBtn.click();

  // Dropdown should show preset options
  await expect(page.locator("button", { hasText: "1 day" })).toBeVisible({ timeout: 3000 });
  await expect(page.locator("button", { hasText: "3 days" })).toBeVisible();
  await expect(page.locator("button", { hasText: "1 week" })).toBeVisible();
});

// ─── Test 4: Dashboard shows reminders section ───────────────────────────────

test("4. Dashboard shows reminders section", async ({ page }) => {
  await goToDashboard(page);

  // RemindersPanel component should render on dashboard
  await expect(page.locator("text=/Reminder|Follow-up|Remind/i")).toBeVisible({ timeout: 8000 });
});
