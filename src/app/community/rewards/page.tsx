"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { api } from "@/../convex/_generated/api";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { useUser, SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";

interface Reward {
  slug: string;
  title: string;
  description: string;
  icon: string;
  xpCost: number;
  category: string;
  available: boolean;
  redeemed: boolean;
  canAfford: boolean;
}

interface RedeemedReward {
  slug: string;
  title: string;
  icon: string;
  xpSpent: number;
  redeemedAt: number;
}

const CATEGORY_LABELS: Record<string, string> = {
  badge: "תג",
  content: "תוכן",
  coaching: "אימון",
  certificate: "תעודה",
  cosmetic: "קוסמטי",
  discount: "הנחה",
};

const CATEGORY_COLORS: Record<string, string> = {
  badge:
    "bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300",
  content: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
  coaching:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  certificate:
    "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  cosmetic:
    "bg-pink-100 text-pink-700 dark:bg-pink-950/40 dark:text-pink-300",
  discount:
    "bg-brand-100 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300",
};

function ConfirmModal({
  reward,
  userXP,
  onConfirm,
  onCancel,
  loading,
}: {
  reward: Reward;
  userXP: number;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const remaining = userXP - reward.xpCost;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900"
      >
        <div className="mb-4 text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-4xl dark:bg-brand-950/30">
            {reward.icon}
          </div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
            מימוש פרס
          </h2>
        </div>

        <div className="mb-5 rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800">
          <div className="mb-2 font-semibold text-zinc-900 dark:text-white">
            {reward.title}
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {reward.description}
          </p>
        </div>

        <div className="mb-5 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-zinc-500 dark:text-zinc-400">ה-XP שלך:</span>
            <span className="font-bold text-zinc-900 dark:text-white">
              {userXP.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500 dark:text-zinc-400">עלות:</span>
            <span className="font-bold text-red-600 dark:text-red-400">
              -{reward.xpCost.toLocaleString()}
            </span>
          </div>
          <div className="h-px bg-zinc-200 dark:bg-zinc-700" />
          <div className="flex justify-between">
            <span className="font-medium text-zinc-700 dark:text-zinc-300">
              נותר:
            </span>
            <span className="font-black text-brand-600 dark:text-brand-400">
              {remaining.toLocaleString()} XP
            </span>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 rounded-xl border border-zinc-200 py-3 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            ביטול
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 rounded-xl bg-gradient-to-l from-brand-500 to-brand-600 py-3 text-sm font-bold text-white shadow-sm transition-all hover:brightness-110 disabled:opacity-50"
          >
            {loading ? "ממש..." : "מממש פרס"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function RewardCard({
  reward,
  onRedeem,
}: {
  reward: Reward;
  onRedeem: (reward: Reward) => void;
}) {
  const categoryColor =
    CATEGORY_COLORS[reward.category] ??
    "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300";
  const categoryLabel = CATEGORY_LABELS[reward.category] ?? reward.category;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative flex flex-col rounded-2xl border p-5 shadow-sm transition-all ${
        reward.redeemed
          ? "border-emerald-200 bg-emerald-50 dark:border-emerald-800/50 dark:bg-emerald-950/20"
          : reward.canAfford
            ? "border-zinc-100 bg-white hover:border-brand-200 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-brand-700"
            : "border-zinc-100 bg-white opacity-70 dark:border-zinc-800 dark:bg-zinc-900"
      }`}
    >
      {/* Redeemed ribbon */}
      {reward.redeemed && (
        <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-1 text-xs font-bold text-white">
          <svg
            className="h-3 w-3"
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
          ממומש
        </div>
      )}

      {/* Icon */}
      <div
        className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl text-3xl ${
          reward.redeemed
            ? "bg-emerald-100 dark:bg-emerald-950/40"
            : "bg-zinc-100 dark:bg-zinc-800"
        }`}
      >
        {reward.icon}
      </div>

      {/* Category badge */}
      <span
        className={`mb-2 self-start rounded-full px-2.5 py-0.5 text-xs font-medium ${categoryColor}`}
      >
        {categoryLabel}
      </span>

      {/* Title & description */}
      <h3 className="mb-1 font-bold text-zinc-900 dark:text-white">
        {reward.title}
      </h3>
      <p className="mb-4 flex-1 text-sm text-zinc-500 dark:text-zinc-400">
        {reward.description}
      </p>

      {/* XP cost + action */}
      <div className="mt-auto flex items-center justify-between gap-2">
        <div
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold ${
            reward.canAfford
              ? "bg-brand-50 text-brand-700 dark:bg-brand-950/30 dark:text-brand-400"
              : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
          }`}
        >
          ⚡ {reward.xpCost.toLocaleString()} XP
        </div>

        {reward.redeemed ? (
          <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
            ✓ ממומש
          </span>
        ) : reward.canAfford ? (
          <button
            onClick={() => onRedeem(reward)}
            className="rounded-xl bg-gradient-to-l from-brand-500 to-brand-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition-all hover:brightness-110"
          >
            מממש
          </button>
        ) : (
          <span className="text-xs text-zinc-400 dark:text-zinc-500">
            חסר XP
          </span>
        )}
      </div>
    </motion.div>
  );
}

function RedeemedRewardItem({ reward }: { reward: RedeemedReward }) {
  function timeAgo(ts: number) {
    const days = Math.floor((Date.now() - ts) / 86400000);
    if (days === 0) return "היום";
    if (days === 1) return "אתמול";
    return `לפני ${days} ימים`;
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-zinc-100 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-xl dark:bg-brand-950/30">
        {reward.icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate font-medium text-zinc-900 dark:text-white">
          {reward.title}
        </div>
        <div className="text-xs text-zinc-400 dark:text-zinc-500">
          {timeAgo(reward.redeemedAt)}
        </div>
      </div>
      <div className="text-sm font-bold text-red-500 dark:text-red-400">
        -{reward.xpSpent} XP
      </div>
    </div>
  );
}

export default function RewardsPage() {
  const { user } = useUser();
  const shopData = useQuery(api.leaderboard.getRewardsShop);
  const myRewards = useQuery(api.leaderboard.getMyRewards);
  const redeemRewardMutation = useMutation(api.leaderboard.redeemReward);

  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [redeeming, setRedeeming] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [activeTab, setActiveTab] = useState<"shop" | "mine">("shop");

  async function handleConfirmRedeem() {
    if (!selectedReward) return;
    setRedeeming(true);
    setErrorMsg("");
    try {
      const result = await redeemRewardMutation({
        rewardSlug: selectedReward.slug,
      });
      setSuccessMsg(
        `מימשת "${selectedReward.title}" בהצלחה! הוצאו ${result.xpSpent} XP`
      );
      setSelectedReward(null);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "אירעה שגיאה");
    } finally {
      setRedeeming(false);
    }
  }

  const rewards = shopData?.rewards ?? [];
  const userXP = shopData?.userXP ?? 0;

  const affordableRewards = rewards.filter((r) => r.canAfford && !r.redeemed);
  const redeemedRewards = rewards.filter((r) => r.redeemed);
  const lockedRewards = rewards.filter((r) => !r.canAfford && !r.redeemed);

  return (
    <div className="min-h-dvh bg-zinc-50 dark:bg-zinc-950" dir="rtl">
      <Header />

      <main className="container mx-auto max-w-5xl px-4 py-10">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600 shadow-lg shadow-brand-200/50 dark:shadow-brand-900/30">
            <span className="text-3xl">🛍️</span>
          </div>
          <h1 className="mb-2 text-3xl font-black text-zinc-900 dark:text-white">
            חנות הפרסים
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            מממש את ה-XP שצברת על פרסים בלעדיים
          </p>
        </motion.div>

        {/* Community nav */}
        <div className="mb-6 flex flex-wrap gap-2">
          <Link
            href="/community"
            className="rounded-full px-4 py-2 text-sm font-medium text-zinc-600 shadow-sm bg-white hover:bg-brand-50 hover:text-brand-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            קהילה
          </Link>
          <Link
            href="/community/challenges"
            className="rounded-full px-4 py-2 text-sm font-medium text-zinc-600 shadow-sm bg-white hover:bg-brand-50 hover:text-brand-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            אתגרים שבועיים
          </Link>
          <Link
            href="/community/leaderboard"
            className="rounded-full px-4 py-2 text-sm font-medium text-zinc-600 shadow-sm bg-white hover:bg-brand-50 hover:text-brand-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            לוח דירוגים
          </Link>
          <span className="rounded-full bg-brand-500 px-4 py-2 text-sm font-medium text-white shadow-sm">
            חנות פרסים
          </span>
        </div>

        {/* Sign in CTA */}
        <SignedOut>
          <div className="mb-6 rounded-2xl border border-brand-200 bg-brand-50 p-6 text-center dark:border-brand-800 dark:bg-brand-950/20">
            <div className="mb-3 text-4xl">🔒</div>
            <h3 className="mb-2 font-semibold text-brand-900 dark:text-brand-300">
              התחבר כדי לממש פרסים
            </h3>
            <p className="mb-4 text-sm text-brand-700 dark:text-brand-400">
              כנס לחשבון שלך, צבור XP ומממש פרסים בלעדיים
            </p>
            <SignInButton mode="modal">
              <button className="rounded-xl bg-gradient-to-l from-brand-500 to-brand-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:brightness-110">
                התחבר עכשיו
              </button>
            </SignInButton>
          </div>
        </SignedOut>

        {/* XP Balance */}
        <SignedIn>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-2xl bg-gradient-to-l from-brand-600 to-purple-600 p-6 text-white shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="mb-1 text-sm font-medium text-brand-100">
                  היתרה שלך
                </div>
                <div className="text-4xl font-black">
                  {userXP.toLocaleString()}
                  <span className="mr-2 text-xl font-medium text-brand-200">
                    XP
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-brand-200">
                  פרסים ממומשים: {redeemedRewards.length}
                </div>
                <div className="text-sm text-brand-200">
                  זמינים: {affordableRewards.length}
                </div>
                <Link
                  href="/community/challenges"
                  className="mt-2 inline-block rounded-lg bg-white/20 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white/30"
                >
                  צבור עוד XP ←
                </Link>
              </div>
            </div>
          </motion.div>
        </SignedIn>

        {/* Success / Error messages */}
        <AnimatePresence>
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-50 p-4 text-sm font-medium text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300"
            >
              <span className="text-lg">🎉</span>
              {successMsg}
              <button
                onClick={() => setSuccessMsg("")}
                className="mr-auto text-emerald-600 hover:text-emerald-800"
                aria-label="סגור"
              >
                ✕
              </button>
            </motion.div>
          )}
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-800 dark:bg-red-950/30 dark:text-red-300"
            >
              <span className="text-lg">⚠️</span>
              {errorMsg}
              <button
                onClick={() => setErrorMsg("")}
                className="mr-auto text-red-600 hover:text-red-800"
                aria-label="סגור"
              >
                ✕
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs */}
        <SignedIn>
          <div className="mb-6 flex gap-1 rounded-2xl bg-white p-1 shadow-sm dark:bg-zinc-900">
            <button
              onClick={() => setActiveTab("shop")}
              className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all ${
                activeTab === "shop"
                  ? "bg-gradient-to-l from-brand-500 to-brand-600 text-white shadow-sm"
                  : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
              }`}
            >
              🛍️ חנות ({rewards.length})
            </button>
            <button
              onClick={() => setActiveTab("mine")}
              className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all ${
                activeTab === "mine"
                  ? "bg-gradient-to-l from-brand-500 to-brand-600 text-white shadow-sm"
                  : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
              }`}
            >
              🎁 הפרסים שלי ({myRewards?.length ?? 0})
            </button>
          </div>
        </SignedIn>

        {/* Shop tab */}
        {activeTab === "shop" && (
          <>
            {shopData === undefined ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="h-56 animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800"
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-8">
                {/* Affordable rewards */}
                {affordableRewards.length > 0 && (
                  <div>
                    <h2 className="mb-4 flex items-center gap-2 font-bold text-zinc-900 dark:text-white">
                      <span className="text-emerald-500">✓</span>
                      זמינים לך עכשיו ({affordableRewards.length})
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {affordableRewards.map((reward) => (
                        <RewardCard
                          key={reward.slug}
                          reward={reward as Reward}
                          onRedeem={setSelectedReward}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Redeemed rewards */}
                {redeemedRewards.length > 0 && (
                  <div>
                    <h2 className="mb-4 flex items-center gap-2 font-bold text-zinc-900 dark:text-white">
                      <span className="text-emerald-500">🎁</span>
                      ממומשים ({redeemedRewards.length})
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {redeemedRewards.map((reward) => (
                        <RewardCard
                          key={reward.slug}
                          reward={reward as Reward}
                          onRedeem={setSelectedReward}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Locked rewards */}
                {lockedRewards.length > 0 && (
                  <div>
                    <h2 className="mb-4 flex items-center gap-2 font-bold text-zinc-700 dark:text-zinc-300">
                      <span>🔒</span>
                      דרוש עוד XP ({lockedRewards.length})
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {lockedRewards.map((reward) => (
                        <RewardCard
                          key={reward.slug}
                          reward={reward as Reward}
                          onRedeem={setSelectedReward}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* All rewards if not signed in */}
                {!user && (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {rewards.map((reward) => (
                      <RewardCard
                        key={reward.slug}
                        reward={reward as Reward}
                        onRedeem={setSelectedReward}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* My rewards tab */}
        {activeTab === "mine" && (
          <SignedIn>
            {myRewards === undefined ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="h-16 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800"
                  />
                ))}
              </div>
            ) : myRewards.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="mb-4 text-5xl">🎁</div>
                <h3 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-white">
                  עדיין לא מימשת פרסים
                </h3>
                <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
                  צבור XP ומממש פרסים מהחנות
                </p>
                <button
                  onClick={() => setActiveTab("shop")}
                  className="rounded-xl bg-gradient-to-l from-brand-500 to-brand-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm hover:brightness-110"
                >
                  לחנות הפרסים
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  כל הפרסים שמימשת עד כה:
                </p>
                {myRewards.map((reward) => (
                  <RedeemedRewardItem
                    key={`${reward.slug}-${reward.redeemedAt}`}
                    reward={reward as RedeemedReward}
                  />
                ))}
              </div>
            )}
          </SignedIn>
        )}
      </main>

      <Footer />

      {/* Confirm modal */}
      <AnimatePresence>
        {selectedReward && (
          <ConfirmModal
            reward={selectedReward}
            userXP={userXP}
            onConfirm={handleConfirmRedeem}
            onCancel={() => {
              setSelectedReward(null);
              setErrorMsg("");
            }}
            loading={redeeming}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
