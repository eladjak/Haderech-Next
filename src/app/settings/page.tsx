"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

interface NotificationSettings {
  achievements: boolean;
  commentReplies: boolean;
  courseUpdates: boolean;
  weeklyDigest: boolean;
}

export default function SettingsPage() {
  const { user: clerkUser } = useUser();

  const [notifications, setNotifications] = useState<NotificationSettings>({
    achievements: true,
    commentReplies: true,
    courseUpdates: true,
    weeklyDigest: false,
  });
  const [saved, setSaved] = useState(false);

  const handleToggle = (key: keyof NotificationSettings) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
    setSaved(false);
  };

  const handleSave = () => {
    // In production, save to backend
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="min-h-dvh bg-white dark:bg-zinc-950">
      <Header />

      <main className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-2xl">
          <h1 className="mb-2 text-3xl font-bold text-zinc-900 dark:text-white">
            הגדרות
          </h1>
          <p className="mb-8 text-zinc-600 dark:text-zinc-400">
            נהלו את העדפות החשבון וההתראות שלכם
          </p>

          {/* Profile Section */}
          <section className="mb-8 rounded-2xl border border-zinc-200 p-6 dark:border-zinc-800">
            <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">
              פרטי חשבון
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                {clerkUser?.imageUrl ? (
                  <img
                    src={clerkUser.imageUrl}
                    alt=""
                    className="h-16 w-16 rounded-full"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-200 text-xl font-bold text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
                    {clerkUser?.firstName?.charAt(0) ?? "?"}
                  </div>
                )}
                <div>
                  <p className="font-medium text-zinc-900 dark:text-white">
                    {clerkUser?.fullName ?? "משתמש"}
                  </p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {clerkUser?.primaryEmailAddress?.emailAddress ?? ""}
                  </p>
                </div>
              </div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                לעריכת פרטי החשבון, השתמשו בכפתור הפרופיל בפינה העליונה.
              </p>
            </div>
          </section>

          {/* Notification Settings */}
          <section className="mb-8 rounded-2xl border border-zinc-200 p-6 dark:border-zinc-800">
            <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">
              התראות
            </h2>
            <div className="space-y-4">
              <ToggleRow
                label="הישגים ותגים"
                description="קבלו התראה כשאתם משיגים תג חדש או עולים ברמה"
                checked={notifications.achievements}
                onChange={() => handleToggle("achievements")}
              />
              <ToggleRow
                label="תגובות לדיונים"
                description="קבלו התראה כשמישהו מגיב לתגובה שלכם"
                checked={notifications.commentReplies}
                onChange={() => handleToggle("commentReplies")}
              />
              <ToggleRow
                label="עדכוני קורסים"
                description="קבלו התראה כשמתפרסם שיעור או בוחן חדש"
                checked={notifications.courseUpdates}
                onChange={() => handleToggle("courseUpdates")}
              />
              <ToggleRow
                label="סיכום שבועי"
                description="קבלו סיכום שבועי של ההתקדמות שלכם במייל"
                checked={notifications.weeklyDigest}
                onChange={() => handleToggle("weeklyDigest")}
              />
            </div>
          </section>

          {/* Learning Preferences */}
          <section className="mb-8 rounded-2xl border border-zinc-200 p-6 dark:border-zinc-800">
            <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">
              העדפות למידה
            </h2>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="reminder"
                  className="mb-1.5 block text-sm font-medium text-zinc-900 dark:text-white"
                >
                  תזכורת ללמוד
                </label>
                <select
                  id="reminder"
                  className="h-10 w-full max-w-xs rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:border-zinc-600"
                >
                  <option value="none">ללא</option>
                  <option value="daily">כל יום</option>
                  <option value="3days">כל 3 ימים</option>
                  <option value="weekly">פעם בשבוע</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="goal"
                  className="mb-1.5 block text-sm font-medium text-zinc-900 dark:text-white"
                >
                  יעד למידה יומי
                </label>
                <select
                  id="goal"
                  className="h-10 w-full max-w-xs rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:border-zinc-600"
                >
                  <option value="15">15 דקות</option>
                  <option value="30">30 דקות</option>
                  <option value="60">שעה</option>
                  <option value="0">ללא יעד</option>
                </select>
              </div>
            </div>
          </section>

          {/* Save */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleSave}
              className="h-11 rounded-full bg-zinc-900 px-8 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
            >
              שמור הגדרות
            </button>
            {saved && (
              <span className="text-sm text-emerald-600 dark:text-emerald-400">
                ההגדרות נשמרו בהצלחה
              </span>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
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
    <div className="flex items-center justify-between gap-4">
      <div>
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
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ${
          checked
            ? "bg-zinc-900 dark:bg-white"
            : "bg-zinc-200 dark:bg-zinc-700"
        }`}
      >
        <span
          className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 dark:bg-zinc-900 ${
            checked ? "-translate-x-5" : "-translate-x-0.5"
          } mt-0.5`}
        />
      </button>
    </div>
  );
}
