"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import Link from "next/link";
import { api } from "@/../convex/_generated/api";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export default function BadgesPage() {
  const { user: clerkUser } = useUser();

  const convexUser = useQuery(
    api.users.getByClerkId,
    clerkUser?.id ? { clerkId: clerkUser.id } : "skip"
  );

  const badgesData = useQuery(
    api.gamification.getUserEarnedBadges,
    convexUser?._id ? { userId: convexUser._id } : "skip"
  );

  const stats = useQuery(
    api.gamification.getUserStats,
    convexUser?._id ? { userId: convexUser._id } : "skip"
  );

  const isLoading = badgesData === undefined || stats === undefined;

  const earnedBadges = badgesData?.badges.filter((b) => b.earned) ?? [];
  const unearnedBadges = badgesData?.badges.filter((b) => !b.earned) ?? [];

  return (
    <div className="min-h-dvh bg-white dark:bg-zinc-950">
      <Header />

      <main className="container mx-auto px-4 py-12">
        {/* Breadcrumb */}
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
          <span className="text-zinc-900 dark:text-white">הישגים</span>
        </nav>

        {/* Page header */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-zinc-900 dark:text-white">
            ההישגים שלי
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            צבור נקודות ניסיון, השלם אתגרים וגלה את כל התגים
          </p>
        </div>

        {/* Stats summary */}
        {stats && (
          <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard
              label="רמה"
              value={stats.level.toString()}
              icon={"\uD83C\uDF1F"}
            />
            <StatCard
              label="נקודות XP"
              value={stats.totalXP.toLocaleString("he-IL")}
              icon={"\u2B50"}
            />
            <StatCard
              label="ימים ברצף"
              value={stats.currentStreak.toString()}
              icon={"\uD83D\uDD25"}
            />
            <StatCard
              label="תגים"
              value={`${badgesData?.earnedCount ?? 0} / ${badgesData?.totalCount ?? 0}`}
              icon={"\uD83C\uDFC5"}
            />
          </div>
        )}

        {isLoading ? (
          <BadgesSkeleton />
        ) : (
          <>
            {/* Earned badges */}
            {earnedBadges.length > 0 && (
              <section className="mb-10">
                <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-white">
                  תגים שהושגו ({earnedBadges.length})
                </h2>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {earnedBadges.map((badge) => (
                    <BadgeCard key={badge._id} badge={badge} earned />
                  ))}
                </div>
              </section>
            )}

            {/* Unearned badges */}
            {unearnedBadges.length > 0 && (
              <section>
                <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-white">
                  תגים לגילוי ({unearnedBadges.length})
                </h2>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {unearnedBadges.map((badge) => (
                    <BadgeCard key={badge._id} badge={badge} earned={false} />
                  ))}
                </div>
              </section>
            )}

            {/* Empty state when no badges defined */}
            {badgesData?.totalCount === 0 && (
              <div className="rounded-2xl bg-zinc-50 p-12 text-center dark:bg-zinc-900">
                <span className="mb-3 block text-4xl" aria-hidden="true">
                  {"\uD83C\uDFC5"}
                </span>
                <p className="text-lg font-medium text-zinc-700 dark:text-zinc-300">
                  עוד לא הוגדרו תגים במערכת
                </p>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  מנהל המערכת צריך להפעיל את seedBadges כדי ליצור תגים
                </p>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}) {
  return (
    <div className="rounded-2xl border border-brand-100/40 bg-gradient-to-br from-white to-brand-50/20 p-4 text-center shadow-sm dark:border-zinc-800 dark:from-zinc-900 dark:to-zinc-900/80">
      <span className="mb-1 block text-2xl" aria-hidden="true">
        {icon}
      </span>
      <p className="text-2xl font-bold text-zinc-900 dark:text-white">
        {value}
      </p>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">{label}</p>
    </div>
  );
}

function BadgeCard({
  badge,
  earned,
}: {
  badge: {
    _id: string;
    slug: string;
    title: string;
    description: string;
    icon: string;
    category: string;
    condition: string;
    earned: boolean;
    earnedAt?: number;
  };
  earned: boolean;
}) {
  const categoryLabels: Record<string, string> = {
    learning: "למידה",
    social: "חברתי",
    streak: "רצף",
    achievement: "הישג",
  };

  return (
    <div
      className={`rounded-2xl border p-5 transition-all ${
        earned
          ? "border-brand-200/60 bg-gradient-to-br from-white to-brand-50/30 shadow-sm dark:border-zinc-700 dark:from-zinc-900 dark:to-zinc-800/50"
          : "border-zinc-200/60 bg-zinc-50/50 opacity-50 grayscale dark:border-zinc-800 dark:bg-zinc-900/30"
      }`}
    >
      <div className="mb-3 flex items-start justify-between">
        <span
          className={`text-3xl ${earned ? "" : "grayscale"}`}
          aria-hidden="true"
        >
          {badge.icon}
        </span>
        {earned && (
          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
            הושג
          </span>
        )}
      </div>
      <h3 className="mb-1 text-sm font-semibold text-zinc-900 dark:text-white">
        {badge.title}
      </h3>
      <p className="mb-2 text-xs text-zinc-500 dark:text-zinc-400">
        {badge.description}
      </p>
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
          {categoryLabels[badge.category] ?? badge.category}
        </span>
        {earned && badge.earnedAt && (
          <span className="text-xs text-zinc-400 dark:text-zinc-500">
            {new Intl.DateTimeFormat("he-IL").format(new Date(badge.earnedAt))}
          </span>
        )}
      </div>
    </div>
  );
}

function BadgesSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <div
          key={i}
          className="h-40 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-800"
        />
      ))}
    </div>
  );
}
