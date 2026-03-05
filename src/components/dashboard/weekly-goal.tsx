"use client";

import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";

export function WeeklyGoal() {
  const data = useQuery(api.studentAnalytics.getWeeklyGoal);

  if (!data) return null;

  const { weeklyGoalHours, weeklyHoursLearned, goalPercent, activeDaysThisWeek, currentStreak } = data;

  // SVG circle progress
  const size = 140;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (goalPercent / 100) * circumference;

  const encouragingMessage = getEncouragingMessage(goalPercent, currentStreak);

  return (
    <div className="rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">
        יעד שבועי
      </h3>

      <div className="flex items-center gap-6">
        {/* Circular progress */}
        <div className="relative flex shrink-0 items-center justify-center">
          <svg
            width={size}
            height={size}
            className="-rotate-90"
            aria-label={`${goalPercent}% מהיעד השבועי הושלם`}
          >
            {/* Background circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="currentColor"
              className="text-zinc-100 dark:text-zinc-800"
              strokeWidth={strokeWidth}
            />
            {/* Progress circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="url(#weeklyGradient)"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-all duration-700"
            />
            <defs>
              <linearGradient id="weeklyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="var(--color-brand-400, #60a5fa)" />
                <stop offset="100%" stopColor="var(--color-brand-600, #2563eb)" />
              </linearGradient>
            </defs>
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-zinc-900 dark:text-white">
              {goalPercent}%
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              מהיעד
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex-1 space-y-3">
          <div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">שעות למידה השבוע</p>
            <p className="text-lg font-semibold text-zinc-900 dark:text-white">
              {weeklyHoursLearned}
              <span className="text-sm font-normal text-zinc-400 dark:text-zinc-500">
                {" "}/ {weeklyGoalHours} שעות
              </span>
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <svg className="h-4 w-4 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.047 8.287 8.287 0 009 9.601a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
              </svg>
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {currentStreak} ימים רצופים
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {activeDaysThisWeek} ימים פעילים
              </span>
            </div>
          </div>

          <p className="text-sm text-brand-600 dark:text-brand-400">
            {encouragingMessage}
          </p>
        </div>
      </div>
    </div>
  );
}

function getEncouragingMessage(goalPercent: number, streak: number): string {
  if (goalPercent >= 100) return "מדהים! השגת את היעד השבועי!";
  if (goalPercent >= 75) return "כמעט שם! עוד קצת מאמץ!";
  if (goalPercent >= 50) return "בדרך הנכונה, המשך כך!";
  if (streak >= 7) return "שבוע שלם של למידה, וואו!";
  if (streak >= 3) return "רצף נהדר, אל תפסיק!";
  if (goalPercent > 0) return "התחלת טוב, המשך ללמוד!";
  return "בוא נתחיל את השבוע בלמידה!";
}
