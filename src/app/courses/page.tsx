"use client";

import { useQuery } from "convex/react";
import Link from "next/link";
import { api } from "@/../convex/_generated/api";
import { Header } from "@/components/layout/header";

export default function CoursesPage() {
  const courses = useQuery(api.courses.listPublished);

  return (
    <div className="min-h-dvh bg-white dark:bg-zinc-950">
      <Header />

      <main className="container mx-auto px-4 py-12">
        <h1 className="mb-8 text-3xl font-bold text-zinc-900 dark:text-white">
          הקורסים שלנו
        </h1>

        {courses === undefined ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-64 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-800"
              />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="rounded-2xl bg-zinc-50 p-12 text-center dark:bg-zinc-900">
            <p className="text-lg text-zinc-600 dark:text-zinc-400">
              עדיין אין קורסים זמינים. חזור בקרוב!
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <Link
                key={course._id}
                href={`/courses/${course._id}`}
                className="group rounded-2xl bg-zinc-50 p-6 transition-colors hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800"
              >
                {course.imageUrl && (
                  <div className="mb-4 aspect-video overflow-hidden rounded-xl bg-zinc-200 dark:bg-zinc-800">
                    <img
                      src={course.imageUrl}
                      alt={course.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <h2 className="mb-2 text-xl font-semibold text-zinc-900 group-hover:text-zinc-700 dark:text-white dark:group-hover:text-zinc-200">
                  {course.title}
                </h2>
                <p className="line-clamp-2 text-zinc-600 dark:text-zinc-400">
                  {course.description}
                </p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
