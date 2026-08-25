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

  test("should expose keyboard-operable pressed-state filters", async ({ page }) => {
    const filters = page.getByRole("group", { name: "סינון קורסים" });
    await expect(filters).toBeVisible();

    const all = filters.getByRole("button", { name: "הכל", exact: true });
    const beginners = filters.getByRole("button", { name: "מתחילים", exact: true });
    await expect(all).toHaveAttribute("aria-pressed", "true");
    await beginners.focus();
    await page.keyboard.press("Enter");
    await expect(beginners).toHaveAttribute("aria-pressed", "true");
    await expect(all).toHaveAttribute("aria-pressed", "false");
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
    await expect(page.getByRole("banner").first()).toBeVisible();
    await expect(page.getByRole("contentinfo").first()).toBeVisible();
  });

  test("should display main content area", async ({ page }) => {
    const main = page.locator("main#main-content");
    await expect(main).toBeVisible();
    await expect(main).toHaveAttribute("tabindex", "-1");
  });
});
