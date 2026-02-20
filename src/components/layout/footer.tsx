import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-zinc-100 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/50">
      <div className="container mx-auto px-4 py-10">
        <div className="grid gap-8 sm:grid-cols-3">
          {/* Brand */}
          <div>
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600">
                <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
              </div>
              <span className="text-lg font-bold bg-gradient-to-l from-indigo-600 to-violet-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-violet-400">
                הדרך
              </span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
              פלטפורמת למידה מובילה בעברית.
              <br />
              למד, התקדם, הצלח.
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-2.5" aria-label="ניווט תחתון">
            <span className="mb-1 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              ניווט
            </span>
            <FooterLink href="/courses">קורסים</FooterLink>
            <FooterLink href="/dashboard">האזור שלי</FooterLink>
            <FooterLink href="/certificates">תעודות</FooterLink>
          </nav>

          {/* Info */}
          <nav className="flex flex-col gap-2.5" aria-label="מידע">
            <span className="mb-1 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              מידע
            </span>
            <FooterLink href="/about">אודות</FooterLink>
            <FooterLink href="/help">עזרה</FooterLink>
            <FooterLink href="/contact">צרו קשר</FooterLink>
          </nav>
        </div>

        <div className="mt-10 border-t border-zinc-200/60 pt-6 dark:border-zinc-800">
          <p className="text-center text-xs text-zinc-400 dark:text-zinc-500">
            &copy; {currentYear} הדרך. כל הזכויות שמורות.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-sm text-zinc-500 transition-colors hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400"
    >
      {children}
    </Link>
  );
}
