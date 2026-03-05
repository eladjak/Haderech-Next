"use client";

import { useQuery } from "convex/react";
import { useState, useMemo } from "react";
import { api } from "@/../convex/_generated/api";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CourseCard } from "@/components/course/course-card";

const LEVEL_LABELS: Record<string, string> = {
  beginner: "מתחילים",
  intermediate: "מתקדמים",
  advanced: "מומחים",
};

export default function CoursesPage() {
  const courses = useQuery(api.courses.listPublished);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");

  const categories = useMemo(() => {
    if (!courses) return [];
    const cats = new Set<string>();
    for (const c of courses) {
      if (c.category) cats.add(c.category);
    }
    return Array.from(cats).sort();
  }, [courses]);

  const filteredCourses = useMemo(() => {
    if (!courses) return undefined;

    return courses.filter((course) => {
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        course.title.toLowerCase().includes(query) ||
        course.description.toLowerCase().includes(query);
      const matchesCategory =
        selectedCategory === "all" || course.category === selectedCategory;
      const matchesLevel =
        selectedLevel === "all" || course.level === selectedLevel;
      return matchesSearch && matchesCategory && matchesLevel;
    });
  }, [courses, searchQuery, selectedCategory, selectedLevel]);

  return (
    <div className="min-h-dvh bg-[var(--background)] dark:bg-zinc-950">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-brand-100/20 bg-gradient-to-b from-brand-50/40 via-[var(--background)] to-[var(--background)] dark:border-zinc-800 dark:from-blue-50/5">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute -top-12 right-1/4 h-64 w-64 rounded-full bg-brand-100/30 blur-3xl dark:bg-brand-100/10" />
          <div className="absolute top-8 left-1/3 h-48 w-48 rounded-full bg-blue-50/20 blur-3xl dark:bg-blue-100/5" />
        </div>
        <div className="container relative mx-auto px-4 pb-10 pt-16 text-center md:pt-20">
          <span className="mb-3 inline-block text-sm font-semibold uppercase tracking-wider text-brand-500">
            למידה שמשנה חיים
          </span>
          <h1 className="mb-3 text-3xl font-black text-blue-500 dark:text-white md:text-4xl lg:text-5xl">
            הקורסים שלנו
          </h1>
          <p className="mx-auto max-w-lg text-blue-500/60 dark:text-zinc-400">
            קורסים מקצועיים בתחום התקשורת הזוגית והאישית - לומדים, מתאמנים, ומשנים
          </p>
          {filteredCourses !== undefined && filteredCourses.length > 0 && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-brand-200/50 bg-white/80 px-4 py-1.5 text-sm font-medium text-blue-500/70 shadow-sm dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-400">
              <svg className="h-4 w-4 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
              </svg>
              {filteredCourses.length} קורסים זמינים
            </div>
          )}
        </div>
      </section>

      <main id="main-content" className="container mx-auto px-4 py-10">
        {/* Search + Filters bar */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative max-w-md flex-1">
            <svg
              className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
            <input
              type="search"
              placeholder="חפש קורס..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-11 w-full rounded-xl border border-zinc-200 bg-white pr-10 pl-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:placeholder:text-zinc-500 dark:focus:border-brand-700 dark:focus:ring-blue-500/30"
              aria-label="חיפוש קורסים"
            />
          </div>
        </div>

        {/* Category + Level filter pills */}
        {(categories.length > 0 || courses) && (
          <div className="mb-8 flex flex-wrap gap-2">
            {/* "All" pill */}
            <button
              type="button"
              onClick={() => { setSelectedCategory("all"); setSelectedLevel("all"); }}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-150 ${
                selectedCategory === "all" && selectedLevel === "all"
                  ? "bg-brand-500 text-white shadow-sm shadow-brand-500/20"
                  : "border border-brand-100/50 bg-white text-blue-500/70 hover:border-brand-200 hover:bg-brand-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-zinc-600"
              }`}
            >
              הכל
            </button>

            {/* Category pills */}
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(selectedCategory === cat ? "all" : cat)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-150 ${
                  selectedCategory === cat
                    ? "bg-brand-500 text-white shadow-sm shadow-brand-500/20"
                    : "border border-brand-100/50 bg-white text-blue-500/70 hover:border-brand-200 hover:bg-brand-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-zinc-600"
                }`}
              >
                {cat}
              </button>
            ))}

            {/* Divider */}
            {categories.length > 0 && (
              <div className="mx-1 hidden h-9 w-px self-center bg-brand-100/40 md:block dark:bg-zinc-700" />
            )}

            {/* Level pills */}
            {Object.entries(LEVEL_LABELS).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedLevel(selectedLevel === key ? "all" : key)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-150 ${
                  selectedLevel === key
                    ? "bg-blue-500 text-white shadow-sm shadow-blue-500/20"
                    : "border border-brand-100/50 bg-white text-blue-500/70 hover:border-blue-100 hover:bg-blue-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-zinc-600"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Filtered result count */}
        {filteredCourses !== undefined && filteredCourses.length > 0 && (searchQuery || selectedCategory !== "all" || selectedLevel !== "all") && (
          <p className="mb-4 text-sm text-blue-500/50 dark:text-zinc-500">
            {filteredCourses.length} תוצאות
          </p>
        )}

        {/* Loading state */}
        {filteredCourses === undefined && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-80 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-800"
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {filteredCourses !== undefined && filteredCourses.length === 0 && (
          <div className="rounded-2xl bg-zinc-50 p-12 text-center dark:bg-zinc-900">
            {searchQuery ? (
              <>
                <svg
                  className="mx-auto mb-3 h-10 w-10 text-zinc-300 dark:text-zinc-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                  />
                </svg>
                <p className="mb-2 text-lg font-medium text-zinc-700 dark:text-zinc-300">
                  לא נמצאו תוצאות
                </p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  נסה מילות חיפוש אחרות
                </p>
              </>
            ) : (
              <p className="text-lg text-zinc-600 dark:text-zinc-400">
                עדיין אין קורסים זמינים. חזור בקרוב!
              </p>
            )}
          </div>
        )}

        {/* Course grid */}
        {filteredCourses !== undefined && filteredCourses.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map((course) => (
              <CourseCard
                key={course._id}
                id={course._id}
                title={course.title}
                description={course.description}
                imageUrl={course.imageUrl}
                category={course.category}
                level={course.level}
                estimatedHours={course.estimatedHours}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
