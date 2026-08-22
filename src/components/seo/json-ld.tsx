import { siteConfig } from "@/lib/site-config";

const COURSE_FACTS = {
  duration: "12 שבועות",
  phases: 6,
  lessons: 75,
  documents: 8,
} as const;

export function WebsiteJsonLd() {
  const graph = [
    {
      "@type": "Organization",
      "@id": `${siteConfig.url}#org`,
      name: "הדרך - אומנות הקשר",
      alternateName: "Haderech",
      description:
        `פלטפורמת למידה בעברית הכוללת תוכנית בת ${COURSE_FACTS.duration}, ${COURSE_FACTS.phases} שלבים, ${COURSE_FACTS.lessons} שיעורים ו-${COURSE_FACTS.documents} מסמכי PDF לתרגול.`,
      url: siteConfig.url,
      logo: `${siteConfig.url}/images/haderech-logo-square.jpg`,
      sameAs: ["https://www.ohlove.co.il"],
      email: "haderech@ohlove.co.il",
      areaServed: "ישראל",
      knowsLanguage: ["he"],
    },
    {
      "@type": "WebSite",
      "@id": `${siteConfig.url}#website`,
      name: "הדרך - אומנות הקשר",
      url: siteConfig.url,
      inLanguage: "he-IL",
      publisher: { "@id": `${siteConfig.url}#org` },
    },
    {
      "@type": "Course",
      "@id": `${siteConfig.url}#course`,
      name: "הדרך - תוכנית למידה בת 12 שבועות",
      description:
        `תוכנית למידה בעברית בת ${COURSE_FACTS.duration} וב-${COURSE_FACTS.phases} שלבים, הכוללת ${COURSE_FACTS.lessons} שיעורים ו-${COURSE_FACTS.documents} מסמכי PDF לתרגול.`,
      url: `${siteConfig.url}/courses`,
      inLanguage: "he-IL",
      provider: { "@id": `${siteConfig.url}#org` },
    },
    {
      "@type": "WebPage",
      "@id": `${siteConfig.url}#webpage`,
      name: "הדרך - תוכנית למידה בת 12 שבועות | אומנות הקשר",
      description:
        `תוכנית בת ${COURSE_FACTS.duration}, ${COURSE_FACTS.phases} שלבים, ${COURSE_FACTS.lessons} שיעורים ו-${COURSE_FACTS.documents} מסמכי PDF לתרגול.`,
      url: siteConfig.url,
      inLanguage: "he-IL",
      isPartOf: { "@id": `${siteConfig.url}#website` },
      about: { "@id": `${siteConfig.url}#course` },
      primaryImageOfPage: {
        "@type": "ImageObject",
        url: `${siteConfig.url}/images/haderech-banner.jpg`,
      },
    },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": graph,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function HomePageFallback() {
  return (
    <noscript>
      <article style={{ direction: "rtl", padding: 40, fontFamily: "sans-serif" }}>
        <header>
          <h1>הדרך - תוכנית למידה בת 12 שבועות | אומנות הקשר</h1>
          <p>
            תוכנית בעברית העוסקת בתקשורת, היכרות וקשרים. התוכנית אינה מבטיחה
            תוצאה זוגית ואינה תחליף לטיפול או לייעוץ מקצועי.
          </p>
        </header>
        <section>
          <h2>מה כוללת התוכנית?</h2>
          <ul>
            <li>12 שבועות המחולקים ל-6 שלבים</li>
            <li>75 שיעורים בעברית</li>
            <li>8 מסמכי PDF לתרגול</li>
            <li>כלי AI וסימולטור לתרגול, בכפוף לזמינות השירות</li>
          </ul>
          <p>
            כלי ה-AI עלולים לטעות. אין להזין בהם מידע שלא תרצו שיעובד אצל ספק
            חיצוני, ואין להסתמך עליהם במצב חירום או במקום איש מקצוע.
          </p>
        </section>
        <section>
          <h2>בחירה ובטיחות</h2>
          <p>
            התרגילים הם הצעות בלבד. מותר לדלג, לעצור או להתאים כל תרגיל, והסכמה
            נדרשת בכל מגע, שיתוף או תרגול משותף.
          </p>
          <p><a href="/course-safety">מידע בטיחות ומשאבי סיוע</a></p>
        </section>
        <section>
          <h2>יצירת קשר</h2>
          <address>
            <p>אימייל: <a href="mailto:haderech@ohlove.co.il">haderech@ohlove.co.il</a></p>
            <p><a href="/contact">לטופס יצירת הקשר</a></p>
          </address>
        </section>
        <footer>
          <p>כדי להשתמש בווידאו, בכלי ה-AI ובשאר הממשק יש להפעיל JavaScript.</p>
        </footer>
      </article>
    </noscript>
  );
}

export function CourseJsonLd({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: title,
    description,
    provider: {
      "@type": "Organization",
      name: "אומנות הקשר",
      url: "https://www.ohlove.co.il",
    },
    inLanguage: "he-IL",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
