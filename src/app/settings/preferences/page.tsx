"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

// ---- Types ----

type Theme = "light" | "dark" | "system";
type Language = "he" | "en";
type Density = "comfortable" | "compact";

// ---- Toast ----

function useToast() {
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(
    (message: string, type: "success" | "error" = "success") => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setToast({ message, type });
      timerRef.current = setTimeout(() => setToast(null), 2500);
    },
    []
  );

  return { toast, show };
}

// ---- Page ----

export default function PreferencesPage() {
  const prefs = useQuery(api.preferences.getPreferences);
  const updatePreferences = useMutation(api.preferences.updatePreferences);
  const { toast, show: showToast } = useToast();

  // Local state mirrors server state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [courseReminders, setCourseReminders] = useState(true);
  const [achievementAlerts, setAchievementAlerts] = useState(true);
  const [theme, setTheme] = useState<Theme>("system");
  const [density, setDensity] = useState<Density>("comfortable");
  const [language, setLanguage] = useState<Language>("he");

  const [loaded, setLoaded] = useState(false);

  // Sync from server on first load
  useEffect(() => {
    if (!prefs || loaded) return;
    setEmailNotifications(prefs.emailNotifications);
    setPushNotifications(prefs.pushNotifications);
    setWeeklyDigest(prefs.weeklyDigest);
    setCourseReminders(prefs.courseReminders);
    setAchievementAlerts(prefs.achievementAlerts);
    setTheme(prefs.theme);
    setDensity(prefs.displayDensity);
    setLanguage(prefs.language);
    setLoaded(true);
  }, [prefs, loaded]);

  // Persist a single field
  const save = useCallback(
    async (field: string, value: boolean | string) => {
      try {
        await updatePreferences({ [field]: value });
        showToast("ההעדפה נשמרה");
      } catch {
        showToast("שגיאה בשמירה", "error");
      }
    },
    [updatePreferences, showToast]
  );

  // Toggle helpers (update local + persist)
  const toggle = useCallback(
    (
      field: string,
      getter: boolean,
      setter: React.Dispatch<React.SetStateAction<boolean>>
    ) => {
      const next = !getter;
      setter(next);
      save(field, next);
    },
    [save]
  );

  if (prefs === undefined) {
    return (
      <div className="min-h-dvh bg-white dark:bg-zinc-950">
        <Header />
        <main className="container mx-auto px-4 py-24 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
          <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
            טוען העדפות...
          </p>
        </main>
        <Footer />
      </div>
    );
  }

  if (prefs === null) {
    return (
      <div className="min-h-dvh bg-white dark:bg-zinc-950">
        <Header />
        <main className="container mx-auto px-4 py-24 text-center">
          <p className="text-zinc-600 dark:text-zinc-400">
            יש להתחבר כדי לנהל העדפות.
          </p>
        </main>
        <Footer />
      </div>
    );
  }

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
          {/* Heading */}
          <div className="mb-10">
            <h1 className="mb-1.5 text-3xl font-bold text-zinc-900 dark:text-white">
              העדפות
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400">
              התאימו את חווית השימוש שלכם בפלטפורמה
            </p>
          </div>

          {/* ── 1. Notifications ── */}
          <Section title="התראות">
            <div className="space-y-4">
              <ToggleRow
                label="התראות אימייל"
                description="קבלו עדכונים חשובים לכתובת האימייל שלכם"
                checked={emailNotifications}
                onChange={() =>
                  toggle(
                    "emailNotifications",
                    emailNotifications,
                    setEmailNotifications
                  )
                }
              />
              <ToggleRow
                label="התראות דחיפה"
                description="קבלו התראות ישירות לדפדפן או למכשיר"
                checked={pushNotifications}
                onChange={() =>
                  toggle(
                    "pushNotifications",
                    pushNotifications,
                    setPushNotifications
                  )
                }
              />
              <ToggleRow
                label="סיכום שבועי"
                description="קבלו סיכום שבועי של ההתקדמות והפעילות שלכם"
                checked={weeklyDigest}
                onChange={() =>
                  toggle("weeklyDigest", weeklyDigest, setWeeklyDigest)
                }
              />
              <ToggleRow
                label="תזכורות קורסים"
                description="תזכורות להמשך למידה ושיעורים שטרם הושלמו"
                checked={courseReminders}
                onChange={() =>
                  toggle(
                    "courseReminders",
                    courseReminders,
                    setCourseReminders
                  )
                }
              />
              <ToggleRow
                label="התראות הישגים"
                description="קבלו התראה כשמשיגים תג, רמה חדשה או הישג"
                checked={achievementAlerts}
                onChange={() =>
                  toggle(
                    "achievementAlerts",
                    achievementAlerts,
                    setAchievementAlerts
                  )
                }
              />
            </div>
          </Section>

          {/* ── 2. Appearance ── */}
          <Section title="מראה">
            {/* Theme */}
            <div className="mb-6">
              <p className="mb-3 text-sm font-medium text-zinc-900 dark:text-white">
                ערכת נושא
              </p>
              <div className="flex gap-3">
                {(
                  [
                    { value: "light", label: "בהיר", icon: "\u2600\uFE0F" },
                    { value: "dark", label: "כהה", icon: "\uD83C\uDF19" },
                    { value: "system", label: "מערכת", icon: "\uD83D\uDCBB" },
                  ] as { value: Theme; label: string; icon: string }[]
                ).map(({ value, label, icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      setTheme(value);
                      save("theme", value);
                    }}
                    className={`flex-1 rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                      theme === value
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

            {/* Density */}
            <div>
              <p className="mb-3 text-sm font-medium text-zinc-900 dark:text-white">
                צפיפות תצוגה
              </p>
              <div className="flex gap-3">
                {(
                  [
                    { value: "comfortable", label: "נוח", desc: "ריווח מרווח בין אלמנטים" },
                    { value: "compact", label: "צפוף", desc: "יותר תוכן על המסך" },
                  ] as { value: Density; label: string; desc: string }[]
                ).map(({ value, label, desc }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      setDensity(value);
                      save("displayDensity", value);
                    }}
                    className={`flex-1 rounded-xl border px-4 py-3.5 text-right transition-all ${
                      density === value
                        ? "border-brand-500 bg-brand-50 dark:border-brand-400 dark:bg-brand-950"
                        : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-600"
                    }`}
                  >
                    <span
                      className={`block text-sm font-medium ${
                        density === value
                          ? "text-brand-700 dark:text-brand-300"
                          : "text-zinc-700 dark:text-zinc-300"
                      }`}
                    >
                      {label}
                    </span>
                    <span className="mt-0.5 block text-xs text-zinc-500 dark:text-zinc-400">
                      {desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </Section>

          {/* ── 3. Language ── */}
          <Section title="שפה">
            <div className="flex gap-3">
              {(
                [
                  { value: "he", label: "עברית", flag: "\uD83C\uDDEE\uD83C\uDDF1" },
                  { value: "en", label: "English", flag: "\uD83C\uDDFA\uD83C\uDDF8" },
                ] as { value: Language; label: string; flag: string }[]
              ).map(({ value, label, flag }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setLanguage(value);
                    save("language", value);
                  }}
                  className={`flex-1 rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                    language === value
                      ? "border-brand-500 bg-brand-50 text-brand-700 dark:border-brand-400 dark:bg-brand-950 dark:text-brand-300"
                      : "border-zinc-200 text-zinc-600 hover:border-zinc-300 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-600"
                  }`}
                >
                  <span className="block text-lg">{flag}</span>
                  {label}
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs text-zinc-400 dark:text-zinc-500">
              שפת הממשק תשתנה בפעם הבאה שתטענו את העמוד.
            </p>
          </Section>

          {/* Back link */}
          <div className="mt-2 text-center">
            <a
              href="/settings"
              className="text-sm text-zinc-500 transition-colors hover:text-brand-600 dark:text-zinc-400 dark:hover:text-brand-400"
            >
              חזרה להגדרות הכלליות
            </a>
          </div>
        </div>
      </main>

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
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {description}
        </p>
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
