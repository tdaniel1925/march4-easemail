import { test, expect, type Page } from "@playwright/test";

/**
 * Dashboard E2E tests — runs against built app (npm run build && npm start).
 * Auth: session cookie injected via storageState in playwright.config.ts.
 *
 * Tests cover:
 *  1. Dashboard page loads with welcome header
 *  2. Live clock is visible and shows current time
 *  3. Unread emails count/card is displayed
 *  4. Recent emails section shows email list or empty state
 *  5. Calendar/agenda widget shows upcoming events or empty state
 *  6. Todo list section exists
 *  7. Add todo input is visible (after clicking +)
 *  8. Adding a todo appends it to the list
 *  9. Completing a todo marks it as done (strikethrough)
 * 10. Quick action buttons exist (Compose, Calendar links)
 * 11. Weekly activity chart renders
 */

const DASHBOARD_URL = "/dashboard";

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function goToDashboard(page: Page) {
  await page.goto(DASHBOARD_URL);
  await expect(page).not.toHaveURL(/login/, { timeout: 8000 });
  await expect(page.locator("h1").first()).toBeVisible({ timeout: 8000 });
}

// ─── Test 1: Page loads ───────────────────────────────────────────────────────

test("1. Dashboard page loads with welcome header", async ({ page }) => {
  await goToDashboard(page);

  // Header contains "Dashboard" label and "Welcome back" greeting
  await expect(page.locator("text=Dashboard").first()).toBeVisible();
  await expect(page.locator("text=Welcome back").first()).toBeVisible();
});

// ─── Test 2: Live clock ──────────────────────────────────────────────────────

test("2. Live clock is visible and shows current time", async ({ page }) => {
  await goToDashboard(page);

  // The header shows date and time separated by a dot — time contains AM or PM
  const timeArea = page.locator("header p").filter({ hasText: /AM|PM/ }).first();
  await expect(timeArea).toBeVisible({ timeout: 5000 });
});

// ─── Test 3: Unread emails count ─────────────────────────────────────────────

test("3. Unread emails count or New Emails section is displayed", async ({ page }) => {
  await goToDashboard(page);

  // The "New Emails" heading exists in the right column
  await expect(page.locator("h2", { hasText: "New Emails" })).toBeVisible({ timeout: 5000 });
});

// ─── Test 4: Recent emails section ───────────────────────────────────────────

test("4. Recent emails section shows email list or empty state", async ({ page }) => {
  await goToDashboard(page);

  // Either shows email items or the "All caught up!" empty state
  const section = page.locator("h2", { hasText: "New Emails" }).locator("../..");
  const hasEmails = await section.locator("button").count() > 0;
  const hasEmpty = await section.locator("text=All caught up").count() > 0;

  expect(hasEmails || hasEmpty).toBe(true);
});

// ─── Test 5: Calendar/agenda widget ──────────────────────────────────────────

test("5. Calendar/agenda widget shows upcoming events or empty state", async ({ page }) => {
  await goToDashboard(page);

  // "Today's Agenda" section heading
  await expect(page.locator("h2", { hasText: "Today's Agenda" }).first()).toBeVisible({ timeout: 5000 });

  // Either has event cards or the "No events scheduled for today" message
  const section = page.locator("section").filter({ hasText: "Today's Agenda" }).first();
  const hasEvents = await section.locator("a[href='/calendar']").count() > 0;
  const hasEmpty = await section.locator("text=No events scheduled").count() > 0;

  expect(hasEvents || hasEmpty).toBe(true);
});

// ─── Test 6: Todo list section exists ────────────────────────────────────────

test("6. Todo list section exists", async ({ page }) => {
  await goToDashboard(page);

  await expect(page.locator("h2", { hasText: "To Do List" })).toBeVisible({ timeout: 5000 });
});

// ─── Test 7: Add todo input is visible ───────────────────────────────────────

test("7. Clicking + button reveals add todo input", async ({ page }) => {
  await goToDashboard(page);

  // The + button is next to the "To Do List" heading
  const todoSection = page.locator("section").filter({ hasText: "To Do List" }).first();
  const addBtn = todoSection.locator("button").first();
  await addBtn.click();

  // Input with "New task" placeholder should appear
  await expect(page.locator('input[placeholder="New task…"]')).toBeVisible({ timeout: 3000 });
});

// ─── Test 8: Adding a todo ───────────────────────────────────────────────────

test("8. Adding a todo appends it to the list", async ({ page }) => {
  await goToDashboard(page);

  const todoSection = page.locator("section").filter({ hasText: "To Do List" }).first();
  const addBtn = todoSection.locator("button").first();
  await addBtn.click();

  const input = page.locator('input[placeholder="New task…"]');
  await expect(input).toBeVisible({ timeout: 3000 });

  const taskName = `Test task ${Date.now()}`;
  await input.fill(taskName);

  // The "Add" button is inside the todo section's add-todo input row
  await todoSection.locator("button", { hasText: "Add" }).click();

  // The new todo should appear in the list
  await expect(page.locator(`text=${taskName}`).first()).toBeVisible({ timeout: 5000 });
});

// ─── Test 9: Completing a todo ───────────────────────────────────────────────

test("9. Completing a todo marks it as done (strikethrough)", async ({ page }) => {
  await goToDashboard(page);

  // First add a todo
  const todoSection = page.locator("section").filter({ hasText: "To Do List" }).first();
  const addBtn = todoSection.locator("button").first();
  await addBtn.click();

  const input = page.locator('input[placeholder="New task…"]');
  await expect(input).toBeVisible({ timeout: 3000 });

  const taskName = `Complete me ${Date.now()}`;
  await input.fill(taskName);
  await todoSection.locator("button", { hasText: "Add" }).click();
  await expect(page.locator(`text=${taskName}`).first()).toBeVisible({ timeout: 5000 });

  // Check the checkbox for the new todo
  const todoLabel = todoSection.locator("label").filter({ hasText: taskName }).first();
  const checkbox = todoLabel.locator('input[type="checkbox"]');
  await checkbox.check();

  // The text should have line-through
  const textSpan = todoLabel.locator("span").filter({ hasText: taskName }).first();
  await expect(textSpan).toHaveCSS("text-decoration", /line-through/, { timeout: 3000 });
});

// ─── Test 10: Quick action buttons ───────────────────────────────────────────

test("10. Quick action buttons exist (Compose, Calendar links)", async ({ page }) => {
  await goToDashboard(page);

  // Quick action links in the actions bar
  await expect(page.locator("a[href='/compose']").filter({ hasText: "Compose" }).first()).toBeVisible({ timeout: 5000 });
  await expect(page.locator("a[href='/calendar']").filter({ hasText: "Calendar" }).first()).toBeVisible({ timeout: 5000 });
  await expect(page.locator("a[href='/inbox']").filter({ hasText: "Inbox" }).first()).toBeVisible({ timeout: 5000 });
});

// ─── Test 11: Weekly activity chart ──────────────────────────────────────────

test("11. Weekly activity chart renders", async ({ page }) => {
  await goToDashboard(page);

  // "Weekly Activity" heading
  await expect(page.locator("h2", { hasText: "Weekly Activity" })).toBeVisible({ timeout: 5000 });

  // Chart renders as a canvas element
  const chartSection = page.locator("section").filter({ hasText: "Weekly Activity" }).first();
  await expect(chartSection.locator("canvas").first()).toBeVisible({ timeout: 3000 });
});
