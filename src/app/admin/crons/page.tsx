"use client";

// ─── Cron Job Definition ────────────────────────────────────────────────────────

interface CronJob {
  id: string;
  name: string;
  description: string;
  schedule: string;
  handler: string;
  active: boolean;
}

// ─── Cron Jobs Data ─────────────────────────────────────────────────────────────

const cronJobs: CronJob[] = [
  {
    id: "cleanup-sessions",
    name: "ניקוי סשנים נטושים",
    description:
      "מנקה סשנים של סימולטור דייטינג שנשארו פעילים יותר מ-24 שעות ומסמן אותם כנטושים.",
    schedule: "כל 6 שעות",
    handler: "scheduledTasks.cleanupAbandonedSessions",
    active: true,
  },
  {
    id: "rotate-content",
    name: "סיבוב תוכן יומי",
    description:
      "מרענן את התוכן היומי (טיפים, ציטוטים ואתגרים) בכל בוקר בשעה 8:00 לפי שעון ישראל.",
    schedule: "יומי בשעה 08:00 (UTC+3)",
    handler: "scheduledTasks.rotateDailyContent",
    active: true,
  },
  {
    id: "cleanup-notifications",
    name: "ניקוי התראות ישנות",
    description:
      "מוחק התראות שנקראו ושעברו יותר מ-30 יום. התראות שלא נקראו נשמרות.",
    schedule: "שבועי - יום ראשון בשעה 06:00 (UTC+3)",
    handler: "scheduledTasks.cleanupOldNotifications",
    active: true,
  },
];

// ─── Icons ──────────────────────────────────────────────────────────────────────

function ClockIcon() {
  return (
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
        d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function CodeIcon() {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5"
      />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
      />
    </svg>
  );
}

// ─── Component ──────────────────────────────────────────────────────────────────

export default function CronsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          משימות מתוזמנות
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          משימות שרצות אוטומטית ברקע לתחזוקת המערכת. מנוהל על ידי Convex Cron
          Jobs.
        </p>
      </div>

      {/* Summary */}
      <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-zinc-500 dark:text-zinc-400">
              <ClockIcon />
            </span>
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              סך הכל משימות פעילות
            </span>
          </div>
          <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
            {cronJobs.filter((j) => j.active).length} פעילות
          </span>
        </div>
      </div>

      {/* Cron Jobs List */}
      <div className="space-y-4">
        {cronJobs.map((job) => (
          <div
            key={job.id}
            className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="flex items-start justify-between border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                {/* Status indicator */}
                <span
                  className={`mt-0.5 h-2.5 w-2.5 flex-shrink-0 rounded-full ${
                    job.active
                      ? "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.4)]"
                      : "bg-zinc-300 dark:bg-zinc-600"
                  }`}
                  aria-label={job.active ? "פעיל" : "מושבת"}
                />
                <div>
                  <h2 className="text-base font-semibold text-zinc-900 dark:text-white">
                    {job.name}
                  </h2>
                  <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
                    {job.description}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 px-5 py-3 text-sm">
              {/* Schedule */}
              <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
                <ClockIcon />
                <span>{job.schedule}</span>
              </div>

              {/* Handler */}
              <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-500">
                <CodeIcon />
                <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs dark:bg-zinc-800" dir="ltr">
                  {job.handler}
                </code>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Convex Dashboard Link */}
      <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 text-zinc-400 dark:text-zinc-500">
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
                d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
              />
            </svg>
          </span>
          <div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              ניהול מתקדם של משימות מתוזמנות זמין בדשבורד של Convex. שם ניתן
              לראות לוגים, היסטוריית הרצות, ולנהל משימות באופן ידני.
            </p>
            <a
              href="https://dashboard.convex.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-[#E85D75] hover:underline"
            >
              פתח את דשבורד Convex
              <ExternalLinkIcon />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
