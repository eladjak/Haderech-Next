"use client";

import { useState, useMemo } from "react";
import {
  welcomeTemplate,
  courseCompletionTemplate,
  dailyReminderTemplate,
  newBlogPostTemplate,
  weeklySummaryTemplate,
} from "@/../convex/emailTemplates";

// ─── Template Definitions ────────────────────────────────────────────────────

type TemplateKey =
  | "welcome"
  | "courseCompletion"
  | "dailyReminder"
  | "newBlogPost"
  | "weeklySummary";

interface TemplateOption {
  key: TemplateKey;
  label: string;
  description: string;
}

const TEMPLATE_OPTIONS: TemplateOption[] = [
  {
    key: "welcome",
    label: "ברוכים הבאים",
    description: "נשלח לאחר הרשמה ראשונה",
  },
  {
    key: "courseCompletion",
    label: "סיום קורס",
    description: "נשלח כאשר תלמיד משלים קורס",
  },
  {
    key: "dailyReminder",
    label: "תזכורת יומית",
    description: "תזכורת ללמוד ולשמור על רצף",
  },
  {
    key: "newBlogPost",
    label: "מאמר חדש בבלוג",
    description: "עדכון על מאמר חדש שפורסם",
  },
  {
    key: "weeklySummary",
    label: "סיכום שבועי",
    description: "סטטיסטיקות למידה שבועיות",
  },
];

// ─── Sample Data ─────────────────────────────────────────────────────────────

function generateHtml(key: TemplateKey): string {
  switch (key) {
    case "welcome":
      return welcomeTemplate("דוד כהן");
    case "courseCompletion":
      return courseCompletionTemplate("דוד כהן", "אומנות השיחה הראשונה");
    case "dailyReminder":
      return dailyReminderTemplate("דוד כהן", 14);
    case "newBlogPost":
      return newBlogPostTemplate(
        "5 טיפים לשיחה מוצלחת בדייט ראשון",
        "גלה את הסודות ליצירת שיחה זורמת ומעניינת שתעזור לך ליצור חיבור אמיתי מהרגע הראשון.",
        "5-tips-first-date-conversation",
      );
    case "weeklySummary":
      return weeklySummaryTemplate("דוד כהן", {
        lessonsCompleted: 7,
        xpEarned: 350,
        streak: 14,
      });
  }
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function AdminEmailsPage() {
  const [selected, setSelected] = useState<TemplateKey>("welcome");
  const [showTooltip, setShowTooltip] = useState(false);

  const html = useMemo(() => generateHtml(selected), [selected]);

  const currentOption = TEMPLATE_OPTIONS.find((o) => o.key === selected);

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
            תבניות אימייל
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            תצוגה מקדימה של אימיילים אוטומטיים בעברית RTL
          </p>
        </div>

        {/* Send Test Button */}
        <div className="relative">
          <button
            type="button"
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-zinc-200 px-4 text-sm font-medium text-zinc-500 cursor-not-allowed dark:bg-zinc-700 dark:text-zinc-400"
            disabled
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onFocus={() => setShowTooltip(true)}
            onBlur={() => setShowTooltip(false)}
            aria-describedby="send-test-tooltip"
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
                d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
              />
            </svg>
            שלח אימייל טסט
          </button>

          {showTooltip && (
            <div
              id="send-test-tooltip"
              role="tooltip"
              className="absolute left-1/2 top-full z-10 mt-2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-600 shadow-lg dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
            >
              דורש חיבור ל-Resend/SendGrid
            </div>
          )}
        </div>
      </div>

      {/* Template Selector */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {TEMPLATE_OPTIONS.map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => setSelected(option.key)}
            className={`rounded-xl border p-4 text-right transition-all ${
              selected === option.key
                ? "border-[#E85D75] bg-[#E85D75]/5 ring-1 ring-[#E85D75] dark:bg-[#E85D75]/10"
                : "border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
            }`}
          >
            <p
              className={`text-sm font-semibold ${
                selected === option.key
                  ? "text-[#E85D75]"
                  : "text-zinc-900 dark:text-white"
              }`}
            >
              {option.label}
            </p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              {option.description}
            </p>
          </button>
        ))}
      </div>

      {/* Preview Info Bar */}
      <div className="mb-4 flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center rounded-full bg-[#1E3A5F]/10 px-2.5 py-0.5 text-xs font-medium text-[#1E3A5F] dark:bg-[#1E3A5F]/20 dark:text-blue-300">
            {currentOption?.label}
          </span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {currentOption?.description}
          </span>
        </div>
        <span className="text-xs text-zinc-400 dark:text-zinc-500">
          נתוני דוגמה
        </span>
      </div>

      {/* Email Preview */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        {/* Fake email client header */}
        <div className="border-b border-zinc-200 bg-zinc-50 px-5 py-3 dark:border-zinc-800 dark:bg-zinc-800/50">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-medium text-zinc-500 dark:text-zinc-400">
                מאת:
              </span>
              <span className="text-zinc-700 dark:text-zinc-300">
                הדרך &lt;noreply@haderech.co.il&gt;
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="font-medium text-zinc-500 dark:text-zinc-400">
                אל:
              </span>
              <span className="text-zinc-700 dark:text-zinc-300">
                david@example.com
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="font-medium text-zinc-500 dark:text-zinc-400">
                נושא:
              </span>
              <span className="font-medium text-zinc-900 dark:text-white">
                {selected === "welcome" && "ברוכים הבאים להדרך!"}
                {selected === "courseCompletion" &&
                  'כל הכבוד! סיימת את הקורס "אומנות השיחה הראשונה"'}
                {selected === "dailyReminder" && "הגיע הזמן ללמוד היום!"}
                {selected === "newBlogPost" && "מאמר חדש: 5 טיפים לשיחה מוצלחת בדייט ראשון"}
                {selected === "weeklySummary" && "הסיכום השבועי שלך בהדרך"}
              </span>
            </div>
          </div>
        </div>

        {/* Rendered HTML Preview */}
        <div className="bg-[#f8fafc] p-6">
          <div
            className="mx-auto max-w-[640px]"
            // biome-ignore lint/security/noDangerouslySetInnerHtml: email preview requires raw HTML rendering
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </div>

      {/* HTML Source (collapsible) */}
      <details className="mt-6 rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <summary className="cursor-pointer px-5 py-3 text-sm font-medium text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white">
          קוד HTML מקור
        </summary>
        <div className="border-t border-zinc-200 dark:border-zinc-800">
          <pre
            dir="ltr"
            className="overflow-x-auto p-5 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400"
          >
            <code>{html}</code>
          </pre>
        </div>
      </details>
    </div>
  );
}
