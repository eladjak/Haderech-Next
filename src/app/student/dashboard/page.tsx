"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import Link from "next/link";
import { api } from "@/../convex/_generated/api";
import { Header } from "@/components/layout/header";
import { ProgressBar } from "@/components/ui/progress-bar";
import {
  BadgeCard,
  StreakDisplay,
} from "@/components/gamification/badge-icon";

export default function StudentDashboardPage() {
  const { user: clerkUser } = useUser();

  const convexUser = useQuery(
    api.users.getByClerkId,
    clerkUser?.id ? { clerkId: clerkUser.id } : "skip"
  );

  // Core data queries
  const overview = useQuery(
    api.analytics.getStudentOverview,
    convexUser?._id ? { userId: convexUser._id } : "skip"
  );

  const courseProgress = useQuery(
    api.analytics.getCourseProgress,
    convexUser?._id ? { userId: convexUser._id } : "skip"
  );

  const continueData = useQuery(
    api.analytics.getContinueLearningData,
    convexUser?._id ? { userId: convexUser._id } : "skip"
  );

  const certificates = useQuery(
    api.certificates.listByUser,
    convexUser?._id ? { userId: convexUser._id } : "skip"
  );

  const quizHistory = useQuery(
    api.analytics.getQuizScoreHistory,
    convexUser?._id ? { userId: convexUser._id } : "skip"
  );

  const xpData = useQuery(
    api.gamification.getUserXP,
    convexUser?._id ? { userId: convexUser._id } : "skip"
  );

  const badgesData = useQuery(
    api.gamification.getUserBadges,
    convexUser?._id ? { userId: convexUser._id } : "skip"
  );

  const streakData = useQuery(
    api.gamification.getDailyStreak,
    convexUser?._id ? { userId: convexUser._id } : "skip"
  );

  const isLoading =
    overview === undefined ||
    courseProgress === undefined ||
    certificates === undefined;

  const enrolledCount = overview?.enrolledCourses ?? 0;
  const completedLessonsCount = overview?.completedLessons ?? 0;
  const avgQuizScore = overview?.averageQuizScore ?? 0;
  const certificateCount = certificates?.length ?? 0;
  const earnedBadges = badgesData?.badges.filter((b) => b.earned) ?? [];

  return (
    <div className="min-h-dvh bg-white dark:bg-zinc-950">
      <Header />

      <main className="container mx-auto px-4 py-12">
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
          <span className="text-zinc-900 dark:text-white">מעקב התקדמות</span>
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
          {xpData && (
            <div className="flex items-center gap-3">
              <span className="flex h-9 items-center rounded-full bg-emerald-100 px-4 text-sm font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                רמה {xpData.level}
              </span>
              <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                {xpData.totalXP} XP
              </span>
            </div>
          )}
        </div>

        {isLoading ? (
          <DashboardSkeleton />
        ) : enrolledCount === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* ===== Section 1: Quick Stats ===== */}
            <section className="mb-10" aria-label="סטטיסטיקות מהירות">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <QuickStatCard
                  title="קורסים רשומים"
                  value={String(enrolledCount)}
                  icon="courses"
                  href="/courses"
                />
                <QuickStatCard
                  title="שיעורים הושלמו"
                  value={String(completedLessonsCount)}
                  icon="lessons"
                />
                <QuickStatCard
                  title="ציון ממוצע בבחנים"
                  value={avgQuizScore > 0 ? `${avgQuizScore}%` : "--"}
                  icon="score"
                  href="/student/analytics"
                />
                <QuickStatCard
                  title="תעודות סיום"
                  value={String(certificateCount)}
                  icon="certificates"
                  href="/certificates"
                />
              </div>
            </section>

            {/* ===== Section 2: Continue Learning ===== */}
            {continueData && (
              <section className="mb-10" aria-label="המשך ללמוד">
                <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-white">
                  המשך ללמוד
                </h2>
                <div className="grid gap-4 lg:grid-cols-3">
                  {/* Primary course - takes 2 columns */}
                  <div className="lg:col-span-2">
                    <ContinueLearningCard course={continueData.primary} />
                  </div>

                  {/* Other in-progress courses */}
                  {continueData.otherCourses.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                        קורסים נוספים בהתקדמות
                      </p>
                      {continueData.otherCourses.map((course) => (
                        <MiniCourseCard key={course.courseId} course={course} />
                      ))}
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* ===== Section 3: Course Progress Breakdown ===== */}
            {courseProgress && courseProgress.length > 0 && (
              <section className="mb-10" aria-label="התקדמות בקורסים">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
                    התקדמות בקורסים
                  </h2>
                  <Link
                    href="/student/analytics"
                    className="text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                  >
                    אנליטיקס מלא
                  </Link>
                </div>
                <div className="space-y-4">
                  {courseProgress.map((course) => {
                    // Find quiz scores for this course
                    const courseQuizzes =
                      quizHistory?.filter(
                        (q) => q.courseTitle === course.courseTitle
                      ) ?? [];
                    const bestScore =
                      courseQuizzes.length > 0
                        ? Math.max(...courseQuizzes.map((q) => q.score))
                        : null;
                    const avgCourseScore =
                      courseQuizzes.length > 0
                        ? Math.round(
                            courseQuizzes.reduce((s, q) => s + q.score, 0) /
                              courseQuizzes.length
                          )
                        : null;

                    return (
                      <CourseProgressRow
                        key={course.courseId}
                        courseId={course.courseId}
                        courseTitle={course.courseTitle}
                        completedLessons={course.completedLessons}
                        totalLessons={course.totalLessons}
                        completionPercent={course.completionPercent}
                        hasCertificate={course.hasCertificate}
                        bestQuizScore={bestScore}
                        avgQuizScore={avgCourseScore}
                      />
                    );
                  })}
                </div>
              </section>
            )}

            {/* ===== Section 4: Achievements & Badges ===== */}
            {badgesData && (
              <section className="mb-10" aria-label="הישגים ותגים">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
                    הישגים ותגים
                  </h2>
                  <Link
                    href="/student/profile"
                    className="text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                  >
                    פרופיל מלא
                  </Link>
                </div>

                {/* Overall badges progress */}
                <div className="mb-4 rounded-2xl bg-zinc-50 p-5 dark:bg-zinc-900">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                      התקדמות הישגים
                    </span>
                    <span className="text-sm font-bold text-zinc-900 dark:text-white">
                      {badgesData.earnedCount}/{badgesData.totalCount} (
                      {badgesData.completionPercent}%)
                    </span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
                    <div
                      className="h-full rounded-full bg-amber-500 transition-all duration-500 dark:bg-amber-400"
                      style={{
                        width: `${badgesData.completionPercent}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Earned badges */}
                {earnedBadges.length > 0 && (
                  <div className="mb-4">
                    <p className="mb-3 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                      הישגים שהושגו ({earnedBadges.length})
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {earnedBadges.map((badge) => (
                        <BadgeCard key={badge.id} badge={badge} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Locked badges */}
                {badgesData.badges.filter((b) => !b.earned).length > 0 && (
                  <div>
                    <p className="mb-3 text-sm font-medium text-zinc-400 dark:text-zinc-500">
                      הישגים נעולים (
                      {badgesData.badges.filter((b) => !b.earned).length})
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {badgesData.badges
                        .filter((b) => !b.earned)
                        .map((badge) => (
                          <BadgeCard key={badge.id} badge={badge} />
                        ))}
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* ===== Section 5: Certificates ===== */}
            {certificateCount > 0 && certificates && (
              <section className="mb-10" aria-label="תעודות סיום">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
                    תעודות סיום
                  </h2>
                  <Link
                    href="/certificates"
                    className="text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                  >
                    הצג הכל
                  </Link>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {certificates.map((cert) => (
                    <CertificateMiniCard
                      key={cert._id}
                      courseName={cert.courseName}
                      certificateNumber={cert.certificateNumber}
                      issuedAt={cert.issuedAt}
                      completionPercent={cert.completionPercent}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* ===== Section 6: Streak ===== */}
            {streakData && (
              <section className="mb-10" aria-label="רצף למידה">
                <StreakDisplay streak={streakData} />
              </section>
            )}

            {/* ===== Section 7: Recent Quiz Scores ===== */}
            {quizHistory && quizHistory.length > 0 && (
              <section className="mb-10" aria-label="ציוני בחנים אחרונים">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
                    ציוני בחנים אחרונים
                  </h2>
                  <Link
                    href="/student/analytics"
                    className="text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                  >
                    הצג היסטוריה מלאה
                  </Link>
                </div>
                <div className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800">
                  <table className="w-full text-right text-sm">
                    <thead className="bg-zinc-50 dark:bg-zinc-900">
                      <tr>
                        <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">
                          בוחן
                        </th>
                        <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">
                          קורס
                        </th>
                        <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">
                          ציון
                        </th>
                        <th className="hidden px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400 sm:table-cell">
                          תאריך
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                      {quizHistory.slice(0, 5).map((attempt) => (
                        <tr
                          key={attempt.attemptId}
                          className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                        >
                          <td className="px-4 py-3 font-medium text-zinc-900 dark:text-white">
                            {attempt.quizTitle}
                          </td>
                          <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                            {attempt.courseTitle}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold ${
                                attempt.passed
                                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                  : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                              }`}
                            >
                              {attempt.score}%
                            </span>
                          </td>
                          <td className="hidden px-4 py-3 text-zinc-500 dark:text-zinc-400 sm:table-cell">
                            {new Intl.DateTimeFormat("he-IL").format(
                              new Date(attempt.attemptedAt)
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* Quick Nav Links */}
            <section className="mt-12">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <QuickLink
                  href="/student/analytics"
                  title="אנליטיקס"
                  description="גרפים וסטטיסטיקות מפורטות"
                />
                <QuickLink
                  href="/student/leaderboard"
                  title="לוח מובילים"
                  description="ראה את הדירוג שלך"
                />
                <QuickLink
                  href="/student/profile"
                  title="פרופיל"
                  description="צפה בכל ההישגים שלך"
                />
                <QuickLink
                  href="/courses"
                  title="קטלוג קורסים"
                  description="גלה קורסים חדשים"
                />
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function QuickStatCard({
  title,
  value,
  icon,
  href,
}: {
  title: string;
  value: string;
  icon: string;
  href?: string;
}) {
  const content = (
    <div className="rounded-2xl bg-zinc-50 p-5 transition-colors hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800">
      <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-200 dark:bg-zinc-700">
        <StatIcon icon={icon} />
      </div>
      <p className="text-2xl font-bold text-zinc-900 dark:text-white">
        {value}
      </p>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">{title}</p>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}

function StatIcon({ icon }: { icon: string }) {
  const cls = "h-4 w-4 text-zinc-600 dark:text-zinc-300";

  switch (icon) {
    case "courses":
      return (
        <svg
          className={cls}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
          />
        </svg>
      );
    case "lessons":
      return (
        <svg
          className={cls}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      );
    case "score":
      return (
        <svg
          className={cls}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.563.563 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
          />
        </svg>
      );
    case "certificates":
      return (
        <svg
          className={cls}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a48.454 48.454 0 01-7.54 0"
          />
        </svg>
      );
    default:
      return null;
  }
}

interface ContinueCourse {
  courseId: string;
  courseTitle: string;
  courseImage: string | null;
  completedLessons: number;
  totalLessons: number;
  completionPercent: number;
  nextLessonId: string;
  nextLessonTitle: string;
  nextLessonNumber: number;
  lastActivity: number;
  enrolledAt: number;
}

function ContinueLearningCard({ course }: { course: ContinueCourse }) {
  return (
    <div className="rounded-2xl bg-emerald-50 p-6 dark:bg-emerald-950/30">
      <div className="mb-1 flex items-center gap-2">
        <svg
          className="h-4 w-4 text-emerald-600 dark:text-emerald-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z"
          />
        </svg>
        <p className="text-xs font-medium uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
          המשך מאיפה שעצרת
        </p>
      </div>

      <h3 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-white">
        {course.courseTitle}
      </h3>

      {/* Next lesson info */}
      <div className="mb-3 flex items-center gap-2 rounded-xl bg-white/60 px-3 py-2 dark:bg-zinc-800/40">
        <svg
          className="h-4 w-4 shrink-0 text-emerald-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
          />
        </svg>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            שיעור הבא ({course.nextLessonNumber} מתוך {course.totalLessons})
          </p>
          <p className="truncate text-sm font-medium text-zinc-900 dark:text-white">
            {course.nextLessonTitle}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-2">
        <div className="mb-1 flex justify-between text-sm">
          <span className="text-zinc-600 dark:text-zinc-400">
            {course.completedLessons} מתוך {course.totalLessons} שיעורים
          </span>
          <span className="font-medium text-zinc-900 dark:text-white">
            {course.completionPercent}%
          </span>
        </div>
        <div
          className="h-2.5 w-full overflow-hidden rounded-full bg-emerald-200 dark:bg-emerald-900"
          role="progressbar"
          aria-valuenow={course.completionPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`התקדמות: ${course.completionPercent}%`}
        >
          <div
            className="h-2.5 rounded-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${course.completionPercent}%` }}
          />
        </div>
      </div>

      <Link
        href={`/course/${course.courseId}/lesson/${course.nextLessonId}`}
        className="mt-4 inline-flex h-10 items-center gap-2 rounded-lg bg-emerald-600 px-5 text-sm font-medium text-white transition-colors hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z"
          />
        </svg>
        המשך ללמוד
      </Link>
    </div>
  );
}

function MiniCourseCard({ course }: { course: ContinueCourse }) {
  return (
    <Link
      href={`/course/${course.courseId}/lesson/${course.nextLessonId}`}
      className="block rounded-xl border border-zinc-200 bg-white p-4 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
    >
      <p className="mb-1 text-sm font-medium text-zinc-900 dark:text-white">
        {course.courseTitle}
      </p>
      <p className="mb-2 text-xs text-zinc-500 dark:text-zinc-400">
        שיעור הבא: {course.nextLessonTitle}
      </p>
      <ProgressBar value={course.completionPercent} size="sm" />
      <p className="mt-1 text-right text-xs text-zinc-500 dark:text-zinc-400">
        {course.completionPercent}%
      </p>
    </Link>
  );
}

function CourseProgressRow({
  courseId,
  courseTitle,
  completedLessons,
  totalLessons,
  completionPercent,
  hasCertificate,
  bestQuizScore,
  avgQuizScore,
}: {
  courseId: string;
  courseTitle: string;
  completedLessons: number;
  totalLessons: number;
  completionPercent: number;
  hasCertificate: boolean;
  bestQuizScore: number | null;
  avgQuizScore: number | null;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={`/courses/${courseId}`}
            className="text-base font-semibold text-zinc-900 hover:text-emerald-600 dark:text-white dark:hover:text-emerald-400"
          >
            {courseTitle}
          </Link>
          {hasCertificate && (
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
              תעודה
            </span>
          )}
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-zinc-600 dark:text-zinc-400">
            {completedLessons}/{totalLessons} שיעורים
          </span>
          {bestQuizScore !== null && (
            <span className="text-zinc-600 dark:text-zinc-400">
              ציון מיטבי:{" "}
              <span className="font-medium text-zinc-900 dark:text-white">
                {bestQuizScore}%
              </span>
            </span>
          )}
          {avgQuizScore !== null && (
            <span className="text-zinc-600 dark:text-zinc-400">
              ממוצע:{" "}
              <span className="font-medium text-zinc-900 dark:text-white">
                {avgQuizScore}%
              </span>
            </span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative">
        <ProgressBar value={completionPercent} size="md" showLabel />
      </div>

      {/* Link to course */}
      <div className="mt-2 text-left">
        <Link
          href={`/courses/${courseId}/learn`}
          className="text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
        >
          {completionPercent === 100 ? "צפה בקורס" : "המשך ללמוד"} &larr;
        </Link>
      </div>
    </div>
  );
}

function CertificateMiniCard({
  courseName,
  certificateNumber,
  issuedAt,
  completionPercent,
}: {
  courseName: string;
  certificateNumber: string;
  issuedAt: number;
  completionPercent: number;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-2 flex items-center gap-2">
        <svg
          className="h-5 w-5 text-emerald-600 dark:text-emerald-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"
          />
        </svg>
        <h3 className="font-medium text-zinc-900 dark:text-white">
          {courseName}
        </h3>
      </div>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        הונפקה:{" "}
        {new Intl.DateTimeFormat("he-IL").format(new Date(issuedAt))}
      </p>
      <div className="mt-1 flex items-center justify-between">
        <p className="text-xs text-zinc-400 dark:text-zinc-500">
          {certificateNumber}
        </p>
        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
          {completionPercent}%
        </span>
      </div>
    </div>
  );
}

function QuickLink({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-zinc-200 bg-white p-5 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
    >
      <p className="mb-1 text-sm font-semibold text-zinc-900 dark:text-white">
        {title}
      </p>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">{description}</p>
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl bg-zinc-50 p-12 text-center dark:bg-zinc-900">
      <svg
        className="mx-auto mb-4 h-12 w-12 text-zinc-300 dark:text-zinc-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5"
        />
      </svg>
      <p className="mb-2 text-lg font-medium text-zinc-700 dark:text-zinc-300">
        עדיין לא נרשמת לקורסים
      </p>
      <p className="mb-6 text-zinc-500 dark:text-zinc-400">
        הירשם לקורס והתחל את מסע הלמידה שלך!
      </p>
      <Link
        href="/courses"
        className="inline-flex h-10 items-center rounded-full bg-zinc-900 px-6 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
      >
        גלה קורסים
      </Link>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-800"
          />
        ))}
      </div>
      <div className="h-48 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-800" />
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-800"
          />
        ))}
      </div>
    </div>
  );
}
