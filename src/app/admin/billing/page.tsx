"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { formatPrice } from "@/lib/pricing";

// ---- Plan colors ----

const PLAN_COLORS: Record<string, string> = {
  free: "#6B7280",
  basic: "#3B82F6",
  premium: "#8B5CF6",
  vip: "#F59E0B",
};

const PLAN_NAMES: Record<string, string> = {
  free: "טעימה",
  basic: "מגלה",
  premium: "משנה",
  vip: "מוביל",
};

// ---- Payment status badge ----

function PaymentStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    succeeded: {
      label: "הצליח",
      className:
        "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
    },
    pending: {
      label: "ממתין",
      className:
        "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
    },
    failed: {
      label: "נכשל",
      className: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400",
    },
    refunded: {
      label: "הוחזר",
      className:
        "bg-zinc-50 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400",
    },
  };

  const c = config[status] || config.pending;
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${c.className}`}
    >
      {c.label}
    </span>
  );
}

// ---- Main Page ----

export default function AdminBillingPage() {
  const stats = useQuery(api.subscriptions.getStats);

  const totalActive = stats?.activeSubscriptions ?? 0;
  const planCounts = stats?.planCounts ?? { free: 0, basic: 0, premium: 0, vip: 0 };
  const totalRevenue = stats?.totalRevenue ?? 0;
  const totalPayments = stats?.totalPayments ?? 0;

  // Calculate percentages for the plan distribution visual
  const planEntries = Object.entries(planCounts) as [string, number][];
  const maxCount = Math.max(...planEntries.map(([, v]) => v), 1);

  return (
    <div>
      <div className="mb-8">
        <h1 className="mb-1.5 text-2xl font-bold text-zinc-900 dark:text-white">
          חיובים ומנויים
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          סקירת הכנסות, מנויים פעילים והיסטוריית תשלומים
        </p>
      </div>

      {/* ── Stats Grid ── */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="סה&quot;כ מנויים"
          value={stats?.totalSubscriptions?.toString() ?? "0"}
          subtitle="כולל חינמיים"
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
        />
        <StatCard
          title="מנויים פעילים"
          value={totalActive.toString()}
          subtitle="סטטוס פעיל"
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
        />
        <StatCard
          title="סה&quot;כ הכנסות"
          value={formatPrice(totalRevenue / 100)}
          subtitle="מתשלומים שהצליחו"
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
                d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"
              />
            </svg>
          }
        />
        <StatCard
          title="מספר תשלומים"
          value={totalPayments.toString()}
          subtitle="כלל הזמנים"
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
                d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
              />
            </svg>
          }
        />
      </div>

      {/* ── Subscription Distribution ── */}
      <section className="mb-8 rounded-2xl border border-zinc-200 p-6 dark:border-zinc-800">
        <h2 className="mb-5 text-base font-semibold text-zinc-900 dark:text-white">
          חלוקת מנויים לפי תוכנית
        </h2>

        {stats === undefined ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-10 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800"
              />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {planEntries.map(([plan, count]) => {
              const percentage =
                totalActive > 0
                  ? Math.round((count / totalActive) * 100)
                  : 0;
              const barWidth =
                maxCount > 0 ? Math.max((count / maxCount) * 100, 2) : 2;

              return (
                <div key={plan}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{
                          backgroundColor:
                            PLAN_COLORS[plan] ?? "#6B7280",
                        }}
                      />
                      <span className="font-medium text-zinc-900 dark:text-white">
                        {PLAN_NAMES[plan] ?? plan}
                      </span>
                    </div>
                    <span className="text-zinc-500 dark:text-zinc-400">
                      {count} ({percentage}%)
                    </span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${barWidth}%`,
                        backgroundColor:
                          PLAN_COLORS[plan] ?? "#6B7280",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Visual summary circles */}
        {stats && (
          <div className="mt-6 flex justify-center gap-6">
            {planEntries
              .filter(([, count]) => count > 0)
              .map(([plan, count]) => {
                const percentage =
                  totalActive > 0
                    ? Math.round((count / totalActive) * 100)
                    : 0;
                return (
                  <div key={plan} className="text-center">
                    <div
                      className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full text-white text-sm font-bold"
                      style={{
                        backgroundColor:
                          PLAN_COLORS[plan] ?? "#6B7280",
                      }}
                    >
                      {percentage}%
                    </div>
                    <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                      {PLAN_NAMES[plan] ?? plan}
                    </p>
                  </div>
                );
              })}
          </div>
        )}
      </section>

      {/* ── Revenue Note ── */}
      <section className="rounded-2xl border border-zinc-200 p-6 dark:border-zinc-800">
        <h2 className="mb-5 text-base font-semibold text-zinc-900 dark:text-white">
          סיכום הכנסות
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-zinc-100 p-4 dark:border-zinc-800">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              סה&quot;כ הכנסות (כלל הזמנים)
            </p>
            <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-white">
              {formatPrice(totalRevenue / 100)}
            </p>
          </div>
          <div className="rounded-xl border border-zinc-100 p-4 dark:border-zinc-800">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              מנויים משלמים (לא חינם)
            </p>
            <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-white">
              {(planCounts.basic + planCounts.premium + planCounts.vip).toString()}
            </p>
          </div>
        </div>
        <p className="mt-4 text-xs text-zinc-400 dark:text-zinc-500">
          * הנתונים מעודכנים בזמן אמת. חיבור ל-Stripe יאפשר מעקב מפורט יותר.
        </p>
      </section>
    </div>
  );
}

// ---- Stat Card ----

function StatCard({
  title,
  value,
  subtitle,
  icon,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          {title}
        </p>
        <div className="text-zinc-400 dark:text-zinc-500">{icon}</div>
      </div>
      <p className="text-2xl font-bold text-zinc-900 dark:text-white">
        {value}
      </p>
      <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">
        {subtitle}
      </p>
    </div>
  );
}
