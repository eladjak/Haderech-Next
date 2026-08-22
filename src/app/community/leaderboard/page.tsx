"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import Link from "next/link";
import { api } from "@/../convex/_generated/api";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

type Tab = "weekly" | "monthly" | "alltime";

const PERIODS: Array<{
  key: Tab;
  label: string;
  title: string;
  context: string;
}> = [
  {
    key: "weekly",
    label: "השבוע",
    title: "הפעילות שלי השבוע",
    context: "מבט קצר על הקצב הנוכחי, בלי להסיק ממנו מסקנות על היכולת שלך.",
  },
  {
    key: "monthly",
    label: "החודש",
    title: "הפעילות שלי החודש",
    context: "טווח מעט רחב יותר שעוזר לראות התמדה גם כששבוע אחד היה עמוס.",
  },
  {
    key: "alltime",
    label: "מתחילת הדרך",
    title: "הפעילות שלי מתחילת הדרך",
    context: "סיכום אישי של פעולות הלמידה שנשמרו בחשבון שלך.",
  },
];

function LevelBadge({ level }: { level: number }) {
  return (
    <span className="inline-flex items-center rounded-full bg-brand-100 px-3 py-1 text-sm font-bold text-brand-800 dark:bg-brand-950/40 dark:text-brand-300">
      רמה {level}
    </span>
  );
}

function LoadingState() {
  return (
    <div className="space-y-4" aria-label="טוען את ההתקדמות האישית">
      <div className="h-48 animate-pulse rounded-3xl bg-zinc-200 dark:bg-zinc-800" />
      <div className="grid gap-3 sm:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div
            key={item}
            className="h-28 animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800"
          />
        ))}
      </div>
    </div>
  );
}

export default function PersonalProgressPage() {
  const [activeTab, setActiveTab] = useState<Tab>("weekly");
  const progress = useQuery(api.leaderboard.getUserRank);

  const activePeriod = PERIODS.find((period) => period.key === activeTab)!;
  const activeXp = progress
    ? activeTab === "weekly"
      ? progress.weekXp
      : activeTab === "monthly"
        ? progress.monthXp
        : progress.totalXp
    : 0;
  const xpInLevel = progress ? progress.totalXp % 100 : 0;
  const nextLevelProgress = Math.min(100, xpInLevel);

  return (
    <div className="min-h-dvh bg-zinc-50 dark:bg-zinc-950" dir="rtl">
      <Header />

      <main
        id="main-content"
        className="container mx-auto max-w-5xl px-4 py-10"
      >
        <motion.header
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-teal-600 shadow-lg shadow-brand-200/50 dark:shadow-brand-950/30">
            <span className="text-3xl" aria-hidden="true">
              🧭
            </span>
          </div>
          <h1 className="mb-2 text-3xl font-black text-zinc-900 dark:text-white">
            ההתקדמות האישית שלי
          </h1>
          <p className="mx-auto max-w-2xl text-zinc-600 dark:text-zinc-400">
            מקום פרטי לראות מה עשית ולבחור את הצעד הבא. אין כאן תחרות בין
            לומדים, וה־XP אינו ציון לאיכות, לקצב או להצלחה שלך בקשרים.
          </p>
        </motion.header>

        <nav aria-label="ניווט בקהילה" className="mb-6 flex flex-wrap gap-2">
          <Link
            href="/community"
            className="rounded-full bg-white px-4 py-2 text-sm font-medium text-zinc-600 shadow-sm hover:bg-brand-50 hover:text-brand-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            קהילה
          </Link>
          <Link
            href="/community/challenges"
            className="rounded-full bg-white px-4 py-2 text-sm font-medium text-zinc-600 shadow-sm hover:bg-brand-50 hover:text-brand-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            אתגרים שבועיים
          </Link>
          <span
            aria-current="page"
            className="rounded-full bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm"
          >
            התקדמות אישית
          </span>
          <Link
            href="/community/rewards"
            className="rounded-full bg-white px-4 py-2 text-sm font-medium text-zinc-600 shadow-sm hover:bg-brand-50 hover:text-brand-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            חנות פרסים
          </Link>
        </nav>

        {progress === undefined ? (
          <LoadingState />
        ) : progress === null ? (
          <section className="rounded-3xl border border-zinc-200 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-2 text-xl font-bold text-zinc-900 dark:text-white">
              צריך להתחבר כדי לראות התקדמות אישית
            </h2>
            <p className="mb-5 text-zinc-600 dark:text-zinc-400">
              הנתונים נשארים פרטיים בחשבון שלך ואינם מוצגים ללומדים אחרים.
            </p>
            <Link
              href="/sign-in"
              className="inline-flex rounded-xl bg-brand-600 px-5 py-3 font-semibold text-white hover:bg-brand-700"
            >
              להתחברות
            </Link>
          </section>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(16rem,1fr)]">
            <div className="space-y-6">
              <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-7">
                <div
                  role="tablist"
                  aria-label="טווח להצגת ההתקדמות"
                  className="mb-7 grid grid-cols-3 gap-1 rounded-2xl bg-zinc-100 p-1 dark:bg-zinc-800"
                >
                  {PERIODS.map((period) => (
                    <button
                      key={period.key}
                      type="button"
                      role="tab"
                      aria-selected={activeTab === period.key}
                      onClick={() => setActiveTab(period.key)}
                      className={`rounded-xl px-2 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ${
                        activeTab === period.key
                          ? "bg-white text-brand-800 shadow-sm dark:bg-zinc-950 dark:text-brand-300"
                          : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                      }`}
                    >
                      {period.label}
                    </button>
                  ))}
                </div>

                <div aria-live="polite">
                  <p className="mb-1 text-sm font-semibold text-brand-700 dark:text-brand-300">
                    {activePeriod.title}
                  </p>
                  <div className="mb-2 flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <span className="text-5xl font-black text-zinc-900 dark:text-white">
                        {activeXp.toLocaleString()}
                      </span>
                      <span className="me-2 text-lg font-bold text-zinc-500 dark:text-zinc-400">
                        XP
                      </span>
                    </div>
                    <LevelBadge level={progress.level} />
                  </div>
                  <p className="max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                    {activePeriod.context}
                  </p>
                </div>

                <div className="mt-7 border-t border-zinc-100 pt-5 dark:border-zinc-800">
                  <div className="mb-2 flex justify-between gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                    <span>התקדמות לרמה הבאה</span>
                    <span>{xpInLevel}/100 XP</span>
                  </div>
                  <div
                    className="h-3 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700"
                    role="progressbar"
                    aria-label="התקדמות לרמה הבאה"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={nextLevelProgress}
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${nextLevelProgress}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className="h-full rounded-full bg-gradient-to-l from-brand-500 to-teal-500"
                    />
                  </div>
                </div>
              </section>

              <section aria-labelledby="period-summary-title">
                <h2
                  id="period-summary-title"
                  className="mb-3 text-lg font-bold text-zinc-900 dark:text-white"
                >
                  התמונה שלי בשלושה טווחים
                </h2>
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    { label: "השבוע", value: progress.weekXp },
                    { label: "החודש", value: progress.monthXp },
                    { label: "מתחילת הדרך", value: progress.totalXp },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                    >
                      <div className="text-2xl font-black text-zinc-900 dark:text-white">
                        {item.value.toLocaleString()}
                      </div>
                      <div className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                        XP {item.label}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {progress.totalXp === 0 && (
                <section className="rounded-2xl border border-sky-200 bg-sky-50 p-5 dark:border-sky-900/60 dark:bg-sky-950/20">
                  <h2 className="mb-1 font-bold text-sky-950 dark:text-sky-200">
                    מתחילים בצעד קטן
                  </h2>
                  <p className="text-sm leading-6 text-sky-900 dark:text-sky-300">
                    אין צורך “להדביק” אף אחד. אפשר לפתוח כלי אחד, להשלים שיעור
                    נגיש או לבחור תרגול קצר שמתאים למצב שלך היום.
                  </p>
                </section>
              )}
            </div>

            <aside className="space-y-4" aria-label="הצעות לצעד הבא">
              <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <h2 className="mb-2 font-bold text-zinc-900 dark:text-white">
                  מה ה־XP כן אומר?
                </h2>
                <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                  הוא מסכם פעולות שנשמרו במערכת. הוא יכול לעזור לזהות רצף, אבל
                  הוא לא מודד הבנה עמוקה, אומץ, איכות קשר או ערך אישי.
                </p>
              </section>

              <section className="rounded-2xl border border-brand-200 bg-brand-50 p-5 dark:border-brand-900/60 dark:bg-brand-950/20">
                <h2 className="mb-3 font-bold text-brand-950 dark:text-brand-200">
                  לבחור צעד המשך
                </h2>
                <div className="space-y-2">
                  <Link
                    href="/dashboard"
                    className="block rounded-xl bg-brand-600 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-brand-700"
                  >
                    להמשיך מהדשבורד
                  </Link>
                  <Link
                    href="/tools"
                    className="block rounded-xl border border-brand-200 bg-white px-4 py-3 text-center text-sm font-semibold text-brand-800 hover:bg-brand-100 dark:border-brand-800 dark:bg-zinc-900 dark:text-brand-300 dark:hover:bg-brand-950/40"
                  >
                    לבחור כלי קצר
                  </Link>
                  <Link
                    href="/community/challenges"
                    className="block px-4 py-2 text-center text-sm font-medium text-brand-800 underline-offset-4 hover:underline dark:text-brand-300"
                  >
                    לראות אתגר שבועי
                  </Link>
                </div>
              </section>
            </aside>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
