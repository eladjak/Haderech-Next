"use client";

import { useState } from "react";

// -----------------------------------------------
// ProfileTips - Contextual Tips Panel
// Phase 70 - Dating Profile Builder
// -----------------------------------------------

interface TipItem {
  icon: string;
  text: string;
}

interface ProfileTipsData {
  title: string;
  items: TipItem[];
  example?: {
    good: string;
    bad: string;
  };
}

interface ProfileTipsProps {
  tips: ProfileTipsData | null | undefined;
  isLoading?: boolean;
}

export function ProfileTips({ tips, isLoading }: ProfileTipsProps) {
  const [exampleOpen, setExampleOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="animate-pulse rounded-2xl border border-zinc-100 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-800/50">
        <div className="mb-3 h-4 w-2/3 rounded bg-zinc-200 dark:bg-zinc-700" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-3 w-full rounded bg-zinc-200 dark:bg-zinc-700" />
          ))}
        </div>
      </div>
    );
  }

  if (!tips) return null;

  return (
    <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4 dark:border-indigo-900/40 dark:bg-indigo-500/5">
      {/* Title */}
      <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-indigo-800 dark:text-indigo-300">
        <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
        </svg>
        {tips.title}
      </h4>

      {/* Tips list */}
      <ul className="space-y-2.5">
        {tips.items.map((item, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <span className="mt-0.5 shrink-0 text-base leading-none">{item.icon}</span>
            <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
              {item.text}
            </p>
          </li>
        ))}
      </ul>

      {/* Example collapsible */}
      {tips.example && (
        <div className="mt-4 border-t border-indigo-100 pt-3 dark:border-indigo-900/40">
          <button
            type="button"
            onClick={() => setExampleOpen((prev) => !prev)}
            className="flex w-full items-center justify-between text-xs font-medium text-indigo-700 dark:text-indigo-400"
          >
            <span>ראה דוגמאות - טוב מול רע</span>
            <svg
              className={`h-4 w-4 transition-transform ${exampleOpen ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>

          {exampleOpen && (
            <div className="mt-3 space-y-3">
              {/* Good example */}
              <div className="rounded-xl border border-green-200 bg-green-50 p-3 dark:border-green-900/40 dark:bg-green-500/5">
                <div className="mb-1.5 flex items-center gap-1.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-xs text-white">✓</span>
                  <span className="text-xs font-semibold text-green-700 dark:text-green-400">ביו טוב</span>
                </div>
                <p className="text-xs leading-relaxed text-green-700 dark:text-green-300">
                  {tips.example.good}
                </p>
              </div>

              {/* Bad example */}
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 dark:border-red-900/40 dark:bg-red-500/5">
                <div className="mb-1.5 flex items-center gap-1.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">✗</span>
                  <span className="text-xs font-semibold text-red-700 dark:text-red-400">ביו גנרי (הימנע)</span>
                </div>
                <p className="text-xs leading-relaxed text-red-700 dark:text-red-300">
                  {tips.example.bad}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
