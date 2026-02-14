"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import Link from "next/link";
import { useState } from "react";
import { api } from "@/../convex/_generated/api";
import { Header } from "@/components/layout/header";

export default function DashboardPage() {
  const { user } = useUser();
  const courses = useQuery(api.courses.listPublished);

  return (
    <div className="min-h-dvh bg-white dark:bg-zinc-950">
      <Header />

      <main className="container mx-auto px-4 py-12">
        <h1 className="mb-2 text-3xl font-bold text-zinc-900 dark:text-white">
          {user?.firstName ? `שלום, ${user.firstName}!` : "שלום!"}
        </h1>
        <p className="mb-8 text-zinc-600 dark:text-zinc-400">
          ברוך הבא לאזור האישי שלך
        </p>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <DashboardCard
            title="קורסים זמינים"
            value={courses ? String(courses.length) : "..."}
            description="קורסים מוכנים ללמידה"
          />
          <DashboardCard
            title="שיעורים שהושלמו"
            value="0"
            description="מתוך 0 שיעורים"
          />
          <DashboardCard
            title="זמן למידה"
            value="0"
            description="שעות החודש"
          />
        </div>

        {/* Available Courses */}
        <section className="mt-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white">
              הקורסים שלנו
            </h2>
            <Link
              href="/courses"
              className="text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            >
              הצג הכל
            </Link>
          </div>

          {courses === undefined ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-48 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-800"
                />
              ))}
            </div>
          ) : courses.length === 0 ? (
            <EmptyCoursesState />
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <Link
                  key={course._id}
                  href={`/courses/${course._id}`}
                  className="group rounded-2xl bg-zinc-50 p-6 transition-colors hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                >
                  {course.imageUrl ? (
                    <div className="mb-4 aspect-video overflow-hidden rounded-xl bg-zinc-200 dark:bg-zinc-800">
                      <img
                        src={course.imageUrl}
                        alt={course.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="mb-4 flex aspect-video items-center justify-center rounded-xl bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-700 dark:to-zinc-800">
                      <span className="text-3xl text-zinc-400 dark:text-zinc-500">
                        &#128218;
                      </span>
                    </div>
                  )}
                  <h3 className="mb-2 text-lg font-semibold text-zinc-900 group-hover:text-zinc-700 dark:text-white dark:group-hover:text-zinc-200">
                    {course.title}
                  </h3>
                  <p className="line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
                    {course.description}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Continue Learning / CTA */}
        <section className="mt-12">
          <h2 className="mb-6 text-2xl font-semibold text-zinc-900 dark:text-white">
            המשך ללמוד
          </h2>
          <div className="rounded-2xl bg-zinc-50 p-8 text-center dark:bg-zinc-900">
            <div className="mb-3 text-4xl text-zinc-300 dark:text-zinc-600">
              &#128640;
            </div>
            <p className="mb-4 text-zinc-600 dark:text-zinc-400">
              הירשם לקורס והתחל את מסע הלמידה שלך!
            </p>
            <Link
              href="/courses"
              className="inline-flex h-10 items-center rounded-full bg-zinc-900 px-6 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
            >
              גלה קורסים
            </Link>
          </div>
        </section>

        {/* Achievements */}
        <section className="mt-12">
          <h2 className="mb-6 text-2xl font-semibold text-zinc-900 dark:text-white">
            הישגים אחרונים
          </h2>
          <div className="rounded-2xl bg-zinc-50 p-8 text-center dark:bg-zinc-900">
            <p className="text-zinc-600 dark:text-zinc-400">
              השלם שיעורים כדי לקבל הישגים ותעודות.
            </p>
          </div>
        </section>

        {/* Dev: Seed Data Tool */}
        {process.env.NODE_ENV === "development" && (
          <section className="mt-12 border-t border-dashed border-zinc-300 pt-8 dark:border-zinc-700">
            <SeedDataTool />
          </section>
        )}
      </main>
    </div>
  );
}

function DashboardCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl bg-zinc-50 p-6 dark:bg-zinc-900">
      <p className="mb-1 text-sm font-medium text-zinc-500 dark:text-zinc-400">
        {title}
      </p>
      <p className="mb-1 text-3xl font-bold text-zinc-900 dark:text-white">
        {value}
      </p>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">{description}</p>
    </div>
  );
}

function EmptyCoursesState() {
  return (
    <div className="rounded-2xl bg-zinc-50 p-12 text-center dark:bg-zinc-900">
      <div className="mb-3 text-4xl text-zinc-300 dark:text-zinc-600">
        &#128218;
      </div>
      <p className="mb-2 text-lg font-medium text-zinc-700 dark:text-zinc-300">
        עדיין אין קורסים במערכת
      </p>
      <p className="mb-4 text-zinc-500 dark:text-zinc-400">
        קורסים יתווספו בקרוב. בינתיים, תוכל להשתמש בכלי יצירת הנתונים למטה
        (במצב פיתוח).
      </p>
    </div>
  );
}

function SeedDataTool() {
  const seedCourses = useMutation(api.seed.seedCourses);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSeed() {
    setLoading(true);
    setStatus(null);
    try {
      const result = await seedCourses();
      setStatus(result.message);
    } catch (err) {
      setStatus(
        `Error: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-dashed border-amber-300 bg-amber-50 p-6 dark:border-amber-700 dark:bg-amber-950/30">
      <div className="mb-2 flex items-center gap-2">
        <span className="text-sm font-bold text-amber-800 dark:text-amber-300">
          [DEV] כלי פיתוח
        </span>
      </div>
      <p className="mb-4 text-sm text-amber-700 dark:text-amber-400">
        יצירת נתוני דוגמה: 3 קורסים עם 16 שיעורים בסך הכל (אומנות ההקשבה,
        תקשורת זוגית מתקדמת, מפתחות לאינטימיות).
      </p>
      <button
        type="button"
        onClick={handleSeed}
        disabled={loading}
        className="inline-flex h-9 items-center rounded-lg bg-amber-600 px-4 text-sm font-medium text-white transition-colors hover:bg-amber-700 disabled:opacity-50 dark:bg-amber-700 dark:hover:bg-amber-600"
      >
        {loading ? "יוצר נתונים..." : "צור נתוני דוגמה"}
      </button>
      {status && (
        <p className="mt-3 text-sm text-amber-800 dark:text-amber-300">
          {status}
        </p>
      )}
    </div>
  );
}
