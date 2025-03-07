import { chromium, FullConfig } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

("use client");

export {};

// טעינת משתני סביבה
dotenv.config({ path: ".env.test" });

async function globalSetup(_config: FullConfig) {
  // יצירת חיבור ל-Supabase
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // יצירת משתמש טסט
  const { data: user, error: createError } =
    await supabase.auth.admin.createUser({
      email: "test@example.com",
      password: "password123",
      email_confirm: true,
    });

  if (createError) {
    console.error("Error creating test user:", createError);
    throw createError;
  }

  // עדכון פרטי המשתמש
  const { error: updateError } = await supabase
    .from("users")
    .update({
      name: "משתמש טסט",
      full_name: "משתמש טסט",
      username: "testuser",
      role: "user",
    })
    .eq("id", user.user.id);

  if (updateError) {
    console.error("Error updating test user:", updateError);
    throw updateError;
  }

  // יצירת פוסט לדוגמה
  const { error: postError } = await supabase.from("forum_posts").insert({
    title: "פוסט בדיקה",
    content: "תוכן פוסט הבדיקה",
    author_id: user.user.id,
    category_id: "general",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  if (postError) {
    console.error("Error creating test post:", postError);
    throw postError;
  }

  // שמירת פרטי המשתמש לשימוש בטסטים
  process.env.TEST_USER_ID = user.user.id;
  process.env.TEST_USER_EMAIL = user.user.email;

  // יצירת דפדפן ושמירת מצב ההתחברות
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  // התחברות
  await page.goto(`${process.env.NEXT_PUBLIC_APP_URL}/auth/login`);
  await page.fill('input[type="email"]', "test@example.com");
  await page.fill('input[type="password"]', "password123");
  await page.click('button[type="submit"]');
  await page.waitForURL("**/dashboard");

  // שמירת מצב ההתחברות
  await context.storageState({ path: "./auth.json" });

  // סגירת הדפדפן
  await browser.close();
}

export default globalSetup;
