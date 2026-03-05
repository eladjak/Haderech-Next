// ─── Email Templates Module ─────────────────────────────────────────────────
// Pure functions that generate HTML email templates in Hebrew RTL.
// These are NOT Convex functions – they are regular helpers imported by other modules.

/**
 * Wraps email body content in a branded HTML layout with header, footer, and RTL support.
 */
function emailLayout(content: string, _preheader?: string): string {
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
  .footer { padding: 24px; text-align: center; color: #94a3b8; font-size: 13px; border-top: 1px solid #e2e8f0; }
</style></head>
<body><div class="container">
  <div class="header"><h1>הדרך</h1></div>
  <div class="content">${content}</div>
  <div class="footer">
    <p>הדרך - פלטפורמת לימודי דייטינג וזוגיות</p>
    <p><a href="{{APP_URL}}/settings" style="color:#E85D75">הגדרות התראות</a> | <a href="{{APP_URL}}/help" style="color:#E85D75">עזרה</a></p>
  </div>
</div></body></html>`;
}

/** Template: Welcome email sent after first sign-up. */
export function welcomeTemplate(userName: string): string {
  return emailLayout(`
    <h2>שלום ${userName}! 👋</h2>
    <p>ברוכים הבאים לפלטפורמת <strong>הדרך</strong> - המקום שלך ללמוד את אומנות הדייטינג והזוגיות.</p>
    <p>הנה מה שמחכה לך:</p>
    <ul>
      <li>📚 קורסים מקצועיים בנושאי דייטינג</li>
      <li>🤖 מאמן AI אישי</li>
      <li>🎭 סימולטור דייטים</li>
      <li>👥 קהילה תומכת</li>
    </ul>
    <p><a class="button" href="{{APP_URL}}/dashboard">התחל ללמוד</a></p>
  `);
}

/** Template: Course completion congratulations. */
export function courseCompletionTemplate(
  userName: string,
  courseName: string,
): string {
  return emailLayout(`
    <h2>כל הכבוד ${userName}! 🎉</h2>
    <p>סיימת בהצלחה את הקורס <strong>"${courseName}"</strong>!</p>
    <p>התעודה שלך מחכה לך באזור האישי.</p>
    <p><a class="button" href="{{APP_URL}}/certificates">צפה בתעודה</a></p>
  `);
}

/** Template: Daily study reminder with streak info. */
export function dailyReminderTemplate(
  userName: string,
  streakDays: number,
): string {
  return emailLayout(`
    <h2>שלום ${userName}! ☀️</h2>
    <p>הגיע הזמן ללמוד היום! הרצף שלך: <strong>${streakDays} ימים</strong> 🔥</p>
    <p>אל תפסיק עכשיו - המשך את ההתקדמות!</p>
    <p><a class="button" href="{{APP_URL}}/dashboard">המשך ללמוד</a></p>
  `);
}

/** Template: New blog post notification. */
export function newBlogPostTemplate(
  postTitle: string,
  postExcerpt: string,
  postSlug: string,
): string {
  return emailLayout(`
    <h2>מאמר חדש בבלוג! ✍️</h2>
    <h3>${postTitle}</h3>
    <p>${postExcerpt}</p>
    <p><a class="button" href="{{APP_URL}}/blog/${postSlug}">קרא עוד</a></p>
  `);
}

/** Template: Weekly summary with learning stats. */
export function weeklySummaryTemplate(
  userName: string,
  stats: { lessonsCompleted: number; xpEarned: number; streak: number },
): string {
  return emailLayout(`
    <h2>סיכום שבועי - ${userName} 📊</h2>
    <table style="width:100%; border-collapse:collapse; margin: 16px 0;">
      <tr><td style="padding:12px; border-bottom:1px solid #e2e8f0; font-weight:600;">שיעורים שהושלמו</td><td style="padding:12px; border-bottom:1px solid #e2e8f0; text-align:left;">${stats.lessonsCompleted}</td></tr>
      <tr><td style="padding:12px; border-bottom:1px solid #e2e8f0; font-weight:600;">XP שנצבר</td><td style="padding:12px; border-bottom:1px solid #e2e8f0; text-align:left;">${stats.xpEarned}</td></tr>
      <tr><td style="padding:12px; font-weight:600;">רצף למידה</td><td style="padding:12px; text-align:left;">${stats.streak} ימים 🔥</td></tr>
    </table>
    <p><a class="button" href="{{APP_URL}}/dashboard">המשך את הדרך</a></p>
  `);
}
