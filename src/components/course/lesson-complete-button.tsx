"use client";

import { useState } from "react";

interface LessonCompleteButtonProps {
  isCompleted: boolean;
  onMarkComplete: () => Promise<void>;
  disabled?: boolean;
}

export function LessonCompleteButton({
  isCompleted,
  onMarkComplete,
  disabled,
}: LessonCompleteButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleComplete() {
    if (isCompleted) return;
    setLoading(true);
    await onMarkComplete();
    setLoading(false);
  }

  if (isCompleted) {
    return (
      <div className="inline-flex h-10 items-center gap-2 rounded-full bg-emerald-100 px-5 text-sm font-medium text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
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
            d="M4.5 12.75l6 6 9-13.5"
          />
        </svg>
        שיעור הושלם
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleComplete}
      disabled={loading || disabled}
      className="inline-flex h-10 items-center gap-2 rounded-full bg-zinc-900 px-5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
    >
      {loading ? (
        "שומר..."
      ) : (
        <>
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
              d="M4.5 12.75l6 6 9-13.5"
            />
          </svg>
          סמן כהושלם
        </>
      )}
    </button>
  );
}
