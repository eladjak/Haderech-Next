"use client";

import { useState } from "react";

interface EnrollButtonProps {
  isEnrolled: boolean;
  onUnenroll: () => Promise<void>;
  disabled?: boolean;
}

export function EnrollButton({
  isEnrolled,
  onUnenroll,
  disabled,
}: EnrollButtonProps) {
  const [loading, setLoading] = useState(false);
  const [confirmUnenroll, setConfirmUnenroll] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUnenroll() {
    if (!confirmUnenroll) {
      setConfirmUnenroll(true);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onUnenroll();
      setConfirmUnenroll(false);
    } catch {
      setError("לא הצלחנו להסיר את הקורס. ההתקדמות לא שונתה; אפשר לנסות שוב.");
    } finally {
      setLoading(false);
    }
  }

  if (!isEnrolled) return null;

  return (
    <div className="rounded-xl border border-zinc-200 bg-white/80 p-3 text-right dark:border-zinc-700 dark:bg-zinc-900/70">
      <div className="flex flex-wrap items-center gap-3">
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
          הקורס שמור בחשבון
        </span>
        {confirmUnenroll ? (
          <div className="w-full rounded-lg bg-red-50 p-3 dark:bg-red-950/30">
            <p className="mb-3 text-sm leading-relaxed text-red-800 dark:text-red-200">
              הסרת הקורס מהחשבון תמחק גם את ההתקדמות שנשמרה בו. הפעולה אינה
              מבטלת תשלום או זכאות, אם קיימים כאלה.
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleUnenroll}
                disabled={loading || disabled}
                className="inline-flex min-h-10 items-center rounded-lg bg-red-700 px-4 text-sm font-semibold text-white hover:bg-red-800 disabled:opacity-50"
              >
                {loading ? "מסיר..." : "כן, להסיר ולמחוק התקדמות"}
              </button>
              <button
                type="button"
                onClick={() => setConfirmUnenroll(false)}
                disabled={loading}
                className="inline-flex min-h-10 items-center rounded-lg border border-zinc-300 bg-white px-4 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                להשאיר את הקורס
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleUnenroll}
            disabled={loading || disabled}
            className="text-xs text-zinc-500 underline decoration-dotted underline-offset-4 transition-colors hover:text-red-700 disabled:opacity-50 dark:text-zinc-400 dark:hover:text-red-300"
            aria-label="הסר את הקורס מהחשבון"
          >
            להסיר מהחשבון
          </button>
        )}
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-700 dark:text-red-300" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
