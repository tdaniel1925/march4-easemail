import { test, expect, type Page } from "@playwright/test";

/**
 * Dashboard E2E tests — runs against built app (npm run build && npm start).
 * Auth: session cookie injected via storageState in playwright.config.ts.
 *
 * Redesigned dashboard renders:
 *  - h1 "Good morning/afternoon/evening, {name}"
 *  - header line "{time} · {date}" + Compose button
 *  - stats row (Unread / Events / Tasks)
 *  - h2 sections: "Today's Agenda", "Needs Attention", "Tasks", "This Week"
 *  - Tasks: "+ Add" reveals input placeholder "What needs to be done?"
 *  - This Week: canvas chart + Received/Sent/Drafts/Attachments counters
 *
 * NOTE: Mail/calendar data comes from Microsoft Graph. When the test account
 * requires re-consent the API returns 401 (account_requires_reauth) and the
 * dashboard shows empty states — tests accept data OR empty/reauth states.
 */

const DASHBOARD_URL = "/dashboard";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const GREETING_RE = /Good (morning|afternoon|evening)/;

async function goToDashboard(page: Page) {
  await page.goto(DASHBOARD_URL);
  await expect(page).not.toHaveURL(/login/, { timeout: 8000 });
  await expect(page.locator("h1", { hasText: GREETING_RE }).first()).toBeVisible({ timeout: 8000 });
}

function tasksSection(page: Page) {
  return page
    .locator("section")
    .filter({ has: page.locator("h2", { hasText: /^Tasks/ }) })
    .first();
}

// ─── Test 1: Page loads ───────────────────────────────────────────────────────

test("1. Dashboard page loads with welcome header", async ({ page }) => {
  await goToDashboard(page);

  // Greeting header ("Good morning/afternoon/evening, {name}")
  await expect(page.locator("h1", { hasText: GREETING_RE }).first()).toBeVisible();
  // Dashboard nav entry (sidebar)
  await expect(page.locator("text=Dashboard").first()).toBeVisible();
});

// ─── Test 2: Live clock ──────────────────────────────────────────────────────

test("2. Live clock is visible and shows current time", async ({ page }) => {
  await goToDashboard(page);

  // The header shows "{time} · {date}" — match a clock-like time string
  const timeArea = page.locator("p").filter({ hasText: /\d{1,2}:\d{2}/ }).first();
  await expect(timeArea).toBeVisible({ timeout: 5000 });
});

// ─── Test 3: Unread emails count ─────────────────────────────────────────────

test("3. Unread emails count or New Emails section is displayed", async ({ page }) => {
  await goToDashboard(page);

  // Stats row shows an "Unread" counter
  await expect(page.locator("text=Unread").first()).toBeVisible({ timeout: 5000 });
});

// ─── Test 4: Needs Attention section ─────────────────────────────────────────

test("4. Needs Attention section shows email list or empty state", async ({ page }) => {
  await goToDashboard(page);

  const heading = page.locator("h2", { hasText: "Needs Attention" }).first();
  await expect(heading).toBeVisible({ timeout: 5000 });

  // Either shows items or the "All caught up" empty state (Graph reauth → empty)
  const section = page.locator("section").filter({ hasText: "Needs Attention" }).first();
  const hasItems = (await section.locator("button, a").count()) > 0;
  const hasEmpty = (await section.locator("text=All caught up").count()) > 0;

  expect(hasItems || hasEmpty).toBe(true);
});

// ─── Test 5: Calendar/agenda widget ──────────────────────────────────────────

test("5. Calendar/agenda widget shows upcoming events or empty state", async ({ page }) => {
  await goToDashboard(page);

  // "Today's Agenda" section heading
  await expect(page.locator("h2", { hasText: "Today's Agenda" }).first()).toBeVisible({ timeout: 5000 });

  // Either has event entries or the "No events today" empty state
  const section = page.locator("section").filter({ hasText: "Today's Agenda" }).first();
  await expect(
    section.locator("text=No events today").or(section.locator("button, a")).first(),
  ).toBeVisible({ timeout: 8000 });
});

// ─── Test 6: Todo list section exists ────────────────────────────────────────

test("6. Tasks (todo) section exists", async ({ page }) => {
  await goToDashboard(page);

  await expect(page.locator("h2", { hasText: /^Tasks/ }).first()).toBeVisible({ timeout: 5000 });
});

// ─── Test 7: Add todo input is visible ───────────────────────────────────────

test("7. Clicking + Add button reveals add todo input", async ({ page }) => {
  await goToDashboard(page);

  const section = tasksSection(page);
  const addBtn = section.locator("button", { hasText: /\+ ?Add/ }).first();
  await addBtn.click();

  // Input with "What needs to be done?" placeholder should appear
  await expect(page.locator('input[placeholder="What needs to be done?"]')).toBeVisible({ timeout: 3000 });
});

// ─── Test 8: Adding a todo ───────────────────────────────────────────────────

test("8. Adding a todo appends it to the list", async ({ page }) => {
  await goToDashboard(page);

  const section = tasksSection(page);
  const addBtn = section.locator("button", { hasText: /\+ ?Add/ }).first();
  await addBtn.click();

  const input = page.locator('input[placeholder="What needs to be done?"]');
  await expect(input).toBeVisible({ timeout: 3000 });

  const taskName = `Test task ${Date.now()}`;
  await input.fill(taskName);

  // The "Add" submit button is in the same input row (exact text "Add")
  await section.locator("button", { hasText: /^Add$/ }).first().click();

  // The new todo should appear in the list
  await expect(page.locator(`text=${taskName}`).first()).toBeVisible({ timeout: 5000 });
});

// ─── Test 9: Completing a todo ───────────────────────────────────────────────

test("9. Completing a todo marks it as done (strikethrough)", async ({ page }) => {
  await goToDashboard(page);

  // First add a todo
  const section = tasksSection(page);
  const addBtn = section.locator("button", { hasText: /\+ ?Add/ }).first();
  await addBtn.click();

  const input = page.locator('input[placeholder="What needs to be done?"]');
  await expect(input).toBeVisible({ timeout: 3000 });

  const taskName = `Complete me ${Date.now()}`;
  await input.fill(taskName);
  await section.locator("button", { hasText: /^Add$/ }).first().click();
  await expect(page.locator(`text=${taskName}`).first()).toBeVisible({ timeout: 5000 });

  // Check the checkbox for the new todo (rows are divs: checkbox + span)
  const todoRow = section.locator("div").filter({ hasText: taskName }).last();
  const checkbox = todoRow.locator('input[type="checkbox"]').first();
  await checkbox.check();

  // The text should have line-through
  const textSpan = section.locator("span").filter({ hasText: taskName }).first();
  await expect(textSpan).toHaveCSS("text-decoration", /line-through/, { timeout: 5000 });
});

// ─── Test 10: Quick action buttons ───────────────────────────────────────────

test("10. Quick action buttons exist (Compose, Calendar links)", async ({ page }) => {
  await goToDashboard(page);

  // Compose is a header button on the redesigned dashboard
  await expect(page.locator("button", { hasText: "Compose" }).first()).toBeVisible({ timeout: 5000 });
  // Sidebar navigation entries are rendered as buttons (NavLink components)
  await expect(page.locator("button", { hasText: "Calendar" }).first()).toBeVisible({ timeout: 5000 });
  await expect(page.locator("button", { hasText: "Inbox" }).first()).toBeVisible({ timeout: 5000 });
});

// ─── Test 11: Weekly activity chart ──────────────────────────────────────────

test("11. Weekly activity chart renders", async ({ page }) => {
  await goToDashboard(page);

  // "This Week" heading (was "Weekly Activity" before redesign)
  await expect(page.locator("h2", { hasText: "This Week" }).first()).toBeVisible({ timeout: 5000 });

  // Chart renders as a canvas element
  const chartSection = page.locator("section").filter({ hasText: "This Week" }).first();
  await expect(chartSection.locator("canvas").first()).toBeVisible({ timeout: 3000 });
});
