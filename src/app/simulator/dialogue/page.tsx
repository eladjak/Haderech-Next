"use client";

import { useQuery } from "convex/react";
import { useState, useMemo } from "react";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { api } from "@/../convex/_generated/api";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { DifficultyBadge } from "@/components/simulator/difficulty-badge";
import Link from "next/link";

const DIFFICULTY_FILTERS = [
  { value: "all", label: "כל הרמות" },
  { value: "easy", label: "קל" },
  { value: "medium", label: "בינוני" },
  { value: "hard", label: "קשה" },
] as const;

const DIFFICULTY_LABEL: Record<string, string> = {
  easy: "קל",
  medium: "בינוני",
  hard: "קשה",
};

function DialogueScenarioCard({
  id,
  title,
  description,
  difficulty,
  category,
  estimatedMinutes,
  dialoguePointsCount,
  personaName,
  personaEmoji,
  bestScore,
}: {
  id: string;
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  category: string;
  estimatedMinutes: number;
  dialoguePointsCount: number;
  personaName: string;
  personaEmoji: string;
  bestScore?: number;
}) {
  return (
    <Link
      href={`/simulator/dialogue/${id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-100 bg-white transition-all hover:-translate-y-0.5 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
    >
      {/* Top difficulty accent */}
      <div
        className={`h-1.5 w-full ${
          difficulty === "easy"
            ? "bg-emerald-400"
            : difficulty === "medium"
              ? "bg-amber-400"
              : "bg-rose-500"
        }`}
      />

      <div className="flex flex-1 flex-col p-5">
        {/* Header row */}
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="flex flex-col gap-0.5">
            <h3 className="text-lg font-semibold text-zinc-900 transition-colors group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-400">
              {title}
            </h3>
            <span className="text-xs text-zinc-400 dark:text-zinc-500">
              {category}
            </span>
          </div>
          <DifficultyBadge difficulty={difficulty} />
        </div>

        {/* Description */}
        <p className="mb-4 line-clamp-2 flex-1 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
          {description}
        </p>

        {/* Meta row */}
        <div className="mb-4 flex items-center gap-4 text-xs text-zinc-400 dark:text-zinc-500">
          <div className="flex items-center gap-1">
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {estimatedMinutes} דק'
          </div>
          <div className="flex items-center gap-1">
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
              />
            </svg>
            {dialoguePointsCount} שלבים
          </div>
          {bestScore !== undefined && (
            <div
              className={`flex items-center gap-1 font-medium ${
                bestScore >= 80
                  ? "text-emerald-500"
                  : bestScore >= 60
                    ? "text-amber-500"
                    : "text-orange-500"
              }`}
            >
              <svg
                className="h-3.5 w-3.5"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              שיא: {bestScore}%
            </div>
          )}
        </div>

        {/* Persona + CTA */}
        <div className="flex items-center gap-3 rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/60">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rose-100 to-pink-200 text-xl dark:from-rose-900/40 dark:to-pink-800/40">
            {personaEmoji}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-zinc-900 dark:text-white">
              {personaName}
            </p>
          </div>
          <span className="flex items-center gap-1 rounded-lg bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-600 transition-colors group-hover:bg-brand-100 dark:bg-blue-500/20 dark:text-brand-400">
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
                d="M8.25 4.5l7.5 7.5-7.5 7.5"
              />
            </svg>
            התחל
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function DialogueScenariosPage() {
  const scenarios = useQuery(api.simulator.listDialogueScenarios);
  const bestScores = useQuery(api.simulator.getUserBestScores);
  const [selectedDifficulty, setSelectedDifficulty] = useState<
    "all" | "easy" | "medium" | "hard"
  >("all");

  const filteredScenarios = useMemo(() => {
    if (!scenarios) return undefined;
    return scenarios.filter(
      (s) =>
        selectedDifficulty === "all" || s.difficulty === selectedDifficulty
    );
  }, [scenarios, selectedDifficulty]);

  return (
    <div className="min-h-dvh bg-white dark:bg-zinc-950">
      <Header />

      <main className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-10">
          <div className="mb-3 flex items-center gap-2">
            <Link
              href="/simulator"
              className="text-sm text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
            >
              סימולטור
            </Link>
            <span className="text-zinc-300 dark:text-zinc-600">/</span>
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              סימולציות דיאלוג
            </span>
          </div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-600 dark:bg-blue-500/20 dark:text-brand-400">
            <svg
              className="h-3 w-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
              />
            </svg>
            סימולציות דיאלוג
          </div>
          <h1 className="mb-2 text-3xl font-bold text-zinc-900 dark:text-white">
            תרגול תרחישי דייטינג
          </h1>
          <p className="max-w-xl text-zinc-600 dark:text-zinc-400">
            בחר תשובות בסיטואציות אמיתיות וקבל משוב מיידי. למד מה עובד ומה
            פחות.
          </p>
        </div>

        {/* Difficulty filter */}
        <div className="mb-8 flex flex-wrap gap-2">
          {DIFFICULTY_FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setSelectedDifficulty(filter.value)}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                selectedDifficulty === filter.value
                  ? "bg-brand-500 text-white"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Auth gate */}
        <SignedOut>
          <div className="mb-8 rounded-2xl border border-brand-100 bg-brand-50 p-6 text-center dark:border-blue-500/20 dark:bg-blue-500/10">
            <p className="mb-2 font-medium text-zinc-900 dark:text-white">
              יש להתחבר כדי לשמור את הציונים שלך
            </p>
            <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
              הרשמה חינמית ומיידית
            </p>
            <SignInButton mode="modal">
              <button
                type="button"
                className="rounded-xl bg-brand-500 px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-brand-600"
              >
                התחבר / הרשם
              </button>
            </SignInButton>
          </div>
        </SignedOut>

        {/* Loading */}
        {filteredScenarios === undefined && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-72 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-800"
              />
            ))}
          </div>
        )}

        {/* Empty */}
        {filteredScenarios !== undefined && filteredScenarios.length === 0 && (
          <div className="rounded-2xl bg-zinc-50 p-12 text-center dark:bg-zinc-900">
            <p className="text-zinc-500 dark:text-zinc-400">
              {selectedDifficulty !== "all"
                ? `אין תרחישים ברמת ${DIFFICULTY_LABEL[selectedDifficulty]}`
                : "עדיין אין תרחישים"}
            </p>
          </div>
        )}

        {/* Grid */}
        {filteredScenarios !== undefined && filteredScenarios.length > 0 && (
          <>
            <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
              {filteredScenarios.length} תרחישים
            </p>
            <div className="grid gap-6 md:grid-cols-2">
              {filteredScenarios.map((scenario) => (
                <DialogueScenarioCard
                  key={scenario._id}
                  id={scenario._id}
                  title={scenario.title}
                  description={scenario.description}
                  difficulty={scenario.difficulty}
                  category={scenario.category}
                  estimatedMinutes={scenario.estimatedMinutes}
                  dialoguePointsCount={scenario.dialoguePoints.length}
                  personaName={scenario.personaName}
                  personaEmoji={scenario.personaEmoji}
                  bestScore={bestScores?.[scenario._id]}
                />
              ))}
            </div>
          </>
        )}

        {/* How it works section */}
        <div className="mt-16">
          <h2 className="mb-6 text-center text-xl font-bold text-zinc-900 dark:text-white">
            איך זה עובד?
          </h2>
          <div className="grid gap-4 md:grid-cols-4">
            {[
              {
                step: "1",
                title: "בחר תרחיש",
                desc: "תרחישים לפי רמת קושי ונושא",
              },
              {
                step: "2",
                title: "קרא את הסיטואציה",
                desc: "הבן את ההקשר ואת הדמות שאיתה תתרגל",
              },
              {
                step: "3",
                title: "בחר תגובה",
                desc: "מבין 3-4 אפשרויות - מה היית אומר?",
              },
              {
                step: "4",
                title: "קבל משוב",
                desc: "הסבר מיידי + טיפ + ציון סופי",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="flex flex-col items-center rounded-2xl bg-zinc-50 p-5 text-center dark:bg-zinc-900"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-brand-500 text-sm font-bold text-white">
                  {item.step}
                </div>
                <h3 className="mb-1.5 font-semibold text-zinc-900 dark:text-white">
                  {item.title}
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
