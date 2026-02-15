"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import Link from "next/link";
import { useState } from "react";
import { api } from "@/../convex/_generated/api";
import { Header } from "@/components/layout/header";
import { CourseCard } from "@/components/course/course-card";

export default function DashboardPage() {
  const { user } = useUser();
  const courses = useQuery(api.courses.listPublished);

  // Get Convex user
  const convexUser = useQuery(
    api.users.getByClerkId,
    user?.id ? { clerkId: user.id } : "skip"
  );

  // Get enrolled courses
  const enrolledCourses = useQuery(
    api.enrollments.listByUser,
    convexUser?._id ? { userId: convexUser._id } : "skip"
  );

  // Get certificates
  const certificates = useQuery(
    api.certificates.listByUser,
    convexUser?._id ? { userId: convexUser._id } : "skip"
  );

  const enrolledCount = enrolledCourses?.length ?? 0;
  const certificateCount = certificates?.length ?? 0;

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
        <div className="grid gap-6 md:grid-cols-3">
          <DashboardCard
            title="קורסים זמינים"
            value={courses ? String(courses.length) : "..."}
            description="קורסים מוכנים ללמידה"
            href="/courses"
          />
          <DashboardCard
            title="קורסים רשומים"
            value={String(enrolledCount)}
            description="קורסים שנרשמת אליהם"
            href="/courses"
          />
          <DashboardCard
            title="תעודות"
            value={String(certificateCount)}
            description="תעודות סיום שהונפקו"
            href="/certificates"
          />
        </div>

        {/* Enrolled Courses Section */}
        {enrolledCourses && enrolledCourses.length > 0 && (
          <section className="mt-12">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white">
                הקורסים שלי
              </h2>
              <Link
                href="/courses"
                className="text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
              >
                הצג הכל
              </Link>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {enrolledCourses.map((course) => (
                <CourseCard
                  key={course._id}
                  id={course._id}
                  title={course.title}
                  description={course.description}
                  imageUrl={course.imageUrl}
                  enrolled
                />
              ))}
            </div>
          </section>
        )}

        {/* Available Courses */}
        <section className="mt-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white">
              {enrolledCourses && enrolledCourses.length > 0
                ? "קורסים נוספים"
                : "הקורסים שלנו"}
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
        </section>

        {/* Continue Learning / CTA */}
        {enrolledCount === 0 && (
          <section className="mt-12">
            <div className="rounded-2xl bg-zinc-50 p-8 text-center dark:bg-zinc-900">
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
                  d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5"
                />
              </svg>
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
        )}

        {/* Certificates preview */}
        {certificateCount > 0 && (
          <section className="mt-12">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white">
                התעודות שלי
              </h2>
              <Link
                href="/certificates"
                className="text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
              >
                הצג הכל
              </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {certificates?.slice(0, 2).map((cert) => (
                <div
                  key={cert._id}
                  className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <p className="mb-1 text-sm font-medium text-zinc-900 dark:text-white">
                    {cert.courseName}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    הונפקה:{" "}
                    {new Intl.DateTimeFormat("he-IL").format(
                      new Date(cert.issuedAt)
                    )}
                  </p>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500">
                    {cert.certificateNumber}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

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
  href,
}: {
  title: string;
  value: string;
  description: string;
  href?: string;
}) {
  const content = (
    <div className="rounded-2xl bg-zinc-50 p-6 transition-colors hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800">
      <p className="mb-1 text-sm font-medium text-zinc-500 dark:text-zinc-400">
        {title}
      </p>
      <p className="mb-1 text-3xl font-bold text-zinc-900 dark:text-white">
        {value}
      </p>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">{description}</p>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}

function EmptyCoursesState() {
  return (
    <div className="rounded-2xl bg-zinc-50 p-12 text-center dark:bg-zinc-900">
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
          d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
        />
      </svg>
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
