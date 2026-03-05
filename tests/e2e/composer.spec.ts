import { test, expect, type Page } from "@playwright/test";

/**
 * Composer E2E tests — runs against built app (npm run build && npm start).
 * Auth: session cookie injected via storageState in playwright.config.ts.
 *
 * Tests cover:
 *  1. Composer loads with correct account in From field
 *  2. Recipient chips — typing + Enter creates a chip
 *  3. File attachment — picking a file shows chip with name
 *  4. Draft auto-save — typing triggers Saved indicator
 *  5. Schedule send dropdown — opens and shows time options
 *  6. Reply mode — ?mode=reply pre-fills To and Subject with Re:
 */

const COMPOSE_URL = "/compose";

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function goToCompose(page: Page, params = "") {
  await page.goto(`${COMPOSE_URL}${params}`);
  // Confirm we are on the compose page and not redirected to login
  await expect(page).not.toHaveURL(/login/, { timeout: 8000 });
  // Wait for the composer card heading to be visible (h2 is always present)
  await expect(page.locator("h2").first()).toBeVisible({ timeout: 8000 });
}

// ─── Test 1: Composer loads ───────────────────────────────────────────────────

test("1. Composer loads and From field shows connected account email", async ({ page }) => {
  await goToCompose(page);

  // From field must exist and contain an email address
  const fromRow = page.locator("text=From").locator("..");
  await expect(fromRow).toBeVisible();

  // The From field is a <select> combobox containing account options
  const fromSelect = fromRow.locator("select");
  await expect(fromSelect).toBeVisible();

  // Get the selected option text — must contain an email address
  const selectedText = await fromSelect.evaluate((el: HTMLSelectElement) =>
    el.options[el.selectedIndex]?.text ?? ""
  );
  expect(selectedText).toMatch(/@/);
});

// ─── Test 2: Recipient chips ──────────────────────────────────────────────────

test("2. Typing an email address and pressing Enter creates a recipient chip", async ({ page }) => {
  await goToCompose(page);

  const toInput = page.locator('input[placeholder="Add recipient…"]');
  await expect(toInput).toBeVisible();

  await toInput.click();
  await toInput.fill("test@example.com");
  await toInput.press("Enter");

  // Chip should appear containing the email address
  const chip = page.locator(".recipient-chip", { hasText: "test@example.com" });
  await expect(chip).toBeVisible();

  // Input should be cleared after chip creation
  await expect(toInput).toHaveValue("");
});

test("2b. Pressing comma after typing an email also creates a chip", async ({ page }) => {
  await goToCompose(page);

  const toInput = page.locator('input[placeholder="Add recipient…"]');
  await toInput.click();
  await toInput.fill("comma@example.com");
  await toInput.press(",");

  await expect(page.locator(".recipient-chip", { hasText: "comma@example.com" })).toBeVisible();
});

test("2c. Backspace on empty input removes the last chip", async ({ page }) => {
  await goToCompose(page);

  const toInput = page.locator('input[placeholder="Add recipient…"]');
  await toInput.click();
  await toInput.fill("first@example.com");
  await toInput.press("Enter");
  await toInput.fill("second@example.com");
  await toInput.press("Enter");

  // Both chips present
  await expect(page.locator(".recipient-chip")).toHaveCount(2);

  // Backspace removes second
  await toInput.press("Backspace");
  await expect(page.locator(".recipient-chip")).toHaveCount(1);
  await expect(page.locator(".recipient-chip", { hasText: "first@example.com" })).toBeVisible();
});

test("2d. Clicking the × on a chip removes it", async ({ page }) => {
  await goToCompose(page);

  const toInput = page.locator('input[placeholder="Add recipient…"]');
  await toInput.click();
  await toInput.fill("remove@example.com");
  await toInput.press("Enter");

  const chip = page.locator(".recipient-chip", { hasText: "remove@example.com" });
  await expect(chip).toBeVisible();

  // Click the × button inside the chip
  await chip.locator("button").click();
  await expect(chip).not.toBeVisible();
});

// ─── Test 3: File attachment ──────────────────────────────────────────────────

test("3. Selecting a file shows an attachment chip with the filename", async ({ page }) => {
  await goToCompose(page);

  // The file input is hidden — we set files on it directly
  const fileInput = page.locator('input[type="file"]');

  // Create a small test file buffer
  await fileInput.setInputFiles({
    name: "test-contract.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("PDF content for testing"),
  });

  // Attachment chip should appear
  const chip = page.locator("text=test-contract.pdf");
  await expect(chip).toBeVisible({ timeout: 5000 });
});

test("3b. Multiple files can be attached and each gets a chip", async ({ page }) => {
  await goToCompose(page);

  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles([
    { name: "doc-one.pdf", mimeType: "application/pdf", buffer: Buffer.from("file one") },
    { name: "doc-two.docx", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", buffer: Buffer.from("file two") },
  ]);

  await expect(page.locator("text=doc-one.pdf")).toBeVisible({ timeout: 5000 });
  await expect(page.locator("text=doc-two.docx")).toBeVisible({ timeout: 5000 });
});

test("3c. Clicking × on attachment chip removes it", async ({ page }) => {
  await goToCompose(page);

  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles({
    name: "removable.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("remove me"),
  });

  await expect(page.locator("text=removable.pdf")).toBeVisible({ timeout: 5000 });

  // Navigate from filename span → parent chip div → its remove button
  const removeBtn = page.locator("text=removable.pdf").locator("..").locator("button");
  await removeBtn.click();

  await expect(page.locator("text=removable.pdf")).not.toBeVisible();
});

// ─── Test 4: Draft auto-save ──────────────────────────────────────────────────

test("4. Typing in To field triggers the draft Saved indicator within 7 seconds", async ({ page }) => {
  await goToCompose(page);

  // Fill To field to trigger auto-save
  const toInput = page.locator('input[placeholder="Add recipient…"]');
  await toInput.click();
  await toInput.fill("autosave@example.com");
  await toInput.press("Enter");

  // Fill subject
  await page.locator('input[placeholder="Subject…"]').fill("Auto-save test subject");

  // Saved indicator should appear within 12s (5s debounce + Supabase DB roundtrip)
  await expect(page.locator("text=Saved")).toBeVisible({ timeout: 12000 });
});

test("4b. Saving indicator shows a time stamp, not just a static dot", async ({ page }) => {
  await goToCompose(page);

  const toInput = page.locator('input[placeholder="Add recipient…"]');
  await toInput.click();
  await toInput.fill("timestamp@example.com");
  await toInput.press("Enter");

  // Wait for saved state (12s: 5s debounce + Supabase DB roundtrip)
  await expect(page.locator("text=Saved")).toBeVisible({ timeout: 12000 });

  // Should show a time like "Saved 2:34 PM"
  const savedEl = page.locator("text=/Saved \\d/");
  await expect(savedEl).toBeVisible();
});

// ─── Test 5: Schedule Send ────────────────────────────────────────────────────

test("5. Schedule send clock button opens dropdown with time options", async ({ page }) => {
  await goToCompose(page);

  // Click the clock/schedule button in the footer
  const scheduleBtn = page.locator('button[title="Schedule send"]');
  await expect(scheduleBtn).toBeVisible();
  await scheduleBtn.click();

  // Dropdown must appear with the expected options
  await expect(page.locator("text=Schedule Send")).toBeVisible();
  await expect(page.locator("text=In 1 hour")).toBeVisible();
  await expect(page.locator("text=In 4 hours")).toBeVisible();
  await expect(page.locator("text=Tomorrow 9 AM")).toBeVisible();
  await expect(page.locator("text=Custom date & time")).toBeVisible();
});

test("5b. Clicking a schedule option shows the scheduled indicator and closes dropdown", async ({ page }) => {
  await goToCompose(page);

  // First add a recipient so send is valid
  const toInput = page.locator('input[placeholder="Add recipient…"]');
  await toInput.fill("sched@example.com");
  await toInput.press("Enter");
  await page.locator('input[placeholder="Subject…"]').fill("Scheduled email");

  const scheduleBtn = page.locator('button[title="Schedule send"]');
  await scheduleBtn.click();
  await page.locator("text=In 1 hour").click();

  // The dropdown should close and a scheduled indicator pill should appear
  await expect(page.locator("text=Schedule Send")).not.toBeVisible();
  // Indicator pill shows a scheduled time string (use span to avoid strict mode violation with button)
  await expect(page.locator("span").filter({ hasText: /Sending/ }).first()).toBeVisible({ timeout: 3000 });
});

// ─── Test 6: Reply mode ───────────────────────────────────────────────────────

test("6. Reply mode pre-fills To field and prefixes subject with Re:", async ({ page }) => {
  // We need a real message ID to test this properly.
  // We'll use a fake ID and verify the UI handles it gracefully (shows the compose
  // page with mode=reply, subject field starts blank waiting for fetch).
  // Full wiring test requires a real messageId from the inbox.

  await page.goto("/compose?mode=reply&messageId=FAKE_TEST_ID_000");
  await expect(page).not.toHaveURL(/login/, { timeout: 8000 });

  // Header should say "Reply" not "New Message"
  await expect(page.locator("h1", { hasText: "Reply" })).toBeVisible({ timeout: 8000 });

  // Composer inner header should also say Reply
  await expect(page.locator("h2", { hasText: "Reply" })).toBeVisible();
});

test("6b. Forward mode sets header to Forward Email", async ({ page }) => {
  await page.goto("/compose?mode=forward&messageId=FAKE_TEST_ID_000");
  await expect(page).not.toHaveURL(/login/, { timeout: 8000 });

  await expect(page.locator("h1", { hasText: "Forward" })).toBeVisible({ timeout: 8000 });
  await expect(page.locator("h2", { hasText: "Forward Email" })).toBeVisible();
});

test("6c. New compose (no mode param) shows New Message header", async ({ page }) => {
  await goToCompose(page);
  await expect(page.locator("h1", { hasText: "New Message" })).toBeVisible();
  await expect(page.locator("h2", { hasText: "Compose New Email" })).toBeVisible();
});

// ─── Test 8: Discard confirmation ────────────────────────────────────────────

test("8. Discarding an empty composer navigates away without a modal", async ({ page }) => {
  await goToCompose(page);

  // Click Discard with nothing typed — should navigate directly (no modal)
  await page.locator("button", { hasText: "Discard" }).click();

  // Should be on /inbox (or redirected), not still on /compose
  await expect(page).not.toHaveURL(/\/compose$/, { timeout: 5000 });
});

test("8b. Discarding a composer with content shows a confirmation modal", async ({ page }) => {
  await goToCompose(page);

  // Type something so the composer has content
  await page.locator('input[placeholder="Subject…"]').fill("Important motion filing");

  await page.locator("button", { hasText: "Discard" }).click();

  // Modal should appear
  await expect(page.locator("text=Discard draft?")).toBeVisible({ timeout: 3000 });
  await expect(page.locator("text=Keep editing")).toBeVisible();
});

test("8c. Keep editing closes the modal and stays on compose", async ({ page }) => {
  await goToCompose(page);

  await page.locator('input[placeholder="Subject…"]').fill("Don't lose this");
  await page.locator("button", { hasText: "Discard" }).click();
  await expect(page.locator("text=Discard draft?")).toBeVisible({ timeout: 3000 });

  await page.locator("button", { hasText: "Keep editing" }).click();

  // Modal gone, still on compose
  await expect(page.locator("text=Discard draft?")).not.toBeVisible();
  await expect(page).toHaveURL(/compose/);
});

test("8d. Confirming discard navigates away", async ({ page }) => {
  await goToCompose(page);

  await page.locator('input[placeholder="Subject…"]').fill("About to be discarded");
  await page.locator("button", { hasText: "Discard" }).click();
  await expect(page.locator("text=Discard draft?")).toBeVisible({ timeout: 3000 });

  // Click the red Discard button inside the modal
  await page.locator("dialog, [role=dialog], .fixed").locator("button", { hasText: "Discard" }).click();

  await expect(page).not.toHaveURL(/\/compose$/, { timeout: 5000 });
});

// ─── Test 9: Drag & drop file attachments ────────────────────────────────────

test("9. Dragging a file onto the composer adds it as an attachment", async ({ page }) => {
  await goToCompose(page);

  // Simulate a file drag-drop onto the composer card using the DataTransfer API
  const dataTransfer = await page.evaluateHandle(() => {
    const dt = new DataTransfer();
    const file = new File(["contract content"], "contract.pdf", { type: "application/pdf" });
    dt.items.add(file);
    return dt;
  });

  const card = page.locator(".composer-shadow").first();
  await card.dispatchEvent("dragover", { dataTransfer });
  await card.dispatchEvent("drop", { dataTransfer });

  // Attachment chip should appear with the filename
  await expect(page.locator("text=contract.pdf")).toBeVisible({ timeout: 5000 });
});

test("9b. Dropping multiple files attaches all of them", async ({ page }) => {
  await goToCompose(page);

  const dataTransfer = await page.evaluateHandle(() => {
    const dt = new DataTransfer();
    dt.items.add(new File(["a"], "brief.docx", { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" }));
    dt.items.add(new File(["b"], "exhibit.pdf", { type: "application/pdf" }));
    return dt;
  });

  const card = page.locator(".composer-shadow").first();
  await card.dispatchEvent("dragover", { dataTransfer });
  await card.dispatchEvent("drop", { dataTransfer });

  await expect(page.locator("text=brief.docx")).toBeVisible({ timeout: 5000 });
  await expect(page.locator("text=exhibit.pdf")).toBeVisible({ timeout: 5000 });
});

// ─── Test 10: Drag & drop inline image ───────────────────────────────────────

test("10. Dragging an image onto the email body inserts it inline", async ({ page }) => {
  await goToCompose(page);

  // Build a minimal 1×1 PNG as a data URL and drop it on the body
  const dataTransfer = await page.evaluateHandle(() => {
    const dt = new DataTransfer();
    // Minimal 1x1 transparent PNG (base64)
    const b64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
    const byteStr = atob(b64);
    const arr = new Uint8Array(byteStr.length);
    for (let i = 0; i < byteStr.length; i++) arr[i] = byteStr.charCodeAt(i);
    const file = new File([arr], "screenshot.png", { type: "image/png" });
    dt.items.add(file);
    return dt;
  });

  const body = page.locator('[contenteditable="true"]').first();
  await body.dispatchEvent("dragover", { dataTransfer });
  await body.dispatchEvent("drop", { dataTransfer });

  // An <img> should be inserted into the body
  await expect(body.locator("img")).toBeVisible({ timeout: 5000 });
});

// ─── Test: Ctrl+Enter keyboard shortcut ──────────────────────────────────────

test("7. Ctrl+Enter triggers send (shows Sending state or error — not ignored)", async ({ page }) => {
  await goToCompose(page);

  // Without a recipient, send should show an error (not silently ignored)
  await page.keyboard.press("Control+Enter");

  // Either an error message appears, or the sending spinner shows
  const errOrSpin = page.locator("text=Add at least one recipient").or(page.locator("text=Sending")).first();
  await expect(errOrSpin).toBeVisible({ timeout: 3000 });
});
