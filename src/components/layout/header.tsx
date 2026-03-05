"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { SearchButton } from "@/components/layout/search-button";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-brand-100/60 bg-white/80 glass dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/images/omanut-hakesher-logo-clean.png"
            alt="הדרך"
            width={120}
            height={40}
            className="h-8 w-auto md:h-10"
            priority
          />
          <span className="hidden text-[10px] text-zinc-400 sm:block dark:text-zinc-500">
            by אומנות הקשר
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="ניווט ראשי">
          <NavLink href="/courses">קורסים</NavLink>
          <NavLink href="/blog">בלוג</NavLink>
          <NavLink href="/pricing">מחירים</NavLink>
          <SignedIn>
            <NavLink href="/dashboard">האזור שלי</NavLink>
            <NavLink href="/community">קהילה</NavLink>
            <NavLink href="/chat">צ&apos;אט AI</NavLink>
            <NavLink href="/simulator">סימולטור</NavLink>
            <NavLink href="/mentoring">ייעוץ אישי</NavLink>
          </SignedIn>
        </nav>

        <div className="flex items-center gap-3">
          <SearchButton />
          <SignedOut>
            <SignInButton mode="modal">
              <button className="hidden rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 hover:bg-zinc-50 md:inline-flex dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800">
                התחברות
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="hidden rounded-lg bg-gradient-to-l from-brand-500 to-brand-600 px-5 py-2 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md hover:brightness-110 md:inline-flex">
                הרשמה חינמית
              </button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <NotificationBell />
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "h-9 w-9 ring-2 ring-brand-100 dark:ring-zinc-700",
                },
              }}
            />
          </SignedIn>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-zinc-600 transition-colors hover:bg-zinc-100 md:hidden dark:text-zinc-400 dark:hover:bg-zinc-800"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav-menu"
            aria-label="תפריט ניווט"
          >
            {mobileMenuOpen ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        id="mobile-nav-menu"
        role="navigation"
        aria-label="תפריט ניווט נייד"
        aria-hidden={!mobileMenuOpen}
        className={`border-t border-zinc-100 bg-white px-4 py-4 md:hidden dark:border-zinc-800 dark:bg-zinc-950 ${!mobileMenuOpen ? "hidden" : ""}`}
      >
          <nav className="flex flex-col gap-1">
            <MobileNavLink href="/search" onClick={closeMobileMenu}>חיפוש</MobileNavLink>
            <MobileNavLink href="/courses" onClick={closeMobileMenu}>קורסים</MobileNavLink>
            <MobileNavLink href="/blog" onClick={closeMobileMenu}>בלוג</MobileNavLink>
            <MobileNavLink href="/pricing" onClick={closeMobileMenu}>מחירים</MobileNavLink>
            <SignedIn>
              <MobileNavLink href="/dashboard" onClick={closeMobileMenu}>האזור שלי</MobileNavLink>
              <MobileNavLink href="/community" onClick={closeMobileMenu}>קהילה</MobileNavLink>
              <MobileNavLink href="/chat" onClick={closeMobileMenu}>צ&apos;אט AI</MobileNavLink>
              <MobileNavLink href="/simulator" onClick={closeMobileMenu}>סימולטור דייטים</MobileNavLink>
              <MobileNavLink href="/mentoring" onClick={closeMobileMenu}>ייעוץ אישי</MobileNavLink>
              <MobileNavLink href="/notifications" onClick={closeMobileMenu}>התראות</MobileNavLink>
              <MobileNavLink href="/student/dashboard" onClick={closeMobileMenu}>מעקב התקדמות</MobileNavLink>
              <MobileNavLink href="/certificates" onClick={closeMobileMenu}>תעודות</MobileNavLink>
            </SignedIn>
            <SignedOut>
              <div className="flex gap-3 pt-3">
                <SignInButton mode="modal">
                  <button className="flex-1 min-h-[44px] rounded-lg border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-white dark:hover:bg-zinc-900">
                    התחברות
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="flex-1 min-h-[44px] rounded-lg bg-gradient-to-l from-brand-500 to-brand-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md">
                    הרשמה
                  </button>
                </SignUpButton>
              </div>
            </SignedOut>
          </nav>
      </div>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-[44px] items-center rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-brand-50 hover:text-brand-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
    >
      {children}
    </Link>
  );
}

function MobileNavLink({ href, onClick, children }: { href: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex min-h-[44px] items-center rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-brand-50 hover:text-brand-700 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
    >
      {children}
    </Link>
  );
}
