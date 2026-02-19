import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="text-lg font-bold text-zinc-900 dark:text-white"
            >
              הדרך
            </Link>
            <nav
              className="flex items-center gap-4"
              aria-label="ניווט תחתון"
            >
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
            </nav>
          </div>

          <p className="text-sm text-zinc-400 dark:text-zinc-500">
            &copy; {currentYear} הדרך. כל הזכויות שמורות.
          </p>
        </div>
      </div>
    </footer>
  );
}
