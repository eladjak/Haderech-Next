"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import Link from "next/link";
import { api } from "@/../convex/_generated/api";
import { Header } from "@/components/layout/header";
import type { Id } from "@/../convex/_generated/dataModel";

export default function CourseDetailPage() {
  const params = useParams<{ courseId: string }>();
  const courseId = params.courseId as Id<"courses">;
  const courseWithLessons = useQuery(api.courses.getWithLessons, {
    id: courseId,
  });

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

  return (
    <div className="min-h-dvh bg-white dark:bg-zinc-950">
      <Header />

      <main className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-3xl">
          {/* Breadcrumb */}
          <nav className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
            <Link href="/courses" className="hover:text-zinc-900 dark:hover:text-white">
              קורסים
            </Link>
            <span className="mx-2">/</span>
            <span className="text-zinc-900 dark:text-white">{course.title}</span>
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
          <p className="mb-8 text-lg text-zinc-600 dark:text-zinc-400">
            {course.description}
          </p>

          {/* Course Stats */}
          <div className="mb-8 flex gap-6 text-sm text-zinc-500 dark:text-zinc-400">
            <span>{publishedLessons.length} שיעורים</span>
            {publishedLessons.some((l) => l.duration) && (
              <span>
                {formatTotalDuration(publishedLessons)} זמן כולל
              </span>
            )}
          </div>

          {/* Lessons List */}
          <section>
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
                {publishedLessons.map((lesson, index) => (
                  <Link
                    key={lesson._id}
                    href={`/courses/${courseId}/learn?lesson=${lesson._id}`}
                    className="flex items-center gap-4 rounded-xl bg-zinc-50 p-4 transition-colors hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-sm font-medium text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
                      {index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-zinc-900 dark:text-white">
                        {lesson.title}
                      </p>
                      {lesson.duration && (
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                          {formatDuration(lesson.duration)}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
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

function formatTotalDuration(
  lessons: Array<{ duration?: number }>
): string {
  const totalSeconds = lessons.reduce((sum, l) => sum + (l.duration ?? 0), 0);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours === 0) return `${minutes} דקות`;
  if (minutes === 0) return `${hours} שעות`;
  return `${hours} שעות ו-${minutes} דקות`;
}
