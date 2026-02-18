"use client";

import Link from "next/link";

interface SectionProgress {
  courseId: string;
  courseTitle: string;
  completedLessons: number;
  totalLessons: number;
  completionPercent: number;
  hasCertificate: boolean;
}

interface CourseProgressTrackerProps {
  sections: SectionProgress[];
  className?: string;
}

/**
 * Renders an SVG progress ring (circle) for overall completion.
 */
function ProgressRing({
  percent,
  size = 120,
  strokeWidth = 10,
}: {
  percent: number;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-hidden="true"
    >
      {/* Track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-zinc-200 dark:text-zinc-700"
      />
      {/* Progress */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="text-emerald-500 transition-all duration-500"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  );
}

/**
 * A horizontal progress bar for per-section display.
 */
function SectionBar({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <div
      className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700"
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div
        className="h-2 rounded-full bg-emerald-500 transition-all duration-300"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

/**
 * CourseProgressTracker
 *
 * Shows overall course completion as a ring + per-section breakdown.
 * Accepts an array of SectionProgress objects (one per enrolled course).
 */
export function CourseProgressTracker({
  sections,
  className = "",
}: CourseProgressTrackerProps) {
  if (sections.length === 0) {
    return (
      <div
        className={`rounded-2xl bg-zinc-50 p-6 text-center dark:bg-zinc-900 ${className}`}
      >
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          הירשם לקורס כדי לראות את ההתקדמות שלך
        </p>
      </div>
    );
  }

  // Compute overall: total completed / total lessons across all courses
  const totalCompleted = sections.reduce(
    (sum, s) => sum + s.completedLessons,
    0
  );
  const totalLessons = sections.reduce((sum, s) => sum + s.totalLessons, 0);
  const overallPercent =
    totalLessons > 0 ? Math.round((totalCompleted / totalLessons) * 100) : 0;

  return (
    <div
      className={`rounded-2xl bg-zinc-50 p-6 dark:bg-zinc-900 ${className}`}
    >
      <h2 className="mb-5 text-xl font-semibold text-zinc-900 dark:text-white">
        התקדמות בלמידה
      </h2>

      {/* Overall ring + summary */}
      <div className="mb-6 flex items-center gap-6">
        <div className="relative shrink-0">
          <ProgressRing percent={overallPercent} size={100} strokeWidth={9} />
          <span className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold text-zinc-900 dark:text-white">
              {overallPercent}%
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              כולל
            </span>
          </span>
        </div>

        <div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            <span className="font-semibold text-zinc-900 dark:text-white">
              {totalCompleted}
            </span>{" "}
            מתוך{" "}
            <span className="font-semibold text-zinc-900 dark:text-white">
              {totalLessons}
            </span>{" "}
            שיעורים הושלמו
          </p>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            <span className="font-semibold text-zinc-900 dark:text-white">
              {sections.length}
            </span>{" "}
            קורסים פעילים
          </p>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              {sections.filter((s) => s.hasCertificate).length}
            </span>{" "}
            תעודות הושגו
          </p>
        </div>
      </div>

      {/* Per-section breakdown */}
      <div className="space-y-4">
        {sections.map((section) => (
          <div key={section.courseId}>
            <div className="mb-1 flex items-center justify-between gap-2">
              <Link
                href={`/courses/${section.courseId}`}
                className="truncate text-sm font-medium text-zinc-800 hover:text-emerald-600 dark:text-zinc-200 dark:hover:text-emerald-400"
              >
                {section.courseTitle}
              </Link>
              <div className="flex shrink-0 items-center gap-2">
                {section.hasCertificate && (
                  <svg
                    className="h-4 w-4 text-amber-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-label="תעודת סיום"
                  >
                    <path d="M10 1l2.39 4.87L18 6.82l-4 3.9.94 5.5L10 13.77l-4.94 2.45.94-5.5-4-3.9 5.61-.95L10 1z" />
                  </svg>
                )}
                <span className="min-w-[3rem] text-right text-xs text-zinc-500 dark:text-zinc-400">
                  {section.completedLessons}/{section.totalLessons}
                </span>
                <span className="min-w-[2.5rem] text-right text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  {section.completionPercent}%
                </span>
              </div>
            </div>
            <SectionBar
              value={section.completionPercent}
              label={`התקדמות בקורס ${section.courseTitle}: ${section.completionPercent}%`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
