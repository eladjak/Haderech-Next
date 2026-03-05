"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

type TodayContentResult = {
  dayOfYear: number;
  year: number;
  tip: { _id: string; content: string; category: string } | null;
  quote: { _id: string; content: string; author?: string; category: string } | null;
  challenge: { _id: string; content: string; category: string } | null;
} | null;

// ─── Compact widget (for dashboard - legacy export, use DailyWidget instead) ──

/**
 * @deprecated Use DailyWidget from @/components/daily/daily-widget instead.
 * Kept for backwards compatibility.
 */
export function DailyContentWidget() {
  const todayContent = useQuery(api.dailyContent.getTodayContent) as TodayContentResult | undefined;
  const seedDailyContent = useMutation(api.dailyContent.seedDailyContent);
  const [seeding, setSeeding] = useState(false);

  if (todayContent === null) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-700 dark:bg-zinc-900">
        <p className="mb-1 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          הטיפ היומי
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
              await seedDailyContent({});
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

  if (todayContent === undefined) {
    return (
      <div className="animate-pulse rounded-2xl border border-zinc-100 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-2 h-3 w-20 rounded bg-zinc-200 dark:bg-zinc-700" />
        <div className="mb-1 h-4 w-full rounded bg-zinc-200 dark:bg-zinc-700" />
        <div className="h-4 w-3/4 rounded bg-zinc-200 dark:bg-zinc-700" />
      </div>
    );
  }

  const tip = todayContent.tip;
  if (!tip) return null;

  return (
    <div className="rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50 to-yellow-50/40 p-5 dark:border-amber-800/40 dark:from-amber-950/30 dark:to-yellow-950/10">
      <div className="mb-2 flex items-center gap-2">
        <span className="text-lg" aria-hidden="true">💡</span>
        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
          טיפ יומי
        </span>
      </div>
      <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-200">
        {tip.content}
      </p>
      <Link
        href="/daily"
        className="mt-3 inline-block text-xs font-medium text-brand-600 hover:underline dark:text-brand-400"
      >
        ציטוט ואתגר יומי &rarr;
      </Link>
    </div>
  );
}

// ─── Full standalone card (legacy) ───────────────────────────────────────────

/**
 * @deprecated Use the daily page at /daily instead.
 */
export function DailyContentCard() {
  const todayContent = useQuery(api.dailyContent.getTodayContent) as TodayContentResult | undefined;

  if (todayContent === undefined) {
    return (
      <div className="animate-pulse rounded-3xl border border-zinc-100 bg-zinc-50 p-8 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-4 h-4 w-32 rounded bg-zinc-200 dark:bg-zinc-700" />
        <div className="mb-2 h-5 w-full rounded bg-zinc-200 dark:bg-zinc-700" />
        <div className="mb-2 h-5 w-5/6 rounded bg-zinc-200 dark:bg-zinc-700" />
        <div className="h-5 w-4/6 rounded bg-zinc-200 dark:bg-zinc-700" />
      </div>
    );
  }

  if (!todayContent) return null;

  const tip = todayContent.tip;
  const quote = todayContent.quote;

  return (
    <div className="rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 p-8 dark:border-amber-800/40 dark:from-amber-950/30 dark:to-yellow-950/10">
      {tip && (
        <>
          <div className="mb-4 flex items-center gap-3">
            <span className="text-3xl" aria-hidden="true">💡</span>
            <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
              טיפ יומי
            </span>
          </div>
          <p className="mb-4 text-lg leading-relaxed text-zinc-800 dark:text-zinc-100">
            {tip.content}
          </p>
        </>
      )}
      {quote && (
        <blockquote className="border-r-2 border-blue-300 pr-3 text-sm italic text-zinc-600 dark:border-blue-700 dark:text-zinc-400">
          &ldquo;{quote.content}&rdquo;
          {quote.author && (
            <span className="not-italic font-medium"> — {quote.author}</span>
          )}
        </blockquote>
      )}
      <Link
        href="/daily"
        className="mt-4 inline-block text-sm font-medium text-brand-600 hover:underline dark:text-brand-400"
      >
        ראה תוכן מלא &rarr;
      </Link>
    </div>
  );
}
