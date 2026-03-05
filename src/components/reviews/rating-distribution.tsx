"use client";

interface RatingDistributionProps {
  distribution: Record<number, number>;
  total: number;
  average: number;
}

export function RatingDistribution({
  distribution,
  total,
  average,
}: RatingDistributionProps) {
  if (total === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      {[5, 4, 3, 2, 1].map((star) => {
        const count = distribution[star] ?? 0;
        const percent = total > 0 ? Math.round((count / total) * 100) : 0;

        return (
          <div key={star} className="flex items-center gap-3">
            {/* Star label */}
            <div className="flex w-16 shrink-0 items-center justify-end gap-1" dir="ltr">
              <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                {star}
              </span>
              <svg
                className="h-3.5 w-3.5 text-[#D4A853]"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
              </svg>
            </div>

            {/* Progress bar */}
            <div className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
              <div
                className="absolute inset-y-0 right-0 rounded-full bg-[#D4A853] transition-all duration-500"
                style={{ width: `${percent}%` }}
                role="progressbar"
                aria-valuenow={percent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${star} כוכבים: ${percent}%`}
              />
            </div>

            {/* Count */}
            <span className="w-8 shrink-0 text-left text-xs text-zinc-500 dark:text-zinc-400">
              {count}
            </span>
          </div>
        );
      })}
    </div>
  );
}
