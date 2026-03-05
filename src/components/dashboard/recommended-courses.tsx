"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";

export function RecommendedCourses() {
  const courses = useQuery(api.studentAnalytics.getRecommendedCourses);

  if (!courses || courses.length === 0) return null;

  const levelLabels: Record<string, string> = {
    beginner: "מתחילים",
    intermediate: "בינוני",
    advanced: "מתקדם",
  };

  return (
    <div className="rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
          קורסים מומלצים
        </h3>
        <Link
          href="/courses"
          className="text-sm font-medium text-brand-600 transition-colors hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
        >
          כל הקורסים
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <div
            key={course._id}
            className="group rounded-xl border border-zinc-200/70 bg-zinc-50/50 p-4 transition-all hover:border-brand-200 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-800/50 dark:hover:border-brand-800/50"
          >
            {/* Course icon/image placeholder */}
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-100 to-brand-200 text-brand-600 dark:from-brand-900/50 dark:to-brand-800/50 dark:text-brand-400">
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                />
              </svg>
            </div>

            <h4 className="mb-1 font-semibold text-zinc-900 dark:text-white">
              {course.title}
            </h4>
            <p className="mb-3 line-clamp-2 text-sm text-zinc-500 dark:text-zinc-400">
              {course.description}
            </p>

            {/* Meta info */}
            <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
              <span className="flex items-center gap-1">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
                {course.lessonCount} שיעורים
              </span>
              {course.level && (
                <span className="rounded-full bg-brand-100/50 px-2 py-0.5 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
                  {levelLabels[course.level] ?? course.level}
                </span>
              )}
              {course.estimatedHours && (
                <span className="flex items-center gap-1">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {course.estimatedHours} שעות
                </span>
              )}
            </div>

            <Link
              href={`/courses/${course._id}`}
              className="inline-flex w-full items-center justify-center rounded-lg bg-gradient-to-l from-brand-500 to-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md hover:brightness-110"
            >
              צפה בקורס
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
