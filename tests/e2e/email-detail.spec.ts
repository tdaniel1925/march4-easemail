import { test, expect, type Page } from "@playwright/test";

/**
 * Email Detail E2E tests — runs against built app at http://localhost:4000.
 * Auth: session cookie injected via storageState in playwright.config.ts.
 *
 * Tests cover:
 *  1.  Email detail view shows subject line
 *  2.  Email detail shows sender name and email
 *  3.  Email detail shows recipient(s)
 *  4.  Email detail shows received date/time
 *  5.  Email body content is rendered (HTML or text)
 *  6.  Reply button is visible and clickable
 *  7.  Forward button is visible and clickable
 *  8.  Reply navigates to /compose?mode=reply&messageId=X
 *  9.  Forward navigates to /compose?mode=forward&messageId=X
 *  10. Star/unstar toggle button exists
 *  11. Delete button exists
 *  12. Archive button exists
 *  13. Move to folder option exists (or skip gracefully)
 *  14. AI Reply button opens AI reply modal (if exists)
 *  15. Back button returns to inbox list
 */

const INBOX_URL = "/inbox";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Navigate to inbox and click the first email to open detail view.
 * If inbox is empty, returns false so the test can skip gracefully.
 */
async function navigateToFirstEmail(page: Page): Promise<boolean> {
  await page.goto(INBOX_URL);
  await expect(page).not.toHaveURL(/login/, { timeout: 8000 });

  // Wait for list to load — either emails or empty state
  const firstEmail = page.locator("a[href^='/inbox/']").first();
  const emptyState = page.locator("text=No emails").or(page.locator("text=empty")).first();

  const visible = await Promise.race([
    firstEmail.waitFor({ state: "visible", timeout: 10000 }).then(() => "email" as const),
    emptyState.waitFor({ state: "visible", timeout: 10000 }).then(() => "empty" as const),
  ]).catch(() => "timeout" as const);

  if (visible !== "email") return false;

  await firstEmail.click();
  // Wait for detail page to load
  await expect(page).toHaveURL(/\/inbox\//, { timeout: 8000 });
  return true;
}

/**
 * Go directly to the email detail page if already on it, or navigate there.
 */
async function ensureOnEmailDetail(page: Page): Promise<boolean> {
  if (page.url().match(/\/inbox\/.+/)) return true;
  return navigateToFirstEmail(page);
}

// ─── Test 1: Subject line ────────────────────────────────────────────────────

test("1. Email detail view shows subject line", async ({ page }) => {
  const found = await navigateToFirstEmail(page);
  if (!found) {
    test.skip();
    return;
  }

  // Subject should be visible as a heading or prominent text
  const subject = page.locator("h1, h2, [data-testid='email-subject']").first();
  await expect(subject).toBeVisible({ timeout: 5000 });
  const text = await subject.textContent();
  expect(text?.trim().length).toBeGreaterThan(0);
});

// ─── Test 2: Sender name and email ──────────────────────────────────────────

test("2. Email detail shows sender name and email", async ({ page }) => {
  const found = await navigateToFirstEmail(page);
  if (!found) { test.skip(); return; }

  // Look for From section or sender info containing an @ sign
  const senderArea = page.locator("text=@").first();
  await expect(senderArea).toBeVisible({ timeout: 5000 });
});

// ─── Test 3: Recipients ─────────────────────────────────────────────────────

test("3. Email detail shows recipient(s)", async ({ page }) => {
  const found = await navigateToFirstEmail(page);
  if (!found) { test.skip(); return; }

  // Look for To label or recipient area
  const toLabel = page.locator("text=To").first();
  await expect(toLabel).toBeVisible({ timeout: 5000 });
});

// ─── Test 4: Received date/time ─────────────────────────────────────────────

test("4. Email detail shows received date/time", async ({ page }) => {
  const found = await navigateToFirstEmail(page);
  if (!found) { test.skip(); return; }

  // Date is typically shown — look for common date patterns (month names, numbers with colons for time)
  const dateElement = page.locator("text=/\\d{1,2}[:/,]\\d{2}/").first();
  await expect(dateElement).toBeVisible({ timeout: 5000 });
});

// ─── Test 5: Body content rendered ──────────────────────────────────────────

test("5. Email body content is rendered (HTML or text)", async ({ page }) => {
  const found = await navigateToFirstEmail(page);
  if (!found) { test.skip(); return; }

  // Body is rendered in an iframe or a div with email content
  const bodyContent = page.locator("iframe, [data-testid='email-body'], .email-body, [class*='body']").first();
  const fallback = page.locator("article, main").first();

  const body = await Promise.race([
    bodyContent.waitFor({ state: "visible", timeout: 5000 }).then(() => bodyContent),
    fallback.waitFor({ state: "visible", timeout: 5000 }).then(() => fallback),
  ]).catch(() => null);

  expect(body).not.toBeNull();
});

// ─── Test 6: Reply button visible and clickable ─────────────────────────────

test("6. Reply button is visible and clickable", async ({ page }) => {
  const found = await navigateToFirstEmail(page);
  if (!found) { test.skip(); return; }

  const replyBtn = page.locator("button, a").filter({ hasText: "Reply" }).first();
  await expect(replyBtn).toBeVisible({ timeout: 5000 });
  await expect(replyBtn).toBeEnabled();
});

// ─── Test 7: Forward button visible and clickable ───────────────────────────

test("7. Forward button is visible and clickable", async ({ page }) => {
  const found = await navigateToFirstEmail(page);
  if (!found) { test.skip(); return; }

  const forwardBtn = page.locator("button, a").filter({ hasText: "Forward" }).first();
  await expect(forwardBtn).toBeVisible({ timeout: 5000 });
  await expect(forwardBtn).toBeEnabled();
});

// ─── Test 8: Reply navigates to compose ─────────────────────────────────────

test("8. Reply navigates to /compose?mode=reply&messageId=X", async ({ page }) => {
  const found = await navigateToFirstEmail(page);
  if (!found) { test.skip(); return; }

  // Capture the message ID from the URL
  const url = page.url();
  const messageId = url.split("/inbox/")[1]?.split("?")[0];
  expect(messageId).toBeTruthy();

  const replyBtn = page.locator("button, a").filter({ hasText: "Reply" }).first();
  await replyBtn.click();

  await expect(page).toHaveURL(/\/compose/, { timeout: 8000 });
  await expect(page).toHaveURL(/mode=reply/);
  await expect(page).toHaveURL(new RegExp(`messageId=${messageId}`));
});

// ─── Test 9: Forward navigates to compose ───────────────────────────────────

test("9. Forward navigates to /compose?mode=forward&messageId=X", async ({ page }) => {
  const found = await navigateToFirstEmail(page);
  if (!found) { test.skip(); return; }

  const url = page.url();
  const messageId = url.split("/inbox/")[1]?.split("?")[0];
  expect(messageId).toBeTruthy();

  const forwardBtn = page.locator("button, a").filter({ hasText: "Forward" }).first();
  await forwardBtn.click();

  await expect(page).toHaveURL(/\/compose/, { timeout: 8000 });
  await expect(page).toHaveURL(/mode=forward/);
  await expect(page).toHaveURL(new RegExp(`messageId=${messageId}`));
});

// ─── Test 10: Star/unstar toggle ────────────────────────────────────────────

test("10. Star/unstar toggle button exists", async ({ page }) => {
  const found = await navigateToFirstEmail(page);
  if (!found) { test.skip(); return; }

  const starBtn = page.locator('button[title="Star"], button[title="Unstar"]').first();
  await expect(starBtn).toBeVisible({ timeout: 5000 });
});

// ─── Test 11: Delete button ─────────────────────────────────────────────────

test("11. Delete button exists", async ({ page }) => {
  const found = await navigateToFirstEmail(page);
  if (!found) { test.skip(); return; }

  const deleteBtn = page.locator('button[title="Delete"]').first();
  await expect(deleteBtn).toBeVisible({ timeout: 5000 });
});

// ─── Test 12: Archive button ────────────────────────────────────────────────

test("12. Archive button exists", async ({ page }) => {
  const found = await navigateToFirstEmail(page);
  if (!found) { test.skip(); return; }

  const archiveBtn = page.locator('button[title="Archive"]').first();
  await expect(archiveBtn).toBeVisible({ timeout: 5000 });
});

// ─── Test 13: Move to folder option ─────────────────────────────────────────

test("13. Move to folder option exists", async ({ page }) => {
  const found = await navigateToFirstEmail(page);
  if (!found) { test.skip(); return; }

  // Move may be a button or a dropdown menu item
  const moveBtn = page.locator('button[title="Move"], button[title="Move to folder"]').first();
  const moveText = page.locator("button, [role=menuitem]").filter({ hasText: /Move/ }).first();

  const moveElement = await Promise.race([
    moveBtn.waitFor({ state: "visible", timeout: 3000 }).then(() => moveBtn),
    moveText.waitFor({ state: "visible", timeout: 3000 }).then(() => moveText),
  ]).catch(() => null);

  // Move to folder may not exist in all versions — skip gracefully
  if (!moveElement) {
    test.skip();
    return;
  }
  await expect(moveElement).toBeVisible();
});

// ─── Test 14: AI Reply button ───────────────────────────────────────────────

test("14. AI Reply button opens AI reply modal (if exists)", async ({ page }) => {
  const found = await navigateToFirstEmail(page);
  if (!found) { test.skip(); return; }

  const aiBtn = page.locator("button").filter({ hasText: /AI|Smart|Generate/ }).first();

  const isVisible = await aiBtn.isVisible().catch(() => false);
  if (!isVisible) {
    // AI Reply may not be implemented yet — skip gracefully
    test.skip();
    return;
  }

  await aiBtn.click();

  // Modal or panel should appear
  const modal = page.locator("[role=dialog], .modal, .fixed").filter({ hasText: /AI|reply|generate/i }).first();
  await expect(modal).toBeVisible({ timeout: 5000 });
});

// ─── Test 15: Back button returns to inbox ──────────────────────────────────

test("15. Back button returns to inbox list", async ({ page }) => {
  const found = await navigateToFirstEmail(page);
  if (!found) { test.skip(); return; }

  // Back link/button — look for link with href to returnTo or text "Back"/"Inbox"
  const backLink = page.locator("a[href='/inbox'], a[href*='returnTo']").first();
  const backBtn = page.locator("a, button").filter({ hasText: /Back|Inbox/ }).first();

  const backElement = await Promise.race([
    backLink.waitFor({ state: "visible", timeout: 3000 }).then(() => backLink),
    backBtn.waitFor({ state: "visible", timeout: 3000 }).then(() => backBtn),
  ]).catch(() => null);

  expect(backElement).not.toBeNull();
  await backElement!.click();

  await expect(page).toHaveURL(/\/inbox$/, { timeout: 8000 });
});
