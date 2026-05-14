"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "haderech_cookie_consent_v1";

type ConsentValue = "accepted" | "essential_only" | null;

export function getStoredConsent(): ConsentValue {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem(STORAGE_KEY);
  if (v === "accepted" || v === "essential_only") return v;
  return null;
}

export function CookieConsent() {
  const [consent, setConsent] = useState<ConsentValue>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setConsent(getStoredConsent());
  }, []);

  function handleSet(value: "accepted" | "essential_only") {
    window.localStorage.setItem(STORAGE_KEY, value);
    setConsent(value);
    if (value === "accepted") {
      // notify any listeners (e.g. GA loader) that consent changed
      window.dispatchEvent(new CustomEvent("cookie-consent-accepted"));
    }
  }

  if (!mounted || consent !== null) return null;

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-desc"
      className="fixed bottom-4 right-4 left-4 z-50 mx-auto max-w-2xl rounded-2xl border border-zinc-200 bg-white p-5 shadow-2xl dark:border-zinc-700 dark:bg-zinc-900 sm:p-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
        <div className="flex-1">
          <h2
            id="cookie-consent-title"
            className="mb-2 text-base font-bold text-zinc-900 dark:text-white"
          >
            עוגיות באתר
          </h2>
          <p
            id="cookie-consent-desc"
            className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400"
          >
            אנו משתמשים בעוגיות חיוניות להפעלת האתר, ובעוגיות ניתוח (Google
            Analytics) שעוזרות לנו להבין כיצד משתמשים באתר. אתה יכול לבחור.
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => handleSet("essential_only")}
            className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
          >
            רק חיוניות
          </button>
          <button
            type="button"
            onClick={() => handleSet("accepted")}
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-600 hover:shadow-md"
          >
            אני מסכים להכל
          </button>
        </div>
      </div>
    </div>
  );
}
