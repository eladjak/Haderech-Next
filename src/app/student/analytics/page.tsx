"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import Link from "next/link";
import { api } from "@/../convex/_generated/api";
import { Header } from "@/components/layout/header";
import { ProgressBar } from "@/components/ui/progress-bar";

export default function StudentAnalyticsPage() {
  const { user: clerkUser } = useUser();

  const convexUser = useQuery(
    api.users.getByClerkId,
    clerkUser?.id ? { clerkId: clerkUser.id } : "skip"
  );

  const overview = useQuery(
    api.analytics.getStudentOverview,
    convexUser?._id ? { userId: convexUser._id } : "skip"
  );

  const courseProgress = useQuery(
    api.analytics.getCourseProgress,
    convexUser?._id ? { userId: convexUser._id } : "skip"
  );

  const quizHistory = useQuery(
    api.analytics.getQuizScoreHistory,
    convexUser?._id ? { userId: convexUser._id } : "skip"
  );

  const streak = useQuery(
    api.analytics.getLearningStreak,
    convexUser?._id ? { userId: convexUser._id } : "skip"
  );

  const achievements = useQuery(
    api.analytics.getAchievements,
    convexUser?._id ? { userId: convexUser._id } : "skip"
  );

  const isLoading =
    overview === undefined ||
    courseProgress === undefined ||
    quizHistory === undefined ||
    streak === undefined ||
    achievements === undefined;

  return (
    <div className="min-h-dvh bg-white dark:bg-zinc-950">
      <Header />

      <main className="container mx-auto px-4 py-12">
        {/* Page header */}
        <div className="mb-8">
          <nav
            className="mb-4 text-sm text-zinc-500 dark:text-zinc-400"
            aria-label="ניווט"
          >
            <Link
              href="/dashboard"
              className="hover:text-zinc-900 dark:hover:text-white"
            >
              דשבורד
            </Link>
            <span className="mx-2">/</span>
            <span className="text-zinc-900 dark:text-white">אנליטיקס</span>
          </nav>
          <h1 className="mb-2 text-3xl font-bold text-zinc-900 dark:text-white">
            הנתונים שלי
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            מעקב אחר ההתקדמות, ציונים והישגים שלך
          </p>
        </div>

        {isLoading ? (
          <LoadingSkeleton />
        ) : (
          <>
            {/* Overview Stats */}
            <section className="mb-10">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  title="קורסים רשומים"
                  value={String(overview?.enrolledCourses ?? 0)}
                  icon="book"
                />
                <StatCard
                  title="שיעורים שהושלמו"
                  value={String(overview?.completedLessons ?? 0)}
                  icon="check"
                />
                <StatCard
                  title="תעודות"
                  value={String(overview?.certificatesEarned ?? 0)}
                  icon="trophy"
                />
                <StatCard
                  title="ציון ממוצע בבחנים"
                  value={
                    overview?.averageQuizScore
                      ? `${overview.averageQuizScore}%`
                      : "-"
                  }
                  icon="star"
                />
              </div>
            </section>

            {/* Streak section */}
            <section className="mb-10">
              <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-white">
                רצף למידה
              </h2>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl bg-zinc-50 p-6 dark:bg-zinc-900">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-2xl" aria-hidden="true">
                      {(streak?.currentStreak ?? 0) > 0 ? "\uD83D\uDD25" : "\u2744\uFE0F"}
                    </span>
                    <span className="text-3xl font-bold text-zinc-900 dark:text-white">
                      {streak?.currentStreak ?? 0}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    ימים רצופים (נוכחי)
                  </p>
                </div>
                <div className="rounded-2xl bg-zinc-50 p-6 dark:bg-zinc-900">
                  <span className="text-3xl font-bold text-zinc-900 dark:text-white">
                    {streak?.longestStreak ?? 0}
                  </span>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    רצף הכי ארוך
                  </p>
                </div>
                <div className="rounded-2xl bg-zinc-50 p-6 dark:bg-zinc-900">
                  <span className="text-3xl font-bold text-zinc-900 dark:text-white">
                    {streak?.totalActiveDays ?? 0}
                  </span>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    סך ימי למידה
                  </p>
                </div>
              </div>
            </section>

            {/* Course Progress */}
            <section className="mb-10">
              <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-white">
                התקדמות בקורסים
              </h2>
              {courseProgress && courseProgress.length > 0 ? (
                <div className="space-y-4">
                  {courseProgress.map((cp) => (
                    <div
                      key={cp.courseId}
                      className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <h3 className="font-medium text-zinc-900 dark:text-white">
                          {cp.courseTitle}
                        </h3>
                        <div className="flex items-center gap-2">
                          {cp.hasCertificate && (
                            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                              תעודה
                            </span>
                          )}
                          <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                            {cp.completionPercent}%
                          </span>
                        </div>
                      </div>
                      <ProgressBar value={cp.completionPercent} size="md" />
                      <div className="mt-2 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                        <span>
                          {cp.completedLessons}/{cp.totalLessons} שיעורים
                        </span>
                        <span>
                          נרשם:{" "}
                          {new Intl.DateTimeFormat("he-IL").format(
                            new Date(cp.enrolledAt)
                          )}
                        </span>
                      </div>

                      {/* Mini completion bar chart */}
                      <div className="mt-3 flex gap-1">
                        {Array.from({ length: cp.totalLessons }).map(
                          (_, i) => (
                            <div
                              key={i}
                              className={`h-6 flex-1 rounded-sm ${
                                i < cp.completedLessons
                                  ? "bg-emerald-400 dark:bg-emerald-600"
                                  : "bg-zinc-200 dark:bg-zinc-700"
                              }`}
                              aria-label={`שיעור ${i + 1}: ${i < cp.completedLessons ? "הושלם" : "לא הושלם"}`}
                            />
                          )
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState message="עדיין לא נרשמת לקורסים. הירשם לקורס והתחל ללמוד!" />
              )}
            </section>

            {/* Quiz Score History Chart */}
            <section className="mb-10">
              <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-white">
                היסטוריית ציוני בחנים
              </h2>
              {quizHistory && quizHistory.length > 0 ? (
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900">
                  {/* SVG Bar Chart */}
                  <div className="mb-4 overflow-x-auto">
                    <QuizScoreChart
                      data={quizHistory.slice(0, 10).reverse()}
                    />
                  </div>

                  {/* Recent quizzes list */}
                  <div className="space-y-2">
                    {quizHistory.slice(0, 5).map((attempt) => (
                      <div
                        key={attempt.attemptId}
                        className="flex items-center justify-between rounded-xl bg-zinc-100 p-3 dark:bg-zinc-800"
                      >
                        <div>
                          <p className="text-sm font-medium text-zinc-900 dark:text-white">
                            {attempt.quizTitle}
                          </p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            {attempt.courseTitle} -{" "}
                            {new Intl.DateTimeFormat("he-IL", {
                              day: "numeric",
                              month: "short",
                            }).format(new Date(attempt.attemptedAt))}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-sm font-bold ${
                              attempt.passed
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-red-600 dark:text-red-400"
                            }`}
                          >
                            {attempt.score}%
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                              attempt.passed
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            }`}
                          >
                            {attempt.passed ? "עבר" : "נכשל"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <EmptyState message="עדיין לא עשית בחנים. השלם שיעור וענה על הבוחן!" />
              )}
            </section>

            {/* Achievements */}
            <section className="mb-10">
              <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-white">
                הישגים
              </h2>
              {achievements && achievements.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {achievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className={`rounded-2xl border p-4 transition-colors ${
                        achievement.earned
                          ? "border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900"
                          : "border-zinc-100 bg-zinc-50/50 opacity-40 dark:border-zinc-800 dark:bg-zinc-900/50"
                      }`}
                    >
                      <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-200 text-lg dark:bg-zinc-700">
                        <AchievementIcon
                          icon={achievement.icon}
                          earned={achievement.earned}
                        />
                      </div>
                      <h3 className="mb-0.5 text-sm font-semibold text-zinc-900 dark:text-white">
                        {achievement.title}
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {achievement.description}
                      </p>
                      {achievement.earned && achievement.earnedAt && (
                        <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
                          הושג:{" "}
                          {new Intl.DateTimeFormat("he-IL").format(
                            new Date(achievement.earnedAt)
                          )}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState message="הישגים יופיעו כאן ככל שתתקדם בלימודים." />
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

// SVG Bar Chart component for quiz scores
function QuizScoreChart({
  data,
}: {
  data: Array<{
    attemptId: string;
    quizTitle: string;
    score: number;
    passed: boolean;
    attemptedAt: number;
  }>;
}) {
  const chartWidth = Math.max(data.length * 60, 300);
  const chartHeight = 160;
  const barWidth = 40;
  const gap = 20;
  const paddingBottom = 30;
  const paddingTop = 20;
  const maxScore = 100;
  const usableHeight = chartHeight - paddingBottom - paddingTop;

  return (
    <svg
      width={chartWidth}
      height={chartHeight}
      viewBox={`0 0 ${chartWidth} ${chartHeight}`}
      className="w-full"
      role="img"
      aria-label="תרשים ציוני בחנים"
    >
      {/* Grid lines */}
      {[0, 25, 50, 75, 100].map((value) => {
        const y =
          paddingTop + usableHeight - (value / maxScore) * usableHeight;
        return (
          <g key={value}>
            <line
              x1={0}
              y1={y}
              x2={chartWidth}
              y2={y}
              stroke="currentColor"
              strokeWidth={0.5}
              className="text-zinc-200 dark:text-zinc-700"
              strokeDasharray={value === 0 ? "0" : "4,4"}
            />
            <text
              x={chartWidth - 5}
              y={y - 3}
              textAnchor="end"
              className="fill-zinc-400 text-[10px] dark:fill-zinc-500"
            >
              {value}%
            </text>
          </g>
        );
      })}

      {/* Passing score line */}
      <line
        x1={0}
        y1={paddingTop + usableHeight - (60 / maxScore) * usableHeight}
        x2={chartWidth}
        y2={paddingTop + usableHeight - (60 / maxScore) * usableHeight}
        stroke="currentColor"
        strokeWidth={1}
        strokeDasharray="6,3"
        className="text-amber-400 dark:text-amber-500"
      />

      {/* Bars */}
      {data.map((item, index) => {
        const x = index * (barWidth + gap) + gap / 2;
        const barHeight = (item.score / maxScore) * usableHeight;
        const y = paddingTop + usableHeight - barHeight;
        const dateStr = new Intl.DateTimeFormat("he-IL", {
          day: "numeric",
          month: "numeric",
        }).format(new Date(item.attemptedAt));

        return (
          <g key={item.attemptId}>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              rx={4}
              className={
                item.passed
                  ? "fill-emerald-400 dark:fill-emerald-600"
                  : "fill-red-400 dark:fill-red-600"
              }
            />
            {/* Score label */}
            <text
              x={x + barWidth / 2}
              y={y - 4}
              textAnchor="middle"
              className="fill-zinc-600 text-[11px] font-medium dark:fill-zinc-400"
            >
              {item.score}
            </text>
            {/* Date label */}
            <text
              x={x + barWidth / 2}
              y={chartHeight - 5}
              textAnchor="middle"
              className="fill-zinc-400 text-[10px] dark:fill-zinc-500"
            >
              {dateStr}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: string;
}) {
  return (
    <div className="rounded-2xl bg-zinc-50 p-5 dark:bg-zinc-900">
      <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-200 dark:bg-zinc-700">
        <StatIcon icon={icon} />
      </div>
      <p className="text-2xl font-bold text-zinc-900 dark:text-white">
        {value}
      </p>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">{title}</p>
    </div>
  );
}

function StatIcon({ icon }: { icon: string }) {
  const svgClass = "h-4.5 w-4.5 text-zinc-600 dark:text-zinc-300";

  switch (icon) {
    case "book":
      return (
        <svg
          className={svgClass}
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
    case "check":
      return (
        <svg
          className={svgClass}
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
    case "trophy":
      return (
        <svg
          className={svgClass}
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
    case "star":
      return (
        <svg
          className={svgClass}
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
    default:
      return null;
  }
}

function AchievementIcon({
  icon,
  earned,
}: {
  icon: string;
  earned: boolean;
}) {
  const svgClass = `h-5 w-5 ${earned ? "text-zinc-700 dark:text-zinc-200" : "text-zinc-400 dark:text-zinc-500"}`;

  switch (icon) {
    case "rocket":
      return (
        <svg
          className={svgClass}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"
          />
        </svg>
      );
    case "book":
      return <StatIcon icon="book" />;
    case "star":
      return <StatIcon icon="star" />;
    case "trophy":
      return <StatIcon icon="trophy" />;
    case "fire":
      return (
        <svg
          className={svgClass}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.047 8.287 8.287 0 009 9.601a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 18a3.75 3.75 0 00.495-7.468 5.99 5.99 0 00-1.925 3.547 5.975 5.975 0 01-2.133-1.001A3.75 3.75 0 0012 18z"
          />
        </svg>
      );
    case "puzzle":
      return (
        <svg
          className={svgClass}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.39 48.39 0 01-4.163-.3c.186 1.613.166 3.259-.108 4.876a.64.64 0 00.382.735c.33.136.63.343.858.619.363.441.57.994.57 1.584 0 .88-.534 1.657-1.332 2.025-.154.071-.32.103-.487.103H5.25a.75.75 0 01-.75-.75V6a.75.75 0 01.75-.75h3.502c.208 0 .416-.008.623-.024M18 18a.75.75 0 01-.75.75h-3.502a48.16 48.16 0 00-.623-.024.641.641 0 01-.657-.643v0c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.39 48.39 0 01-4.163-.3M18 18V6a.75.75 0 00-.75-.75h-3.502c-.208 0-.416.008-.623.024a.641.641 0 00-.657.643v0c0 .355-.186.676-.401.959-.221.29-.349.634-.349 1.003 0 1.036 1.007 1.875 2.25 1.875s2.25-.84 2.25-1.875c0-.369-.128-.713-.349-1.003-.215-.283-.401-.604-.401-.959v0c0-.363.283-.657.643-.657a48.39 48.39 0 014.163-.3"
          />
        </svg>
      );
    case "check":
      return <StatIcon icon="check" />;
    case "heart":
      return (
        <svg
          className={svgClass}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
          />
        </svg>
      );
    default:
      return null;
  }
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl bg-zinc-50 p-8 text-center dark:bg-zinc-900">
      <p className="text-zinc-600 dark:text-zinc-400">{message}</p>
    </div>
  );
}

function LoadingSkeleton() {
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
      <div className="h-40 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-800" />
      <div className="h-64 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-800" />
    </div>
  );
}
