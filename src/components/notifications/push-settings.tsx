"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { usePushNotifications } from "@/hooks/usePushNotifications";

// ─── Category toggles ────────────────────────────────────────

interface PushCategory {
  key: string;
  label: string;
  description: string;
}

const PUSH_CATEGORIES: PushCategory[] = [
  {
    key: "learningReminders",
    label: "הודעות למידה",
    description: "תזכורות לשיעורים ויעדי הלמידה שלכם",
  },
  {
    key: "courseUpdates",
    label: "עדכוני קורס",
    description: "כשמתפרסמים שיעורים חדשים בקורסים שלכם",
  },
  {
    key: "achievements",
    label: "הישגים",
    description: "כשתזכו בתג חדש או תשיגו אבן דרך",
  },
  {
    key: "communityMessages",
    label: "הודעות קהילה",
    description: "תגובות לפוסטים שלכם ופעילות קהילתית",
  },
];

// ─── Sub-components ───────────────────────────────────────────

function PermissionBadge({ permission }: { permission: string }) {
  if (permission === "granted") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        פעיל
      </span>
    );
  }
  if (permission === "denied") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700 dark:bg-red-950 dark:text-red-400">
        <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
        חסום
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
      <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
        לא הוגדר
    </span>
  );
}

function Toggle({
  checked,
  onChange,
  disabled,
  label,
}: {
  checked: boolean;
  onChange: (val: boolean) => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
        checked
          ? "bg-brand-600 dark:bg-brand-500"
          : "bg-zinc-200 dark:bg-zinc-700"
      }`}
    >
      <span
        className={`pointer-events-none mt-0.5 inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
          checked ? "-translate-x-5" : "-translate-x-0.5"
        }`}
      />
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────

export function PushSettings() {
  const { isSupported, isSubscribed, permission, isLoading, subscribe, unsubscribe, sendTestNotification } =
    usePushNotifications();

  const [categories, setCategories] = useState<Record<string, boolean>>({
    learningReminders: true,
    courseUpdates: true,
    achievements: true,
    communityMessages: false,
  });

  const [isSavingCategories, setIsSavingCategories] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleToggleSubscription = async () => {
    try {
      if (isSubscribed) {
        await unsubscribe();
        showSuccess("ההתראות בוטלו בהצלחה");
      } else {
        await subscribe();
        if (permission === "denied") return; // user blocked
        showSuccess("ההתראות הופעלו בהצלחה!");
      }
    } catch {
      // שגיאה מוצגת בממשק (isLoading=false + no state change)
    }
  };

  const updatePrefs = useMutation(api.preferences.updatePreferences);

  const handleSaveCategories = async () => {
    setIsSavingCategories(true);
    try {
      await updatePrefs({
        courseReminders: categories.learningReminders || categories.courseUpdates,
        achievementAlerts: categories.achievements,
      });
      showSuccess("הגדרות הקטגוריות נשמרו");
    } catch {
      // Save failed silently - UI state remains unchanged
    }
    setIsSavingCategories(false);
  };

  // דפדפן לא תומך בהתראות push
  if (!isSupported) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/40 dark:bg-amber-950/30">
        <div className="flex gap-3">
          <span className="text-xl" aria-hidden="true">⚠️</span>
          <div>
            <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
              הדפדפן שלכם אינו תומך בהתראות Push
            </p>
            <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">
              כדי לקבל התראות, השתמשו בדפדפן מודרני כגון Chrome, Firefox, Edge
              או Safari 16.4+.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Success message */}
      {successMessage && (
        <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
          {successMessage}
        </div>
      )}

      {/* Main toggle row */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-zinc-900 dark:text-white">
              התראות Push
            </p>
            <PermissionBadge permission={permission} />
          </div>
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
            {isSubscribed
              ? "אתם מקבלים התראות מהדרך נקסט"
              : "הפעילו כדי לקבל התראות בזמן אמת"}
          </p>
        </div>
        <Toggle
          checked={isSubscribed}
          onChange={handleToggleSubscription}
          disabled={isLoading || permission === "denied"}
          label="הפעלת התראות push"
        />
      </div>

      {/* Blocked state */}
      {permission === "denied" && (
        <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400">
          <strong>ההתראות חסומות בדפדפן.</strong> כדי להפעיל: לחצו על סמל המנעול
          בשורת הכתובת ← הגדרות אתר ← התראות ← אפשר.
        </div>
      )}

      {/* Category toggles - only when subscribed */}
      {isSubscribed && (
        <div className="space-y-4 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            סוגי התראות
          </p>
          <div className="space-y-3">
            {PUSH_CATEGORIES.map((cat) => (
              <div
                key={cat.key}
                className="flex items-center justify-between gap-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-zinc-900 dark:text-white">
                    {cat.label}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {cat.description}
                  </p>
                </div>
                <Toggle
                  checked={categories[cat.key] ?? false}
                  onChange={(val) =>
                    setCategories((prev) => ({ ...prev, [cat.key]: val }))
                  }
                  label={cat.label}
                />
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={handleSaveCategories}
            disabled={isSavingCategories}
            className="h-9 rounded-full bg-zinc-900 px-6 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
          >
            {isSavingCategories ? "שומר..." : "שמור העדפות קטגוריות"}
          </button>
        </div>
      )}

      {/* Test notification - only when permission granted */}
      {permission === "granted" && isSubscribed && (
        <button
          type="button"
          onClick={sendTestNotification}
          className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-5 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          <span aria-hidden="true">🔔</span>
          שלח התראת בדיקה
        </button>
      )}
    </div>
  );
}
