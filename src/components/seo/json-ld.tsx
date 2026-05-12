import { siteConfig } from "@/lib/site-config";

export function WebsiteJsonLd() {
  const graph = [
    {
      "@type": "EducationalOrganization",
      "@id": `${siteConfig.url}#org`,
      name: "הדרך - אומנות הקשר",
      alternateName: "Haderech",
      description: "תוכנית 12 שבועות לזוגיות עם צ'אט AI, סימולטור דייטים, קהילה ו-75 שיעורי וידאו.",
      url: siteConfig.url,
      logo: `${siteConfig.url}/images/haderech-logo-square.jpg`,
      sameAs: ["https://ohlove.co.il"],
      email: "haderech@ohlove.co.il",
      areaServed: "ישראל",
      knowsLanguage: ["he", "en"],
    },
    {
      "@type": "ProfessionalService",
      "@id": `${siteConfig.url}#service`,
      name: "הדרך - תוכנית זוגיות 12 שבועות",
      description: "ליווי זוגי דיגיטלי המבוסס על תכני אומנות הקשר. שיעורי וידאו, צ'אט AI, סימולטור דייטים וקהילה תומכת.",
      url: siteConfig.url,
      image: `${siteConfig.url}/images/haderech-banner.jpg`,
      areaServed: "ישראל",
      knowsLanguage: ["he", "en"],
      priceRange: "$$",
      provider: { "@id": `${siteConfig.url}#org` },
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
      "@type": "WebPage",
      "@id": `${siteConfig.url}#webpage`,
      name: "הדרך - תוכנית 12 שבועות לזוגיות | אומנות הקשר",
      url: siteConfig.url,
      inLanguage: "he-IL",
      datePublished: "2026-01-01",
      dateModified: "2026-05-12",
      isPartOf: { "@id": `${siteConfig.url}#website` },
      about: { "@id": `${siteConfig.url}#service` },
      primaryImageOfPage: {
        "@type": "ImageObject",
        url: `${siteConfig.url}/images/haderech-banner.jpg`,
      },
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "מה זה תוכנית 'הדרך'?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "הדרך היא תוכנית דיגיטלית של 12 שבועות לזוגיות, מבוססת על שיטת 'אומנות הקשר'. כוללת שיעורי וידאו, צ'אט AI חכם, סימולטור דייטים וקהילה תומכת.",
          },
        },
        {
          "@type": "Question",
          name: "למי התוכנית מתאימה?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "התוכנית מתאימה לרווקים/ות שמחפשים זוגיות, וגם לזוגות שרוצים להעמיק את הקשר. כל שיעור בנוי משלבים מעשיים שניתן ליישם מיד.",
          },
        },
        {
          "@type": "Question",
          name: "מה כוללת התוכנית?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "75 שיעורי וידאו, צ'אט AI חכם 24/7, סימולטור דייטים אינטראקטיבי, קהילה תומכת, תעודת סיום, ומעקב התקדמות אישי.",
          },
        },
        {
          "@type": "Question",
          name: "האם ניתן ללמוד בקצב אישי?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "כן. התוכנית גמישה — אפשר ללמוד בקצב שלך. המערכת זוכרת איפה הפסקת ומחזירה אותך בדיוק לשם.",
          },
        },
        {
          "@type": "Question",
          name: "איך יוצרים קשר?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "אפשר ליצור קשר דרך טופס יצירת הקשר באתר haderech-next.vercel.app/contact, או במייל haderech@ohlove.co.il.",
          },
        },
      ],
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
          <h1>הדרך - תוכנית 12 שבועות לזוגיות | אומנות הקשר</h1>
          <p>
            <strong>
              תוכנית דיגיטלית מקיפה לזוגיות, מבוססת על שיטת אומנות הקשר.
            </strong>
          </p>
        </header>
        <section>
          <h2>מה זה הדרך?</h2>
          <p>
            תוכנית 12 שבועות שמשלבת 75 שיעורי וידאו, צ&apos;אט AI חכם 24/7,
            סימולטור דייטים אינטראקטיבי וקהילה תומכת — הכל במקום אחד.
          </p>
        </section>
        <section>
          <h2>למי זה מתאים?</h2>
          <p>
            רווקים ורווקות שמחפשים זוגיות עמוקה, וזוגות שרוצים להעמיק את
            התקשורת והקשר ביניהם.
          </p>
        </section>
        <section>
          <h2>מה בתוכנית?</h2>
          <ul>
            <li>75 שיעורי וידאו בעברית</li>
            <li>צ&apos;אט AI חכם המבוסס על תכני אומנות הקשר</li>
            <li>סימולטור דייטים אינטראקטיבי</li>
            <li>קהילה תומכת של לומדים</li>
            <li>תעודת סיום</li>
            <li>מעקב התקדמות אישי</li>
          </ul>
        </section>
        <section>
          <h2>אודות אומנות הקשר</h2>
          <p>
            <a href="https://ohlove.co.il">אומנות הקשר</a> — תוכנית ליווי זוגי
            שליוותה למעלה מ-450 זוגות. הדרך היא הגרסה הדיגיטלית של אותה שיטה.
          </p>
          <p>
            <a href="/about">למידע נוסף ולעמוד האודות המלא</a>
          </p>
        </section>
        <section>
          <h2>יצירת קשר</h2>
          <address>
            <p>אימייל: <a href="mailto:haderech@ohlove.co.il">haderech@ohlove.co.il</a></p>
            <p><a href="/contact">לטופס יצירת הקשר</a></p>
          </address>
        </section>
        <footer>
          <p>כדי להשתמש בפלטפורמה המלאה (וידאו, AI, קהילה) — יש להפעיל JavaScript.</p>
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
      url: "https://ohlove.co.il",
    },
    inLanguage: "he",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
