"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import Link from "next/link";
import { api } from "@/../convex/_generated/api";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { motion } from "framer-motion";

// ==========================================
// Phase 49 - Activity Feed & Learning Timeline
// ==========================================

type ActivityType =
  | "lesson"
  | "xp"
  | "badge"
  | "certificate"
  | "simulator"
  | "chat";

const ACTIVITY_CONFIG: Record<
  ActivityType,
  { emoji: string; color: string; dotColor: string; label: string }
> = {
  lesson: {
    emoji: "\u{1F4D6}",
    color: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
    dotColor: "bg-blue-500",
    label: "שיעורים",
  },
  xp: {
    emoji: "\u{2B50}",
    color:
      "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
    dotColor: "bg-amber-500",
    label: "XP",
  },
  badge: {
    emoji: "\u{1F3C5}",
    color:
      "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
    dotColor: "bg-purple-500",
    label: "הישגים",
  },
  certificate: {
    emoji: "\u{1F4DC}",
    color:
      "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300",
    dotColor: "bg-green-500",
    label: "תעודות",
  },
  simulator: {
    emoji: "\u{1F3AD}",
    color:
      "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
    dotColor: "bg-rose-500",
    label: "סימולציות",
  },
  chat: {
    emoji: "\u{1F4AC}",
    color:
      "bg-cyan-50 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300",
    dotColor: "bg-cyan-500",
    label: "צ'אט",
  },
};

const ALL_TYPES: ActivityType[] = [
  "lesson",
  "xp",
  "badge",
  "certificate",
  "simulator",
  "chat",
];

function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);

  if (seconds < 60) return "עכשיו";
  if (minutes < 60) return `לפני ${minutes} דקות`;
  if (hours < 24) return `לפני ${hours} שעות`;
  if (days === 1) return "אתמול";
  if (days < 7) return `לפני ${days} ימים`;
  if (weeks < 4) return `לפני ${weeks} שבועות`;
  return `לפני ${months} חודשים`;
}

function getDateGroup(timestamp: number): string {
  const now = new Date();
  const date = new Date(timestamp);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart.getTime() - 86400000);
  const weekStart = new Date(todayStart.getTime() - 6 * 86400000);

  if (date >= todayStart) return "היום";
  if (date >= yesterdayStart) return "אתמול";
  if (date >= weekStart) return "השבוע";
  return "קודם";
}

type ActivityItem = {
  type: ActivityType;
  title: string;
  description: string;
  timestamp: number;
  icon: string;
  xp?: number;
};

export default function ActivityPage() {
  const [activeFilter, setActiveFilter] = useState<ActivityType | "all">("all");

  const activities = useQuery(api.activityFeed.getActivityFeed);

  const isLoading = activities === undefined;

  const filteredActivities =
    activeFilter === "all"
      ? activities ?? []
      : (activities ?? []).filter((a) => a.type === activeFilter);

  // Group activities by date
  const grouped = filteredActivities.reduce<Record<string, ActivityItem[]>>(
    (acc, activity) => {
      const group = getDateGroup(activity.timestamp);
      if (!acc[group]) acc[group] = [];
      acc[group].push(activity as ActivityItem);
      return acc;
    },
    {}
  );

  const groupOrder = ["היום", "אתמול", "השבוע", "קודם"];
  const orderedGroups = groupOrder.filter((g) => grouped[g]?.length);

  return (
    <div className="min-h-dvh bg-white dark:bg-zinc-950">
      <Header />

      <main className="container mx-auto px-4 py-8 sm:py-12">
        {/* Breadcrumb */}
        <nav
          className="mb-6 text-sm text-zinc-500 dark:text-zinc-400"
          aria-label="ניווט"
        >
          <Link
            href="/dashboard"
            className="hover:text-zinc-900 dark:hover:text-white"
          >
            דשבורד
          </Link>
          <span className="mx-2">/</span>
          <span className="text-zinc-900 dark:text-white">פעילות</span>
        </nav>

        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
            ציר הזמן שלי
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            כל הפעילות שלך במקום אחד - שיעורים, הישגים, סימולציות ועוד
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-8 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveFilter("all")}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              activeFilter === "all"
                ? "bg-brand-500 text-white"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            }`}
          >
            הכל
            {activities && (
              <span className="mr-1.5 text-xs opacity-80">
                ({activities.length})
              </span>
            )}
          </button>
          {ALL_TYPES.map((type) => {
            const config = ACTIVITY_CONFIG[type];
            const count = (activities ?? []).filter(
              (a) => a.type === type
            ).length;
            if (count === 0) return null;
            return (
              <button
                key={type}
                onClick={() => setActiveFilter(type)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  activeFilter === type
                    ? "bg-brand-500 text-white"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                }`}
              >
                {config.emoji} {config.label}
                <span className="mr-1.5 text-xs opacity-80">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-4">
                <div className="h-10 w-10 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-48 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
                  <div className="h-3 w-32 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredActivities.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 text-6xl">&#x1F331;</div>
            <h2 className="mb-2 text-xl font-semibold text-zinc-900 dark:text-white">
              {activeFilter === "all"
                ? "עוד אין פעילות"
                : `אין פעילות מסוג ${ACTIVITY_CONFIG[activeFilter].label}`}
            </h2>
            <p className="mb-6 max-w-md text-zinc-500 dark:text-zinc-400">
              {activeFilter === "all"
                ? "התחל ללמוד כדי לראות את ציר הזמן שלך מתמלא בהישגים!"
                : "התחל לפעול כדי לראות פעילות כאן."}
            </p>
            <Link
              href="/courses"
              className="rounded-lg bg-brand-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-600"
            >
              לקורסים
            </Link>
          </div>
        )}

        {/* Timeline */}
        {!isLoading && filteredActivities.length > 0 && (
          <div className="space-y-8">
            {orderedGroups.map((groupName) => (
              <div key={groupName}>
                {/* Date Group Header */}
                <div className="mb-4 flex items-center gap-3">
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                    {groupName}
                  </h2>
                  <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
                  <span className="text-sm text-zinc-400 dark:text-zinc-500">
                    {grouped[groupName].length} פעילויות
                  </span>
                </div>

                {/* Timeline Items */}
                <div className="relative mr-5">
                  {/* Vertical Timeline Line (right side for RTL) */}
                  <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-zinc-200 dark:bg-zinc-800" />

                  <div className="space-y-4">
                    {grouped[groupName].map((activity, index) => {
                      const config =
                        ACTIVITY_CONFIG[activity.type as ActivityType];
                      return (
                        <motion.div
                          key={`${activity.type}-${activity.timestamp}-${index}`}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            duration: 0.3,
                            delay: index * 0.05,
                          }}
                          className="relative flex items-start gap-4 pr-8"
                        >
                          {/* Timeline Dot */}
                          <div
                            className={`absolute right-[-7px] top-3 z-10 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-zinc-950 ${config.dotColor}`}
                          />

                          {/* Activity Card */}
                          <div className="flex-1 rounded-xl border border-zinc-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-3">
                                {/* Icon */}
                                <span
                                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-lg ${config.color}`}
                                >
                                  {config.emoji}
                                </span>

                                {/* Content */}
                                <div className="min-w-0">
                                  <h3 className="font-semibold text-zinc-900 dark:text-white">
                                    {activity.title}
                                  </h3>
                                  <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
                                    {activity.description}
                                  </p>
                                </div>
                              </div>

                              {/* Right side: time + XP */}
                              <div className="flex shrink-0 flex-col items-end gap-1">
                                <span className="text-xs text-zinc-400 dark:text-zinc-500">
                                  {formatRelativeTime(activity.timestamp)}
                                </span>
                                {activity.xp && (
                                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                                    +{activity.xp} XP
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
