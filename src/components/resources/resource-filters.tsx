"use client";

import { CATEGORY_COLORS, CATEGORY_LABELS, type ResourceCategory, type ResourceType, TYPE_LABELS } from "./resource-card";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ResourceFiltersState {
  category: ResourceCategory | "all";
  type: ResourceType | "all";
  access: "free" | "premium" | "all";
  search: string;
}

interface ResourceFiltersProps {
  filters: ResourceFiltersState;
  onFiltersChange: (filters: ResourceFiltersState) => void;
  categoryCounts?: Record<string, number>;
  totalCount?: number;
}

// ─── Category pills config ────────────────────────────────────────────────────

const CATEGORIES: Array<{ id: ResourceCategory | "all"; label: string }> = [
  { id: "all", label: "כל המשאבים" },
  { id: "guides", label: "מדריכים" },
  { id: "exercises", label: "תרגילים" },
  { id: "worksheets", label: "דפי עבודה" },
  { id: "summaries", label: "סיכומים" },
];

const TYPES: Array<{ id: ResourceType | "all"; label: string }> = [
  { id: "all", label: "כל הסוגים" },
  { id: "pdf", label: "PDF" },
  { id: "worksheet", label: "דף עבודה" },
  { id: "exercise", label: "תרגיל" },
  { id: "summary", label: "סיכום" },
];

const ACCESS_OPTIONS = [
  { id: "all" as const, label: "הכל" },
  { id: "free" as const, label: "חינם" },
  { id: "premium" as const, label: "פרימיום" },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function ResourceFilters({
  filters,
  onFiltersChange,
  categoryCounts = {},
  totalCount = 0,
}: ResourceFiltersProps) {
  const update = (patch: Partial<ResourceFiltersState>) => {
    onFiltersChange({ ...filters, ...patch });
  };

  const getCategoryCount = (id: string) => {
    if (id === "all") return totalCount;
    return categoryCounts[id] ?? 0;
  };

  const activeCategoryColor =
    filters.category !== "all"
      ? CATEGORY_COLORS[filters.category].split(" ")[0].replace("bg-", "bg-") + " " +
        CATEGORY_COLORS[filters.category].split(" ")[1]
      : "bg-brand-500 text-white";

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 end-3 flex items-center">
          <svg
            className="h-4 w-4 text-zinc-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
        </div>
        <input
          type="text"
          placeholder="חיפוש משאב..."
          value={filters.search}
          onChange={(e) => update({ search: e.target.value })}
          className="w-full rounded-xl border border-zinc-200 bg-white pe-10 ps-4 py-3 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-brand-300 focus:ring-2 focus:ring-brand-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:border-brand-700 dark:focus:ring-blue-500/20"
        />
        {filters.search && (
          <button
            onClick={() => update({ search: "" })}
            className="absolute inset-y-0 start-3 flex items-center text-zinc-400 hover:text-zinc-600"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Category pills */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => {
          const isActive = filters.category === cat.id;
          const count = getCategoryCount(cat.id);
          return (
            <button
              key={cat.id}
              onClick={() => update({ category: cat.id })}
              className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-150 ${
                isActive
                  ? cat.id !== "all"
                    ? CATEGORY_COLORS[cat.id as ResourceCategory]
                    : "bg-brand-500 text-white"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
              }`}
            >
              {cat.label}
              <span
                className={`rounded-full px-1.5 py-0.5 text-xs ${
                  isActive
                    ? "bg-white/25"
                    : "bg-zinc-200 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Type + Access filters */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Type filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">סוג:</span>
          <div className="flex flex-wrap gap-1.5">
            {TYPES.map((t) => (
              <button
                key={t.id}
                onClick={() => update({ type: t.id })}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                  filters.type === t.id
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Access filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">גישה:</span>
          <div className="flex gap-1.5">
            {ACCESS_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => update({ access: opt.id })}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                  filters.access === opt.id
                    ? opt.id === "free"
                      ? "bg-emerald-500 text-white"
                      : opt.id === "premium"
                      ? "bg-amber-500 text-white"
                      : "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
