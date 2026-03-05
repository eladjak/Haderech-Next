import Link from "next/link";
import type { Id } from "@/../convex/_generated/dataModel";

interface LessonNavProps {
  courseId: Id<"courses">;
  courseTitle: string;
  currentIndex: number;
  totalLessons: number;
  prevLesson: { _id: Id<"lessons">; title: string } | null;
  nextLesson: { _id: Id<"lessons">; title: string } | null;
}

export function LessonNav({
  courseId,
  courseTitle,
  currentIndex,
  totalLessons,
  prevLesson,
  nextLesson,
}: LessonNavProps) {
  return (
    <nav
      className="mb-6 flex flex-wrap items-center justify-between gap-3"
      aria-label="ניווט שיעורים"
    >
      {/* Breadcrumb + Position */}
      <div className="flex items-center gap-2 text-sm">
        <Link
          href="/courses"
          className="text-zinc-400 transition-colors hover:text-brand-500 dark:text-zinc-500 dark:hover:text-brand-400"
        >
          קורסים
        </Link>
        <span className="text-zinc-300 dark:text-zinc-600">/</span>
        <Link
          href={`/courses/${courseId}`}
          className="max-w-[180px] truncate text-zinc-500 transition-colors hover:text-brand-500 dark:text-zinc-400 dark:hover:text-brand-400"
        >
          {courseTitle}
        </Link>
        <span className="text-zinc-300 dark:text-zinc-600">/</span>
        <span className="rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-semibold text-brand-700 dark:bg-brand-900/30 dark:text-brand-400">
          שיעור {currentIndex + 1} מתוך {totalLessons}
        </span>
      </div>

      {/* Prev / Next buttons */}
      <div className="flex items-center gap-2">
        {prevLesson ? (
          <Link
            href={`/courses/${courseId}/lessons/${prevLesson._id}`}
            className="inline-flex h-8 items-center gap-1 rounded-lg border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-600 transition-colors hover:border-brand-200 hover:text-brand-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:text-white"
            aria-label={`שיעור קודם: ${prevLesson.title}`}
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
                d="M8.25 4.5l7.5 7.5-7.5 7.5"
              />
            </svg>
            הקודם
          </Link>
        ) : (
          <span className="inline-flex h-8 items-center gap-1 rounded-lg border border-zinc-100 px-3 text-xs text-zinc-300 dark:border-zinc-800 dark:text-zinc-600">
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
                d="M8.25 4.5l7.5 7.5-7.5 7.5"
              />
            </svg>
            הקודם
          </span>
        )}

        {nextLesson ? (
          <Link
            href={`/courses/${courseId}/lessons/${nextLesson._id}`}
            className="inline-flex h-8 items-center gap-1 rounded-lg border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-600 transition-colors hover:border-brand-200 hover:text-brand-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:text-white"
            aria-label={`שיעור הבא: ${nextLesson.title}`}
          >
            הבא
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
                d="M15.75 19.5L8.25 12l7.5-7.5"
              />
            </svg>
          </Link>
        ) : (
          <span className="inline-flex h-8 items-center gap-1 rounded-lg border border-zinc-100 px-3 text-xs text-zinc-300 dark:border-zinc-800 dark:text-zinc-600">
            הבא
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
                d="M15.75 19.5L8.25 12l7.5-7.5"
              />
            </svg>
          </span>
        )}
      </div>
    </nav>
  );
}
