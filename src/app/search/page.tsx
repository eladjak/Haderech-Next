"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

function highlightMatch(text: string, query: string) {
  if (!query.trim()) return text;

  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase().trim();
  const idx = lowerText.indexOf(lowerQuery);

  if (idx === -1) return text;

  const before = text.slice(0, idx);
  const match = text.slice(idx, idx + lowerQuery.length);
  const after = text.slice(idx + lowerQuery.length);

  return (
    <>
      {before}
      <mark className="rounded bg-brand-100 px-0.5 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
        {match}
      </mark>
      {after}
    </>
  );
}

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString("he-IL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function SearchPage() {
  const [inputValue, setInputValue] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Debounce the search query (300ms)
  const handleInputChange = useCallback((value: string) => {
    setInputValue(value);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      setDebouncedQuery(value.trim());
    }, 300);
  }, []);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const results = useQuery(
    api.search.globalSearch,
    debouncedQuery.length > 0 ? { query: debouncedQuery } : "skip"
  );

  const hasQuery = debouncedQuery.length > 0;
  const isLoading = hasQuery && results === undefined;
  const hasResults =
    results &&
    (results.courses.length > 0 ||
      results.lessons.length > 0 ||
      results.blogPosts.length > 0 ||
      results.tools.length > 0);
  const noResults = hasQuery && results && !hasResults;

  const totalResults = results
    ? results.courses.length +
      results.lessons.length +
      results.blogPosts.length +
      results.tools.length
    : 0;

  return (
    <div className="min-h-dvh bg-white dark:bg-zinc-950">
      <Header />

      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="mx-auto max-w-3xl">
          {/* Page title */}
          <h1 className="mb-6 text-3xl font-bold text-blue-500 dark:text-white md:text-4xl">
            חיפוש
          </h1>

          {/* Search input */}
          <div className="relative mb-8">
            <div className="pointer-events-none absolute inset-y-0 end-0 flex items-center pe-4">
              <svg
                className="h-5 w-5 text-zinc-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                />
              </svg>
            </div>
            <input
              ref={inputRef}
              type="search"
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="חפש קורסים, שיעורים, מאמרים וכלים..."
              className="w-full rounded-xl border border-zinc-200 bg-white py-4 pe-12 ps-5 text-base text-zinc-900 shadow-sm outline-none transition-shadow placeholder:text-zinc-400 focus:border-brand-300 focus:ring-2 focus:ring-brand-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:placeholder:text-zinc-500 dark:focus:border-brand-600 dark:focus:ring-brand-900/30"
              aria-label="שדה חיפוש"
            />
          </div>

          {/* Empty state */}
          {!hasQuery && (
            <div className="flex flex-col items-center py-16 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 dark:bg-brand-900/20">
                <svg
                  className="h-8 w-8 text-brand-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                  />
                </svg>
              </div>
              <p className="text-lg text-zinc-500 dark:text-zinc-400">
                חפש קורסים, שיעורים, מאמרים וכלים
              </p>
            </div>
          )}

          {/* Loading */}
          {isLoading && (
            <div className="flex flex-col items-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-200 border-t-brand-500" />
              <p className="mt-3 text-sm text-zinc-400">מחפש...</p>
            </div>
          )}

          {/* No results */}
          {noResults && (
            <div className="flex flex-col items-center py-16 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800">
                <svg
                  className="h-8 w-8 text-zinc-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.182 16.318A4.486 4.486 0 0 0 12.016 15a4.486 4.486 0 0 0-3.198 1.318M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z"
                  />
                </svg>
              </div>
              <p className="text-lg text-zinc-600 dark:text-zinc-300">
                לא נמצאו תוצאות עבור &ldquo;{debouncedQuery}&rdquo;
              </p>
              <p className="mt-2 text-sm text-zinc-400">
                נסה מילות חיפוש אחרות או בדוק את האיות
              </p>
            </div>
          )}

          {/* Results */}
          {hasResults && (
            <div className="space-y-8">
              {/* Results count */}
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                נמצאו {totalResults} תוצאות עבור &ldquo;{debouncedQuery}&rdquo;
              </p>

              {/* Courses */}
              {results.courses.length > 0 && (
                <section>
                  <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-blue-500 dark:text-blue-300">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
                      />
                    </svg>
                    קורסים
                    <span className="text-sm font-normal text-zinc-400">
                      ({results.courses.length})
                    </span>
                  </h2>
                  <div className="space-y-2">
                    {results.courses.map((course) => (
                      <Link
                        key={course._id}
                        href={`/courses/${course._id}`}
                        className="block rounded-xl border border-zinc-100 bg-white p-4 transition-all hover:border-brand-200 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-brand-700"
                      >
                        <h3 className="text-base font-medium text-zinc-900 dark:text-white">
                          {highlightMatch(course.title, debouncedQuery)}
                        </h3>
                        <p className="mt-1 line-clamp-2 text-sm text-zinc-500 dark:text-zinc-400">
                          {highlightMatch(course.description, debouncedQuery)}
                        </p>
                        {(course.category || course.level) && (
                          <div className="mt-2 flex gap-2">
                            {course.category && (
                              <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs text-blue-600 dark:bg-blue-900/20 dark:text-blue-300">
                                {course.category}
                              </span>
                            )}
                            {course.level && (
                              <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs text-brand-600 dark:bg-brand-900/20 dark:text-brand-300">
                                {course.level === "beginner"
                                  ? "מתחיל"
                                  : course.level === "intermediate"
                                    ? "בינוני"
                                    : "מתקדם"}
                              </span>
                            )}
                          </div>
                        )}
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* Lessons */}
              {results.lessons.length > 0 && (
                <section>
                  <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-blue-500 dark:text-blue-300">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z"
                      />
                    </svg>
                    שיעורים
                    <span className="text-sm font-normal text-zinc-400">
                      ({results.lessons.length})
                    </span>
                  </h2>
                  <div className="space-y-2">
                    {results.lessons.map((lesson) => (
                      <Link
                        key={lesson._id}
                        href={`/course/${lesson.courseId}/lesson/${lesson._id}`}
                        className="block rounded-xl border border-zinc-100 bg-white p-4 transition-all hover:border-brand-200 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-brand-700"
                      >
                        <h3 className="text-base font-medium text-zinc-900 dark:text-white">
                          {highlightMatch(lesson.title, debouncedQuery)}
                        </h3>
                        {lesson.courseName && (
                          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                            בקורס: {lesson.courseName}
                          </p>
                        )}
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* Blog Posts */}
              {results.blogPosts.length > 0 && (
                <section>
                  <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-blue-500 dark:text-blue-300">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6V7.5Z"
                      />
                    </svg>
                    מאמרים
                    <span className="text-sm font-normal text-zinc-400">
                      ({results.blogPosts.length})
                    </span>
                  </h2>
                  <div className="space-y-2">
                    {results.blogPosts.map((post) => (
                      <Link
                        key={post._id}
                        href={`/blog/${post.slug}`}
                        className="block rounded-xl border border-zinc-100 bg-white p-4 transition-all hover:border-brand-200 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-brand-700"
                      >
                        <h3 className="text-base font-medium text-zinc-900 dark:text-white">
                          {highlightMatch(post.title, debouncedQuery)}
                        </h3>
                        <p className="mt-1 line-clamp-2 text-sm text-zinc-500 dark:text-zinc-400">
                          {post.excerpt}
                        </p>
                        <p className="mt-2 text-xs text-zinc-400">
                          {formatDate(post.createdAt)}
                        </p>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* Tools */}
              {results.tools.length > 0 && (
                <section>
                  <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-blue-500 dark:text-blue-300">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.049.58.025 1.193-.14 1.743"
                      />
                    </svg>
                    כלים
                    <span className="text-sm font-normal text-zinc-400">
                      ({results.tools.length})
                    </span>
                  </h2>
                  <div className="space-y-2">
                    {results.tools.map((tool) => (
                      <Link
                        key={tool.id}
                        href={tool.href}
                        className="block rounded-xl border border-zinc-100 bg-white p-4 transition-all hover:border-brand-200 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-brand-700"
                      >
                        <h3 className="text-base font-medium text-zinc-900 dark:text-white">
                          {highlightMatch(tool.title, debouncedQuery)}
                        </h3>
                        <p className="mt-1 line-clamp-2 text-sm text-zinc-500 dark:text-zinc-400">
                          {highlightMatch(tool.description, debouncedQuery)}
                        </p>
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
