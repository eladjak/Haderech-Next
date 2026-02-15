"use client";

import { useState } from "react";

interface EnrollButtonProps {
  isEnrolled: boolean;
  onEnroll: () => Promise<void>;
  onUnenroll: () => Promise<void>;
  disabled?: boolean;
}

export function EnrollButton({
  isEnrolled,
  onEnroll,
  onUnenroll,
  disabled,
}: EnrollButtonProps) {
  const [loading, setLoading] = useState(false);
  const [confirmUnenroll, setConfirmUnenroll] = useState(false);

  async function handleEnroll() {
    setLoading(true);
    await onEnroll();
    setLoading(false);
  }

  async function handleUnenroll() {
    if (!confirmUnenroll) {
      setConfirmUnenroll(true);
      return;
    }
    setLoading(true);
    await onUnenroll();
    setLoading(false);
    setConfirmUnenroll(false);
  }

  if (isEnrolled) {
    return (
      <div className="flex items-center gap-3">
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 dark:text-emerald-400">
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
          רשום לקורס
        </span>
        <button
          type="button"
          onClick={handleUnenroll}
          disabled={loading || disabled}
          className="text-xs text-zinc-400 transition-colors hover:text-red-600 disabled:opacity-50 dark:text-zinc-500 dark:hover:text-red-400"
          aria-label="בטל הרשמה לקורס"
        >
          {confirmUnenroll
            ? loading
              ? "מבטל..."
              : "לחץ שוב לאישור"
            : "בטל הרשמה"}
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleEnroll}
      disabled={loading || disabled}
      className="inline-flex h-11 items-center justify-center rounded-full bg-zinc-900 px-8 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
    >
      {loading ? "נרשם..." : "הירשם לקורס"}
    </button>
  );
}
