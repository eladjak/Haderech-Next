import { action } from "./_generated/server";
import { v } from "convex/values";
import {
  welcomeTemplate,
  courseCompletionTemplate,
  weeklySummaryTemplate,
} from "./emailTemplates";

// ═══════════════════════════════════════════════════════════════════════════════
// Email Actions – send transactional emails via Resend REST API.
// Each action includes a dev-mode fallback (console log) when RESEND_API_KEY
// is not configured.
// ═══════════════════════════════════════════════════════════════════════════════

const DEFAULT_FROM = "הדרך <noreply@ohlove.co.il>";

/**
 * Internal helper – calls the Resend REST API (or logs in dev mode).
 * Not exported as a Convex function; used only inside this module.
 */
async function callResend(options: {
  to: string;
  subject: string;
  html: string;
  from?: string;
}): Promise<{ success: boolean; id?: string; error?: string; dev?: boolean }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = options.from ?? DEFAULT_FROM;

  if (!apiKey) {
    console.log("[Email Dev]", {
      to: options.to,
      subject: options.subject,
      from,
    });
    return { success: true, id: `dev-${Date.now()}`, dev: true };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from,
        to: options.to,
        subject: options.subject,
        html: options.html,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error };
    }

    const data = (await response.json()) as { id: string };
    return { success: true, id: data.id };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// ─── 1. Welcome Email ────────────────────────────────────────────────────────

/** שליחת מייל ברוכים הבאים לאחר הרשמה */
export const sendWelcomeEmail = action({
  args: {
    email: v.string(),
    name: v.string(),
  },
  handler: async (_ctx, args) => {
    const html = welcomeTemplate(args.name);
    return callResend({
      to: args.email,
      subject: "ברוכים הבאים להדרך! 🎉",
      html,
    });
  },
});

// ─── 2. Course Enrollment Email ──────────────────────────────────────────────

/** שליחת מייל אישור הרשמה לקורס */
export const sendEnrollmentEmail = action({
  args: {
    email: v.string(),
    name: v.string(),
    courseName: v.string(),
    courseSlug: v.string(),
  },
  handler: async (_ctx, args) => {
    const html = enrollmentTemplate(args.name, args.courseName, args.courseSlug);
    return callResend({
      to: args.email,
      subject: `נרשמת בהצלחה ל"${args.courseName}" 📚`,
      html,
    });
  },
});

// ─── 3. Certificate Issued Email ─────────────────────────────────────────────

/** שליחת מייל עם תעודת סיום */
export const sendCertificateEmail = action({
  args: {
    email: v.string(),
    name: v.string(),
    courseName: v.string(),
  },
  handler: async (_ctx, args) => {
    const html = courseCompletionTemplate(args.name, args.courseName);
    return callResend({
      to: args.email,
      subject: `כל הכבוד! קיבלת תעודת סיום עבור "${args.courseName}" 🏆`,
      html,
    });
  },
});

// ─── 4. Weekly Digest Email ──────────────────────────────────────────────────

/** שליחת סיכום שבועי */
export const sendWeeklyDigestEmail = action({
  args: {
    email: v.string(),
    name: v.string(),
    lessonsCompleted: v.number(),
    xpEarned: v.number(),
    streak: v.number(),
  },
  handler: async (_ctx, args) => {
    const html = weeklySummaryTemplate(args.name, {
      lessonsCompleted: args.lessonsCompleted,
      xpEarned: args.xpEarned,
      streak: args.streak,
    });
    return callResend({
      to: args.email,
      subject: `הסיכום השבועי שלך 📊 – ${args.lessonsCompleted} שיעורים השבוע!`,
      html,
    });
  },
});

// ═══════════════════════════════════════════════════════════════════════════════
// Inline templates for actions that don't have a pre-built emailTemplates helper
// ═══════════════════════════════════════════════════════════════════════════════

function enrollmentTemplate(
  userName: string,
  courseName: string,
  courseSlug: string,
): string {
  return `<!DOCTYPE html>
<html dir="rtl" lang="he">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  body { font-family: 'Heebo', Arial, sans-serif; background: #f8fafc; margin: 0; padding: 0; direction: rtl; }
  .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; }
  .header { background: linear-gradient(135deg, #1E3A5F, #E85D75); padding: 32px; text-align: center; color: white; }
  .header h1 { margin: 0; font-size: 24px; }
  .content { padding: 32px; color: #1e293b; line-height: 1.8; font-size: 16px; }
  .button { display: inline-block; background: #E85D75; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 16px 0; }
  .course-card { background: #f1f5f9; border-radius: 8px; padding: 20px; margin: 16px 0; border-right: 4px solid #E85D75; }
  .footer { padding: 24px; text-align: center; color: #94a3b8; font-size: 13px; border-top: 1px solid #e2e8f0; }
</style></head>
<body><div class="container">
  <div class="header"><h1>הדרך</h1></div>
  <div class="content">
    <h2>שלום ${userName}! 📚</h2>
    <p>נרשמת בהצלחה לקורס חדש:</p>
    <div class="course-card">
      <strong style="font-size: 18px; color: #1E3A5F;">${courseName}</strong>
      <p style="margin: 8px 0 0; color: #64748b;">הקורס מחכה לך - התחל ללמוד עכשיו!</p>
    </div>
    <p>הנה כמה טיפים להתחלה מוצלחת:</p>
    <ul>
      <li>🎯 קבע לעצמך זמן קבוע ללמידה כל יום</li>
      <li>📝 רשום הערות תוך כדי הצפייה</li>
      <li>💬 שאל שאלות - המאמן AI שלנו תמיד זמין</li>
    </ul>
    <p><a class="button" href="{{APP_URL}}/courses/${courseSlug}">התחל ללמוד</a></p>
  </div>
  <div class="footer">
    <p>הדרך - פלטפורמת לימודי דייטינג וזוגיות</p>
    <p><a href="{{APP_URL}}/settings" style="color:#E85D75">הגדרות התראות</a> | <a href="{{APP_URL}}/help" style="color:#E85D75">עזרה</a></p>
  </div>
</div></body></html>`;
}
