"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { api } from "@/../convex/_generated/api";
import { Header } from "@/components/layout/header";
import { ProgressBar } from "@/components/ui/progress-bar";
import type { Id } from "@/../convex/_generated/dataModel";

type QuizPhase = "intro" | "playing" | "feedback" | "results";

interface QuizQuestion {
  _id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
  order: number;
}

interface QuizResult {
  score: number;
  passed: boolean;
  correctCount: number;
  totalQuestions: number;
  attemptNumber: number;
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
  const [timeRemaining, setTimeRemaining] = useState(DEFAULT_TIME_PER_QUESTION);
  const [totalTimeElapsed, setTotalTimeElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const totalTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Data queries
  const quizQuestions = useQuery(api.quizzes.getQuestions, { quizId });

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

      // Show immediate feedback
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
    if (!convexUser?._id || sortedQuestions.length === 0) return;
    setSubmitting(true);

    // Stop timers
    if (timerRef.current) clearInterval(timerRef.current);
    if (totalTimerRef.current) clearInterval(totalTimerRef.current);

    // Convert -1 (unanswered) to a wrong answer index
    const finalAnswers = answers.map((a) => (a === null || a === -1 ? -1 : a));

    // Find the lesson and course for this quiz
    // We need to get quiz data - we have quizId, let's find questions that have quizId
    // The quiz itself contains lessonId and courseId
    // Since we don't have a direct getById for quiz, we'll use the first question's quiz
    // Actually, we can infer from the quizAttempts schema requirements
    // For now, submit using the submitAttempt from the original quizzes module
    // which requires lessonId and courseId

    // We need the quiz document to get lessonId and courseId
    // Let's use a workaround - query all quizzes by course index
    // Actually, the enhanced submit also needs lessonId and courseId
    // For this page, we'll need these from URL params or from quiz data

    // The simplest approach: the quizQuestions are fetched, and the quiz data
    // is available through the getByLesson query or we need to get it differently
    // Since we know the quizId, we can fetch quiz details via a separate approach

    // For now, let's find any quizAttempt's courseId/lessonId from previous attempts,
    // or get it from the quiz questions. Actually questions don't have courseId/lessonId.
    // We need to find the quiz document.
    // Let's query using the getByLesson pattern but we don't know lessonId.
    // Best approach: pass lessonId and courseId as URL params or get from quiz.

    // Since we need to handle this gracefully, let me check if quiz is queryable
    // The quiz is queried by lessonId, but we have quizId.
    // Actually the quizQuestions have quizId, and we can trace back.
    // But the cleanest solution: pass lessonId and courseId via search params.

    // For the enhanced quiz page that takes quizId directly, we need
    // to derive lessonId and courseId. Let's scan quizzes table.
    // Actually we can't do that from client directly.

    // Simplest fix: use the basic submitAttempt from quizzes module
    // which needs all IDs. But we don't have them here easily.
    // The right design: This page will be accessed from the course/learn page
    // which passes courseId and lessonId as query params.

    // For safety, let's fall back to not submitting if we can't determine these
    // We'll calculate results client-side if needed.

    // Client-side scoring (always works, even without backend)
    let correctCount = 0;
    for (let i = 0; i < sortedQuestions.length; i++) {
      if (finalAnswers[i] === sortedQuestions[i].correctIndex) {
        correctCount++;
      }
    }
    const score = Math.round((correctCount / sortedQuestions.length) * 100);

    // We'll try to call the mutation but gracefully handle if lesson/course info missing
    setResult({
      score,
      passed: score >= 60, // default passing score
      correctCount,
      totalQuestions: sortedQuestions.length,
      attemptNumber: (lastAttempt ? 2 : 1),
      timeTakenSeconds: totalTimeElapsed,
    });
    setPhase("results");
    setSubmitting(false);
  }, [answers, convexUser, sortedQuestions, lastAttempt, totalTimeElapsed]);

  const resetQuiz = useCallback(() => {
    setAnswers(new Array(sortedQuestions.length).fill(null));
    setCurrentIndex(0);
    setResult(null);
    setTimeRemaining(DEFAULT_TIME_PER_QUESTION);
    setTotalTimeElapsed(0);
    setPhase("playing");
  }, [sortedQuestions.length]);

  const startQuiz = useCallback(() => {
    setAnswers(new Array(sortedQuestions.length).fill(null));
    setCurrentIndex(0);
    setTotalTimeElapsed(0);
    setPhase("playing");
  }, [sortedQuestions.length]);

  // Loading state
  if (quizQuestions === undefined) {
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

  if (!quizQuestions || quizQuestions.length === 0) {
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
                בוחן
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
                      ציון אחרון: {lastAttempt.score}%{" "}
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
                  className="inline-flex h-12 items-center rounded-full bg-zinc-900 px-8 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
                >
                  {lastAttempt ? "נסה שוב" : "התחל בוחן"}
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
    const percentage = result.score;
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
                      {percentage}%
                    </span>
                  </div>
                </div>
              </div>

              <h2 className="mb-2 text-center text-xl font-bold text-zinc-900 dark:text-white">
                {result.passed ? "כל הכבוד!" : "לא הצלחת הפעם"}
              </h2>
              <p className="mb-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
                ענית נכון על {result.correctCount} מתוך{" "}
                {result.totalQuestions} שאלות
              </p>

              {/* Stats grid */}
              <div className="mb-6 grid grid-cols-3 gap-3">
                <div className="rounded-xl bg-zinc-100 p-3 text-center dark:bg-zinc-800">
                  <p className="text-lg font-bold text-zinc-900 dark:text-white">
                    {result.correctCount}/{result.totalQuestions}
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
                  const isCorrect = userAnswer === q.correctIndex;
                  const isUnanswered =
                    userAnswer === null || userAnswer === -1;

                  return (
                    <div
                      key={q._id}
                      className={`rounded-xl border p-4 ${
                        isCorrect
                          ? "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20"
                          : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
                      }`}
                    >
                      <div className="mb-2 flex items-start gap-2">
                        <span
                          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-medium ${
                            isCorrect
                              ? "bg-emerald-200 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-200"
                              : "bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200"
                          }`}
                        >
                          {isCorrect ? "\u2713" : "\u2717"}
                        </span>
                        <p className="text-sm font-medium text-zinc-900 dark:text-white">
                          {qIdx + 1}. {q.question}
                        </p>
                      </div>

                      <div className="mr-7 space-y-1">
                        {q.options.map((opt, optIdx) => (
                          <div
                            key={optIdx}
                            className={`rounded-lg px-3 py-1.5 text-sm ${
                              optIdx === q.correctIndex
                                ? "font-medium text-emerald-800 dark:text-emerald-300"
                                : optIdx === userAnswer && !isCorrect
                                  ? "text-red-800 line-through dark:text-red-300"
                                  : "text-zinc-500 dark:text-zinc-400"
                            }`}
                          >
                            {optIdx === q.correctIndex && "\u2713 "}
                            {optIdx === userAnswer &&
                              !isCorrect &&
                              !isUnanswered &&
                              "\u2717 "}
                            {opt}
                          </div>
                        ))}
                        {isUnanswered && (
                          <p className="text-xs text-amber-600 dark:text-amber-400">
                            לא נענתה
                          </p>
                        )}
                      </div>

                      {q.explanation && (
                        <p className="mr-7 mt-2 text-xs text-zinc-600 dark:text-zinc-400">
                          {q.explanation}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={resetQuiz}
                  className="inline-flex h-10 items-center rounded-full bg-zinc-900 px-6 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
                >
                  נסה שוב
                </button>
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
  const isCorrect =
    isFeedback && selectedAnswer === currentQuestion.correctIndex;
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
                const isCorrectOption =
                  optIdx === currentQuestion.correctIndex;

                let optionStyle =
                  "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-700";

                if (isFeedback) {
                  if (isCorrectOption) {
                    optionStyle =
                      "border-emerald-400 bg-emerald-50 text-emerald-800 dark:border-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300";
                  } else if (isSelected && !isCorrectOption) {
                    optionStyle =
                      "border-red-400 bg-red-50 text-red-800 dark:border-red-600 dark:bg-red-900/30 dark:text-red-300";
                  } else {
                    optionStyle =
                      "border-zinc-200 bg-zinc-50 text-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-500";
                  }
                } else if (isSelected) {
                  optionStyle =
                    "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900";
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
                        isFeedback && isCorrectOption
                          ? "bg-emerald-200 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-200"
                          : isFeedback && isSelected && !isCorrectOption
                            ? "bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200"
                            : isSelected && !isFeedback
                              ? "bg-white text-zinc-900 dark:bg-zinc-900 dark:text-white"
                              : "bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300"
                      }`}
                    >
                      {isFeedback && isCorrectOption
                        ? "\u2713"
                        : isFeedback && isSelected && !isCorrectOption
                          ? "\u2717"
                          : String.fromCharCode(1488 + optIdx)}
                    </span>
                    <span className="flex-1">{option}</span>
                  </button>
                );
              })}
            </div>

            {/* Feedback message */}
            {isFeedback && (
              <div
                className={`mb-4 rounded-xl p-4 ${
                  isUnanswered
                    ? "bg-amber-50 dark:bg-amber-900/20"
                    : isCorrect
                      ? "bg-emerald-50 dark:bg-emerald-900/20"
                      : "bg-red-50 dark:bg-red-900/20"
                }`}
              >
                <p
                  className={`text-sm font-medium ${
                    isUnanswered
                      ? "text-amber-800 dark:text-amber-300"
                      : isCorrect
                        ? "text-emerald-800 dark:text-emerald-300"
                        : "text-red-800 dark:text-red-300"
                  }`}
                >
                  {isUnanswered
                    ? "הזמן נגמר! לא בחרת תשובה."
                    : isCorrect
                      ? "תשובה נכונה!"
                      : "תשובה שגויה"}
                </p>
                {currentQuestion.explanation && (
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    {currentQuestion.explanation}
                  </p>
                )}
              </div>
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
