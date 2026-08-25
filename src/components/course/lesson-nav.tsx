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
  const positionPercent =
    totalLessons > 0
      ? Math.round(((currentIndex + 1) / totalLessons) * 100)
      : 0;

  return (
    <nav
      className="mb-8"
      aria-label="ניווט שיעורים"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Breadcrumb + Position */}
        <div className="flex min-w-0 flex-wrap items-center gap-2 text-sm">
          <Link
            href="/courses"
            className="inline-flex min-h-10 items-center text-zinc-400 transition-colors hover:text-brand-500 dark:text-zinc-500 dark:hover:text-brand-400"
          >
            קורסים
          </Link>
          <span className="text-zinc-300 dark:text-zinc-600">/</span>
          <Link
            href={`/courses/${courseId}`}
            className="inline-flex min-h-10 max-w-[180px] items-center truncate text-zinc-500 transition-colors hover:text-brand-500 dark:text-zinc-400 dark:hover:text-brand-400"
          >
            {courseTitle}
          </Link>
          <span className="text-zinc-300 dark:text-zinc-600">/</span>
          <span className="tabular-nums rounded-full bg-brand-100 px-2.5 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-900/30 dark:text-brand-400">
            שיעור {currentIndex + 1} מתוך {totalLessons}
          </span>
        </div>

        {/* Prev / Next buttons */}
        <div className="flex items-center gap-2">
          {prevLesson ? (
            <Link
              href={`/courses/${courseId}/lessons/${prevLesson._id}`}
              className="inline-flex min-h-11 max-w-48 items-center gap-1.5 rounded-xl bg-white px-3 text-xs font-medium text-zinc-600 shadow-[0_0_0_1px_rgba(0,0,0,0.08)] transition-[transform,box-shadow,color] hover:text-brand-600 hover:shadow-md active:scale-[0.96] dark:bg-zinc-800 dark:text-zinc-300 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.1)] dark:hover:text-white"
              aria-label={`שיעור קודם: ${prevLesson.title}`}
            >
              <svg
                className="h-3.5 w-3.5 shrink-0"
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
              <span>הקודם</span>
              <span className="hidden truncate sm:inline">
                · {prevLesson.title}
              </span>
            </Link>
          ) : (
            <span
              className="inline-flex min-h-11 items-center gap-1 rounded-xl px-3 text-xs text-zinc-300 shadow-[0_0_0_1px_rgba(0,0,0,0.05)] dark:text-zinc-600 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.05)]"
              aria-disabled="true"
            >
              הקודם
            </span>
          )}

          {nextLesson ? (
            <Link
              href={`/courses/${courseId}/lessons/${nextLesson._id}`}
              className="inline-flex min-h-11 max-w-48 items-center gap-1.5 rounded-xl bg-zinc-900 px-3 text-xs font-semibold text-white shadow-sm transition-[transform,box-shadow,background-color] hover:bg-zinc-800 hover:shadow-md active:scale-[0.96] dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
              aria-label={`שיעור הבא: ${nextLesson.title}`}
            >
              <span>הבא</span>
              <span className="hidden truncate sm:inline">
                · {nextLesson.title}
              </span>
              <svg
                className="h-3.5 w-3.5 shrink-0"
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
            <Link
              href={`/courses/${courseId}`}
              className="inline-flex min-h-11 items-center rounded-xl bg-emerald-50 px-3 text-xs font-semibold text-emerald-800 shadow-[0_0_0_1px_rgba(16,185,129,0.2)] transition-[transform,background-color] hover:bg-emerald-100 active:scale-[0.96] dark:bg-emerald-950/30 dark:text-emerald-300"
            >
              חזרה לתוכנית הקורס
            </Link>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <span className="shrink-0 text-xs text-zinc-500 dark:text-zinc-400">
          מיקום במסלול
        </span>
        <div
          className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800"
          role="progressbar"
          aria-label={`מיקום במסלול: שיעור ${currentIndex + 1} מתוך ${totalLessons}`}
          aria-valuemin={1}
          aria-valuemax={Math.max(totalLessons, 1)}
          aria-valuenow={Math.min(currentIndex + 1, Math.max(totalLessons, 1))}
        >
          <div
            className="h-full w-full origin-right rounded-full bg-brand-500"
            style={{ transform: `scaleX(${positionPercent / 100})` }}
          />
        </div>
        <span className="tabular-nums shrink-0 text-xs font-medium text-zinc-600 dark:text-zinc-300">
          {positionPercent}%
        </span>
      </div>
    </nav>
  );
}
