"use client";

import { useParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { api } from "@/../convex/_generated/api";
import { Header } from "@/components/layout/header";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Badge } from "@/components/ui/badge";
import { EnrollButton } from "@/components/course/enroll-button";
import { CourseReviews } from "@/components/reviews/course-reviews";
import { SocialShare } from "@/components/social-share";
import type { Id } from "@/../convex/_generated/dataModel";

const LEVEL_LABELS: Record<string, string> = {
  beginner: "מתחילים",
  intermediate: "בינוני",
  advanced: "מתקדם",
};

const LEVEL_COLORS: Record<string, string> = {
  beginner:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  intermediate:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  advanced:
    "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

export default function CourseDetailPage() {
  const params = useParams<{ courseId: string }>();
  const courseId = params.courseId as Id<"courses">;
  const { user: clerkUser } = useUser();

  const courseWithLessons = useQuery(api.courses.getWithLessons, {
    id: courseId,
  });

  // Get user from Convex by Clerk ID
  const convexUser = useQuery(
    api.users.getByClerkId,
    clerkUser?.id ? { clerkId: clerkUser.id } : "skip"
  );

  // Enrollment and progress queries
  const isEnrolled = useQuery(
    api.enrollments.isEnrolled,
    convexUser?._id ? { userId: convexUser._id, courseId } : "skip"
  );

  const courseProgress = useQuery(
    api.progress.getForCourse,
    convexUser?._id ? { userId: convexUser._id, courseId } : "skip"
  );

  const certificate = useQuery(
    api.certificates.getByUserAndCourse,
    convexUser?._id ? { userId: convexUser._id, courseId } : "skip"
  );

  // Course rating
  const courseRating = useQuery(api.reviews.getCourseRating, { courseId });

  // Mutations
  const enrollMutation = useMutation(api.enrollments.enroll);
  const unenrollMutation = useMutation(api.enrollments.unenroll);
  const issueCertificate = useMutation(api.certificates.issue);

  if (courseWithLessons === undefined) {
    return (
      <div className="min-h-dvh bg-background">
        <Header />
        <main>
          {/* Hero skeleton */}
          <div className="relative overflow-hidden bg-gradient-to-bl from-blue-500/10 via-background to-brand-500/10 pb-12 pt-8">
            <div className="container mx-auto px-4">
              <div className="mx-auto max-w-4xl">
                <div className="mb-4 h-5 w-32 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
                <div className="mb-4 h-10 w-3/4 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
                <div className="mb-3 h-5 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
                <div className="mb-8 h-5 w-2/3 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
                <div className="flex gap-3">
                  <div className="h-12 w-40 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
                  <div className="h-12 w-36 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
                </div>
              </div>
            </div>
          </div>
          {/* Stats bar skeleton */}
          <div className="border-b border-zinc-200 bg-white py-4 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="container mx-auto px-4">
              <div className="mx-auto flex max-w-4xl justify-around">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="text-center">
                    <div className="mx-auto mb-1 h-6 w-10 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
                    <div className="mx-auto h-3 w-16 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Content skeleton */}
          <div className="container mx-auto px-4 py-10">
            <div className="mx-auto max-w-4xl">
              <div className="mt-8 space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="h-16 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800"
                  />
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (courseWithLessons === null) {
    return (
      <div className="min-h-dvh bg-background">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
              <svg
                className="h-10 w-10 text-zinc-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                />
              </svg>
            </div>
            <h1 className="mb-4 text-2xl font-bold text-zinc-900 dark:text-white">
              הקורס לא נמצא
            </h1>
            <p className="mb-6 text-zinc-600 dark:text-zinc-400">
              הקורס שחיפשת לא קיים או שהוסר.
            </p>
            <Link
              href="/courses"
              className="inline-flex h-10 items-center rounded-full bg-brand-500 px-6 text-sm font-medium text-white transition-colors hover:bg-brand-600"
            >
              חזרה לקורסים
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const { lessons, ...course } = courseWithLessons;
  const publishedLessons = lessons.filter((l) => l.published);
  const totalDuration = publishedLessons.reduce(
    (sum, l) => sum + (l.duration ?? 0),
    0
  );

  // Build progress map
  const progressMap = new Map(
    (courseProgress ?? []).map((p) => [p.lessonId, p])
  );
  const completedCount = (courseProgress ?? []).filter(
    (p) => p.completed
  ).length;
  const completionPercent =
    publishedLessons.length > 0
      ? Math.round((completedCount / publishedLessons.length) * 100)
      : 0;

  const canGetCertificate = completionPercent >= 80 && !certificate;

  // Group lessons by week (7 lessons per week)
  const LESSONS_PER_WEEK = 7;
  const weeks: { weekNumber: number; lessons: typeof publishedLessons }[] = [];
  for (let i = 0; i < publishedLessons.length; i += LESSONS_PER_WEEK) {
    weeks.push({
      weekNumber: Math.floor(i / LESSONS_PER_WEEK) + 1,
      lessons: publishedLessons.slice(i, i + LESSONS_PER_WEEK),
    });
  }

  // Find next lesson to continue
  const nextLessonToContinue = publishedLessons.find(
    (l) => !progressMap.get(l._id)?.completed
  );

  async function handleEnroll() {
    if (!convexUser?._id) return;
    await enrollMutation({ userId: convexUser._id, courseId });
  }

  async function handleUnenroll() {
    if (!convexUser?._id) return;
    await unenrollMutation({ userId: convexUser._id, courseId });
  }

  async function handleIssueCertificate() {
    if (!convexUser?._id) return;
    await issueCertificate({ userId: convexUser._id, courseId });
  }

  return (
    <div className="min-h-dvh bg-background">
      <Header />

      <main>
        {/* ===== Hero Section ===== */}
        <section className="relative overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-bl from-blue-500/8 via-background to-brand-500/8 animate-hero-gradient" />

          {/* Decorative elements */}
          <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
            <div className="absolute -top-32 -left-32 h-64 w-64 rounded-full bg-brand-500/5 blur-3xl" />
            <div className="absolute -bottom-32 -right-32 h-64 w-64 rounded-full bg-blue-500/5 blur-3xl" />
          </div>

          <div className="relative container mx-auto px-4 pb-12 pt-8">
            {/* Breadcrumb */}
            <nav
              className="mb-6 text-sm text-zinc-500 dark:text-zinc-400"
              aria-label="ניווט"
            >
              <Link
                href="/courses"
                className="transition-colors hover:text-brand-500"
              >
                קורסים
              </Link>
              <span className="mx-2">/</span>
              <span className="text-zinc-900 dark:text-white">
                {course.title}
              </span>
            </nav>

            <div className="mx-auto max-w-4xl">
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
                {/* Content side */}
                <div className="lg:col-span-3">
                  {/* Level badge */}
                  {course.level && (
                    <span
                      className={`mb-4 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${LEVEL_COLORS[course.level] ?? ""}`}
                    >
                      {LEVEL_LABELS[course.level] ?? course.level}
                    </span>
                  )}

                  <h1 className="mb-4 text-3xl font-bold leading-tight text-zinc-900 md:text-4xl dark:text-white text-shadow-hero">
                    {course.title}
                  </h1>

                  <p className="mb-6 text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {course.description}
                  </p>

                  {/* Rating display */}
                  {courseRating && courseRating.count > 0 && (
                    <div className="mb-6 flex items-center gap-2">
                      <div className="flex items-center gap-1" dir="ltr">
                        {Array.from({ length: 5 }, (_, i) => (
                          <svg
                            key={i}
                            className={`h-5 w-5 ${
                              i < Math.round(courseRating.average)
                                ? "text-accent-400"
                                : "text-zinc-300 dark:text-zinc-600"
                            }`}
                            viewBox="0 0 24 24"
                            fill={
                              i < Math.round(courseRating.average)
                                ? "currentColor"
                                : "none"
                            }
                            stroke="currentColor"
                            strokeWidth={
                              i < Math.round(courseRating.average) ? 0 : 1.5
                            }
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                            />
                          </svg>
                        ))}
                      </div>
                      <span className="text-sm font-semibold text-zinc-900 dark:text-white">
                        {courseRating.average}
                      </span>
                      <span className="text-sm text-zinc-500 dark:text-zinc-400">
                        ({courseRating.count} ביקורות)
                      </span>
                    </div>
                  )}

                  {/* CTA Buttons */}
                  <div className="flex flex-wrap items-center gap-3">
                    {clerkUser ? (
                      <>
                        {isEnrolled !== undefined && (
                          <>
                            {isEnrolled ? (
                              <Link
                                href={
                                  nextLessonToContinue
                                    ? `/courses/${courseId}/learn?lesson=${nextLessonToContinue._id}`
                                    : `/courses/${courseId}/learn`
                                }
                                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-l from-brand-500 to-brand-600 px-8 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition-all hover:shadow-xl hover:shadow-brand-500/30"
                              >
                                <svg
                                  className="h-5 w-5"
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                  aria-hidden="true"
                                >
                                  <path d="M8 5.14v14l11-7-11-7z" />
                                </svg>
                                {completedCount > 0
                                  ? "המשך ללמוד"
                                  : "התחל ללמוד"}
                              </Link>
                            ) : (
                              <button
                                type="button"
                                onClick={handleEnroll}
                                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-l from-brand-500 to-brand-600 px-8 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition-all hover:shadow-xl hover:shadow-brand-500/30"
                              >
                                <svg
                                  className="h-5 w-5"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={2}
                                  aria-hidden="true"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 4.5v15m7.5-7.5h-15"
                                  />
                                </svg>
                                הירשם לקורס - חינם
                              </button>
                            )}
                          </>
                        )}
                        {isEnrolled && (
                          <EnrollButton
                            isEnrolled={true}
                            onEnroll={handleEnroll}
                            onUnenroll={handleUnenroll}
                          />
                        )}
                      </>
                    ) : (
                      <Link
                        href="/sign-in"
                        className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-l from-brand-500 to-brand-600 px-8 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition-all hover:shadow-xl hover:shadow-brand-500/30"
                      >
                        התחבר כדי להירשם
                      </Link>
                    )}
                  </div>

                  {/* Progress bar for enrolled users */}
                  {isEnrolled && completedCount > 0 && (
                    <div className="mt-6 max-w-sm">
                      <ProgressBar
                        value={completionPercent}
                        showLabel
                        size="md"
                      />
                      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                        {completedCount} מתוך {publishedLessons.length} שיעורים
                        הושלמו
                      </p>
                    </div>
                  )}
                </div>

                {/* Image side */}
                <div className="lg:col-span-2">
                  {course.imageUrl ? (
                    <div className="overflow-hidden rounded-2xl shadow-xl shadow-black/10">
                      <img
                        src={course.imageUrl}
                        alt={course.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex aspect-video items-center justify-center rounded-2xl bg-gradient-to-br from-brand-100 to-blue-100 shadow-xl shadow-black/10 dark:from-brand-500/10 dark:to-blue-500/10">
                      <svg
                        className="h-16 w-16 text-brand-300 dark:text-brand-500/50"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1}
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== Stats Bar ===== */}
        <section className="border-y border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80">
          <div className="container mx-auto px-4">
            <div className="mx-auto grid max-w-4xl grid-cols-2 gap-4 py-5 sm:grid-cols-4">
              {/* Lesson count */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <svg
                    className="h-5 w-5 text-brand-500"
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
                  <span className="text-xl font-bold text-zinc-900 dark:text-white">
                    {publishedLessons.length}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                  שיעורים
                </p>
              </div>

              {/* Duration */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <svg
                    className="h-5 w-5 text-blue-500"
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
                  <span className="text-xl font-bold text-zinc-900 dark:text-white">
                    {totalDuration > 0
                      ? formatTotalDurationShort(totalDuration)
                      : course.estimatedHours
                        ? `${course.estimatedHours} שע׳`
                        : "---"}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                  זמן משוער
                </p>
              </div>

              {/* Level */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <svg
                    className="h-5 w-5 text-accent-400"
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
                  <span className="text-xl font-bold text-zinc-900 dark:text-white">
                    {course.level
                      ? LEVEL_LABELS[course.level] ?? course.level
                      : "כללי"}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                  רמה
                </p>
              </div>

              {/* Rating */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <svg
                    className="h-5 w-5 text-accent-400"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                  </svg>
                  <span className="text-xl font-bold text-zinc-900 dark:text-white">
                    {courseRating && courseRating.count > 0
                      ? courseRating.average
                      : "---"}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                  {courseRating && courseRating.count > 0
                    ? `${courseRating.count} ביקורות`
                    : "דירוג"}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ===== Main Content ===== */}
        <div className="container mx-auto px-4 py-10">
          <div className="mx-auto max-w-4xl">
            {/* Certificate CTA */}
            {canGetCertificate && (
              <div className="mb-8 rounded-2xl border border-emerald-200 bg-gradient-to-l from-emerald-50 to-white p-6 dark:border-emerald-800 dark:from-emerald-900/20 dark:to-zinc-900">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-emerald-800 dark:text-emerald-300">
                      כל הכבוד! סיימת את הקורס
                    </h3>
                    <p className="mt-1 text-sm text-emerald-600 dark:text-emerald-400">
                      אפשר לקבל תעודת סיום עכשיו.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleIssueCertificate}
                    className="inline-flex h-10 items-center gap-2 rounded-full bg-emerald-600 px-6 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
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
                        d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342"
                      />
                    </svg>
                    הנפק תעודה
                  </button>
                </div>
              </div>
            )}

            {/* Certificate display */}
            {certificate && (
              <div className="mb-8 rounded-2xl border border-blue-200 bg-gradient-to-l from-blue-50 to-white p-6 dark:border-blue-800 dark:from-blue-900/20 dark:to-zinc-900">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                    <svg
                      className="h-5 w-5 text-blue-600 dark:text-blue-400"
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
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">
                      תעודת סיום הונפקה
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                      מספר: {certificate.certificateNumber} | תאריך:{" "}
                      {new Intl.DateTimeFormat("he-IL").format(
                        new Date(certificate.issuedAt)
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Social Share */}
            <div className="mb-8">
              <SocialShare
                url={`https://haderech.co.il/courses/${courseId}`}
                title={`${course.title} - הדרך: אומנות הקשר`}
                description={course.description}
              />
            </div>

            {/* ===== Curriculum Section ===== */}
            <section aria-label="תוכנית לימודים">
              <h2 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-white">
                תוכנית הלימודים
              </h2>

              {publishedLessons.length === 0 ? (
                <div className="rounded-2xl bg-zinc-50 p-10 text-center dark:bg-zinc-900">
                  <svg
                    className="mx-auto mb-3 h-12 w-12 text-zinc-300 dark:text-zinc-600"
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
                  <p className="text-zinc-600 dark:text-zinc-400">
                    שיעורים יתווספו בקרוב.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {weeks.map((week) => (
                    <div key={week.weekNumber}>
                      {/* Week header (only show if more than 1 week) */}
                      {weeks.length > 1 && (
                        <div className="mb-3 flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-sm font-bold text-blue-500">
                            {week.weekNumber}
                          </div>
                          <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                            שבוע {week.weekNumber}
                          </h3>
                          <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
                        </div>
                      )}

                      {/* Lessons in this week */}
                      <div className="space-y-2">
                        {week.lessons.map((lesson) => {
                          const globalIndex = publishedLessons.findIndex(
                            (l) => l._id === lesson._id
                          );
                          const lessonProgress = progressMap.get(lesson._id);
                          const isComplete =
                            lessonProgress?.completed === true;
                          const isLocked = !isEnrolled && !!clerkUser;
                          const lessonHref = isEnrolled
                            ? `/courses/${courseId}/learn?lesson=${lesson._id}`
                            : `/courses/${courseId}`;

                          return (
                            <div
                              key={lesson._id}
                              className={`card-hover gradient-border-hover group relative flex items-center gap-4 rounded-xl border border-zinc-100 bg-white p-4 transition-colors dark:border-zinc-800 dark:bg-zinc-900/50 ${
                                isLocked
                                  ? "opacity-60"
                                  : "hover:border-brand-200 dark:hover:border-zinc-700"
                              }`}
                            >
                              {isEnrolled || !clerkUser ? (
                                <Link
                                  href={lessonHref}
                                  className="absolute inset-0 z-10 rounded-xl"
                                  aria-label={`${lesson.title} - שיעור ${globalIndex + 1}`}
                                />
                              ) : null}

                              {/* Lesson number / completion indicator */}
                              <div
                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                                  isComplete
                                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                    : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                                }`}
                              >
                                {isComplete ? (
                                  <svg
                                    className="h-5 w-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2.5}
                                    aria-label="הושלם"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M4.5 12.75l6 6 9-13.5"
                                    />
                                  </svg>
                                ) : (
                                  globalIndex + 1
                                )}
                              </div>

                              <div className="min-w-0 flex-1">
                                <p
                                  className={`font-medium ${
                                    isComplete
                                      ? "text-emerald-700 dark:text-emerald-400"
                                      : "text-zinc-900 dark:text-white"
                                  }`}
                                >
                                  {lesson.title}
                                </p>
                                <div className="mt-0.5 flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
                                  {lesson.duration && (
                                    <span className="flex items-center gap-1">
                                      <svg
                                        className="h-3.5 w-3.5"
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
                                      {formatDuration(lesson.duration)}
                                    </span>
                                  )}
                                  {lesson.videoUrl && (
                                    <span className="flex items-center gap-1">
                                      <svg
                                        className="h-3.5 w-3.5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={1.5}
                                        aria-hidden="true"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z"
                                        />
                                      </svg>
                                      וידאו
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Right side indicator */}
                              <div className="shrink-0">
                                {isLocked ? (
                                  <svg
                                    className="h-5 w-5 text-zinc-300 dark:text-zinc-600"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={1.5}
                                    aria-label="נעול - הירשם לקורס כדי לצפות"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                                    />
                                  </svg>
                                ) : lessonProgress &&
                                  !isComplete &&
                                  lessonProgress.progressPercent > 0 ? (
                                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                    {lessonProgress.progressPercent}%
                                  </span>
                                ) : (
                                  <svg
                                    className="h-5 w-5 text-zinc-300 transition-colors group-hover:text-brand-500 dark:text-zinc-600"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={1.5}
                                    aria-hidden="true"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M15.75 19.5L8.25 12l7.5-7.5"
                                    />
                                  </svg>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* ===== Reviews Section ===== */}
            <CourseReviews courseId={courseId} />
          </div>
        </div>
      </main>
    </div>
  );
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes === 0) return `${remainingSeconds} שניות`;
  if (remainingSeconds === 0) return `${minutes} דקות`;
  return `${minutes}:${String(remainingSeconds).padStart(2, "0")} דקות`;
}

function formatTotalDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours === 0) return `${minutes} דקות`;
  if (minutes === 0) return `${hours} שעות`;
  return `${hours} שעות ו-${minutes} דקות`;
}

function formatTotalDurationShort(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours === 0) return `${minutes} דק׳`;
  if (minutes === 0) return `${hours} שע׳`;
  return `${hours}:${String(minutes).padStart(2, "0")} שע׳`;
}
