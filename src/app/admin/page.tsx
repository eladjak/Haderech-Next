"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";

// Mock data - used when Convex backend is not connected
const mockStats = {
  totalStudents: 47,
  totalCourses: 3,
  totalEnrollments: 89,
  totalCertificates: 12,
  averageProgress: 64,
  completionRate: 38,
};

const mockRecentActivity = [
  {
    type: "enrollment" as const,
    userName: "דנה כהן",
    courseName: "אומנות ההקשבה",
    timestamp: Date.now() - 1000 * 60 * 15,
  },
  {
    type: "certificate" as const,
    userName: "אבי לוי",
    courseName: "תקשורת זוגית מתקדמת",
    timestamp: Date.now() - 1000 * 60 * 45,
  },
  {
    type: "enrollment" as const,
    userName: "מיכל ברק",
    courseName: "מפתחות לאינטימיות",
    timestamp: Date.now() - 1000 * 60 * 90,
  },
  {
    type: "enrollment" as const,
    userName: "יוסי אברהם",
    courseName: "אומנות ההקשבה",
    timestamp: Date.now() - 1000 * 60 * 120,
  },
  {
    type: "certificate" as const,
    userName: "רונית שמש",
    courseName: "אומנות ההקשבה",
    timestamp: Date.now() - 1000 * 60 * 180,
  },
  {
    type: "enrollment" as const,
    userName: "עידו פרץ",
    courseName: "תקשורת זוגית מתקדמת",
    timestamp: Date.now() - 1000 * 60 * 240,
  },
  {
    type: "enrollment" as const,
    userName: "שרה גולד",
    courseName: "מפתחות לאינטימיות",
    timestamp: Date.now() - 1000 * 60 * 360,
  },
  {
    type: "certificate" as const,
    userName: "דוד חן",
    courseName: "מפתחות לאינטימיות",
    timestamp: Date.now() - 1000 * 60 * 480,
  },
  {
    type: "enrollment" as const,
    userName: "נועה רז",
    courseName: "אומנות ההקשבה",
    timestamp: Date.now() - 1000 * 60 * 600,
  },
  {
    type: "enrollment" as const,
    userName: "אלון מזרחי",
    courseName: "תקשורת זוגית מתקדמת",
    timestamp: Date.now() - 1000 * 60 * 720,
  },
];

function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return "עכשיו";
  if (minutes < 60) return `לפני ${minutes} דקות`;
  if (hours < 24) return `לפני ${hours} שעות`;
  return `לפני ${days} ימים`;
}

export default function AdminDashboardPage() {
  // Try to fetch real data from Convex; fall back to mock data
  const convexStats = useQuery(api.admin.getStats);
  const convexActivity = useQuery(api.admin.getRecentActivity);

  const stats = convexStats ?? mockStats;
  const recentActivity = convexActivity ?? mockRecentActivity;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          דשבורד ניהול
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          סקירה כללית של מערכת הלימודים
        </p>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="סטודנטים"
          value={stats.totalStudents}
          icon={
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
                d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
              />
            </svg>
          }
          color="blue"
        />
        <StatCard
          label="קורסים"
          value={stats.totalCourses}
          icon={
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
                d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
              />
            </svg>
          }
          color="emerald"
        />
        <StatCard
          label="ציון ממוצע"
          value={`${stats.averageProgress}%`}
          icon={
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
                d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
              />
            </svg>
          }
          color="amber"
        />
        <StatCard
          label="אחוז השלמה"
          value={`${stats.completionRate}%`}
          icon={
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
          }
          color="violet"
        />
      </div>

      {/* Secondary stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            סך הרשמות
          </p>
          <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-white">
            {stats.totalEnrollments}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            תעודות שהונפקו
          </p>
          <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-white">
            {stats.totalCertificates}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">
          ניהול מהיר
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/admin/blog"
            className="group rounded-xl border border-zinc-200 bg-white p-5 transition-all hover:border-[#E85D75]/30 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-[#E85D75]/40"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[#E85D75]/10 text-[#E85D75] transition-colors group-hover:bg-[#E85D75]/20">
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
                  d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-zinc-900 dark:text-white">
              ניהול בלוג
            </h3>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              יצירה, עריכה ופרסום מאמרים
            </p>
          </Link>

          <Link
            href="/admin/stories"
            className="group rounded-xl border border-zinc-200 bg-white p-5 transition-all hover:border-[#D4A853]/30 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-[#D4A853]/40"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[#D4A853]/10 text-[#D4A853] transition-colors group-hover:bg-[#D4A853]/20">
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
                  d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-zinc-900 dark:text-white">
              סיפורי הצלחה
            </h3>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              אישור והצגת סיפורי הצלחה
            </p>
          </Link>

          <Link
            href="/admin/contact"
            className="group rounded-xl border border-zinc-200 bg-white p-5 transition-all hover:border-[#1E3A5F]/30 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-[#1E3A5F]/40"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[#1E3A5F]/10 text-[#1E3A5F] transition-colors group-hover:bg-[#1E3A5F]/20 dark:text-blue-300">
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
                  d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-zinc-900 dark:text-white">
              פניות קשר
            </h3>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              ניהול ומענה לפניות מהאתר
            </p>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
            פעילות אחרונה
          </h2>
        </div>
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {recentActivity.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
              אין פעילות אחרונה
            </div>
          ) : (
            recentActivity.map((activity, index) => (
              <div
                key={`${activity.type}-${activity.timestamp}-${index}`}
                className="flex items-center gap-4 px-5 py-3.5"
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                    activity.type === "enrollment"
                      ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                      : "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                  }`}
                >
                  {activity.type === "enrollment" ? (
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
                        d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z"
                      />
                    </svg>
                  ) : (
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
                        d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5"
                      />
                    </svg>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-zinc-900 dark:text-white">
                    <span className="font-medium">{activity.userName}</span>{" "}
                    {activity.type === "enrollment"
                      ? "נרשם/ה לקורס"
                      : "קיבל/ה תעודה עבור"}{" "}
                    <span className="font-medium">{activity.courseName}</span>
                  </p>
                </div>
                <span className="shrink-0 text-xs text-zinc-500 dark:text-zinc-400">
                  {formatRelativeTime(activity.timestamp)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: "blue" | "emerald" | "amber" | "violet";
}) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
    emerald:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
    amber:
      "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
    violet:
      "bg-brand-50 text-brand-500 dark:bg-brand-700/20 dark:text-brand-300",
  };

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${colorClasses[color]}`}
        >
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            {label}
          </p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-white">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}
