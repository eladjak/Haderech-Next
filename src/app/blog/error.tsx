"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";

export default function BlogError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Blog error:", error);
  }, [error]);

  return (
    <div className="min-h-dvh bg-background dark:bg-background">
      <Header />
      <main className="container mx-auto flex flex-col items-center justify-center px-4 py-24 text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-100/20">
          <svg className="h-8 w-8 text-brand-600 dark:text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <h1 className="mb-3 text-2xl font-bold text-blue-500 dark:text-white">שגיאה בטעינת הבלוג</h1>
        <p className="mb-8 max-w-md text-blue-500/60 dark:text-zinc-400">לא הצלחנו לטעון את תוכן הבלוג. נסו שוב.</p>
        <div className="flex gap-4">
          <button type="button" onClick={reset} className="rounded-full bg-gradient-to-l from-brand-500 to-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition-all hover:brightness-110">
            נסה שוב
          </button>
          <Link href="/" className="rounded-full border border-brand-200 px-6 py-2.5 text-sm font-semibold text-brand-600 transition-colors hover:bg-brand-50 dark:border-brand-100/30 dark:text-brand-400">
            דף הבית
          </Link>
        </div>
      </main>
    </div>
  );
}
