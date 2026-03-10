"use client";

import Link from "next/link";
import Image from "next/image";

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
      aria-label={`קורס: ${title}`}
      className="card-hover group flex flex-col overflow-hidden rounded-2xl border border-brand-100/20 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
    >
      {/* Image */}
      {imageUrl ? (
        <div className="relative aspect-video overflow-hidden bg-zinc-100 dark:bg-zinc-800">
          <Image
            src={imageUrl}
            alt={title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-200 group-hover:scale-105"
          />
          {/* Overlay gradient for better text legibility of badges */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
        </div>
      ) : (
        <div className="relative flex aspect-video items-center justify-center bg-gradient-to-br from-brand-100 via-brand-50 to-blue-50 dark:from-blue-500/40 dark:via-brand-700/30 dark:to-brand-700/40">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/90 shadow-md ring-1 ring-brand-100/50 dark:bg-zinc-800/80 dark:ring-zinc-700">
            <svg
              className="h-7 w-7 text-brand-500 dark:text-brand-400"
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
        </div>
      )}

      <div className="flex flex-1 flex-col p-5">
        {/* Tags */}
        {(category || level) && (
          <div className="mb-2.5 flex flex-wrap gap-1.5">
            {category && (
              <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-600 dark:bg-blue-500/30 dark:text-brand-400">
                {category}
              </span>
            )}
            {level && (
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${LEVEL_COLORS[level] ?? "bg-zinc-100 text-zinc-600"}`}
              >
                {LEVEL_LABELS[level] ?? level}
              </span>
            )}
          </div>
        )}

        {/* Title */}
        <h3 className="mb-2 text-lg font-semibold text-zinc-900 transition-colors group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-400">
          {title}
        </h3>

        {/* Description */}
        <p className="mb-3 line-clamp-2 flex-1 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
          {description}
        </p>

        {/* Meta row */}
        <div className="flex items-center gap-3 text-xs text-zinc-400 dark:text-zinc-500">
          {lessonCount !== undefined && (
            <span className="flex items-center gap-1">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
              {lessonCount} שיעורים
            </span>
          )}
          {totalDuration !== undefined && totalDuration > 0 && (
            <span className="flex items-center gap-1">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {formatDuration(totalDuration)}
            </span>
          )}
          {estimatedHours !== undefined && estimatedHours > 0 && (
            <span className="flex items-center gap-1">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
              </svg>
              {estimatedHours} שעות
            </span>
          )}
          {enrolled && (
            <span className="mr-auto flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              רשום
            </span>
          )}
        </div>

        {/* Progress bar */}
        {progressPercent !== undefined && progressPercent > 0 && (
          <div className="mt-4 pt-3 border-t border-brand-100/20 dark:border-zinc-800">
            <div className="mb-1.5 flex justify-between text-xs">
              <span className="text-zinc-400 dark:text-zinc-500">התקדמות</span>
              <span className="font-semibold text-brand-600 dark:text-brand-400">{progressPercent}%</span>
            </div>
            <div
              className="h-2 w-full overflow-hidden rounded-full bg-brand-100/50 dark:bg-blue-500/20"
              role="progressbar"
              aria-valuenow={progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`התקדמות בקורס: ${progressPercent}%`}
            >
              <div
                className="h-2 rounded-full bg-gradient-to-l from-brand-500 via-brand-400 to-accent-400 shadow-sm shadow-brand-500/20 transition-all duration-300"
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
