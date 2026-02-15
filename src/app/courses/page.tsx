"use client";

import { useQuery } from "convex/react";
import { useState, useMemo } from "react";
import { api } from "@/../convex/_generated/api";
import { Header } from "@/components/layout/header";
import { CourseCard } from "@/components/course/course-card";

export default function CoursesPage() {
  const courses = useQuery(api.courses.listPublished);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCourses = useMemo(() => {
    if (!courses) return undefined;
    if (!searchQuery.trim()) return courses;

    const query = searchQuery.trim().toLowerCase();
    return courses.filter(
      (course) =>
        course.title.toLowerCase().includes(query) ||
        course.description.toLowerCase().includes(query)
    );
  }, [courses, searchQuery]);

  return (
    <div className="min-h-dvh bg-white dark:bg-zinc-950">
      <Header />

      <main className="container mx-auto px-4 py-12">
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
              className="h-11 w-full rounded-xl border border-zinc-200 bg-white pr-10 pl-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:placeholder:text-zinc-500 dark:focus:border-zinc-600"
              aria-label="חיפוש קורסים"
            />
          </div>
        </div>

        {/* Course count */}
        {filteredCourses !== undefined && filteredCourses.length > 0 && (
          <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
            {searchQuery
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
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
