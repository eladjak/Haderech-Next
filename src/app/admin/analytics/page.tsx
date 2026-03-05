"use client";

import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { StatCard, StatCardSkeleton } from "@/components/admin/stat-card";
import {
  BarChart,
  HorizontalBarChart,
  MiniSparkline,
  ChartSkeleton,
} from "@/components/admin/bar-chart";
import { DataTable, TableSkeleton, type Column } from "@/components/admin/data-table";

// ─── Local Types (mirrors convex/adminAnalytics return shapes) ────────────────

interface GrowthDay { date: string; count: number }

interface LessonStat {
  lessonId: string;
  title: string;
  courseTitle: string;
  views: number;
  completions: number;
  completionRate: number;
  avgWatchTimeSec: number;
}

interface DailyActiveDay { date: string; count: number }

interface EngagementData {
  dailyActive: DailyActiveDay[];
  avgLessonsPerUser: number;
  overallCompletionRate: number;
  totalLessonViews: number;
  uniqueActiveUsers7d: number;
}

interface StudentData {
  userId: string;
  name: string | undefined;
  email: string;
  imageUrl: string | undefined;
  xp: number;
  lessonsCompleted: number;
  certsCount: number;
  coursesEnrolled: number;
  streak: number;
  joinedAt: number;
}

interface SignupUser {
  userId: string;
  name: string;
  email: string;
  imageUrl: string | undefined;
  role: string;
  joinedAt: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return n.toLocaleString("he-IL");
}

function fmtCurrency(agorot: number) {
  return `₪${(agorot / 100).toLocaleString("he-IL", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

function fmtDate(ts: number) {
  return new Date(ts).toLocaleDateString("he-IL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatRelativeTime(ts: number, now: number) {
  const diff = now - ts;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 2) return "כרגע";
  if (minutes < 60) return `לפני ${minutes} דקות`;
  if (hours < 24) return `לפני ${hours} שעות`;
  return `לפני ${days} ימים`;
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function UsersIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  );
}

function ActiveIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  );
}

function EnrollmentIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
    </svg>
  );
}

function CompletionIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function RevenueIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
    </svg>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">
      {children}
    </h2>
  );
}

// ─── Revenue Card ─────────────────────────────────────────────────────────────

function RevenueCard({
  label,
  amount,
  sublabel,
  accent = "blue",
}: {
  label: string;
  amount: number;
  sublabel?: string;
  accent?: "blue" | "green" | "amber";
}) {
  const accentMap = {
    blue: "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300",
    green: "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-300",
    amber: "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-300",
  };

  return (
    <div className={`rounded-xl border p-5 ${accentMap[accent]}`}>
      <p className="text-sm font-medium opacity-80">{label}</p>
      <p className="mt-2 text-2xl font-bold">{fmtCurrency(amount)}</p>
      {sublabel && <p className="mt-1 text-xs opacity-60">{sublabel}</p>}
    </div>
  );
}

// ─── Activity Feed ────────────────────────────────────────────────────────────

function ActivityFeed({
  activities,
}: {
  activities: Array<{
    type: "new_user" | "enrollment" | "certificate";
    label: string;
    detail: string;
    timestamp: number;
  }>;
}) {
  const now = Date.now();
  const typeConfig = {
    new_user: {
      bg: "bg-blue-100 dark:bg-blue-900/30",
      text: "text-blue-600 dark:text-blue-400",
      label: "משתמש חדש",
    },
    enrollment: {
      bg: "bg-emerald-100 dark:bg-emerald-900/30",
      text: "text-emerald-600 dark:text-emerald-400",
      label: "הרשמה לקורס",
    },
    certificate: {
      bg: "bg-amber-100 dark:bg-amber-900/30",
      text: "text-amber-600 dark:text-amber-400",
      label: "תעודת סיום",
    },
  };

  if (activities.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-10 text-center text-sm text-zinc-400 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-500">
        אין פעילות עדיין
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
          פעילות אחרונה
        </h3>
      </div>
      <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {activities.map((activity, idx) => {
          const config = typeConfig[activity.type];
          return (
            <div
              key={`${activity.type}-${activity.timestamp}-${idx}`}
              className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/30"
            >
              <div className={`h-2.5 w-2.5 shrink-0 rounded-full ${config.text.replace("text-", "bg-")}`} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${config.bg} ${config.text}`}>
                    {config.label}
                  </span>
                  <span className="truncate text-sm font-medium text-zinc-900 dark:text-white">
                    {activity.label}
                  </span>
                </div>
                <p className="mt-0.5 truncate text-xs text-zinc-500 dark:text-zinc-400">
                  {activity.detail}
                </p>
              </div>
              <span className="shrink-0 text-xs text-zinc-400 dark:text-zinc-500">
                {formatRelativeTime(activity.timestamp, now)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── DAU Chart (7 bars) ───────────────────────────────────────────────────────

function DailyActiveChart({
  data,
}: {
  data: Array<{ date: string; count: number }>;
}) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="mb-3 text-base font-semibold text-zinc-900 dark:text-white">
        משתמשים פעילים יומי (7 ימים)
      </h3>
      <div className="flex items-end gap-2" style={{ height: 100 }}>
        {data.map((d, idx) => {
          const heightPct = max > 0 ? (d.count / max) * 100 : 0;
          const dayLabel = new Date(d.date).toLocaleDateString("he-IL", {
            weekday: "short",
          });
          return (
            <div
              key={idx}
              className="flex flex-1 flex-col items-center justify-end"
              style={{ height: "100%" }}
            >
              <span className="mb-1 text-[9px] font-medium text-zinc-600 dark:text-zinc-400">
                {d.count > 0 ? d.count : ""}
              </span>
              <div
                className="w-full rounded-t bg-gradient-to-t from-[#1E3A5F] to-[#4a8fd4] transition-all duration-300"
                style={{
                  height: `${Math.max(heightPct, d.count > 0 ? 8 : 2)}%`,
                  minHeight: 2,
                }}
                title={`${d.date}: ${d.count} משתמשים`}
              />
              <span className="mt-1 text-[10px] text-zinc-400 dark:text-zinc-500">
                {dayLabel}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    succeeded: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    failed: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    refunded: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  };
  const labels: Record<string, string> = {
    succeeded: "הצליח",
    pending: "בהמתנה",
    failed: "נכשל",
    refunded: "הוחזר",
  };

  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${map[status] ?? map.pending}`}>
      {labels[status] ?? status}
    </span>
  );
}

// ─── Types for DataTable ──────────────────────────────────────────────────────

type CourseRow = {
  courseId: string;
  title: string;
  published: boolean;
  enrollments: number;
  completionRate: number;
  avgRating: number | null;
  reviewCount: number;
  lessonsCompleted: number;
};

type PaymentRow = {
  id: string;
  userName: string;
  amount: number;
  currency: string;
  status: string;
  description: string;
  createdAt: number;
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminAnalyticsPage() {
  const overviewStats = useQuery(api.adminAnalytics.getOverviewStats);
  const userGrowthRaw = useQuery(api.adminAnalytics.getUserGrowth);
  const courseAnalyticsRaw = useQuery(api.adminAnalytics.getCourseAnalytics);
  const lessonAnalyticsRaw = useQuery(api.adminAnalytics.getLessonAnalytics);
  const engagementRaw = useQuery(api.adminAnalytics.getEngagementMetrics);
  const revenueRaw = useQuery(api.adminAnalytics.getRevenueReport);
  const topStudentsRaw = useQuery(api.adminAnalytics.getTopStudents);
  const recentActivity = useQuery(api.adminAnalytics.getRecentActivityFeed);
  const recentSignupsRaw = useQuery(api.adminAnalytics.getRecentSignups);

  // Type-cast to local interfaces (Convex types auto-generated only after npx convex dev)
  const userGrowth = userGrowthRaw as GrowthDay[] | undefined;
  const courseAnalytics = courseAnalyticsRaw as CourseRow[] | undefined;
  const lessonAnalytics = lessonAnalyticsRaw as { mostViewed: LessonStat[]; leastViewed: LessonStat[]; totalLessons: number } | undefined;
  const engagement = engagementRaw as EngagementData | undefined;
  const revenue = revenueRaw as {
    monthly: { month: string; total: number }[];
    thisMonthRevenue: number;
    lastMonthRevenue: number;
    totalRevenue: number;
    totalPayments: number;
    succeededCount: number;
    recentPayments: PaymentRow[];
  } | undefined;
  const topStudents = topStudentsRaw as StudentData[] | undefined;
  const recentSignups = recentSignupsRaw as SignupUser[] | undefined;

  const now = Date.now();

  // ── Course table columns ──────────────────────────────────────────────────

  const courseColumns: Column<CourseRow>[] = [
    {
      key: "title",
      label: "קורס",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{row.title}</span>
          {!row.published && (
            <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500">
              טיוטה
            </span>
          )}
        </div>
      ),
    },
    {
      key: "enrollments",
      label: "נרשמים",
      sortable: true,
      render: (row) => <span className="font-semibold">{fmt(row.enrollments)}</span>,
      className: "text-center",
      headerClassName: "text-center",
    },
    {
      key: "completionRate",
      label: "השלמה",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div
              className="h-full rounded-full bg-emerald-500"
              style={{ width: `${row.completionRate}%` }}
            />
          </div>
          <span>{row.completionRate}%</span>
        </div>
      ),
    },
    {
      key: "avgRating",
      label: "דירוג",
      sortable: true,
      render: (row) =>
        row.avgRating !== null ? (
          <span className="flex items-center gap-1">
            <span className="text-amber-500">★</span>
            {row.avgRating.toFixed(1)}
            <span className="text-xs text-zinc-400">({row.reviewCount})</span>
          </span>
        ) : (
          <span className="text-zinc-400">—</span>
        ),
    },
  ];

  // ── Payment table columns ─────────────────────────────────────────────────

  const paymentColumns: Column<PaymentRow>[] = [
    {
      key: "userName",
      label: "משתמש",
      sortable: true,
      render: (row) => <span className="font-medium">{row.userName}</span>,
    },
    {
      key: "description",
      label: "תיאור",
      render: (row) => (
        <span className="text-zinc-500 dark:text-zinc-400">{row.description}</span>
      ),
    },
    {
      key: "amount",
      label: "סכום",
      sortable: true,
      render: (row) => (
        <span className="font-semibold text-zinc-900 dark:text-white">
          {fmtCurrency(row.amount)}
        </span>
      ),
      className: "text-center",
      headerClassName: "text-center",
    },
    {
      key: "status",
      label: "סטטוס",
      sortable: true,
      render: (row) => <StatusBadge status={row.status} />,
      className: "text-center",
      headerClassName: "text-center",
    },
    {
      key: "createdAt",
      label: "תאריך",
      sortable: true,
      render: (row) => (
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          {fmtDate(row.createdAt)}
        </span>
      ),
    },
  ];

  return (
    <div dir="rtl">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
            ניתוח נתונים
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            סטטיסטיקות ומגמות מפורטות של מערכת הלימודים
          </p>
        </div>
        <span className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-500 shadow-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
          עדכון אחרון: {new Date().toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>

      {/* ── Row 1: KPI Cards ────────────────────────────────────────────────── */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {!overviewStats ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard
              label="סה״כ משתמשים"
              value={fmt(overviewStats.totalUsers)}
              icon={<UsersIcon />}
              accentColor="bg-[#1E3A5F]/10 text-[#1E3A5F] dark:bg-[#1E3A5F]/20 dark:text-[#4a8fd4]"
              change={overviewStats.userGrowthPercent}
              subtitle={`+${overviewStats.newUsersThisWeek} השבוע`}
            />
            <StatCard
              label="משתמשים פעילים (7י׳)"
              value={fmt(overviewStats.activeUsers7d)}
              icon={<ActiveIcon />}
              accentColor="bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400"
              subtitle={`מתוך ${fmt(overviewStats.totalUsers)} רשומים`}
            />
            <StatCard
              label="סה״כ הרשמות"
              value={fmt(overviewStats.totalEnrollments)}
              icon={<EnrollmentIcon />}
              accentColor="bg-[#E85D75]/10 text-[#E85D75] dark:bg-[#E85D75]/20 dark:text-[#f08090]"
              subtitle={`+${overviewStats.newEnrollmentsThisWeek} השבוע`}
            />
            <StatCard
              label="אחוז השלמה"
              value={`${overviewStats.completionRate}%`}
              icon={<CompletionIcon />}
              accentColor="bg-[#D4A853]/10 text-[#D4A853] dark:bg-[#D4A853]/20 dark:text-[#e0bd6e]"
              subtitle={`${fmt(overviewStats.completions)} שיעורים הושלמו`}
            />
          </>
        )}
      </div>

      {/* ── Row 2: Charts ───────────────────────────────────────────────────── */}
      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        {/* User Growth Chart */}
        {!userGrowth ? (
          <ChartSkeleton height={48} />
        ) : (
          <BarChart
            title="צמיחת משתמשים - 30 יום אחרונים"
            data={userGrowth.map((d) => ({
              label: d.date,
              value: d.count,
            }))}
            height={200}
            unit=" משתמשים"
          />
        )}

        {/* Course Performance Table */}
        {!courseAnalytics ? (
          <ChartSkeleton height={48} />
        ) : (
          <HorizontalBarChart
            title="ביצועי קורסים לפי הרשמות"
            data={courseAnalytics.map((c) => ({
              label: c.title,
              value: c.enrollments,
              sublabel: c.published ? undefined : "(טיוטה)",
            }))}
            barColor="from-[#E85D75] to-[#D4A853]"
            unit=" נרשמים"
          />
        )}
      </div>

      {/* ── Row 3: Engagement ───────────────────────────────────────────────── */}
      <div className="mb-6 grid gap-6 lg:grid-cols-3">
        {/* DAU 7-day */}
        {!engagement ? (
          <ChartSkeleton height={32} />
        ) : (
          <DailyActiveChart data={engagement.dailyActive} />
        )}

        {/* Most Viewed Lessons */}
        {!lessonAnalytics ? (
          <ChartSkeleton height={32} />
        ) : (
          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="border-b border-zinc-200 px-5 py-3 dark:border-zinc-800">
              <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
                שיעורים פופולריים
              </h3>
            </div>
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {lessonAnalytics.mostViewed.slice(0, 6).map((lesson, idx) => (
                <div
                  key={lesson.lessonId}
                  className="flex items-center gap-3 px-5 py-2.5"
                >
                  <span className="w-5 shrink-0 text-center text-sm font-bold text-zinc-400">
                    {idx + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-zinc-800 dark:text-zinc-200">
                      {lesson.title}
                    </p>
                    <p className="truncate text-xs text-zinc-400">
                      {lesson.courseTitle}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-zinc-600 dark:text-zinc-400">
                    {fmt(lesson.views)}
                  </span>
                </div>
              ))}
              {lessonAnalytics.mostViewed.length === 0 && (
                <p className="px-5 py-8 text-center text-sm text-zinc-400">
                  אין נתונים עדיין
                </p>
              )}
            </div>
          </div>
        )}

        {/* Recent Signups */}
        {!recentSignups ? (
          <ChartSkeleton height={32} />
        ) : (
          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="border-b border-zinc-200 px-5 py-3 dark:border-zinc-800">
              <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
                הצטרפויות אחרונות
              </h3>
            </div>
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {recentSignups.slice(0, 6).map((user) => (
                <div
                  key={user.userId}
                  className="flex items-center gap-3 px-5 py-2.5"
                >
                  {user.imageUrl ? (
                    <img
                      src={user.imageUrl}
                      alt={user.name}
                      className="h-7 w-7 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-bold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                      {(user.name ?? user.email).charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-zinc-800 dark:text-zinc-200">
                      {user.name ?? user.email}
                    </p>
                    <p className="truncate text-xs text-zinc-400">{user.email}</p>
                  </div>
                  <span className="shrink-0 text-xs text-zinc-400 dark:text-zinc-500">
                    {formatRelativeTime(user.joinedAt, now)}
                  </span>
                </div>
              ))}
              {recentSignups.length === 0 && (
                <p className="px-5 py-8 text-center text-sm text-zinc-400">
                  אין נתונים עדיין
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Row 4: Course Analytics Table ──────────────────────────────────── */}
      <div className="mb-6">
        {!courseAnalytics ? (
          <TableSkeleton rows={5} />
        ) : (
          <DataTable
            title="ניתוח קורסים מפורט"
            columns={courseColumns}
            data={courseAnalytics}
            emptyMessage="אין קורסים עדיין"
          />
        )}
      </div>

      {/* ── Row 5: Revenue ──────────────────────────────────────────────────── */}
      <div className="mb-6">
        <SectionTitle>דו״ח הכנסות</SectionTitle>
        {!revenue ? (
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </div>
        ) : (
          <>
            <div className="mb-4 grid gap-4 sm:grid-cols-3">
              <RevenueCard
                label="הכנסות החודש"
                amount={revenue.thisMonthRevenue}
                accent="green"
                sublabel={`${fmt(revenue.succeededCount)} תשלומים הצליחו`}
              />
              <RevenueCard
                label="הכנסות חודש קודם"
                amount={revenue.lastMonthRevenue}
                accent="blue"
              />
              <RevenueCard
                label="סה״כ הכנסות"
                amount={revenue.totalRevenue}
                accent="amber"
                sublabel={`${fmt(revenue.totalPayments)} תשלומים בסה״כ`}
              />
            </div>

            {revenue.recentPayments.length > 0 && (
              <DataTable
                title="היסטוריית תשלומים אחרונה"
                columns={paymentColumns}
                data={revenue.recentPayments}
                maxRows={15}
                emptyMessage="אין תשלומים עדיין"
              />
            )}
          </>
        )}
      </div>

      {/* ── Row 6: Top Students ─────────────────────────────────────────────── */}
      <div className="mb-6">
        <SectionTitle>לוח מובילים - טופ 10 סטודנטים</SectionTitle>
        {!topStudents ? (
          <TableSkeleton rows={10} />
        ) : (
          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="overflow-x-auto">
              <table className="w-full text-sm" dir="rtl">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/50">
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 w-10">
                      #
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      סטודנט
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      XP
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      שיעורים
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      פעיל (30י׳)
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      תעודות
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      קורסים
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {topStudents.map((student, idx) => (
                    <tr
                      key={student.userId}
                      className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/30"
                    >
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                            idx === 0
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
                              : idx === 1
                              ? "bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300"
                              : idx === 2
                              ? "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400"
                              : "text-zinc-400"
                          }`}
                        >
                          {idx + 1}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          {student.imageUrl ? (
                            <img
                              src={student.imageUrl}
                              alt={student.name ?? ""}
                              className="h-8 w-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#1E3A5F] to-[#E85D75] text-xs font-bold text-white">
                              {(student.name ?? student.email)
                                .charAt(0)
                                .toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-zinc-900 dark:text-white">
                              {student.name ?? student.email}
                            </div>
                            <div className="text-xs text-zinc-400">
                              {student.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-[#D4A853]">
                        {fmt(student.xp)}
                      </td>
                      <td className="px-4 py-3 text-center text-zinc-700 dark:text-zinc-300">
                        {fmt(student.lessonsCompleted)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="flex items-center justify-center gap-1">
                          <span className="text-orange-500">🔥</span>
                          {student.streak}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-zinc-700 dark:text-zinc-300">
                        {student.certsCount > 0 ? (
                          <span className="flex items-center justify-center gap-1">
                            🏆 {student.certsCount}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3 text-center text-zinc-700 dark:text-zinc-300">
                        {fmt(student.coursesEnrolled)}
                      </td>
                    </tr>
                  ))}
                  {topStudents.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-12 text-center text-sm text-zinc-400"
                      >
                        אין סטודנטים עדיין
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ── Row 7: Activity Feed ─────────────────────────────────────────────── */}
      <div className="mb-6">
        {!recentActivity ? (
          <TableSkeleton rows={6} />
        ) : (
          <ActivityFeed activities={recentActivity} />
        )}
      </div>

      {/* ── Row 8: Engagement Summary ────────────────────────────────────────── */}
      {engagement && (
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              משתמשים פעילים (7י׳)
            </p>
            <p className="mt-2 text-2xl font-bold text-zinc-900 dark:text-white">
              {fmt(engagement.uniqueActiveUsers7d)}
            </p>
            <MiniSparkline
              data={engagement.dailyActive.map((d) => d.count)}
              positive={true}
            />
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              ממוצע שיעורים למשתמש
            </p>
            <p className="mt-2 text-2xl font-bold text-zinc-900 dark:text-white">
              {engagement.avgLessonsPerUser}
            </p>
            <p className="mt-1 text-xs text-zinc-400">ב-7 ימים האחרונים</p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              אחוז השלמת שיעורים
            </p>
            <p className="mt-2 text-2xl font-bold text-zinc-900 dark:text-white">
              {engagement.overallCompletionRate}%
            </p>
            <p className="mt-1 text-xs text-zinc-400">
              מסה״כ {fmt(engagement.totalLessonViews)} צפיות
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              סה״כ צפיות בשיעורים
            </p>
            <p className="mt-2 text-2xl font-bold text-zinc-900 dark:text-white">
              {fmt(engagement.totalLessonViews)}
            </p>
            <p className="mt-1 text-xs text-zinc-400">מכל הזמנים</p>
          </div>
        </div>
      )}
    </div>
  );
}
