import { test, expect } from "@playwright/test";

test.describe("Landing Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should load the landing page", async ({ page }) => {
    await expect(page).toHaveURL("/");
  });

  test("should display the hero section with Hebrew content", async ({
    page,
  }) => {
    // Main heading
    const heading = page.locator("h1");
    await expect(heading).toBeVisible();
    await expect(heading).toContainText("הדרך שלך");
    await expect(heading).toContainText("לזוגיות שאתה ראוי לה");

    // Subheading / description
    const description = page.locator("text=תוכנית \"הדרך\" של אומנות הקשר");
    await expect(description).toBeVisible();
  });

  test("should display the badge with couple count", async ({ page }) => {
    const badge = page.locator("text=זוגות כבר מצאו אהבה");
    await expect(badge).toBeVisible();
  });

  test("should have CTA buttons in the hero", async ({ page }) => {
    // Primary CTA - "Start the journey"
    const primaryCta = page.locator('a[href="/courses"]', {
      hasText: "התחילו את המסע",
    });
    await expect(primaryCta).toBeVisible();

    // Secondary CTA - "Start for free"
    const secondaryCta = page.locator('a[href="/sign-up"]', {
      hasText: "התחל בחינם",
    });
    await expect(secondaryCta).toBeVisible();
  });

  test("should display the stats counter bar", async ({ page }) => {
    await expect(page.locator("text=קורסים").first()).toBeVisible();
    await expect(page.locator("text=שיעורים").first()).toBeVisible();
    await expect(page.locator("text=תלמידים").first()).toBeVisible();
    await expect(page.locator("text=שביעות רצון").first()).toBeVisible();
  });

  test("should display the three values section", async ({ page }) => {
    const valuesHeading = page.locator("text=אמת. כלים. כבוד.");
    await expect(valuesHeading).toBeVisible();

    // Each value card
    await expect(page.locator("h3", { hasText: "אמת" })).toBeVisible();
    await expect(page.locator("h3", { hasText: "כלים" })).toBeVisible();
    await expect(page.locator("h3", { hasText: "כבוד" })).toBeVisible();
  });

  test('should display the "What you get" ecosystem section', async ({
    page,
  }) => {
    const sectionHeading = page.locator("text=לא סתם קורס - אקוסיסטם שלם");
    await expect(sectionHeading).toBeVisible();
  });

  test("should display the pricing preview section", async ({ page }) => {
    const pricingHeading = page.locator("h2", {
      hasText: "בחר את המסלול שלך",
    });
    await expect(pricingHeading).toBeVisible();

    // Three pricing tiers
    await expect(page.locator("text=טעימה")).toBeVisible();
    await expect(page.locator("text=משנה")).toBeVisible();
    await expect(page.locator("text=מוביל")).toBeVisible();
  });

  test("should display the final CTA section", async ({ page }) => {
    const ctaHeading = page.locator("h2", {
      hasText: "מוכנים להתחיל את המסע?",
    });
    await expect(ctaHeading).toBeVisible();

    const ctaButton = page.locator("section >> a[href='/sign-up']", {
      hasText: "התחל בחינם",
    });
    await expect(ctaButton.first()).toBeVisible();
  });

  test("should display the footer", async ({ page }) => {
    const footer = page.locator("footer");
    await expect(footer).toBeVisible();
    await expect(footer).toContainText("הדרך - אומנות הקשר");
    await expect(footer).toContainText("כל הזכויות שמורות");
  });

  test("should have navigation links in the header", async ({ page }) => {
    const header = page.locator("header");
    await expect(header).toBeVisible();

    // Public nav links (visible without auth)
    await expect(header.locator('a[href="/courses"]')).toBeVisible();
    await expect(header.locator('a[href="/blog"]')).toBeVisible();
    await expect(header.locator('a[href="/pricing"]')).toBeVisible();
  });
});
