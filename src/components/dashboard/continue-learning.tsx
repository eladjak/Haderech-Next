"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";

export function ContinueLearning() {
  const data = useQuery(api.studentAnalytics.getContinueLearning);

  if (!data) return null;

  return (
    <div className="rounded-2xl border border-brand-100/30 bg-gradient-to-l from-brand-50/50 to-white p-6 dark:border-blue-100/10 dark:from-blue-50/10 dark:to-blue-50/5">
      <h3 className="mb-4 text-lg font-bold text-blue-500 dark:text-white">
        המשך ללמוד
      </h3>
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 text-white">
          <svg
            className="h-7 w-7"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
            />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-blue-500/60 dark:text-zinc-400">
            {data.courseName}
          </p>
          <p className="font-semibold text-blue-500 dark:text-white">
            {data.lastLesson.title}
          </p>
          <div className="mt-2 flex items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-brand-100/30 dark:bg-zinc-700">
              <div
                className="h-full rounded-full bg-gradient-to-l from-brand-500 to-accent-400 transition-all duration-500"
                style={{ width: `${data.progressPercent}%` }}
              />
            </div>
            <span className="text-xs font-medium text-brand-500">
              {data.progressPercent}%
            </span>
          </div>
        </div>
        <Link
          href={`/courses/${data.courseId}/lessons/${data.lastLesson._id}`}
          className="shrink-0 rounded-xl bg-gradient-to-l from-brand-500 to-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg hover:brightness-110"
        >
          המשך
        </Link>
      </div>
    </div>
  );
}
