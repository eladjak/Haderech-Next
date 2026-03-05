"use client";

import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ResourceCard } from "@/components/resources/resource-card";
import { ResourceFilters, type ResourceFiltersState } from "@/components/resources/resource-filters";
import type { ResourceCategory, ResourceType } from "@/components/resources/resource-card";
import Link from "next/link";

// ─── Popular Resource Mini-Card ───────────────────────────────────────────────

function PopularCard({
  resource,
  rank,
}: {
  resource: {
    _id: string;
    title: string;
    downloadCount: number;
    category: ResourceCategory;
    isFree: boolean;
  };
  rank: number;
}) {
  const CATEGORY_DOTS: Record<ResourceCategory, string> = {
    guides: "bg-blue-500",
    exercises: "bg-emerald-500",
    worksheets: "bg-purple-500",
    summaries: "bg-amber-500",
  };

  return (
    <Link
      href={`/resources/${resource._id}`}
      className="flex items-center gap-3 rounded-xl border border-zinc-100 bg-white p-3 transition-all hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-bold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
        {rank}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-zinc-900 dark:text-white">
          {resource.title}
        </p>
        <div className="mt-0.5 flex items-center gap-1.5">
          <span className={`h-1.5 w-1.5 rounded-full ${CATEGORY_DOTS[resource.category]}`} />
          <span className="text-xs text-zinc-400 dark:text-zinc-500">
            {resource.downloadCount.toLocaleString()} הורדות
          </span>
        </div>
      </div>
    </Link>
  );
}

// ─── Skeleton loader ──────────────────────────────────────────────────────────

function CardSkeleton() {
  return (
    <div className="flex flex-col rounded-2xl border border-zinc-100 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-3 flex gap-2">
        <div className="h-5 w-20 animate-pulse rounded-full bg-zinc-100 dark:bg-zinc-800" />
        <div className="h-5 w-16 animate-pulse rounded-full bg-zinc-100 dark:bg-zinc-800" />
      </div>
      <div className="mb-2 h-5 w-3/4 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
      <div className="mb-1 h-4 w-full animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
      <div className="mb-4 h-4 w-2/3 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
      <div className="mt-auto flex items-center justify-between">
        <div className="h-4 w-24 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
        <div className="h-7 w-16 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800" />
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ResourcesPage() {
  const [filters, setFilters] = useState<ResourceFiltersState>({
    category: "all",
    type: "all",
    access: "all",
    search: "",
  });

  // Queries
  const allResources = useQuery(api.resources.listResources, {
    category: filters.category !== "all" ? (filters.category as ResourceCategory) : undefined,
    type: filters.type !== "all" ? (filters.type as ResourceType) : undefined,
    isFree:
      filters.access === "free"
        ? true
        : filters.access === "premium"
        ? false
        : undefined,
    search: filters.search || undefined,
  });

  const popularResources = useQuery(api.resources.getPopularResources, {});
  const categories = useQuery(api.resources.listCategories, {});

  // Build category counts map
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    categories?.forEach((c) => {
      counts[c.id] = c.count;
    });
    return counts;
  }, [categories]);

  const totalCount = categoryCounts["all"] ?? 0;
  const isLoading = allResources === undefined;

  return (
    <div className="min-h-dvh bg-white dark:bg-zinc-950">
      <Header />

      <main>
        {/* ─── Hero ────────────────────────────────────────────────────── */}
        <section className="border-b border-zinc-100 bg-gradient-to-b from-zinc-50 to-white py-14 dark:border-zinc-800 dark:from-zinc-900 dark:to-zinc-950">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center" dir="rtl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-sm text-brand-700 dark:border-brand-800 dark:bg-brand-900/20 dark:text-brand-400">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
                ספריית משאבים
              </div>

              <h1 className="mb-3 text-4xl font-bold tracking-tight text-zinc-900 dark:text-white md:text-5xl">
                כל הכלים שאתה צריך
              </h1>
              <p className="text-lg text-zinc-500 dark:text-zinc-400">
                מדריכים, תרגילים, דפי עבודה וסיכומים – הכל במקום אחד. חינמי לחלוטין לחלק מהתכנים.
              </p>

              {/* Stats bar */}
              <div className="mt-8 flex items-center justify-center gap-8">
                {[
                  { label: "משאבים", value: totalCount || "—" },
                  { label: "חינמיים", value: "60%" },
                  { label: "קטגוריות", value: "4" },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className="text-2xl font-bold text-zinc-900 dark:text-white">
                      {stat.value}
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── Content ─────────────────────────────────────────────────── */}
        <section className="container mx-auto px-4 py-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start" dir="rtl">

            {/* ─── Main column ──────────────────────────────────────────── */}
            <div className="flex-1">
              {/* Filters */}
              <div className="mb-6">
                <ResourceFilters
                  filters={filters}
                  onFiltersChange={setFilters}
                  categoryCounts={categoryCounts}
                  totalCount={totalCount}
                />
              </div>

              {/* Result count */}
              {!isLoading && (
                <p className="mb-5 text-sm text-zinc-400 dark:text-zinc-500">
                  {allResources?.length === 0
                    ? "לא נמצאו משאבים"
                    : `${allResources?.length ?? 0} משאבים`}
                </p>
              )}

              {/* Grid */}
              {isLoading ? (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <CardSkeleton key={i} />
                  ))}
                </div>
              ) : allResources?.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center text-zinc-400">
                  <svg
                    className="mb-4 h-12 w-12 opacity-30"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                    />
                  </svg>
                  <p className="text-lg font-medium">לא נמצאו משאבים</p>
                  <p className="mt-1 text-sm">נסה לשנות את מילות החיפוש או הפילטרים</p>
                  <button
                    onClick={() =>
                      setFilters({ category: "all", type: "all", access: "all", search: "" })
                    }
                    className="mt-4 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-600"
                  >
                    נקה פילטרים
                  </button>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {allResources?.map((resource) => (
                    <ResourceCard
                      key={resource._id}
                      resource={resource}
                      showBookmark={true}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* ─── Sidebar ──────────────────────────────────────────────── */}
            <aside className="w-full lg:w-72 lg:shrink-0">
              {/* Popular resources */}
              <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900/50">
                <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-white">
                  <svg className="h-4 w-4 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                  </svg>
                  הפופולריים ביותר
                </h2>
                <div className="space-y-2">
                  {popularResources === undefined
                    ? Array.from({ length: 5 }).map((_, i) => (
                        <div
                          key={i}
                          className="h-14 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800"
                        />
                      ))
                    : popularResources.slice(0, 5).map((r, idx) => (
                        <PopularCard
                          key={r._id}
                          resource={r}
                          rank={idx + 1}
                        />
                      ))}
                </div>
              </div>

              {/* Category legend */}
              <div className="mt-4 rounded-2xl border border-zinc-100 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900/50">
                <h2 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-white">
                  קטגוריות
                </h2>
                <div className="space-y-2">
                  {[
                    { id: "guides", label: "מדריכים", color: "bg-blue-500", desc: "הדרכות ומדריכים מקיפים" },
                    { id: "exercises", label: "תרגילים", color: "bg-emerald-500", desc: "תרגילים אינטראקטיביים" },
                    { id: "worksheets", label: "דפי עבודה", color: "bg-purple-500", desc: "כלים לרפלקציה ותכנון" },
                    { id: "summaries", label: "סיכומים", color: "bg-amber-500", desc: "סיכומי ספרים ומאמרים" },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() =>
                        setFilters((f) => ({
                          ...f,
                          category: cat.id as ResourceCategory,
                        }))
                      }
                      className="flex w-full items-center gap-3 rounded-lg p-2 text-right transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      <span className={`h-3 w-3 shrink-0 rounded-full ${cat.color}`} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-zinc-900 dark:text-white">
                          {cat.label}
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">{cat.desc}</p>
                      </div>
                      <span className="me-auto shrink-0 text-xs text-zinc-400">
                        {categoryCounts[cat.id] ?? 0}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
