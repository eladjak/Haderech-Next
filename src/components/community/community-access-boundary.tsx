"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";

export function CommunityAccessBoundary({
  children,
}: {
  children: React.ReactNode;
}) {
  const access = useQuery(api.community.getAccessStatus);

  if (access === undefined) {
    return (
      <main
        className="grid min-h-[60dvh] place-items-center bg-zinc-50 px-6 dark:bg-zinc-950"
        dir="rtl"
        aria-busy="true"
      >
        <p className="text-sm text-zinc-500">בודקים גישה לקהילה…</p>
      </main>
    );
  }

  if (!access.canAccess) {
    return (
      <main
        className="grid min-h-[70dvh] place-items-center bg-zinc-50 px-6 py-16 dark:bg-zinc-950"
        dir="rtl"
      >
        <section className="w-full max-w-xl rounded-3xl border border-zinc-200 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="mb-3 text-4xl" aria-hidden="true">
            🤝
          </p>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
            הקהילה של אומנות הקשר עדיין בהכנה
          </h1>
          <p className="mt-4 leading-7 text-zinc-600 dark:text-zinc-300">
            אנחנו בונים כאן קהילה אחת סביב הספר, הקורס והליווי. לפני שנפתח
            אותה, אנחנו משלימים את כללי הקהילה, המענה, הפרטיות והגישה — כדי
            שזה יהיה מרחב שאפשר באמת לסמוך עליו.
          </p>
          <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
            כרגע הקהילה אינה פתוחה לחשבון הזה. אין צורך לעשות דבר.
          </p>
          <Link
            href="/dashboard"
            className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-600 px-5 py-2.5 font-semibold text-white transition-colors hover:bg-brand-700"
          >
            חזרה ללמידה
          </Link>
        </section>
      </main>
    );
  }

  return <>{children}</>;
}
