"use client";

import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { Header } from "@/components/layout/header";

export default function DashboardPage() {
  const { user } = useUser();

  return (
    <div className="min-h-dvh bg-white dark:bg-zinc-950">
      <Header />

      <main className="container mx-auto px-4 py-12">
        <h1 className="mb-2 text-3xl font-bold text-zinc-900 dark:text-white">
          שלום, {user?.firstName || "משתמש"}!
        </h1>
        <p className="mb-8 text-zinc-600 dark:text-zinc-400">
          ברוך הבא לאזור האישי שלך
        </p>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <DashboardCard
            title="הקורסים שלי"
            value="0"
            description="קורסים פעילים"
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

        <section className="mt-12">
          <h2 className="mb-6 text-2xl font-semibold text-zinc-900 dark:text-white">
            המשך ללמוד
          </h2>
          <div className="rounded-2xl bg-zinc-50 p-8 text-center dark:bg-zinc-900">
            <div className="mb-3 text-4xl text-zinc-300 dark:text-zinc-600">
              &#128218;
            </div>
            <p className="mb-4 text-zinc-600 dark:text-zinc-400">
              עדיין לא נרשמת לקורסים. גלה את הקורסים שלנו והתחל ללמוד!
            </p>
            <Link
              href="/courses"
              className="inline-flex h-10 items-center rounded-full bg-zinc-900 px-6 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
            >
              גלה קורסים
            </Link>
          </div>
        </section>

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
