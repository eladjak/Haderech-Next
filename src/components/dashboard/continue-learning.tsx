"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";

export function ContinueLearning() {
  const data = useQuery(api.studentAnalytics.getContinueLearning);

  if (data === undefined) {
    return (
      <div
        className="h-48 animate-pulse rounded-3xl bg-zinc-100 dark:bg-zinc-900"
        aria-label="טוען את הצעד הבא"
      />
    );
  }

  if (data === null) {
    return (
      <div className="rounded-3xl bg-emerald-50 p-6 shadow-[0_0_0_1px_rgba(16,185,129,0.16)] sm:p-8 dark:bg-emerald-950/20 dark:shadow-[0_0_0_1px_rgba(52,211,153,0.18)]">
        <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
          אין כרגע שיעור שממתין להשלמה
        </p>
        <h2 className="mt-2 text-balance text-2xl font-bold text-zinc-900 dark:text-white">
          אפשר לבחור במה לחזור ולתרגל
        </h2>
        <p className="mt-2 max-w-2xl text-pretty text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          חזרה לשיעור מוכר היא חלק מהלמידה. אפשר לעבור על תוכנית הקורס או
          לבחור תרגול קצר בלי לפתוח מסלול חדש.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/courses"
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white transition-[transform,background-color] hover:bg-emerald-800 active:scale-[0.96]"
          >
            לחזרה לתוכנית הקורס
          </Link>
          <Link
            href="/tools/conversation-starters"
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-zinc-800 shadow-[0_0_0_1px_rgba(0,0,0,0.08)] transition-[transform,box-shadow] hover:shadow-md active:scale-[0.96] dark:bg-zinc-900 dark:text-zinc-100 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.1)]"
          >
            לתרגול שיחה קצר
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl bg-gradient-to-l from-brand-50 to-white p-6 shadow-[0_0_0_1px_rgba(30,58,95,0.08),0_10px_35px_rgba(30,58,95,0.08)] sm:p-8 dark:from-blue-950/25 dark:to-zinc-900 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-md">
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
          <p className="text-sm font-semibold text-brand-700 dark:text-brand-300">
            הצעד הבא שלך · {data.courseName}
          </p>
          <h2 className="mt-1 text-balance text-xl font-bold text-zinc-900 dark:text-white">
            {data.lastLesson.title}
          </h2>
          <p className="mt-2 text-pretty text-sm text-zinc-600 dark:text-zinc-400">
            פותחים שיעור אחד, בוחרים ממנו תרגול אחד ושומרים נקודה קצרה לחזרה.
          </p>
          <div className="mt-4 flex items-center gap-3">
            <div
              className="h-2 flex-1 overflow-hidden rounded-full bg-brand-100/70 dark:bg-zinc-700"
              role="progressbar"
              aria-label={`התקדמות בקורס: ${data.progressPercent}%`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={data.progressPercent}
            >
              <div
                className="h-full w-full origin-right bg-gradient-to-l from-brand-500 to-accent-400 transition-transform duration-500"
                style={{ transform: `scaleX(${data.progressPercent / 100})` }}
              />
            </div>
            <span className="tabular-nums text-xs font-semibold text-brand-600 dark:text-brand-400">
              {data.progressPercent}%
            </span>
          </div>
        </div>

        <Link
          href={`/courses/${data.courseId}/learn?lesson=${data.lastLesson._id}`}
          className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-brand-500 to-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-md transition-[transform,filter,box-shadow] hover:brightness-110 hover:shadow-lg active:scale-[0.96]"
        >
          לשיעור הבא
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
            />
          </svg>
        </Link>
      </div>
    </div>
  );
}
