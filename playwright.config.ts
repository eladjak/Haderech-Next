import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";

// קריאת משתני סביבה
dotenv.config({ path: ".env.test" });

// הגדרת הקונפיגורציה
export default defineConfig({
  // תיקיית הטסטים
  testDir: "./src/tests/e2e",

  // מספר הניסיונות המקסימלי לכל טסט
  retries: process.env.CI ? 2 : 0,

  // מספר העובדים המקסימלי
  workers: process.env.CI ? 1 : undefined,

  // זמן מקסימלי לכל טסט
  timeout: 30000,

  // הגדרות דיווח
  reporter: [
    ["html"],
    ["list"],
    ["junit", { outputFile: "test-results/junit.xml" }],
  ],

  // הגדרות שימוש
  use: {
    // בסיס URL לכל הבקשות
    baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",

    // צילום מסך בכישלון
    screenshot: "only-on-failure",

    // הקלטת וידאו בכישלון
    video: "retain-on-failure",

    // איסוף עקבות בכישלון
    trace: "retain-on-failure",

    // הגדרות נוספות
    actionTimeout: 10000,
    navigationTimeout: 15000,

    // הגדרות דפדפן
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,

    // הגדרות נגישות
    bypassCSP: true,
    hasTouch: true,
    isMobile: false,

    // הגדרות לוקליזציה
    locale: "he-IL",
    timezoneId: "Asia/Jerusalem",
  },

  // פרויקטים
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "mobile-safari",
      use: { ...devices["iPhone 12"] },
    },
  ],

  // הגדרות בנייה
  webServer: {
    command: "pnpm run dev",
    port: 3000,
    timeout: 120000,
    reuseExistingServer: !process.env.CI,
  },

  // הגדרות תיקיות
  outputDir: "test-results/",
  snapshotDir: "test-snapshots/",

  // הגדרות גלובליות
  globalSetup: require.resolve("./src/tests/e2e/global-setup"),
  globalTeardown: require.resolve("./src/tests/e2e/global-teardown"),

  // התעלמות מקבצים
  testIgnore: ["**/node_modules/**", "**/.next/**"],

  // תבניות שם לצילומי מסך
  snapshotPathTemplate: "{testDir}/{testFilePath}/{arg}-{projectName}{ext}",
});
