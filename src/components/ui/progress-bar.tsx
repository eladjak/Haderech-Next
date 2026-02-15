"use client";

interface ProgressBarProps {
  value: number; // 0-100
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export function ProgressBar({
  value,
  size = "md",
  showLabel = false,
  className = "",
}: ProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value));

  const heightClass = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4",
  }[size];

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="mb-1 flex justify-between text-sm">
          <span className="text-zinc-600 dark:text-zinc-400">התקדמות</span>
          <span className="font-medium text-zinc-900 dark:text-white">
            {clampedValue}%
          </span>
        </div>
      )}
      <div
        className={`w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700 ${heightClass}`}
        role="progressbar"
        aria-valuenow={clampedValue}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`התקדמות: ${clampedValue} אחוז`}
      >
        <div
          className={`${heightClass} rounded-full bg-emerald-500 transition-all duration-300`}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
}
