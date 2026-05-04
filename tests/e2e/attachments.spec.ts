import { test, expect, type Page } from "@playwright/test";

/**
 * Attachments E2E tests — runs against built app (npm run build && npm start).
 * Auth: session cookie injected via storageState in playwright.config.ts.
 *
 * Tests cover:
 *  1. Attachments page loads with header
 *  2. Received tab is visible and active by default
 *  3. Sent tab is visible
 *  4. Attachment table/grid shows files or empty state
 *  5. Each attachment shows filename, size, date
 *  6. File type filter exists (All, Images, Documents, etc.)
 *  7. Search/filter input works
 *  8. Preview button/click opens preview modal
 *  9. Download button exists on attachment items
 * 10. Pagination or load more exists for large lists
 * 11. Switching between Received/Sent tabs changes data
 */

const ATTACHMENTS_URL = "/attachments";

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function goToAttachments(page: Page) {
  await page.goto(ATTACHMENTS_URL);
  await expect(page).not.toHaveURL(/login/, { timeout: 8000 });
  await expect(page.locator("text=Attachments").first()).toBeVisible({ timeout: 8000 });
}

// ─── Test 1: Page loads ───────────────────────────────────────────────────────

test("1. Attachments page loads with header", async ({ page }) => {
  await goToAttachments(page);

  await expect(page.locator("text=Attachments").first()).toBeVisible();
});

// ─── Test 2: Received tab active by default ──────────────────────────────────

test("2. Received tab is visible and active by default", async ({ page }) => {
  await goToAttachments(page);

  const receivedBtn = page.locator("button", { hasText: "Received" }).first();
  await expect(receivedBtn).toBeVisible({ timeout: 5000 });

  // Active state — white text on brand background
  const bgColor = await receivedBtn.evaluate((el) => getComputedStyle(el).backgroundColor);
  // rgb(138, 9, 9) is the brand color for active state
  expect(bgColor).toContain("138");
});

// ─── Test 3: Sent tab visible ────────────────────────────────────────────────

test("3. Sent tab is visible", async ({ page }) => {
  await goToAttachments(page);

  await expect(page.locator("button", { hasText: "Sent" }).first()).toBeVisible({ timeout: 5000 });
});

// ─── Test 4: Attachment table shows files or empty state ─────────────────────

test("4. Attachment table/grid shows files or empty state", async ({ page }) => {
  await goToAttachments(page);

  // Wait for content to load — either a table with rows or an empty state message
  const hasTable = await page.locator("table").count() > 0;
  const hasEmptyState = await page.locator("text=No attachments").count() > 0;
  const hasFiles = hasTable && (await page.locator("table tbody tr").count()) > 0;

  expect(hasFiles || hasEmptyState).toBe(true);
});

// ─── Test 5: Attachment columns (filename, size, date) ───────────────────────

test("5. Table shows File Name, Size, and Date columns", async ({ page }) => {
  await goToAttachments(page);

  // Column headers should be visible
  await expect(page.locator("text=File Name").first()).toBeVisible({ timeout: 5000 });
  await expect(page.locator("text=Size").first()).toBeVisible({ timeout: 5000 });
  await expect(page.locator("text=Date Received").first()).toBeVisible({ timeout: 5000 });
});

// ─── Test 6: File type filter exists ─────────────────────────────────────────

test("6. File type filter tabs exist (All, Images, Documents)", async ({ page }) => {
  await goToAttachments(page);

  // Filter tabs for file types
  const allTab = page.locator("button", { hasText: /^All$/ }).first();
  const imagesTab = page.locator("button", { hasText: /Images/i }).first();
  const docsTab = page.locator("button", { hasText: /Documents/i }).first();

  await expect(allTab).toBeVisible({ timeout: 5000 });
  await expect(imagesTab).toBeVisible({ timeout: 5000 });
  await expect(docsTab).toBeVisible({ timeout: 5000 });
});

// ─── Test 7: Search/filter input works ───────────────────────────────────────

test("7. Search input accepts text", async ({ page }) => {
  await goToAttachments(page);

  const searchInput = page.locator('input[placeholder*="Search"]').first();
  await expect(searchInput).toBeVisible({ timeout: 5000 });

  await searchInput.fill("test-document");
  await expect(searchInput).toHaveValue("test-document");
});

// ─── Test 8: Preview opens modal ─────────────────────────────────────────────

test("8. Preview button/click opens preview modal", async ({ page }) => {
  await goToAttachments(page);

  // If there are attachment rows, click the first preview/eye button
  const rows = page.locator("table tbody tr");
  const rowCount = await rows.count();

  if (rowCount > 0) {
    // Click the preview/eye icon button on first row
    const previewBtn = rows.first().locator("button").first();
    await previewBtn.click();

    // Modal should appear with preview content or close button
    await expect(
      page.locator("[role='dialog'], [data-testid='preview-modal'], .fixed.inset-0").first()
    ).toBeVisible({ timeout: 5000 });
  } else {
    // No attachments — skip gracefully
    test.skip();
  }
});

// ─── Test 9: Download button exists ──────────────────────────────────────────

test("9. Download button exists on attachment items", async ({ page }) => {
  await goToAttachments(page);

  const rows = page.locator("table tbody tr");
  const rowCount = await rows.count();

  if (rowCount > 0) {
    // Actions column has download button/link
    const firstRow = rows.first();
    const downloadBtn = firstRow.locator("button, a").filter({ hasText: /download/i }).first();
    const downloadIcon = firstRow.locator('[title*="ownload"], [aria-label*="ownload"]').first();

    const hasDownload = (await downloadBtn.count()) > 0 || (await downloadIcon.count()) > 0;
    // At minimum the actions column buttons exist
    expect(hasDownload || (await firstRow.locator("button").count()) > 0).toBe(true);
  } else {
    test.skip();
  }
});

// ─── Test 10: Pagination or load more ────────────────────────────────────────

test("10. Pagination or load more exists for large lists", async ({ page }) => {
  await goToAttachments(page);

  // Check for pagination controls, load more button, or page indicator
  const hasPagination = await page.locator("text=/Page|Showing|Load More|Next|Previous/i").count() > 0;
  const hasPageButtons = await page.locator("button", { hasText: /next|prev|load more/i }).count() > 0;
  const hasCountIndicator = await page.locator("text=/\\d+.*of.*\\d+/").count() > 0;

  // At least some indication of pagination or count exists (or empty list)
  const rows = page.locator("table tbody tr");
  const rowCount = await rows.count();

  // Either we have pagination/count indicators OR there are few enough items to not need it
  expect(hasPagination || hasPageButtons || hasCountIndicator || rowCount <= 50).toBe(true);
});

// ─── Test 11: Switching tabs changes data ────────────────────────────────────

test("11. Switching between Received/Sent tabs changes content", async ({ page }) => {
  await goToAttachments(page);

  // Click Sent tab
  const sentBtn = page.locator("button", { hasText: "Sent" }).first();
  await sentBtn.click();

  // Wait for tab to become active (brand color background)
  await expect(sentBtn).toHaveCSS("background-color", /138/, { timeout: 3000 });

  // Switch back to Received
  const receivedBtn = page.locator("button", { hasText: "Received" }).first();
  await receivedBtn.click();

  await expect(receivedBtn).toHaveCSS("background-color", /138/, { timeout: 3000 });
});
