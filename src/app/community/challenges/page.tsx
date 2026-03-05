"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { api } from "@/../convex/_generated/api";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { useUser, SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";

interface Challenge {
  slug: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  targetCount: number;
  completed: boolean;
  daysRemaining: number;
}

function DaysRemainingBadge({ days }: { days: number }) {
  const color =
    days <= 1
      ? "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400"
      : days <= 3
        ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
        : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400";

  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${color}`}>
      {days === 0 ? "מסתיים היום" : `${days} ימים נותרו`}
    </span>
  );
}

function ChallengeCard({
  challenge,
  onComplete,
}: {
  challenge: Challenge;
  onComplete: (slug: string) => void;
}) {
  const [completing, setCompleting] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);
  const [error, setError] = useState("");

  async function handleComplete() {
    setCompleting(true);
    setError("");
    try {
      await onComplete(challenge.slug);
      setJustCompleted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "אירעה שגיאה");
    } finally {
      setCompleting(false);
    }
  }

  const isDone = challenge.completed || justCompleted;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-2xl border p-5 shadow-sm transition-all ${
        isDone
          ? "border-emerald-200 bg-emerald-50 dark:border-emerald-800/50 dark:bg-emerald-950/20"
          : "border-zinc-100 bg-white dark:border-zinc-800 dark:bg-zinc-900"
      }`}
    >
      {/* Completed ribbon */}
      {isDone && (
        <div className="absolute left-0 top-0 flex items-center gap-1 rounded-br-xl bg-emerald-500 px-3 py-1 text-xs font-bold text-white">
          <svg
            className="h-3.5 w-3.5"
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
          הושלם!
        </div>
      )}

      <div className="flex items-start gap-4">
        {/* Icon */}
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl ${
            isDone
              ? "bg-emerald-100 dark:bg-emerald-950/40"
              : "bg-zinc-100 dark:bg-zinc-800"
          }`}
        >
          {isDone ? "✅" : challenge.icon}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <h3
              className={`font-semibold ${isDone ? "text-emerald-800 dark:text-emerald-300" : "text-zinc-900 dark:text-white"}`}
            >
              {challenge.title}
            </h3>
            {!isDone && <DaysRemainingBadge days={challenge.daysRemaining} />}
          </div>
          <p className="mb-3 text-sm text-zinc-500 dark:text-zinc-400">
            {challenge.description}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* XP reward */}
            <div className="flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 dark:bg-brand-950/30">
              <span className="text-sm">⚡</span>
              <span className="text-sm font-bold text-brand-700 dark:text-brand-400">
                +{challenge.xpReward} XP
              </span>
            </div>

            {/* Action */}
            {isDone ? (
              <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                הושלם השבוע ✓
              </span>
            ) : (
              <SignedIn>
                <button
                  onClick={handleComplete}
                  disabled={completing}
                  className="rounded-xl bg-gradient-to-l from-brand-500 to-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:brightness-110 disabled:opacity-50"
                >
                  {completing ? "מסמן..." : "השלמתי!"}
                </button>
              </SignedIn>
            )}
          </div>

          {error && (
            <p className="mt-2 rounded-lg bg-red-50 px-3 py-1.5 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
              {error}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function ChallengesStats({ challenges }: { challenges: Challenge[] }) {
  const completed = challenges.filter((c) => c.completed).length;
  const total = challenges.length;
  const totalXpAvailable = challenges
    .filter((c) => !c.completed)
    .reduce((sum, c) => sum + c.xpReward, 0);
  const totalXpEarned = challenges
    .filter((c) => c.completed)
    .reduce((sum, c) => sum + c.xpReward, 0);

  return (
    <div className="grid grid-cols-3 gap-3 rounded-2xl border border-zinc-100 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="text-center">
        <div className="text-2xl font-black text-zinc-900 dark:text-white">
          {completed}/{total}
        </div>
        <div className="text-xs text-zinc-500 dark:text-zinc-400">הושלמו</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
          +{totalXpEarned}
        </div>
        <div className="text-xs text-zinc-500 dark:text-zinc-400">XP הרווחת</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
          {totalXpAvailable}
        </div>
        <div className="text-xs text-zinc-500 dark:text-zinc-400">XP זמין</div>
      </div>
    </div>
  );
}

export default function ChallengesPage() {
  const { user } = useUser();
  const challenges = useQuery(api.leaderboard.getWeeklyChallenges);
  const completeChallenge = useMutation(api.leaderboard.completeWeeklyChallenge);
  const [filter, setFilter] = useState<"all" | "active" | "done">("all");

  async function handleComplete(slug: string) {
    await completeChallenge({ challengeSlug: slug });
  }

  const filteredChallenges = (challenges ?? []).filter((c) => {
    if (filter === "active") return !c.completed;
    if (filter === "done") return c.completed;
    return true;
  });

  const activeChallenges = (challenges ?? []).filter((c) => !c.completed);
  const completedChallenges = (challenges ?? []).filter((c) => c.completed);

  return (
    <div className="min-h-dvh bg-zinc-50 dark:bg-zinc-950" dir="rtl">
      <Header />

      <main className="container mx-auto max-w-3xl px-4 py-10">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-200/50 dark:shadow-amber-900/30">
            <span className="text-3xl">🎯</span>
          </div>
          <h1 className="mb-2 text-3xl font-black text-zinc-900 dark:text-white">
            אתגרים שבועיים
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            השלם אתגרים, הרווח XP וטפס בדירוגים
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
          <span className="rounded-full bg-brand-500 px-4 py-2 text-sm font-medium text-white shadow-sm">
            אתגרים שבועיים
          </span>
          <Link
            href="/community/leaderboard"
            className="rounded-full px-4 py-2 text-sm font-medium text-zinc-600 shadow-sm bg-white hover:bg-brand-50 hover:text-brand-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            לוח דירוגים
          </Link>
          <Link
            href="/community/rewards"
            className="rounded-full px-4 py-2 text-sm font-medium text-zinc-600 shadow-sm bg-white hover:bg-brand-50 hover:text-brand-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            חנות פרסים
          </Link>
        </div>

        {/* Stats */}
        {challenges && challenges.length > 0 && (
          <div className="mb-6">
            <ChallengesStats challenges={challenges} />
          </div>
        )}

        {/* Filter tabs */}
        <div className="mb-5 flex gap-2">
          {[
            { key: "all" as const, label: `הכל (${challenges?.length ?? 0})` },
            {
              key: "active" as const,
              label: `פעילים (${activeChallenges.length})`,
            },
            {
              key: "done" as const,
              label: `הושלמו (${completedChallenges.length})`,
            },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                filter === tab.key
                  ? "bg-brand-500 text-white shadow-sm"
                  : "bg-white text-zinc-600 shadow-sm hover:bg-brand-50 hover:text-brand-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Sign-in CTA */}
        <SignedOut>
          <div className="mb-6 rounded-2xl border border-brand-200 bg-brand-50 p-5 text-center dark:border-brand-800 dark:bg-brand-950/20">
            <p className="mb-3 text-sm text-brand-800 dark:text-brand-300">
              התחבר כדי לסמן אתגרים כהשלמים ולהרוויח XP
            </p>
            <SignInButton mode="modal">
              <button className="rounded-xl bg-gradient-to-l from-brand-500 to-brand-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm hover:brightness-110">
                התחבר עכשיו
              </button>
            </SignInButton>
          </div>
        </SignedOut>

        {/* Challenges list */}
        {challenges === undefined ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-32 animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800"
              />
            ))}
          </div>
        ) : filteredChallenges.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 text-5xl">
              {filter === "done" ? "🎉" : "🎯"}
            </div>
            <h3 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-white">
              {filter === "done"
                ? "עוד לא השלמת אתגרים השבוע"
                : "כל האתגרים הושלמו!"}
            </h3>
            {filter === "done" && (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                התחל לסמן אתגרים כהשלמים
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {filteredChallenges.map((challenge) => (
                <ChallengeCard
                  key={challenge.slug}
                  challenge={challenge}
                  onComplete={handleComplete}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Info box */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 rounded-2xl border border-blue-100 bg-blue-50 p-5 dark:border-blue-900/30 dark:bg-blue-950/20"
        >
          <h3 className="mb-2 font-semibold text-blue-900 dark:text-blue-300">
            💡 איך עובדים האתגרים?
          </h3>
          <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-400">
            <li>• האתגרים מתחדשים כל שבוע ביום ראשון</li>
            <li>• השלם אתגר ולחץ "השלמתי!" כדי לקבל את ה-XP</li>
            <li>• XP שנצבר מופיע בלוח הדירוגים</li>
            <li>• צבור XP כדי לממש פרסים בחנות</li>
          </ul>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
