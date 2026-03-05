"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

type FilterType = "all" | "course" | "lesson" | "blog";

const FILTER_TABS: { key: FilterType; label: string }[] = [
  { key: "all", label: "הכל" },
  { key: "course", label: "קורסים" },
  { key: "lesson", label: "שיעורים" },
  { key: "blog", label: "מאמרים" },
];

function getItemLink(itemType: string, itemId: string): string {
  switch (itemType) {
    case "course":
      return `/courses/${itemId}`;
    case "lesson":
      return `/course/${itemId}`;
    case "blog":
      return `/blog/${itemId}`;
    default:
      return "#";
  }
}

function getTypeBadge(itemType: string): { label: string; color: string } {
  switch (itemType) {
    case "course":
      return {
        label: "קורס",
        color:
          "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      };
    case "lesson":
      return {
        label: "שיעור",
        color:
          "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
      };
    case "blog":
      return {
        label: "מאמר",
        color:
          "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
      };
    default:
      return {
        label: itemType,
        color:
          "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
      };
  }
}

export default function StudentBookmarksPage() {
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  const bookmarks = useQuery(
    api.bookmarks.getUserBookmarks,
    activeFilter === "all" ? {} : { itemType: activeFilter }
  );

  const removeBookmark = useMutation(api.bookmarks.removeBookmark);

  const handleRemove = async (bookmarkId: string) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await removeBookmark({ id: bookmarkId as any });
    } catch {
      // silently fail - query will update UI
    }
  };

  const formatDate = (timestamp: number) =>
    new Date(timestamp).toLocaleDateString("he-IL", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  return (
    <div className="min-h-dvh bg-white dark:bg-zinc-950">
      <Header />

      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="mx-auto max-w-3xl">
          {/* Breadcrumb */}
          <nav
            className="mb-6 text-sm text-zinc-500 dark:text-zinc-400"
            aria-label="ניווט"
          >
            <Link
              href="/dashboard"
              className="hover:text-zinc-900 dark:hover:text-white"
            >
              אזור אישי
            </Link>
            <span className="mx-2">/</span>
            <span className="text-zinc-900 dark:text-white">המועדפים שלי</span>
          </nav>

          {/* Title */}
          <h1 className="mb-2 text-2xl font-bold text-zinc-900 dark:text-white">
            המועדפים שלי
          </h1>
          <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
            קורסים, שיעורים ומאמרים ששמרת למועדפים
          </p>

          {/* Filter tabs */}
          <div
            className="mb-8 flex gap-2 overflow-x-auto"
            role="tablist"
            aria-label="סינון מועדפים"
          >
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={activeFilter === tab.key}
                onClick={() => setActiveFilter(tab.key)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  activeFilter === tab.key
                    ? "bg-brand-500 text-white"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Loading */}
          {bookmarks === undefined && (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="mb-2 h-5 w-48 rounded bg-zinc-200 dark:bg-zinc-700" />
                      <div className="flex gap-3">
                        <div className="h-4 w-14 rounded-full bg-zinc-200 dark:bg-zinc-700" />
                        <div className="h-4 w-24 rounded bg-zinc-200 dark:bg-zinc-700" />
                      </div>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-zinc-200 dark:bg-zinc-700" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {bookmarks && bookmarks.length === 0 && (
            <div className="rounded-2xl bg-zinc-50 p-12 text-center dark:bg-zinc-900">
              <svg
                className="mx-auto mb-3 h-12 w-12 text-zinc-300 dark:text-zinc-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                />
              </svg>
              <h2 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-white">
                אין סימניות עדיין
              </h2>
              <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
                לחץ על הלב ליד קורסים ושיעורים כדי לשמור אותם כאן
              </p>
              <Link
                href="/courses"
                className="inline-flex h-10 items-center rounded-full bg-brand-500 px-6 text-sm font-medium text-white transition-colors hover:bg-brand-600"
              >
                עבור לקורסים
              </Link>
            </div>
          )}

          {/* Bookmarks list */}
          {bookmarks && bookmarks.length > 0 && (
            <div className="space-y-3">
              {bookmarks.map((bookmark) => {
                const badge = getTypeBadge(bookmark.itemType);
                return (
                  <div
                    key={bookmark._id}
                    className="group rounded-xl border border-zinc-200 bg-white p-4 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:border-zinc-700 dark:hover:bg-zinc-900"
                  >
                    <div className="flex items-center gap-4">
                      {/* Content */}
                      <Link
                        href={getItemLink(bookmark.itemType, bookmark.itemId)}
                        className="flex min-w-0 flex-1 flex-col"
                      >
                        <span className="mb-1.5 truncate text-sm font-medium text-zinc-900 dark:text-white">
                          {bookmark.itemTitle}
                        </span>
                        <div className="flex items-center gap-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${badge.color}`}
                          >
                            {badge.label}
                          </span>
                          <span className="text-xs text-zinc-400 dark:text-zinc-500">
                            {formatDate(bookmark.createdAt)}
                          </span>
                        </div>
                      </Link>

                      {/* Remove button */}
                      <button
                        type="button"
                        onClick={() => handleRemove(bookmark._id)}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-zinc-400 opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                        aria-label={`הסר את "${bookmark.itemTitle}" מהמועדפים`}
                        title="הסר מהמועדפים"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.5}
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
