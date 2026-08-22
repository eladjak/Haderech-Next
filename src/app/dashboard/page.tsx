"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import Link from "next/link";
import { useState } from "react";
import { api } from "@/../convex/_generated/api";
import { Header } from "@/components/layout/header";
import { CourseCard } from "@/components/course/course-card";
import { CourseProgressTracker } from "@/components/course/course-progress-tracker";
import { WelcomeModal } from "@/components/onboarding/welcome-modal";
import { DailyWidget } from "@/components/daily/daily-widget";
import { PrivateWeeklyReflection } from "@/components/dashboard/private-weekly-reflection";
import { StructuredNextStepCard } from "@/components/onboarding/structured-next-step-card";
import {
  CANONICAL_COURSE_SCOPE,
  chooseStructuredOnboardingNextStep,
  type StructuredOnboardingNextStep,
} from "@/lib/learner-journey";

export default function DashboardPage() {
  const { user } = useUser();
  const courses = useQuery(api.courses.listPublished);
  const onboarding = useQuery(api.onboarding.getOnboarding);

  // Get Convex user
  const convexUser = useQuery(
    api.users.getByClerkId,
    user?.id ? { clerkId: user.id } : "skip",
  );

  // Get enrolled courses
  const enrolledCourses = useQuery(
    api.enrollments.listByUser,
    convexUser?._id ? { userId: convexUser._id } : "skip",
  );

  // Get certificates
  const certificates = useQuery(
    api.certificates.listByUser,
    convexUser?._id ? { userId: convexUser._id } : "skip",
  );

  // Get student overview (total lessons completed, avg quiz score)
  const overview = useQuery(
    api.analytics.getStudentOverview,
    convexUser?._id ? { userId: convexUser._id } : "skip",
  );

  // Get per-course progress for the tracker component
  const courseProgress = useQuery(
    api.analytics.getCourseProgress,
    convexUser?._id ? { userId: convexUser._id } : "skip",
  );

  // Get learning streak
  const streak = useQuery(
    api.analytics.getLearningStreak,
    convexUser?._id ? { userId: convexUser._id } : "skip",
  );

  // Get achievements
  const achievements = useQuery(
    api.analytics.getAchievements,
    convexUser?._id ? { userId: convexUser._id } : "skip",
  );

  const accessibleCourses =
    enrolledCourses?.filter((course) => course.hasContentAccess) ?? [];
  const savedWithoutAccess =
    enrolledCourses?.filter((course) => !course.hasContentAccess) ?? [];
  const enrolledCount = accessibleCourses.length;
  const certificateCount = certificates?.length ?? 0;
  const completedLessonsCount = overview?.completedLessons ?? 0;
  const avgQuizScore = overview?.averageQuizScore ?? 0;
  const currentStreak = streak?.currentStreak ?? 0;
  const earnedAchievements = achievements?.filter((a) => a.earned) ?? [];

  // Continue learning with next-lesson resolution
  const continueData = useQuery(
    api.analytics.getContinueLearningData,
    convexUser?._id ? { userId: convexUser._id } : "skip",
  );

  // "Continue where you left off" - find the most recently active enrolled course
  const lastActiveCourse =
    courseProgress && courseProgress.length > 0
      ? courseProgress.reduce((latest, curr) =>
          (curr.enrolledAt ?? 0) > (latest.enrolledAt ?? 0) ? curr : latest,
        )
      : null;

  // Not yet started courses (0% progress, enrolled)
  const notStartedCourses =
    courseProgress?.filter((c) => c.completedLessons === 0) ?? [];

  // In-progress courses (some progress but not 100%)
  const inProgressCourses =
    courseProgress?.filter(
      (c) => c.completedLessons > 0 && c.completionPercent < 100,
    ) ?? [];

  // The "continue" suggestion: prefer in-progress, else not-started
  const continueCourse =
    inProgressCourses.length > 0
      ? inProgressCourses[0]
      : notStartedCourses.length > 0
        ? notStartedCourses[0]
        : null;
  const onboardingNextStep = onboarding?.completed
    ? chooseStructuredOnboardingNextStep(onboarding.answers)
    : null;

  return (
    <div className="min-h-dvh bg-white dark:bg-zinc-950">
      <Header />

      {/* Onboarding modal - shown once to new users */}
      <WelcomeModal userName={user?.firstName ?? undefined} />

      <main id="main-content" className="container mx-auto px-4 py-12">
        <h1 className="mb-2 text-3xl font-bold text-zinc-900 dark:text-white">
          {user?.firstName ? `שלום, ${user.firstName}!` : "שלום!"}
        </h1>
        <p className="mb-8 text-zinc-600 dark:text-zinc-400">
          כאן ממשיכים ללמוד, בקצב שלך
        </p>

        {/* Primary learner action: shown before stats and secondary features. */}
        <section className="mb-8" aria-label="הצעד הבא בלמידה">
          {enrolledCourses === undefined ? (
            <div
              className="h-48 animate-pulse rounded-3xl bg-zinc-100 dark:bg-zinc-900"
              aria-label="טוען את הצעד הבא"
            />
          ) : enrolledCount > 0 ? (
            continueData === undefined || courseProgress === undefined ? (
              <div
                className="h-48 animate-pulse rounded-3xl bg-zinc-100 dark:bg-zinc-900"
                aria-label="טוען את השיעור הבא"
              />
            ) : continueData?.primary ? (
              <ContinueLearningCardEnhanced
                courseId={continueData.primary.courseId}
                courseTitle={continueData.primary.courseTitle}
                completionPercent={continueData.primary.completionPercent}
                completedLessons={continueData.primary.completedLessons}
                totalLessons={continueData.primary.totalLessons}
                nextLessonId={continueData.primary.nextLessonId}
                nextLessonTitle={continueData.primary.nextLessonTitle}
                nextLessonNumber={continueData.primary.nextLessonNumber}
              />
            ) : continueCourse ? (
              <ContinueLearningCard
                courseId={continueCourse.courseId}
                courseTitle={continueCourse.courseTitle}
                completionPercent={continueCourse.completionPercent}
                completedLessons={continueCourse.completedLessons}
                totalLessons={continueCourse.totalLessons}
              />
            ) : lastActiveCourse ? (
              <ContinueLearningCard
                courseId={lastActiveCourse.courseId}
                courseTitle={lastActiveCourse.courseTitle}
                completionPercent={lastActiveCourse.completionPercent}
                completedLessons={lastActiveCourse.completedLessons}
                totalLessons={lastActiveCourse.totalLessons}
              />
            ) : (
              <ReturnToPracticeCard />
            )
          ) : (
            <FirstMinutesCard recommendation={onboardingNextStep} />
          )}
        </section>

        {enrolledCount > 0 && onboardingNextStep?.mode === "choice-based" && (
          <section
            className="mb-8"
            aria-label="נקודת פתיחה נוספת לפי הבחירות שנשמרו"
          >
            <StructuredNextStepCard
              recommendation={onboardingNextStep}
              headingLevel="h3"
            />
          </section>
        )}

        {/* Quick Stats Cards */}
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4">
          <DashboardCard
            title="קורסים עם גישה"
            value={String(enrolledCount)}
            description="מסלולים שהגישה אליהם פעילה"
            href="/courses"
          />
          <DashboardCard
            title="שיעורים הושלמו"
            value={String(completedLessonsCount)}
            description="שיעורים שסיימת"
          />
          <DashboardCard
            title="ציון ממוצע"
            value={avgQuizScore > 0 ? `${avgQuizScore}%` : "—"}
            description="ממוצע ציוני הבחנים"
            href="/student/analytics"
          />
          <DashboardCard
            title="תעודות"
            value={String(certificateCount)}
            description="תעודות סיום שהונפקו"
            href="/certificates"
          />
        </div>

        {/* Daily Content Widget */}
        <div className="mt-8">
          <div className="mb-3 flex items-center gap-2">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
              תוכן יומי
            </h2>
            <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
              טיפ + ציטוט + אתגר
            </span>
          </div>
          <DailyWidget />
        </div>

        {/* Progress Dashboard Link */}
        {enrolledCount > 0 && (
          <div className="mt-8">
            <Link
              href="/student/dashboard"
              className="card-hover flex items-center justify-between rounded-2xl border border-brand-200 bg-brand-50 p-4 dark:border-brand-700 dark:bg-blue-600/30"
            >
              <div className="flex items-center gap-3">
                <svg
                  className="h-5 w-5 text-brand-600 dark:text-brand-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
                  />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                    מעקב התקדמות מלא
                  </p>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    קורסים, הישגים, תעודות וציוני בחנים במקום אחד
                  </p>
                </div>
              </div>
              <svg
                className="h-5 w-5 text-zinc-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                />
              </svg>
            </Link>
          </div>
        )}

        {/* Streak + Achievements are secondary context, after the next action. */}
        {enrolledCount > 0 && (
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <StreakCard streak={currentStreak} />
            {earnedAchievements.length > 0 && (
              <AchievementsSummaryCard
                earnedCount={earnedAchievements.length}
                totalCount={achievements?.length ?? 0}
                icons={earnedAchievements.slice(0, 4).map((a) => a.icon)}
              />
            )}
          </div>
        )}

        {/* Course Progress Tracker */}
        {enrolledCount > 0 && courseProgress && (
          <div className="mt-8">
            <CourseProgressTracker
              sections={courseProgress.map((c) => ({
                courseId: c.courseId,
                courseTitle: c.courseTitle,
                completedLessons: c.completedLessons,
                totalLessons: c.totalLessons,
                completionPercent: c.completionPercent,
                hasCertificate: c.hasCertificate,
              }))}
            />
          </div>
        )}

        {enrolledCount > 0 && <PrivateWeeklyReflection />}

        {/* Enrolled Courses Section */}
        {accessibleCourses.length > 0 && (
          <section className="mt-12">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white">
                הקורסים שלי
              </h2>
              <Link
                href="/courses"
                className="text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
              >
                הצג הכל
              </Link>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {accessibleCourses.map((course) => {
                const progress = courseProgress?.find(
                  (p) => p.courseId === course._id,
                );
                return (
                  <CourseCard
                    key={course._id}
                    id={course._id}
                    title={course.title}
                    description={course.description}
                    imageUrl={course.imageUrl}
                    enrolled
                    progressPercent={progress?.completionPercent}
                  />
                );
              })}
            </div>
          </section>
        )}

        {savedWithoutAccess.length > 0 && (
          <section className="mt-10 rounded-3xl border border-amber-200 bg-amber-50/70 p-6 dark:border-amber-800 dark:bg-amber-950/20">
            <h2 className="text-xl font-semibold text-amber-950 dark:text-amber-100">
              קורסים ששמרת — ללא גישה פעילה
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-amber-800 dark:text-amber-200">
              שמירת קורס בחשבון אינה רכישה ואינה הרשאה לתוכן. אפשר לפתוח את עמוד
              הקורס כדי לראות את המבנה, להסיר אותו מהחשבון או לברר על זמינות.
            </p>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {savedWithoutAccess.map((course) => (
                <li key={course._id}>
                  <Link
                    href={`/courses/${course._id}`}
                    className="flex min-h-11 items-center justify-between rounded-xl border border-amber-200 bg-white px-4 py-3 text-sm font-semibold text-amber-950 hover:bg-amber-100 dark:border-amber-800 dark:bg-zinc-900 dark:text-amber-100 dark:hover:bg-amber-950/40"
                  >
                    <span>{course.title}</span>
                    <span aria-hidden="true">←</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* כלים חדשים - New Features Section */}
        <NewFeaturesSection />

        {/* Available Courses */}
        <section className="mt-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white">
              {accessibleCourses.length > 0 ? "קורסים נוספים" : "הקורסים שלנו"}
            </h2>
            <Link
              href="/courses"
              className="text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            >
              הצג הכל
            </Link>
          </div>

          {courses === undefined ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-48 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-800"
                />
              ))}
            </div>
          ) : courses.length === 0 ? (
            <EmptyCoursesState />
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <CourseCard
                  key={course._id}
                  id={course._id}
                  title={course.title}
                  description={course.description}
                  imageUrl={course.imageUrl}
                />
              ))}
            </div>
          )}
        </section>

        {/* Certificates preview */}
        {certificateCount > 0 && (
          <section className="mt-12">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white">
                התעודות שלי
              </h2>
              <Link
                href="/certificates"
                className="text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
              >
                הצג הכל
              </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {certificates?.slice(0, 2).map((cert) => (
                <div
                  key={cert._id}
                  className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <p className="mb-1 text-sm font-medium text-zinc-900 dark:text-white">
                    {cert.courseName}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    הונפקה:{" "}
                    {new Intl.DateTimeFormat("he-IL").format(
                      new Date(cert.issuedAt),
                    )}
                  </p>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500">
                    {cert.certificateNumber}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Dev: Seed Data Tool */}
        {process.env.NODE_ENV === "development" && (
          <section className="mt-12 border-t border-dashed border-zinc-300 pt-8 dark:border-zinc-700">
            <SeedDataTool />
          </section>
        )}
      </main>
    </div>
  );
}

// ---- Sub-components ----

function FirstMinutesCard({
  recommendation,
}: {
  recommendation: StructuredOnboardingNextStep | null;
}) {
  const scope = [
    [CANONICAL_COURSE_SCOPE.weeks, "שבועות"],
    [CANONICAL_COURSE_SCOPE.phases, "שלבים"],
    [CANONICAL_COURSE_SCOPE.lessons, "שיעורים"],
    [CANONICAL_COURSE_SCOPE.practicePdfs, "קובצי PDF"],
  ] as const;

  return (
    <div className="overflow-hidden rounded-3xl bg-gradient-to-l from-brand-50 via-white to-blue-50 p-6 shadow-[0_0_0_1px_rgba(30,58,95,0.08),0_12px_35px_rgba(30,58,95,0.08)] sm:p-8 dark:from-blue-950/30 dark:via-zinc-900 dark:to-brand-950/20 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
      <div className="grid gap-7 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div>
          <p className="text-sm font-semibold text-brand-700 dark:text-brand-300">
            מתחילים בלי להציף
          </p>
          {recommendation ? (
            <div className="mt-4">
              <StructuredNextStepCard recommendation={recommendation} />
            </div>
          ) : (
            <>
              <h2 className="mt-2 text-balance text-2xl font-bold text-zinc-900 sm:text-3xl dark:text-white">
                הצעד הראשון יכול לקחת עשר דקות
              </h2>
              <p className="mt-3 max-w-2xl text-pretty leading-relaxed text-zinc-600 dark:text-zinc-400">
                בוחרים את מסלול אומנות הקשר, פותחים שיעור אחד ושומרים נקודה אחת
                לחזרה. אפשר לעצור שם ולהמשיך בזמן שמתאים.
              </p>

              <ol className="mt-5 grid gap-3 sm:grid-cols-3">
                {[
                  "פותחים שיעור",
                  "בוחרים תרגול אחד",
                  "שומרים נקודה וחוזרים",
                ].map((step, index) => (
                  <li
                    key={step}
                    className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white font-bold text-brand-700 shadow-[0_0_0_1px_rgba(0,0,0,0.06)] dark:bg-zinc-800 dark:text-brand-300 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
                      {index + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/courses"
                  className="inline-flex min-h-11 items-center justify-center rounded-xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-[transform,box-shadow,background-color] hover:bg-zinc-800 hover:shadow-md active:scale-[0.96] dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
                >
                  לבחור את מסלול הלימוד
                </Link>
                <Link
                  href="/tools/conversation-starters"
                  className="inline-flex min-h-11 items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-zinc-800 shadow-[0_0_0_1px_rgba(0,0,0,0.08)] transition-[transform,box-shadow] hover:shadow-md active:scale-[0.96] dark:bg-zinc-800 dark:text-zinc-100 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.1)]"
                >
                  לנסות קודם תרגול קצר
                </Link>
              </div>
            </>
          )}
        </div>

        <dl className="grid grid-cols-2 gap-3">
          {scope.map(([value, label]) => (
            <div
              key={label}
              className="flex min-h-24 flex-col justify-center rounded-2xl bg-white/80 p-4 text-center shadow-[0_0_0_1px_rgba(0,0,0,0.05)] dark:bg-zinc-900/70 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08)]"
            >
              <dt className="text-xs text-zinc-500 dark:text-zinc-400">
                {label}
              </dt>
              <dd className="tabular-nums mt-1 text-2xl font-bold text-zinc-900 dark:text-white">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

function ReturnToPracticeCard() {
  return (
    <div className="rounded-3xl bg-emerald-50 p-6 shadow-[0_0_0_1px_rgba(16,185,129,0.16)] sm:p-8 dark:bg-emerald-950/20 dark:shadow-[0_0_0_1px_rgba(52,211,153,0.18)]">
      <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
        אין כרגע שיעור שממתין להשלמה
      </p>
      <h2 className="mt-2 text-balance text-2xl font-bold text-zinc-900 dark:text-white">
        אפשר לבחור במה לחזור ולתרגל
      </h2>
      <p className="mt-2 max-w-2xl text-pretty text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        חזרה לשיעור מוכר היא חלק מהמסלול. אפשר לפתוח את תוכנית הקורס או לבחור
        תרגול קצר בלי להתחיל משהו חדש.
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link
          href="/courses"
          className="inline-flex min-h-11 items-center rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition-[transform,background-color] hover:bg-emerald-800 active:scale-[0.96]"
        >
          לחזרה לתוכנית הקורס
        </Link>
        <Link
          href="/tools"
          className="inline-flex min-h-11 items-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-zinc-800 shadow-[0_0_0_1px_rgba(0,0,0,0.08)] transition-[transform,box-shadow] hover:shadow-md active:scale-[0.96] dark:bg-zinc-900 dark:text-zinc-100 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.1)]"
        >
          לבחור תרגול קצר
        </Link>
      </div>
    </div>
  );
}

function DashboardCard({
  title,
  value,
  description,
  href,
}: {
  title: string;
  value: string;
  description: string;
  href?: string;
}) {
  // L7: hover-lift only makes sense when this card is actually a link — without
  // `href` it renders a bare div with no interactive descendant at all.
  const content = (
    <div
      className={`rounded-2xl border border-zinc-100 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 ${href ? "card-hover" : ""}`}
    >
      <p className="mb-1 text-sm font-medium text-zinc-500 dark:text-zinc-400">
        {title}
      </p>
      <p className="mb-1 text-3xl font-bold bg-gradient-to-l from-brand-600 to-brand-500 bg-clip-text text-transparent dark:from-brand-400 dark:to-brand-300">
        {value}
      </p>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{description}</p>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}

function ContinueLearningCardEnhanced({
  courseId,
  courseTitle,
  completionPercent,
  completedLessons,
  totalLessons,
  nextLessonId,
  nextLessonTitle,
  nextLessonNumber,
}: {
  courseId: string;
  courseTitle: string;
  completionPercent: number;
  completedLessons: number;
  totalLessons: number;
  nextLessonId: string;
  nextLessonTitle: string;
  nextLessonNumber: number;
}) {
  return (
    <div className="rounded-3xl bg-emerald-50 p-6 shadow-[0_0_0_1px_rgba(16,185,129,0.16)] sm:p-8 dark:bg-emerald-950/20 dark:shadow-[0_0_0_1px_rgba(52,211,153,0.18)]">
      <p className="mb-1 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
        הצעד הבא שלך
      </p>
      <h2 className="mb-2 text-balance text-xl font-bold text-zinc-900 dark:text-white">
        {courseTitle}
      </h2>
      <p className="mb-4 text-pretty text-sm text-zinc-600 dark:text-zinc-400">
        פותחים שיעור אחד, בוחרים ממנו תרגול אחד ושומרים נקודה קצרה לחזרה.
      </p>

      {/* Next lesson highlight */}
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
          <p className="tabular-nums text-xs text-zinc-500 dark:text-zinc-400">
            שיעור הבא ({nextLessonNumber} מתוך {totalLessons})
          </p>
          <p className="truncate text-sm font-medium text-zinc-900 dark:text-white">
            {nextLessonTitle}
          </p>
        </div>
      </div>

      {/* Mini progress bar */}
      <div className="mb-2">
        <div className="mb-1 flex justify-between text-sm">
          <span className="text-zinc-600 dark:text-zinc-400">
            {completedLessons} מתוך {totalLessons} שיעורים
          </span>
          <span className="tabular-nums font-medium text-zinc-900 dark:text-white">
            {completionPercent}%
          </span>
        </div>
        <div
          className="h-2 w-full overflow-hidden rounded-full bg-emerald-200 dark:bg-emerald-900"
          role="progressbar"
          aria-valuenow={completionPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`התקדמות: ${completionPercent}%`}
        >
          <div
            className="h-2 w-full origin-right rounded-full bg-emerald-500 transition-transform duration-300"
            style={{ transform: `scaleX(${completionPercent / 100})` }}
          />
        </div>
      </div>

      <Link
        href={`/courses/${courseId}/learn?lesson=${nextLessonId}`}
        className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-[transform,background-color,box-shadow] hover:bg-emerald-800 hover:shadow-md active:scale-[0.96] dark:bg-emerald-600 dark:hover:bg-emerald-500"
      >
        <svg
          className="h-3.5 w-3.5"
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
        לפתוח את השיעור
      </Link>
    </div>
  );
}

function ContinueLearningCard({
  courseId,
  courseTitle,
  completionPercent,
  completedLessons,
  totalLessons,
}: {
  courseId: string;
  courseTitle: string;
  completionPercent: number;
  completedLessons: number;
  totalLessons: number;
}) {
  return (
    <div className="rounded-3xl bg-emerald-50 p-6 shadow-[0_0_0_1px_rgba(16,185,129,0.16)] sm:p-8 dark:bg-emerald-950/20 dark:shadow-[0_0_0_1px_rgba(52,211,153,0.18)]">
      <p className="mb-1 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
        הצעד הבא שלך
      </p>
      <h2 className="mb-2 text-balance text-xl font-bold text-zinc-900 dark:text-white">
        {courseTitle}
      </h2>
      <p className="mb-4 text-pretty text-sm text-zinc-600 dark:text-zinc-400">
        אפשר לפתוח את רשימת השיעורים ולבחור את היחידה הבאה שמתאימה עכשיו.
      </p>

      {/* Mini progress bar */}
      <div className="mb-2">
        <div className="mb-1 flex justify-between text-sm">
          <span className="text-zinc-600 dark:text-zinc-400">
            {completedLessons} מתוך {totalLessons} שיעורים
          </span>
          <span className="tabular-nums font-medium text-zinc-900 dark:text-white">
            {completionPercent}%
          </span>
        </div>
        <div
          className="h-2 w-full overflow-hidden rounded-full bg-emerald-200 dark:bg-emerald-900"
          role="progressbar"
          aria-valuenow={completionPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`התקדמות: ${completionPercent}%`}
        >
          <div
            className="h-2 w-full origin-right rounded-full bg-emerald-500 transition-transform duration-300"
            style={{ transform: `scaleX(${completionPercent / 100})` }}
          />
        </div>
      </div>

      <Link
        href={`/courses/${courseId}/learn`}
        className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-[transform,background-color,box-shadow] hover:bg-emerald-800 hover:shadow-md active:scale-[0.96] dark:bg-emerald-600 dark:hover:bg-emerald-500"
      >
        לפתוח את רשימת השיעורים
      </Link>
    </div>
  );
}

function StreakCard({ streak }: { streak: number }) {
  const streakColor =
    streak === 0
      ? "text-zinc-400"
      : streak >= 7
        ? "text-amber-500"
        : "text-orange-500";

  return (
    <div className="rounded-2xl bg-zinc-50 p-5 dark:bg-zinc-900">
      <p className="mb-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
        ימים עם פעילות למידה
      </p>
      <div className="flex items-center gap-3">
        <span className="text-3xl" aria-hidden="true">
          🔥
        </span>
        <div>
          <p className={`tabular-nums text-2xl font-bold ${streakColor}`}>
            {streak}{" "}
            <span className="text-sm font-normal text-zinc-500 dark:text-zinc-400">
              {streak === 1 ? "יום" : "ימים"}
            </span>
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {streak === 0
              ? "גם תרגול קצר יכול להיות נקודת חזרה"
              : streak === 1
                ? "חזרת ללמידה היום"
                : "זה מספר הימים הרצופים שבהם חזרת ללמידה"}
          </p>
        </div>
      </div>
      <Link
        href="/student/analytics"
        className="mt-3 block text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
      >
        לסקירת הלמידה &rarr;
      </Link>
    </div>
  );
}

function AchievementsSummaryCard({
  earnedCount,
  totalCount,
  icons,
}: {
  earnedCount: number;
  totalCount: number;
  icons: string[];
}) {
  // Map achievement icon names to simple emoji representations
  const iconEmoji: Record<string, string> = {
    rocket: "🚀",
    book: "📚",
    bookOpen: "📖",
    star: "⭐",
    sword: "⚔️",
    trophy: "🏆",
    medal: "🏅",
    fire: "🔥",
    flame: "🔥",
    crown: "👑",
    compass: "🧭",
    shield: "🛡️",
    puzzle: "🧩",
    check: "✅",
    heart: "❤️",
  };

  return (
    <div className="rounded-2xl bg-zinc-50 p-5 dark:bg-zinc-900">
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        הישגים
      </p>
      <div className="mb-2 flex gap-1">
        {icons.map((icon, i) => (
          <span key={i} className="text-xl" aria-hidden="true">
            {iconEmoji[icon] ?? "🏅"}
          </span>
        ))}
      </div>
      <p className="text-sm text-zinc-700 dark:text-zinc-300">
        <span className="font-semibold text-zinc-900 dark:text-white">
          {earnedCount}
        </span>{" "}
        מתוך {totalCount} הישגים הושגו
      </p>
      <Link
        href="/student/profile"
        className="mt-2 block text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
      >
        הצג פרופיל &rarr;
      </Link>
    </div>
  );
}

const NEW_FEATURES = [
  {
    href: "/chat",
    label: "כלי AI לרפלקציה",
    description: "משוב אוטומטי מוגבל המבוסס על תכני הקורס",
    icon: "🤖",
    color: "brand",
  },
  {
    href: "/simulator",
    label: "תרגול שיחה בדיוני",
    description: "תרחישים עם דמות AI ומשוב שאינו מנבא תגובה אמיתית",
    icon: "🎭",
    color: "purple",
  },
  {
    href: "/tools",
    label: "כלי דייטינג",
    description: "בנה פרופיל, נתח תמונות ועוד",
    icon: "🛠️",
    color: "blue",
  },
  {
    href: "/community",
    label: "קהילה",
    description: "שיתוף ושיחה עם לומדים, בכפוף לכללי הקהילה",
    icon: "👥",
    color: "emerald",
  },
] as const;

const FEATURE_COLOR_CLASSES = {
  brand:
    "border-brand-200 bg-brand-50 hover:border-brand-300 hover:bg-brand-100 dark:border-brand-700/40 dark:bg-brand-900/20 dark:hover:bg-brand-900/30",
  purple:
    "border-purple-200 bg-purple-50 hover:border-purple-300 hover:bg-purple-100 dark:border-purple-700/40 dark:bg-purple-900/20 dark:hover:bg-purple-900/30",
  blue: "border-blue-200 bg-blue-50 hover:border-blue-300 hover:bg-blue-100 dark:border-blue-700/40 dark:bg-blue-900/20 dark:hover:bg-blue-900/30",
  emerald:
    "border-emerald-200 bg-emerald-50 hover:border-emerald-300 hover:bg-emerald-100 dark:border-emerald-700/40 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/30",
};

const FEATURE_LABEL_CLASSES = {
  brand: "text-brand-900 dark:text-brand-200",
  purple: "text-purple-900 dark:text-purple-200",
  blue: "text-blue-900 dark:text-blue-200",
  emerald: "text-emerald-900 dark:text-emerald-200",
};

const FEATURE_DESC_CLASSES = {
  brand: "text-brand-700 dark:text-brand-400",
  purple: "text-purple-700 dark:text-purple-400",
  blue: "text-blue-700 dark:text-blue-400",
  emerald: "text-emerald-700 dark:text-emerald-400",
};

function NewFeaturesSection() {
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem("haderech_new_features_dismissed");
  });

  if (dismissed) return null;

  const handleDismiss = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("haderech_new_features_dismissed", "1");
    }
    setDismissed(true);
  };

  return (
    <section className="mt-12">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
            כלים חדשים
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            גלה את כל האפשרויות שמחכות לך
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="text-xs text-zinc-400 transition-colors hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
          aria-label="סגור סעיף כלים חדשים"
        >
          הסתר
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {NEW_FEATURES.map((feature) => (
          <Link
            key={feature.href}
            href={feature.href}
            className={`flex items-start gap-3 rounded-2xl border p-4 transition-all ${FEATURE_COLOR_CLASSES[feature.color]}`}
          >
            <span className="mt-0.5 text-2xl" aria-hidden="true">
              {feature.icon}
            </span>
            <div>
              <p
                className={`font-semibold ${FEATURE_LABEL_CLASSES[feature.color]}`}
              >
                {feature.label}
              </p>
              <p
                className={`mt-0.5 text-xs ${FEATURE_DESC_CLASSES[feature.color]}`}
              >
                {feature.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function EmptyCoursesState() {
  return (
    <div className="rounded-2xl bg-zinc-50 p-12 text-center dark:bg-zinc-900">
      <svg
        className="mx-auto mb-3 h-10 w-10 text-zinc-300 dark:text-zinc-600"
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
      <p className="mb-2 text-lg font-medium text-zinc-700 dark:text-zinc-300">
        עדיין אין קורסים במערכת
      </p>
      <p className="mb-4 text-zinc-500 dark:text-zinc-400">
        קורסים יתווספו בקרוב. בינתיים, תוכל להשתמש בכלי יצירת הנתונים למטה (במצב
        פיתוח).
      </p>
    </div>
  );
}

function SeedDataTool() {
  const seedCourses = useMutation(api.seed.seedCourses);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSeed() {
    setLoading(true);
    setStatus(null);
    try {
      const result = await seedCourses();
      setStatus(result.message);
    } catch (err) {
      setStatus(
        `Error: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-dashed border-amber-300 bg-amber-50 p-6 dark:border-amber-700 dark:bg-amber-950/30">
      <div className="mb-2 flex items-center gap-2">
        <span className="text-sm font-bold text-amber-800 dark:text-amber-300">
          [DEV] כלי פיתוח
        </span>
      </div>
      <p className="mb-4 text-sm text-amber-700 dark:text-amber-400">
        יצירת נתוני דוגמה: 3 קורסים עם 16 שיעורים בסך הכל (אומנות ההקשבה, תקשורת
        זוגית מתקדמת, מפתחות לאינטימיות).
      </p>
      <button
        type="button"
        onClick={handleSeed}
        disabled={loading}
        className="inline-flex h-9 items-center rounded-lg bg-amber-600 px-4 text-sm font-medium text-white transition-colors hover:bg-amber-700 disabled:opacity-50 dark:bg-amber-700 dark:hover:bg-amber-600"
      >
        {loading ? "יוצר נתונים..." : "צור נתוני דוגמה"}
      </button>
      {status && (
        <p className="mt-3 text-sm text-amber-800 dark:text-amber-300">
          {status}
        </p>
      )}
    </div>
  );
}
