"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import type { Id } from "@/../convex/_generated/dataModel";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ResourceCategory = "guides" | "exercises" | "worksheets" | "summaries";
export type ResourceType = "pdf" | "worksheet" | "exercise" | "summary";

export interface ResourceCardData {
  _id: Id<"resources">;
  title: string;
  description: string;
  category: ResourceCategory;
  type: ResourceType;
  estimatedTime: number;
  isFree: boolean;
  downloadCount: number;
  content?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const CATEGORY_LABELS: Record<ResourceCategory, string> = {
  guides: "מדריכים",
  exercises: "תרגילים",
  worksheets: "דפי עבודה",
  summaries: "סיכומים",
};

export const CATEGORY_COLORS: Record<ResourceCategory, string> = {
  guides: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  exercises: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  worksheets: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  summaries: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
};

export const TYPE_LABELS: Record<ResourceType, string> = {
  pdf: "PDF",
  worksheet: "דף עבודה",
  exercise: "תרגיל",
  summary: "סיכום",
};

export const TYPE_ICONS: Record<ResourceType, string> = {
  pdf: "📄",
  worksheet: "📋",
  exercise: "✏️",
  summary: "📝",
};

// ─── Component ────────────────────────────────────────────────────────────────

interface ResourceCardProps {
  resource: ResourceCardData;
  isBookmarked?: boolean;
  onBookmarkToggle?: () => void;
  showBookmark?: boolean;
}

export function ResourceCard({
  resource,
  isBookmarked = false,
  onBookmarkToggle,
  showBookmark = true,
}: ResourceCardProps) {
  const [bookmarked, setBookmarked] = useState(isBookmarked);
  const [downloading, setDownloading] = useState(false);

  const bookmarkMutation = useMutation(api.resources.bookmarkResource);
  const downloadMutation = useMutation(api.resources.downloadResource);

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const result = await bookmarkMutation({ resourceId: resource._id });
      setBookmarked(result.action === "added");
      onBookmarkToggle?.();
    } catch {
      // Not authenticated – ignore
    }
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (downloading) return;
    setDownloading(true);
    try {
      const result = await downloadMutation({ resourceId: resource._id });
      if (result.success) {
        // Create a text file blob and trigger download
        const blob = new Blob([result.content ?? ""], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${resource.title}.txt`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch {
      // Handle error silently
    } finally {
      setTimeout(() => setDownloading(false), 1000);
    }
  };

  return (
    <div className="group relative flex flex-col rounded-2xl border border-zinc-100 bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900 dark:hover:shadow-zinc-900/50">
      {/* Header row */}
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Category badge */}
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${CATEGORY_COLORS[resource.category]}`}
          >
            {CATEGORY_LABELS[resource.category]}
          </span>

          {/* Type badge */}
          <span className="flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
            <span>{TYPE_ICONS[resource.type]}</span>
            {TYPE_LABELS[resource.type]}
          </span>
        </div>

        {/* Bookmark button */}
        {showBookmark && (
          <button
            onClick={handleBookmark}
            aria-label={bookmarked ? "הסר סימנייה" : "הוסף סימנייה"}
            className="shrink-0 rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-red-500 dark:hover:bg-zinc-800 dark:hover:text-red-400"
          >
            <svg
              className="h-4 w-4"
              fill={bookmarked ? "currentColor" : "none"}
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={bookmarked ? 0 : 2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Title */}
      <Link href={`/resources/${resource._id}`}>
        <h3 className="mb-2 text-base font-semibold text-zinc-900 transition-colors group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-400">
          {resource.title}
        </h3>
      </Link>

      {/* Description */}
      <p className="mb-4 flex-1 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
        {resource.description}
      </p>

      {/* Footer */}
      <div className="mt-auto flex items-center justify-between gap-2">
        {/* Meta info */}
        <div className="flex items-center gap-3 text-xs text-zinc-400 dark:text-zinc-500">
          {/* Time */}
          <span className="flex items-center gap-1">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {resource.estimatedTime} דק&apos;
          </span>

          {/* Downloads */}
          <span className="flex items-center gap-1">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            {resource.downloadCount.toLocaleString()}
          </span>
        </div>

        {/* Access badge + CTA */}
        <div className="flex items-center gap-2">
          {resource.isFree ? (
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
              חינם
            </span>
          ) : (
            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
              פרימיום
            </span>
          )}

          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-1 rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-600 transition-colors hover:bg-brand-100 disabled:opacity-50 dark:bg-brand-900/20 dark:text-brand-400 dark:hover:bg-brand-900/30"
          >
            {downloading ? (
              <span className="flex items-center gap-1">
                <svg className="h-3 w-3 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                טוען...
              </span>
            ) : (
              <>
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                הורד
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
