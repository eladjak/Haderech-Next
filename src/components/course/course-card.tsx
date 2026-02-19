"use client";

import Link from "next/link";

const LEVEL_LABELS: Record<string, string> = {
  beginner: "מתחילים",
  intermediate: "מתקדמים",
  advanced: "מומחים",
};

const LEVEL_COLORS: Record<string, string> = {
  beginner:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  intermediate:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  advanced:
    "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
};

interface CourseCardProps {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  lessonCount?: number;
  totalDuration?: number;
  progressPercent?: number;
  enrolled?: boolean;
  category?: string;
  level?: string;
  estimatedHours?: number;
}

export function CourseCard({
  id,
  title,
  description,
  imageUrl,
  lessonCount,
  totalDuration,
  progressPercent,
  enrolled,
  category,
  level,
  estimatedHours,
}: CourseCardProps) {
  return (
    <Link
      href={`/courses/${id}`}
      className="group flex flex-col overflow-hidden rounded-2xl bg-zinc-50 transition-colors hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800"
    >
      {/* Image */}
      {imageUrl ? (
        <div className="aspect-video overflow-hidden bg-zinc-200 dark:bg-zinc-800">
          <img
            src={imageUrl}
            alt={title}
            className="h-full w-full object-cover"
          />
        </div>
      ) : (
        <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-700 dark:to-zinc-800">
          <svg
            className="h-10 w-10 text-zinc-400 dark:text-zinc-500"
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
        </div>
      )}

      <div className="flex flex-1 flex-col p-5">
        {/* Tags */}
        {(category || level) && (
          <div className="mb-2 flex flex-wrap gap-1.5">
            {category && (
              <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
                {category}
              </span>
            )}
            {level && (
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${LEVEL_COLORS[level] ?? "bg-zinc-200 text-zinc-600"}`}
              >
                {LEVEL_LABELS[level] ?? level}
              </span>
            )}
          </div>
        )}

        {/* Title */}
        <h3 className="mb-2 text-lg font-semibold text-zinc-900 group-hover:text-zinc-700 dark:text-white dark:group-hover:text-zinc-200">
          {title}
        </h3>

        {/* Description */}
        <p className="mb-3 line-clamp-2 flex-1 text-sm text-zinc-600 dark:text-zinc-400">
          {description}
        </p>

        {/* Meta row */}
        <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
          {lessonCount !== undefined && (
            <span className="flex items-center gap-1">
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
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
              {lessonCount} שיעורים
            </span>
          )}
          {totalDuration !== undefined && totalDuration > 0 && (
            <span className="flex items-center gap-1">
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
                  d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {formatDuration(totalDuration)}
            </span>
          )}
          {estimatedHours !== undefined && estimatedHours > 0 && (
            <span className="flex items-center gap-1">
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
                  d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342"
                />
              </svg>
              {estimatedHours} שעות
            </span>
          )}
          {enrolled && (
            <span className="mr-auto flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
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
                  d="M4.5 12.75l6 6 9-13.5"
                />
              </svg>
              רשום
            </span>
          )}
        </div>

        {/* Progress bar */}
        {progressPercent !== undefined && progressPercent > 0 && (
          <div className="mt-3">
            <div className="mb-1 flex justify-between text-xs text-zinc-500 dark:text-zinc-400">
              <span>התקדמות</span>
              <span>{progressPercent}%</span>
            </div>
            <div
              className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700"
              role="progressbar"
              aria-valuenow={progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-1.5 rounded-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}

function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours === 0) return `${minutes} דק'`;
  if (minutes === 0) return `${hours} שע'`;
  return `${hours}:${String(minutes).padStart(2, "0")} שע'`;
}
