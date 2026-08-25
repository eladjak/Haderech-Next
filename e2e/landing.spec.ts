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
    const hero = page.locator('section[aria-labelledby="hero-heading"]');
    const heading = hero.getByRole("heading", { level: 1 });
    await expect(heading).toBeVisible();
    await expect(heading).toContainText("הדרך שלך");
    await expect(heading).toContainText("לזוגיות שאתה ראוי לה");

    const description = hero.getByText(/תוכנית "הדרך" של אומנות הקשר/).first();
    await expect(description).toBeVisible();
  });

  test("should expose a single labelled hero region", async ({ page }) => {
    const hero = page.locator('section[aria-labelledby="hero-heading"]');
    await expect(hero).toHaveCount(1);
    await expect(hero.locator("#hero-heading")).toBeVisible();
  });

  test("should have CTA buttons in the hero", async ({ page }) => {
    // Primary CTA - "Start the journey"
    const hero = page.locator('section[aria-labelledby="hero-heading"]');
    const primaryCta = hero.getByRole("link", { name: "התחילו את המסע" });
    await expect(primaryCta).toBeVisible();

    const secondaryCta = hero.getByRole("link", { name: "בדקו זמינות" });
    await expect(secondaryCta).toBeVisible();
  });

  test("should display the stats counter bar", async ({ page }) => {
    await expect(page.locator("text=שבועות").first()).toBeVisible();
    await expect(page.locator("text=שיעורים").first()).toBeVisible();
    await expect(page.locator("text=מסמכי תרגול").first()).toBeVisible();
    await expect(page.locator("text=שלבי למידה").first()).toBeVisible();
  });

  test("should display the three values section", async ({ page }) => {
    const valuesHeading = page.locator("text=אמת. כלים. כבוד.");
    await expect(valuesHeading).toBeVisible();

    // Each value card
    const values = page.locator('section[aria-labelledby="values-heading"]');
    await expect(values.getByRole("heading", { level: 3, name: "אמת", exact: true })).toBeVisible();
    await expect(values.getByRole("heading", { level: 3, name: "כלים", exact: true })).toBeVisible();
    await expect(values.getByRole("heading", { level: 3, name: "כבוד", exact: true })).toBeVisible();
  });

  test('should display the "What you get" ecosystem section', async ({
    page,
  }) => {
    const sectionHeading = page.locator("text=לא סתם קורס - אקוסיסטם שלם");
    await expect(sectionHeading).toBeVisible();
  });

  test("should contain paid offers until product and payment approval", async ({ page }) => {
    const availabilityHeading = page.locator("h2", {
      hasText: "הרכישה המקוונת עדיין לא פתוחה",
    });
    await expect(availabilityHeading).toBeVisible();
    const availability = page.locator('section[aria-labelledby="availability-heading"]');
    await expect(availability.getByRole("link", { name: "בירור זמינות" })).toHaveAttribute("href", "/contact");
    await expect(availability.locator('a[href="/sign-up"]')).toHaveCount(0);
  });

  test("should display the final CTA section", async ({ page }) => {
    const ctaHeading = page.locator("h2", {
      hasText: "מוכנים להתחיל את המסע?",
    });
    await expect(ctaHeading).toBeVisible();

    const ctaButton = page.locator('section[aria-labelledby="cta-heading"]').getByRole("link", {
      name: "בדקו זמינות",
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
    const nav = page.getByRole("navigation", { name: "ניווט ראשי" });
    await expect(nav).toBeVisible();

    // Public nav links (visible without auth)
    await expect(nav.getByRole("link", { name: "קורסים", exact: true })).toBeVisible();
    await expect(nav.getByRole("link", { name: "בלוג", exact: true })).toBeVisible();
    await expect(nav.getByRole("link", { name: "מחירים", exact: true })).toBeVisible();
  });
});
