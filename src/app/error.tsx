"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <div className="min-h-dvh bg-background dark:bg-background">
      <Header />

      <main className="relative container mx-auto flex flex-col items-center justify-center overflow-hidden px-4 py-24 text-center">
        {/* Decorative background element */}
        <div
          className="pointer-events-none absolute top-1/4 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full opacity-10 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, var(--brand-500) 0%, transparent 70%)",
          }}
          aria-hidden="true"
        />

        {/* Error icon */}
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-bl from-brand-100 to-brand-200 dark:from-brand-100/30 dark:to-brand-200/20">
          <svg
            className="h-10 w-10 text-brand-600 dark:text-brand-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
        </div>

        <h1 className="mb-3 text-3xl font-bold text-blue-500 dark:text-white">
          משהו השתבש
        </h1>

        <p className="mb-10 max-w-md text-lg leading-relaxed text-blue-500/60 dark:text-zinc-400">
          אירעה שגיאה בלתי צפויה. אפשר לנסות לרענן את הדף או לחזור לדף הבית.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-11 items-center rounded-full bg-gradient-to-l from-brand-500 to-brand-600 px-8 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition-all hover:shadow-xl hover:shadow-brand-500/30 hover:brightness-110"
          >
            נסה שוב
          </button>
          <Link
            href="/"
            className="inline-flex h-11 items-center rounded-full border border-brand-200 px-8 text-sm font-semibold text-brand-600 transition-colors hover:bg-brand-50 dark:border-brand-100/30 dark:text-brand-400 dark:hover:bg-brand-100/10"
          >
            דף הבית
          </Link>
        </div>
      </main>
    </div>
  );
}
