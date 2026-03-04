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
    <div className="min-h-dvh bg-white dark:bg-zinc-950">
      <Header />

      <main id="main-content" className="container mx-auto px-4 py-12">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-zinc-900 dark:text-white">
            הקורסים שלנו
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            קורסים מקצועיים בתחום התקשורת הזוגית והאישית
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
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

        {/* Filters */}
        {(categories.length > 0 || courses) && (
          <div className="mb-6 flex flex-wrap gap-3">
            {/* Category filter */}
            {categories.length > 0 && (
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="h-9 rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-700 focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:focus:border-zinc-600"
                aria-label="סינון לפי קטגוריה"
              >
                <option value="all">כל הקטגוריות</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            )}

            {/* Level filter */}
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="h-9 rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-700 focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:focus:border-zinc-600"
              aria-label="סינון לפי רמה"
            >
              <option value="all">כל הרמות</option>
              {Object.entries(LEVEL_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>

            {/* Active filters indicator */}
            {(selectedCategory !== "all" || selectedLevel !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory("all");
                  setSelectedLevel("all");
                }}
                className="flex h-9 items-center gap-1 rounded-lg bg-zinc-100 px-3 text-sm text-zinc-600 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
              >
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                נקה סינון
              </button>
            )}
          </div>
        )}

        {/* Course count */}
        {filteredCourses !== undefined && filteredCourses.length > 0 && (
          <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
            {searchQuery || selectedCategory !== "all" || selectedLevel !== "all"
              ? `${filteredCourses.length} תוצאות`
              : `${filteredCourses.length} קורסים זמינים`}
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
