"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
    }
  }

  return (
    <footer className="border-t border-brand-100/30 bg-gradient-to-b from-brand-50/30 to-brand-50/10 dark:border-blue-100/10 dark:from-blue-50/5 dark:to-transparent">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand / About */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <Image
                src="/images/omanut-hakesher-icon.png"
                alt="אומנות הקשר"
                width={28}
                height={28}
                className="h-7 w-7"
              />
              <span className="text-xl font-bold bg-gradient-to-l from-brand-500 to-brand-600 bg-clip-text text-transparent dark:from-brand-400 dark:to-brand-300">
                הדרך
              </span>
            </Link>
            <p className="mt-1.5 text-xs font-medium text-blue-500/40 dark:text-zinc-500">
              פרויקט של אומנות הקשר
            </p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-blue-500/50 dark:text-zinc-400">
              תוכנית &quot;הדרך&quot; של אומנות הקשר.
              <br />
              12 שבועות שישנו לך את חיי הזוגיות.
            </p>

            {/* Newsletter */}
            <div className="mt-6">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-blue-500/40 dark:text-zinc-500">
                הישארו מעודכנים
              </p>
              {subscribed ? (
                <p className="text-sm font-medium text-brand-500">
                  תודה! נרשמת בהצלחה
                </p>
              ) : (
                <form
                  onSubmit={handleSubscribe}
                  className="flex max-w-xs gap-2"
                >
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="כתובת אימייל"
                    required
                    className="h-9 flex-1 rounded-full border border-brand-200/50 bg-white/70 px-4 text-sm text-blue-500 placeholder:text-blue-500/30 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20 dark:border-blue-100/20 dark:bg-blue-50/10 dark:text-zinc-300 dark:placeholder:text-zinc-600"
                    dir="ltr"
                  />
                  <button
                    type="submit"
                    className="h-9 rounded-full bg-gradient-to-l from-brand-500 to-brand-600 px-5 text-xs font-semibold text-white transition-all hover:brightness-110"
                  >
                    הרשמה
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-2.5" aria-label="ניווט תחתון">
            <span className="mb-1 text-xs font-semibold uppercase tracking-wider text-blue-500/40 dark:text-zinc-500">
              תוכנית
            </span>
            <FooterLink href="/courses">הקורסים</FooterLink>
            <FooterLink href="/testimonials">עדויות</FooterLink>
            <FooterLink href="/blog">בלוג</FooterLink>
            <FooterLink href="/dashboard">האזור שלי</FooterLink>
            <FooterLink href="/certificates">תעודות</FooterLink>
            <FooterLink href="/student/leaderboard">טבלת מובילים</FooterLink>
          </nav>

          {/* Resources */}
          <nav className="flex flex-col gap-2.5" aria-label="משאבים">
            <span className="mb-1 text-xs font-semibold uppercase tracking-wider text-blue-500/40 dark:text-zinc-500">
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
            <span className="mb-1 text-xs font-semibold uppercase tracking-wider text-blue-500/40 dark:text-zinc-500">
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
            <SocialLink
              href="https://wa.me/972501234567"
              label="ווטסאפ"
              icon={
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347Zm-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884Zm8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
              }
            />

            {/* Omanut HaKesher link */}
            <div className="mt-3 pt-3 border-t border-brand-100/20 dark:border-blue-100/10">
              <FooterLink href="https://omanut-hakesher.co.il">
                אומנות הקשר
              </FooterLink>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center gap-3 border-t border-brand-100/20 pt-6 dark:border-blue-100/10 sm:flex-row sm:justify-between">
          <p className="text-xs text-blue-500/40 dark:text-zinc-500">
            &copy; {currentYear} הדרך - אומנות הקשר. כל הזכויות שמורות.
          </p>
          <p className="flex items-center gap-1.5 text-xs text-blue-500/30 dark:text-zinc-600">
            נבנה עם
            <span className="text-brand-500" aria-label="אהבה">
              &#9829;
            </span>
            באמצעות Next.js &amp; Convex
          </p>
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
      className="text-sm text-blue-500/50 transition-colors hover:text-brand-500 dark:text-zinc-400 dark:hover:text-brand-400"
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
      className="inline-flex items-center gap-2.5 text-sm text-blue-500/50 transition-colors hover:text-brand-500 dark:text-zinc-400 dark:hover:text-brand-400"
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
