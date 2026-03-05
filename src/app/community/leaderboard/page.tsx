"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { api } from "@/../convex/_generated/api";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { useUser } from "@clerk/nextjs";

type Tab = "weekly" | "monthly" | "alltime";

interface LeaderboardEntry {
  userId: string;
  name: string;
  imageUrl?: string | null;
  xp: number;
  level: number;
  rank: number;
  badgeCount?: number;
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1)
    return (
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 text-sm font-black text-white shadow-md shadow-yellow-200 dark:shadow-yellow-900">
        🥇
      </div>
    );
  if (rank === 2)
    return (
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-zinc-300 to-zinc-400 text-sm font-black text-white shadow-md shadow-zinc-200 dark:shadow-zinc-700">
        🥈
      </div>
    );
  if (rank === 3)
    return (
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-amber-700 text-sm font-black text-white shadow-md shadow-amber-200 dark:shadow-amber-900">
        🥉
      </div>
    );
  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 text-sm font-bold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-300">
      {rank}
    </div>
  );
}

function LevelBadge({ level }: { level: number }) {
  const colors =
    level >= 10
      ? "from-purple-500 to-purple-700"
      : level >= 5
        ? "from-blue-500 to-blue-700"
        : "from-brand-500 to-brand-700";
  return (
    <span
      className={`inline-flex items-center rounded-full bg-gradient-to-l ${colors} px-2 py-0.5 text-xs font-bold text-white`}
    >
      Lv.{level}
    </span>
  );
}

function UserAvatar({
  name,
  imageUrl,
  rank,
}: {
  name: string;
  imageUrl?: string | null;
  rank: number;
}) {
  const ringColors =
    rank === 1
      ? "ring-yellow-400"
      : rank === 2
        ? "ring-zinc-400"
        : rank === 3
          ? "ring-amber-600"
          : "ring-transparent";

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name}
        className={`h-10 w-10 rounded-full object-cover ring-2 ${ringColors}`}
      />
    );
  }
  return (
    <div
      className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-sm font-bold text-white ring-2 ${ringColors}`}
    >
      {name.charAt(0)}
    </div>
  );
}

function LeaderboardRow({
  entry,
  isCurrentUser,
  xpLabel,
}: {
  entry: LeaderboardEntry;
  isCurrentUser: boolean;
  xpLabel: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: entry.rank * 0.04 }}
      className={`flex items-center gap-4 rounded-2xl p-4 transition-all ${
        isCurrentUser
          ? "border-2 border-brand-400 bg-brand-50 dark:border-brand-600 dark:bg-brand-950/30"
          : entry.rank <= 3
            ? "border border-amber-100 bg-gradient-to-l from-amber-50/60 to-white shadow-sm dark:border-amber-900/30 dark:from-amber-950/20 dark:to-zinc-900"
            : "border border-zinc-100 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
      }`}
    >
      <RankBadge rank={entry.rank} />

      <UserAvatar
        name={entry.name}
        imageUrl={entry.imageUrl}
        rank={entry.rank}
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate font-semibold text-zinc-900 dark:text-white">
            {entry.name}
          </span>
          {isCurrentUser && (
            <span className="shrink-0 rounded-full bg-brand-500 px-2 py-0.5 text-xs font-medium text-white">
              אתה
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <LevelBadge level={entry.level} />
          {entry.badgeCount !== undefined && (
            <span className="text-xs text-zinc-400 dark:text-zinc-500">
              {entry.badgeCount} תגים
            </span>
          )}
        </div>
      </div>

      <div className="text-right">
        <div className="text-lg font-black text-zinc-900 dark:text-white">
          {entry.xp.toLocaleString()}
        </div>
        <div className="text-xs text-zinc-400 dark:text-zinc-500">{xpLabel}</div>
      </div>
    </motion.div>
  );
}

function TopThreePodium({ entries }: { entries: LeaderboardEntry[] }) {
  const first = entries[0];
  const second = entries[1];
  const third = entries[2];

  if (!first) return null;

  return (
    <div className="mb-8 flex items-end justify-center gap-4">
      {/* 2nd place */}
      {second && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col items-center"
        >
          <UserAvatar
            name={second.name}
            imageUrl={second.imageUrl}
            rank={2}
          />
          <div className="mt-2 text-center">
            <div className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 max-w-20 truncate">
              {second.name}
            </div>
            <div className="text-sm font-black text-zinc-500">
              {second.xp.toLocaleString()} XP
            </div>
          </div>
          <div className="mt-2 flex h-16 w-20 items-center justify-center rounded-t-lg bg-gradient-to-t from-zinc-300 to-zinc-200 text-2xl font-black text-zinc-600 dark:from-zinc-600 dark:to-zinc-500 dark:text-zinc-200">
            🥈
          </div>
        </motion.div>
      )}

      {/* 1st place */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center"
      >
        <div className="mb-1 text-2xl">👑</div>
        <UserAvatar name={first.name} imageUrl={first.imageUrl} rank={1} />
        <div className="mt-2 text-center">
          <div className="text-sm font-bold text-zinc-900 dark:text-white max-w-24 truncate">
            {first.name}
          </div>
          <div className="text-base font-black text-yellow-600 dark:text-yellow-400">
            {first.xp.toLocaleString()} XP
          </div>
        </div>
        <div className="mt-2 flex h-24 w-24 items-center justify-center rounded-t-lg bg-gradient-to-t from-yellow-400 to-yellow-300 text-3xl font-black text-yellow-700 dark:from-yellow-600 dark:to-yellow-500 dark:text-yellow-200">
          🥇
        </div>
      </motion.div>

      {/* 3rd place */}
      {third && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col items-center"
        >
          <UserAvatar name={third.name} imageUrl={third.imageUrl} rank={3} />
          <div className="mt-2 text-center">
            <div className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 max-w-20 truncate">
              {third.name}
            </div>
            <div className="text-sm font-black text-amber-700 dark:text-amber-400">
              {third.xp.toLocaleString()} XP
            </div>
          </div>
          <div className="mt-2 flex h-12 w-20 items-center justify-center rounded-t-lg bg-gradient-to-t from-amber-600 to-amber-500 text-2xl font-black text-amber-200 dark:from-amber-700 dark:to-amber-600">
            🥉
          </div>
        </motion.div>
      )}
    </div>
  );
}

function MyRankCard({
  tab,
}: {
  tab: Tab;
}) {
  const myRank = useQuery(api.leaderboard.getUserRank);

  if (!myRank) return null;

  const rank =
    tab === "weekly"
      ? myRank.weekRank
      : tab === "monthly"
        ? myRank.monthRank
        : myRank.allTimeRank;

  const xp =
    tab === "weekly"
      ? myRank.weekXp
      : tab === "monthly"
        ? myRank.monthXp
        : myRank.totalXp;

  const total =
    tab === "weekly"
      ? myRank.weekTotal
      : tab === "monthly"
        ? myRank.monthTotal
        : myRank.allTimeTotal;

  const xpForNextLevel = 100;
  const xpInLevel = myRank.totalXp % 100;

  return (
    <div className="rounded-2xl border border-brand-200 bg-brand-50 p-5 dark:border-brand-800 dark:bg-brand-950/20">
      <h3 className="mb-4 text-sm font-semibold text-brand-800 dark:text-brand-300">
        הדירוג שלי
      </h3>

      <div className="space-y-4">
        {/* Rank display */}
        <div className="flex items-center justify-between">
          <div className="text-center">
            <div className="text-3xl font-black text-zinc-900 dark:text-white">
              {rank ? `#${rank}` : "-"}
            </div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">
              מתוך {total || "-"}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-black text-brand-600 dark:text-brand-400">
              {xp.toLocaleString()}
            </div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">XP</div>
          </div>
          <div className="text-center">
            <LevelBadge level={myRank.level} />
            <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              רמה
            </div>
          </div>
        </div>

        {/* XP Progress bar */}
        <div>
          <div className="mb-1 flex justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span>התקדמות לרמה הבאה</span>
            <span>
              {xpInLevel}/{xpForNextLevel} XP
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${Math.min(100, (xpInLevel / xpForNextLevel) * 100)}%`,
              }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-l from-brand-500 to-brand-400"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>("weekly");
  const { user } = useUser();

  const weeklyData = useQuery(api.leaderboard.getWeeklyLeaderboard);
  const monthlyData = useQuery(api.leaderboard.getMonthlyLeaderboard);
  const allTimeData = useQuery(api.leaderboard.getAllTimeLeaderboard);

  const tabs: { key: Tab; label: string }[] = [
    { key: "weekly", label: "שבועי" },
    { key: "monthly", label: "חודשי" },
    { key: "alltime", label: "כל הזמנים" },
  ];

  const currentData =
    activeTab === "weekly"
      ? weeklyData
      : activeTab === "monthly"
        ? monthlyData
        : allTimeData;

  const xpLabel =
    activeTab === "weekly"
      ? "XP השבוע"
      : activeTab === "monthly"
        ? "XP החודש"
        : "סה\"כ XP";

  return (
    <div className="min-h-dvh bg-zinc-50 dark:bg-zinc-950" dir="rtl">
      <Header />

      <main className="container mx-auto max-w-4xl px-4 py-10">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500 shadow-lg shadow-yellow-200/50 dark:shadow-yellow-900/30">
            <span className="text-3xl">🏆</span>
          </div>
          <h1 className="mb-2 text-3xl font-black text-zinc-900 dark:text-white">
            לוח הדירוגים
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            ראה איפה אתה עומד ביחס לשאר הלומדים
          </p>
        </motion.div>

        {/* Community nav */}
        <div className="mb-6 flex flex-wrap gap-2">
          <Link
            href="/community"
            className="rounded-full px-4 py-2 text-sm font-medium text-zinc-600 shadow-sm bg-white hover:bg-brand-50 hover:text-brand-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            קהילה
          </Link>
          <Link
            href="/community/challenges"
            className="rounded-full px-4 py-2 text-sm font-medium text-zinc-600 shadow-sm bg-white hover:bg-brand-50 hover:text-brand-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            אתגרים שבועיים
          </Link>
          <span className="rounded-full bg-brand-500 px-4 py-2 text-sm font-medium text-white shadow-sm">
            לוח דירוגים
          </span>
          <Link
            href="/community/rewards"
            className="rounded-full px-4 py-2 text-sm font-medium text-zinc-600 shadow-sm bg-white hover:bg-brand-50 hover:text-brand-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            חנות פרסים
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main leaderboard */}
          <div className="lg:col-span-2">
            {/* Tab switcher */}
            <div className="mb-6 flex gap-1 rounded-2xl bg-white p-1 shadow-sm dark:bg-zinc-900">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all ${
                    activeTab === tab.key
                      ? "bg-gradient-to-l from-brand-500 to-brand-600 text-white shadow-sm"
                      : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {currentData === undefined ? (
              <div className="space-y-3">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="h-20 animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800"
                  />
                ))}
              </div>
            ) : currentData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="mb-4 text-5xl">🏆</div>
                <h3 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-white">
                  עוד אין מתמודדים
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  היה הראשון לצבור XP ולעלות לדירוג!
                </p>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-3"
                >
                  {/* Top 3 podium */}
                  {currentData.length >= 2 && (
                    <TopThreePodium entries={currentData.slice(0, 3)} />
                  )}

                  {/* Full list */}
                  {currentData.map((entry) => (
                    <LeaderboardRow
                      key={String(entry.userId)}
                      entry={entry as LeaderboardEntry}
                      isCurrentUser={false}
                      xpLabel={xpLabel}
                    />
                  ))}
                </motion.div>
              </AnimatePresence>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {user && <MyRankCard tab={activeTab} />}

            {/* Tips card */}
            <div className="rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <h3 className="mb-3 font-semibold text-zinc-900 dark:text-white">
                💡 כיצד להרוויח XP
              </h3>
              <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                <li className="flex items-center gap-2">
                  <span className="shrink-0 font-bold text-brand-600">+10</span>
                  <span>השלמת שיעור</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="shrink-0 font-bold text-brand-600">+15</span>
                  <span>עברת חידון</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="shrink-0 font-bold text-brand-600">+25</span>
                  <span>ציון 100 בחידון</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="shrink-0 font-bold text-brand-600">+50</span>
                  <span>קיבלת תעודת סיום</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="shrink-0 font-bold text-brand-600">+3</span>
                  <span>כל יום פעיל</span>
                </li>
              </ul>
              <div className="mt-4">
                <Link
                  href="/community/challenges"
                  className="block rounded-xl bg-brand-50 px-4 py-2.5 text-center text-sm font-medium text-brand-700 transition-colors hover:bg-brand-100 dark:bg-brand-950/30 dark:text-brand-400 dark:hover:bg-brand-950/50"
                >
                  אתגרים שבועיים ←
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
