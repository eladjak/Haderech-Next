"use client";

export type ForumCategory =
  | "general"
  | "dating-tips"
  | "success-stories"
  | "questions"
  | "advice";

export type ForumCategoryOrAll = ForumCategory | "all";

export const FORUM_CATEGORIES: {
  value: ForumCategory;
  label: string;
  emoji: string;
}[] = [
  { value: "general", label: "כללי", emoji: "💬" },
  { value: "dating-tips", label: "טיפים", emoji: "💡" },
  { value: "success-stories", label: "סיפורי הצלחה", emoji: "💕" },
  { value: "questions", label: "שאלות", emoji: "❓" },
  { value: "advice", label: "עצות", emoji: "🎯" },
];

export const CATEGORY_LABELS: Record<ForumCategoryOrAll, string> = {
  all: "הכל",
  general: "כללי",
  "dating-tips": "טיפים",
  "success-stories": "סיפורי הצלחה",
  questions: "שאלות",
  advice: "עצות",
};

export const CATEGORY_COLORS: Record<ForumCategory, string> = {
  general: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
  "dating-tips":
    "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
  "success-stories":
    "bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300",
  questions:
    "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  advice:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
};

interface CategoryPillsProps {
  selected: ForumCategoryOrAll;
  onChange: (category: ForumCategoryOrAll) => void;
  showAll?: boolean;
  className?: string;
}

export function CategoryPills({
  selected,
  onChange,
  showAll = true,
  className = "",
}: CategoryPillsProps) {
  const allOption = { value: "all" as const, label: "הכל", emoji: "🌟" };
  const options = showAll
    ? [allOption, ...FORUM_CATEGORIES]
    : FORUM_CATEGORIES;

  return (
    <div
      className={`flex flex-wrap gap-2 ${className}`}
      role="group"
      aria-label="סינון לפי קטגוריה"
    >
      {options.map((cat) => {
        const isActive = selected === cat.value;
        return (
          <button
            key={cat.value}
            onClick={() => onChange(cat.value)}
            aria-pressed={isActive}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 ${
              isActive
                ? "bg-brand-500 text-white shadow-sm"
                : "bg-white text-zinc-600 shadow-sm hover:bg-brand-50 hover:text-brand-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
            }`}
          >
            <span aria-hidden="true">{cat.emoji}</span>{" "}
            {cat.label}
          </button>
        );
      })}
    </div>
  );
}
