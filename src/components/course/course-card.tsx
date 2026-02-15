"use client";

import Link from "next/link";

interface CourseCardProps {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  lessonCount?: number;
  totalDuration?: number;
  progressPercent?: number;
  enrolled?: boolean;
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
