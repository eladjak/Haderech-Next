"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/../convex/_generated/api";
import { Header } from "@/components/layout/header";
import Link from "next/link";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

function formatHebrewDate(date: Date): string {
  return new Intl.DateTimeFormat("he-IL", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

function formatShortDate(dayOfYear: number, year: number): string {
  // Convert dayOfYear back to a date for display
  const date = new Date(year, 0, dayOfYear);
  return new Intl.DateTimeFormat("he-IL", { month: "short", day: "numeric" }).format(date);
}

// ─── Confetti Component ───────────────────────────────────────────────────────

function Confetti({ active }: { active: boolean }) {
  const [particles, setParticles] = useState<
    Array<{ id: number; x: number; color: string; delay: number; size: number }>
  >([]);

  useEffect(() => {
    if (active) {
      const colors = ["#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899", "#ef4444"];
      const newParticles = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)] ?? "#f59e0b",
        delay: Math.random() * 0.5,
        size: Math.random() * 8 + 6,
      }));
      setParticles(newParticles);
      const timer = setTimeout(() => setParticles([]), 3000);
      return () => clearTimeout(timer);
    }
  }, [active]);

  if (!active || particles.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden="true">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute animate-bounce rounded-full"
          style={{
            left: `${p.x}%`,
            top: "-10px",
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${1 + Math.random()}s`,
            transform: `translateY(${Math.random() * 100 + 50}vh)`,
            transition: `transform 2s ease-in`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  value,
  label,
  icon,
  color,
}: {
  value: number | string;
  label: string;
  icon: string;
  color: string;
}) {
  return (
    <div className={`rounded-2xl border p-4 text-center ${color}`}>
      <div className="mb-1 text-2xl" aria-hidden="true">
        {icon}
      </div>
      <div className="text-2xl font-bold text-zinc-900 dark:text-white">{value}</div>
      <div className="text-xs text-zinc-500 dark:text-zinc-400">{label}</div>
    </div>
  );
}

// ─── Day Dot (calendar week view) ────────────────────────────────────────────

function DayDot({
  dayOfYear,
  year,
  completed,
  isToday,
  onClick,
}: {
  dayOfYear: number;
  year: number;
  completed: boolean;
  isToday: boolean;
  onClick: () => void;
}) {
  const date = new Date(year, 0, dayOfYear);
  const dayName = new Intl.DateTimeFormat("he-IL", { weekday: "short" }).format(date);
  const dayNum = date.getDate();

  return (
    <button
      type="button"
      onClick={onClick}
      title={`${dayName} ${dayNum}`}
      aria-label={`${dayName} ${dayNum} - ${completed ? "הושלם" : "לא הושלם"}`}
      className={`flex flex-col items-center gap-1 rounded-xl p-2 transition-all ${
        isToday
          ? "bg-brand-100 dark:bg-brand-900/40"
          : "hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
      }`}
    >
      <span className="text-[10px] text-zinc-500 dark:text-zinc-400">{dayName}</span>
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-all ${
          completed
            ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30"
            : isToday
              ? "border-2 border-brand-400 text-zinc-700 dark:text-zinc-200"
              : "border border-zinc-200 text-zinc-400 dark:border-zinc-700 dark:text-zinc-500"
        }`}
      >
        {completed ? (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        ) : (
          dayNum
        )}
      </div>
    </button>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DailyPage() {
  const { isSignedIn } = useUser();
  const today = new Date();
  const todayDoy = getDayOfYear(today);
  const todayYear = today.getFullYear();

  const [confetti, setConfetti] = useState(false);
  const [selectedDay, setSelectedDay] = useState<{ dayOfYear: number; year: number } | null>(null);

  const todayContent = useQuery(api.dailyContent.getTodayContent);
  const challengeStatus = useQuery(
    api.dailyContent.getTodayChallengeStatus,
    isSignedIn ? {} : "skip"
  );
  const weeklyChallengeStatus = useQuery(
    api.dailyContent.getWeeklyChallengeStatus,
    isSignedIn ? {} : "skip"
  );
  const streakData = useQuery(
    api.dailyContent.getChallengeStreak,
    isSignedIn ? {} : "skip"
  );
  const selectedContent = useQuery(
    api.dailyContent.getContentByDate,
    selectedDay ? { dayOfYear: selectedDay.dayOfYear, year: selectedDay.year } : "skip"
  );
  const markCompleted = useMutation(api.dailyContent.markChallengeCompleted);
  const seedContent = useMutation(api.dailyContent.seedDailyContent);

  const [seeding, setSeeding] = useState(false);
  const [completingChallenge, setCompletingChallenge] = useState(false);

  // Active content to display
  const activeContent = selectedDay ? selectedContent : todayContent;
  const isViewingToday = !selectedDay || (selectedDay.dayOfYear === todayDoy && selectedDay.year === todayYear);
  const isChallengeCompleted = isViewingToday ? !!challengeStatus?.completed : false;

  const currentStreak = streakData?.currentStreak ?? 0;
  const longestStreak = streakData?.longestStreak ?? 0;
  const totalCompleted = streakData?.totalCompleted ?? 0;
  const completionRate =
    totalCompleted > 0 && todayDoy > 0 ? Math.round((totalCompleted / todayDoy) * 100) : 0;

  async function handleCompleteChallenge() {
    if (!isSignedIn || !isViewingToday || completingChallenge) return;

    setCompletingChallenge(true);
    try {
      const result = await markCompleted({ dayOfYear: todayDoy, year: todayYear });
      if (result?.completed) {
        setConfetti(true);
      }
    } finally {
      setCompletingChallenge(false);
    }
  }

  async function handleSeed() {
    setSeeding(true);
    try {
      await seedContent({});
    } finally {
      setSeeding(false);
    }
  }

  // Loading state
  if (todayContent === undefined) {
    return (
      <div className="min-h-dvh bg-white dark:bg-zinc-950">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-40 animate-pulse rounded-3xl bg-zinc-100 dark:bg-zinc-800"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // No content state
  if (todayContent === null) {
    return (
      <div className="min-h-dvh bg-white dark:bg-zinc-950">
        <Header />
        <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 py-12 text-center">
          <div className="mb-4 text-5xl" aria-hidden="true">
            🌱
          </div>
          <h1 className="mb-2 text-2xl font-bold text-zinc-900 dark:text-white">
            תוכן יומי טרם נוסף
          </h1>
          <p className="mb-6 text-zinc-500 dark:text-zinc-400">
            לחץ על הכפתור כדי לאתחל 30 ימי תוכן השראה בעברית
          </p>
          <button
            type="button"
            disabled={seeding}
            onClick={handleSeed}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-l from-brand-600 to-brand-500 px-6 text-sm font-medium text-white shadow-md transition-all hover:brightness-110 disabled:opacity-50"
          >
            {seeding ? "מאתחל..." : "אתחל תוכן יומי"}
          </button>
        </div>
      </div>
    );
  }

  const displayContent = activeContent ?? todayContent;

  return (
    <div className="min-h-dvh bg-gradient-to-b from-white to-amber-50/30 dark:from-zinc-950 dark:to-zinc-900">
      <Header />
      <Confetti active={confetti} />

      <main id="main-content" className="container mx-auto px-4 py-10">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <span className="text-2xl" aria-hidden="true">
                  ☀️
                </span>
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
                  תוכן יומי
                </h1>
              </div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {formatHebrewDate(today)}
              </p>
            </div>
            {isSignedIn && (
              <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 dark:border-amber-700/40 dark:bg-amber-900/20">
                <span className="text-xl" aria-hidden="true">
                  🔥
                </span>
                <div>
                  <div className="text-lg font-bold leading-none text-amber-700 dark:text-amber-400">
                    {currentStreak}
                  </div>
                  <div className="text-[10px] text-amber-600 dark:text-amber-500">
                    {currentStreak === 1 ? "יום רצוף" : "ימים רצופים"}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats Row */}
        {isSignedIn && (
          <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard
              value={totalCompleted}
              label="אתגרים שהושלמו"
              icon="✅"
              color="border-emerald-100 bg-emerald-50 dark:border-emerald-800/40 dark:bg-emerald-900/20"
            />
            <StatCard
              value={currentStreak}
              label="סטריק נוכחי"
              icon="🔥"
              color="border-amber-100 bg-amber-50 dark:border-amber-800/40 dark:bg-amber-900/20"
            />
            <StatCard
              value={longestStreak}
              label="סטריק ארוך ביותר"
              icon="🏆"
              color="border-purple-100 bg-purple-50 dark:border-purple-800/40 dark:bg-purple-900/20"
            />
            <StatCard
              value={`${completionRate}%`}
              label="אחוז השלמה"
              icon="📊"
              color="border-blue-100 bg-blue-50 dark:border-blue-800/40 dark:bg-blue-900/20"
            />
          </div>
        )}

        {/* Week Calendar */}
        {isSignedIn && weeklyChallengeStatus && weeklyChallengeStatus.length > 0 && (
          <div className="mb-8 rounded-2xl border border-zinc-100 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              7 הימים האחרונים
            </h2>
            <div className="flex justify-around gap-1">
              {[...weeklyChallengeStatus].reverse().map((day) => (
                <DayDot
                  key={`${day.year}-${day.dayOfYear}`}
                  dayOfYear={day.dayOfYear}
                  year={day.year}
                  completed={day.completed}
                  isToday={day.dayOfYear === todayDoy && day.year === todayYear}
                  onClick={() => {
                    if (day.dayOfYear === todayDoy && day.year === todayYear) {
                      setSelectedDay(null);
                    } else {
                      setSelectedDay({ dayOfYear: day.dayOfYear, year: day.year });
                    }
                  }}
                />
              ))}
            </div>
            {selectedDay && (
              <div className="mt-3 flex items-center justify-between border-t border-zinc-100 pt-3 dark:border-zinc-800">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  מציג תוכן מ-{formatShortDate(selectedDay.dayOfYear, selectedDay.year)}
                </p>
                <button
                  type="button"
                  onClick={() => setSelectedDay(null)}
                  className="text-xs text-brand-600 hover:underline dark:text-brand-400"
                >
                  חזור להיום
                </button>
              </div>
            )}
          </div>
        )}

        {/* Today's Content Cards */}
        <div className="space-y-5">
          {/* Tip Card */}
          {displayContent?.tip && (
            <article className="overflow-hidden rounded-3xl border border-amber-200/80 bg-gradient-to-br from-amber-50 to-yellow-50/60 p-6 shadow-sm dark:border-amber-800/40 dark:from-amber-950/40 dark:to-yellow-950/20">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-xl dark:bg-amber-900/40" aria-hidden="true">
                  💡
                </div>
                <div>
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
                    טיפ יומי
                  </span>
                  <p className="mt-0.5 text-[10px] text-amber-600/70 dark:text-amber-500/70">
                    {displayContent.tip.category}
                  </p>
                </div>
              </div>
              <p className="text-base leading-relaxed text-zinc-700 dark:text-zinc-200">
                {displayContent.tip.content}
              </p>
            </article>
          )}

          {/* Quote Card */}
          {displayContent?.quote && (
            <article className="overflow-hidden rounded-3xl border border-blue-200/80 bg-gradient-to-br from-blue-50 to-indigo-50/60 p-6 shadow-sm dark:border-blue-800/40 dark:from-blue-950/40 dark:to-indigo-950/20">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-100 text-xl dark:bg-blue-900/40" aria-hidden="true">
                  💬
                </div>
                <div>
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                    ציטוט השראה
                  </span>
                  <p className="mt-0.5 text-[10px] text-blue-600/70 dark:text-blue-500/70">
                    {displayContent.quote.category}
                  </p>
                </div>
              </div>
              {/* Decorative quote marks */}
              <div className="relative">
                <span
                  className="absolute -top-2 -right-1 text-5xl leading-none text-blue-200 dark:text-blue-800/60 select-none"
                  aria-hidden="true"
                >
                  &#8221;
                </span>
                <blockquote className="relative pr-5 text-base italic leading-relaxed text-zinc-700 dark:text-zinc-200">
                  {displayContent.quote.content}
                </blockquote>
              </div>
              {displayContent.quote.author && (
                <p className="mt-3 text-sm font-medium text-blue-600 dark:text-blue-400">
                  — {displayContent.quote.author}
                </p>
              )}
            </article>
          )}

          {/* Challenge Card */}
          {displayContent?.challenge && (
            <article className="overflow-hidden rounded-3xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50 to-teal-50/60 p-6 shadow-sm dark:border-emerald-800/40 dark:from-emerald-950/40 dark:to-teal-950/20">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-xl dark:bg-emerald-900/40" aria-hidden="true">
                    🎯
                  </div>
                  <div>
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                      אתגר יומי
                    </span>
                    <p className="mt-0.5 text-[10px] text-emerald-600/70 dark:text-emerald-500/70">
                      {displayContent.challenge.category}
                    </p>
                  </div>
                </div>
                {/* Streak badge */}
                {isSignedIn && currentStreak > 0 && isViewingToday && (
                  <div className="flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 dark:border-amber-700/40 dark:bg-amber-900/20">
                    <span className="text-sm" aria-hidden="true">🔥</span>
                    <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                      {currentStreak}
                    </span>
                  </div>
                )}
              </div>

              <p className="mb-5 text-base leading-relaxed text-zinc-700 dark:text-zinc-200">
                {displayContent.challenge.content}
              </p>

              {/* Complete challenge button */}
              {isSignedIn && isViewingToday ? (
                <button
                  type="button"
                  onClick={handleCompleteChallenge}
                  disabled={completingChallenge}
                  aria-pressed={isChallengeCompleted}
                  className={`inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 ${
                    isChallengeCompleted
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                      : "bg-emerald-600 text-white shadow-md shadow-emerald-500/30 hover:bg-emerald-700 hover:shadow-lg dark:bg-emerald-700 dark:hover:bg-emerald-600"
                  }`}
                >
                  {completingChallenge ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      שומר...
                    </>
                  ) : isChallengeCompleted ? (
                    <>
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      האתגר הושלם! לחץ לביטול
                    </>
                  ) : (
                    <>
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      סיימתי את האתגר היום!
                    </>
                  )}
                </button>
              ) : !isSignedIn ? (
                <Link
                  href="/sign-in"
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-zinc-100 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                >
                  התחבר/י כדי לעקוב אחרי האתגרים
                </Link>
              ) : null}
            </article>
          )}
        </div>

        {/* Empty state for selected day */}
        {selectedDay && selectedContent === null && (
          <div className="mt-4 rounded-2xl border border-zinc-100 bg-zinc-50 p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-zinc-500 dark:text-zinc-400">
              אין תוכן זמין לתאריך זה
            </p>
          </div>
        )}

        {/* Bottom inspirational note */}
        <div className="mt-8 rounded-2xl border border-brand-100 bg-gradient-to-l from-brand-50 to-indigo-50/50 p-5 dark:border-brand-800/40 dark:from-brand-950/30 dark:to-indigo-950/20">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            <span className="font-semibold text-brand-700 dark:text-brand-400">טיפ: </span>
            שמור/י על הרגל יומי - אפילו 5 דקות של קריאה ואתגר קטן יכולות לשנות את הגישה שלך לאורך זמן.
          </p>
        </div>
      </main>
    </div>
  );
}
