import Link from "next/link";
import { Header } from "@/components/layout/header";

export default function NotFound() {
  return (
    <div className="min-h-dvh bg-background dark:bg-background">
      <Header />

      <main className="relative container mx-auto flex flex-col items-center justify-center overflow-hidden px-4 py-24 text-center">
        {/* Decorative background elements */}
        <div
          className="pointer-events-none absolute -top-24 right-1/4 h-72 w-72 rounded-full opacity-20 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, var(--brand-300) 0%, transparent 70%)",
          }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-16 left-1/3 h-56 w-56 rounded-full opacity-15 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, var(--accent-300) 0%, transparent 70%)",
          }}
          aria-hidden="true"
        />

        {/* 404 number */}
        <p className="mb-4 text-[10rem] font-black leading-none tracking-tight bg-gradient-to-l from-brand-500 via-brand-400 to-accent-400 bg-clip-text text-transparent select-none sm:text-[12rem]">
          404
        </p>

        <h1 className="mb-3 text-3xl font-bold text-blue-500 dark:text-white">
          הדף לא נמצא
        </h1>

        <p className="mb-10 max-w-md text-lg leading-relaxed text-blue-500/60 dark:text-zinc-400">
          הדף שחיפשת לא קיים או שהוזז למקום אחר
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/"
            className="inline-flex h-11 items-center rounded-full bg-gradient-to-l from-brand-500 to-brand-600 px-8 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition-all hover:shadow-xl hover:shadow-brand-500/30 hover:brightness-110"
          >
            חזרה לדף הבית
          </Link>
          <Link
            href="/courses"
            className="inline-flex h-11 items-center rounded-full border border-brand-200 px-8 text-sm font-semibold text-brand-600 transition-colors hover:bg-brand-50 dark:border-brand-100/30 dark:text-brand-400 dark:hover:bg-brand-100/10"
          >
            לקורסים
          </Link>
        </div>
      </main>
    </div>
  );
}
