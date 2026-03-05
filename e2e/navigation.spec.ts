import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should display the header with logo", async ({ page }) => {
    const header = page.locator("header");
    await expect(header).toBeVisible();

    // Logo text
    const logoLink = header.locator('a[href="/"]');
    await expect(logoLink).toBeVisible();
    await expect(logoLink).toContainText("הדרך");
  });

  test("should have the logo link pointing to home", async ({ page }) => {
    const logoLink = page.locator('header a[href="/"]');
    await expect(logoLink).toHaveAttribute("href", "/");
  });

  test("should display desktop navigation links", async ({ page }) => {
    const nav = page.locator('nav[aria-label="ניווט ראשי"]');
    await expect(nav).toBeVisible();

    // Public navigation links
    await expect(nav.locator('a[href="/courses"]')).toContainText("קורסים");
    await expect(nav.locator('a[href="/blog"]')).toContainText("בלוג");
    await expect(nav.locator('a[href="/pricing"]')).toContainText("מחירים");
  });

  test("should have a mobile menu toggle button", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    const menuButton = page.locator('button[aria-label="תפריט ניווט"]');
    await expect(menuButton).toBeVisible();
    await expect(menuButton).toHaveAttribute("aria-expanded", "false");
  });

  test("should toggle mobile menu on button click", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    const menuButton = page.locator('button[aria-label="תפריט ניווט"]');
    const mobileMenu = page.locator("#mobile-nav-menu");

    // Initially hidden
    await expect(mobileMenu).toBeHidden();

    // Open menu
    await menuButton.click();
    await expect(mobileMenu).toBeVisible();
    await expect(menuButton).toHaveAttribute("aria-expanded", "true");

    // Close menu
    await menuButton.click();
    await expect(mobileMenu).toBeHidden();
    await expect(menuButton).toHaveAttribute("aria-expanded", "false");
  });

  test("should show mobile navigation links when menu is open", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    const menuButton = page.locator('button[aria-label="תפריט ניווט"]');
    await menuButton.click();

    const mobileMenu = page.locator("#mobile-nav-menu");
    await expect(mobileMenu).toBeVisible();

    // Public nav links visible in mobile menu
    await expect(mobileMenu.locator('a[href="/courses"]')).toContainText(
      "קורסים",
    );
    await expect(mobileMenu.locator('a[href="/blog"]')).toContainText("בלוג");
    await expect(mobileMenu.locator('a[href="/pricing"]')).toContainText(
      "מחירים",
    );
  });

  test("should navigate to the courses page", async ({ page }) => {
    await page.locator('header a[href="/courses"]').click();
    await expect(page).toHaveURL("/courses");
  });

  test("should navigate to the blog page", async ({ page }) => {
    await page.locator('header a[href="/blog"]').click();
    await expect(page).toHaveURL("/blog");
  });

  test("should navigate to the pricing page", async ({ page }) => {
    await page.locator('header a[href="/pricing"]').click();
    await expect(page).toHaveURL("/pricing");
  });

  test("should have footer navigation links", async ({ page }) => {
    const footer = page.locator("footer");

    // Program links
    await expect(footer.locator('a[href="/courses"]')).toBeVisible();
    await expect(footer.locator('a[href="/blog"]')).toBeVisible();
    await expect(footer.locator('a[href="/dashboard"]')).toBeVisible();

    // Tools links
    await expect(footer.locator('a[href="/tools"]')).toBeVisible();
    await expect(footer.locator('a[href="/resources"]')).toBeVisible();

    // Info links
    await expect(footer.locator('a[href="/about"]')).toBeVisible();
    await expect(footer.locator('a[href="/help"]')).toBeVisible();
    await expect(footer.locator('a[href="/contact"]')).toBeVisible();
  });
});
