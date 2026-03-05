import { test, expect } from "@playwright/test";

test.describe("Courses Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/courses");
  });

  test("should load the courses page", async ({ page }) => {
    await expect(page).toHaveURL("/courses");
  });

  test("should display the page heading in Hebrew", async ({ page }) => {
    const heading = page.locator("h1");
    await expect(heading).toBeVisible();
    await expect(heading).toContainText("הקורסים שלנו");
  });

  test("should display the page description", async ({ page }) => {
    const description = page.locator(
      "text=קורסים מקצועיים בתחום התקשורת הזוגית והאישית",
    );
    await expect(description).toBeVisible();
  });

  test("should have a search input", async ({ page }) => {
    const searchInput = page.locator('input[aria-label="חיפוש קורסים"]');
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toHaveAttribute("placeholder", "חפש קורס...");
  });

  test("should allow typing in the search field", async ({ page }) => {
    const searchInput = page.locator('input[aria-label="חיפוש קורסים"]');
    await searchInput.fill("תקשורת");
    await expect(searchInput).toHaveValue("תקשורת");
  });

  test("should have a level filter dropdown", async ({ page }) => {
    const levelFilter = page.locator('select[aria-label="סינון לפי רמה"]');
    await expect(levelFilter).toBeVisible();

    // Should have the default "all levels" option
    await expect(levelFilter.locator("option", { hasText: "כל הרמות" })).toHaveCount(1);

    // Should have level options
    await expect(levelFilter.locator("option", { hasText: "מתחילים" })).toHaveCount(1);
    await expect(levelFilter.locator("option", { hasText: "מתקדמים" })).toHaveCount(1);
    await expect(levelFilter.locator("option", { hasText: "מומחים" })).toHaveCount(1);
  });

  test("should display course cards or empty state", async ({ page }) => {
    // Either course cards are present or the empty/loading state is visible
    const courseGrid = page.locator(
      ".grid.gap-6.md\\:grid-cols-2.lg\\:grid-cols-3",
    );
    const emptyState = page.locator("text=עדיין אין קורסים זמינים");
    const loadingState = page.locator(".animate-pulse").first();

    // At least one of these should be visible
    const hasGrid = await courseGrid.isVisible().catch(() => false);
    const hasEmpty = await emptyState.isVisible().catch(() => false);
    const hasLoading = await loadingState.isVisible().catch(() => false);

    expect(hasGrid || hasEmpty || hasLoading).toBeTruthy();
  });

  test("should have header and footer", async ({ page }) => {
    await expect(page.locator("header")).toBeVisible();
    await expect(page.locator("footer")).toBeVisible();
  });

  test("should display main content area", async ({ page }) => {
    const main = page.locator("main#main-content");
    await expect(main).toBeVisible();
  });
});
