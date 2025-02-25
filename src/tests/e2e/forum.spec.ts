import { expect, test } from "@playwright/test";

test.describe("Forum E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    // התחברות לפני כל טסט
    await page.goto("/auth/login");
    await page.fill('input[type="email"]', "test@example.com");
    await page.fill('input[type="password"]', "password123");
    await page.click('button[type="submit"]');
    await page.waitForURL("/dashboard");
  });

  test("צפייה בפורום", async ({ page }) => {
    // ניווט לדף הפורום
    await page.goto("/community");

    // בדיקת כותרת הדף
    await expect(page).toHaveTitle(/פורום | הדרך/);

    // בדיקת הצגת רכיבי הפורום
    await expect(
      page.getByRole("searchbox", { name: "חיפוש בפורום" })
    ).toBeVisible();
    await expect(
      page.getByRole("combobox", { name: "מיין תוצאות" })
    ).toBeVisible();
    await expect(
      page.getByRole("combobox", { name: "סנן לפי סטטוס" })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "אפס פילטרים" })
    ).toBeVisible();
  });

  test("יצירת פוסט חדש", async ({ page }) => {
    // ניווט לדף הפורום
    await page.goto("/community");

    // לחיצה על כפתור יצירת פוסט
    await page.click('button:has-text("פוסט חדש")');

    // מילוי טופס
    await page.fill('input[placeholder="כותרת הפוסט"]', "פוסט בדיקה");
    await page.fill(
      'textarea[placeholder="תוכן הפוסט"]',
      "זהו תוכן פוסט הבדיקה"
    );
    await page.selectOption('select[name="category"]', "general");

    // הוספת תגיות
    await page.click('button:has-text("הוסף תגית")');
    await page.click("text=javascript");

    // שליחת הטופס
    await page.click('button[type="submit"]');

    // בדיקה שהפוסט נוצר
    await expect(page.getByText("פוסט בדיקה")).toBeVisible();
    await expect(page.getByText("זהו תוכן פוסט הבדיקה")).toBeVisible();
  });

  test("אינטראקציה עם פוסט", async ({ page }) => {
    // ניווט לדף הפורום
    await page.goto("/community");

    // בחירת פוסט
    const firstPost = page.locator("article").first();
    await firstPost.click();

    // בדיקת פרטי הפוסט
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("article")).toBeVisible();

    // הוספת תגובה
    await page.fill('textarea[placeholder="הוסף תגובה..."]', "תגובה לבדיקה");
    await page.click('button:has-text("שלח תגובה")');

    // בדיקה שהתגובה נוספה
    await expect(page.getByText("תגובה לבדיקה")).toBeVisible();

    // לייק לפוסט
    await page.click('button[aria-label*="לייקים"]');
    await expect(page.getByText("1")).toBeVisible();
  });

  test("סינון וחיפוש", async ({ page }) => {
    // ניווט לדף הפורום
    await page.goto("/community");

    // חיפוש
    await page.fill('input[placeholder="חיפוש בפורום..."]', "javascript");
    await page.press('input[placeholder="חיפוש בפורום..."]', "Enter");

    // בדיקת תוצאות החיפוש
    await expect(page.getByText("javascript", { exact: false })).toBeVisible();

    // סינון לפי קטגוריה
    await page.selectOption('select[aria-label="סנן לפי סטטוס"]', "solved");
    await expect(page.getByText("נפתר", { exact: false })).toBeVisible();

    // מיון
    await page.selectOption('select[aria-label="מיין תוצאות"]', "popular");
    await expect(page.getByText("הכי פופולריים")).toBeVisible();

    // איפוס פילטרים
    await page.click('button:has-text("אפס פילטרים")');
    await expect(page.getByText("כל הסטטוסים")).toBeVisible();
  });

  test("נגישות", async ({ page }) => {
    // ניווט לדף הפורום
    await page.goto("/community");

    // בדיקת תפקידים נגישים
    await expect(page.getByRole("search")).toBeVisible();
    await expect(page.getByRole("combobox")).toBeVisible();
    await expect(page.getByRole("button")).toBeVisible();
    await expect(page.getByRole("article")).toBeVisible();

    // ניווט עם מקלדת
    await page.keyboard.press("Tab");
    await expect(page.getByRole("searchbox")).toBeFocused();

    await page.keyboard.press("Tab");
    await expect(page.getByRole("combobox")).toBeFocused();

    await page.keyboard.press("Tab");
    await expect(page.getByRole("button")).toBeFocused();
  });

  test("ביצועים", async ({ page }) => {
    // מדידת זמן טעינה
    const startTime = Date.now();
    await page.goto("/community");
    const loadTime = Date.now() - startTime;

    // בדיקה שזמן הטעינה סביר (פחות מ-3 שניות)
    expect(loadTime).toBeLessThan(3000);

    // בדיקת טעינת תמונות
    const images = await page.$$("img");
    for (const image of images) {
      const naturalWidth = await image.evaluate((img) => img.naturalWidth);
      expect(naturalWidth).toBeGreaterThan(0);
    }

    // בדיקת טעינת משאבים
    const [response] = await Promise.all([
      page.waitForResponse((response) => response.url().includes("/api/forum")),
      page.reload(),
    ]);
    expect(response.status()).toBe(200);
  });
});
