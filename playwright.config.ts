import { defineConfig, devices } from "@playwright/test";

/**
 * E2E tests run against the BUILT app (next build + next start).
 * Never run against dev server — per CodeBakers protocol.
 *
 * Auth: auto-generated via globalSetup (Supabase Admin magic-link).
 * No manual cookie copying needed. Session refreshed on every test run.
 *
 * Requires .env.local: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 * Optional .env.local: TEST_USER_EMAIL (default: info@tonnerow.com)
 */
export default defineConfig({
  testDir: "./tests/e2e",
  globalSetup: "./tests/e2e/auth/global-setup.ts",
  fullyParallel: false, // composer tests mutate state — run serially
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [["list"], ["html", { outputFolder: "playwright-report", open: "never" }]],

  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:4000",
    storageState: process.env.PLAYWRIGHT_STORAGE_STATE ?? "tests/e2e/auth/session.json",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  // App must be running before tests. Start with: npm run build && npm start
  // (Do NOT use webServer here — E2E runs against built app only)
});
