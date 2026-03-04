"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";

// ─── Types ────────────────────────────────────────────────────────────────────

type ContentType = "tip" | "quote" | "challenge";

interface DailyContentItem {
  _id: string;
  type: ContentType;
  content: string;
  author?: string;
  category: string;
  dayOfYear: number;
  createdAt: number;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<
  ContentType,
  { icon: string; label: string; gradientClass: string; badgeClass: string; borderClass: string }
> = {
  tip: {
    icon: "💡",
    label: "טיפ",
    gradientClass:
      "from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/20",
    badgeClass:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    borderClass: "border-amber-200 dark:border-amber-800/50",
  },
  quote: {
    icon: "💬",
    label: "ציטוט",
    gradientClass:
      "from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/20",
    badgeClass:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    borderClass: "border-blue-200 dark:border-blue-800/50",
  },
  challenge: {
    icon: "🎯",
    label: "אתגר",
    gradientClass:
      "from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/20",
    badgeClass:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    borderClass: "border-emerald-200 dark:border-emerald-800/50",
  },
};

// ─── Compact widget (for dashboard) ──────────────────────────────────────────

export function DailyContentWidget() {
  const todayContent = useQuery(api.dailyContent.getTodayContent);
  const seedDailyContent = useMutation(api.dailyContent.seedDailyContent);
  const allContent = useQuery(api.dailyContent.getAllContent);

  const [viewIndex, setViewIndex] = useState(0);
  const [seeding, setSeeding] = useState(false);

  // If no content in DB, offer to seed
  if (todayContent === null && allContent !== undefined && allContent.length === 0) {
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

  // Loading skeleton
  if (todayContent === undefined) {
    return (
      <div className="animate-pulse rounded-2xl border border-zinc-100 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-2 h-3 w-20 rounded bg-zinc-200 dark:bg-zinc-700" />
        <div className="mb-1 h-4 w-full rounded bg-zinc-200 dark:bg-zinc-700" />
        <div className="h-4 w-3/4 rounded bg-zinc-200 dark:bg-zinc-700" />
      </div>
    );
  }

  // Pick displayed item: today or from allContent list by index
  const displayItem: DailyContentItem | null | undefined =
    allContent && allContent.length > 0
      ? allContent[viewIndex % allContent.length]
      : todayContent;

  if (!displayItem) return null;

  const cfg = TYPE_CONFIG[displayItem.type];

  const handleNext = () => {
    if (allContent && allContent.length > 0) {
      setViewIndex((prev) => (prev + 1) % allContent.length);
    }
  };

  return (
    <div
      className={`rounded-2xl border bg-gradient-to-br p-5 transition-all ${cfg.gradientClass} ${cfg.borderClass}`}
    >
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg" aria-hidden="true">
            {cfg.icon}
          </span>
          <div>
            <span
              className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${cfg.badgeClass}`}
            >
              {cfg.label} יומי
            </span>
          </div>
        </div>

        {/* Next button */}
        {allContent && allContent.length > 1 && (
          <button
            type="button"
            onClick={handleNext}
            aria-label="הצג תוכן אחר"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-white/60 hover:text-zinc-600 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-300"
          >
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
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Content */}
      <blockquote className="mb-2 text-sm leading-relaxed text-zinc-700 dark:text-zinc-200">
        {displayItem.type === "quote" ? `"${displayItem.content}"` : displayItem.content}
      </blockquote>

      {/* Author (quotes) */}
      {displayItem.author && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          — {displayItem.author}
        </p>
      )}

      {/* Category tag */}
      <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">
        {displayItem.category}
      </p>
    </div>
  );
}

// ─── Full standalone card ─────────────────────────────────────────────────────

export function DailyContentCard() {
  const todayContent = useQuery(api.dailyContent.getTodayContent);
  const allContent = useQuery(api.dailyContent.getAllContent);
  const [viewIndex, setViewIndex] = useState(0);

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

  const displayItem: DailyContentItem =
    allContent && allContent.length > 0
      ? (allContent[viewIndex % allContent.length] ?? todayContent)
      : todayContent;

  const cfg = TYPE_CONFIG[displayItem.type];

  const handleNext = () => {
    if (allContent && allContent.length > 0) {
      setViewIndex((prev) => (prev + 1) % allContent.length);
    }
  };

  const handlePrev = () => {
    if (allContent && allContent.length > 0) {
      setViewIndex((prev) =>
        prev === 0 ? allContent.length - 1 : prev - 1
      );
    }
  };

  return (
    <div
      className={`rounded-3xl border bg-gradient-to-br p-8 ${cfg.gradientClass} ${cfg.borderClass}`}
    >
      {/* Header row */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl" aria-hidden="true">
            {cfg.icon}
          </span>
          <div>
            <span
              className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${cfg.badgeClass}`}
            >
              {cfg.label} יומי
            </span>
            <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
              {displayItem.category}
            </p>
          </div>
        </div>

        {/* Nav buttons */}
        {allContent && allContent.length > 1 && (
          <div className="flex gap-1">
            <button
              type="button"
              onClick={handlePrev}
              aria-label="תוכן קודם"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-white/60 hover:text-zinc-600 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-300"
            >
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
                  d="M8.25 4.5l7.5 7.5-7.5 7.5"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="תוכן הבא"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-white/60 hover:text-zinc-600 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-300"
            >
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
                  d="M15.75 19.5L8.25 12l7.5-7.5"
                />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <blockquote className="mb-4 text-lg leading-relaxed text-zinc-800 dark:text-zinc-100">
        {displayItem.type === "quote"
          ? `"${displayItem.content}"`
          : displayItem.content}
      </blockquote>

      {displayItem.author && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          — {displayItem.author}
        </p>
      )}

      {/* Counter */}
      {allContent && allContent.length > 1 && (
        <p className="mt-4 text-xs text-zinc-400 dark:text-zinc-500">
          {(viewIndex % allContent.length) + 1} / {allContent.length}
        </p>
      )}
    </div>
  );
}
