"use client";

import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

const TOOLS = [
  {
    id: "dating-profile",
    title: "בונה פרופיל דייטינג",
    description: "אשף 6 שלבים לבניית פרופיל דייטינג מלא עם טיפים, ניתוח ציון, וסקירת פרופיל חיה.",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
    ),
    href: "/tools/dating-profile",
    available: true,
    badge: "חדש",
  },
  {
    id: "profile-builder",
    title: "בונה ביו AI",
    description: "AI כותב לך ביו מקצועי לפרופיל דייטינג - מותאם לפלטפורמה, לאישיות שלך ולמה שאתה מחפש.",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
    href: "/tools/profile-builder",
    available: true,
    badge: "AI",
  },
  {
    id: "photo-analyzer",
    title: "ניתוח תמונות",
    description: "AI שמנתח את התמונות שלך ונותן טיפים לשיפור - זוויות, תאורה, ביטוי, לבוש.",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
      </svg>
    ),
    href: "/tools/photo-analyzer",
    available: false,
    badge: "בקרוב",
  },
  {
    id: "date-planner",
    title: "מתכנן דייטים",
    description: "קבל המלצות מותאמות אישית לדייט - מיקום, פעילות, שעה, ואווירה.",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
      </svg>
    ),
    href: "/tools/date-planner",
    available: false,
    badge: "בקרוב",
  },
  {
    id: "date-report",
    title: "ניתוח דייט",
    description: "אחרי כל דייט, ספר ל-AI מה קרה וקבל ניתוח מקצועי עם נקודות חוזק ושיפור.",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
      </svg>
    ),
    href: "/tools/date-report",
    available: false,
    badge: "בקרוב",
  },
  {
    id: "conversation-starters",
    title: "פותחי שיחה",
    description: "AI מייצר פותחי שיחה מותאמים למצב - דייט ראשון, אפליקציה, מפגש חברתי.",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
      </svg>
    ),
    href: "/tools/conversation-starters",
    available: true,
    badge: "חדש",
  },
  {
    id: "values-quiz",
    title: "מבחן ערכים",
    description: "גלה את הערכים הכי חשובים לך בזוגיות ומה חיוני שיהיה משותף עם הפרטנר.",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
    ),
    href: "/tools/values-quiz",
    available: true,
    badge: "חדש",
  },
];

export default function ToolsPage() {
  return (
    <div className="min-h-dvh bg-white dark:bg-zinc-950">
      <Header />

      <main className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-2 text-3xl font-bold text-blue-500 dark:text-white md:text-4xl">
            כלי דייטינג
          </h1>
          <p className="mb-8 text-lg text-zinc-500 dark:text-zinc-400">
            כלים חכמים שעוזרים לך בכל שלב בדרך לזוגיות
          </p>

          {/* Available tools */}
          <div className="mb-12">
            <div className="mb-6 flex items-center gap-2">
              <Link
                href="/chat"
                className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-600"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                </svg>
                צ&apos;אט AI מאמן
              </Link>
              <Link
                href="/simulator"
                className="flex items-center gap-2 rounded-lg border border-brand-200 px-4 py-2 text-sm font-medium text-brand-600 transition-colors hover:bg-brand-50 dark:border-brand-700 dark:text-brand-400 dark:hover:bg-zinc-900"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
                סימולטור דייטים
              </Link>
            </div>
          </div>

          {/* Tools grid */}
          <h2 className="mb-6 text-xl font-semibold text-zinc-900 dark:text-white">
            כלים נוספים
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TOOLS.map((tool) => (
              <div
                key={tool.id}
                className="group relative flex flex-col rounded-2xl border border-zinc-100 bg-white p-6 transition-shadow hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
              >
                {tool.badge && (
                  <span className="absolute left-4 top-4 rounded-full bg-accent-400/10 px-2.5 py-0.5 text-xs font-medium text-accent-400">
                    {tool.badge}
                  </span>
                )}
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-500 dark:bg-blue-500/10 dark:text-brand-400">
                  {tool.icon}
                </div>
                <h3 className="mb-2 text-base font-semibold text-zinc-900 dark:text-white">
                  {tool.title}
                </h3>
                <p className="flex-1 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                  {tool.description}
                </p>
                {tool.available ? (
                  <Link
                    href={tool.href}
                    className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-500 hover:text-brand-600 dark:text-brand-400"
                  >
                    התחל
                    <svg className="h-3.5 w-3.5 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </Link>
                ) : (
                  <p className="mt-4 text-xs text-zinc-400 dark:text-zinc-600">
                    יהיה זמין בקרוב
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
