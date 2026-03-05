"use client";

import { useState, useEffect } from "react";
import { usePushNotifications } from "@/hooks/usePushNotifications";

const STORAGE_KEY_VIEWS = "haderech_push_prompt_views";
const STORAGE_KEY_DISMISSALS = "haderech_push_prompt_dismissals";
const STORAGE_KEY_LAST_SEEN = "haderech_push_prompt_last_seen";

const SHOW_AFTER_VIEWS = 3;
const MAX_DISMISSALS = 3;
const SHOW_AFTER_MS = 2 * 60 * 1000; // 2 minutes

export function PushPrompt() {
  const [visible, setVisible] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const { isSupported, isSubscribed, permission, subscribe, isLoading } =
    usePushNotifications();

  useEffect(() => {
    // אין טעם להציג אם:
    // - הדפדפן לא תומך
    // - כבר רשום
    // - ההרשאה חסומה
    // - כבר הוצג ונדחה MAX_DISMISSALS פעמים
    if (!isSupported || isSubscribed || permission === "granted" || permission === "denied") {
      return;
    }

    const dismissals = Number(localStorage.getItem(STORAGE_KEY_DISMISSALS) ?? "0");
    if (dismissals >= MAX_DISMISSALS) return;

    // עדכן מונה צפיות
    const views = Number(localStorage.getItem(STORAGE_KEY_VIEWS) ?? "0") + 1;
    localStorage.setItem(STORAGE_KEY_VIEWS, String(views));

    const firstSeenStr = localStorage.getItem(STORAGE_KEY_LAST_SEEN);
    if (!firstSeenStr) {
      localStorage.setItem(STORAGE_KEY_LAST_SEEN, String(Date.now()));
    }

    const firstSeen = Number(localStorage.getItem(STORAGE_KEY_LAST_SEEN) ?? Date.now());
    const elapsedMs = Date.now() - firstSeen;

    const shouldShow = views >= SHOW_AFTER_VIEWS || elapsedMs >= SHOW_AFTER_MS;

    if (!shouldShow) return;

    // הצג אחרי קצת עיכוב
    const timer = setTimeout(() => {
      setVisible(true);
      requestAnimationFrame(() => setAnimateIn(true));
    }, 800);

    return () => clearTimeout(timer);
  }, [isSupported, isSubscribed, permission]);

  const handleEnable = async () => {
    try {
      await subscribe();
      dismiss(false);
    } catch {
      // המשתמש דחה את הבקשה - dismiss silently
      dismiss(true);
    }
  };

  const dismiss = (incrementCounter: boolean) => {
    if (incrementCounter) {
      const current = Number(localStorage.getItem(STORAGE_KEY_DISMISSALS) ?? "0");
      localStorage.setItem(STORAGE_KEY_DISMISSALS, String(current + 1));
    }
    setAnimateIn(false);
    setTimeout(() => setVisible(false), 300);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-labelledby="push-prompt-title"
      aria-describedby="push-prompt-desc"
      className={`fixed bottom-6 right-6 z-50 w-full max-w-sm transition-all duration-300 ${
        animateIn
          ? "translate-y-0 opacity-100"
          : "translate-y-4 opacity-0"
      }`}
    >
      <div className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
        {/* Header bar with gradient */}
        <div className="h-1 w-full bg-gradient-to-l from-brand-400 to-brand-600" />

        <div className="p-5">
          {/* Icon + dismiss */}
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-xl dark:bg-brand-950">
              🔔
            </div>
            <button
              type="button"
              aria-label="סגור"
              onClick={() => dismiss(true)}
              className="rounded-full p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          <p
            id="push-prompt-title"
            className="mb-1 text-sm font-semibold text-zinc-900 dark:text-white"
          >
            הפעילו התראות כדי לא לפספס שיעורים חדשים
          </p>
          <p
            id="push-prompt-desc"
            className="mb-4 text-xs text-zinc-500 dark:text-zinc-400"
          >
            קבלו עדכון מיידי כשמתפרסם שיעור חדש, כשתזכו בהישג, או כשיש תגובה
            לפוסט שלכם.
          </p>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleEnable}
              disabled={isLoading}
              className="flex-1 rounded-full bg-gradient-to-l from-brand-500 to-brand-700 px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? "מגדיר..." : "הפעל התראות"}
            </button>
            <button
              type="button"
              onClick={() => dismiss(true)}
              className="rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              אולי אחר כך
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
