import { siteConfig } from "@/lib/site-config";

// llms.txt — machine-readable site guide for AI crawlers/agents.
// Served as a dynamic route so the base URL always follows siteConfig
// (same normalization as robots.ts / sitemap.ts).
export const dynamic = "force-static";

export function GET() {
  const base = siteConfig.url;
  const body = `# הדרך — אומנות הקשר | תוכנית 12 שבועות לזוגיות

> פלטפורמת למידה דיגיטלית בעברית מבית "אומנות הקשר": תוכנית 12 שבועות לזוגיות עם 75 שיעורי וידאו, צ'אט AI חכם 24/7, סימולטור דייטים אינטראקטיבי וקהילה תומכת. Hebrew (RTL) relationship-coaching program by Elad Yaakobovitch ("Omanut HaKesher").

## עמודים מרכזיים (Core pages)
- [דף הבית](${base}/): סקירת התוכנית — מה זה הדרך, למי זה מתאים ומה כלול
- [אודות](${base}/about): על שיטת אומנות הקשר ועל אלעד יעקבוביץ'
- [קורסים](${base}/courses): קטלוג הקורסים והשיעורים
- [מחירים](${base}/pricing): מסלולי הצטרפות ומחירים
- [שאלות נפוצות](${base}/faq): תשובות לשאלות נפוצות על התוכנית
- [בלוג](${base}/blog): מאמרים על זוגיות, תקשורת ודייטינג
- [סיפורי הצלחה](${base}/stories): עדויות של בוגרי התוכנית
- [יצירת קשר](${base}/contact): דרכי התקשרות

## מה בתוכנית (Program contents)
- 75 שיעורי וידאו בעברית לאורך 12 שבועות (6 שלבים: גישה, תקשורת, משיכה, חיבור, אינטימיות, מחויבות)
- צ'אט AI חכם המבוסס על תכני אומנות הקשר
- סימולטור דייטים אינטראקטיבי
- קהילה תומכת, מעקב התקדמות אישי ותעודת סיום

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
