"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import type { Id } from "@/../convex/_generated/dataModel";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MarkdownRenderer } from "@/components/resources/markdown-renderer";
import { ResourceCard } from "@/components/resources/resource-card";
import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  TYPE_ICONS,
  TYPE_LABELS,
  type ResourceCategory,
  type ResourceType,
} from "@/components/resources/resource-card";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatMinutes(min: number): string {
  if (min < 60) return `${min} דקות`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h} שעה ${m} דקות` : `${h} שעה`;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ResourceDetailPage() {
  const params = useParams();
  const resourceId = params.resourceId as Id<"resources">;

  const [bookmarked, setBookmarked] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  const resource = useQuery(api.resources.getResource, { resourceId });
  const isBookmarkedQuery = useQuery(api.resources.isResourceBookmarked, { resourceId });
  const relatedResources = useQuery(api.resources.listResources, {
    category: resource?.category,
  });

  const bookmarkMutation = useMutation(api.resources.bookmarkResource);
  const downloadMutation = useMutation(api.resources.downloadResource);

  // Sync bookmark state from query
  const effectiveBookmarked = isBookmarkedQuery ?? bookmarked;

  const handleBookmark = async () => {
    try {
      const result = await bookmarkMutation({ resourceId });
      setBookmarked(result.action === "added");
    } catch {
      // Not authenticated
    }
  };

  const handleDownload = async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      const result = await downloadMutation({ resourceId });
      if (result.success && result.content) {
        const blob = new Blob([result.content], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${resource?.title ?? "resource"}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 2500);
      }
    } catch {
      // Handle silently
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Not supported
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // ─── Loading state ──────────────────────────────────────────────────────────

  if (resource === undefined) {
    return (
      <div className="min-h-dvh bg-white dark:bg-zinc-950">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="mx-auto max-w-3xl space-y-4">
            <div className="h-8 w-3/4 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
            <div className="h-64 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-800" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // ─── Not found ──────────────────────────────────────────────────────────────

  if (resource === null) {
    return (
      <div className="min-h-dvh bg-white dark:bg-zinc-950">
        <Header />
        <div className="container mx-auto px-4 py-32 text-center" dir="rtl">
          <p className="text-5xl">😕</p>
          <h1 className="mt-4 text-2xl font-bold text-zinc-900 dark:text-white">
            המשאב לא נמצא
          </h1>
          <p className="mt-2 text-zinc-500 dark:text-zinc-400">
            ייתכן שהוא הוסר או שהכתובת שגויה.
          </p>
          <Link
            href="/resources"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-600"
          >
            חזרה לספרייה
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const related = relatedResources
    ?.filter((r) => r._id !== resourceId)
    .slice(0, 3) ?? [];

  // ─── Main render ────────────────────────────────────────────────────────────

  return (
    <div className="min-h-dvh bg-white dark:bg-zinc-950" dir="rtl">
      <Header />

      <main>
        {/* ─── Breadcrumb + Header ─────────────────────────────────────── */}
        <div className="border-b border-zinc-100 bg-zinc-50 py-6 dark:border-zinc-800 dark:bg-zinc-900/50">
          <div className="container mx-auto px-4">
            {/* Breadcrumb */}
            <nav className="mb-5 flex items-center gap-1.5 text-sm text-zinc-400 dark:text-zinc-500">
              <Link
                href="/resources"
                className="transition-colors hover:text-zinc-700 dark:hover:text-zinc-300"
              >
                ספריית משאבים
              </Link>
              <span>/</span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${CATEGORY_COLORS[resource.category as ResourceCategory]}`}
              >
                {CATEGORY_LABELS[resource.category as ResourceCategory]}
              </span>
              <span>/</span>
              <span className="truncate text-zinc-700 dark:text-zinc-300">{resource.title}</span>
            </nav>

            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="flex-1">
                {/* Badges */}
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${CATEGORY_COLORS[resource.category as ResourceCategory]}`}
                  >
                    {CATEGORY_LABELS[resource.category as ResourceCategory]}
                  </span>
                  <span className="flex items-center gap-1 rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                    <span>{TYPE_ICONS[resource.type as ResourceType]}</span>
                    {TYPE_LABELS[resource.type as ResourceType]}
                  </span>
                  {resource.isFree ? (
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
                      חינם
                    </span>
                  ) : (
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
                      פרימיום
                    </span>
                  )}
                </div>

                {/* Title */}
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-white md:text-3xl">
                  {resource.title}
                </h1>

                <p className="mt-2 text-zinc-500 dark:text-zinc-400">
                  {resource.description}
                </p>

                {/* Meta */}
                <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400">
                  <span className="flex items-center gap-1.5">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {formatMinutes(resource.estimatedTime)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    {resource.downloadCount.toLocaleString()} הורדות
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center gap-2 md:shrink-0">
                {/* Download */}
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-brand-600 disabled:opacity-60"
                >
                  {downloading ? (
                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : downloadSuccess ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                  )}
                  {downloadSuccess ? "הורד!" : "הורד"}
                </button>

                {/* Print */}
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
                  </svg>
                  הדפס
                </button>

                {/* Bookmark */}
                <button
                  onClick={handleBookmark}
                  aria-label={effectiveBookmarked ? "הסר סימנייה" : "שמור"}
                  className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${
                    effectiveBookmarked
                      ? "border-red-200 bg-red-50 text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400"
                      : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  }`}
                >
                  <svg
                    className="h-4 w-4"
                    fill={effectiveBookmarked ? "currentColor" : "none"}
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={effectiveBookmarked ? 0 : 2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                  {effectiveBookmarked ? "שמור" : "שמור"}
                </button>

                {/* Share */}
                <button
                  onClick={handleShare}
                  aria-label="שתף"
                  className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  {copied ? (
                    <>
                      <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      הועתק!
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                      </svg>
                      שתף
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Main content ─────────────────────────────────────────────── */}
        <div className="container mx-auto px-4 py-10">
          <div className="mx-auto max-w-3xl">
            {/* Content */}
            <div className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 md:p-8">
              <MarkdownRenderer content={resource.content} />
            </div>

            {/* Back to library */}
            <div className="mt-8 flex justify-end">
              <Link
                href="/resources"
                className="flex items-center gap-2 text-sm font-medium text-brand-500 transition-colors hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-300"
              >
                חזרה לספרייה
                <svg className="h-4 w-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
              </Link>
            </div>

            {/* Related resources */}
            {related.length > 0 && (
              <section className="mt-12">
                <h2 className="mb-5 text-xl font-bold text-zinc-900 dark:text-white">
                  משאבים קשורים
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                  {related.map((r) => (
                    <ResourceCard key={r._id} resource={r} showBookmark={false} />
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
