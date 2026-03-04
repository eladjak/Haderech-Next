import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export const metadata: Metadata = {
  title: "אודות",
  description:
    "הכירו את הדרך - אומנות הקשר. הפלטפורמה שנוצרה כדי לעזור לכם למצוא אהבה אמיתית. הסיפור שלנו, הערכים שלנו והמשימה שלנו.",
  openGraph: {
    title: "אודות | הדרך - אומנות הקשר",
    description:
      "הכירו את הדרך - הפלטפורמה שנוצרה כדי לעזור לכם למצוא אהבה אמיתית.",
    url: "https://haderech.co.il/about",
    images: [
      {
        url: "/images/hero.jpg",
        width: 1200,
        height: 630,
        alt: "אודות - הדרך אומנות הקשר",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "אודות | הדרך - אומנות הקשר",
    description:
      "הכירו את הדרך - הפלטפורמה שנוצרה כדי לעזור לכם למצוא אהבה אמיתית.",
    images: ["/images/hero.jpg"],
  },
};

const VALUES = [
  {
    title: "למידה בקצב שלך",
    description:
      "כל אחד לומד בצורה שונה. הפלטפורמה שלנו מאפשרת לך ללמוד מתי שנוח לך, בקצב שמתאים לך.",
    icon: (
      <svg
        className="h-8 w-8"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  {
    title: "תוכן מקצועי בעברית",
    description:
      "כל הקורסים נכתבו בעברית על ידי מומחים בתחום התקשורת הזוגית והאישית.",
    icon: (
      <svg
        className="h-8 w-8"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
        />
      </svg>
    ),
  },
  {
    title: "מעקב התקדמות",
    description:
      "עקוב אחרי ההתקדמות שלך, צבור הישגים, ושמור על מוטיבציה עם מערכת הגמיפיקציה שלנו.",
    icon: (
      <svg
        className="h-8 w-8"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
        />
      </svg>
    ),
  },
  {
    title: "קהילת לומדים",
    description:
      "הצטרף לקהילה של לומדים, שתף תובנות, שאל שאלות, וקבל תמיכה מעמיתים.",
    icon: (
      <svg
        className="h-8 w-8"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
        />
      </svg>
    ),
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-dvh bg-white dark:bg-zinc-950">
      <Header />

      <main className="container mx-auto px-4 py-16">
        {/* Hero */}
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h1 className="mb-4 text-4xl font-bold text-zinc-900 dark:text-white">
            אודות הדרך
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            פלטפורמת הלמידה המובילה בעברית לתקשורת זוגית ואישית. אנחנו מאמינים
            שכל אחד יכול ללמוד את הכלים לבנות מערכות יחסים טובות יותר.
          </p>
        </div>

        {/* Mission */}
        <section className="mb-16 rounded-2xl bg-zinc-50 p-8 dark:bg-zinc-900 md:p-12">
          <h2 className="mb-4 text-2xl font-bold text-zinc-900 dark:text-white">
            המשימה שלנו
          </h2>
          <p className="max-w-3xl text-zinc-600 dark:text-zinc-400">
            הדרך נוסדה מתוך אמונה שתקשורת טובה היא הבסיס לכל מערכת יחסים
            בריאה. המטרה שלנו היא להנגיש ידע מקצועי ואיכותי בתחום התקשורת
            הבינאישית, בעברית, בצורה שמתאימה לכל אחד. אנחנו מפתחים קורסים
            מבוססי מחקר, עם תרגילים מעשיים, שמאפשרים למידה עמוקה בקצב אישי.
          </p>
        </section>

        {/* Values */}
        <section className="mb-16">
          <h2 className="mb-8 text-center text-2xl font-bold text-zinc-900 dark:text-white">
            הערכים שלנו
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {VALUES.map((value) => (
              <div
                key={value.title}
                className="rounded-xl border border-zinc-200 p-6 dark:border-zinc-800"
              >
                <div className="mb-3 text-zinc-600 dark:text-zinc-400">
                  {value.icon}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-white">
                  {value.title}
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Stats */}
        <section className="mb-16 rounded-2xl bg-zinc-900 p-8 text-center dark:bg-zinc-800 md:p-12">
          <h2 className="mb-8 text-2xl font-bold text-white">
            הדרך במספרים
          </h2>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div>
              <div className="text-3xl font-bold text-white">3+</div>
              <div className="mt-1 text-sm text-zinc-400">קורסים</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">17+</div>
              <div className="mt-1 text-sm text-zinc-400">שיעורים</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">9+</div>
              <div className="mt-1 text-sm text-zinc-400">בחנים</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">100%</div>
              <div className="mt-1 text-sm text-zinc-400">תוכן בעברית</div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <h2 className="mb-4 text-2xl font-bold text-zinc-900 dark:text-white">
            מוכנים להתחיל?
          </h2>
          <p className="mb-6 text-zinc-600 dark:text-zinc-400">
            הצטרפו אלינו והתחילו את המסע לתקשורת טובה יותר
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/courses"
              className="inline-flex h-12 items-center justify-center rounded-full bg-zinc-900 px-8 text-base font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
            >
              צפה בקורסים
            </Link>
            <Link
              href="/sign-up"
              className="inline-flex h-12 items-center justify-center rounded-full border border-zinc-300 px-8 text-base font-medium text-zinc-900 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-white dark:hover:bg-zinc-900"
            >
              הרשמה חינם
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
