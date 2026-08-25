import { test, expect } from "@playwright/test";

async function skipSignedOutContractInDemo(page: import("@playwright/test").Page) {
  // The demo badge is rendered after hydration. An immediate `isVisible()` can
  // race that render and accidentally exercise a signed-out contract while the
  // app is intentionally running with its demo auth bypass enabled.
  const demoMode = await page
    .getByText("Demo Admin", { exact: true })
    .waitFor({ state: "visible", timeout: 3_000 })
    .then(() => true)
    .catch(() => false);
  test.skip(demoMode, "Signed-out auth contracts require DEMO_MODE=false");
}

test.describe("Authentication Flow", () => {
  test("should display sign-in and sign-up buttons for unauthenticated users", async ({
    page,
  }) => {
    await page.goto("/");
    await skipSignedOutContractInDemo(page);

    const header = page.locator("header");

    // Desktop auth buttons (hidden on mobile, visible on desktop)
    const signInButton = header.locator("button", { hasText: "התחברות" });
    const signUpButton = header.locator("button", { hasText: "הרשמה חינמית" });

    // On desktop viewport, these should be present in DOM
    expect(await signInButton.count()).toBeGreaterThanOrEqual(1);
    expect(await signUpButton.count()).toBeGreaterThanOrEqual(1);
  });

  test("should show sign-in and sign-up buttons in mobile menu", async ({
    page,
  }) => {
    await page.goto("/");
    await skipSignedOutContractInDemo(page);
    await page.setViewportSize({ width: 375, height: 667 });

    // Open mobile menu
    const menuButton = page.locator('button[aria-controls="mobile-nav-menu"]');
    await menuButton.click();

    const mobileMenu = page.locator("#mobile-nav-menu");
    await expect(mobileMenu).toBeVisible();

    // Mobile auth buttons
    const mobileSignIn = mobileMenu.locator("button", {
      hasText: "התחברות",
    });
    const mobileSignUp = mobileMenu.locator("button", { hasText: "הרשמה" });

    await expect(mobileSignIn).toBeVisible();
    await expect(mobileSignUp).toBeVisible();
  });

  test("should redirect unauthenticated users from dashboard to sign-in", async ({
    page,
  }) => {
    await page.goto("/");
    await skipSignedOutContractInDemo(page);
    await page.goto("/dashboard");

    // This assertion must fail if protected dashboard content is reachable.
    // Demo-mode E2E runs should exclude this auth contract explicitly rather
    // than treating an auth bypass as a valid production outcome.
    await expect(page).not.toHaveURL(/\/dashboard(?:\/|\?|#|$)/);
    await expect(
      page.getByRole("heading", { name: /^(האזור שלי|שלום)/ }).first()
    ).not.toBeVisible();
  });

  test("should keep landing CTAs on the approved availability path", async ({
    page,
  }) => {
    await page.goto("/");

    const hero = page.locator('section[aria-labelledby="hero-heading"]');
    await expect(hero.getByRole("link", { name: "בדקו זמינות" })).toHaveAttribute("href", "/contact");
    await expect(hero.locator('a[href="/sign-up"]')).toHaveCount(0);
  });

  test("should have a dedicated sign-in page", async ({ page }) => {
    // The (auth)/sign-in route should exist
    const response = await page.goto("/sign-in");
    expect(response?.status()).toBeLessThan(500);
  });

  test("should have a dedicated sign-up page", async ({ page }) => {
    // The (auth)/sign-up route should exist
    const response = await page.goto("/sign-up");
    expect(response?.status()).toBeLessThan(500);
  });

  test("should not show authenticated-only nav links when signed out", async ({
    page,
  }) => {
    await page.goto("/");
    await skipSignedOutContractInDemo(page);

    const nav = page.locator('nav[aria-label="ניווט ראשי"]');

    // These links should only appear for signed-in users
    // They are inside <SignedIn> component so should not render
    const dashboardLink = nav.locator('a[href="/dashboard"]');
    const communityLink = nav.locator('a[href="/community"]');
    const chatLink = nav.locator('a[href="/chat"]');

    await expect(dashboardLink).toHaveCount(0);
    await expect(communityLink).toHaveCount(0);
    await expect(chatLink).toHaveCount(0);
  });
});
