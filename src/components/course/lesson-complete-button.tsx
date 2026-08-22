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
  const [error, setError] = useState<string | null>(null);

  async function handleComplete() {
    if (isCompleted || loading || disabled) return;
    setLoading(true);
    setError(null);
    try {
      await onMarkComplete();
    } catch {
      setError("לא הצלחנו לשמור את ההשלמה. אפשר לנסות שוב.");
    } finally {
      setLoading(false);
    }
  }

  if (isCompleted) {
    return (
      <div
        className="inline-flex min-h-11 items-center gap-2 rounded-full bg-emerald-100 px-5 py-2 text-sm font-medium text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
        role="status"
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
            d="M4.5 12.75l6 6 9-13.5"
          />
        </svg>
        השיעור סומן כהושלם
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleComplete}
        disabled={loading || disabled}
        className="inline-flex min-h-11 items-center gap-2 rounded-full bg-zinc-900 px-5 py-2 text-sm font-medium text-white transition-[transform,background-color] hover:bg-zinc-800 active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
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
            סיימתי את השיעור
          </>
        )}
      </button>
      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
