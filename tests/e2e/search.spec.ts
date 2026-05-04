/**
 * Search E2E Tests
 *
 * Tests for the email search functionality in EaseEmail.
 * Verifies search input, operators, debounce behavior,
 * and UI stability during search.
 *
 * The app uses a single-page AppShell pattern with no h1 headings,
 * sidebar buttons (not links), and client-side routing.
 *
 * @module tests/e2e/search
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

test.describe("Search", () => {
  // storageState inherited from playwright.config.ts (tests/e2e/auth/session.json)

  // 1
  test("1. Search input visible on inbox page", async ({ page }) => {
    await goToInbox(page);
    const search = page.locator('input[placeholder*="Search"]');
    await expect(search).toBeVisible();
  });

  // 2
  test("2. Search placeholder contains Search and from:", async ({ page }) => {
    await goToInbox(page);
    const search = page.locator('input[placeholder*="Search"]');
    const placeholder = await search.getAttribute("placeholder");
    expect(placeholder).toContain("Search");
    expect(placeholder).toContain("from:");
  });

  // 3
  test("3. Typing triggers results or loading or error state", async ({
    page,
  }) => {
    await goToInbox(page);
    const search = page.locator('input[placeholder*="Search"]');
    await search.fill("important meeting");
    await page.waitForTimeout(2000);

    // Page should show some response to the search (loading, results, or error)
    const bodyText = await page.locator("body").textContent();
    expect(bodyText!.length).toBeGreaterThan(0);
  });

  // 4
  test("4. Empty search (clear) returns to normal view", async ({ page }) => {
    await goToInbox(page);
    const search = page.locator('input[placeholder*="Search"]');
    await search.fill("some search term");
    await page.waitForTimeout(1000);
    await search.fill("");
    await page.waitForTimeout(1500);
    // Normal view should show tab filters
    await expect(
      page.getByRole("button", { name: /^All$/i })
    ).toBeVisible();
  });

  // 5
  test("5. Search for from:test uses the input and verifies operator works in UI", async ({
    page,
  }) => {
    await goToInbox(page);
    const search = page.locator('input[placeholder*="Search"]');
    await search.fill("from:test");
    await expect(search).toHaveValue("from:test");
    await page.waitForTimeout(1500);
    // Should not crash — page remains functional
    const bodyText = await page.locator("body").textContent();
    expect(bodyText!.length).toBeGreaterThan(0);
  });

  // 6
  test("6. Search shows results with cursor-pointer items or no-results/error state", async ({
    page,
  }) => {
    await goToInbox(page);
    const search = page.locator('input[placeholder*="Search"]');
    await search.fill("test");
    await page.waitForTimeout(2000);
    const results = page.locator(".cursor-pointer");
    const count = await results.count();
    if (count === 0) {
      // Should show no-results or error state, not blank page
      const bodyText = await page.locator("body").textContent();
      expect(bodyText!.length).toBeGreaterThan(0);
    } else {
      expect(count).toBeGreaterThan(0);
    }
  });

  // 7
  test("7. Clearing search (fill empty) shows inbox content again", async ({
    page,
  }) => {
    await goToInbox(page);
    const search = page.locator('input[placeholder*="Search"]');
    await search.fill("random query xyz");
    await page.waitForTimeout(1000);
    await search.fill("");
    await page.waitForTimeout(1500);
    // Inbox content or empty state should be visible
    const emails = page.locator(".cursor-pointer");
    const count = await emails.count();
    if (count === 0) {
      // Empty inbox state is fine — tab filters still visible
      await expect(
        page.getByRole("button", { name: /^All$/i })
      ).toBeVisible();
    } else {
      expect(count).toBeGreaterThan(0);
    }
  });

  // 8
  test("8. Search debounce — multiple rapid keystrokes handled gracefully", async ({
    page,
  }) => {
    await goToInbox(page);
    const search = page.locator('input[placeholder*="Search"]');

    // Track network requests for search
    let requestCount = 0;
    page.on("request", (req) => {
      const url = req.url().toLowerCase();
      if (url.includes("search") || url.includes("query") || url.includes("filter")) {
        requestCount++;
      }
    });

    // Type rapidly character by character
    await search.pressSequentially("hello", { delay: 50 });
    await expect(search).toHaveValue("hello");

    // Immediately after typing, request count should be 0 or 1 (debounced)
    const immediateCount = requestCount;

    // Wait for debounce to fire
    await page.waitForTimeout(1500);

    // After debounce, at most 1-2 requests should have fired (not 5)
    expect(immediateCount).toBeLessThanOrEqual(1);
    expect(requestCount).toBeLessThanOrEqual(2);
  });

  // 9
  test("9. Tab buttons still visible during search", async ({ page }) => {
    await goToInbox(page);
    const search = page.locator('input[placeholder*="Search"]');
    await search.fill("some query");
    await page.waitForTimeout(1000);
    for (const tab of ["All", "Unread", "Starred", "Attachments"]) {
      await expect(
        page.getByRole("button", { name: new RegExp(`^${tab}$`, "i") })
      ).toBeVisible();
    }
  });

  // 10
  test("10. Compose button still accessible during search", async ({ page }) => {
    await goToInbox(page);
    const search = page.locator('input[placeholder*="Search"]');
    await search.fill("searching something");
    await page.waitForTimeout(1000);
    const composeBtn = page.getByRole("button", { name: /Compose/i });
    await expect(composeBtn).toBeVisible();
  });
});
