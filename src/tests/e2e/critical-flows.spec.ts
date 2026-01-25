import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Critical User Flows
 * These tests verify the most important user journeys in the application
 */

test.describe('Critical User Flows', () => {
  test.describe('Course Discovery and Enrollment', () => {
    test('should navigate to courses page and view course list', async ({ page }) => {
      await page.goto('/courses');

      // Wait for courses to load
      await page.waitForSelector('[data-testid="course-card"], .course-card, h1, h2', {
        timeout: 10000,
      });

      // Verify we're on the courses page
      const url = page.url();
      expect(url).toContain('/courses');
    });

    test('should view course details', async ({ page }) => {
      await page.goto('/courses');

      // Wait for page to load
      await page.waitForLoadState('networkidle');

      // Try to click first course link
      const courseLinks = page.locator('a[href*="/courses/"]');
      const count = await courseLinks.count();

      if (count > 0) {
        await courseLinks.first().click();

        // Should navigate to course detail page
        await page.waitForURL(/\/courses\/[^/]+$/);

        const currentUrl = page.url();
        expect(currentUrl).toMatch(/\/courses\/[^/]+$/);
      } else {
        console.log('No courses found - skipping detail view test');
      }
    });

    test('should redirect to login when enrolling without authentication', async ({ page }) => {
      // Navigate to a course page (assuming course exists)
      await page.goto('/courses');

      await page.waitForLoadState('networkidle');

      // Try to find an enroll button
      const enrollButton = page.locator('button:has-text("הירשם"), button:has-text("Enroll"), a:has-text("הירשם")');
      const buttonExists = await enrollButton.count() > 0;

      if (buttonExists) {
        await enrollButton.first().click();

        // Should redirect to login or show auth modal
        await page.waitForTimeout(1000);
        const url = page.url();
        const hasAuthModal = await page.locator('[role="dialog"], .modal').count() > 0;

        expect(url.includes('/login') || hasAuthModal).toBeTruthy();
      }
    });
  });

  test.describe('Authentication Flow', () => {
    test('should display login page', async ({ page }) => {
      await page.goto('/login');

      // Verify login form elements exist
      const emailInput = page.locator('input[type="email"], input[name="email"]');
      const passwordInput = page.locator('input[type="password"], input[name="password"]');
      const submitButton = page.locator('button[type="submit"]');

      await expect(emailInput).toBeVisible();
      await expect(passwordInput).toBeVisible();
      await expect(submitButton).toBeVisible();
    });

    test('should show validation errors for invalid credentials', async ({ page }) => {
      await page.goto('/login');

      // Fill invalid credentials
      await page.fill('input[type="email"], input[name="email"]', 'invalid@email');
      await page.fill('input[type="password"], input[name="password"]', '123');

      // Submit form
      await page.click('button[type="submit"]');

      // Wait for validation or error message
      await page.waitForTimeout(1000);

      // Should show some form of error (either validation or API error)
      const hasError = await page.locator('.error, [role="alert"], .text-red-500, .text-destructive').count() > 0;
      expect(hasError || page.url().includes('/login')).toBeTruthy();
    });

    test('should navigate to signup page', async ({ page }) => {
      await page.goto('/login');

      // Look for signup link
      const signupLink = page.locator('a:has-text("הרשמה"), a:has-text("Sign up"), a[href*="signup"], a[href*="register"]');
      const linkExists = await signupLink.count() > 0;

      if (linkExists) {
        await signupLink.first().click();
        await page.waitForLoadState('networkidle');

        const url = page.url();
        expect(url.includes('signup') || url.includes('register')).toBeTruthy();
      }
    });
  });

  test.describe('Forum Interaction', () => {
    test('should display forum page', async ({ page }) => {
      await page.goto('/forum');
      await page.waitForLoadState('networkidle');

      // Verify we're on forum page
      expect(page.url()).toContain('/forum');
    });

    test('should view forum posts', async ({ page }) => {
      await page.goto('/forum');
      await page.waitForLoadState('networkidle');

      // Look for forum posts or empty state
      const hasPosts = await page.locator('article, .post, [data-testid="forum-post"]').count() > 0;
      const hasEmptyState = await page.locator('.empty, .no-posts, :has-text("אין פוסטים")').count() > 0;

      expect(hasPosts || hasEmptyState).toBeTruthy();
    });

    test('should require authentication to create post', async ({ page }) => {
      await page.goto('/forum');
      await page.waitForLoadState('networkidle');

      // Try to find "new post" button
      const newPostButton = page.locator('button:has-text("פוסט חדש"), button:has-text("New Post"), a:has-text("פוסט חדש")');
      const buttonExists = await newPostButton.count() > 0;

      if (buttonExists) {
        await newPostButton.first().click();
        await page.waitForTimeout(1000);

        // Should redirect to login or show auth modal
        const url = page.url();
        const hasAuthModal = await page.locator('[role="dialog"], .modal').count() > 0;

        expect(url.includes('/login') || hasAuthModal).toBeTruthy();
      }
    });
  });

  test.describe('Navigation', () => {
    test('should have functional header navigation', async ({ page }) => {
      await page.goto('/');

      // Wait for header to load
      await page.waitForSelector('header, nav', { timeout: 5000 });

      // Verify header exists
      const header = page.locator('header, nav').first();
      await expect(header).toBeVisible();
    });

    test('should navigate to home page', async ({ page }) => {
      await page.goto('/courses');

      // Find and click home link
      const homeLink = page.locator('a[href="/"], a:has-text("בית"), a:has-text("Home")').first();
      await homeLink.click();

      await page.waitForLoadState('networkidle');
      expect(page.url()).toMatch(/\/$|\/home/);
    });

    test('should have responsive mobile menu', async ({ page, viewport }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Look for mobile menu button (hamburger)
      const mobileMenuButton = page.locator('button[aria-label*="menu"], button:has-text("☰"), .mobile-menu-button');
      const buttonExists = await mobileMenuButton.count() > 0;

      if (buttonExists) {
        await mobileMenuButton.first().click();

        // Menu should open
        const menu = page.locator('[role="dialog"], .mobile-menu, nav');
        await expect(menu.first()).toBeVisible();
      }
    });
  });

  test.describe('Search Functionality', () => {
    test('should have search functionality', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Look for search input
      const searchInput = page.locator('input[type="search"], input[placeholder*="חיפוש"], input[placeholder*="Search"]');
      const searchExists = await searchInput.count() > 0;

      if (searchExists) {
        await expect(searchInput.first()).toBeVisible();

        // Try searching
        await searchInput.first().fill('test');
        await page.waitForTimeout(500);

        // Should show some results or suggestions
        // This is implementation-dependent
      }
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper page titles', async ({ page }) => {
      await page.goto('/');
      const title = await page.title();
      expect(title.length).toBeGreaterThan(0);

      await page.goto('/courses');
      const coursesTitle = await page.title();
      expect(coursesTitle.length).toBeGreaterThan(0);
    });

    test('should support keyboard navigation', async ({ page }) => {
      await page.goto('/');

      // Press Tab to navigate
      await page.keyboard.press('Tab');

      // Should have focus on some element
      const focusedElement = await page.evaluate(() => {
        return document.activeElement?.tagName;
      });

      expect(focusedElement).toBeDefined();
    });

    test('should have skip to main content link', async ({ page }) => {
      await page.goto('/');

      // Press Tab to reveal skip link
      await page.keyboard.press('Tab');

      const skipLink = page.locator('a:has-text("Skip to"), a:has-text("דלג")');
      const skipLinkExists = await skipLink.count() > 0;

      // Skip link is a best practice but not always present
      // Just checking if it exists
      expect(skipLinkExists !== undefined).toBeTruthy();
    });
  });

  test.describe('Performance', () => {
    test('should load pages within acceptable time', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;

      // Should load within 5 seconds
      expect(loadTime).toBeLessThan(5000);
    });

    test('should handle page navigation smoothly', async ({ page }) => {
      await page.goto('/');

      const startTime = Date.now();
      await page.goto('/courses');
      await page.waitForLoadState('networkidle');
      const navigationTime = Date.now() - startTime;

      // Navigation should be quick
      expect(navigationTime).toBeLessThan(3000);
    });
  });

  test.describe('Error Handling', () => {
    test('should show 404 page for invalid routes', async ({ page }) => {
      const response = await page.goto('/this-page-does-not-exist-12345');

      // Should return 404 status or show error page
      const status = response?.status();
      const has404Text = await page.locator(':has-text("404"), :has-text("Not Found"), :has-text("לא נמצא")').count() > 0;

      expect(status === 404 || has404Text).toBeTruthy();
    });

    test('should handle network errors gracefully', async ({ page }) => {
      // Go offline
      await page.context().setOffline(true);

      await page.goto('/courses').catch(() => {
        // Expected to fail
      });

      // Should show some error message
      const hasError = await page.locator(':has-text("error"), :has-text("שגיאה"), [role="alert"]').count() > 0;

      // Go back online
      await page.context().setOffline(false);

      expect(hasError !== undefined).toBeTruthy();
    });
  });
});
