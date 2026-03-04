"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";

export function XpProfile() {
  const { user: clerkUser } = useUser();

  const convexUser = useQuery(
    api.users.getByClerkId,
    clerkUser?.id ? { clerkId: clerkUser.id } : "skip"
  );

  const stats = useQuery(
    api.gamification.getUserStats,
    convexUser?._id ? { userId: convexUser._id } : "skip"
  );

  const xpHistory = useQuery(
    api.gamification.getUserXpHistory,
    convexUser?._id ? { userId: convexUser._id } : "skip"
  );

  if (!stats) {
    return <XpProfileSkeleton />;
  }

  const recentEvents = xpHistory?.slice(0, 5) ?? [];

  return (
    <div className="rounded-2xl border border-brand-100/40 bg-gradient-to-br from-white to-brand-50/30 p-6 shadow-sm dark:border-zinc-800 dark:from-zinc-900 dark:to-zinc-900/80">
      {/* Header: Level + XP */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-600 text-lg font-bold text-white shadow-md">
            {stats.level}
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              רמה
            </p>
            <p className="text-xl font-bold text-zinc-900 dark:text-white">
              {stats.totalXP.toLocaleString("he-IL")} XP
            </p>
          </div>
        </div>

        {/* Streak + Badges */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1">
              <span
                className={`text-lg ${stats.currentStreak > 0 ? "text-orange-500" : "text-zinc-400"}`}
                aria-hidden="true"
              >
                {"\uD83D\uDD25"}
              </span>
              <span className="text-lg font-bold text-zinc-900 dark:text-white">
                {stats.currentStreak}
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">ימים ברצף</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1">
              <span className="text-lg" aria-hidden="true">
                {"\uD83C\uDFC5"}
              </span>
              <span className="text-lg font-bold text-zinc-900 dark:text-white">
                {stats.badgeCount}
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">הישגים</p>
          </div>
        </div>
      </div>

      {/* Progress bar to next level */}
      <div className="mb-5">
        <div className="mb-1 flex justify-between text-xs text-zinc-500 dark:text-zinc-400">
          <span>רמה {stats.level}</span>
          <span>רמה {stats.level + 1}</span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
          <div
            className="h-full rounded-full bg-gradient-to-l from-brand-500 to-accent-400 transition-all duration-500"
            style={{ width: `${stats.progressPercent}%` }}
          />
        </div>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          {stats.xpInCurrentLevel} / {stats.xpNeededForNextLevel} XP לרמה הבאה
        </p>
      </div>

      {/* Recent XP Events */}
      {recentEvents.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            פעילות אחרונה
          </h3>
          <div className="space-y-1.5">
            {recentEvents.map((event) => (
              <div
                key={event._id}
                className="flex items-center justify-between rounded-lg bg-white/60 px-3 py-2 dark:bg-zinc-800/50"
              >
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  {event.description}
                </span>
                <span className="rounded-full bg-brand-100/60 px-2 py-0.5 text-xs font-bold text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
                  +{event.points} XP
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function XpProfileSkeleton() {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-4 flex items-center gap-3">
        <div className="h-12 w-12 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-700" />
        <div className="space-y-2">
          <div className="h-3 w-12 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
          <div className="h-5 w-24 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
        </div>
      </div>
      <div className="h-2.5 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-700" />
      <div className="mt-4 space-y-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-9 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-700"
          />
        ))}
      </div>
    </div>
  );
}
