import Link from "next/link";
import { Header } from "@/components/layout/header";

export default function NotFound() {
  return (
    <div className="min-h-dvh bg-white dark:bg-zinc-950">
      <Header />

      <main className="container mx-auto flex flex-col items-center justify-center px-4 py-24 text-center">
        <p className="mb-2 text-6xl font-bold text-zinc-200 dark:text-zinc-800">
          404
        </p>
        <h1 className="mb-3 text-2xl font-bold text-zinc-900 dark:text-white">
          הדף לא נמצא
        </h1>
        <p className="mb-8 max-w-md text-zinc-600 dark:text-zinc-400">
          הדף שחיפשת לא קיים, הועבר, או שאין לך הרשאות לצפות בו.
        </p>
        <div className="flex gap-3">
          <Link
            href="/"
            className="inline-flex h-10 items-center rounded-full bg-zinc-900 px-6 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
          >
            דף הבית
          </Link>
          <Link
            href="/courses"
            className="inline-flex h-10 items-center rounded-full border border-zinc-300 px-6 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            הקורסים שלנו
          </Link>
        </div>
      </main>
    </div>
  );
}
