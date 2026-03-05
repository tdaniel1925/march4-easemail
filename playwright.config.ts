import { defineConfig, devices } from "@playwright/test";

/**
 * E2E tests run against the BUILT app (next build + next start).
 * Never run against dev server — per CodeBakers protocol.
 *
 * Auth: cookie injection via PLAYWRIGHT_STORAGE_STATE env var.
 * See tests/e2e/README.md for how to export your session cookie.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false, // composer tests mutate state — run serially
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [["list"], ["html", { outputFolder: "playwright-report", open: "never" }]],

  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    // Inject saved auth session — set PLAYWRIGHT_STORAGE_STATE to path of your exported cookie file
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
