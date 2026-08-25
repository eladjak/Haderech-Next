import Link from "next/link";
import type { ReactNode } from "react";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";

export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-white dark:bg-zinc-950" dir="rtl">
      <Header />
      <main
        id="main-content"
        tabIndex={-1}
        className="container mx-auto max-w-3xl px-4 py-12 sm:py-16"
      >
        <div className="mb-8 border-b border-brand-100 pb-6 dark:border-zinc-800">
          <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-950 dark:bg-amber-300 dark:text-amber-950">
            טיוטה לביקורת ולאישור
          </span>
          <h1 className="mt-4 text-3xl font-bold text-zinc-950 sm:text-4xl dark:text-white">
            {title}
          </h1>
          <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
            עדכון אחרון בטיוטה: {updated}. הנוסח טרם אושר לפרסום סופי.
          </p>
        </div>

        <div className="space-y-8 text-base leading-8 text-zinc-800 dark:text-zinc-200">
          {children}
        </div>

        <div className="mt-10 rounded-2xl border border-brand-100 bg-brand-50/60 p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <p>
            מצאתם טעות או נקודה שדורשת הבהרה? אפשר לפנות דרך{" "}
            <Link className="font-semibold text-brand-700 underline underline-offset-4 dark:text-brand-300" href="/contact">
              עמוד יצירת הקשר
            </Link>
            .
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 text-xl font-bold text-zinc-950 dark:text-white">{title}</h2>
      {children}
    </section>
  );
}
