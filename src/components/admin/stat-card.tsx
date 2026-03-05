"use client";

// ─── StatCard ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  accentColor: string;
  /** e.g. "+12%" or "-5%" */
  change?: number;
  /** subtitle shown below badge */
  subtitle?: string;
}

export function StatCard({
  label,
  value,
  icon,
  accentColor,
  change,
  subtitle,
}: StatCardProps) {
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;

  return (
    <div className="relative overflow-hidden rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            {label}
          </p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            {value}
          </p>
          {change !== undefined && change !== 0 && (
            <span
              className={`mt-2 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                isPositive
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                  : isNegative
                  ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                  : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
              }`}
            >
              {isPositive && (
                <svg
                  className="h-3 w-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18"
                  />
                </svg>
              )}
              {isNegative && (
                <svg
                  className="h-3 w-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3"
                  />
                </svg>
              )}
              {isPositive ? "+" : ""}
              {change}% השבוע
            </span>
          )}
          {subtitle && (
            <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
              {subtitle}
            </p>
          )}
        </div>
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${accentColor}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

// ─── StatCard Skeleton ─────────────────────────────────────────────────────────

export function StatCardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="h-4 w-24 rounded bg-zinc-200 dark:bg-zinc-700" />
          <div className="mt-3 h-8 w-16 rounded bg-zinc-200 dark:bg-zinc-700" />
          <div className="mt-2 h-5 w-20 rounded-full bg-zinc-200 dark:bg-zinc-700" />
        </div>
        <div className="h-12 w-12 rounded-xl bg-zinc-200 dark:bg-zinc-700" />
      </div>
    </div>
  );
}
