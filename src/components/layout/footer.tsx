"use client";

import Link from "next/link";
import Image from "next/image";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-brand-100 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand / About */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex min-h-11 items-center gap-2.5">
              <Image
                src="/images/omanut-hakesher-icon.png"
                alt="אומנות הקשר"
                width={28}
                height={28}
                className="h-7 w-7"
              />
              <span className="text-xl font-bold text-brand-700 dark:text-brand-300">
                הדרך
              </span>
            </Link>
            <p className="mt-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400">
              פרויקט של אומנות הקשר
            </p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
              תוכנית &quot;הדרך&quot; של אומנות הקשר.
              <br />
              12 שבועות, 6 שלבים, 75 שיעורים ו-8 מסמכי PDF לתרגול.
            </p>

          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-2.5" aria-label="ניווט תחתון">
            <span className="mb-1 text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
              תוכנית
            </span>
            <FooterLink href="/courses">הקורסים</FooterLink>
            <FooterLink href="/testimonials">עדויות</FooterLink>
            <FooterLink href="/blog">בלוג</FooterLink>
            <FooterLink href="/dashboard">האזור שלי</FooterLink>
            <FooterLink href="/certificates">תעודות</FooterLink>
            <FooterLink href="/community/leaderboard">
              התקדמות אישית
            </FooterLink>
          </nav>

          {/* Resources */}
          <nav className="flex flex-col gap-2.5" aria-label="משאבים">
            <span className="mb-1 text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
              משאבים
            </span>
            <FooterLink href="/chat">צ&apos;אט AI</FooterLink>
            <FooterLink href="/simulator">סימולטור דייטים</FooterLink>
            <FooterLink href="/resources">ספרייה</FooterLink>
            <FooterLink href="/about">אודות</FooterLink>
            <FooterLink href="/help">עזרה</FooterLink>
            <FooterLink href="/contact">צרו קשר</FooterLink>
          </nav>

          {/* Social */}
          <div className="flex flex-col gap-2.5">
            <span className="mb-1 text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
              עקבו אחרינו
            </span>
            <SocialLink
              href="https://www.instagram.com/omanut_hakesher"
              label="אינסטגרם"
              icon={
                <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5a4.25 4.25 0 0 0 4.25-4.25v-8.5A4.25 4.25 0 0 0 16.25 3.5h-8.5ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm5.25-2.5a1 1 0 1 1 0 2 1 1 0 0 1 0-2Z" />
              }
            />
            <SocialLink
              href="https://www.facebook.com/omanuthakesher"
              label="פייסבוק"
              icon={
                <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12Z" />
              }
            />
            <SocialLink
              href="https://www.youtube.com/@omanuthakesher"
              label="יוטיוב"
              icon={
                <path d="M21.543 6.498C22 8.28 22 12 22 12s0 3.72-.457 5.502c-.254.985-.997 1.76-1.938 2.022C17.896 20 12 20 12 20s-5.893 0-7.605-.476c-.945-.266-1.687-1.04-1.938-2.022C2 15.72 2 12 2 12s0-3.72.457-5.502c.254-.985.997-1.76 1.938-2.022C6.107 4 12 4 12 4s5.896 0 7.605.476c.945.266 1.687 1.04 1.938 2.022ZM10 15.5l6-3.5-6-3.5v7Z" />
              }
            />
            {/* Omanut HaKesher link */}
            <div className="mt-3 border-t border-brand-100 pt-3 dark:border-zinc-800">
              <FooterLink href="https://www.ohlove.co.il">
                אומנות הקשר
              </FooterLink>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center gap-3 border-t border-brand-100 pt-6 dark:border-zinc-800 sm:flex-row sm:justify-between">
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            &copy; {currentYear} הדרך - אומנות הקשר. כל הזכויות שמורות.
          </p>
          <nav className="flex flex-wrap items-center justify-center gap-x-4" aria-label="מידע משפטי ונגישות">
            <FooterLink href="/privacy">פרטיות</FooterLink>
            <FooterLink href="/terms">תנאי שימוש</FooterLink>
            <FooterLink href="/accessibility">נגישות</FooterLink>
          </nav>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-11 items-center text-sm text-zinc-700 transition-colors hover:text-brand-700 focus-visible:text-brand-700 dark:text-zinc-300 dark:hover:text-brand-300 dark:focus-visible:text-brand-300"
    >
      {children}
    </Link>
  );
}

function SocialLink({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex min-h-11 items-center gap-2.5 text-sm text-zinc-700 transition-colors hover:text-brand-700 focus-visible:text-brand-700 dark:text-zinc-300 dark:hover:text-brand-300 dark:focus-visible:text-brand-300"
      aria-label={label}
    >
      <svg
        className="h-4.5 w-4.5 shrink-0"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        {icon}
      </svg>
      {label}
    </a>
  );
}
