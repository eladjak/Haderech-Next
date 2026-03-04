"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { api } from "@/../convex/_generated/api";
import type { Id } from "@/../convex/_generated/dataModel";
import { Header } from "@/components/layout/header";
import { SimulatorChat } from "@/components/simulator/simulator-chat";
import { DifficultyBadge } from "@/components/simulator/difficulty-badge";
import Link from "next/link";

export default function ScenarioPage() {
  const params = useParams();
  const router = useRouter();
  const scenarioId = params.scenarioId as Id<"simulatorScenarios">;

  const scenario = useQuery(api.simulator.getScenario, { scenarioId });
  const startSession = useMutation(api.simulator.startSession);

  const [activeSessionId, setActiveSessionId] =
    useState<Id<"simulatorSessions"> | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStart = async () => {
    if (isStarting) return;
    setIsStarting(true);
    setError(null);
    try {
      const sessionId = await startSession({ scenarioId });
      setActiveSessionId(sessionId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה בהתחלת הסשן");
      setIsStarting(false);
    }
  };

  if (scenario === undefined) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  if (scenario === null) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4">
        <p className="text-zinc-500">תרחיש לא נמצא</p>
        <Link
          href="/simulator"
          className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
        >
          חזור לסימולטור
        </Link>
      </div>
    );
  }

  // Active session - show chat
  if (activeSessionId) {
    return (
      <div className="flex min-h-dvh flex-col bg-zinc-50 dark:bg-zinc-950">
        <Header />
        <div className="flex flex-1 flex-col overflow-hidden">
          <SimulatorChat sessionId={activeSessionId} />
        </div>
      </div>
    );
  }

  // Scenario intro page
  return (
    <div className="min-h-dvh bg-white dark:bg-zinc-950">
      <Header />

      <main className="container mx-auto max-w-2xl px-4 py-12">
        {/* Back link */}
        <Link
          href="/simulator"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
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
              d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
            />
          </svg>
          כל התרחישים
        </Link>

        {/* Scenario header */}
        <div className="mb-8 rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h1 className="mb-1 text-2xl font-bold text-zinc-900 dark:text-white">
                {scenario.title}
              </h1>
              <span className="text-sm text-zinc-400 dark:text-zinc-500">
                {scenario.category}
              </span>
            </div>
            <DifficultyBadge difficulty={scenario.difficulty} size="md" />
          </div>

          <p className="mb-6 text-zinc-600 dark:text-zinc-400">
            {scenario.description}
          </p>

          {/* Persona card */}
          <div className="mb-6 rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/60">
            <h3 className="mb-3 text-xs font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
              הדמות שתפגוש
            </h3>
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-100 to-brand-200 text-2xl dark:from-brand-800/40 dark:to-brand-700/40">
                {scenario.personaGender === "female" ? "♀" : "♂"}
              </div>
              <div className="flex-1">
                <p className="mb-0.5 font-semibold text-zinc-900 dark:text-white">
                  {scenario.personaName}, {scenario.personaAge}
                </p>
                <p className="mb-2 text-sm text-zinc-500 dark:text-zinc-400">
                  {scenario.personaBackground}
                </p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  <span className="font-medium">אישיות: </span>
                  {scenario.personaPersonality}
                </p>
              </div>
            </div>
          </div>

          {/* Scenario context */}
          <div className="rounded-xl border-r-4 border-brand-400 bg-brand-50 py-3 pr-4 pl-3 dark:border-brand-600 dark:bg-blue-500/10">
            <p className="text-sm font-medium text-brand-700 dark:text-brand-400">
              הסיטואציה
            </p>
            <p className="mt-1 text-sm text-brand-800 dark:text-brand-300">
              {scenario.scenarioContext}
            </p>
          </div>
        </div>

        {/* Tips */}
        <div className="mb-8 rounded-2xl bg-zinc-50 p-5 dark:bg-zinc-900">
          <h3 className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            טיפים לסשן מוצלח
          </h3>
          <ul className="flex flex-col gap-2 text-sm text-zinc-500 dark:text-zinc-400">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-brand-400">•</span>
              שאל שאלות פתוחות שמאפשרות לשיחה להתפתח
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-brand-400">•</span>
              הראה עניין אמיתי בדמות ובמה שהיא אומרת
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-brand-400">•</span>
              אל תמהר - שמור על שיחה טבעית וזורמת
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-brand-400">•</span>
              הסשן ינותח בסוף - נסה לנהל שיחה של לפחות 5-6 הודעות
            </li>
          </ul>
        </div>

        {/* CTA */}
        <SignedIn>
          {error && (
            <div className="mb-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-900/20 dark:text-rose-400">
              {error}
            </div>
          )}
          <button
            type="button"
            onClick={() => void handleStart()}
            disabled={isStarting}
            className="w-full rounded-xl bg-gradient-to-l from-brand-500 to-brand-600 py-3.5 text-base font-medium text-white shadow-sm transition-all hover:shadow-md hover:brightness-110 disabled:opacity-60"
          >
            {isStarting ? "מתחיל..." : "התחל סשן"}
          </button>
        </SignedIn>

        <SignedOut>
          <div className="rounded-2xl border border-brand-100 bg-brand-50 p-6 text-center dark:border-blue-500/20 dark:bg-blue-500/10">
            <p className="mb-3 font-medium text-zinc-900 dark:text-white">
              יש להתחבר כדי להשתמש בסימולטור
            </p>
            <SignInButton mode="modal">
              <button
                type="button"
                className="rounded-xl bg-brand-500 px-8 py-2.5 text-sm font-medium text-white transition-all hover:bg-brand-600"
              >
                התחבר / הרשם חינם
              </button>
            </SignInButton>
          </div>
        </SignedOut>
      </main>
    </div>
  );
}
