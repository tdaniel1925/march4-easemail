import { test, expect, type Page } from "@playwright/test";

/**
 * Authentication E2E tests — runs against built app (npm run build && npm start).
 *
 * Tests cover:
 *  1. Login page loads with MS auth button
 *  2. Logout functionality redirects to login
 *  3. Unauthorized access redirects to login
 *  4. Login page shows error message for unauthorized domains
 *
 * Skipped (require live Microsoft OAuth):
 *  - Full OAuth flow with real MS credentials
 *  - Token refresh behavior
 */

const LOGIN_URL = "/login";
const INBOX_URL = "/inbox";

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function goToLogin(page: Page) {
  await page.goto(LOGIN_URL);
  await expect(page).toHaveURL(/login/);
}

// ─── Test 1: Login page loads ────────────────────────────────────────────────

test("1. Login page loads and shows Microsoft sign-in button", async ({ page }) => {
  await goToLogin(page);

  // Page heading
  await expect(page.locator("h1", { hasText: "Welcome to EaseMail" })).toBeVisible({ timeout: 5000 });

  // Microsoft sign-in button
  const msButton = page.locator("button", { hasText: /Sign in with Microsoft/i });
  await expect(msButton).toBeVisible();
  await expect(msButton).toBeEnabled();
});

test("1b. Login page shows branding elements", async ({ page }) => {
  await goToLogin(page);

  // Look for EaseMail branding
  await expect(page.locator("text=EaseMail")).toBeVisible();
});

// ─── Test 2: Logout functionality ────────────────────────────────────────────

test("2. Logout redirects to login page", async ({ page }) => {
  // Start authenticated (session injected via storageState)
  await page.goto(INBOX_URL);
  await expect(page).not.toHaveURL(/login/);

  // Navigate to settings and click sign out
  await page.goto("/settings");
  await expect(page.locator("h1", { hasText: "Settings" })).toBeVisible({ timeout: 8000 });

  // Find and click Sign Out button
  const signOutBtn = page.locator("button", { hasText: /Sign Out/i });
  await expect(signOutBtn).toBeVisible();
  await signOutBtn.click();

  // Should redirect to login
  await expect(page).toHaveURL(/login/, { timeout: 8000 });
});

test("2b. After logout, accessing protected routes redirects to login", async ({ page }) => {
  // Logout first
  await page.goto("/settings");
  await expect(page.locator("h1", { hasText: "Settings" })).toBeVisible({ timeout: 8000 });
  const signOutBtn = page.locator("button", { hasText: /Sign Out/i });
  await signOutBtn.click();
  await expect(page).toHaveURL(/login/, { timeout: 8000 });

  // Try accessing inbox
  await page.goto(INBOX_URL);
  await expect(page).toHaveURL(/login/, { timeout: 5000 });
});

// ─── Test 3: Unauthorized access ─────────────────────────────────────────────

test("3. Accessing protected route without auth redirects to login", async ({ page }) => {
  // Clear all cookies and storage to simulate unauthenticated state
  await page.context().clearCookies();
  await page.context().clearPermissions();

  await page.goto("/calendar");
  await expect(page).toHaveURL(/login/, { timeout: 8000 });
});

test("3b. Accessing /compose without auth redirects to login", async ({ page }) => {
  await page.context().clearCookies();
  await page.goto("/compose");
  await expect(page).toHaveURL(/login/, { timeout: 8000 });
});

test("3c. Root path redirects to login when unauthenticated", async ({ page }) => {
  await page.context().clearCookies();
  await page.goto("/");
  await expect(page).toHaveURL(/login/, { timeout: 8000 });
});

// ─── Test 4: Unauthorized domain handling ────────────────────────────────────

test("4. Login page shows error message when unauthorized_domain query param present", async ({ page }) => {
  await page.goto("/login?error=unauthorized_domain");

  // Error message should be visible
  const errorMsg = page.locator("text=/not authorized|not allowed|unauthorized/i");
  await expect(errorMsg).toBeVisible({ timeout: 5000 });
});

test("4b. Login page without error param shows no error message", async ({ page }) => {
  await goToLogin(page);

  // No error message should be visible
  const errorMsg = page.locator("text=/not authorized|not allowed|unauthorized/i");
  await expect(errorMsg).not.toBeVisible();
});

// ─── Test 5: Session persistence ─────────────────────────────────────────────

test("5. Authenticated session persists across page reloads", async ({ page }) => {
  await page.goto(INBOX_URL);
  await expect(page).not.toHaveURL(/login/);
  await expect(page.locator("h1", { hasText: "Inbox" })).toBeVisible({ timeout: 8000 });

  // Reload page
  await page.reload();

  // Should still be authenticated
  await expect(page).not.toHaveURL(/login/);
  await expect(page.locator("h1", { hasText: "Inbox" })).toBeVisible({ timeout: 8000 });
});

test("5b. Authenticated session allows navigation between protected routes", async ({ page }) => {
  // Start at inbox
  await page.goto(INBOX_URL);
  await expect(page.locator("h1", { hasText: "Inbox" })).toBeVisible({ timeout: 8000 });

  // Navigate to calendar
  await page.goto("/calendar");
  await expect(page.locator("h1", { hasText: "Calendar" })).toBeVisible({ timeout: 8000 });

  // Navigate to compose
  await page.goto("/compose");
  await expect(page.locator("h1", { hasText: "New Message" })).toBeVisible({ timeout: 8000 });

  // All navigation should work without redirecting to login
  await expect(page).not.toHaveURL(/login/);
});
