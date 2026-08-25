"use client";

import { useParams } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { api } from "@/../convex/_generated/api";
import { Header } from "@/components/layout/header";
import { ProgressBar } from "@/components/ui/progress-bar";
import type { Id } from "@/../convex/_generated/dataModel";
import { learnerQuizSubmissionErrorMessage } from "@/lib/quiz-feedback";

type QuizPhase = "intro" | "playing" | "feedback" | "results";

interface QuizQuestion {
  _id: string;
  question: string;
  options: string[];
  order: number;
}

interface QuizResult {
  score: number | null;
  passed: boolean;
  correctCount: number | null;
  totalQuestions: number;
  attemptNumber: number;
  attemptsRemaining: number;
  retryAfterSeconds: number | null;
  feedback: "passed" | "retry_after_cooldown" | "attempt_window_exhausted";
  timeTakenSeconds: number;
}

const DEFAULT_TIME_PER_QUESTION = 60; // שניות

export default function QuizPage() {
  const params = useParams<{ id: string }>();
  const quizId = params.id as Id<"quizzes">;
  const { user: clerkUser } = useUser();

  // State
  const [phase, setPhase] = useState<QuizPhase>("intro");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(DEFAULT_TIME_PER_QUESTION);
  const [totalTimeElapsed, setTotalTimeElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const totalTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Data queries
  const quiz = useQuery(api.quizzes.getById, { quizId });
  const quizQuestions = useQuery(api.quizzes.getQuestions, { quizId });
  const submitQuizAnswer = useMutation(api.quizzes.submitQuizAnswer);

  const convexUser = useQuery(
    api.users.getByClerkId,
    clerkUser?.id ? { clerkId: clerkUser.id } : "skip"
  );

  const lastAttempt = useQuery(
    api.quizzes.getLastAttempt,
    convexUser?._id ? { userId: convexUser._id, quizId } : "skip"
  );

  const bestScore = useQuery(
    api.quizResults.getBestScore,
    convexUser?._id ? { userId: convexUser._id, quizId } : "skip"
  );

  // Sort questions (memoized to prevent re-renders)
  const sortedQuestions: QuizQuestion[] = useMemo(
    () =>
      quizQuestions
        ? [...quizQuestions].sort((a, b) => a.order - b.order)
        : [],
    [quizQuestions]
  );

  const currentQuestion =
    phase === "playing" || phase === "feedback"
      ? sortedQuestions[currentIndex]
      : null;

  // Timer logic
  useEffect(() => {
    if (phase === "playing") {
      setTimeRemaining(DEFAULT_TIME_PER_QUESTION);

      // Per-question timer
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            // Time's up for this question - auto-advance
            handleTimeUp();
            return DEFAULT_TIME_PER_QUESTION;
          }
          return prev - 1;
        });
      }, 1000);

      // Total time tracker
      if (!totalTimerRef.current) {
        totalTimerRef.current = setInterval(() => {
          setTotalTimeElapsed((prev) => prev + 1);
        }, 1000);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, currentIndex]);

  // Clean up total timer on unmount or results
  useEffect(() => {
    if (phase === "results" || phase === "intro") {
      if (totalTimerRef.current) {
        clearInterval(totalTimerRef.current);
        totalTimerRef.current = null;
      }
    }
  }, [phase]);

  const handleTimeUp = useCallback(() => {
    // If no answer selected, mark as -1 (unanswered)
    setAnswers((prev) => {
      const next = [...prev];
      if (next[currentIndex] === null) {
        next[currentIndex] = -1; // unanswered
      }
      return next;
    });
    // Show feedback briefly then advance
    setPhase("feedback");
  }, [currentIndex]);

  const selectAnswer = useCallback(
    (optionIndex: number) => {
      if (phase !== "playing") return;
      setAnswers((prev) => {
        const next = [...prev];
        next[currentIndex] = optionIndex;
        return next;
      });

      // Confirm the selection locally; grading happens only after server submit.
      if (timerRef.current) clearInterval(timerRef.current);
      setPhase("feedback");
      },
    [currentIndex, phase]
  );

  const advanceFromFeedback = useCallback(() => {
    if (currentIndex < sortedQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setPhase("playing");
    } else {
      // Last question - submit
      handleSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, sortedQuestions.length]);

  const handleSubmit = useCallback(async () => {
    if (!convexUser?._id || !quiz || sortedQuestions.length === 0) return;
    setSubmitting(true);
    setSubmissionError(null);

    // Stop timers
    if (timerRef.current) clearInterval(timerRef.current);
    if (totalTimerRef.current) clearInterval(totalTimerRef.current);

    const finalAnswers = answers.map((a) => (a === null || a === -1 ? -1 : a));

    try {
      const serverResult = await submitQuizAnswer({
        userId: convexUser._id,
        quizId,
        lessonId: quiz.lessonId,
        courseId: quiz.courseId,
        answers: finalAnswers,
        timeTakenSeconds: totalTimeElapsed,
      });
      setResult({
        score: serverResult.score,
        passed: serverResult.passed,
        correctCount: serverResult.correctCount,
        totalQuestions: serverResult.totalQuestions,
        attemptNumber: serverResult.attemptNumber,
        attemptsRemaining: serverResult.attemptsRemaining,
        retryAfterSeconds: serverResult.retryAfterSeconds,
        feedback: serverResult.feedback,
        timeTakenSeconds: totalTimeElapsed,
      });
      setPhase("results");
    } catch (error) {
      // Fail closed: a transport or authorization failure must never trigger
      // local grading or expose the answer key as a fallback.
      setSubmissionError(learnerQuizSubmissionErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }, [answers, convexUser, quiz, quizId, sortedQuestions.length, submitQuizAnswer, totalTimeElapsed]);

  const resetQuiz = useCallback(() => {
    setAnswers(new Array(sortedQuestions.length).fill(null));
    setCurrentIndex(0);
    setResult(null);
    setSubmissionError(null);
    setTimeRemaining(DEFAULT_TIME_PER_QUESTION);
    setTotalTimeElapsed(0);
    setSubmissionError(null);
    setPhase("playing");
  }, [sortedQuestions.length]);

  const startQuiz = useCallback(() => {
    setAnswers(new Array(sortedQuestions.length).fill(null));
    setCurrentIndex(0);
    setTotalTimeElapsed(0);
    setPhase("playing");
  }, [sortedQuestions.length]);

  // Loading state
  if (quizQuestions === undefined || quiz === undefined) {
    return (
      <div className="min-h-dvh bg-white dark:bg-zinc-950">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <div className="mx-auto max-w-2xl">
            <div className="h-8 w-64 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800" />
            <div className="mt-4 h-64 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-800" />
          </div>
        </main>
      </div>
    );
  }

  if (!quiz || !quizQuestions || quizQuestions.length === 0) {
    return (
      <div className="min-h-dvh bg-white dark:bg-zinc-950">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="mb-4 text-2xl font-bold text-zinc-900 dark:text-white">
              הבוחן לא נמצא
            </h1>
            <p className="mb-6 text-zinc-600 dark:text-zinc-400">
              הבוחן שחיפשת לא קיים או שאין בו שאלות.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex h-10 items-center rounded-full bg-zinc-900 px-6 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
            >
              חזרה לדשבורד
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // Intro phase
  if (phase === "intro") {
    return (
      <div className="min-h-dvh bg-white dark:bg-zinc-950">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <div className="mx-auto max-w-2xl">
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-8 dark:border-zinc-800 dark:bg-zinc-900">
              {/* Quiz icon */}
              <div className="mb-4 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-200 dark:bg-zinc-700">
                  <svg
                    className="h-8 w-8 text-zinc-600 dark:text-zinc-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
                    />
                  </svg>
                </div>
              </div>

              <h1 className="mb-2 text-center text-2xl font-bold text-zinc-900 dark:text-white">
                {quiz.title}
              </h1>

              <div className="mb-6 space-y-3 text-center">
                <div className="flex items-center justify-center gap-6 text-sm text-zinc-600 dark:text-zinc-400">
                  <span className="flex items-center gap-1.5">
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
                        d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {sortedQuestions.length} שאלות
                  </span>
                  <span className="flex items-center gap-1.5">
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
                    {DEFAULT_TIME_PER_QUESTION} שניות לשאלה
                  </span>
                </div>

                {/* Previous attempts info */}
                {lastAttempt && (
                  <div className="rounded-xl bg-zinc-100 p-3 dark:bg-zinc-800">
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      {lastAttempt.score === null
                        ? "ניסיון קודם: עדיין לא עבר"
                        : `ציון אחרון: ${lastAttempt.score}%`} {" "}
                      {lastAttempt.passed ? (
                        <span className="text-emerald-600 dark:text-emerald-400">
                          (עבר)
                        </span>
                      ) : (
                        <span className="text-red-600 dark:text-red-400">
                          (לא עבר)
                        </span>
                      )}
                    </p>
                    {bestScore && bestScore.score !== lastAttempt.score && (
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        ציון הכי טוב: {bestScore.score}%
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={startQuiz}
                  disabled={lastAttempt?.passed === true}
                  className="inline-flex h-12 items-center rounded-full bg-zinc-900 px-8 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
                >
                  {lastAttempt?.passed
                    ? "הבוחן הושלם"
                    : lastAttempt
                      ? "נסה שוב"
                      : "התחל בוחן"}
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Results phase
  if (phase === "results" && result) {
    const percentage = result.score ?? 0;
    const minutes = Math.floor(result.timeTakenSeconds / 60);
    const seconds = result.timeTakenSeconds % 60;

    return (
      <div className="min-h-dvh bg-white dark:bg-zinc-950">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <div className="mx-auto max-w-2xl">
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-8 dark:border-zinc-800 dark:bg-zinc-900">
              {/* Score circle */}
              <div className="mb-6 flex justify-center">
                <div className="relative h-32 w-32">
                  <svg className="h-32 w-32 -rotate-90" viewBox="0 0 120 120">
                    <circle
                      cx="60"
                      cy="60"
                      r="52"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      className="text-zinc-200 dark:text-zinc-700"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="52"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${(2 * Math.PI * 52 * percentage) / 100} ${2 * Math.PI * 52}`}
                      className={
                        result.passed
                          ? "text-emerald-500"
                          : "text-red-500"
                      }
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-zinc-900 dark:text-white">
                      {result.score === null ? "עוד לא" : `${percentage}%`}
                    </span>
                  </div>
                </div>
              </div>

              <h2 className="mb-2 text-center text-xl font-bold text-zinc-900 dark:text-white">
                {result.passed ? "כל הכבוד!" : "לא הצלחת הפעם"}
              </h2>
              <p className="mb-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
                {result.correctCount === null
                  ? "הציון המדויק מוצג אחרי מעבר, כדי לשמור על הוגנות הבוחן."
                  : `ענית נכון על ${result.correctCount} מתוך ${result.totalQuestions} שאלות`}
              </p>
              {!result.passed && (
                <p className="mb-6 text-center text-xs text-zinc-500 dark:text-zinc-400">
                  {result.feedback === "attempt_window_exhausted"
                    ? "מכסת ההגשות להיום הסתיימה. אפשר לחזור מחר."
                    : `נשארו ${result.attemptsRemaining} הגשות בחלון הנוכחי; אפשר לנסות שוב אחרי דקה.`}
                </p>
              )}

              {/* Stats grid */}
              <div className="mb-6 grid grid-cols-3 gap-3">
                <div className="rounded-xl bg-zinc-100 p-3 text-center dark:bg-zinc-800">
                  <p className="text-lg font-bold text-zinc-900 dark:text-white">
                    {result.correctCount === null
                      ? "—"
                      : `${result.correctCount}/${result.totalQuestions}`}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    תשובות נכונות
                  </p>
                </div>
                <div className="rounded-xl bg-zinc-100 p-3 text-center dark:bg-zinc-800">
                  <p className="text-lg font-bold text-zinc-900 dark:text-white">
                    {minutes}:{String(seconds).padStart(2, "0")}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    זמן כולל
                  </p>
                </div>
                <div className="rounded-xl bg-zinc-100 p-3 text-center dark:bg-zinc-800">
                  <p className="text-lg font-bold text-zinc-900 dark:text-white">
                    #{result.attemptNumber}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    ניסיון
                  </p>
                </div>
              </div>

              {/* Question review */}
              <div className="mb-6 space-y-3">
                <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  סיכום תשובות
                </h3>
                {sortedQuestions.map((q, qIdx) => {
                  const userAnswer = answers[qIdx];

                  return (
                    <div
                      key={q._id}
                      className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800"
                    >
                      <div className="mb-2 flex items-start gap-2">
                        <span
                          className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-medium text-brand-800 dark:bg-brand-900/30 dark:text-brand-200"
                        >
                          {qIdx + 1}
                        </span>
                        <p className="text-sm font-medium text-zinc-900 dark:text-white">
                          {q.question}
                        </p>
                      </div>

                      <p className="mr-7 text-sm text-zinc-500 dark:text-zinc-400">
                        {userAnswer === null || userAnswer < 0
                          ? "לא נענתה"
                          : `תשובתך: ${q.options[userAnswer]}`}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center justify-center gap-3">
                {!result.passed && result.attemptsRemaining > 0 && (
                  <button
                    type="button"
                    onClick={resetQuiz}
                    className="inline-flex h-10 items-center rounded-full bg-zinc-900 px-6 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
                  >
                    נסה שוב אחרי דקה
                  </button>
                )}
                <Link
                  href="/dashboard"
                  className="inline-flex h-10 items-center rounded-full border border-zinc-300 bg-white px-6 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
                >
                  חזרה לדשבורד
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Playing / Feedback phase
  if (!currentQuestion) return null;

  const progressPercent = Math.round(
    ((currentIndex + 1) / sortedQuestions.length) * 100
  );
  const answeredCount = answers.filter((a) => a !== null).length;
  const isFeedback = phase === "feedback";
  const selectedAnswer = answers[currentIndex];
  const isUnanswered =
    isFeedback && (selectedAnswer === null || selectedAnswer === -1);

  // Timer color based on remaining time
  const timerColor =
    timeRemaining > 30
      ? "text-zinc-600 dark:text-zinc-400"
      : timeRemaining > 10
        ? "text-amber-600 dark:text-amber-400"
        : "text-red-600 dark:text-red-400";

  return (
    <div className="min-h-dvh bg-white dark:bg-zinc-950">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-2xl">
          {/* Top bar: progress + timer */}
          <div className="mb-6 flex items-center justify-between">
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              שאלה {currentIndex + 1} מתוך {sortedQuestions.length}
            </span>
            {!isFeedback && (
              <span className={`flex items-center gap-1.5 text-sm font-medium ${timerColor}`}>
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
                {timeRemaining}s
              </span>
            )}
          </div>

          {/* Progress bar */}
          <div className="mb-6">
            <ProgressBar value={progressPercent} size="sm" />
          </div>

          {/* Question dots */}
          <div
            className="mb-6 flex gap-1.5"
            role="navigation"
            aria-label="שאלות הבוחן"
          >
            {sortedQuestions.map((_, idx) => {
              const isActive = idx === currentIndex;
              const isAnswered = answers[idx] !== null;
              return (
                <div
                  key={idx}
                  aria-label={`שאלה ${idx + 1}${isAnswered ? " (נענתה)" : ""}`}
                  className={`h-2 flex-1 rounded-full transition-colors ${
                    isActive
                      ? "bg-zinc-900 dark:bg-white"
                      : isAnswered
                        ? "bg-zinc-400 dark:bg-zinc-500"
                        : "bg-zinc-200 dark:bg-zinc-700"
                  }`}
                />
              );
            })}
          </div>

          {/* Timer bar (visual) */}
          {!isFeedback && (
            <div className="mb-6 h-1 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
              <div
                className={`h-1 rounded-full transition-all duration-1000 ${
                  timeRemaining > 30
                    ? "bg-emerald-500"
                    : timeRemaining > 10
                      ? "bg-amber-500"
                      : "bg-red-500"
                }`}
                style={{
                  width: `${(timeRemaining / DEFAULT_TIME_PER_QUESTION) * 100}%`,
                }}
              />
            </div>
          )}

          {/* Question card */}
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-6 text-lg font-semibold text-zinc-900 dark:text-white">
              {currentQuestion.question}
            </h2>

            {/* Options */}
            <div
              className="mb-6 space-y-3"
              role="radiogroup"
              aria-label="אפשרויות תשובה"
            >
              {currentQuestion.options.map((option, optIdx) => {
                const isSelected = selectedAnswer === optIdx;

                let optionStyle =
                  "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-700";

                if (isSelected) {
                  optionStyle =
                    "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900";
                } else if (isFeedback) {
                  optionStyle =
                    "border-zinc-200 bg-zinc-50 text-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-500";
                }

                return (
                  <button
                    key={optIdx}
                    type="button"
                    onClick={() => selectAnswer(optIdx)}
                    disabled={isFeedback}
                    role="radio"
                    aria-checked={isSelected}
                    className={`flex w-full items-center gap-3 rounded-xl border p-4 text-right text-sm transition-colors ${optionStyle} ${isFeedback ? "cursor-default" : "cursor-pointer"}`}
                  >
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-medium ${
                        isSelected
                          ? "bg-white text-zinc-900 dark:bg-zinc-900 dark:text-white"
                          : "bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300"
                      }`}
                    >
                      {String.fromCharCode(1488 + optIdx)}
                    </span>
                    <span className="flex-1">{option}</span>
                  </button>
                );
              })}
            </div>

            {/* Feedback message */}
            {isFeedback && (
              <div
                className={`mb-4 rounded-xl p-4 ${isUnanswered ? "bg-amber-50 dark:bg-amber-900/20" : "bg-blue-50 dark:bg-blue-900/20"}`}
              >
                <p
                  className={`text-sm font-medium ${isUnanswered ? "text-amber-800 dark:text-amber-300" : "text-blue-800 dark:text-blue-300"}`}
                >
                  {isUnanswered
                    ? "הזמן נגמר ולא נבחרה תשובה. הבדיקה תתבצע בשרת בסיום."
                    : "התשובה נשמרה. הבדיקה תתבצע בשרת בסיום הבוחן."}
                </p>
              </div>
            )}

            {submissionError && (
              <p className="mb-4 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-800 dark:bg-red-900/20 dark:text-red-300" role="alert">
                {submissionError}
              </p>
            )}

            {/* Navigation */}
            {isFeedback && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={advanceFromFeedback}
                  disabled={submitting}
                  className="inline-flex h-10 items-center rounded-full bg-zinc-900 px-6 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
                >
                  {submitting
                    ? "שולח..."
                    : currentIndex < sortedQuestions.length - 1
                      ? "שאלה הבאה"
                      : "סיים בוחן"}
                </button>
              </div>
            )}
          </div>

          {/* Bottom stats */}
          <div className="mt-4 flex items-center justify-between text-xs text-zinc-400 dark:text-zinc-500">
            <span>{answeredCount}/{sortedQuestions.length} שאלות נענו</span>
            <span>
              זמן כולל: {Math.floor(totalTimeElapsed / 60)}:
              {String(totalTimeElapsed % 60).padStart(2, "0")}
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
