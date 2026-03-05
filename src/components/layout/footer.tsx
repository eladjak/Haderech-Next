import Link from "next/link";
import Image from "next/image";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-brand-100/30 bg-brand-50/20 dark:border-blue-100/10 dark:bg-blue-50/5">
      <div className="container mx-auto px-4 py-10">
        <div className="grid gap-8 sm:grid-cols-4">
          {/* Brand */}
          <div>
            <Link href="/" className="inline-flex items-center gap-2.5">
              <Image
                src="/images/omanut-hakesher-icon.png"
                alt="אומנות הקשר"
                width={24}
                height={24}
                className="h-6 w-6"
              />
              <span className="text-lg font-bold bg-gradient-to-l from-brand-500 to-brand-600 bg-clip-text text-transparent dark:from-brand-400 dark:to-brand-300">
                הדרך
              </span>
            </Link>
            <p className="mt-2 text-xs font-medium text-blue-500/40 dark:text-zinc-500">
              פרויקט של אומנות הקשר
            </p>
            <p className="mt-2 text-sm leading-relaxed text-blue-500/50 dark:text-zinc-400">
              תוכנית &quot;הדרך&quot; של אומנות הקשר.
              <br />
              12 שבועות שישנו לך את חיי הזוגיות.
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-2.5" aria-label="ניווט תחתון">
            <span className="mb-1 text-xs font-semibold uppercase tracking-wider text-blue-500/40 dark:text-zinc-500">
              תוכנית
            </span>
            <FooterLink href="/courses">הקורסים</FooterLink>
            <FooterLink href="/blog">בלוג</FooterLink>
            <FooterLink href="/dashboard">האזור שלי</FooterLink>
            <FooterLink href="/certificates">תעודות</FooterLink>
            <FooterLink href="/student/leaderboard">טבלת מובילים</FooterLink>
          </nav>

          {/* Tools */}
          <nav className="flex flex-col gap-2.5" aria-label="כלים">
            <span className="mb-1 text-xs font-semibold uppercase tracking-wider text-blue-500/40 dark:text-zinc-500">
              כלים
            </span>
            <FooterLink href="/chat">צ&apos;אט AI</FooterLink>
            <FooterLink href="/simulator">סימולטור דייטים</FooterLink>
            <FooterLink href="/resources">ספרייה</FooterLink>
            <FooterLink href="/tools">כלי דייטינג</FooterLink>
          </nav>

          {/* Info */}
          <nav className="flex flex-col gap-2.5" aria-label="מידע">
            <span className="mb-1 text-xs font-semibold uppercase tracking-wider text-blue-500/40 dark:text-zinc-500">
              מידע
            </span>
            <FooterLink href="/about">אודות</FooterLink>
            <FooterLink href="/help">עזרה</FooterLink>
            <FooterLink href="/contact">צרו קשר</FooterLink>
            <FooterLink href="https://omanut-hakesher.co.il">אומנות הקשר</FooterLink>
          </nav>
        </div>

        <div className="mt-10 border-t border-brand-100/20 pt-6 dark:border-blue-100/10">
          <p className="text-center text-xs text-blue-500/40 dark:text-zinc-500">
            &copy; {currentYear} הדרך - אומנות הקשר. כל הזכויות שמורות.
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
      className="text-sm text-blue-500/50 transition-colors hover:text-brand-500 dark:text-zinc-400 dark:hover:text-brand-400"
    >
      {children}
    </Link>
  );
}
