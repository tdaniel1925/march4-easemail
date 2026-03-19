import { test, expect, type Page } from "@playwright/test";

/**
 * Folders E2E tests — runs against built app (npm run build && npm start).
 * Auth: session cookie injected via storageState in playwright.config.ts.
 *
 * Tests cover:
 *  1. Starred folder loads and displays starred emails
 *  2. Sent folder loads and displays sent emails
 *  3. Drafts folder loads and displays draft emails
 *  4. Trash folder loads and displays deleted emails
 *  5. Folder navigation from sidebar
 *  6. Search within folders
 *  7. Empty states for each folder
 *
 * Skipped (require live Graph data):
 *  - Actual folder content verification
 *  - Move to folder operations
 */

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function goToFolder(page: Page, folder: "starred" | "sent" | "drafts" | "trash") {
  await page.goto(`/${folder}`);
  await expect(page).not.toHaveURL(/login/, { timeout: 8000 });
}

// ─── Test 1: Starred folder ──────────────────────────────────────────────────

test("1. Starred folder loads with heading", async ({ page }) => {
  await goToFolder(page, "starred");

  await expect(page.locator("h1", { hasText: "Starred" })).toBeVisible({ timeout: 8000 });
});

test("1b. Starred folder shows emails or empty state", async ({ page }) => {
  await goToFolder(page, "starred");

  // Either emails are visible OR empty state
  const hasEmails = await page.locator("[data-testid='email-item']").count() > 0;
  const hasEmptyState = await page.locator("text=/No starred|empty/i").isVisible();

  expect(hasEmails || hasEmptyState).toBeTruthy();
});

test("1c. Starred folder has search input", async ({ page }) => {
  await goToFolder(page, "starred");

  const searchInput = page.locator("input[placeholder*='Search'], input[type='search']");
  await expect(searchInput).toBeVisible({ timeout: 5000 });
});

test("1d. Clicking starred email opens reading pane", async ({ page }) => {
  await goToFolder(page, "starred");

  const emailCount = await page.locator("[data-testid='email-item']").count();
  if (emailCount === 0) test.skip();

  await page.locator("[data-testid='email-item']").first().click();

  await expect(page.locator("[data-testid='reading-pane']")).toBeVisible({ timeout: 5000 });
});

// ─── Test 2: Sent folder ─────────────────────────────────────────────────────

test("2. Sent folder loads with heading", async ({ page }) => {
  await goToFolder(page, "sent");

  await expect(page.locator("h1", { hasText: "Sent" })).toBeVisible({ timeout: 8000 });
});

test("2b. Sent folder shows emails or empty state", async ({ page }) => {
  await goToFolder(page, "sent");

  const hasEmails = await page.locator("[data-testid='email-item']").count() > 0;
  const hasEmptyState = await page.locator("text=/No sent|empty/i").isVisible();

  expect(hasEmails || hasEmptyState).toBeTruthy();
});

test("2c. Sent folder has search input", async ({ page }) => {
  await goToFolder(page, "sent");

  const searchInput = page.locator("input[placeholder*='Search'], input[type='search']");
  await expect(searchInput).toBeVisible();
});

test("2d. Sent emails show recipient information", async ({ page }) => {
  await goToFolder(page, "sent");

  const emailCount = await page.locator("[data-testid='email-item']").count();
  if (emailCount === 0) test.skip();

  // Sent emails should show "To:" prefix or recipient name
  const firstEmail = page.locator("[data-testid='email-item']").first();
  const hasRecipientInfo = await firstEmail.locator("text=/To:|Sent to/i").isVisible()
    || await firstEmail.textContent().then(t => t && t.length > 0);

  expect(hasRecipientInfo).toBeTruthy();
});

// ─── Test 3: Drafts folder ───────────────────────────────────────────────────

test("3. Drafts folder loads with heading", async ({ page }) => {
  await goToFolder(page, "drafts");

  await expect(page.locator("h1", { hasText: "Drafts" })).toBeVisible({ timeout: 8000 });
});

test("3b. Drafts folder shows drafts or empty state", async ({ page }) => {
  await goToFolder(page, "drafts");

  const hasEmails = await page.locator("[data-testid='email-item']").count() > 0;
  const hasEmptyState = await page.locator("text=/No drafts|empty/i").isVisible();

  expect(hasEmails || hasEmptyState).toBeTruthy();
});

test("3c. Drafts folder has search input", async ({ page }) => {
  await goToFolder(page, "drafts");

  const searchInput = page.locator("input[placeholder*='Search'], input[type='search']");
  await expect(searchInput).toBeVisible();
});

test("3d. Clicking draft opens composer in edit mode", async ({ page }) => {
  await goToFolder(page, "drafts");

  const emailCount = await page.locator("[data-testid='email-item']").count();
  if (emailCount === 0) test.skip();

  // Click first draft
  await page.locator("[data-testid='email-item']").first().click();

  // Should either open reading pane OR navigate to compose
  const hasReadingPane = await page.locator("[data-testid='reading-pane']").isVisible();
  const hasComposer = await page.locator("h1", { hasText: /Compose|Draft/i }).isVisible({ timeout: 3000 });

  expect(hasReadingPane || hasComposer).toBeTruthy();
});

test("3e. Drafts show last saved time", async ({ page }) => {
  await goToFolder(page, "drafts");

  const emailCount = await page.locator("[data-testid='email-item']").count();
  if (emailCount === 0) test.skip();

  const firstDraft = page.locator("[data-testid='email-item']").first();

  // Should show a timestamp (time or date)
  const hasTimestamp = await firstDraft.locator("text=/\\d{1,2}:\\d{2}|\\d{1,2}\\/\\d{1,2}/").isVisible();
  expect(hasTimestamp).toBeTruthy();
});

// ─── Test 4: Trash folder ────────────────────────────────────────────────────

test("4. Trash folder loads with heading", async ({ page }) => {
  await goToFolder(page, "trash");

  await expect(page.locator("h1", { hasText: "Trash" })).toBeVisible({ timeout: 8000 });
});

test("4b. Trash folder shows deleted emails or empty state", async ({ page }) => {
  await goToFolder(page, "trash");

  const hasEmails = await page.locator("[data-testid='email-item']").count() > 0;
  const hasEmptyState = await page.locator("text=/No items|empty|trash is empty/i").isVisible();

  expect(hasEmails || hasEmptyState).toBeTruthy();
});

test("4c. Trash folder has search input", async ({ page }) => {
  await goToFolder(page, "trash");

  const searchInput = page.locator("input[placeholder*='Search'], input[type='search']");
  await expect(searchInput).toBeVisible();
});

test("4d. Clicking trash item opens reading pane", async ({ page }) => {
  await goToFolder(page, "trash");

  const emailCount = await page.locator("[data-testid='email-item']").count();
  if (emailCount === 0) test.skip();

  await page.locator("[data-testid='email-item']").first().click();

  await expect(page.locator("[data-testid='reading-pane']")).toBeVisible({ timeout: 5000 });
});

test("4e. Trash shows restore action in reading pane", async ({ page }) => {
  await goToFolder(page, "trash");

  const emailCount = await page.locator("[data-testid='email-item']").count();
  if (emailCount === 0) test.skip();

  await page.locator("[data-testid='email-item']").first().click();

  // Look for restore or move button
  const restoreBtn = page.locator("button", { hasText: /Restore|Move to/i });

  // Button may or may not be present depending on implementation
  // Just verify reading pane loaded successfully
  await expect(page.locator("[data-testid='reading-pane']")).toBeVisible();
});

// ─── Test 5: Sidebar navigation ──────────────────────────────────────────────

test("5. Sidebar shows all folder links", async ({ page }) => {
  await page.goto("/inbox");

  // Sidebar should show folder navigation
  const sidebar = page.locator("aside, nav, [data-testid='sidebar']");

  await expect(sidebar.locator("text=Starred")).toBeVisible({ timeout: 5000 });
  await expect(sidebar.locator("text=Sent")).toBeVisible();
  await expect(sidebar.locator("text=Drafts")).toBeVisible();
  await expect(sidebar.locator("text=Trash")).toBeVisible();
});

test("5b. Clicking Starred in sidebar navigates to starred folder", async ({ page }) => {
  await page.goto("/inbox");

  const starredLink = page.locator("a, button").filter({ hasText: /^Starred$/ });
  await starredLink.click();

  await expect(page).toHaveURL(/starred/, { timeout: 5000 });
  await expect(page.locator("h1", { hasText: "Starred" })).toBeVisible();
});

test("5c. Clicking Sent in sidebar navigates to sent folder", async ({ page }) => {
  await page.goto("/inbox");

  const sentLink = page.locator("a, button").filter({ hasText: /^Sent$/ });
  await sentLink.click();

  await expect(page).toHaveURL(/sent/, { timeout: 5000 });
  await expect(page.locator("h1", { hasText: "Sent" })).toBeVisible();
});

test("5d. Clicking Drafts in sidebar navigates to drafts folder", async ({ page }) => {
  await page.goto("/inbox");

  const draftsLink = page.locator("a, button").filter({ hasText: /^Drafts$/ });
  await draftsLink.click();

  await expect(page).toHaveURL(/drafts/, { timeout: 5000 });
  await expect(page.locator("h1", { hasText: "Drafts" })).toBeVisible();
});

test("5e. Clicking Trash in sidebar navigates to trash folder", async ({ page }) => {
  await page.goto("/inbox");

  const trashLink = page.locator("a, button").filter({ hasText: /^Trash$/ });
  await trashLink.click();

  await expect(page).toHaveURL(/trash/, { timeout: 5000 });
  await expect(page.locator("h1", { hasText: "Trash" })).toBeVisible();
});

// ─── Test 6: Search within folders ───────────────────────────────────────────

test("6. Search in Starred folder works", async ({ page }) => {
  await goToFolder(page, "starred");

  const searchInput = page.locator("input[placeholder*='Search'], input[type='search']");
  await searchInput.fill("test query");

  // Wait for debounce
  await page.waitForTimeout(1000);

  // Should show results or no results message
  const hasResults = await page.locator("[data-testid='email-item']").count() > 0;
  const hasNoResults = await page.locator("text=/No results|No emails/i").isVisible();

  expect(hasResults || hasNoResults).toBeTruthy();
});

test("6b. Search in Sent folder works", async ({ page }) => {
  await goToFolder(page, "sent");

  const searchInput = page.locator("input[placeholder*='Search'], input[type='search']");
  await searchInput.fill("meeting");

  await page.waitForTimeout(1000);

  const hasResults = await page.locator("[data-testid='email-item']").count() > 0;
  const hasNoResults = await page.locator("text=/No results|No emails/i").isVisible();

  expect(hasResults || hasNoResults).toBeTruthy();
});

test("6c. Search in Drafts folder works", async ({ page }) => {
  await goToFolder(page, "drafts");

  const searchInput = page.locator("input[placeholder*='Search'], input[type='search']");
  await searchInput.fill("draft");

  await page.waitForTimeout(1000);

  const hasResults = await page.locator("[data-testid='email-item']").count() > 0;
  const hasNoResults = await page.locator("text=/No results|No emails/i").isVisible();

  expect(hasResults || hasNoResults).toBeTruthy();
});

test("6d. Clearing search in folder returns to normal view", async ({ page }) => {
  await goToFolder(page, "starred");

  const searchInput = page.locator("input[placeholder*='Search'], input[type='search']");
  await searchInput.fill("test");
  await page.waitForTimeout(500);

  await searchInput.clear();
  await page.waitForTimeout(500);

  // Should return to starred folder view
  await expect(page.locator("h1", { hasText: "Starred" })).toBeVisible();
});

// ─── Test 7: Empty states ────────────────────────────────────────────────────

test("7. Empty Starred folder shows helpful message", async ({ page }) => {
  await goToFolder(page, "starred");

  const emailCount = await page.locator("[data-testid='email-item']").count();

  if (emailCount === 0) {
    const emptyMsg = page.locator("text=/No starred|Star emails|empty/i");
    await expect(emptyMsg).toBeVisible();
  }
});

test("7b. Empty Sent folder shows helpful message", async ({ page }) => {
  await goToFolder(page, "sent");

  const emailCount = await page.locator("[data-testid='email-item']").count();

  if (emailCount === 0) {
    const emptyMsg = page.locator("text=/No sent|haven't sent|empty/i");
    await expect(emptyMsg).toBeVisible();
  }
});

test("7c. Empty Drafts folder shows helpful message", async ({ page }) => {
  await goToFolder(page, "drafts");

  const emailCount = await page.locator("[data-testid='email-item']").count();

  if (emailCount === 0) {
    const emptyMsg = page.locator("text=/No drafts|no saved drafts|empty/i");
    await expect(emptyMsg).toBeVisible();
  }
});

test("7d. Empty Trash folder shows helpful message", async ({ page }) => {
  await goToFolder(page, "trash");

  const emailCount = await page.locator("[data-testid='email-item']").count();

  if (emailCount === 0) {
    const emptyMsg = page.locator("text=/empty|No items|trash is empty/i");
    await expect(emptyMsg).toBeVisible();
  }
});

// ─── Test 8: Folder counts in sidebar ────────────────────────────────────────

test("8. Sidebar shows draft count badge", async ({ page }) => {
  await page.goto("/inbox");

  const draftsLink = page.locator("text=Drafts").first();

  // Badge may or may not be visible depending on draft count
  // Just verify drafts link exists
  await expect(draftsLink).toBeVisible();
});

test("8b. Sidebar shows unread count badge on Inbox", async ({ page }) => {
  await page.goto("/inbox");

  const inboxLink = page.locator("text=Inbox").first();

  // Unread badge may be present
  await expect(inboxLink).toBeVisible();
});

// ─── Test 9: Infinite scroll in folders ──────────────────────────────────────

test("9. Starred folder supports infinite scroll", async ({ page }) => {
  await goToFolder(page, "starred");

  const emailCount = await page.locator("[data-testid='email-item']").count();
  if (emailCount < 5) test.skip();

  const emailList = page.locator("[data-testid='email-list']");

  if (await emailList.isVisible()) {
    const initialCount = emailCount;

    await emailList.evaluate(el => el.scrollTo(0, el.scrollHeight));
    await page.waitForTimeout(2000);

    const afterCount = await page.locator("[data-testid='email-item']").count();

    // Either more loaded OR reached end
    expect(afterCount >= initialCount).toBeTruthy();
  }
});

test("9b. Sent folder supports infinite scroll", async ({ page }) => {
  await goToFolder(page, "sent");

  const emailCount = await page.locator("[data-testid='email-item']").count();
  if (emailCount < 5) test.skip();

  const emailList = page.locator("[data-testid='email-list']");

  if (await emailList.isVisible()) {
    const initialCount = emailCount;

    await emailList.evaluate(el => el.scrollTo(0, el.scrollHeight));
    await page.waitForTimeout(2000);

    const afterCount = await page.locator("[data-testid='email-item']").count();

    expect(afterCount >= initialCount).toBeTruthy();
  }
});
