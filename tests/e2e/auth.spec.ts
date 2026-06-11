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

  // Page heading (redesigned login page)
  await expect(page.locator("h1", { hasText: "Email that works" })).toBeVisible({ timeout: 5000 });

  // Microsoft sign-in control (rendered as an anchor in the redesign)
  const msButton = page.locator("a, button").filter({ hasText: /Sign in with Microsoft/i }).first();
  await expect(msButton).toBeVisible();
  await expect(msButton).toBeEnabled();
});

test("1b. Login page shows branding elements", async ({ page }) => {
  await goToLogin(page);

  // Look for EaseMail branding
  await expect(page.locator("text=EaseMail").first()).toBeVisible();
});

// ─── Test 2: Logout functionality ────────────────────────────────────────────

// NOTE: The Sign Out control is an anchor to /api/auth/signout, which revokes
// the Supabase session server-side. Actually triggering it would invalidate the
// shared storageState (tests/e2e/auth/session.json) for every subsequent test,
// so these tests verify the control + simulate a signed-out client via cookies.
test("2. Logout redirects to login page", async ({ page }) => {
  // Start authenticated (session injected via storageState)
  await page.goto(INBOX_URL);
  await expect(page).not.toHaveURL(/login/);

  // Navigate to settings (redesign: no h1 — h2 "Profile" is default section)
  await page.goto("/settings");
  await expect(page.locator("h2", { hasText: "Profile" }).first()).toBeVisible({ timeout: 8000 });

  // Sign Out control exists and targets the signout endpoint (which redirects to /login)
  const signOutBtn = page.locator("a, button").filter({ hasText: /Sign Out/i }).first();
  await expect(signOutBtn).toBeVisible();
  await expect(page.locator("a[href='/api/auth/signout']").first()).toBeVisible();

  // Simulate signed-out state without revoking the shared test session
  await page.context().clearCookies();
  await page.goto("/settings");
  await expect(page).toHaveURL(/login/, { timeout: 8000 });
});

test("2b. After logout, accessing protected routes redirects to login", async ({ page }) => {
  // Verify the sign-out control is present on settings
  await page.goto("/settings");
  await expect(page.locator("h2", { hasText: "Profile" }).first()).toBeVisible({ timeout: 8000 });
  await expect(page.locator("a[href='/api/auth/signout']").first()).toBeVisible();

  // Simulate logged-out client, then try accessing inbox
  await page.context().clearCookies();
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

  // Error message should be visible (actual copy: "Access is restricted to
  // dmillerlaw.com accounts. Please use your firm email address.")
  const errorMsg = page.locator("text=/Access is restricted|not authorized|not allowed|unauthorized/i").first();
  await expect(errorMsg).toBeVisible({ timeout: 5000 });
});

test("4b. Login page without error param shows no error message", async ({ page }) => {
  await goToLogin(page);

  // No error message should be visible
  const errorMsg = page.locator("text=/Access is restricted|not authorized|not allowed|unauthorized/i");
  await expect(errorMsg).not.toBeVisible();
});

// ─── Test 5: Session persistence ─────────────────────────────────────────────

test("5. Authenticated session persists across page reloads", async ({ page }) => {
  await page.goto(INBOX_URL);
  await expect(page).not.toHaveURL(/login/);
  // Redesign: inbox heading is an h2 ("Inbox" + optional unread-count suffix)
  await expect(page.locator("h2", { hasText: "Inbox" }).first()).toBeVisible({ timeout: 8000 });

  // Reload page
  await page.reload();

  // Should still be authenticated
  await expect(page).not.toHaveURL(/login/);
  await expect(page.locator("h2", { hasText: "Inbox" }).first()).toBeVisible({ timeout: 8000 });
});

test("5b. Authenticated session allows navigation between protected routes", async ({ page }) => {
  // Start at inbox
  await page.goto(INBOX_URL);
  await expect(page.locator("h2", { hasText: "Inbox" }).first()).toBeVisible({ timeout: 8000 });

  // Navigate to calendar
  await page.goto("/calendar");
  await expect(page.locator("h1", { hasText: "Calendar" })).toBeVisible({ timeout: 8000 });

  // Navigate to compose
  await page.goto("/compose");
  await expect(page.locator("h1", { hasText: "New Message" })).toBeVisible({ timeout: 8000 });

  // All navigation should work without redirecting to login
  await expect(page).not.toHaveURL(/login/);
});
