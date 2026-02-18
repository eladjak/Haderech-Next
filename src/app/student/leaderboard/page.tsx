"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import Link from "next/link";
import { api } from "@/../convex/_generated/api";
import { Header } from "@/components/layout/header";

export default function LeaderboardPage() {
  const { user: clerkUser } = useUser();

  const convexUser = useQuery(
    api.users.getByClerkId,
    clerkUser?.id ? { clerkId: clerkUser.id } : "skip"
  );

  const leaderboard = useQuery(api.gamification.getLeaderboard);

  const myXP = useQuery(
    api.gamification.getUserXP,
    convexUser?._id ? { userId: convexUser._id } : "skip"
  );

  const isLoading = leaderboard === undefined;

  // Find current user's rank
  const myRank = leaderboard?.findIndex(
    (entry) => entry.userId === convexUser?._id
  );
  const myEntry =
    myRank !== undefined && myRank >= 0 ? leaderboard?.[myRank] : null;

  return (
    <div className="min-h-dvh bg-white dark:bg-zinc-950">
      <Header />

      <main className="container mx-auto px-4 py-12">
        {/* Page header */}
        <div className="mb-8">
          <nav
            className="mb-4 text-sm text-zinc-500 dark:text-zinc-400"
            aria-label="ניווט"
          >
            <Link
              href="/dashboard"
              className="hover:text-zinc-900 dark:hover:text-white"
            >
              דשבורד
            </Link>
            <span className="mx-2">/</span>
            <span className="text-zinc-900 dark:text-white">לוח מובילים</span>
          </nav>
          <h1 className="mb-2 text-3xl font-bold text-zinc-900 dark:text-white">
            לוח המובילים
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            הסטודנטים המובילים בפלטפורמה לפי נקודות ניסיון (XP)
          </p>
        </div>

        {/* My stats card */}
        {myXP && convexUser && (
          <div className="mb-8 rounded-2xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-200 text-xl font-bold text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200">
                {myRank !== undefined && myRank >= 0 ? `#${myRank + 1}` : "-"}
              </div>
              <div className="flex-1">
                <p className="text-lg font-semibold text-zinc-900 dark:text-white">
                  {convexUser.name ?? "אתה"}
                </p>
                <div className="flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400">
                  <span>
                    רמה {myXP.level}
                  </span>
                  <span>
                    {myXP.totalXP} XP
                  </span>
                  {myEntry && (
                    <span>
                      {myEntry.badgesEarned} תגים
                    </span>
                  )}
                </div>
              </div>
              <Link
                href="/student/profile"
                className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
              >
                הפרופיל שלי
              </Link>
            </div>

            {/* XP Progress bar */}
            <div className="mt-4">
              <div className="mb-1 flex justify-between text-xs text-zinc-500 dark:text-zinc-400">
                <span>
                  רמה {myXP.level}
                </span>
                <span>
                  רמה {myXP.level + 1}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-500 dark:bg-emerald-400"
                  style={{ width: `${myXP.progressPercent}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                {myXP.xpInCurrentLevel} / {myXP.xpNeededForNextLevel} XP
                לרמה הבאה
              </p>
            </div>
          </div>
        )}

        {/* Leaderboard table */}
        {isLoading ? (
          <LeaderboardSkeleton />
        ) : leaderboard && leaderboard.length > 0 ? (
          <div className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800">
            {/* Header row */}
            <div className="grid grid-cols-[3rem_1fr_5rem_4rem_4rem] items-center gap-2 border-b border-zinc-200 bg-zinc-100 px-4 py-3 text-xs font-medium text-zinc-500 sm:grid-cols-[3rem_1fr_6rem_5rem_5rem_5rem] dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
              <span>#</span>
              <span>סטודנט</span>
              <span className="text-center">XP</span>
              <span className="hidden text-center sm:block">רמה</span>
              <span className="text-center">שיעורים</span>
              <span className="text-center">תגים</span>
            </div>

            {/* Rows */}
            {leaderboard.map((entry, index) => {
              const isCurrentUser = entry.userId === convexUser?._id;
              return (
                <div
                  key={entry.userId}
                  className={`grid grid-cols-[3rem_1fr_5rem_4rem_4rem] items-center gap-2 border-b border-zinc-100 px-4 py-3 sm:grid-cols-[3rem_1fr_6rem_5rem_5rem_5rem] dark:border-zinc-800/50 ${
                    isCurrentUser
                      ? "bg-emerald-50 dark:bg-emerald-950/20"
                      : index % 2 === 0
                        ? "bg-white dark:bg-zinc-950"
                        : "bg-zinc-50/50 dark:bg-zinc-900/30"
                  }`}
                >
                  {/* Rank */}
                  <div className="flex items-center justify-center">
                    {index === 0 ? (
                      <RankMedal rank={1} />
                    ) : index === 1 ? (
                      <RankMedal rank={2} />
                    ) : index === 2 ? (
                      <RankMedal rank={3} />
                    ) : (
                      <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                        {index + 1}
                      </span>
                    )}
                  </div>

                  {/* Name */}
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-200 text-xs font-bold text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
                      {entry.imageUrl ? (
                        <img
                          src={entry.imageUrl}
                          alt=""
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        entry.name.charAt(0)
                      )}
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        isCurrentUser
                          ? "text-emerald-700 dark:text-emerald-400"
                          : "text-zinc-900 dark:text-white"
                      }`}
                    >
                      {entry.name}
                      {isCurrentUser && " (אני)"}
                    </span>
                  </div>

                  {/* XP */}
                  <span className="text-center text-sm font-bold text-zinc-900 dark:text-white">
                    {entry.totalXP.toLocaleString("he-IL")}
                  </span>

                  {/* Level */}
                  <span className="hidden text-center text-sm text-zinc-600 sm:block dark:text-zinc-400">
                    {entry.level}
                  </span>

                  {/* Lessons */}
                  <span className="text-center text-sm text-zinc-600 dark:text-zinc-400">
                    {entry.completedLessons}
                  </span>

                  {/* Badges */}
                  <span className="text-center text-sm text-zinc-600 dark:text-zinc-400">
                    {entry.badgesEarned}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl bg-zinc-50 p-12 text-center dark:bg-zinc-900">
            <svg
              className="mx-auto mb-3 h-10 w-10 text-zinc-300 dark:text-zinc-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a48.454 48.454 0 01-7.54 0"
              />
            </svg>
            <p className="text-lg font-medium text-zinc-700 dark:text-zinc-300">
              עדיין אין נתונים בלוח המובילים
            </p>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              התחל ללמוד כדי להופיע ברשימה!
            </p>
          </div>
        )}

        {/* XP Info */}
        <div className="mt-8 rounded-2xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">
            איך צוברים נקודות XP?
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <XPInfoCard action="השלמת שיעור" xp={10} />
            <XPInfoCard action="ניסיון בוחן" xp={5} />
            <XPInfoCard action="מעבר בוחן" xp={15} />
            <XPInfoCard action="ציון מושלם (100)" xp={25} />
            <XPInfoCard action="תעודת סיום" xp={50} />
            <XPInfoCard action="יום למידה פעיל" xp={3} />
          </div>
        </div>
      </main>
    </div>
  );
}

function RankMedal({ rank }: { rank: 1 | 2 | 3 }) {
  const colors = {
    1: "text-amber-500",
    2: "text-zinc-400",
    3: "text-amber-700",
  };

  return (
    <svg
      className={`h-6 w-6 ${colors[rank]}`}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-label={`מקום ${rank}`}
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

function XPInfoCard({ action, xp }: { action: string; xp: number }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-zinc-100 p-3 dark:bg-zinc-800">
      <span className="text-sm text-zinc-700 dark:text-zinc-300">{action}</span>
      <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
        +{xp} XP
      </span>
    </div>
  );
}

function LeaderboardSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <div
          key={i}
          className="h-14 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800"
        />
      ))}
    </div>
  );
}
