"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser, UserButton } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

// ---- Types ----

type Theme = "light" | "dark" | "system";
type FontSize = "small" | "normal" | "large";
type PreferredTime = "morning" | "afternoon" | "evening";

interface NotificationPrefs {
  email: boolean;
  dailyReminder: boolean;
  community: boolean;
  dailyTip: boolean;
  courseUpdates: boolean;
  promotions: boolean;
}

interface DisplayPrefs {
  theme: Theme;
  fontSize: FontSize;
}

interface LearningPrefs {
  weeklyGoal: number;
  preferredTime: PreferredTime;
}

// ---- Toast helper ----

function useToast() {
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const show = useCallback(
    (message: string, type: "success" | "error" = "success") => {
      setToast({ message, type });
      setTimeout(() => setToast(null), 3000);
    },
    []
  );

  return { toast, show };
}

// ---- Apply theme to document ----

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else if (theme === "light") {
    root.classList.remove("dark");
  } else {
    // system
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    if (prefersDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }
  localStorage.setItem("theme", theme);
}

// ---- Apply font size to document ----

function applyFontSize(size: FontSize) {
  const root = document.documentElement;
  root.classList.remove("text-sm", "text-base", "text-lg");
  if (size === "small") root.style.fontSize = "14px";
  else if (size === "large") root.style.fontSize = "18px";
  else root.style.fontSize = "16px";
  localStorage.setItem("fontSize", size);
}

// ---- Main Page ----

export default function SettingsPage() {
  const { user: clerkUser } = useUser();
  const prefs = useQuery(api.users.getPreferences);
  const exportData = useQuery(api.users.exportUserData);

  const updateNotifications = useMutation(
    api.users.updateNotificationPreferences
  );
  const updateDisplay = useMutation(api.users.updateDisplayPreferences);
  const updateLearning = useMutation(api.users.updateLearningPreferences);
  const requestDeletion = useMutation(api.users.requestAccountDeletion);

  const { toast, show: showToast } = useToast();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletionDone, setDeletionDone] = useState(false);
  const [savingSection, setSavingSection] = useState<string | null>(null);

  // Notification state
  const [notifications, setNotifications] = useState<NotificationPrefs>({
    email: true,
    dailyReminder: true,
    community: false,
    dailyTip: true,
    courseUpdates: true,
    promotions: false,
  });

  // Display state
  const [display, setDisplay] = useState<DisplayPrefs>({
    theme: "system",
    fontSize: "normal",
  });

  // Learning state
  const [learning, setLearning] = useState<LearningPrefs>({
    weeklyGoal: 3,
    preferredTime: "morning",
  });

  // Load saved preferences from Convex
  useEffect(() => {
    if (!prefs) return;

    if (prefs.notifications) {
      setNotifications({
        email: prefs.notifications.email ?? true,
        dailyReminder: prefs.notifications.dailyReminder ?? true,
        community: prefs.notifications.community ?? false,
        dailyTip: prefs.notifications.dailyTip ?? true,
        courseUpdates: prefs.notifications.courseUpdates ?? true,
        promotions: prefs.notifications.promotions ?? false,
      });
    }

    if (prefs.display) {
      const theme = (prefs.display.theme ?? "system") as Theme;
      const fontSize = (prefs.display.fontSize ?? "normal") as FontSize;
      setDisplay({ theme, fontSize });
      applyTheme(theme);
      applyFontSize(fontSize);
    }

    if (prefs.learning) {
      setLearning({
        weeklyGoal: prefs.learning.weeklyGoal ?? 3,
        preferredTime: (prefs.learning.preferredTime ?? "morning") as PreferredTime,
      });
    }

    if (prefs.deletionRequested) {
      setDeletionDone(true);
    }
  }, [prefs]);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    const savedFontSize = localStorage.getItem("fontSize") as FontSize | null;
    if (savedTheme) {
      setDisplay((prev) => ({ ...prev, theme: savedTheme }));
      applyTheme(savedTheme);
    }
    if (savedFontSize) {
      setDisplay((prev) => ({ ...prev, fontSize: savedFontSize }));
      applyFontSize(savedFontSize);
    }
  }, []);

  // Save notification preferences
  const handleSaveNotifications = async () => {
    setSavingSection("notifications");
    try {
      await updateNotifications(notifications);
      showToast("העדפות ההתראות נשמרו");
    } catch {
      showToast("שגיאה בשמירת ההעדפות", "error");
    } finally {
      setSavingSection(null);
    }
  };

  // Save display preferences + apply immediately
  const handleSaveDisplay = async () => {
    setSavingSection("display");
    applyTheme(display.theme);
    applyFontSize(display.fontSize);
    try {
      await updateDisplay(display);
      showToast("העדפות התצוגה נשמרו");
    } catch {
      showToast("שגיאה בשמירת ההעדפות", "error");
    } finally {
      setSavingSection(null);
    }
  };

  // Save learning preferences
  const handleSaveLearning = async () => {
    setSavingSection("learning");
    try {
      await updateLearning(learning);
      showToast("העדפות הלמידה נשמרו");
    } catch {
      showToast("שגיאה בשמירת ההעדפות", "error");
    } finally {
      setSavingSection(null);
    }
  };

  // Export user data
  const handleExportData = () => {
    if (!exportData) return;
    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `haderech-data-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("הנתונים יוצאו בהצלחה");
  };

  // Request account deletion
  const handleDeleteAccount = async () => {
    try {
      await requestDeletion();
      setDeletionDone(true);
      setShowDeleteConfirm(false);
      showToast("בקשת המחיקה התקבלה. נצור איתך קשר בתוך 48 שעות.");
    } catch {
      showToast("שגיאה בשליחת הבקשה", "error");
    }
  };

  return (
    <div className="min-h-dvh bg-white dark:bg-zinc-950">
      <Header />

      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-20 left-1/2 z-50 -translate-x-1/2 rounded-full px-5 py-2.5 text-sm font-medium shadow-lg transition-all ${
            toast.type === "success"
              ? "bg-emerald-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {toast.message}
        </div>
      )}

      <main className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-2xl">
          {/* Page heading */}
          <div className="mb-10">
            <h1 className="mb-1.5 text-3xl font-bold text-zinc-900 dark:text-white">
              הגדרות
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400">
              נהלו את העדפות החשבון, התצוגה והלמידה שלכם
            </p>
          </div>

          {/* ── 1. Profile Section ── */}
          <Section title="פרופיל">
            <div className="flex items-center gap-5">
              <div className="relative">
                {clerkUser?.imageUrl ? (
                  <img
                    src={clerkUser.imageUrl}
                    alt={clerkUser.fullName ?? ""}
                    className="h-16 w-16 rounded-full object-cover ring-2 ring-brand-100 dark:ring-brand-900"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-xl font-bold text-white">
                    {clerkUser?.firstName?.charAt(0) ?? "?"}
                  </div>
                )}
                {/* Clerk UserButton overlay for profile management */}
                <div className="absolute -bottom-1 -left-1 opacity-0 [&>div]:!h-7 [&>div]:!w-7">
                  <UserButton />
                </div>
              </div>

              <div className="flex-1">
                <p className="text-lg font-semibold text-zinc-900 dark:text-white">
                  {clerkUser?.fullName ?? "משתמש"}
                </p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {clerkUser?.primaryEmailAddress?.emailAddress ?? ""}
                </p>
              </div>

              {/* Visible Clerk UserButton */}
              <div className="flex flex-col items-end gap-1">
                <p className="text-xs text-zinc-400 dark:text-zinc-500">
                  עריכת פרופיל
                </p>
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "h-9 w-9",
                    },
                  }}
                />
              </div>
            </div>
          </Section>

          {/* ── 2. Notification Preferences ── */}
          <Section title="העדפות התראות">
            <div className="space-y-4">
              <ToggleRow
                label="הודעות אימייל כלליות"
                description="קבלו עדכונים ומידע חשוב לאימייל"
                checked={notifications.email}
                onChange={() =>
                  setNotifications((p) => ({ ...p, email: !p.email }))
                }
              />
              <ToggleRow
                label="תזכורת לימוד יומית"
                description="תזכורת יומית להמשך הלמידה"
                checked={notifications.dailyReminder}
                onChange={() =>
                  setNotifications((p) => ({
                    ...p,
                    dailyReminder: !p.dailyReminder,
                  }))
                }
              />
              <ToggleRow
                label="עדכוני קהילה"
                description="כשיש תגובות חדשות או דיונים שעשויים לעניין אתכם"
                checked={notifications.community}
                onChange={() =>
                  setNotifications((p) => ({
                    ...p,
                    community: !p.community,
                  }))
                }
              />
              <ToggleRow
                label="טיפ יומי"
                description="קבלו טיפ יומי לשיפור הדייטינג שלכם"
                checked={notifications.dailyTip}
                onChange={() =>
                  setNotifications((p) => ({ ...p, dailyTip: !p.dailyTip }))
                }
              />
              <ToggleRow
                label="עדכוני קורס"
                description="כשמתפרסם שיעור חדש בקורסים שנרשמתם אליהם"
                checked={notifications.courseUpdates}
                onChange={() =>
                  setNotifications((p) => ({
                    ...p,
                    courseUpdates: !p.courseUpdates,
                  }))
                }
              />
              <ToggleRow
                label="מבצעים והנחות"
                description="מבצעים, הנחות והצעות מיוחדות"
                checked={notifications.promotions}
                onChange={() =>
                  setNotifications((p) => ({
                    ...p,
                    promotions: !p.promotions,
                  }))
                }
              />
            </div>
            <div className="mt-6">
              <SaveButton
                onClick={handleSaveNotifications}
                loading={savingSection === "notifications"}
              />
            </div>
          </Section>

          {/* ── 3. Display Preferences ── */}
          <Section title="העדפות תצוגה">
            <div className="space-y-6">
              {/* Theme */}
              <div>
                <p className="mb-3 text-sm font-medium text-zinc-900 dark:text-white">
                  ערכת נושא
                </p>
                <div className="flex gap-3">
                  {(
                    [
                      { value: "light", label: "בהיר" },
                      { value: "dark", label: "כהה" },
                      { value: "system", label: "מערכת" },
                    ] as { value: Theme; label: string }[]
                  ).map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setDisplay((p) => ({ ...p, theme: value }))}
                      className={`flex-1 rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                        display.theme === value
                          ? "border-brand-500 bg-brand-50 text-brand-700 dark:border-brand-400 dark:bg-brand-950 dark:text-brand-300"
                          : "border-zinc-200 text-zinc-600 hover:border-zinc-300 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-600"
                      }`}
                    >
                      <span className="block text-lg">
                        {value === "light"
                          ? "☀️"
                          : value === "dark"
                            ? "🌙"
                            : "💻"}
                      </span>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font size */}
              <div>
                <p className="mb-3 text-sm font-medium text-zinc-900 dark:text-white">
                  גודל טקסט
                </p>
                <div className="flex gap-3">
                  {(
                    [
                      { value: "small", label: "קטן" },
                      { value: "normal", label: "רגיל" },
                      { value: "large", label: "גדול" },
                    ] as { value: FontSize; label: string }[]
                  ).map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() =>
                        setDisplay((p) => ({ ...p, fontSize: value }))
                      }
                      className={`flex-1 rounded-xl border px-4 py-3 transition-all ${
                        display.fontSize === value
                          ? "border-brand-500 bg-brand-50 text-brand-700 dark:border-brand-400 dark:bg-brand-950 dark:text-brand-300"
                          : "border-zinc-200 text-zinc-600 hover:border-zinc-300 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-600"
                      } ${
                        value === "small"
                          ? "text-xs"
                          : value === "large"
                            ? "text-base font-medium"
                            : "text-sm"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-6">
              <SaveButton
                onClick={handleSaveDisplay}
                loading={savingSection === "display"}
              />
            </div>
          </Section>

          {/* ── 4. Learning Preferences ── */}
          <Section title="העדפות למידה">
            <div className="space-y-6">
              {/* Weekly goal */}
              <div>
                <p className="mb-3 text-sm font-medium text-zinc-900 dark:text-white">
                  כמה שיעורים בשבוע?
                </p>
                <div className="flex gap-3">
                  {[1, 3, 5, 7].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() =>
                        setLearning((p) => ({ ...p, weeklyGoal: n }))
                      }
                      className={`flex-1 rounded-xl border py-3 text-sm font-semibold transition-all ${
                        learning.weeklyGoal === n
                          ? "border-brand-500 bg-brand-50 text-brand-700 dark:border-brand-400 dark:bg-brand-950 dark:text-brand-300"
                          : "border-zinc-200 text-zinc-600 hover:border-zinc-300 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-600"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">
                  יעד נוכחי: {learning.weeklyGoal} שיעורים בשבוע
                </p>
              </div>

              {/* Preferred time */}
              <div>
                <p className="mb-3 text-sm font-medium text-zinc-900 dark:text-white">
                  זמן למידה מועדף
                </p>
                <div className="flex gap-3">
                  {(
                    [
                      { value: "morning", label: "בוקר", icon: "🌅" },
                      { value: "afternoon", label: "צהריים", icon: "☀️" },
                      { value: "evening", label: "ערב", icon: "🌙" },
                    ] as { value: PreferredTime; label: string; icon: string }[]
                  ).map(({ value, label, icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() =>
                        setLearning((p) => ({ ...p, preferredTime: value }))
                      }
                      className={`flex-1 rounded-xl border px-3 py-3 text-sm font-medium transition-all ${
                        learning.preferredTime === value
                          ? "border-brand-500 bg-brand-50 text-brand-700 dark:border-brand-400 dark:bg-brand-950 dark:text-brand-300"
                          : "border-zinc-200 text-zinc-600 hover:border-zinc-300 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-600"
                      }`}
                    >
                      <span className="block text-lg">{icon}</span>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-6">
              <SaveButton
                onClick={handleSaveLearning}
                loading={savingSection === "learning"}
              />
            </div>
          </Section>

          {/* ── 5. Account Actions ── */}
          <Section title="פעולות חשבון">
            <div className="space-y-4">
              {/* Export data */}
              <div className="flex items-center justify-between gap-4 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-white">
                    ייצוא נתונים
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    הורידו את כל נתוני הפרופיל, ההתקדמות והציונים שלכם כ-JSON
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleExportData}
                  disabled={!exportData}
                  className="flex-shrink-0 rounded-full border border-zinc-200 bg-white px-5 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  ייצוא
                </button>
              </div>

              {/* Delete account */}
              <div className="rounded-xl border border-red-100 p-4 dark:border-red-900/30">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-red-700 dark:text-red-400">
                      מחיקת חשבון
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {deletionDone
                        ? "בקשת המחיקה התקבלה. נצור איתך קשר תוך 48 שעות."
                        : "פעולה זו בלתי הפיכה. כל הנתונים שלכם ימחקו לצמיתות."}
                    </p>
                  </div>
                  {!deletionDone && (
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="flex-shrink-0 rounded-full border border-red-200 bg-red-50 px-5 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 dark:border-red-800 dark:bg-red-950 dark:text-red-400 dark:hover:bg-red-900/50"
                    >
                      מחיקה
                    </button>
                  )}
                  {deletionDone && (
                    <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-700 dark:bg-orange-950 dark:text-orange-400">
                      בטיפול
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Section>
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900">
            <h3 className="mb-2 text-lg font-bold text-zinc-900 dark:text-white">
              אתם בטוחים?
            </h3>
            <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
              מחיקת החשבון תמחק את כל הנתונים שלכם: התקדמות, הערות, תגובות
              ותעודות. פעולה זו בלתי הפיכה.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 rounded-full border border-zinc-200 bg-white py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
              >
                ביטול
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                className="flex-1 rounded-full bg-red-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700"
              >
                כן, מחק את החשבון
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

// ---- Sub-components ----

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-6 rounded-2xl border border-zinc-200 p-6 dark:border-zinc-800">
      <h2 className="mb-5 text-base font-semibold text-zinc-900 dark:text-white">
        {title}
      </h2>
      {children}
    </section>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-1">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-zinc-900 dark:text-white">
          {label}
        </p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ${
          checked
            ? "bg-brand-600 dark:bg-brand-500"
            : "bg-zinc-200 dark:bg-zinc-700"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
            checked ? "-translate-x-5" : "-translate-x-0.5"
          } mt-0.5`}
        />
      </button>
    </div>
  );
}

function SaveButton({
  onClick,
  loading,
}: {
  onClick: () => void;
  loading: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="h-10 rounded-full bg-zinc-900 px-7 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
    >
      {loading ? "שומר..." : "שמור"}
    </button>
  );
}
