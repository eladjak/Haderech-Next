import { siteConfig } from "@/lib/site-config";

// llms.txt — machine-readable site guide for AI crawlers/agents.
// Served as a dynamic route so the base URL always follows siteConfig
// (same normalization as robots.ts / sitemap.ts).
export const dynamic = "force-static";

export function GET() {
  const base = siteConfig.url;
  const body = `# הדרך — אומנות הקשר | תוכנית למידה בת 12 שבועות

> פלטפורמת למידה דיגיטלית בעברית מבית "אומנות הקשר". המקור הקנוני כולל 75 שיעורים ב-12 שבועות ו-8 מסמכי תרגול. כלי ה-AI הם אוטומטיים, עלולים לטעות ואינם אנשי מקצוע; זמינות תוכן ושירותים תלויה בהרשאה ובתצורת המערכת. Hebrew (RTL) learning program by Elad Yaakobovitch ("Omanut HaKesher").

## עמודים מרכזיים (Core pages)
- [דף הבית](${base}/): סקירת התוכנית — מה זה הדרך, למי זה מתאים ומה כלול
- [אודות](${base}/about): על שיטת אומנות הקשר ועל אלעד יעקבוביץ'
- [קורסים](${base}/courses): קטלוג הקורסים והשיעורים
- [מחירים](${base}/pricing): סטטוס זמינות הרכישה; אין כרגע מסלול תשלום מאומת ופעיל
- [שאלות נפוצות](${base}/faq): תשובות לשאלות נפוצות על התוכנית
- [בלוג](${base}/blog): מאמרים על זוגיות, תקשורת ודייטינג
- [עדויות](${base}/stories): אין כרגע עדויות ציבוריות עד להשלמת אימות מקור והסכמה לפרסום
- [יצירת קשר](${base}/contact): דרכי התקשרות

## מה בתוכנית (Program contents)
- 75 שיעורים בעברית לאורך 12 שבועות (6 שלבים: גישה, תקשורת, משיכה, חיבור, אינטימיות, מחויבות)
- כלי AI לרפלקציה המבוסס על תכני אומנות הקשר; אינו טיפול, אבחון או ייעוץ מקצועי
- תרגול שיחה עם דמות AI בדיונית; אינו מדד למשיכה, התאמה או הסכמה
- משטחי קהילה, מעקב ותעודה קיימים במוצר, אך זמינותם ותנאי הזכאות אינם מובטחים כאן

## Technical
- [Sitemap](${base}/sitemap.xml)
- [Robots](${base}/robots.txt)
- Language: Hebrew (he-IL), RTL
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
