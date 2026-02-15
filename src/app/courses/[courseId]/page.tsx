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
import type { Id } from "@/../convex/_generated/dataModel";

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

  // Mutations
  const enrollMutation = useMutation(api.enrollments.enroll);
  const unenrollMutation = useMutation(api.enrollments.unenroll);
  const issueCertificate = useMutation(api.certificates.issue);

  if (courseWithLessons === undefined) {
    return (
      <div className="min-h-dvh bg-white dark:bg-zinc-950">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <div className="mx-auto max-w-3xl">
            <div className="mb-6 h-8 w-64 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800" />
            <div className="mb-4 h-4 w-full animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
            <div className="mb-4 h-4 w-3/4 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
            <div className="mt-8 space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-16 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800"
                />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (courseWithLessons === null) {
    return (
      <div className="min-h-dvh bg-white dark:bg-zinc-950">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-4 text-2xl font-bold text-zinc-900 dark:text-white">
              הקורס לא נמצא
            </h1>
            <p className="mb-6 text-zinc-600 dark:text-zinc-400">
              הקורס שחיפשת לא קיים או שהוסר.
            </p>
            <Link
              href="/courses"
              className="inline-flex h-10 items-center rounded-full bg-zinc-900 px-6 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
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
    <div className="min-h-dvh bg-white dark:bg-zinc-950">
      <Header />

      <main className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-3xl">
          {/* Breadcrumb */}
          <nav
            className="mb-6 text-sm text-zinc-500 dark:text-zinc-400"
            aria-label="ניווט"
          >
            <Link
              href="/courses"
              className="hover:text-zinc-900 dark:hover:text-white"
            >
              קורסים
            </Link>
            <span className="mx-2">/</span>
            <span className="text-zinc-900 dark:text-white">
              {course.title}
            </span>
          </nav>

          {/* Course Header */}
          {course.imageUrl && (
            <div className="mb-6 aspect-video overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-800">
              <img
                src={course.imageUrl}
                alt={course.title}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          <h1 className="mb-4 text-3xl font-bold text-zinc-900 dark:text-white">
            {course.title}
          </h1>
          <p className="mb-6 text-lg text-zinc-600 dark:text-zinc-400">
            {course.description}
          </p>

          {/* Course Stats */}
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <Badge variant="default">
              {publishedLessons.length} שיעורים
            </Badge>
            {totalDuration > 0 && (
              <Badge variant="default">
                {formatTotalDuration(totalDuration)}
              </Badge>
            )}
            {isEnrolled && <Badge variant="success">רשום לקורס</Badge>}
            {certificate && <Badge variant="info">תעודה הונפקה</Badge>}
          </div>

          {/* Enrollment + Progress Section */}
          {clerkUser && (
            <div className="mb-8 rounded-2xl bg-zinc-50 p-6 dark:bg-zinc-900">
              {isEnrolled !== undefined && (
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <EnrollButton
                    isEnrolled={isEnrolled === true}
                    onEnroll={handleEnroll}
                    onUnenroll={handleUnenroll}
                  />

                  {isEnrolled && publishedLessons.length > 0 && (
                    <Link
                      href={`/courses/${courseId}/learn`}
                      className="inline-flex h-11 items-center justify-center rounded-full bg-zinc-900 px-8 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
                    >
                      {completedCount > 0 ? "המשך ללמוד" : "התחל ללמוד"}
                    </Link>
                  )}
                </div>
              )}

              {/* Progress bar */}
              {isEnrolled && completedCount > 0 && (
                <div className="mt-4">
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

              {/* Certificate CTA */}
              {canGetCertificate && (
                <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-900/20">
                  <p className="mb-2 text-sm font-medium text-emerald-800 dark:text-emerald-300">
                    סיימת את הקורס! אפשר לקבל תעודת סיום.
                  </p>
                  <button
                    type="button"
                    onClick={handleIssueCertificate}
                    className="inline-flex h-9 items-center rounded-full bg-emerald-600 px-5 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
                  >
                    הנפק תעודה
                  </button>
                </div>
              )}

              {/* Certificate display */}
              {certificate && (
                <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                  <p className="mb-1 text-sm font-medium text-blue-800 dark:text-blue-300">
                    תעודת סיום הונפקה
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    מספר תעודה: {certificate.certificateNumber}
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    תאריך:{" "}
                    {new Intl.DateTimeFormat("he-IL").format(
                      new Date(certificate.issuedAt)
                    )}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Not logged in CTA */}
          {!clerkUser && (
            <div className="mb-8 rounded-2xl bg-zinc-50 p-6 text-center dark:bg-zinc-900">
              <p className="mb-3 text-zinc-600 dark:text-zinc-400">
                התחבר כדי להירשם לקורס ולעקוב אחרי ההתקדמות שלך
              </p>
              <Link
                href="/sign-in"
                className="inline-flex h-10 items-center rounded-full bg-zinc-900 px-6 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
              >
                התחברות
              </Link>
            </div>
          )}

          {/* Lessons List */}
          <section aria-label="תוכן הקורס">
            <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-white">
              תוכן הקורס
            </h2>

            {publishedLessons.length === 0 ? (
              <div className="rounded-2xl bg-zinc-50 p-8 text-center dark:bg-zinc-900">
                <p className="text-zinc-600 dark:text-zinc-400">
                  שיעורים יתווספו בקרוב.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {publishedLessons.map((lesson, index) => {
                  const lessonProgress = progressMap.get(lesson._id);
                  const isComplete = lessonProgress?.completed === true;

                  return (
                    <Link
                      key={lesson._id}
                      href={`/courses/${courseId}/learn?lesson=${lesson._id}`}
                      className="flex items-center gap-4 rounded-xl bg-zinc-50 p-4 transition-colors hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                    >
                      {/* Lesson number / completion indicator */}
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium ${
                          isComplete
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : "bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300"
                        }`}
                      >
                        {isComplete ? (
                          <svg
                            className="h-4 w-4"
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
                          index + 1
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
                        {lesson.duration && (
                          <p className="text-sm text-zinc-500 dark:text-zinc-400">
                            {formatDuration(lesson.duration)}
                          </p>
                        )}
                      </div>

                      {/* Progress indicator */}
                      {lessonProgress &&
                        !isComplete &&
                        lessonProgress.progressPercent > 0 && (
                          <span className="text-xs text-zinc-400 dark:text-zinc-500">
                            {lessonProgress.progressPercent}%
                          </span>
                        )}
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
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
