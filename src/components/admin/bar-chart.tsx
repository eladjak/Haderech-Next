"use client";

// ─── BarChart ─────────────────────────────────────────────────────────────────
// Pure CSS/Tailwind bar chart - no external library needed

interface BarChartProps {
  title: string;
  data: Array<{ label: string; value: number }>;
  height?: number;
  /** Tailwind gradient classes for bars */
  barColor?: string;
  unit?: string;
}

export function BarChart({
  title,
  data,
  height = 180,
  barColor = "from-[#1E3A5F] to-[#2d5a8f]",
  unit = "",
}: BarChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">
        {title}
      </h2>
      <div
        className="flex items-end gap-[3px]"
        style={{ height }}
        role="img"
        aria-label={title}
      >
        {data.map((item, idx) => {
          const heightPercent =
            maxValue > 0 ? (item.value / maxValue) * 100 : 0;
          const showLabel = data.length <= 10 || idx % Math.ceil(data.length / 10) === 0 || idx === data.length - 1;

          return (
            <div
              key={`${item.label}-${idx}`}
              className="flex flex-1 flex-col items-center justify-end"
              style={{ height: "100%" }}
            >
              <div
                className={`w-full rounded-t bg-gradient-to-t ${barColor} transition-all duration-300 hover:opacity-80`}
                style={{
                  height: `${Math.max(heightPercent, item.value > 0 ? 4 : 1)}%`,
                  minHeight: item.value > 0 ? 4 : 1,
                }}
                title={`${item.label}: ${item.value.toLocaleString("he-IL")}${unit}`}
              />
              {showLabel && (
                <span className="mt-1.5 select-none text-[10px] text-zinc-400 dark:text-zinc-500">
                  {item.label.length > 5 ? item.label.slice(5) : item.label}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── MiniSparkline ─────────────────────────────────────────────────────────────
// Tiny 5-7 bar inline trend indicator

interface MiniSparklineProps {
  data: number[];
  positive?: boolean;
}

export function MiniSparkline({ data, positive = true }: MiniSparklineProps) {
  const max = Math.max(...data, 1);

  return (
    <div className="flex items-end gap-0.5" style={{ height: 24 }}>
      {data.map((val, idx) => {
        const heightPercent = max > 0 ? (val / max) * 100 : 0;
        return (
          <div
            key={idx}
            className={`w-2 rounded-sm ${
              positive ? "bg-emerald-400" : "bg-red-400"
            } opacity-70`}
            style={{
              height: `${Math.max(heightPercent, 10)}%`,
            }}
          />
        );
      })}
    </div>
  );
}

// ─── HorizontalBarChart ────────────────────────────────────────────────────────

interface HorizontalBarChartProps {
  title: string;
  data: Array<{ label: string; value: number; sublabel?: string }>;
  barColor?: string;
  unit?: string;
  maxItems?: number;
}

export function HorizontalBarChart({
  title,
  data,
  barColor = "from-[#E85D75] to-[#D4A853]",
  unit = "",
  maxItems = 8,
}: HorizontalBarChartProps) {
  const sliced = data.slice(0, maxItems);
  const maxValue = Math.max(...sliced.map((d) => d.value), 1);

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">
        {title}
      </h2>
      {sliced.length === 0 ? (
        <p className="py-8 text-center text-sm text-zinc-400 dark:text-zinc-500">
          אין נתונים להצגה
        </p>
      ) : (
        <div className="space-y-3">
          {sliced.map((item, idx) => {
            const widthPercent =
              maxValue > 0 ? (item.value / maxValue) * 100 : 0;
            return (
              <div key={`${item.label}-${idx}`}>
                <div className="mb-1 flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <span className="truncate text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      {item.label}
                    </span>
                    {item.sublabel && (
                      <span className="mr-2 text-xs text-zinc-400 dark:text-zinc-500">
                        {item.sublabel}
                      </span>
                    )}
                  </div>
                  <span className="mr-3 shrink-0 text-sm font-semibold text-zinc-900 dark:text-white">
                    {item.value.toLocaleString("he-IL")}
                    {unit}
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <div
                    className={`h-full rounded-full bg-gradient-to-l ${barColor} transition-all duration-500`}
                    style={{ width: `${Math.max(widthPercent, 1)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Chart Skeleton ────────────────────────────────────────────────────────────

export function ChartSkeleton({ height = 48 }: { height?: number }) {
  return (
    <div className="animate-pulse rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-4 h-5 w-36 rounded bg-zinc-200 dark:bg-zinc-700" />
      <div
        className={`h-${height} rounded bg-zinc-100 dark:bg-zinc-800`}
        style={{ height: `${height * 4}px` }}
      />
    </div>
  );
}
