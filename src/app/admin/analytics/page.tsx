"use client";

import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { formatRelativeTime } from "@/lib/admin-utils";

// ─── Icons (inline SVGs) ──────────────────────────────────────────────────────

function UsersIcon() {
  return (
    <svg
      className="h-6 w-6"
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
  );
}

function EnrollmentIcon() {
  return (
    <svg
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342"
      />
    </svg>
  );
}

function CertificateIcon() {
  return (
    <svg
      className="h-6 w-6"
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
  );
}

function ChatIcon() {
  return (
    <svg
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"
      />
    </svg>
  );
}

function SimulatorIcon() {
  return (
    <svg
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
      />
    </svg>
  );
}

function CommunityIcon() {
  return (
    <svg
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
      />
    </svg>
  );
}

function CourseIcon() {
  return (
    <svg
      className="h-6 w-6"
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
  );
}

function MailIcon() {
  return (
    <svg
      className="h-6 w-6"
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
  );
}

// ─── Metric Card ───────────────────────────────────────────────────────────────

function MetricCard({
  label,
  value,
  icon,
  accentColor,
  badge,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  accentColor: string;
  badge?: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            {label}
          </p>
          <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white">
            {value}
          </p>
          {badge && (
            <span className="mt-2 inline-block rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
              {badge}
            </span>
          )}
        </div>
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${accentColor}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="h-4 w-20 rounded bg-zinc-200 dark:bg-zinc-700" />
          <div className="mt-3 h-8 w-16 rounded bg-zinc-200 dark:bg-zinc-700" />
        </div>
        <div className="h-12 w-12 rounded-xl bg-zinc-200 dark:bg-zinc-700" />
      </div>
    </div>
  );
}

function SkeletonChart() {
  return (
    <div className="animate-pulse rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-4 h-5 w-32 rounded bg-zinc-200 dark:bg-zinc-700" />
      <div className="h-48 rounded bg-zinc-100 dark:bg-zinc-800" />
    </div>
  );
}

// ─── Bar Chart (CSS only) ─────────────────────────────────────────────────────

function UserGrowthChart({
  data,
}: {
  data: Array<{ date: string; count: number }>;
}) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">
        צמיחת משתמשים - 30 יום אחרונים
      </h2>
      <div className="flex items-end gap-[3px]" style={{ height: 180 }}>
        {data.map((day, idx) => {
          const heightPercent = maxCount > 0 ? (day.count / maxCount) * 100 : 0;
          const showLabel = idx % 7 === 0 || idx === data.length - 1;
          const dateLabel = day.date.slice(5); // MM-DD

          return (
            <div
              key={day.date}
              className="flex flex-1 flex-col items-center justify-end"
              style={{ height: "100%" }}
            >
              <div
                className="w-full rounded-t bg-gradient-to-t from-[#1E3A5F] to-[#2d5a8f] transition-all duration-300 hover:from-[#E85D75] hover:to-[#f08090] dark:from-[#2d5a8f] dark:to-[#4a7ab5]"
                style={{
                  height: `${Math.max(heightPercent, day.count > 0 ? 8 : 2)}%`,
                  minHeight: day.count > 0 ? 6 : 2,
                }}
                title={`${day.date}: ${day.count} משתמשים חדשים`}
              />
              {showLabel && (
                <span className="mt-1.5 text-[10px] text-zinc-400 dark:text-zinc-500">
                  {dateLabel}
                </span>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex items-center gap-2 text-xs text-zinc-400 dark:text-zinc-500">
        <div className="h-2.5 w-2.5 rounded-sm bg-[#1E3A5F]" />
        משתמשים חדשים ליום
      </div>
    </div>
  );
}

// ─── Horizontal Bar Chart ──────────────────────────────────────────────────────

function CoursePopularityChart({
  data,
}: {
  data: Array<{
    courseId: string;
    title: string;
    enrollments: number;
    published: boolean;
  }>;
}) {
  const maxEnrollments = Math.max(...data.map((d) => d.enrollments), 1);

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">
        פופולריות קורסים
      </h2>
      {data.length === 0 ? (
        <p className="py-8 text-center text-sm text-zinc-400 dark:text-zinc-500">
          אין קורסים עדיין
        </p>
      ) : (
        <div className="space-y-3">
          {data.map((course) => {
            const widthPercent =
              maxEnrollments > 0
                ? (course.enrollments / maxEnrollments) * 100
                : 0;

            return (
              <div key={course.courseId}>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    {course.title}
                    {!course.published && (
                      <span className="mr-2 rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500">
                        טיוטה
                      </span>
                    )}
                  </span>
                  <span className="text-sm font-semibold text-zinc-900 dark:text-white">
                    {course.enrollments}
                  </span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-l from-[#E85D75] to-[#D4A853] transition-all duration-500"
                    style={{ width: `${Math.max(widthPercent, 2)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
      <div className="mt-3 flex items-center gap-2 text-xs text-zinc-400 dark:text-zinc-500">
        <div className="h-2.5 w-2.5 rounded-sm bg-[#E85D75]" />
        הרשמות לקורס
      </div>
    </div>
  );
}

// ─── Activity Feed ─────────────────────────────────────────────────────────────

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
      icon: (
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
      ),
    },
    enrollment: {
      bg: "bg-emerald-100 dark:bg-emerald-900/30",
      text: "text-emerald-600 dark:text-emerald-400",
      label: "הרשמה לקורס",
      icon: (
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
            d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342"
          />
        </svg>
      ),
    },
    certificate: {
      bg: "bg-amber-100 dark:bg-amber-900/30",
      text: "text-amber-600 dark:text-amber-400",
      label: "תעודת סיום",
      icon: (
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
            d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.023 6.023 0 01-2.77.853m0 0H10.5m3.27-.853a6.02 6.02 0 002.77.853"
          />
        </svg>
      ),
    },
  };

  return (
    <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
          פעילות אחרונה
        </h2>
      </div>
      {activities.length === 0 ? (
        <div className="px-5 py-10 text-center text-sm text-zinc-400 dark:text-zinc-500">
          אין פעילות עדיין
        </div>
      ) : (
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {activities.map((activity, idx) => {
            const config = typeConfig[activity.type];
            return (
              <div
                key={`${activity.type}-${activity.timestamp}-${idx}`}
                className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/30"
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${config.bg} ${config.text}`}
                >
                  {config.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${config.bg} ${config.text}`}
                    >
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
      )}
    </div>
  );
}

// ─── Page Component ────────────────────────────────────────────────────────────

export default function AdminAnalyticsPage() {
  const overviewStats = useQuery(api.adminAnalytics.getOverviewStats);
  const userGrowth = useQuery(api.adminAnalytics.getUserGrowth);
  const coursePopularity = useQuery(api.adminAnalytics.getCoursePopularity);
  const recentActivity = useQuery(api.adminAnalytics.getRecentActivityFeed);

  const isLoading = !overviewStats;

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          ניתוח נתונים
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          סטטיסטיקות ומגמות מפורטות של מערכת הלימודים
        </p>
      </div>

      {/* Row 1: Key Metrics */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <MetricCard
              label="משתמשים"
              value={overviewStats.totalUsers}
              icon={<UsersIcon />}
              accentColor="bg-[#1E3A5F]/10 text-[#1E3A5F] dark:bg-[#1E3A5F]/20 dark:text-[#4a8fd4]"
              badge={
                overviewStats.newUsersThisWeek > 0
                  ? `+${overviewStats.newUsersThisWeek} השבוע`
                  : undefined
              }
            />
            <MetricCard
              label="הרשמות לקורסים"
              value={overviewStats.totalEnrollments}
              icon={<EnrollmentIcon />}
              accentColor="bg-[#E85D75]/10 text-[#E85D75] dark:bg-[#E85D75]/20 dark:text-[#f08090]"
              badge={
                overviewStats.newEnrollmentsThisWeek > 0
                  ? `+${overviewStats.newEnrollmentsThisWeek} השבוע`
                  : undefined
              }
            />
            <MetricCard
              label="תעודות שהונפקו"
              value={overviewStats.totalCertificates}
              icon={<CertificateIcon />}
              accentColor="bg-[#D4A853]/10 text-[#D4A853] dark:bg-[#D4A853]/20 dark:text-[#e0bd6e]"
            />
            <MetricCard
              label="שיחות צ'אט"
              value={overviewStats.totalChatSessions}
              icon={<ChatIcon />}
              accentColor="bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400"
            />
          </>
        )}
      </div>

      {/* Row 2: Secondary Metrics */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <MetricCard
              label="סימולציות דייטינג"
              value={overviewStats.totalSimSessions}
              icon={<SimulatorIcon />}
              accentColor="bg-pink-500/10 text-pink-600 dark:bg-pink-500/20 dark:text-pink-400"
            />
            <MetricCard
              label="פוסטים בקהילה"
              value={overviewStats.totalTopics}
              icon={<CommunityIcon />}
              accentColor="bg-violet-500/10 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400"
            />
            <MetricCard
              label="קורסים מפורסמים"
              value={`${overviewStats.publishedCourses} / ${overviewStats.totalCourses}`}
              icon={<CourseIcon />}
              accentColor="bg-cyan-500/10 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400"
            />
            <MetricCard
              label="פניות חדשות"
              value={overviewStats.newContacts}
              icon={<MailIcon />}
              accentColor="bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400"
            />
          </>
        )}
      </div>

      {/* Row 3: Charts */}
      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        {!userGrowth ? (
          <SkeletonChart />
        ) : (
          <UserGrowthChart data={userGrowth} />
        )}
        {!coursePopularity ? (
          <SkeletonChart />
        ) : (
          <CoursePopularityChart data={coursePopularity} />
        )}
      </div>

      {/* Row 4: Recent Activity Feed */}
      {!recentActivity ? (
        <SkeletonChart />
      ) : (
        <ActivityFeed activities={recentActivity} />
      )}
    </div>
  );
}
