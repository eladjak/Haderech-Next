"use client";

import { useState } from "react";

// ─── Checklist Section Type ─────────────────────────────────────────────────────

interface ChecklistItem {
  id: string;
  label: string;
}

interface ChecklistSection {
  title: string;
  icon: React.ReactNode;
  items: ChecklistItem[];
}

// ─── Checklist Data ─────────────────────────────────────────────────────────────

const sections: ChecklistSection[] = [
  {
    title: "סביבה",
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m0 0a3 3 0 01-3 3m0 3h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008z"
        />
      </svg>
    ),
    items: [
      { id: "env-clerk", label: "מפתחות Clerk Production מוגדרים" },
      { id: "env-convex", label: "Convex Production deployment נוצר" },
      { id: "env-anthropic", label: "ANTHROPIC_API_KEY מוגדר בסביבת Convex" },
      { id: "env-domain", label: "דומיין מוגדר (haderech.co.il)" },
      { id: "env-ssl", label: "תעודת SSL פעילה" },
    ],
  },
  {
    title: "נתונים",
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125"
        />
      </svg>
    ),
    items: [
      { id: "data-seed", label: "Seed data נטען (קורסים, תגים, בלוג, סיפורים)" },
      { id: "data-admin", label: "משתמש Admin נוצר" },
      { id: "data-mentors", label: "מנטורים לדוגמה מוגדרים" },
      { id: "data-simulator", label: "תרחישי סימולטור פורסמו" },
    ],
  },
  {
    title: "בדיקות",
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    items: [
      { id: "test-signup", label: "תהליך הרשמה / התחברות עובד" },
      { id: "test-enroll", label: "הרשמה לקורס עובדת" },
      { id: "test-chat", label: "צ'אט AI מגיב" },
      { id: "test-simulator", label: "סימולטור מגיב" },
      { id: "test-blog", label: "פוסטים בבלוג מוצגים" },
      { id: "test-contact", label: "טופס יצירת קשר שולח" },
      { id: "test-mobile", label: "בדיקת רספונסיביות למובייל" },
      { id: "test-rtl", label: "תצוגת RTL תקינה" },
    ],
  },
  {
    title: "אבטחה",
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
        />
      </svg>
    ),
    items: [
      { id: "sec-keys", label: "אין מפתחות API חשופים בקוד" },
      { id: "sec-admin", label: "נתיבי Admin מוגנים" },
      { id: "sec-rate", label: "Rate limiting על Actions" },
      { id: "sec-cors", label: "CORS headers מוגדרים" },
      { id: "sec-csp", label: "CSP headers מוגדרים" },
    ],
  },
];

// ─── Component ──────────────────────────────────────────────────────────────────

export default function DeployPage() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const toggle = (id: string) => {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const totalItems = sections.reduce((sum, s) => sum + s.items.length, 0);
  const checkedCount = Object.values(checked).filter(Boolean).length;
  const progressPercent = totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          רשימת בדיקות לפרודקשן
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          סמנו כל פריט לאחר השלמתו. הרשימה נשמרת מקומית בלבד.
        </p>
      </div>

      {/* Progress */}
      <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between text-sm font-medium">
          <span className="text-zinc-700 dark:text-zinc-300">
            התקדמות כללית
          </span>
          <span className="text-zinc-900 dark:text-white">
            {checkedCount}/{totalItems} ({progressPercent}%)
          </span>
        </div>
        <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
          <div
            className="h-full rounded-full bg-[#E85D75] transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Sections */}
      {sections.map((section) => {
        const sectionChecked = section.items.filter((item) => checked[item.id]).length;
        const allChecked = sectionChecked === section.items.length;

        return (
          <section
            key={section.title}
            className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <span className="text-zinc-500 dark:text-zinc-400">
                  {section.icon}
                </span>
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                  {section.title}
                </h2>
              </div>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  allChecked
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                    : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                }`}
              >
                {sectionChecked}/{section.items.length}
              </span>
            </div>

            <ul className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
              {section.items.map((item) => (
                <li key={item.id}>
                  <label
                    htmlFor={item.id}
                    className="flex cursor-pointer items-center gap-3 px-5 py-3.5 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/30"
                  >
                    <input
                      id={item.id}
                      type="checkbox"
                      checked={!!checked[item.id]}
                      onChange={() => toggle(item.id)}
                      className="h-4 w-4 rounded border-zinc-300 text-[#E85D75] focus:ring-[#E85D75] dark:border-zinc-600"
                    />
                    <span
                      className={`text-sm ${
                        checked[item.id]
                          ? "text-zinc-400 line-through dark:text-zinc-500"
                          : "text-zinc-700 dark:text-zinc-300"
                      }`}
                    >
                      {item.label}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      {/* Seed Instructions */}
      <section className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
          טעינת נתוני Seed
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          הריצו את הסקריפט הבא כדי לטעון את כל הנתונים הבסיסיים:
        </p>
        <pre className="mt-3 overflow-x-auto rounded-lg bg-zinc-950 p-4 text-sm text-zinc-300 ltr" dir="ltr">
          <code>bash scripts/seed-production.sh</code>
        </pre>
      </section>
    </div>
  );
}
