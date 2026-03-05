import { test, expect } from "@playwright/test";

test.describe("Tools Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/tools");
  });

  test("should load the tools page", async ({ page }) => {
    await expect(page).toHaveURL("/tools");
  });

  test("should display the page heading", async ({ page }) => {
    const heading = page.locator("h1");
    await expect(heading).toBeVisible();
    await expect(heading).toContainText("כלי דייטינג");
  });

  test("should display the page description", async ({ page }) => {
    const description = page.locator(
      "text=כלים חכמים שעוזרים לך בכל שלב בדרך לזוגיות",
    );
    await expect(description).toBeVisible();
  });

  test("should display AI chat and simulator quick-access links", async ({
    page,
  }) => {
    const chatLink = page.locator('a[href="/chat"]', {
      hasText: "צ'אט AI מאמן",
    });
    await expect(chatLink).toBeVisible();

    const simulatorLink = page.locator('a[href="/simulator"]', {
      hasText: "סימולטור דייטים",
    });
    await expect(simulatorLink).toBeVisible();
  });

  test("should display available tools with links", async ({ page }) => {
    // Profile builder - available tool
    const profileBuilder = page.locator("h3", { hasText: "בונה הפרופיל" });
    await expect(profileBuilder).toBeVisible();

    // Should have a link to the tool
    const profileLink = page.locator('a[href="/tools/profile-builder"]');
    await expect(profileLink).toBeVisible();
    await expect(profileLink).toContainText("התחל");

    // Conversation starters - available tool
    const conversationStarters = page.locator("h3", {
      hasText: "פותחי שיחה",
    });
    await expect(conversationStarters).toBeVisible();

    const conversationLink = page.locator(
      'a[href="/tools/conversation-starters"]',
    );
    await expect(conversationLink).toBeVisible();

    // Values quiz - available tool
    const valuesQuiz = page.locator("h3", { hasText: "מבחן ערכים" });
    await expect(valuesQuiz).toBeVisible();

    const valuesLink = page.locator('a[href="/tools/values-quiz"]');
    await expect(valuesLink).toBeVisible();
  });

  test("should display coming-soon tools without active links", async ({
    page,
  }) => {
    // Photo analyzer - coming soon
    const photoAnalyzer = page.locator("h3", { hasText: "ניתוח תמונות" });
    await expect(photoAnalyzer).toBeVisible();

    // Date planner - coming soon
    const datePlanner = page.locator("h3", { hasText: "מתכנן דייטים" });
    await expect(datePlanner).toBeVisible();

    // Date report - coming soon
    const dateReport = page.locator("h3", { hasText: "ניתוח דייט" });
    await expect(dateReport).toBeVisible();

    // Coming soon text should be visible for unavailable tools
    const comingSoonTexts = page.locator("text=יהיה זמין בקרוב");
    await expect(comingSoonTexts).toHaveCount(3);
  });

  test("should display badges on tool cards", async ({ page }) => {
    // "New" badges on available tools
    const newBadges = page.locator("text=חדש");
    expect(await newBadges.count()).toBeGreaterThanOrEqual(2);

    // "Coming soon" badges
    const comingSoonBadges = page.locator("text=בקרוב");
    expect(await comingSoonBadges.count()).toBeGreaterThanOrEqual(3);
  });

  test("should display all six tool cards", async ({ page }) => {
    const toolCards = page.locator("h3").filter({
      hasText:
        /בונה הפרופיל|ניתוח תמונות|מתכנן דייטים|ניתוח דייט|פותחי שיחה|מבחן ערכים/,
    });
    await expect(toolCards).toHaveCount(6);
  });

  test("should have header and footer", async ({ page }) => {
    await expect(page.locator("header")).toBeVisible();
    await expect(page.locator("footer")).toBeVisible();
  });
});
