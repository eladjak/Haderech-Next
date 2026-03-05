"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { SUBSCRIPTION_TIERS, formatPrice } from "@/lib/pricing";

// ---- Plan feature lists (Hebrew) ----

const PLAN_FEATURES: Record<string, string[]> = {
  free: [
    "5 שיעורים ראשונים",
    "10 הודעות AI בחודש",
    "2 תרחישי סימולטור",
    "גישה בסיסית לקהילה",
  ],
  basic: [
    "כל 73 השיעורים",
    "100 הודעות AI בחודש",
    "10 תרחישי סימולטור",
    "ספריית משאבים מלאה",
    "תעודת סיום",
  ],
  premium: [
    "כל 73 השיעורים",
    "AI ללא הגבלה + זיכרון מלא",
    "כל תרחישי הסימולטור + קול ווידאו",
    "כלים ללא הגבלות",
    "קהילה מלאה + סטטוס פרימיום",
    "גישה אופליין",
  ],
  vip: [
    "הכל בפרימיום +",
    "קואצ'ינג קבוצתי חי עם אלעד",
    "מאסטרקלאסים בלעדיים",
    "דוחות AI מתקדמים",
    "סטטוס VIP בקהילה",
    "תמיכה בעדיפות",
  ],
};

// ---- Status badge ----

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    active: {
      label: "פעיל",
      className:
        "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
    },
    cancelled: {
      label: "בוטל",
      className:
        "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400",
    },
    past_due: {
      label: "חוב",
      className:
        "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
    },
    trialing: {
      label: "תקופת ניסיון",
      className:
        "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
    },
  };

  const c = config[status] || config.active;
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${c.className}`}
    >
      {c.label}
    </span>
  );
}

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

// ---- Plan name map ----

const PLAN_NAMES: Record<string, string> = {
  free: "טעימה (חינם)",
  basic: "מגלה",
  premium: "משנה",
  vip: "מוביל",
};

// ---- Main Page ----

export default function BillingPage() {
  const subscription = useQuery(api.subscriptions.getCurrentSubscription);
  const payments = useQuery(api.subscriptions.getPaymentHistory);

  const currentPlan = subscription?.plan ?? "free";
  const currentStatus = subscription?.status ?? "active";

  return (
    <div className="min-h-dvh bg-white dark:bg-zinc-950">
      <Header />

      <main className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-3xl">
          {/* Page heading */}
          <div className="mb-10">
            <h1 className="mb-1.5 text-3xl font-bold text-zinc-900 dark:text-white">
              חיוב ומנוי
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400">
              ניהול המנוי, תוכנית התשלום והיסטוריית החיובים שלך
            </p>
          </div>

          {/* ── Current Plan ── */}
          <section className="mb-6 rounded-2xl border border-zinc-200 p-6 dark:border-zinc-800">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-base font-semibold text-zinc-900 dark:text-white">
                התוכנית הנוכחית
              </h2>
              <StatusBadge status={currentStatus} />
            </div>

            <div className="mb-4 flex items-center gap-3">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl text-white"
                style={{
                  background:
                    SUBSCRIPTION_TIERS.find((t) => t.id === currentPlan)
                      ?.accentColor ?? "#6B7280",
                }}
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-lg font-bold text-zinc-900 dark:text-white">
                  {PLAN_NAMES[currentPlan] ?? "טעימה (חינם)"}
                </p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {currentPlan === "free"
                    ? "גרסה חינמית - שדרגו לגישה מלאה"
                    : SUBSCRIPTION_TIERS.find((t) => t.id === currentPlan)
                        ?.subtitle ?? ""}
                </p>
              </div>
            </div>

            {/* Feature list */}
            <ul className="mb-6 space-y-2">
              {(PLAN_FEATURES[currentPlan] ?? PLAN_FEATURES.free).map(
                (feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400"
                  >
                    <svg
                      className="h-4 w-4 flex-shrink-0 text-emerald-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 12.75l6 6 9-13.5"
                      />
                    </svg>
                    {feature}
                  </li>
                )
              )}
            </ul>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/pricing"
                className="inline-flex h-10 items-center rounded-full bg-gradient-to-l from-brand-500 to-brand-600 px-6 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md hover:brightness-110"
              >
                {currentPlan === "free" ? "שדרג תוכנית" : "שנה תוכנית"}
              </Link>
              {currentPlan !== "free" && (
                <button
                  type="button"
                  disabled
                  className="inline-flex h-10 cursor-not-allowed items-center rounded-full border border-red-200 bg-red-50 px-6 text-sm font-medium text-red-700 opacity-60 dark:border-red-800 dark:bg-red-950 dark:text-red-400"
                  title="ביטול ייכנס לתוקף בסוף תקופת החיוב"
                >
                  בטל מנוי
                </button>
              )}
            </div>
            {currentPlan !== "free" && (
              <p className="mt-3 text-xs text-zinc-400 dark:text-zinc-500">
                * ביטול ייכנס לתוקף בסוף תקופת החיוב הנוכחית
              </p>
            )}
          </section>

          {/* ── Available Plans ── */}
          <section className="mb-6 rounded-2xl border border-zinc-200 p-6 dark:border-zinc-800">
            <h2 className="mb-5 text-base font-semibold text-zinc-900 dark:text-white">
              תוכניות זמינות
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {SUBSCRIPTION_TIERS.filter((t) => t.id !== "free").map((tier) => (
                <div
                  key={tier.id}
                  className={`relative rounded-xl border p-5 transition-all ${
                    tier.id === currentPlan
                      ? "border-brand-300 bg-brand-50/50 dark:border-brand-700 dark:bg-brand-950/30"
                      : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700"
                  }`}
                >
                  {tier.badge && (
                    <span className="absolute -top-2.5 right-4 rounded-full bg-gradient-to-l from-brand-500 to-brand-600 px-3 py-0.5 text-xs font-medium text-white">
                      {tier.badge}
                    </span>
                  )}
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                      {tier.name}
                    </h3>
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-white"
                      style={{ background: tier.accentColor }}
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
                          d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
                        />
                      </svg>
                    </div>
                  </div>
                  <p className="mb-3 text-xs text-zinc-500 dark:text-zinc-400">
                    {tier.subtitle}
                  </p>
                  <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                    {formatPrice(tier.priceMonthly)}
                    {tier.priceMonthly && (
                      <span className="text-sm font-normal text-zinc-400">
                        /חודש
                      </span>
                    )}
                  </p>
                  {tier.id === currentPlan && (
                    <p className="mt-2 text-xs font-medium text-brand-600 dark:text-brand-400">
                      התוכנית הנוכחית שלך
                    </p>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-800 dark:bg-emerald-950/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-zinc-900 dark:text-white">
                    הקורס המלא
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    רכישה חד-פעמית - גישה לצמיתות
                  </p>
                </div>
                <p className="text-xl font-bold text-zinc-900 dark:text-white">
                  {formatPrice(1197)}
                </p>
              </div>
            </div>
          </section>

          {/* ── Payment History ── */}
          <section className="mb-6 rounded-2xl border border-zinc-200 p-6 dark:border-zinc-800">
            <h2 className="mb-5 text-base font-semibold text-zinc-900 dark:text-white">
              היסטוריית תשלומים
            </h2>

            {payments === undefined ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-12 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800"
                  />
                ))}
              </div>
            ) : payments.length === 0 ? (
              <div className="rounded-xl border border-dashed border-zinc-200 py-10 text-center dark:border-zinc-700">
                <svg
                  className="mx-auto mb-3 h-10 w-10 text-zinc-300 dark:text-zinc-600"
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
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  אין תשלומים עדיין
                </p>
                <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
                  כשתשדרגו את התוכנית, התשלומים יופיעו כאן
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-100 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                      <th className="pb-2 pr-0 text-right font-medium">
                        תאריך
                      </th>
                      <th className="pb-2 text-right font-medium">תיאור</th>
                      <th className="pb-2 text-right font-medium">סכום</th>
                      <th className="pb-2 pl-0 text-right font-medium">
                        סטטוס
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                    {payments.map((payment) => (
                      <tr key={payment._id}>
                        <td className="py-3 pr-0 text-zinc-600 dark:text-zinc-400">
                          {new Date(payment.createdAt).toLocaleDateString(
                            "he-IL"
                          )}
                        </td>
                        <td className="py-3 text-zinc-900 dark:text-white">
                          {payment.description}
                        </td>
                        <td className="py-3 font-medium text-zinc-900 dark:text-white">
                          {formatPrice(payment.amount / 100)}
                        </td>
                        <td className="py-3 pl-0">
                          <PaymentStatusBadge status={payment.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* ── Quick Links ── */}
          <div className="flex flex-wrap gap-3 text-sm">
            <Link
              href="/settings"
              className="text-brand-600 hover:underline dark:text-brand-400"
            >
              הגדרות חשבון
            </Link>
            <span className="text-zinc-300 dark:text-zinc-600">|</span>
            <Link
              href="/contact"
              className="text-brand-600 hover:underline dark:text-brand-400"
            >
              צרו קשר לתמיכה
            </Link>
            <span className="text-zinc-300 dark:text-zinc-600">|</span>
            <Link
              href="/pricing"
              className="text-brand-600 hover:underline dark:text-brand-400"
            >
              השוואת תוכניות מלאה
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
