"use client";

import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";

export function LearningStats() {
  const overview = useQuery(api.studentAnalytics.getStudentOverview);

  if (!overview) return null;

  const stats = [
    {
      label: "קורסים רשומים",
      value: overview.enrollments,
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
        </svg>
      ),
      color: "brand" as const,
    },
    {
      label: "שיעורים הושלמו",
      value: overview.completedLessons,
      suffix: `/${overview.totalLessons}`,
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "emerald" as const,
    },
    {
      label: "זמן צפייה",
      value: formatWatchTime(overview.totalWatchTime),
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "blue" as const,
    },
    {
      label: "רצף למידה",
      value: `${overview.level}`,
      sublabel: `${overview.totalXp} XP`,
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.047 8.287 8.287 0 009 9.601a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
        </svg>
      ),
      color: "amber" as const,
    },
  ];

  const colorMap = {
    brand: {
      border: "border-brand-200/50 dark:border-brand-800/30",
      bg: "bg-gradient-to-br from-brand-50 to-brand-100/50 dark:from-brand-950/50 dark:to-brand-900/30",
      iconBg: "bg-brand-500/10 text-brand-600 dark:bg-brand-400/10 dark:text-brand-400",
    },
    emerald: {
      border: "border-emerald-200/50 dark:border-emerald-800/30",
      bg: "bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/50 dark:to-emerald-900/30",
      iconBg: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400",
    },
    blue: {
      border: "border-blue-200/50 dark:border-blue-800/30",
      bg: "bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/50 dark:to-blue-900/30",
      iconBg: "bg-blue-500/10 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400",
    },
    amber: {
      border: "border-amber-200/50 dark:border-amber-800/30",
      bg: "bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/50 dark:to-amber-900/30",
      iconBg: "bg-amber-500/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400",
    },
  };

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {stats.map((stat) => {
        const colors = colorMap[stat.color];
        return (
          <div
            key={stat.label}
            className={`rounded-2xl border ${colors.border} ${colors.bg} p-4`}
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                {stat.label}
              </span>
              <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${colors.iconBg}`}>
                {stat.icon}
              </span>
            </div>
            <p className="text-2xl font-bold text-zinc-900 dark:text-white">
              {stat.value}
              {stat.suffix && (
                <span className="text-sm font-normal text-zinc-400 dark:text-zinc-500">
                  {stat.suffix}
                </span>
              )}
            </p>
            {stat.sublabel && (
              <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                {stat.sublabel}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

function formatWatchTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")} שעות`;
  }
  return `${minutes} דקות`;
}
