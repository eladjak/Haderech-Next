"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { SearchButton } from "@/components/layout/search-button";
import { DEMO_MODE } from "@/components/providers/demo-provider";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  // In demo mode, show all signed-in content directly
  const SignedInWrapper = DEMO_MODE ? ({ children }: { children: React.ReactNode }) => <>{children}</> : SignedIn;
  const SignedOutWrapper = DEMO_MODE ? ({ children }: { children: React.ReactNode }) => <span className="hidden">{children}</span> : SignedOut;

  return (
    <header className={`sticky top-0 z-50 w-full border-b transition-all duration-200 ${scrolled ? "border-brand-100/80 bg-white/90 shadow-sm shadow-brand-500/5 dark:border-zinc-700 dark:bg-zinc-950/90" : "border-brand-100/40 bg-white/70 dark:border-zinc-800/60 dark:bg-zinc-950/70"} glass`}>
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/images/haderech-logo-square.jpg"
            alt="הדרך"
            width={40}
            height={40}
            className="h-9 w-9 rounded-lg md:h-10 md:w-10"
            priority
          />
          <div className="flex flex-col">
            <span className="text-base font-bold leading-tight text-blue-500 dark:text-white">הדרך</span>
            <span className="hidden text-[10px] leading-tight text-zinc-400 sm:block dark:text-zinc-500">
              by אומנות הקשר
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="ניווט ראשי">
          <NavLink href="/courses">קורסים</NavLink>
          <NavLink href="/blog">בלוג</NavLink>
          <NavLink href="/pricing">מחירים</NavLink>
          <SignedInWrapper>
            <NavLink href="/dashboard">האזור שלי</NavLink>
            <NavLink href="/daily">יומי</NavLink>
            <NavLink href="/community">קהילה</NavLink>
            <NavLink href="/chat">צ&apos;אט AI</NavLink>
            <NavLink href="/simulator">סימולטור</NavLink>
            <NavLink href="/tools">כלים</NavLink>
            <NavLink href="/mentoring">ייעוץ אישי</NavLink>
          </SignedInWrapper>
        </nav>

        <div className="flex items-center gap-3">
          <SearchButton />
          {DEMO_MODE && (
            <span className="hidden md:inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
              Demo Admin
            </span>
          )}
          <SignedOutWrapper>
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
          </SignedOutWrapper>
          <SignedInWrapper>
            {!DEMO_MODE && <NotificationBell />}
            {!DEMO_MODE && (
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "h-9 w-9 ring-2 ring-brand-100 dark:ring-zinc-700",
                  },
                }}
              />
            )}
          </SignedInWrapper>

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
        className={`border-t border-brand-100/40 bg-white/95 glass px-4 md:hidden dark:border-zinc-800 dark:bg-zinc-950/95 overflow-hidden transition-all duration-200 ease-out ${mobileMenuOpen ? "max-h-[80vh] py-4 opacity-100" : "max-h-0 py-0 opacity-0 pointer-events-none"}`}
      >
          <nav className="flex flex-col gap-1">
            <MobileNavLink href="/search" onClick={closeMobileMenu}>חיפוש</MobileNavLink>
            <MobileNavLink href="/courses" onClick={closeMobileMenu}>קורסים</MobileNavLink>
            <MobileNavLink href="/blog" onClick={closeMobileMenu}>בלוג</MobileNavLink>
            <MobileNavLink href="/pricing" onClick={closeMobileMenu}>מחירים</MobileNavLink>
            <SignedInWrapper>
              <MobileNavLink href="/dashboard" onClick={closeMobileMenu}>האזור שלי</MobileNavLink>
              <MobileNavLink href="/daily" onClick={closeMobileMenu}>תוכן יומי</MobileNavLink>
              <MobileNavLink href="/community" onClick={closeMobileMenu}>קהילה</MobileNavLink>
              <MobileNavLink href="/chat" onClick={closeMobileMenu}>צ&apos;אט AI</MobileNavLink>
              <MobileNavLink href="/simulator" onClick={closeMobileMenu}>סימולטור דייטים</MobileNavLink>
              <MobileNavLink href="/tools" onClick={closeMobileMenu}>כלים</MobileNavLink>
              <MobileNavLink href="/mentoring" onClick={closeMobileMenu}>ייעוץ אישי</MobileNavLink>
              <MobileNavLink href="/notifications" onClick={closeMobileMenu}>התראות</MobileNavLink>
              <MobileNavLink href="/student/dashboard" onClick={closeMobileMenu}>מעקב התקדמות</MobileNavLink>
              <MobileNavLink href="/certificates" onClick={closeMobileMenu}>תעודות</MobileNavLink>
            </SignedInWrapper>
            <SignedOutWrapper>
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
            </SignedOutWrapper>
          </nav>
      </div>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={`relative inline-flex min-h-[44px] items-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 after:absolute after:bottom-1 after:left-1/2 after:h-0.5 after:w-0 after:rounded-full after:bg-brand-500 after:transition-all after:duration-150 hover:after:left-[20%] hover:after:w-[60%] ${isActive ? "bg-brand-50/80 text-brand-700 dark:bg-zinc-800 dark:text-white" : "text-zinc-600 hover:bg-brand-50/80 hover:text-brand-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"}`}
    >
      {children}
    </Link>
  );
}

function MobileNavLink({ href, onClick, children }: { href: string; onClick: () => void; children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={isActive ? "page" : undefined}
      className={`flex min-h-[44px] items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? "bg-brand-50 text-brand-700 dark:bg-zinc-800 dark:text-white" : "text-zinc-700 hover:bg-brand-50 hover:text-brand-700 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"}`}
    >
      {children}
    </Link>
  );
}
