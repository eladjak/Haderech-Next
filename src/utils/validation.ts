import { z } from "zod";

export const emailSchema = z
  .string()
  .email("כתובת אימייל לא תקינה")
  .min(5, "כתובת אימייל חייבת להכיל לפחות 5 תווים")
  .max(255, "כתובת אימייל לא יכולה להכיל יותר מ-255 תווים");

export const passwordSchema = z
  .string()
  .min(8, "סיסמה חייבת להכיל לפחות 8 תווים")
  .max(100, "סיסמה לא יכולה להכיל יותר מ-100 תווים")
  .regex(/[A-Z]/, "סיסמה חייבת להכיל לפחות אות גדולה אחת")
  .regex(/[a-z]/, "סיסמה חייבת להכיל לפחות אות קטנה אחת")
  .regex(/[0-9]/, "סיסמה חייבת להכיל לפחות ספרה אחת");

export const phoneSchema = z
  .string()
  .regex(/^05\d{8}$/, "מספר טלפון לא תקין")
  .optional();

export const nameSchema = z
  .string()
  .min(2, "שם חייב להכיל לפחות 2 תווים")
  .max(50, "שם לא יכול להכיל יותר מ-50 תווים")
  .regex(/^[\u0590-\u05FF\s'"-]+$/, "שם חייב להכיל אותיות בעברית בלבד");

export const urlSchema = z.string().url("כתובת URL לא תקינה").optional();

export const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "תאריך חייב להיות בפורמט YYYY-MM-DD");

export const priceSchema = z
  .number()
  .min(0, "מחיר לא יכול להיות שלילי")
  .max(100000, "מחיר לא יכול להיות גבוה מ-100,000");

export const ratingSchema = z
  .number()
  .min(1, "דירוג חייב להיות בין 1 ל-5")
  .max(5, "דירוג חייב להיות בין 1 ל-5");

export const commentSchema = z
  .string()
  .min(2, "תגובה חייבת להכיל לפחות 2 תווים")
  .max(1000, "תגובה לא יכולה להכיל יותר מ-1000 תווים");

export const titleSchema = z
  .string()
  .min(3, "כותרת חייבת להכיל לפחות 3 תווים")
  .max(100, "כותרת לא יכולה להכיל יותר מ-100 תווים");

export const descriptionSchema = z
  .string()
  .min(10, "תיאור חייב להכיל לפחות 10 תווים")
  .max(5000, "תיאור לא יכול להכיל יותר מ-5000 תווים");
