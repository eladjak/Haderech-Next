"use client";

import { useQuery } from "convex/react";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { api } from "@/../convex/_generated/api";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { DifficultyBadge } from "@/components/simulator/difficulty-badge";
import Link from "next/link";

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  completed: {
    label: "הושלם",
    className:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  active: {
    label: "פעיל",
    className:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  abandoned: {
    label: "נזנח",
    className:
      "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
  },
};

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString("he-IL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function ScoreBar({ score }: { score: number }) {
  const color =
    score >= 80
      ? "bg-emerald-500"
      : score >= 60
        ? "bg-amber-500"
        : score >= 40
          ? "bg-orange-500"
          : "bg-rose-500";

  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
        <div
          className={`h-1.5 rounded-full transition-all duration-300 ${color}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="w-8 text-left text-xs font-medium tabular-nums text-zinc-600 dark:text-zinc-400">
        {score}
      </span>
    </div>
  );
}

function HistoryContent() {
  const sessions = useQuery(api.simulator.listUserSessions);

  if (sessions === undefined) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="rounded-2xl bg-zinc-50 p-12 text-center dark:bg-zinc-900">
        <svg
          className="mx-auto mb-3 h-12 w-12 text-zinc-300 dark:text-zinc-600"
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
        <p className="mb-2 text-lg font-medium text-zinc-700 dark:text-zinc-300">
          עוד לא תרגלת
        </p>
        <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
          התחל את הסשן הראשון שלך עכשיו
        </p>
        <Link
          href="/simulator"
          className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-brand-600"
        >
          לתרחישים
        </Link>
      </div>
    );
  }

  // Stats summary
  const completed = sessions.filter((s) => s.status === "completed");
  const withScore = completed.filter((s) => s.score !== undefined);
  const avgScore =
    withScore.length > 0
      ? Math.round(
          withScore.reduce((sum, s) => sum + (s.score ?? 0), 0) /
            withScore.length
        )
      : null;

  return (
    <div className="flex flex-col gap-6">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-zinc-900">
          <p className="text-2xl font-bold text-zinc-900 dark:text-white">
            {sessions.length}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">סה"כ סשנים</p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-zinc-900">
          <p className="text-2xl font-bold text-zinc-900 dark:text-white">
            {completed.length}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">הושלמו</p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-zinc-900">
          <p className="text-2xl font-bold text-zinc-900 dark:text-white">
            {avgScore !== null ? avgScore : "—"}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">ציון ממוצע</p>
        </div>
      </div>

      {/* Session list */}
      <div className="flex flex-col gap-3">
        {sessions.map((session) => {
          const statusConfig =
            STATUS_LABELS[session.status] ?? STATUS_LABELS.abandoned;

          return (
            <div
              key={session._id}
              className="rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="truncate font-medium text-zinc-900 dark:text-white">
                    {session.scenarioTitle}
                  </h3>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-xs text-zinc-400 dark:text-zinc-500">
                      {session.personaName}
                    </span>
                    <span className="h-1 w-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                    <span className="text-xs text-zinc-400 dark:text-zinc-500">
                      {formatDate(session.createdAt)}
                    </span>
                  </div>
                </div>
                <div className="flex flex-shrink-0 items-center gap-2">
                  <DifficultyBadge
                    difficulty={
                      session.scenarioDifficulty as "easy" | "medium" | "hard"
                    }
                  />
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusConfig.className}`}
                  >
                    {statusConfig.label}
                  </span>
                </div>
              </div>

              {/* Score */}
              {session.status === "completed" &&
                session.score !== undefined && (
                  <div className="mb-3">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-xs text-zinc-400 dark:text-zinc-500">
                        ציון
                      </span>
                    </div>
                    <ScoreBar score={session.score} />
                  </div>
                )}

              {/* Feedback preview */}
              {session.feedback && (
                <p className="line-clamp-2 text-sm text-zinc-500 dark:text-zinc-400">
                  {session.feedback}
                </p>
              )}

              {/* Strengths/improvements if available */}
              {session.strengths && session.strengths.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {session.strengths.slice(0, 2).map((s, i) => (
                    <span
                      key={i}
                      className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              )}

              {/* Retry link */}
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-zinc-400">
                  {session.messageCount} הודעות
                </span>
                <Link
                  href={`/simulator/${session.scenarioId}`}
                  className="text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
                >
                  נסה שוב
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function SimulatorHistoryPage() {
  return (
    <div className="min-h-dvh bg-zinc-50 dark:bg-zinc-950">
      <Header />

      <main className="container mx-auto max-w-2xl px-4 py-12">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-1 text-2xl font-bold text-zinc-900 dark:text-white">
              ההיסטוריה שלי
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              כל הסשנים שביצעת
            </p>
          </div>
          <Link
            href="/simulator"
            className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-brand-600"
          >
            תרחיש חדש
          </Link>
        </div>

        <SignedIn>
          <HistoryContent />
        </SignedIn>

        <SignedOut>
          <div className="rounded-2xl border border-brand-100 bg-brand-50 p-8 text-center dark:border-blue-500/20 dark:bg-blue-500/10">
            <p className="mb-3 font-medium text-zinc-900 dark:text-white">
              יש להתחבר כדי לראות את ההיסטוריה
            </p>
            <SignInButton mode="modal">
              <button
                type="button"
                className="rounded-xl bg-brand-500 px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-brand-600"
              >
                התחבר
              </button>
            </SignInButton>
          </div>
        </SignedOut>
      </main>

      <Footer />
    </div>
  );
}
