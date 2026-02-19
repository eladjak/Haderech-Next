import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 sm:grid-cols-3">
          {/* Brand */}
          <div>
            <Link
              href="/"
              className="text-lg font-bold text-zinc-900 dark:text-white"
            >
              הדרך
            </Link>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              פלטפורמת למידה מובילה בעברית
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-2" aria-label="ניווט תחתון">
            <span className="mb-1 text-sm font-medium text-zinc-900 dark:text-white">
              ניווט
            </span>
            <Link
              href="/courses"
              className="text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            >
              קורסים
            </Link>
            <Link
              href="/dashboard"
              className="text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            >
              האזור שלי
            </Link>
            <Link
              href="/certificates"
              className="text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            >
              תעודות
            </Link>
          </nav>

          {/* Info */}
          <nav className="flex flex-col gap-2" aria-label="מידע">
            <span className="mb-1 text-sm font-medium text-zinc-900 dark:text-white">
              מידע
            </span>
            <Link
              href="/about"
              className="text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            >
              אודות
            </Link>
            <Link
              href="/help"
              className="text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            >
              עזרה
            </Link>
            <Link
              href="/contact"
              className="text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            >
              צרו קשר
            </Link>
          </nav>
        </div>

        <div className="mt-8 border-t border-zinc-200 pt-6 dark:border-zinc-800">
          <p className="text-center text-sm text-zinc-400 dark:text-zinc-500">
            &copy; {currentYear} הדרך. כל הזכויות שמורות.
          </p>
        </div>
      </div>
    </footer>
  );
}
