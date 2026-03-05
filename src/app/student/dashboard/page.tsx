"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import Link from "next/link";
import { api } from "@/../convex/_generated/api";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ContinueLearning } from "@/components/dashboard/continue-learning";
import { WeeklyGoal } from "@/components/dashboard/weekly-goal";
import { LearningStats } from "@/components/dashboard/learning-stats";
import { RecommendedCourses } from "@/components/dashboard/recommended-courses";

// ==========================================
// Phase 39 - Advanced Student Dashboard
// ==========================================

export default function StudentDashboardPage() {
  const { user: clerkUser } = useUser();

  const overview = useQuery(api.studentAnalytics.getStudentOverview);

  const isLoading = overview === undefined;

  return (
    <div className="min-h-dvh bg-white dark:bg-zinc-950">
      <Header />

      <main className="container mx-auto px-4 py-8 sm:py-12">
        {/* Breadcrumb */}
        <nav
          className="mb-6 text-sm text-zinc-500 dark:text-zinc-400"
          aria-label="ניווט"
        >
          <Link
            href="/dashboard"
            className="hover:text-zinc-900 dark:hover:text-white"
          >
            דשבורד
          </Link>
          <span className="mx-2">/</span>
          <span className="text-zinc-900 dark:text-white">
            מעקב התקדמות מתקדם
          </span>
        </nav>

        {/* Page Title */}
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
              מעקב התקדמות
            </h1>
            <p className="mt-1 text-zinc-600 dark:text-zinc-400">
              {clerkUser?.firstName
                ? `${clerkUser.firstName}, הנה סקירת הלמידה שלך`
                : "הנה סקירת הלמידה שלך"}
            </p>
          </div>
        </div>

        {isLoading ? (
          <DashboardSkeleton />
        ) : !overview ? (
          <NotAuthenticatedState />
        ) : overview.enrollments === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* ===== Row 0: Continue Learning (full width) ===== */}
            <section className="mb-8" aria-label="המשך ללמוד">
              <ContinueLearning />
            </section>

            {/* ===== Row 1: Weekly Goal + Learning Stats ===== */}
            <section className="mb-8 grid gap-6 lg:grid-cols-2" aria-label="יעד שבועי וסטטיסטיקות">
              <WeeklyGoal />
              <LearningStats />
            </section>

            {/* ===== Row 2: Hero Stats (4 cards) ===== */}
            <section className="mb-8" aria-label="סטטיסטיקות ראשיות">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* Level & XP */}
                <div className="relative overflow-hidden rounded-2xl border border-brand-200/50 bg-gradient-to-br from-brand-50 to-brand-100/50 p-5 dark:border-brand-800/30 dark:from-brand-950/50 dark:to-brand-900/30">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-medium text-brand-600 dark:text-brand-400">
                      רמה & XP
                    </span>
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:bg-brand-400/10 dark:text-brand-400">
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-zinc-900 dark:text-white">
                    רמה {overview.level}
                  </p>
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    {overview.totalXp} XP סה&quot;כ
                  </p>
                  {/* XP progress bar to next level */}
                  <div className="mt-3">
                    <div className="mb-1 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                      <span>התקדמות לרמה הבאה</span>
                      <span>
                        {overview.xpInCurrentLevel}/
                        {overview.xpNeededForNextLevel}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-brand-200/50 dark:bg-brand-800/30">
                      <div
                        className="h-full rounded-full bg-gradient-to-l from-brand-500 to-brand-600 transition-all duration-500"
                        style={{
                          width: `${overview.xpNeededForNextLevel > 0 ? Math.round((overview.xpInCurrentLevel / overview.xpNeededForNextLevel) * 100) : 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Lessons Completed */}
                <div className="relative overflow-hidden rounded-2xl border border-emerald-200/50 bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-5 dark:border-emerald-800/30 dark:from-emerald-950/50 dark:to-emerald-900/30">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                      שיעורים הושלמו
                    </span>
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400">
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                        />
                      </svg>
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-zinc-900 dark:text-white">
                    {overview.completedLessons}
                    <span className="text-lg font-normal text-zinc-400 dark:text-zinc-500">
                      /{overview.totalLessons}
                    </span>
                  </p>
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    {overview.totalLessons > 0
                      ? `${Math.round((overview.completedLessons / overview.totalLessons) * 100)}% הושלם`
                      : "אין שיעורים"}
                  </p>
                </div>

                {/* Watch Time */}
                <div className="relative overflow-hidden rounded-2xl border border-blue-200/50 bg-gradient-to-br from-blue-50 to-blue-100/50 p-5 dark:border-blue-800/30 dark:from-blue-950/50 dark:to-blue-900/30">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                      זמן צפייה
                    </span>
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400">
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-zinc-900 dark:text-white">
                    {formatWatchTime(overview.totalWatchTime)}
                  </p>
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    שעות למידה
                  </p>
                </div>

                {/* Badges Earned */}
                <div className="relative overflow-hidden rounded-2xl border border-amber-200/50 bg-gradient-to-br from-amber-50 to-amber-100/50 p-5 dark:border-amber-800/30 dark:from-amber-950/50 dark:to-amber-900/30">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
                      הישגים
                    </span>
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400">
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.003 6.003 0 01-5.54 0"
                        />
                      </svg>
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-zinc-900 dark:text-white">
                    {overview.badgeCount}
                  </p>
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    {overview.certificateCount > 0
                      ? `+ ${overview.certificateCount} תעודות`
                      : "תגים שהושגו"}
                  </p>
                </div>
              </div>
            </section>

            {/* ===== Row 3: Weekly Activity Chart ===== */}
            <section className="mb-8" aria-label="פעילות שבועית">
              <div className="rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <h2 className="mb-5 text-lg font-semibold text-zinc-900 dark:text-white">
                  פעילות שבועית
                </h2>
                <WeeklyActivityChart
                  weeklyActivity={overview.weeklyActivity}
                />
              </div>
            </section>

            {/* ===== Row 4: Course Progress ===== */}
            {overview.courseProgress.length > 0 && (
              <section className="mb-8" aria-label="התקדמות בקורסים">
                <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">
                  התקדמות בקורסים
                </h2>
                <div className="space-y-4">
                  {overview.courseProgress.map((course) => (
                    <CourseProgressCard
                      key={course.courseId}
                      title={course.title}
                      completedLessons={course.completedLessons}
                      totalLessons={course.totalLessons}
                      percent={course.percent}
                      lastActivity={course.lastActivity}
                      courseId={course.courseId}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* ===== Row 5: Recommended Courses ===== */}
            <section className="mb-8" aria-label="קורסים מומלצים">
              <RecommendedCourses />
            </section>

            {/* ===== Row 6: Quick Actions (3 cards) ===== */}
            <section className="mb-8" aria-label="פעולות מהירות">
              <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">
                פעולות מהירות
              </h2>
              <div className="grid gap-4 sm:grid-cols-3">
                <QuickActionCard
                  href="/chat"
                  title="שיחה עם מאמן"
                  description="שוחח עם מאמן AI לייעוץ מותאם אישית"
                  icon="chat"
                  color="brand"
                />
                <QuickActionCard
                  href="/simulator"
                  title="סימולטור דייטים"
                  description="תרגל מצבים אמיתיים בסביבה בטוחה"
                  icon="simulator"
                  color="purple"
                />
                <QuickActionCard
                  href="/student/badges"
                  title="הישגים"
                  description="צפה בכל ההישגים והתגים שלך"
                  icon="badges"
                  color="amber"
                />
              </div>
            </section>

            {/* ===== Row 7: Recent Activity Feed ===== */}
            {overview.recentXpEvents.length > 0 && (
              <section className="mb-8" aria-label="פעילות אחרונה">
                <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">
                  פעילות אחרונה
                </h2>
                <div className="rounded-2xl border border-zinc-200/70 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                  <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {overview.recentXpEvents.map((event, idx) => (
                      <div
                        key={`${event.type}-${event.createdAt}-${idx}`}
                        className="flex items-center gap-4 px-5 py-4"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
                          <XpEventIcon type={event.type} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-zinc-900 dark:text-white">
                            {event.description}
                          </p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            {formatRelativeTime(event.createdAt)}
                          </p>
                        </div>
                        <span className="shrink-0 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                          +{event.points} XP
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

// ==========================================
// Weekly Activity Bar Chart (CSS-only)
// ==========================================

function WeeklyActivityChart({
  weeklyActivity,
}: {
  weeklyActivity: Record<string, number>;
}) {
  const entries = Object.entries(weeklyActivity);
  // Reverse so it shows Sunday on the right (RTL)
  const reversed = [...entries].reverse();
  const maxValue = Math.max(...entries.map(([, v]) => v), 1);

  return (
    <div className="flex items-end justify-between gap-2 sm:gap-4">
      {reversed.map(([day, count]) => {
        const heightPercent = (count / maxValue) * 100;
        return (
          <div key={day} className="flex flex-1 flex-col items-center gap-2">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              {count}
            </span>
            <div className="relative w-full max-w-[48px]">
              <div className="h-28 w-full rounded-lg bg-zinc-100 dark:bg-zinc-800">
                <div
                  className="absolute bottom-0 left-0 w-full rounded-lg bg-gradient-to-t from-brand-500 to-brand-400 transition-all duration-500 dark:from-brand-600 dark:to-brand-400"
                  style={{
                    height: count > 0 ? `${Math.max(heightPercent, 8)}%` : "0%",
                  }}
                />
              </div>
            </div>
            <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              {day}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ==========================================
// Course Progress Card
// ==========================================

function CourseProgressCard({
  title,
  completedLessons,
  totalLessons,
  percent,
  lastActivity,
  courseId,
}: {
  title: string;
  completedLessons: number;
  totalLessons: number;
  percent: number;
  lastActivity: number;
  courseId: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
            {title}
          </h3>
          <div className="mt-1 flex items-center gap-3 text-sm text-zinc-500 dark:text-zinc-400">
            <span>
              {completedLessons}/{totalLessons} שיעורים
            </span>
            {lastActivity > 0 && (
              <>
                <span className="text-zinc-300 dark:text-zinc-700">|</span>
                <span>פעילות אחרונה: {formatRelativeTime(lastActivity)}</span>
              </>
            )}
          </div>
          {/* Progress bar */}
          <div className="mt-3">
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="text-zinc-500 dark:text-zinc-400">
                {percent}% הושלם
              </span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  percent === 100
                    ? "bg-emerald-500 dark:bg-emerald-400"
                    : "bg-gradient-to-l from-brand-500 to-brand-400"
                }`}
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        </div>
        <Link
          href={`/courses/${courseId}`}
          className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-gradient-to-l from-brand-500 to-brand-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md hover:brightness-110"
        >
          {percent === 100 ? "צפה בקורס" : "המשך ללמוד"}
        </Link>
      </div>
    </div>
  );
}

// ==========================================
// Quick Action Card
// ==========================================

function QuickActionCard({
  href,
  title,
  description,
  icon,
  color,
}: {
  href: string;
  title: string;
  description: string;
  icon: "chat" | "simulator" | "badges";
  color: "brand" | "purple" | "amber";
}) {
  const colorClasses = {
    brand: {
      border:
        "border-brand-200/50 dark:border-brand-800/30",
      bg: "bg-gradient-to-br from-brand-50 to-brand-100/30 dark:from-brand-950/30 dark:to-brand-900/20",
      iconBg:
        "bg-brand-500/10 text-brand-600 dark:bg-brand-400/10 dark:text-brand-400",
    },
    purple: {
      border:
        "border-purple-200/50 dark:border-purple-800/30",
      bg: "bg-gradient-to-br from-purple-50 to-purple-100/30 dark:from-purple-950/30 dark:to-purple-900/20",
      iconBg:
        "bg-purple-500/10 text-purple-600 dark:bg-purple-400/10 dark:text-purple-400",
    },
    amber: {
      border:
        "border-amber-200/50 dark:border-amber-800/30",
      bg: "bg-gradient-to-br from-amber-50 to-amber-100/30 dark:from-amber-950/30 dark:to-amber-900/20",
      iconBg:
        "bg-amber-500/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400",
    },
  };

  const classes = colorClasses[color];

  return (
    <Link
      href={href}
      className={`group rounded-2xl border ${classes.border} ${classes.bg} p-5 transition-all hover:shadow-md`}
    >
      <div className="mb-3 flex items-center gap-3">
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${classes.iconBg}`}
        >
          <QuickActionIcon icon={icon} />
        </span>
        <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
          {title}
        </h3>
      </div>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{description}</p>
    </Link>
  );
}

function QuickActionIcon({ icon }: { icon: "chat" | "simulator" | "badges" }) {
  switch (icon) {
    case "chat":
      return (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
          />
        </svg>
      );
    case "simulator":
      return (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
          />
        </svg>
      );
    case "badges":
      return (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.003 6.003 0 01-5.54 0"
          />
        </svg>
      );
  }
}

// ==========================================
// XP Event Icon
// ==========================================

function XpEventIcon({ type }: { type: string }) {
  switch (type) {
    case "lesson_complete":
      return (
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342"
          />
        </svg>
      );
    case "quiz_pass":
      return (
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      );
    case "streak_day":
      return (
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.047 8.287 8.287 0 009 9.601a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z"
          />
        </svg>
      );
    case "chat_session":
      return (
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
          />
        </svg>
      );
    default:
      return (
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
          />
        </svg>
      );
  }
}

// ==========================================
// Helper Functions
// ==========================================

function formatWatchTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}`;
  }
  return `0:${String(minutes).padStart(2, "0")}`;
}

function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diffMs = now - timestamp;
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMinutes < 1) return "עכשיו";
  if (diffMinutes < 60) return `לפני ${diffMinutes} דקות`;
  if (diffHours < 24) return `לפני ${diffHours} שעות`;
  if (diffDays < 7) return `לפני ${diffDays} ימים`;

  return new Intl.DateTimeFormat("he-IL").format(new Date(timestamp));
}

// ==========================================
// Loading Skeleton
// ==========================================

function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-8">
      {/* Continue Learning */}
      <div className="h-24 rounded-2xl bg-zinc-100 dark:bg-zinc-800" />
      {/* Weekly Goal + Learning Stats */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-48 rounded-2xl bg-zinc-100 dark:bg-zinc-800" />
        <div className="grid gap-3 sm:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-[5.5rem] rounded-2xl bg-zinc-100 dark:bg-zinc-800"
            />
          ))}
        </div>
      </div>
      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-40 rounded-2xl bg-zinc-100 dark:bg-zinc-800"
          />
        ))}
      </div>
      {/* Weekly chart */}
      <div className="h-52 rounded-2xl bg-zinc-100 dark:bg-zinc-800" />
      {/* Course cards */}
      <div className="space-y-4">
        {[...Array(2)].map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-2xl bg-zinc-100 dark:bg-zinc-800"
          />
        ))}
      </div>
      {/* Recommended courses */}
      <div className="h-56 rounded-2xl bg-zinc-100 dark:bg-zinc-800" />
      {/* Quick actions */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-2xl bg-zinc-100 dark:bg-zinc-800"
          />
        ))}
      </div>
    </div>
  );
}

// ==========================================
// Empty States
// ==========================================

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/30">
        <svg
          className="h-8 w-8 text-brand-600 dark:text-brand-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
          />
        </svg>
      </div>
      <h2 className="mb-2 text-xl font-semibold text-zinc-900 dark:text-white">
        עדיין לא נרשמת לקורסים
      </h2>
      <p className="mb-6 max-w-md text-zinc-500 dark:text-zinc-400">
        התחל את המסע שלך ולמד איך לבנות מערכות יחסים בריאות ומספקות
      </p>
      <Link
        href="/courses"
        className="inline-flex min-h-[44px] items-center rounded-xl bg-gradient-to-l from-brand-500 to-brand-600 px-6 py-3 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md hover:brightness-110"
      >
        עיין בקורסים
      </Link>
    </div>
  );
}

function NotAuthenticatedState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <h2 className="mb-2 text-xl font-semibold text-zinc-900 dark:text-white">
        יש להתחבר כדי לצפות בהתקדמות
      </h2>
      <p className="mb-6 text-zinc-500 dark:text-zinc-400">
        התחבר או הירשם כדי לעקוב אחר הלמידה שלך
      </p>
      <Link
        href="/sign-in"
        className="inline-flex min-h-[44px] items-center rounded-xl bg-gradient-to-l from-brand-500 to-brand-600 px-6 py-3 text-sm font-medium text-white shadow-sm"
      >
        התחבר
      </Link>
    </div>
  );
}
