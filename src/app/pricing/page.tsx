"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAction } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { useSubscription } from "@/hooks/useSubscription";
import {
  PRICING_TIERS,
  ADD_ONS,
  PRICING_PAGE_CONTENT,
  SOCIAL_PROOF,
  formatPrice,
  calculateAnnualSavings,
  generateComparisonMatrix,
  type PricingTier,
  type FeatureValue,
  type AddOn,
} from "@/lib/pricing";

// ---------------------------------------------------------------------------
// Animation Variants
// ---------------------------------------------------------------------------

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

// ---------------------------------------------------------------------------
// Feature Value Renderer
// ---------------------------------------------------------------------------

function FeatureValueCell({ value }: { value: FeatureValue }) {
  if (value === false) {
    return (
      <span className="flex items-center justify-center" aria-label="לא כלול">
        <svg className="h-5 w-5 text-zinc-300 dark:text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </span>
    );
  }

  if (value === true) {
    return (
      <span className="flex items-center justify-center" aria-label="כלול">
        <svg className="h-5 w-5 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      </span>
    );
  }

  if (typeof value === "object" && "value" in value) {
    return (
      <span className="text-center text-xs font-medium text-blue-500 dark:text-zinc-300">
        {value.value} <span className="text-blue-500/50 dark:text-zinc-500">{value.unit}</span>
      </span>
    );
  }

  return (
    <span className="text-center text-xs font-medium text-blue-500 dark:text-zinc-300">
      {String(value)}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Main Pricing Card
// ---------------------------------------------------------------------------

function MainPricingCard({
  tier,
  isAnnual,
  onCheckout,
  isCheckingOut,
  currentPlan,
}: {
  tier: PricingTier;
  isAnnual: boolean;
  onCheckout: (plan: "basic" | "premium") => void;
  isCheckingOut: boolean;
  currentPlan: string;
}) {
  const price = isAnnual ? tier.effectiveMonthlyOnAnnual : tier.priceMonthly;
  const savings = calculateAnnualSavings(tier);

  const tierCtaText: Record<string, string> = {
    free: "התחל בחינם",
    basic: "התחל עם מגלה",
    premium: "התחל עם משנה",
    vip: "הצטרף ל-VIP",
    course: "רכוש את הקורס",
  };

  const isCurrentPlan = currentPlan === tier.id;
  const isPaidTier = tier.id === "basic" || tier.id === "premium";

  const isHighlighted = tier.isRecommended;

  const featureHighlights: Record<string, string[]> = {
    free: [
      "5 שיעורים ראשונים",
      "10 הודעות AI בחודש",
      "2 תרחישי סימולטור",
      "ספריית מאמרים",
    ],
    basic: [
      "כל 73 השיעורים",
      "100 הודעות AI בחודש",
      "10 תרחישי סימולטור",
      "ספרייה מלאה",
      "ניתוח תמונות (3/חודש)",
      "תעודת סיום",
    ],
    premium: [
      "כל 73 השיעורים",
      "AI ללא הגבלה + זיכרון מלא",
      "כל תרחישי הסימולטור",
      "סימולטור קולי + וידאו",
      "קהילה פעילה + לוח מובילים",
      "ניתוח תמונות ודייטים ללא הגבלה",
      "צפייה בהקלטות מאסטרקלאסים",
      "דוחות שבועיים מפורטים",
    ],
    vip: [
      "הכל במשנה +",
      "2 מפגשי קואצ׳ינג קבוצתיים חיים/חודש",
      "מאסטרקלאסים חיים + Q&A",
      "דוחות AI מתקדמים + תוכנית פעולה",
      "סטטוס VIP זהב בקהילה",
      "גישה מוקדמת לכל תכנים חדשים",
      "תמיכה בעדיפות (מענה תוך 4 שעות)",
    ],
  };

  return (
    <motion.div
      variants={fadeIn}
      className={`relative flex flex-col rounded-2xl border p-6 transition-all ${
        isHighlighted
          ? "border-brand-300 bg-gradient-to-b from-brand-50 to-white shadow-xl shadow-brand-500/10 dark:border-brand-500/40 dark:from-brand-50/10 dark:to-blue-50/5 scale-[1.02] md:scale-105"
          : "border-brand-100/30 bg-white dark:border-blue-100/10 dark:bg-blue-50/5"
      }`}
    >
      {/* Recommended badge */}
      {tier.badge && (
        <div className="absolute -top-3 right-1/2 translate-x-1/2">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold shadow-lg ${
              tier.id === "vip"
                ? "bg-gradient-to-l from-accent-400 to-accent-300 text-white"
                : "bg-gradient-to-l from-brand-500 to-brand-600 text-white"
            }`}
          >
            {tier.badge}
          </span>
        </div>
      )}

      {/* Tier header */}
      <div className="mb-6">
        <h3 className="mb-1 text-xl font-bold text-blue-500 dark:text-white">
          {tier.name}
        </h3>
        <p className="text-sm text-blue-500/60 dark:text-zinc-400">
          {tier.subtitle}
        </p>
      </div>

      {/* Price */}
      <div className="mb-6">
        {tier.priceMonthly === null && tier.priceOneTime === null ? (
          <div className="flex items-end gap-1">
            <span className="text-4xl font-extrabold text-blue-500 dark:text-white">
              חינם
            </span>
            <span className="mb-1 text-sm text-blue-500/50 dark:text-zinc-500">
              לתמיד
            </span>
          </div>
        ) : (
          <div>
            <div className="flex items-end gap-1">
              <span className="text-4xl font-extrabold text-blue-500 dark:text-white">
                {formatPrice(price)}
              </span>
              <span className="mb-1.5 text-sm text-blue-500/50 dark:text-zinc-500">
                לחודש
              </span>
            </div>
            {isAnnual && tier.priceAnnual && (
              <div className="mt-1 flex items-center gap-2">
                <span className="text-xs text-blue-500/50 dark:text-zinc-500">
                  ₪{tier.priceAnnual} לשנה
                </span>
                {tier.annualSavingsPercent && (
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    חיסכון {tier.annualSavingsPercent}%
                  </span>
                )}
              </div>
            )}
            {isAnnual && savings && savings > 0 && (
              <p className="mt-0.5 text-xs text-blue-500/40 dark:text-zinc-500">
                חוסך ₪{savings} לשנה לעומת חיסכון חודשי
              </p>
            )}
            {!isAnnual && tier.annualSavingsPercent && (
              <p className="mt-1 text-xs text-brand-500">
                ← חסוך {tier.annualSavingsPercent}% עם תוכנית שנתית
              </p>
            )}
          </div>
        )}
      </div>

      {/* Features */}
      <ul className="mb-8 flex flex-col gap-2.5" role="list">
        {(featureHighlights[tier.id] ?? []).map((feature) => (
          <li key={feature} className="flex items-start gap-2.5">
            <svg
              className="mt-0.5 h-4 w-4 shrink-0 text-brand-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            <span className="text-sm text-blue-500/80 dark:text-zinc-300">
              {feature}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <div className="mt-auto">
        {isCurrentPlan ? (
          <div className="flex h-11 w-full items-center justify-center rounded-xl border border-green-300 bg-green-50 text-sm font-semibold text-green-700 dark:border-green-700 dark:bg-green-900/20 dark:text-green-400">
            התוכנית הנוכחית שלך
          </div>
        ) : isPaidTier ? (
          <button
            type="button"
            onClick={() => onCheckout(tier.id as "basic" | "premium")}
            disabled={isCheckingOut}
            className={`flex h-11 w-full items-center justify-center rounded-xl text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              isHighlighted
                ? "bg-gradient-to-l from-brand-500 to-brand-600 text-white shadow-lg shadow-brand-500/25 hover:shadow-xl hover:brightness-110"
                : "border border-brand-200 bg-white text-brand-600 hover:bg-brand-50 dark:border-brand-500/30 dark:bg-transparent dark:text-brand-400 dark:hover:bg-brand-50/10"
            }`}
          >
            {isCheckingOut ? "מעבד..." : tierCtaText[tier.id]}
          </button>
        ) : (
          <Link
            href="/sign-up"
            className={`flex h-11 w-full items-center justify-center rounded-xl text-sm font-semibold transition-all ${
              isHighlighted
                ? "bg-gradient-to-l from-brand-500 to-brand-600 text-white shadow-lg shadow-brand-500/25 hover:shadow-xl hover:brightness-110"
                : "border border-brand-200 bg-white text-brand-600 hover:bg-brand-50 dark:border-brand-500/30 dark:bg-transparent dark:text-brand-400 dark:hover:bg-brand-50/10"
            }`}
          >
            {tierCtaText[tier.id]}
          </Link>
        )}
        {tier.upgradeNudge && (
          <p className="mt-3 text-center text-xs text-blue-500/40 dark:text-zinc-500">
            {tier.upgradeNudge.substring(0, 80)}
            {tier.upgradeNudge.length > 80 ? "..." : ""}
          </p>
        )}
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Secondary Tier Card (Basic + Course)
// ---------------------------------------------------------------------------

function SecondaryPricingCard({
  tier,
  isAnnual,
  onCheckout,
  isCheckingOut,
  currentPlan,
}: {
  tier: PricingTier;
  isAnnual: boolean;
  onCheckout: (plan: "basic" | "premium") => void;
  isCheckingOut: boolean;
  currentPlan: string;
}) {
  const price = isAnnual && tier.effectiveMonthlyOnAnnual
    ? tier.effectiveMonthlyOnAnnual
    : tier.priceMonthly ?? tier.priceOneTime;

  const tierCtaText: Record<string, string> = {
    basic: "התחל עם מגלה",
    course: "רכוש את הקורס",
  };

  const isCurrentPlan = currentPlan === tier.id;
  const isPaidTier = tier.id === "basic";

  return (
    <div className="flex flex-col rounded-2xl border border-brand-100/30 bg-white p-6 dark:border-blue-100/10 dark:bg-blue-50/5">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-blue-500 dark:text-white">
              {tier.name}
            </h3>
            {tier.badge && (
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                {tier.badge}
              </span>
            )}
          </div>
          <p className="text-xs text-blue-500/60 dark:text-zinc-400">
            {tier.subtitle}
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-extrabold text-blue-500 dark:text-white">
            {formatPrice(price)}
          </div>
          <div className="text-xs text-blue-500/50 dark:text-zinc-500">
            {tier.billingCycles.includes("one_time") ? "תשלום חד-פעמי" : "לחודש"}
          </div>
          {isAnnual && tier.annualSavingsPercent && (
            <div className="mt-0.5 rounded-full bg-green-100 px-1.5 py-0.5 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
              חיסכון {tier.annualSavingsPercent}%
            </div>
          )}
        </div>
      </div>

      <p className="mb-4 text-sm text-blue-500/60 dark:text-zinc-400">
        {tier.description}
      </p>

      {isCurrentPlan ? (
        <div className="flex h-10 w-full items-center justify-center rounded-xl border border-green-300 bg-green-50 text-sm font-semibold text-green-700 dark:border-green-700 dark:bg-green-900/20 dark:text-green-400">
          התוכנית הנוכחית שלך
        </div>
      ) : isPaidTier ? (
        <button
          type="button"
          onClick={() => onCheckout("basic")}
          disabled={isCheckingOut}
          className="flex h-10 w-full items-center justify-center rounded-xl border border-brand-200 bg-white text-sm font-semibold text-brand-600 transition-all hover:bg-brand-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-brand-500/30 dark:bg-transparent dark:text-brand-400 dark:hover:bg-brand-50/10"
        >
          {isCheckingOut ? "מעבד..." : (tierCtaText[tier.id] ?? "התחל")}
        </button>
      ) : (
        <Link
          href="/sign-up"
          className="flex h-10 w-full items-center justify-center rounded-xl border border-brand-200 bg-white text-sm font-semibold text-brand-600 transition-all hover:bg-brand-50 dark:border-brand-500/30 dark:bg-transparent dark:text-brand-400 dark:hover:bg-brand-50/10"
        >
          {tierCtaText[tier.id] ?? "התחל"}
        </Link>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Comparison Table
// ---------------------------------------------------------------------------

function ComparisonTable({ isAnnual }: { isAnnual: boolean }) {
  const matrix = generateComparisonMatrix();
  const mainTiers = PRICING_TIERS.filter((t) =>
    ["free", "premium", "vip"].includes(t.id)
  );

  return (
    <div className="overflow-x-auto rounded-2xl border border-brand-100/30 dark:border-blue-100/10">
      <table className="w-full min-w-[640px] text-sm" role="table">
        {/* Header */}
        <thead>
          <tr className="border-b border-brand-100/30 dark:border-blue-100/10">
            <th className="sticky right-0 bg-brand-50/80 py-4 pr-6 pl-4 text-right text-xs font-semibold uppercase tracking-wider text-blue-500/50 backdrop-blur-sm dark:bg-blue-50/5 dark:text-zinc-500">
              פיצ׳ר
            </th>
            {mainTiers.map((tier) => (
              <th
                key={tier.id}
                className={`py-4 px-4 text-center ${
                  tier.isRecommended
                    ? "bg-brand-50 dark:bg-brand-50/10"
                    : "bg-brand-50/50 dark:bg-blue-50/3"
                }`}
              >
                <div className="mb-1 font-bold text-blue-500 dark:text-white">
                  {tier.name}
                </div>
                <div className="text-xs font-normal text-blue-500/50 dark:text-zinc-500">
                  {tier.priceMonthly === null
                    ? "חינם"
                    : `${formatPrice(isAnnual ? tier.effectiveMonthlyOnAnnual : tier.priceMonthly)}/חודש`}
                </div>
                {tier.isRecommended && (
                  <div className="mt-1">
                    <span className="rounded-full bg-brand-500 px-2 py-0.5 text-xs font-bold text-white">
                      מומלץ
                    </span>
                  </div>
                )}
              </th>
            ))}
          </tr>
        </thead>

        {/* Body grouped by category */}
        <tbody>
          {matrix.map((group) => (
            <>
              <tr
                key={`header-${group.category}`}
                className="bg-zinc-50/80 dark:bg-zinc-900/40"
              >
                <td
                  colSpan={mainTiers.length + 1}
                  className="py-2 pr-6 pl-4 text-xs font-semibold uppercase tracking-wider text-blue-500/40 dark:text-zinc-500"
                >
                  {group.categoryName}
                </td>
              </tr>
              {group.rows.map((row) => (
                <tr
                  key={row.feature.id}
                  className="border-b border-brand-100/20 transition-colors last:border-0 hover:bg-brand-50/30 dark:border-blue-100/5 dark:hover:bg-blue-50/3"
                >
                  <td className="sticky right-0 bg-white/95 py-3 pr-6 pl-4 backdrop-blur-sm dark:bg-zinc-950/95">
                    <div className="font-medium text-blue-500 dark:text-zinc-200">
                      {row.feature.name}
                    </div>
                    <div className="text-xs text-blue-500/40 dark:text-zinc-500">
                      {row.feature.description}
                    </div>
                  </td>
                  {mainTiers.map((tier) => (
                    <td
                      key={tier.id}
                      className={`py-3 px-4 text-center ${
                        tier.isRecommended
                          ? "bg-brand-50/30 dark:bg-brand-50/5"
                          : ""
                      }`}
                    >
                      <div className="flex items-center justify-center">
                        <FeatureValueCell value={row.values[tier.id]} />
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </>
          ))}
        </tbody>

        {/* Footer CTA */}
        <tfoot>
          <tr className="border-t border-brand-100/30 bg-brand-50/30 dark:border-blue-100/10 dark:bg-blue-50/3">
            <td className="py-4 pr-6 pl-4 text-sm font-semibold text-blue-500 dark:text-zinc-300">
              התחל עכשיו
            </td>
            {mainTiers.map((tier) => (
              <td key={tier.id} className="py-4 px-4 text-center">
                <Link
                  href="/sign-up"
                  className={`inline-flex h-9 items-center justify-center rounded-lg px-4 text-xs font-semibold transition-all ${
                    tier.isRecommended
                      ? "bg-gradient-to-l from-brand-500 to-brand-600 text-white hover:brightness-110"
                      : "border border-brand-200 text-brand-600 hover:bg-brand-50 dark:border-brand-500/30 dark:text-brand-400"
                  }`}
                >
                  {tier.priceMonthly === null ? "התחל בחינם" : "בחר"}
                </Link>
              </td>
            ))}
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Add-On Card
// ---------------------------------------------------------------------------

function AddOnCard({ addOn }: { addOn: AddOn }) {
  const includedLabels: Record<string, string> = {
    free: "טעימה",
    basic: "מגלה",
    premium: "משנה",
    vip: "מוביל",
    course: "קורס",
  };

  const iconMap: Record<string, React.ReactNode> = {
    Bot: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 001.65 2.163c.4.113.773.25 1.1.406C19.178 12.937 21 15.363 21 18.188v.143a3.563 3.563 0 01-3.562 3.562H6.562A3.563 3.563 0 013 18.331v-.143c0-2.825 1.822-5.25 4.75-6.92A9.85 9.85 0 009 10.68" />
      </svg>
    ),
    Video: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9A2.25 2.25 0 0013.5 5.25h-9A2.25 2.25 0 002.25 7.5v9A2.25 2.25 0 004.5 18.75z" />
      </svg>
    ),
    Camera: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
      </svg>
    ),
    HeartHandshake: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
    ),
    UserCheck: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
    GraduationCap: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
      </svg>
    ),
    BarChart3: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    Headphones: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
      </svg>
    ),
  };

  return (
    <div className="flex flex-col rounded-2xl border border-brand-100/30 bg-white p-5 dark:border-blue-100/10 dark:bg-blue-50/5">
      <div className="mb-3 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-500 dark:bg-brand-50/20">
          {iconMap[addOn.icon] ?? (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
            </svg>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-semibold text-blue-500 dark:text-white">
              {addOn.name}
            </h3>
            <div className="text-right">
              <span className="text-base font-bold text-blue-500 dark:text-white">
                ₪{addOn.price}
              </span>
              <span className="text-xs text-blue-500/40 dark:text-zinc-500">
                {addOn.billingCycle === "monthly" ? "/חודש" : " חד-פעמי"}
              </span>
            </div>
          </div>
          <p className="mt-1 text-xs text-blue-500/60 dark:text-zinc-400">
            {addOn.description}
          </p>
        </div>
      </div>

      {addOn.includedInTiers.length > 0 && (
        <div className="mt-auto pt-3">
          <p className="text-xs text-blue-500/40 dark:text-zinc-500">
            כלול בתוכניות:{" "}
            {addOn.includedInTiers
              .map((id) => includedLabels[id])
              .filter(Boolean)
              .join(", ")}
          </p>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// FAQ Accordion
// ---------------------------------------------------------------------------

const FAQ_ITEMS = [
  {
    q: "מה כלול בתוכנית החינמית?",
    a: "בתוכנית החינמית (טעימה) תקבל גישה ל-5 השיעורים הראשונים של הקורס, 10 הודעות חודשיות עם מאמן ה-AI, 2 תרחישי סימולטור בסיסיים, וגישה לספריית המאמרים. זה מספיק כדי להרגיש את השיטה ולהחליט אם זה מתאים לך.",
  },
  {
    q: "האם אפשר לבטל בכל עת?",
    a: "כן, ביטול בכל עת ובלי שאלות. ניתן לבטל ישירות מהחשבון שלך. אם ביטלת במהלך תקופת חיוב, תמשיך ליהנות מהשירות עד סוף התקופה ששילמת עליה. אנחנו מאמינים ביושרה מלאה.",
  },
  {
    q: "מה ההבדל בין מנוי חודשי לשנתי?",
    a: "מנוי שנתי מאפשר לך לחסוך עד 37% לעומת תשלום חודשי. למשל, תוכנית משנה עולה ₪149 לחודש, אבל שנתית יוצא ₪95.75 לחודש בלבד (₪1,149 לשנה). בנוסף, מנוי שנתי נותן לך שקט נפשי ואפשרות להתמקד בלמידה.",
  },
  {
    q: "האם יש ליווי אחד על אחד?",
    a: "ליווי אישי 1-על-1 עם אלעד הוא שירות נפרד שעולה אלפי שקלים ואינו חלק מהתוכניות. תוכנית VIP (מוביל) כוללת מפגשי קואצ׳ינג קבוצתיים חיים עם אלעד - 2 פעמים בחודש. זו הדרך הטובה ביותר לקבל ליווי ישיר מאלעד במחיר הרבה יותר נגיש.",
  },
  {
    q: "מה קורה אחרי שמסיימים את הקורס?",
    a: "הקורס זמין לצפייה חוזרת כל עוד המנוי שלך פעיל. רכישת הקורס החד-פעמית נותנת לך גישה לצמיתות. בנוסף, אנחנו מוסיפים תכנים ושיעורים חדשים באופן שוטף, כך שתמיד תהיה לך חומר חדש לצפות.",
  },
  {
    q: "האם אפשר לשדרג או לשנמך תוכנית?",
    a: "בהחלט. ניתן לשדרג בכל עת - ההפרש יחויב מיד. שנמוך אפשרי בסוף תקופת החיוב הנוכחית. לא צריך ליצור קשר עם תמיכה - הכל נעשה דרך הגדרות החשבון שלך.",
  },
  {
    q: "איך עובד הסימולטור?",
    a: "הסימולטור מאפשר לתרגל דייטים אמיתיים עם דמויות AI מציאותיות. כל תרחיש מגדיר אישיות שונה, ורמת קושי שונה. אחרי כל סימולציה מקבל ניתוח מפורט עם ציון, נקודות חוזקה ואזורים לשיפור. בתוכנית פרימיום ומעלה יש גם תרגול קולי.",
  },
  {
    q: "מה זה קואצ׳ינג קבוצתי?",
    a: "מפגשים חיים בזום עם אלעד ועם קבוצה של 10-20 משתתפים מתוכנית מוביל. כל מפגש 60-90 דקות. מדברים על אתגרים אמיתיים, מקבלים משוב, עוברים תרגילים. זה לא הרצאה - זה קואצ׳ינג אמיתי. 2 מפגשים בחודש.",
  },
  {
    q: "איך עובד התשלום?",
    a: "התשלום מתבצע באופן מאובטח דרך Stripe, ספק התשלומים המוביל בעולם. אנחנו תומכים בכרטיסי אשראי ישראליים ובינלאומיים. כל התשלומים בשקלים (ILS). לאחר הרכישה תקבל חשבונית במייל.",
  },
  {
    q: "האם התשלום מאובטח?",
    a: "בהחלט. אנחנו משתמשים ב-Stripe, שמעבד תשלומים עבור חברות כמו Google, Amazon ו-Shopify. פרטי כרטיס האשראי שלך לא נשמרים במערכת שלנו כלל - הכל מוצפן ומעובד ישירות ב-Stripe. בנוסף, כל עמודי התשלום מאובטחים ב-SSL.",
  },
];

function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="flex flex-col gap-2" role="list">
      {FAQ_ITEMS.map((item, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-xl border border-brand-100/30 bg-white dark:border-blue-100/10 dark:bg-blue-50/5"
          role="listitem"
        >
          <button
            type="button"
            className="flex w-full items-center justify-between gap-4 px-5 py-4 text-right transition-colors hover:bg-brand-50/50 dark:hover:bg-brand-50/5"
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            aria-expanded={openIndex === index}
            aria-controls={`faq-answer-${index}`}
          >
            <span className="text-sm font-semibold text-blue-500 dark:text-white">
              {item.q}
            </span>
            <span
              className={`shrink-0 text-brand-500 transition-transform duration-200 ${
                openIndex === index ? "rotate-45" : ""
              }`}
              aria-hidden="true"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
              </svg>
            </span>
          </button>
          <AnimatePresence initial={false}>
            {openIndex === index && (
              <motion.div
                id={`faq-answer-${index}`}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="border-t border-brand-100/20 px-5 py-4 dark:border-blue-100/5">
                  <p className="text-sm leading-relaxed text-blue-500/70 dark:text-zinc-400">
                    {item.a}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const { plan: currentPlan } = useSubscription();
  // NOTE: Run `npx convex dev` to regenerate types after adding convex/stripe.ts
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const createCheckout = useAction((api as any).stripe.createCheckoutSession);

  const handleCheckout = useCallback(
    async (plan: "basic" | "premium") => {
      setIsCheckingOut(true);
      try {
        const result = await createCheckout({ plan });
        if (result.url) {
          window.location.href = result.url;
        }
      } catch {
        // User not authenticated - redirect to sign-up
        window.location.href = "/sign-up";
      } finally {
        setIsCheckingOut(false);
      }
    },
    [createCheckout]
  );

  const mainTiers = PRICING_TIERS.filter((t) =>
    ["free", "premium", "vip"].includes(t.id)
  );
  const secondaryTiers = PRICING_TIERS.filter((t) =>
    ["basic", "course"].includes(t.id)
  );

  return (
    <div className="min-h-dvh bg-[var(--background)]">
      <Header />

      <main id="main-content">
        {/* ---------------------------------------------------------------- */}
        {/* Hero Section */}
        {/* ---------------------------------------------------------------- */}
        <section className="relative overflow-hidden border-b border-brand-100/30 dark:border-blue-100/10">
          {/* Background decoration */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
            <div className="absolute -top-24 right-1/4 h-96 w-96 rounded-full bg-brand-100/30 blur-3xl dark:bg-brand-100/10" />
            <div className="absolute top-20 left-1/3 h-72 w-72 rounded-full bg-blue-50/20 blur-3xl dark:bg-blue-100/8" />
            <div className="absolute -bottom-12 right-1/3 h-64 w-64 rounded-full bg-accent-300/10 blur-3xl" />
          </div>

          <div className="container relative mx-auto px-4 pb-16 pt-16 text-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="mx-auto max-w-2xl"
            >
              {/* Social proof badge */}
              <motion.div variants={fadeIn}>
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-600 dark:border-brand-200/30 dark:bg-brand-50/20 dark:text-brand-300">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-500" />
                  {SOCIAL_PROOF.count} זוגות מצאו אהבה דרך השיטה
                </div>
              </motion.div>

              <motion.h1
                variants={fadeIn}
                className="mb-4 text-4xl font-extrabold leading-tight text-blue-500 dark:text-white md:text-5xl"
              >
                בחר את המסלול שלך
              </motion.h1>

              <motion.p
                variants={fadeIn}
                className="mb-8 text-lg text-blue-500/60 dark:text-zinc-400"
              >
                התחל בחינם, שדרג כשתרגיש מוכן. ביטול בכל עת.
              </motion.p>

              {/* Billing toggle */}
              <motion.div variants={fadeIn}>
                <div
                  className="inline-flex items-center gap-3 rounded-xl border border-brand-100/40 bg-white p-1.5 shadow-sm dark:border-blue-100/10 dark:bg-blue-50/5"
                  role="group"
                  aria-label="בחר תקופת חיוב"
                >
                  <button
                    type="button"
                    onClick={() => setIsAnnual(false)}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                      !isAnnual
                        ? "bg-blue-500 text-white shadow-sm dark:bg-blue-600"
                        : "text-blue-500/60 hover:text-blue-500 dark:text-zinc-400 dark:hover:text-white"
                    }`}
                    aria-pressed={!isAnnual}
                  >
                    {PRICING_PAGE_CONTENT.monthlyToggleLabel}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAnnual(true)}
                    className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                      isAnnual
                        ? "bg-blue-500 text-white shadow-sm dark:bg-blue-600"
                        : "text-blue-500/60 hover:text-blue-500 dark:text-zinc-400 dark:hover:text-white"
                    }`}
                    aria-pressed={isAnnual}
                  >
                    שנתי
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-xs font-bold ${
                        isAnnual
                          ? "bg-white/20 text-white"
                          : "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
                      }`}
                    >
                      חיסכון עד 37%
                    </span>
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Main Pricing Cards (3 tiers: Free, Premium, VIP) */}
        {/* ---------------------------------------------------------------- */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <motion.div
              className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3"
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              {mainTiers.map((tier) => (
                <MainPricingCard
                  key={tier.id}
                  tier={tier}
                  isAnnual={isAnnual}
                  onCheckout={handleCheckout}
                  isCheckingOut={isCheckingOut}
                  currentPlan={currentPlan}
                />
              ))}
            </motion.div>

            {/* Coaching anchor */}
            <motion.p
              className="mx-auto mt-8 max-w-lg text-center text-sm text-blue-500/40 dark:text-zinc-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {PRICING_PAGE_CONTENT.coachingAnchorText} —{" "}
              <Link
                href={PRICING_PAGE_CONTENT.enterpriseCtaLink}
                className="text-brand-500 underline underline-offset-2 hover:text-brand-600"
              >
                צרו קשר
              </Link>
            </motion.p>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Secondary Tiers (Basic + Course) */}
        {/* ---------------------------------------------------------------- */}
        <section className="border-t border-brand-100/20 bg-brand-50/20 py-12 dark:border-blue-100/10 dark:bg-blue-50/3">
          <div className="container mx-auto px-4">
            <motion.div
              className="mx-auto mb-8 text-center"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
            >
              <h2 className="text-xl font-bold text-blue-500 dark:text-white">
                אפשרויות נוספות
              </h2>
              <p className="mt-2 text-sm text-blue-500/50 dark:text-zinc-500">
                {PRICING_PAGE_CONTENT.courseCtaText}
              </p>
            </motion.div>
            <motion.div
              className="mx-auto grid max-w-2xl gap-4 md:grid-cols-2"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              {secondaryTiers.map((tier) => (
                <motion.div key={tier.id} variants={fadeIn}>
                  <SecondaryPricingCard
                    tier={tier}
                    isAnnual={isAnnual}
                    onCheckout={handleCheckout}
                    isCheckingOut={isCheckingOut}
                    currentPlan={currentPlan}
                  />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Guarantee Banner */}
        {/* ---------------------------------------------------------------- */}
        <section className="py-10">
          <div className="container mx-auto px-4">
            <motion.div
              className="mx-auto flex max-w-2xl items-center gap-4 rounded-2xl border border-green-200/50 bg-green-50/50 px-6 py-5 dark:border-green-900/30 dark:bg-green-900/10"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/30">
                <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-green-800 dark:text-green-300">
                  {PRICING_PAGE_CONTENT.guaranteeText}
                </h3>
                <p className="text-sm text-green-700/70 dark:text-green-400/70">
                  אנחנו בטוחים בשיטה שלנו. אם לא תהיה מרוצה תוך{" "}
                  {PRICING_PAGE_CONTENT.guaranteeDays} יום - נחזיר לך את הכסף במלואו.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Feature Comparison Table */}
        {/* ---------------------------------------------------------------- */}
        <section className="border-t border-brand-100/20 py-16 dark:border-blue-100/10">
          <div className="container mx-auto px-4">
            <motion.div
              className="mx-auto mb-10 text-center"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
            >
              <span className="mb-3 inline-block text-sm font-semibold uppercase tracking-wider text-brand-500">
                השוואה מלאה
              </span>
              <h2 className="text-3xl font-bold text-blue-500 dark:text-white md:text-4xl">
                מה כלול בכל תוכנית?
              </h2>
              <p className="mt-3 text-blue-500/60 dark:text-zinc-400">
                השוואה מפורטת בין התוכניות העיקריות
              </p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
            >
              <ComparisonTable isAnnual={isAnnual} />
            </motion.div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Add-Ons Section */}
        {/* ---------------------------------------------------------------- */}
        <section className="border-t border-brand-100/20 bg-brand-50/10 py-16 dark:border-blue-100/10 dark:bg-blue-50/3">
          <div className="container mx-auto px-4">
            <motion.div
              className="mx-auto mb-10 text-center"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
            >
              <span className="mb-3 inline-block text-sm font-semibold uppercase tracking-wider text-brand-500">
                תוספות
              </span>
              <h2 className="text-3xl font-bold text-blue-500 dark:text-white md:text-4xl">
                שדרג בצורה גמישה
              </h2>
              <p className="mt-3 text-blue-500/60 dark:text-zinc-400">
                הוסף יכולות ספציפיות לכל תוכנית שתבחר
              </p>
            </motion.div>

            <motion.div
              className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-4"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              {ADD_ONS.map((addOn) => (
                <motion.div key={addOn.id} variants={fadeIn}>
                  <AddOnCard addOn={addOn} />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Social Proof */}
        {/* ---------------------------------------------------------------- */}
        <section className="border-t border-brand-100/20 py-16 dark:border-blue-100/10">
          <div className="container mx-auto px-4">
            <motion.div
              className="mx-auto max-w-4xl"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              <motion.div
                variants={fadeIn}
                className="mb-10 text-center"
              >
                <span className="mb-3 inline-block text-sm font-semibold uppercase tracking-wider text-brand-500">
                  הוכחה חברתית
                </span>
                <h2 className="text-3xl font-bold text-blue-500 dark:text-white md:text-4xl">
                  הם כבר מצאו אהבה
                </h2>
              </motion.div>

              {/* Stats row */}
              <motion.div
                variants={staggerContainer}
                className="mb-12 grid gap-6 sm:grid-cols-3"
              >
                {[
                  { value: "461", label: "זוגות שנוצרו", icon: "💑" },
                  { value: "73", label: "שיעורים בקורס", icon: "📚" },
                  { value: "30", label: "ימי אחריות החזר", icon: "🛡️" },
                ].map((stat) => (
                  <motion.div
                    key={stat.label}
                    variants={fadeIn}
                    className="text-center rounded-2xl border border-brand-100/30 bg-white py-6 px-4 dark:border-blue-100/10 dark:bg-blue-50/5"
                  >
                    <div className="mb-2 text-3xl">{stat.icon}</div>
                    <div className="text-3xl font-extrabold text-blue-500 dark:text-white">
                      {stat.value}
                    </div>
                    <div className="text-sm text-blue-500/50 dark:text-zinc-500">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Testimonials */}
              <motion.div
                variants={staggerContainer}
                className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
              >
                {[
                  {
                    name: "דניאל כ.",
                    tier: "משנה",
                    text: "אחרי חצי שנה עם תוכנית משנה, פגשתי את אהבת חיי. הסימולטור עזר לי לא להישמע נואש בדייטים.",
                  },
                  {
                    name: "שרה מ.",
                    tier: "מוביל VIP",
                    text: "הקואצ׳ינג הקבוצתי עם אלעד שינה לי את הגישה כולה. הוא ראה בדיוק איפה אני תוקעת.",
                  },
                  {
                    name: "יוסי ל.",
                    tier: "מגלה",
                    text: "התחלתי עם מגלה ואחרי שלושה חודשים עצרתי - כי נסגרתי עם מישהי. הקורס עובד.",
                  },
                ].map((testimonial) => (
                  <motion.blockquote
                    key={testimonial.name}
                    variants={fadeIn}
                    className="rounded-2xl border border-brand-100/30 bg-white p-5 dark:border-blue-100/10 dark:bg-blue-50/5"
                    cite="#"
                  >
                    <p className="mb-4 text-sm leading-relaxed text-blue-500/80 dark:text-zinc-300">
                      &ldquo;{testimonial.text}&rdquo;
                    </p>
                    <footer className="flex items-center justify-between">
                      <cite className="not-italic">
                        <span className="text-sm font-semibold text-blue-500 dark:text-white">
                          {testimonial.name}
                        </span>
                      </cite>
                      <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-600 dark:bg-brand-50/20 dark:text-brand-400">
                        תוכנית {testimonial.tier}
                      </span>
                    </footer>
                  </motion.blockquote>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* FAQ Section */}
        {/* ---------------------------------------------------------------- */}
        <section className="border-t border-brand-100/20 bg-brand-50/10 py-16 dark:border-blue-100/10 dark:bg-blue-50/3">
          <div className="container mx-auto px-4">
            <motion.div
              className="mx-auto max-w-2xl"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              <motion.div variants={fadeIn} className="mb-10 text-center">
                <span className="mb-3 inline-block text-sm font-semibold uppercase tracking-wider text-brand-500">
                  שאלות נפוצות
                </span>
                <h2 className="text-3xl font-bold text-blue-500 dark:text-white md:text-4xl">
                  {PRICING_PAGE_CONTENT.faqTitle}
                </h2>
              </motion.div>

              <motion.div variants={fadeIn}>
                <FAQAccordion />
              </motion.div>

              <motion.p
                variants={fadeIn}
                className="mt-8 text-center text-sm text-blue-500/50 dark:text-zinc-500"
              >
                יש עוד שאלות?{" "}
                <Link
                  href="/contact"
                  className="text-brand-500 underline underline-offset-2 hover:text-brand-600"
                >
                  צרו קשר
                </Link>{" "}
                ונחזור אליכם תוך 24 שעות.
              </motion.p>
            </motion.div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Final CTA */}
        {/* ---------------------------------------------------------------- */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <motion.div
              className="relative mx-auto max-w-3xl overflow-hidden rounded-3xl bg-gradient-to-br from-brand-500 via-brand-600 to-blue-500 p-10 text-center shadow-2xl shadow-brand-500/20 md:p-14"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
            >
              <div className="pointer-events-none absolute -top-12 -left-12 h-48 w-48 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
              <div className="pointer-events-none absolute -bottom-12 -right-12 h-48 w-48 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />

              <div className="relative">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-sm font-medium text-white">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                  461 זוגות כבר מצאו אהבה
                </div>
                <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
                  מוכן להתחיל את המסע?
                </h2>
                <p className="mx-auto mb-8 max-w-md text-brand-100">
                  {PRICING_PAGE_CONTENT.guaranteeText}
                </p>
                <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                  <Link
                    href="/sign-up"
                    className="inline-flex h-12 items-center justify-center rounded-xl bg-white px-8 text-base font-semibold text-brand-600 shadow-lg transition-all hover:bg-brand-50 hover:shadow-xl"
                  >
                    התחל בחינם עכשיו
                    <svg className="mr-2 h-4 w-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </Link>
                  <Link
                    href="/contact"
                    className="inline-flex h-12 items-center justify-center rounded-xl border border-white/30 px-8 text-base font-semibold text-white transition-all hover:bg-white/10"
                  >
                    {PRICING_PAGE_CONTENT.enterpriseCtaText}
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
