"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useQuery } from "convex/react";
import Link from "next/link";
import { Suspense } from "react";
import { api } from "@/../convex/_generated/api";
import type { Id } from "@/../convex/_generated/dataModel";

function LessonContent() {
  const params = useParams<{ courseId: string }>();
  const searchParams = useSearchParams();
  const courseId = params.courseId as Id<"courses">;
  const lessonId = searchParams.get("lesson") as Id<"lessons"> | null;

  const courseWithLessons = useQuery(api.courses.getWithLessons, {
    id: courseId,
  });

  const currentLesson = useQuery(
    api.lessons.getById,
    lessonId ? { id: lessonId } : "skip"
  );

  if (courseWithLessons === undefined) {
    return (
      <div className="flex min-h-dvh">
        <div className="w-80 shrink-0 animate-pulse bg-zinc-50 dark:bg-zinc-900" />
        <div className="flex-1 animate-pulse bg-zinc-100 dark:bg-zinc-800" />
      </div>
    );
  }

  if (courseWithLessons === null) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-white dark:bg-zinc-950">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-zinc-900 dark:text-white">
            הקורס לא נמצא
          </h1>
          <Link
            href="/courses"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          >
            חזרה לקורסים
          </Link>
        </div>
      </div>
    );
  }

  const { lessons, ...course } = courseWithLessons;
  const publishedLessons = lessons.filter((l) => l.published);

  // Default to first lesson if none selected
  const activeLessonId = lessonId ?? publishedLessons[0]?._id ?? null;
  const activeLesson =
    activeLessonId === lessonId
      ? currentLesson
      : publishedLessons.find((l) => l._id === activeLessonId) ?? null;

  const currentIndex = publishedLessons.findIndex(
    (l) => l._id === activeLessonId
  );
  const prevLesson = currentIndex > 0 ? publishedLessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < publishedLessons.length - 1
      ? publishedLessons[currentIndex + 1]
      : null;

  return (
    <div className="flex min-h-dvh bg-white dark:bg-zinc-950">
      {/* Sidebar - Lesson List */}
      <aside className="sticky top-0 hidden h-dvh w-80 shrink-0 overflow-y-auto border-l border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 md:block">
        <div className="border-b border-zinc-200 p-4 dark:border-zinc-800">
          <Link
            href={`/courses/${courseId}`}
            className="mb-1 block text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          >
            &rarr; חזרה לקורס
          </Link>
          <h2 className="font-semibold text-zinc-900 dark:text-white">
            {course.title}
          </h2>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            {publishedLessons.length} שיעורים
          </p>
        </div>

        <nav className="p-2">
          {publishedLessons.map((lesson, index) => {
            const isActive = lesson._id === activeLessonId;
            return (
              <Link
                key={lesson._id}
                href={`/courses/${courseId}/learn?lesson=${lesson._id}`}
                className={`mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  isActive
                    ? "bg-zinc-200 font-medium text-zinc-900 dark:bg-zinc-800 dark:text-white"
                    : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                }`}
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-300 text-xs font-medium text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300">
                  {index + 1}
                </span>
                <span className="truncate">{lesson.title}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Mobile Header */}
        <div className="border-b border-zinc-200 p-4 md:hidden dark:border-zinc-800">
          <Link
            href={`/courses/${courseId}`}
            className="text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          >
            &rarr; {course.title}
          </Link>
        </div>

        {activeLesson ? (
          <div className="mx-auto max-w-4xl p-6 md:p-10">
            {/* Lesson Title */}
            <h1 className="mb-6 text-2xl font-bold text-zinc-900 md:text-3xl dark:text-white">
              {activeLesson.title}
            </h1>

            {/* Video Player Placeholder */}
            {activeLesson.videoUrl && (
              <div className="mb-8 aspect-video overflow-hidden rounded-2xl bg-zinc-900">
                <video
                  src={activeLesson.videoUrl}
                  controls
                  className="h-full w-full"
                  playsInline
                >
                  <track kind="captions" />
                  הדפדפן שלך לא תומך בוידאו.
                </video>
              </div>
            )}

            {!activeLesson.videoUrl && (
              <div className="mb-8 flex aspect-video items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-900">
                <div className="text-center">
                  <div className="mb-2 text-4xl text-zinc-300 dark:text-zinc-600">
                    &#9654;
                  </div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    וידאו עדיין לא הועלה
                  </p>
                </div>
              </div>
            )}

            {/* Lesson Content */}
            {activeLesson.content && (
              <div className="prose prose-zinc dark:prose-invert max-w-none">
                <div className="whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">
                  {activeLesson.content}
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="mt-12 flex items-center justify-between border-t border-zinc-200 pt-6 dark:border-zinc-800">
              {prevLesson ? (
                <Link
                  href={`/courses/${courseId}/learn?lesson=${prevLesson._id}`}
                  className="flex items-center gap-2 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                >
                  <span>&larr;</span>
                  <span>{prevLesson.title}</span>
                </Link>
              ) : (
                <div />
              )}
              {nextLesson ? (
                <Link
                  href={`/courses/${courseId}/learn?lesson=${nextLesson._id}`}
                  className="flex items-center gap-2 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                >
                  <span>{nextLesson.title}</span>
                  <span>&rarr;</span>
                </Link>
              ) : (
                <div className="rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-800 dark:bg-green-900/20 dark:text-green-400">
                  סיימת את הקורס!
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center p-10">
            <div className="text-center">
              <p className="text-zinc-600 dark:text-zinc-400">
                {publishedLessons.length === 0
                  ? "אין שיעורים זמינים בקורס זה עדיין."
                  : "בחר שיעור מהרשימה כדי להתחיל."}
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function LearnPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh">
          <div className="w-80 shrink-0 animate-pulse bg-zinc-50 dark:bg-zinc-900" />
          <div className="flex-1 animate-pulse bg-zinc-100 dark:bg-zinc-800" />
        </div>
      }
    >
      <LessonContent />
    </Suspense>
  );
}
