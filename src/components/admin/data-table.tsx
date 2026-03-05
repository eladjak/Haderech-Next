"use client";

import { useState } from "react";

// ─── DataTable ─────────────────────────────────────────────────────────────────

export interface Column<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
  className?: string;
  headerClassName?: string;
}

interface DataTableProps<T extends Record<string, unknown>> {
  title?: string;
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
  maxRows?: number;
  className?: string;
}

type SortDir = "asc" | "desc";

export function DataTable<T extends Record<string, unknown>>({
  title,
  columns,
  data,
  emptyMessage = "אין נתונים להצגה",
  maxRows,
  className = "",
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const sorted = [...data].sort((a, b) => {
    if (!sortKey) return 0;
    const aVal = a[sortKey];
    const bVal = b[sortKey];
    if (aVal === undefined || bVal === undefined) return 0;
    if (typeof aVal === "number" && typeof bVal === "number") {
      return sortDir === "asc" ? aVal - bVal : bVal - aVal;
    }
    const aStr = String(aVal);
    const bStr = String(bVal);
    return sortDir === "asc"
      ? aStr.localeCompare(bStr, "he")
      : bStr.localeCompare(aStr, "he");
  });

  const displayed = maxRows ? sorted.slice(0, maxRows) : sorted;

  function handleSort(key: string) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  return (
    <div
      className={`overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 ${className}`}
    >
      {title && (
        <div className="border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
            {title}
          </h2>
        </div>
      )}
      {displayed.length === 0 ? (
        <div className="px-5 py-12 text-center text-sm text-zinc-400 dark:text-zinc-500">
          {emptyMessage}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm" dir="rtl">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/50">
                {columns.map((col) => (
                  <th
                    key={String(col.key)}
                    className={`px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 ${
                      col.sortable ? "cursor-pointer select-none hover:text-zinc-700 dark:hover:text-zinc-300" : ""
                    } ${col.headerClassName ?? ""}`}
                    onClick={
                      col.sortable ? () => handleSort(String(col.key)) : undefined
                    }
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.label}
                      {col.sortable && sortKey === String(col.key) && (
                        <svg
                          className="h-3 w-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2.5}
                          aria-hidden="true"
                        >
                          {sortDir === "asc" ? (
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M4.5 10.5L12 3m0 0l7.5 7.5"
                            />
                          ) : (
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M19.5 13.5L12 21m0 0l-7.5-7.5"
                            />
                          )}
                        </svg>
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {displayed.map((row, rowIdx) => (
                <tr
                  key={rowIdx}
                  className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/30"
                >
                  {columns.map((col) => (
                    <td
                      key={String(col.key)}
                      className={`px-4 py-3 text-zinc-700 dark:text-zinc-300 ${col.className ?? ""}`}
                    >
                      {col.render
                        ? col.render(row)
                        : String(row[String(col.key)] ?? "—")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Table Skeleton ────────────────────────────────────────────────────────────

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="animate-pulse overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
        <div className="h-5 w-40 rounded bg-zinc-200 dark:bg-zinc-700" />
      </div>
      <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3">
            <div className="h-8 w-8 rounded-full bg-zinc-200 dark:bg-zinc-700" />
            <div className="flex-1 space-y-1.5">
              <div className="h-4 w-32 rounded bg-zinc-200 dark:bg-zinc-700" />
              <div className="h-3 w-48 rounded bg-zinc-100 dark:bg-zinc-800" />
            </div>
            <div className="h-4 w-16 rounded bg-zinc-200 dark:bg-zinc-700" />
          </div>
        ))}
      </div>
    </div>
  );
}
