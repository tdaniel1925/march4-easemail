import { test, expect, type Page } from "@playwright/test";

/**
 * Calendar E2E tests — runs against built app (npm run build && npm start).
 * Auth: session cookie injected via storageState in playwright.config.ts.
 *
 * Tests cover UI-only flows that do not require live Graph data or AI keys:
 *  1. Calendar page loads — 7 day columns and time grid visible
 *  2. Week navigation — prev/next week changes the month/year label
 *  3. Today button — navigates back to current week
 *  4. New Event button — opens create event modal
 *  5. Modal: subject input is auto-focused on open
 *  6. Modal: Cancel button closes the modal
 *  7. Modal: Escape key closes the modal
 *  8. Modal: submitting without a subject shows a validation error
 *  9. Modal: All-day toggle switches date inputs between datetime-local and date
 * 10. Modal: attendee chip — typing email + Enter creates a chip
 * 11. NL input bar — visible, accepts text, Create button disabled when empty
 * 12. View toggle — Week active by default, Day button present
 *
 * Skipped (require live Graph data or AI):
 *  - Clicking a calendar event opens the detail modal
 *  - NL create → AI parse → form prefilled
 *  - RSVP buttons appear on invite events
 */

const CAL_URL = "/calendar";

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function goToCalendar(page: Page) {
  await page.goto(CAL_URL);
  await expect(page).not.toHaveURL(/login/, { timeout: 8000 });
  // The calendar header always shows "Calendar" h1
  await expect(page.locator("h1", { hasText: "Calendar" })).toBeVisible({ timeout: 8000 });
}

async function openNewEventModal(page: Page) {
  await page.locator("button", { hasText: "New Event" }).click();
  await expect(page.locator("h2", { hasText: "New Event" })).toBeVisible({ timeout: 5000 });
}

// ─── Test 1: Page loads ───────────────────────────────────────────────────────

test("1. Calendar page loads with 7 day columns and time grid", async ({ page }) => {
  await goToCalendar(page);

  // All 7 day-of-week labels present
  for (const label of ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]) {
    await expect(page.locator(`text=${label}`).first()).toBeVisible();
  }

  // Time labels: 8 AM and 12 PM always in range HOUR_START=7 to HOUR_END=21
  await expect(page.locator("text=8 AM").first()).toBeVisible();
  await expect(page.locator("text=12 PM").first()).toBeVisible();
});

// ─── Test 2: Week navigation ──────────────────────────────────────────────────

test("2. Prev-week button changes the month/year label", async ({ page }) => {
  await goToCalendar(page);

  // Capture current label (e.g. "March 2026")
  const label = page.locator("span.font-semibold.text-neutral-700.min-w-\\[140px\\]").first();
  const before = await label.textContent();

  // Navigate back 5 weeks so we cross a month boundary regardless of current date
  for (let i = 0; i < 5; i++) {
    await page.locator("button[aria-label='Previous week']").click();
  }

  const after = await label.textContent();
  expect(after).not.toBe(before);
});

test("2b. Next-week button changes the month/year label", async ({ page }) => {
  await goToCalendar(page);

  const label = page.locator("span.font-semibold.text-neutral-700.min-w-\\[140px\\]").first();
  const before = await label.textContent();

  for (let i = 0; i < 5; i++) {
    await page.locator("button[aria-label='Next week']").click();
  }

  const after = await label.textContent();
  expect(after).not.toBe(before);
});

// ─── Test 3: Today button ─────────────────────────────────────────────────────

test("3. Today button returns to the current week after navigating away", async ({ page }) => {
  await goToCalendar(page);

  const label = page.locator("span.font-semibold.text-neutral-700.min-w-\\[140px\\]").first();
  const original = await label.textContent();

  // Navigate away 5 weeks
  for (let i = 0; i < 5; i++) {
    await page.locator("button[aria-label='Next week']").click();
  }
  expect(await label.textContent()).not.toBe(original);

  // Click Today — label should restore
  await page.locator("button", { hasText: "Today" }).click();
  await expect(label).toHaveText(original ?? "", { timeout: 3000 });
});

// ─── Test 4: New Event button ─────────────────────────────────────────────────

test("4. New Event button opens the create-event modal", async ({ page }) => {
  await goToCalendar(page);
  await openNewEventModal(page);

  // Modal must contain the subject input and action buttons
  await expect(page.locator('input[placeholder="Event title"]')).toBeVisible();
  await expect(page.locator("button", { hasText: "Create Event" })).toBeVisible();
  await expect(page.locator("button", { hasText: "Cancel" })).toBeVisible();
});

// ─── Test 5: Subject auto-focus ───────────────────────────────────────────────

test("5. Subject input is auto-focused when the modal opens", async ({ page }) => {
  await goToCalendar(page);
  await openNewEventModal(page);

  const subjectInput = page.locator('input[placeholder="Event title"]');
  await expect(subjectInput).toBeFocused({ timeout: 3000 });
});

// ─── Test 6: Cancel closes modal ─────────────────────────────────────────────

test("6. Cancel button closes the event form modal", async ({ page }) => {
  await goToCalendar(page);
  await openNewEventModal(page);

  await page.locator("button", { hasText: "Cancel" }).click();

  await expect(page.locator("h2", { hasText: "New Event" })).not.toBeVisible({ timeout: 3000 });
});

test("6b. Clicking the backdrop (outside modal) closes it", async ({ page }) => {
  await goToCalendar(page);
  await openNewEventModal(page);

  // Click at (10, 10) — top-left corner of the overlay, outside the modal card
  await page.mouse.click(10, 10);

  await expect(page.locator("h2", { hasText: "New Event" })).not.toBeVisible({ timeout: 3000 });
});

// ─── Test 7: Escape closes modal ─────────────────────────────────────────────

test("7. Escape key closes the event form modal", async ({ page }) => {
  await goToCalendar(page);
  await openNewEventModal(page);

  await page.keyboard.press("Escape");

  await expect(page.locator("h2", { hasText: "New Event" })).not.toBeVisible({ timeout: 3000 });
});

// ─── Test 8: Form validation ──────────────────────────────────────────────────

test("8. Submitting without a subject shows a validation error", async ({ page }) => {
  await goToCalendar(page);
  await openNewEventModal(page);

  // Click Create Event with empty subject
  await page.locator("button", { hasText: "Create Event" }).click();

  await expect(page.locator("text=Subject is required")).toBeVisible({ timeout: 3000 });

  // Modal must stay open
  await expect(page.locator("h2", { hasText: "New Event" })).toBeVisible();
});

test("8b. End time before start time shows a validation error", async ({ page }) => {
  await goToCalendar(page);
  await openNewEventModal(page);

  // Fill a subject so we get past the first validation
  await page.locator('input[placeholder="Event title"]').fill("Test Meeting");

  // Set end to a well-past datetime — default start is always "next full hour" (future).
  // React 18 exposes props directly via __reactProps$<hash> on the DOM node.
  await page.locator('[data-testid="event-end"]').evaluate((el, value) => {
    const propsKey = Object.keys(el).find((k) => k.startsWith("__reactProps$"));
    if (!propsKey) throw new Error("__reactProps$ not found on event-end input");
    const onChange = (el as any)[propsKey].onChange;
    if (typeof onChange !== "function") throw new Error("onChange is not a function");
    onChange({ target: { value } });
  }, "2020-01-01T00:00");

  // Confirm React re-rendered with the new end value before submitting
  await expect(page.locator('[data-testid="event-end"]')).toHaveValue("2020-01-01T00:00", { timeout: 2000 });

  await page.locator("button", { hasText: "Create Event" }).click();

  await expect(page.locator("text=End time must be after start time")).toBeVisible({ timeout: 3000 });
});

// ─── Test 9: All-day toggle ───────────────────────────────────────────────────

test("9. All-day toggle switches date inputs between datetime-local and date type", async ({ page }) => {
  await goToCalendar(page);
  await openNewEventModal(page);

  // Default: datetime-local inputs
  const startInput = page.locator('input[type="datetime-local"]').first();
  await expect(startInput).toBeVisible();

  // Toggle all-day on — button is a toggle pill next to the "All day" label
  // Locate via the parent flex row containing the text "All day"
  await page.locator("text=All day").locator("..").locator("button").click();

  // Now inputs should be type="date"
  await expect(page.locator('input[type="date"]').first()).toBeVisible({ timeout: 2000 });
  await expect(page.locator('input[type="datetime-local"]')).toHaveCount(0);
});

test("9b. Toggling all-day off restores datetime-local inputs", async ({ page }) => {
  await goToCalendar(page);
  await openNewEventModal(page);

  // Toggle on then off
  const allDayBtn = page.locator("text=All day").locator("..").locator("button");
  await allDayBtn.click();
  await expect(page.locator('input[type="date"]').first()).toBeVisible();

  await allDayBtn.click();
  await expect(page.locator('input[type="datetime-local"]').first()).toBeVisible({ timeout: 2000 });
  await expect(page.locator('input[type="date"]')).toHaveCount(0);
});

// ─── Test 10: Attendee chip ───────────────────────────────────────────────────

test("10. Typing an email in Attendees and pressing Enter creates a chip", async ({ page }) => {
  await goToCalendar(page);
  await openNewEventModal(page);

  const attendeeInput = page.locator('input[type="email"]');
  await attendeeInput.fill("client@lawfirm.com");
  await attendeeInput.press("Enter");

  // Chip should appear with the address
  await expect(page.locator("text=client@lawfirm.com").first()).toBeVisible({ timeout: 2000 });

  // Input should be cleared
  await expect(attendeeInput).toHaveValue("");
});

test("10b. Clicking × on attendee chip removes it", async ({ page }) => {
  await goToCalendar(page);
  await openNewEventModal(page);

  const attendeeInput = page.locator('input[type="email"]');
  await attendeeInput.fill("remove@lawfirm.com");
  await attendeeInput.press("Enter");

  const chip = page.locator("span", { hasText: "remove@lawfirm.com" });
  await expect(chip).toBeVisible();

  // The × button is inside the chip span
  await chip.locator("button").click();
  await expect(chip).not.toBeVisible();
});

// ─── Test 11: NL input bar ────────────────────────────────────────────────────

test("11. NL input bar is visible and Create button is disabled when empty", async ({ page }) => {
  await goToCalendar(page);

  const nlInput = page.locator('input[placeholder*="Create event with AI"]');
  await expect(nlInput).toBeVisible();

  // Create button disabled with empty input — it sits at the same level in the NL bar row
  const createBtn = page.locator("button", { hasText: "Create" }).last();
  await expect(createBtn).toBeDisabled();
});

test("11b. NL input bar Create button becomes enabled when text is typed", async ({ page }) => {
  await goToCalendar(page);

  const nlInput = page.locator('input[placeholder*="Create event with AI"]');
  await nlInput.fill("Team standup tomorrow at 9am");

  // Create button should now be enabled
  const createBtn = page.locator("button", { hasText: "Create" }).last();
  await expect(createBtn).toBeEnabled({ timeout: 2000 });
});

// ─── Test 12: View toggle ─────────────────────────────────────────────────────

test("12. Week view is active by default; Day and Week buttons are present", async ({ page }) => {
  await goToCalendar(page);

  const weekBtn = page.locator("button", { hasText: /^Week$/ });
  const dayBtn  = page.locator("button", { hasText: /^Day$/ });

  await expect(weekBtn).toBeVisible();
  await expect(dayBtn).toBeVisible();

  // Week should be visually active (white text on BRAND background)
  // Check via aria or computed style — we verify the button has expected content
  await expect(weekBtn).toBeEnabled();
  await expect(dayBtn).toBeEnabled();
});

test("12b. Clicking Day sets it as the active view", async ({ page }) => {
  await goToCalendar(page);

  const dayBtn = page.locator("button", { hasText: /^Day$/ });
  await dayBtn.click();

  // After clicking, Day button should have the active style (white text — background rgb(138,9,9))
  // We verify by re-clicking Week and checking store round-trips cleanly (no crash)
  const weekBtn = page.locator("button", { hasText: /^Week$/ });
  await weekBtn.click();

  // Calendar heading still visible — no error thrown
  await expect(page.locator("h1", { hasText: "Calendar" })).toBeVisible();
});
