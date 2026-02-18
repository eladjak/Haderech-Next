"use client";

import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { ProgressBar } from "@/components/ui/progress-bar";
import {
  enrollmentRatio,
  certificateRate,
  formatRelativeTime,
} from "@/lib/admin-utils";

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const mockStats = {
  totalStudents: 47,
  totalCourses: 3,
  totalEnrollments: 89,
  totalCertificates: 12,
  averageProgress: 64,
  completionRate: 38,
};

const mockCourseBreakdown = [
  {
    title: "אומנות ההקשבה",
    enrollments: 28,
    avgScore: 72,
    completionRate: 42,
  },
  {
    title: "תקשורת זוגית מתקדמת",
    enrollments: 35,
    avgScore: 68,
    completionRate: 35,
  },
  {
    title: "מפתחות לאינטימיות",
    enrollments: 26,
    avgScore: 75,
    completionRate: 38,
  },
];

const mockWeeklyActivity = [
  { day: "ראשון", enrollments: 5, completions: 2 },
  { day: "שני", enrollments: 8, completions: 3 },
  { day: "שלישי", enrollments: 3, completions: 1 },
  { day: "רביעי", enrollments: 12, completions: 5 },
  { day: "חמישי", enrollments: 7, completions: 4 },
  { day: "שישי", enrollments: 2, completions: 1 },
  { day: "שבת", enrollments: 1, completions: 0 },
];

const mockTopStudents = [
  { name: "רונית שמש", progress: 100, courses: 3, lastActive: Date.now() - 1000 * 60 * 15 },
  { name: "אבי לוי", progress: 92, courses: 3, lastActive: Date.now() - 1000 * 60 * 60 * 2 },
  { name: "דנה כהן", progress: 85, courses: 2, lastActive: Date.now() - 1000 * 60 * 30 },
  { name: "דוד חן", progress: 78, courses: 3, lastActive: Date.now() - 1000 * 60 * 60 },
  { name: "יוסי אברהם", progress: 67, courses: 2, lastActive: Date.now() - 1000 * 60 * 60 * 48 },
];

// ─── Page Component ────────────────────────────────────────────────────────────

export default function AdminAnalyticsPage() {
  const convexStats = useQuery(api.admin.getStats);
  const stats = convexStats ?? mockStats;

  const ratio = enrollmentRatio(stats);
  const certRate = certificateRate(stats);
  const now = Date.now();

  // Determine the max enrollment for bar chart scaling
  const maxEnrollments = Math.max(
    ...mockWeeklyActivity.map((d) => d.enrollments),
    1
  );

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          אנליטיקס
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          סטטיסטיקות ומגמות מפורטות של מערכת הלימודים
        </p>
      </div>

      {/* KPI Cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="יחס הרשמות/סטודנט"
          value={ratio.toFixed(2)}
          description="ממוצע הרשמות לכל סטודנט"
          color="blue"
        />
        <KpiCard
          label="שיעור תעודות"
          value={`${certRate}%`}
          description="מתוך כלל ההרשמות"
          color="emerald"
        />
        <KpiCard
          label="ציון ממוצע"
          value={`${stats.averageProgress}%`}
          description="ממוצע התקדמות כללי"
          color="amber"
        />
        <KpiCard
          label="אחוז השלמה"
          value={`${stats.completionRate}%`}
          description="סטודנטים שסיימו קורס"
          color="violet"
        />
      </div>

      {/* Two-column layout */}
      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        {/* Weekly Activity Bar Chart */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">
            פעילות שבועית
          </h2>
          <div className="flex items-end gap-3">
            {mockWeeklyActivity.map((day) => (
              <div key={day.day} className="flex flex-1 flex-col items-center gap-1">
                <div className="flex w-full flex-col items-center gap-0.5">
                  <div
                    className="w-full rounded-t bg-blue-500 dark:bg-blue-400"
                    style={{
                      height: `${Math.max((day.enrollments / maxEnrollments) * 120, 4)}px`,
                    }}
                    title={`${day.enrollments} הרשמות`}
                  />
                  <div
                    className="w-full rounded-b bg-emerald-500 dark:bg-emerald-400"
                    style={{
                      height: `${Math.max((day.completions / maxEnrollments) * 120, 2)}px`,
                    }}
                    title={`${day.completions} השלמות`}
                  />
                </div>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {day.day}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-sm bg-blue-500 dark:bg-blue-400" />
              הרשמות
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-sm bg-emerald-500 dark:bg-emerald-400" />
              השלמות
            </div>
          </div>
        </div>

        {/* Course Breakdown */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">
            פירוט לפי קורס
          </h2>
          <div className="space-y-4">
            {mockCourseBreakdown.map((course) => (
              <div key={course.title}>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-sm font-medium text-zinc-900 dark:text-white">
                    {course.title}
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {course.enrollments} רשומים
                  </span>
                </div>
                <ProgressBar value={course.completionRate} size="sm" />
                <div className="mt-1 flex gap-4 text-xs text-zinc-500 dark:text-zinc-400">
                  <span>ציון ממוצע: {course.avgScore}%</span>
                  <span>השלמה: {course.completionRate}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Students */}
      <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
            סטודנטים מצטיינים
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/50">
                <th className="px-5 py-3 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  #
                </th>
                <th className="px-5 py-3 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  סטודנט
                </th>
                <th className="px-5 py-3 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  התקדמות
                </th>
                <th className="hidden px-5 py-3 text-sm font-medium text-zinc-600 sm:table-cell dark:text-zinc-400">
                  קורסים
                </th>
                <th className="hidden px-5 py-3 text-sm font-medium text-zinc-600 md:table-cell dark:text-zinc-400">
                  פעילות אחרונה
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {mockTopStudents.map((student, index) => (
                <tr
                  key={student.name}
                  className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/30"
                >
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                        index === 0
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                          : index === 1
                            ? "bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300"
                            : index === 2
                              ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                              : "text-zinc-500 dark:text-zinc-400"
                      }`}
                    >
                      {index + 1}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-medium text-zinc-900 dark:text-white">
                      {student.name}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <ProgressBar
                        value={student.progress}
                        size="sm"
                        className="w-20"
                      />
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">
                        {student.progress}%
                      </span>
                    </div>
                  </td>
                  <td className="hidden px-5 py-3.5 sm:table-cell">
                    <span className="text-sm text-zinc-700 dark:text-zinc-300">
                      {student.courses}
                    </span>
                  </td>
                  <td className="hidden px-5 py-3.5 md:table-cell">
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">
                      {formatRelativeTime(student.lastActive, now)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── KPI Card ──────────────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  description,
  color,
}: {
  label: string;
  value: string;
  description: string;
  color: "blue" | "emerald" | "amber" | "violet";
}) {
  const borderColors = {
    blue: "border-t-blue-500",
    emerald: "border-t-emerald-500",
    amber: "border-t-amber-500",
    violet: "border-t-violet-500",
  };

  return (
    <div
      className={`rounded-xl border border-zinc-200 border-t-2 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 ${borderColors[color]}`}
    >
      <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-white">
        {value}
      </p>
      <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
        {description}
      </p>
    </div>
  );
}
