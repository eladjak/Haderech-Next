import * as z from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "נדרשת כתובת אימייל" })
    .email({ message: "כתובת אימייל לא תקינה" }),
  password: z
    .string()
    .min(8, { message: "סיסמה חייבת להכיל לפחות 8 תווים" })
    .max(100, { message: "סיסמה חייבת להכיל פחות מ-100 תווים" })
    .regex(/[A-Z]/, { message: "סיסמה חייבת להכיל לפחות אות גדולה אחת" })
    .regex(/[a-z]/, { message: "סיסמה חייבת להכיל לפחות אות קטנה אחת" })
    .regex(/[0-9]/, { message: "סיסמה חייבת להכיל לפחות ספרה אחת" })
    .regex(/[^A-Za-z0-9]/, { message: "סיסמה חייבת להכיל לפחות תו מיוחד אחד" }),
});

export const registerSchema = z
  .object({
    email: z
      .string()
      .min(1, { message: "נדרשת כתובת אימייל" })
      .email({ message: "כתובת אימייל לא תקינה" }),
    password: z
      .string()
      .min(8, { message: "סיסמה חייבת להכיל לפחות 8 תווים" })
      .max(100, { message: "סיסמה חייבת להכיל פחות מ-100 תווים" })
      .regex(/[A-Z]/, { message: "סיסמה חייבת להכיל לפחות אות גדולה אחת" })
      .regex(/[a-z]/, { message: "סיסמה חייבת להכיל לפחות אות קטנה אחת" })
      .regex(/[0-9]/, { message: "סיסמה חייבת להכיל לפחות ספרה אחת" })
      .regex(/[^A-Za-z0-9]/, {
        message: "סיסמה חייבת להכיל לפחות תו מיוחד אחד",
      }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "הסיסמאות אינן תואמות",
    path: ["confirmPassword"],
  });

export const resetPasswordSchema = z.object({
  email: z
    .string()
    .min(1, { message: "נדרשת כתובת אימייל" })
    .email({ message: "כתובת אימייל לא תקינה" }),
});

export const updatePasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: "סיסמה חייבת להכיל לפחות 8 תווים" })
      .max(100, { message: "סיסמה חייבת להכיל פחות מ-100 תווים" })
      .regex(/[A-Z]/, { message: "סיסמה חייבת להכיל לפחות אות גדולה אחת" })
      .regex(/[a-z]/, { message: "סיסמה חייבת להכיל לפחות אות קטנה אחת" })
      .regex(/[0-9]/, { message: "סיסמה חייבת להכיל לפחות ספרה אחת" })
      .regex(/[^A-Za-z0-9]/, {
        message: "סיסמה חייבת להכיל לפחות תו מיוחד אחד",
      }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "הסיסמאות אינן תואמות",
    path: ["confirmPassword"],
  });

export type LoginSchema = z.infer<typeof loginSchema>;
export type RegisterSchema = z.infer<typeof registerSchema>;
export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;
export type UpdatePasswordSchema = z.infer<typeof updatePasswordSchema>;
