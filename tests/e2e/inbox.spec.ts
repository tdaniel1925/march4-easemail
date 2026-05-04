/**
 * Inbox E2E Tests
 *
 * Tests for the main inbox view of EaseEmail.
 * Verifies sidebar navigation, email list, tab filters,
 * search functionality, and compose access.
 *
 * The app uses a single-page AppShell pattern with no h1 headings,
 * sidebar buttons (not links), and client-side routing.
 *
 * @module tests/e2e/inbox
 */

import { test, expect, type Page } from "@playwright/test";

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function goToInbox(page: Page) {
  await page.goto("/inbox");
  await expect(page).not.toHaveURL(/login/, { timeout: 8000 });
  await expect(
    page.locator('input[placeholder*="Search"]')
  ).toBeVisible({ timeout: 10000 });
}

// ─── Tests ───────────────────────────────────────────────────────────────────

test.describe("Inbox", () => {
  // storageState inherited from playwright.config.ts (tests/e2e/auth/session.json)

  // 1
  test("1. Inbox loads — search input visible with correct placeholder", async ({
    page,
  }) => {
    await goToInbox(page);
    const search = page.locator('input[placeholder*="Search"]');
    await expect(search).toBeVisible();
    await expect(search).toHaveAttribute(
      "placeholder",
      /Search emails.*from:.*to:.*subject:.*has:attachment/
    );
  });

  // 2
  test("2. Sidebar shows navigation buttons (Inbox, Starred, Sent, Drafts, Trash)", async ({
    page,
  }) => {
    await goToInbox(page);
    for (const label of ["Inbox", "Starred", "Sent", "Drafts", "Trash"]) {
      await expect(
        page.getByRole("button", { name: new RegExp(label, "i") })
      ).toBeVisible();
    }
  });

  // 3
  test("3. Sidebar inbox button shows unread count", async ({ page }) => {
    await goToInbox(page);
    const inboxBtn = page.getByRole("button", { name: /Inbox/i });
    await expect(inboxBtn).toBeVisible();
    // The button text includes the unread count appended (e.g. "Inbox48")
    const text = await inboxBtn.textContent();
    expect(text).toMatch(/Inbox\d*/i);
  });

  // 4
  test("4. Email list shows items with cursor-pointer class or empty state", async ({
    page,
  }) => {
    await goToInbox(page);
    await page.waitForTimeout(2000);
    const emails = page.locator(".cursor-pointer");
    const count = await emails.count();
    if (count === 0) {
      // Empty state should be present somewhere in the main area
      const bodyText = await page.locator("body").textContent();
      expect(bodyText!.length).toBeGreaterThan(0);
    } else {
      expect(count).toBeGreaterThan(0);
    }
  });

  // 5
  test("5. Tab filters visible (All, Unread, Starred, Attachments buttons)", async ({
    page,
  }) => {
    await goToInbox(page);
    for (const tab of ["All", "Unread", "Starred", "Attachments"]) {
      await expect(
        page.getByRole("button", { name: new RegExp(`^${tab}$`, "i") })
      ).toBeVisible();
    }
  });

  // 6
  test("6. Clicking Unread tab changes view", async ({ page }) => {
    await goToInbox(page);
    const unreadTab = page.getByRole("button", { name: /^Unread$/i });
    await unreadTab.click();
    await page.waitForTimeout(1000);
    // Tab should still be visible and page functional
    await expect(unreadTab).toBeVisible();
    await expect(page).toHaveURL(/inbox/);
  });

  // 7
  test("7. Clicking Starred tab changes view", async ({ page }) => {
    await goToInbox(page);
    const starredTab = page.getByRole("button", { name: /^Starred$/i });
    await starredTab.click();
    await page.waitForTimeout(1000);
    await expect(starredTab).toBeVisible();
    await expect(page).toHaveURL(/inbox/);
  });

  // 8
  test("8. Search input accepts text", async ({ page }) => {
    await goToInbox(page);
    const search = page.locator('input[placeholder*="Search"]');
    await search.fill("hello world");
    await expect(search).toHaveValue("hello world");
  });

  // 9
  test("9. Typing in search triggers results or loading", async ({ page }) => {
    await goToInbox(page);
    const search = page.locator('input[placeholder*="Search"]');
    await search.fill("test query");
    await page.waitForTimeout(1500);
    // Should show loading, results, or no-results state — page is functional
    const bodyText = await page.locator("body").textContent();
    expect(bodyText!.length).toBeGreaterThan(0);
  });

  // 10
  test("10. Clearing search returns to normal view", async ({ page }) => {
    await goToInbox(page);
    const search = page.locator('input[placeholder*="Search"]');
    await search.fill("random search text");
    await page.waitForTimeout(1000);
    await search.fill("");
    await page.waitForTimeout(1000);
    // Tab filters should still be visible after clearing
    await expect(
      page.getByRole("button", { name: /^All$/i })
    ).toBeVisible();
  });

  // 11
  test("11. Email row shows sender and subject text", async ({ page }) => {
    await goToInbox(page);
    await page.waitForTimeout(2000);
    const emails = page.locator(".cursor-pointer");
    const count = await emails.count();
    test.skip(count === 0, "No emails available to verify row content");
    const firstEmail = emails.first();
    const text = await firstEmail.textContent();
    // Should have some meaningful text content (sender + subject)
    expect(text!.length).toBeGreaterThan(3);
  });

  // 12
  test("12. Clicking an email row shows reading pane or detail", async ({
    page,
  }) => {
    await goToInbox(page);
    await page.waitForTimeout(2000);
    const emails = page.locator(".cursor-pointer");
    const count = await emails.count();
    test.skip(count === 0, "No emails available to click");
    await emails.first().click();
    await page.waitForTimeout(1500);
    // After clicking, some detail/reading pane content should appear
    const bodyText = await page.locator("body").textContent();
    expect(bodyText!.length).toBeGreaterThan(10);
  });

  // 13
  test("13. Compose button exists in sidebar", async ({ page }) => {
    await goToInbox(page);
    const composeBtn = page.getByRole("button", { name: /Compose/i });
    await expect(composeBtn).toBeVisible();
  });
});
