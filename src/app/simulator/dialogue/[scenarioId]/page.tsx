"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { api } from "@/../convex/_generated/api";
import type { Id } from "@/../convex/_generated/dataModel";
import { Header } from "@/components/layout/header";
import { DifficultyBadge } from "@/components/simulator/difficulty-badge";
import { DialogueScene } from "@/components/simulator/dialogue-scene";
import { ScoreSummary } from "@/components/simulator/score-summary";
import Link from "next/link";

type SessionPhase =
  | "intro"
  | "playing"
  | "completed";

interface ChoiceResult {
  stepId: string;
  choiceIndex: number;
  score: number;
  feedback: string;
}

export default function DialogueScenarioPage() {
  const params = useParams();
  const router = useRouter();
  const scenarioId = params.scenarioId as Id<"dialogueScenarios">;

  const scenario = useQuery(api.simulator.getDialogueScenario, { scenarioId });

  const startSimulation = useMutation(api.simulator.startSimulation);
  const submitChoice = useMutation(api.simulator.submitChoice);
  const completeSimulation = useMutation(api.simulator.completeSimulation);

  const [phase, setPhase] = useState<SessionPhase>("intro");
  const [sessionId, setSessionId] = useState<Id<"dialogueSessions"> | null>(
    null
  );
  const [currentStep, setCurrentStep] = useState(0);
  const [choices, setChoices] = useState<ChoiceResult[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completionData, setCompletionData] = useState<{
    totalScore: number;
    maxPossibleScore: number;
    grade: string;
    summaryFeedback: string;
  } | null>(null);

  const handleStart = async () => {
    if (isStarting) return;
    setIsStarting(true);
    setError(null);
    try {
      const id = await startSimulation({ scenarioId });
      setSessionId(id);
      setCurrentStep(0);
      setChoices([]);
      setPhase("playing");
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה בהתחלת הסימולציה");
    } finally {
      setIsStarting(false);
    }
  };

  const handleChoiceSubmit = async (choiceIndex: number) => {
    if (!sessionId || !scenario) throw new Error("No active session");
    const dialoguePoint = scenario.dialoguePoints[currentStep];
    if (!dialoguePoint) throw new Error("Invalid step");

    setIsSubmitting(true);
    try {
      const result = await submitChoice({
        sessionId,
        stepId: dialoguePoint.id,
        choiceIndex,
      });

      const choiceResult: ChoiceResult = {
        stepId: dialoguePoint.id,
        choiceIndex,
        score: result.score,
        feedback: result.feedback,
      };

      setChoices((prev) => [...prev, choiceResult]);

      return result;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextStep = async () => {
    if (!scenario) return;
    const nextStep = currentStep + 1;

    if (nextStep >= scenario.dialoguePoints.length) {
      // Complete simulation
      if (!sessionId) return;
      try {
        const result = await completeSimulation({ sessionId });
        setCompletionData(result);
        setPhase("completed");
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "שגיאה בסיום הסימולציה"
        );
      }
    } else {
      setCurrentStep(nextStep);
    }
  };

  const handleTryAgain = () => {
    setPhase("intro");
    setSessionId(null);
    setCurrentStep(0);
    setChoices([]);
    setCompletionData(null);
    setError(null);
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

  // Completed phase
  if (phase === "completed" && completionData) {
    return (
      <div className="min-h-dvh bg-zinc-50 dark:bg-zinc-950">
        <Header />
        <main className="container mx-auto max-w-xl px-4 py-8">
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

          <ScoreSummary
            totalScore={completionData.totalScore}
            maxPossibleScore={completionData.maxPossibleScore}
            grade={completionData.grade}
            summaryFeedback={completionData.summaryFeedback}
            choices={choices}
            scenarioTitle={scenario.title}
            onTryAgain={handleTryAgain}
            onChooseAnother={() => router.push("/simulator")}
          />
        </main>
      </div>
    );
  }

  // Playing phase
  if (phase === "playing" && scenario.dialoguePoints[currentStep]) {
    const dialoguePoint = scenario.dialoguePoints[currentStep];
    const runningScore = choices.reduce((sum, c) => sum + c.score, 0);
    const maxRunningScore = choices.length * 3;
    const lastChoice = choices[choices.length - 1];
    const stepDone = lastChoice?.stepId === dialoguePoint.id;

    return (
      <div className="min-h-dvh bg-zinc-50 dark:bg-zinc-950">
        <Header />
        <main className="container mx-auto max-w-xl px-4 py-8">
          {/* Back link */}
          <button
            type="button"
            onClick={() => setPhase("intro")}
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
            {scenario.title}
          </button>

          {error && (
            <div className="mb-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-900/20 dark:text-rose-400">
              {error}
            </div>
          )}

          <DialogueScene
            dialoguePoint={dialoguePoint}
            stepNumber={currentStep + 1}
            totalSteps={scenario.dialoguePoints.length}
            personaName={scenario.personaName}
            personaEmoji={scenario.personaEmoji}
            runningScore={runningScore}
            maxRunningScore={maxRunningScore}
            onChoiceSubmit={handleChoiceSubmit}
            isSubmitting={isSubmitting}
          />

          {/* Next step button - appears after choice submitted */}
          {stepDone && (
            <button
              type="button"
              onClick={() => void handleNextStep()}
              className="mt-5 w-full rounded-xl bg-zinc-900 py-3 text-sm font-medium text-white transition-all hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
            >
              {currentStep + 1 >= scenario.dialoguePoints.length
                ? "ראה תוצאות"
                : "המשך לשלב הבא"}
            </button>
          )}
        </main>
      </div>
    );
  }

  // Intro phase
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

        {/* Scenario card */}
        <div className="mb-8 rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          {/* Header */}
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
              הדמות בתרחיש
            </h3>
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rose-100 to-pink-200 text-3xl dark:from-rose-900/40 dark:to-pink-800/40">
                {scenario.personaEmoji}
              </div>
              <div>
                <p className="mb-0.5 font-semibold text-zinc-900 dark:text-white">
                  {scenario.personaName}
                </p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {scenario.personaDescription}
                </p>
              </div>
            </div>
          </div>

          {/* Meta info */}
          <div className="flex items-center gap-6 text-sm text-zinc-500 dark:text-zinc-400">
            <div className="flex items-center gap-1.5">
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
                  d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {scenario.estimatedMinutes} דקות
            </div>
            <div className="flex items-center gap-1.5">
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
                  d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
                />
              </svg>
              {scenario.dialoguePoints.length} שלבים
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="mb-8 rounded-2xl bg-zinc-50 p-5 dark:bg-zinc-900">
          <h3 className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            איך זה עובד
          </h3>
          <ul className="flex flex-col gap-2 text-sm text-zinc-500 dark:text-zinc-400">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-brand-400">1.</span>
              תתמודד עם {scenario.dialoguePoints.length} סיטואציות דייטינג שונות
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-brand-400">2.</span>
              לכל סיטואציה - בחר את התגובה הנכונה מבין 3-4 אפשרויות
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-brand-400">3.</span>
              אחרי כל בחירה תקבל משוב מיידי עם הסבר ועצה
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-brand-400">4.</span>
              בסיום קבל ציון, דירוג (A-F), ופירוט מלא
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
            className="w-full rounded-xl bg-gradient-to-l from-brand-500 to-brand-600 py-3.5 text-base font-semibold text-white shadow-sm transition-all hover:shadow-md hover:brightness-110 disabled:opacity-60"
          >
            {isStarting ? "מתחיל..." : "התחל סימולציה"}
          </button>
        </SignedIn>

        <SignedOut>
          <div className="rounded-2xl border border-brand-100 bg-brand-50 p-6 text-center dark:border-blue-500/20 dark:bg-blue-500/10">
            <p className="mb-3 font-medium text-zinc-900 dark:text-white">
              יש להתחבר כדי להשתמש בסימולציה
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
