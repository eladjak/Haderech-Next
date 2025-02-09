import { test, expect } from "@playwright/test";

test.describe("Forum", () => {
  test.beforeEach(async ({ page }) => {
    // Go to forum page
    await page.goto("/community");
  });

  test("should display forum posts", async ({ page }) => {
    // Check if posts are displayed
    await expect(page.getByRole("article")).toBeVisible();

    // Check if search input exists
    await expect(page.getByPlaceholder(/חיפוש בפורום/i)).toBeVisible();

    // Check if create post button exists
    await expect(page.getByRole("button", { name: /פוסט חדש/i })).toBeVisible();
  });

  test("should filter posts by search", async ({ page }) => {
    // Get initial post count
    const initialPosts = await page.getByRole("article").count();

    // Search for a specific post
    await page.getByPlaceholder(/חיפוש בפורום/i).fill("First Post");

    // Wait for search results
    await page.waitForTimeout(500);

    // Get filtered post count
    const filteredPosts = await page.getByRole("article").count();

    // Expect fewer posts after filtering
    expect(filteredPosts).toBeLessThan(initialPosts);
  });

  test("should create a new post", async ({ page }) => {
    // Click create post button
    await page.getByRole("button", { name: /פוסט חדש/i }).click();

    // Fill post form
    await page.getByPlaceholder(/כותרת הפוסט/i).fill("Test Post Title");
    await page.getByPlaceholder(/תוכן הפוסט/i).fill("Test post content");

    // Add tags
    const tagInput = page.getByPlaceholder(/הוסף תגיות/i);
    await tagInput.fill("test-tag");
    await tagInput.press("Enter");

    // Submit form
    await page.getByRole("button", { name: /פרסם/i }).click();

    // Wait for post to appear
    await expect(page.getByText("Test Post Title")).toBeVisible();
  });

  test("should interact with posts", async ({ page }) => {
    // Find first post
    const firstPost = page.getByRole("article").first();

    // Like post
    await firstPost.getByRole("button").filter({ hasText: /^\d+$/ }).click();

    // Save post
    await firstPost.getByRole("button", { name: /שמור/i }).click();

    // Share post
    await firstPost.getByRole("button", { name: /שתף/i }).click();

    // Verify clipboard contains share URL
    const clipboardText = await page.evaluate(() =>
      navigator.clipboard.readText(),
    );
    expect(clipboardText).toContain("/community/");
  });

  test("should handle empty search results", async ({ page }) => {
    // Search for nonexistent post
    await page.getByPlaceholder(/חיפוש בפורום/i).fill("nonexistent post");

    // Wait for search results
    await page.waitForTimeout(500);

    // Check for no results message
    await expect(page.getByText(/לא נמצאו פוסטים/i)).toBeVisible();
  });

  test("should be responsive", async ({ page }) => {
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.getByRole("article")).toBeVisible();

    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.getByRole("article")).toBeVisible();

    // Test desktop view
    await page.setViewportSize({ width: 1280, height: 800 });
    await expect(page.getByRole("article")).toBeVisible();
  });

  test("should handle post comments", async ({ page }) => {
    // Click on first post title to view details
    await page
      .getByRole("link")
      .filter({ hasText: /^[^פוסט חדש]/ })
      .first()
      .click();

    // Wait for comments section
    await expect(page.getByText(/תגובות/i)).toBeVisible();

    // Add a comment
    await page.getByPlaceholder(/הוסף תגובה/i).fill("Test comment");
    await page.getByRole("button", { name: /הוסף תגובה/i }).click();

    // Verify comment appears
    await expect(page.getByText("Test comment")).toBeVisible();
  });

  test("should handle authentication state", async ({ page }) => {
    // Test unauthenticated state
    await expect(page.getByRole("button", { name: /התחבר/i })).toBeVisible();

    // TODO: Add login test when auth is implemented
    // await page.getByRole('button', { name: /התחבר/i }).click();
    // ... login flow ...

    // Test authenticated state
    // await expect(page.getByRole('button', { name: /פוסט חדש/i })).toBeVisible();
  });
});
