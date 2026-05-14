"use client";

import { useEffect, useState } from "react";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import { Header } from "@/components/layout/header";
import { CoachChat } from "@/components/chat/coach-chat";

// =====================================================================
// Chat Page (Phase 80) - simplified shell around the new CoachChat.
// =====================================================================

const ONBOARDING_KEY = "haderech.coach.onboardingDismissed";

export default function ChatPage() {
  return (
    <>
      <SignedIn>
        <ChatPageContent />
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}

function ChatPageContent() {
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Read localStorage on mount (client-only)
  useEffect(() => {
    try {
      const dismissed = window.localStorage.getItem(ONBOARDING_KEY);
      if (!dismissed) setShowOnboarding(true);
    } catch {
      // localStorage might be unavailable (private mode) - default to no onboarding
    }
  }, []);

  const dismissOnboarding = () => {
    try {
      window.localStorage.setItem(ONBOARDING_KEY, "1");
    } catch {
      // ignore
    }
    setShowOnboarding(false);
  };

  return (
    <div className="flex h-dvh flex-col bg-[var(--background)]">
      <Header />

      <main className="flex flex-1 flex-col overflow-hidden" dir="rtl">
        {showOnboarding && <OnboardingBanner onDismiss={dismissOnboarding} />}
        <div className="flex-1 overflow-hidden">
          <CoachChat />
        </div>
      </main>
    </div>
  );
}

// ---------------------------------------------------------------------
// Minimal one-time onboarding banner
// ---------------------------------------------------------------------
function OnboardingBanner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div
      className="border-b border-blue-100/30 bg-gradient-to-l from-blue-50/70 to-brand-50/40 px-4 py-3 dark:border-zinc-700/50 dark:from-zinc-800/40 dark:to-zinc-800/40"
      dir="rtl"
      role="region"
      aria-label="ברוך הבא"
    >
      <div className="mx-auto flex max-w-3xl items-start gap-3">
        <div
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-sm"
          aria-hidden="true"
        >
          ✨
        </div>
        <div className="flex-1 text-sm text-blue-700 dark:text-zinc-200">
          <p className="font-semibold">דבר איתי על מה שמטריד אותך.</p>
          <p className="mt-0.5 text-xs text-blue-500/70 dark:text-zinc-400">
            אני מאמן בגישת אומנות הקשר. אני מקשיב, שואל, ולפעמים נותן כיוון - רק
            כשמבקשים. אם חזרת מדייט - לחץ על &quot;חזרתי מדייט&quot;.
          </p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-md px-2 py-1 text-xs text-blue-500/60 hover:bg-blue-100/50 dark:text-zinc-400 dark:hover:bg-zinc-700"
          aria-label="סגור הסבר"
        >
          הבנתי
        </button>
      </div>
    </div>
  );
}
