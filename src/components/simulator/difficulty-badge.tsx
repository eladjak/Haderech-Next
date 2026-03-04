"use client";

type Difficulty = "easy" | "medium" | "hard";

const DIFFICULTY_CONFIG: Record<
  Difficulty,
  { label: string; className: string }
> = {
  easy: {
    label: "קל",
    className:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  medium: {
    label: "בינוני",
    className:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  },
  hard: {
    label: "קשה",
    className:
      "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
  },
};

interface DifficultyBadgeProps {
  difficulty: Difficulty;
  size?: "sm" | "md";
}

export function DifficultyBadge({
  difficulty,
  size = "sm",
}: DifficultyBadgeProps) {
  const config = DIFFICULTY_CONFIG[difficulty];
  const sizeClass =
    size === "md" ? "px-3 py-1 text-sm" : "px-2.5 py-0.5 text-xs";

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${sizeClass} ${config.className}`}
    >
      {config.label}
    </span>
  );
}
