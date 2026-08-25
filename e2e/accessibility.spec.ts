import { test, expect } from "@playwright/test";
import { source as axeSource } from "axe-core";

const PUBLIC_ROUTES = [
  "/",
  "/courses",
  "/about",
  "/faq",
  "/help",
  "/pricing",
  "/contact",
  "/privacy",
  "/terms",
  "/accessibility",
];

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
    await expect(skipLink).toHaveAttribute("data-hydrated", "true");

    await page.keyboard.press("Tab");
    await expect(skipLink).toBeFocused();
    await expect(skipLink).toHaveCSS("outline-width", "3px");

    await page.keyboard.press("Enter");
    await expect(page.locator("main#main-content")).toBeFocused();
  });

  test("public and auth surfaces have no automated WCAG A/AA violations", async ({ page }) => {
    for (const route of [...PUBLIC_ROUTES, "/sign-in", "/sign-up"]) {
      await page.goto(route);
      await expect(page.getByRole("link", { name: "דלג לתוכן הראשי" })).toHaveAttribute(
        "data-hydrated",
        "true",
      );
      // Exercise the real `whileInView` path before scanning the complete DOM.
      // Axe otherwise measures off-screen Framer Motion elements in their
      // transient fade-in state, which is not a user-visible resting state.
      await page.evaluate(async () => {
        const viewportStep = Math.max(Math.floor(window.innerHeight * 0.75), 400);
        const pageHeight = document.documentElement.scrollHeight;
        for (let top = 0; top < pageHeight; top += viewportStep) {
          window.scrollTo({ top, behavior: "instant" });
          await new Promise((resolve) => window.setTimeout(resolve, 120));
        }
        window.scrollTo({ top: pageHeight, behavior: "instant" });
        await new Promise((resolve) => window.setTimeout(resolve, 700));
      });
      await page.addScriptTag({ content: axeSource });
      const violations = await page.evaluate(async () => {
        const axe = (window as typeof window & {
          axe: { run: (root: Document, options: object) => Promise<{ violations: unknown[] }> };
        }).axe;
        const result = await axe.run(document, {
          runOnly: {
            type: "tag",
            values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"],
          },
        });
        return result.violations;
      });
      expect(violations, `${route} has Axe violations`).toEqual([]);
    }
  });

  test("Clerk auth cards hydrate without browser page errors", async ({ page }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));

    for (const route of ["/sign-in", "/sign-up"]) {
      await page.goto(route);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    }

    expect(pageErrors).toEqual([]);
  });

  test("route metadata does not canonicalize public pages to home", async ({ page }) => {
    for (const route of ["/about", "/courses", "/faq", "/help", "/pricing", "/contact"]) {
      await page.goto(route);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        "href",
        new RegExp(`${route.replace("/", "\\/")}$`)
      );
    }
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
