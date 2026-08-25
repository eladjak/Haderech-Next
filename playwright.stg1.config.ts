import { defineConfig, devices } from "@playwright/test";
import { validateStg1PreviewUrl } from "./scripts/lib/stg1-clerk-plan.mjs";

const baseURL = validateStg1PreviewUrl(process.env.STG1_BASE_URL ?? "");

export default defineConfig({
  testDir: "./stg1-e2e",
  testMatch: "access-matrix.spec.ts",
  fullyParallel: false,
  forbidOnly: true,
  retries: 0,
  workers: 1,
  reporter: "line",
  timeout: 240_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL,
    trace: "off",
    screenshot: "off",
    video: "off",
    locale: "he-IL",
    timezoneId: "Asia/Jerusalem",
  },
  projects: [
    {
      name: "stg1-chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
