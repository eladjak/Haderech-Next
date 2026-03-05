"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { api } from "@/../convex/_generated/api";

// ─── Daily Widget (compact, for dashboard) ────────────────────────────────────

export function DailyWidget() {
  const { isSignedIn } = useUser();
  const todayContent = useQuery(api.dailyContent.getTodayContent);
  const challengeStatus = useQuery(
    api.dailyContent.getTodayChallengeStatus,
    isSignedIn ? {} : "skip"
  );
  const streakData = useQuery(
    api.dailyContent.getChallengeStreak,
    isSignedIn ? {} : "skip"
  );
  const seedContent = useMutation(api.dailyContent.seedDailyContent);

  const [seeding, setSeeding] = useState(false);

  // Loading state
  if (todayContent === undefined) {
    return (
      <div className="animate-pulse rounded-2xl border border-zinc-100 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-3 h-3 w-24 rounded bg-zinc-200 dark:bg-zinc-700" />
        <div className="mb-2 h-4 w-full rounded bg-zinc-200 dark:bg-zinc-700" />
        <div className="h-4 w-4/5 rounded bg-zinc-200 dark:bg-zinc-700" />
      </div>
    );
  }

  // No content - offer to seed
  if (todayContent === null) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-700 dark:bg-zinc-900">
        <p className="mb-1 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          תוכן יומי
        </p>
        <p className="mb-3 text-xs text-zinc-500 dark:text-zinc-400">
          טרם נוספו פריטי תוכן יומי. לחץ לאתחול.
        </p>
        <button
          type="button"
          disabled={seeding}
          onClick={async () => {
            setSeeding(true);
            try {
              await seedContent({});
            } finally {
              setSeeding(false);
            }
          }}
          className="inline-flex h-8 items-center rounded-lg bg-brand-600 px-3 text-xs font-medium text-white transition-colors hover:bg-brand-700 disabled:opacity-50"
        >
          {seeding ? "מאתחל..." : "אתחל תוכן יומי"}
        </button>
      </div>
    );
  }

  const isChallengeCompleted = !!challengeStatus?.completed;
  const currentStreak = streakData?.currentStreak ?? 0;

  return (
    <div className="overflow-hidden rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50 to-yellow-50/40 dark:border-amber-800/40 dark:from-amber-950/30 dark:to-yellow-950/10">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-amber-100 px-4 py-3 dark:border-amber-800/30">
        <div className="flex items-center gap-2">
          <span className="text-base" aria-hidden="true">☀️</span>
          <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
            תוכן יומי
          </span>
        </div>
        <div className="flex items-center gap-3">
          {isSignedIn && currentStreak > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-sm" aria-hidden="true">🔥</span>
              <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                {currentStreak}
              </span>
            </div>
          )}
          <Link
            href="/daily"
            className="text-xs font-medium text-brand-600 transition-colors hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
          >
            הצג הכל &rarr;
          </Link>
        </div>
      </div>

      {/* Tip preview */}
      {todayContent.tip && (
        <div className="px-4 py-3">
          <div className="mb-1.5 flex items-center gap-1.5">
            <span className="text-sm" aria-hidden="true">💡</span>
            <span className="text-[11px] font-medium uppercase tracking-wide text-amber-600 dark:text-amber-400">
              טיפ יומי
            </span>
          </div>
          <p className="line-clamp-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
            {todayContent.tip.content}
          </p>
        </div>
      )}

      {/* Quote preview */}
      {todayContent.quote && (
        <div className="border-t border-amber-100 px-4 py-3 dark:border-amber-800/30">
          <div className="mb-1.5 flex items-center gap-1.5">
            <span className="text-sm" aria-hidden="true">💬</span>
            <span className="text-[11px] font-medium uppercase tracking-wide text-blue-500 dark:text-blue-400">
              ציטוט
            </span>
          </div>
          <p className="line-clamp-1 text-xs italic text-zinc-500 dark:text-zinc-400">
            &ldquo;{todayContent.quote.content}&rdquo;
            {todayContent.quote.author && (
              <span className="not-italic font-medium text-zinc-400"> — {todayContent.quote.author}</span>
            )}
          </p>
        </div>
      )}

      {/* Challenge status */}
      {todayContent.challenge && (
        <div className="border-t border-amber-100 px-4 py-3 dark:border-amber-800/30">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-sm" aria-hidden="true">🎯</span>
              <p className="line-clamp-1 text-xs text-zinc-600 dark:text-zinc-300">
                {todayContent.challenge.content}
              </p>
            </div>
            {isSignedIn && (
              <div
                className={`shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-medium ${
                  isChallengeCompleted
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                    : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                }`}
              >
                {isChallengeCompleted ? "✓ הושלם" : "לא הושלם"}
              </div>
            )}
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="border-t border-amber-100 px-4 py-2.5 dark:border-amber-800/30">
        <Link
          href="/daily"
          className="flex items-center justify-center gap-1.5 text-xs font-medium text-amber-700 transition-colors hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300"
        >
          {isChallengeCompleted ? "צפה בתוכן המלא" : "השלם את האתגר היומי"}
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
