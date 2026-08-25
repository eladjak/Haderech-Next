import { test, expect } from "@playwright/test";

const PUBLIC_ROUTES = ["/", "/courses", "/about", "/faq", "/help", "/pricing"];

test.describe("Public accessibility contracts", () => {
  test("declares Hebrew RTL and exposes one main landmark", async ({ page }) => {
    for (const route of PUBLIC_ROUTES) {
      await page.goto(route);
      await expect(page.locator("html")).toHaveAttribute("lang", "he");
      await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
      await expect(page.getByRole("main")).toHaveCount(1);
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    }
  });

  test("skip link is first in keyboard order and moves focus to content", async ({ page }) => {
    await page.goto("/");
    const skipLink = page.getByRole("link", { name: "דלג לתוכן הראשי" });

    await page.keyboard.press("Tab");
    await expect(skipLink).toBeFocused();
    await expect(skipLink).toHaveCSS("outline-width", "3px");

    await page.keyboard.press("Enter");
    await expect(page.locator("main#main-content")).toBeFocused();
  });

  test("course search and filter controls have names and state", async ({ page }) => {
    await page.goto("/courses");
    await expect(page.getByRole("searchbox", { name: "חיפוש קורסים" })).toBeVisible();

    const filters = page.getByRole("group", { name: "סינון קורסים" });
    await expect(filters).toBeVisible();
    await expect(filters.getByRole("button", { name: "הכל", exact: true })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
  });

  test("closed mobile navigation is removed from focus and Escape restores focus", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    const trigger = page.locator('button[aria-controls="mobile-nav-menu"]');
    const menuContainer = page.locator("#mobile-nav-menu");
    await expect(menuContainer).toHaveAttribute("hidden", "");
    await expect(page.getByRole("navigation", { name: "תפריט ניווט נייד" })).toHaveCount(0);

    await trigger.click();
    const mobileNavigation = page.getByRole("navigation", { name: "תפריט ניווט נייד" });
    await expect(mobileNavigation).toBeVisible();
    await expect(mobileNavigation.getByRole("link", { name: "חיפוש" })).toBeFocused();

    await page.keyboard.press("Escape");
    await expect(menuContainer).toHaveAttribute("hidden", "");
    await expect(trigger).toBeFocused();
  });
});
