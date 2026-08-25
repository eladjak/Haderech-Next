import Link from "next/link";

// Compatibility export for an old lazy import. The former status-points card
// now routes to factual, private lesson progress.
export function XpProfile() {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="text-lg font-semibold text-zinc-950 dark:text-white">
        ההתקדמות האישית שלי
      </h2>
      <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
        כאן רואים שיעורים שסומנו כהושלמו ומשוב למידה ממוקד, בלי דירוג,
        נקודות מעמד או השוואה לאחרים.
      </p>
      <Link
        href="/student/dashboard"
        className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-emerald-700 dark:text-emerald-400"
      >
        לפתוח את סקירת הלמידה
      </Link>
    </div>
  );
}
