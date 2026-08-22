import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  // Keep tests inside each file ordered. Concurrent route compilation in the
  // Next dev server made same-file navigation checks intermittently time out.
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 4,
  reporter: "html",
  expect: {
    timeout: 10_000,
  },

  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    locale: "he-IL",
    timezoneId: "Asia/Jerusalem",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  webServer: {
    // Frontend-only E2E must not run `npm run dev`, which first mutates a
    // Convex deployment. Public/demo-safe routes only need the Next server.
    command: "npx next dev -p 3000",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
