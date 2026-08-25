"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { learnerQuizSubmissionErrorMessage } from "@/lib/quiz-feedback";

interface QuizQuestion {
  _id: string;
  question: string;
  options: string[];
  order: number;
}

interface QuizPlayerProps {
  quizTitle: string;
  questions: QuizQuestion[];
  passingScore: number;
  onSubmit: (answers: number[]) => Promise<{
    score: number | null;
    passed: boolean;
    correctCount: number | null;
    totalQuestions: number;
    attemptsRemaining: number;
    retryAfterSeconds: number | null;
    feedback: "passed" | "retry_after_cooldown" | "attempt_window_exhausted";
  }>;
  lastScore?: number | null;
  lastPassed?: boolean | null;
  courseId?: string;
  lessonId?: string;
  nextLessonId?: string;
}

type QuizState = "intro" | "playing" | "feedback" | "results";

interface AnswerState {
  selected: number | null;
  submitted: boolean;
}

const TIMER_SECONDS = 30;

export function QuizPlayer({
  quizTitle,
  questions,
  passingScore,
  onSubmit,
  lastScore,
  lastPassed,
  courseId,
  nextLessonId,
}: QuizPlayerProps) {
  const [state, setState] = useState<QuizState>("intro");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answerStates, setAnswerStates] = useState<AnswerState[]>(() =>
    questions.map(() => ({ selected: null, submitted: false }))
  );
  const [result, setResult] = useState<{
    score: number | null;
    passed: boolean;
    correctCount: number | null;
    totalQuestions: number;
    attemptsRemaining: number;
    retryAfterSeconds: number | null;
    feedback: "passed" | "retry_after_cooldown" | "attempt_window_exhausted";
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [timerActive, setTimerActive] = useState(false);
  const [celebrationVisible, setCelebrationVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const sortedQuestions = [...questions].sort((a, b) => a.order - b.order);
  const currentQuestion = sortedQuestions[currentIndex];
  const currentAnswer = answerStates[currentIndex];
  const answeredCount = answerStates.filter((a) => a.selected !== null).length;

  // Timer logic
  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Time up - auto-submit current answer (or null)
            if (!currentAnswer.submitted) {
              handleSelectAndSubmit(currentAnswer.selected ?? -1, true);
            }
            return TIMER_SECONDS;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timerActive, timeLeft, currentIndex]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeLeft(TIMER_SECONDS);
  }, []);

  const handleSelectAndSubmit = useCallback(
    (optionIndex: number, forceSubmit = false) => {
      if (currentAnswer.submitted && !forceSubmit) return;

      // Record selection
      setAnswerStates((prev) => {
        const next = [...prev];
        next[currentIndex] = {
          selected: optionIndex >= 0 ? optionIndex : null,
          submitted: true,
        };
        return next;
      });

      // Show feedback state
      setState("feedback");
      setTimerActive(false);
      resetTimer();
    },
    [currentAnswer.submitted, currentIndex, resetTimer]
  );

  const handleNext = useCallback(() => {
    if (currentIndex < sortedQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setState("playing");
      setTimeLeft(TIMER_SECONDS);
      setTimerActive(true);
    } else {
      // All questions done - submit
      handleFinalSubmit();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, sortedQuestions.length]);

  const handleFinalSubmit = useCallback(async () => {
    setSubmitting(true);
    setSubmissionError(null);
    setTimerActive(false);
    const answers = answerStates.map((a) =>
      a.selected !== null ? a.selected : -1
    );
    try {
      const submitResult = await onSubmit(answers);
      setResult(submitResult);
      setState("results");
      if (
        submitResult.passed &&
        submitResult.score !== null &&
        submitResult.score >= 80
      ) {
        setCelebrationVisible(true);
      }
    } catch (error) {
      // No client-side grading fallback: transport/auth failures stay opaque.
      setSubmissionError(learnerQuizSubmissionErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }, [answerStates, onSubmit]);

  const handleReset = useCallback(() => {
    setAnswerStates(questions.map(() => ({ selected: null, submitted: false })));
    setCurrentIndex(0);
    setResult(null);
    setSubmissionError(null);
    setCelebrationVisible(false);
    setState("playing");
    setTimeLeft(TIMER_SECONDS);
    setTimerActive(true);
  }, [questions]);

  const handleStart = useCallback(() => {
    setSubmissionError(null);
    setState("playing");
    setTimeLeft(TIMER_SECONDS);
    setTimerActive(true);
  }, []);

  const timerPercent = (timeLeft / TIMER_SECONDS) * 100;
  const timerColor =
    timeLeft > 15
      ? "stroke-brand-500"
      : timeLeft > 7
        ? "stroke-amber-500"
        : "stroke-red-500";

  // ─────────────────────────────────────────────────────────────────────
  // INTRO SCREEN
  // ─────────────────────────────────────────────────────────────────────
  if (state === "intro") {
    return (
      <div
        className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
        role="region"
        aria-label={`בוחן: ${quizTitle}`}
      >
        {/* Header gradient */}
        <div className="bg-gradient-to-r from-brand-500/10 to-blue-500/10 px-6 py-5 border-b border-zinc-100 dark:border-zinc-800">
          <div className="mb-1 flex items-center gap-2 text-xs font-semibold tracking-wide text-brand-600 uppercase dark:text-brand-400">
            <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            בוחן ידע
          </div>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white">{quizTitle}</h3>
        </div>

        <div className="p-6">
          {/* Stats grid */}
          <div className="mb-6 grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-zinc-50 p-3 text-center dark:bg-zinc-800">
              <div className="text-2xl font-bold text-zinc-900 dark:text-white">
                {sortedQuestions.length}
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400">שאלות</div>
            </div>
            <div className="rounded-xl bg-zinc-50 p-3 text-center dark:bg-zinc-800">
              <div className="text-2xl font-bold text-zinc-900 dark:text-white">
                {TIMER_SECONDS}″
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400">לכל שאלה</div>
            </div>
            <div className="rounded-xl bg-zinc-50 p-3 text-center dark:bg-zinc-800">
              <div className="text-2xl font-bold text-brand-600 dark:text-brand-400">
                {passingScore}%
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400">לעבור</div>
            </div>
          </div>

          {/* Previous score */}
          {lastPassed !== null && lastPassed !== undefined && (
            <div
              className={`mb-5 flex items-center gap-3 rounded-xl border p-4 ${
                lastPassed
                  ? "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20"
                  : "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20"
              }`}
              aria-live="polite"
            >
              <div className={`text-2xl ${lastPassed ? "text-emerald-500" : "text-amber-500"}`}>
                {lastPassed ? "✓" : "↻"}
              </div>
              <div>
                <div className="text-sm font-medium text-zinc-900 dark:text-white">
                  {lastScore !== null && lastScore !== undefined
                    ? `ניסיון קודם: ${lastScore}%`
                    : "ניסיון קודם: עדיין לא עבר"}
                </div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400">
                  {lastPassed ? "עברת את הבוחן" : "לא הגעת לציון המעבר"}
                </div>
              </div>
            </div>
          )}

          {/* Instructions */}
          <ul className="mb-6 space-y-2 text-sm text-zinc-600 dark:text-zinc-400" aria-label="הוראות הבוחן">
            <li className="flex items-center gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs text-brand-700 dark:bg-brand-900/30 dark:text-brand-400">1</span>
              בחר תשובה; הציון יחושב בשרת בסיום הבוחן
            </li>
            <li className="flex items-center gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs text-brand-700 dark:bg-brand-900/30 dark:text-brand-400">2</span>
              יש לך {TIMER_SECONDS} שניות לכל שאלה
            </li>
            <li className="flex items-center gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs text-brand-700 dark:bg-brand-900/30 dark:text-brand-400">3</span>
              עד 3 הגשות ב־24 שעות, עם דקה בין הגשות
            </li>
          </ul>

          <button
            type="button"
            onClick={handleStart}
            disabled={lastPassed === true}
            className="w-full rounded-xl bg-brand-500 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-600 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 active:scale-[0.98]"
          >
            {lastPassed
              ? "הבוחן הושלם"
              : lastPassed === false
                ? "נסה שוב"
                : "התחל בוחן"}
          </button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────
  // RESULTS SCREEN
  // ─────────────────────────────────────────────────────────────────────
  if (state === "results" && result) {
    const scoreColor =
      result.score !== null && result.score >= 80
        ? "text-emerald-600 dark:text-emerald-400"
        : result.score !== null && result.score >= passingScore
          ? "text-blue-600 dark:text-blue-400"
          : "text-red-600 dark:text-red-400";

    return (
      <div
        className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
        role="region"
        aria-label="תוצאות הבוחן"
        aria-live="polite"
      >
        {/* Celebration overlay for high scores */}
        {celebrationVisible && (
          <div
            className="pointer-events-none absolute inset-0 z-10 overflow-hidden"
            aria-hidden="true"
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <span
                key={i}
                className="absolute text-lg"
                style={{
                  left: `${Math.random() * 90 + 5}%`,
                  top: "-20px",
                  animation: `fall ${1.5 + Math.random()}s ease-in ${Math.random() * 0.5}s forwards`,
                }}
              >
                {["⭐", "🎉", "✨", "💫", "🌟"][i % 5]}
              </span>
            ))}
          </div>
        )}

        {/* Score header */}
        <div
          className={`px-6 py-8 text-center ${
            result.passed
              ? "bg-gradient-to-b from-emerald-50 to-white dark:from-emerald-900/20 dark:to-zinc-900"
              : "bg-gradient-to-b from-red-50 to-white dark:from-red-900/20 dark:to-zinc-900"
          }`}
        >
          <div
            className={`mb-2 text-6xl font-black ${scoreColor}`}
            aria-label={
              result.score === null
                ? "הבוחן עדיין לא עבר"
                : `ציון: ${result.score} אחוז`
            }
          >
            {result.score === null ? "עוד לא" : `${result.score}%`}
          </div>
          <div
            className={`mb-1 text-lg font-semibold ${
              result.passed
                ? "text-emerald-700 dark:text-emerald-400"
                : "text-red-700 dark:text-red-400"
            }`}
          >
            {result.passed
              ? result.score !== null && result.score >= 90
                ? "מצוין! עבודה נהדרת"
                : result.score !== null && result.score >= 80
                  ? "כל הכבוד! עברת"
                  : "עברת את הבוחן"
              : "לא הצלחת הפעם"}
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {result.correctCount === null
              ? "הציון המדויק מוצג אחרי מעבר, כדי לשמור על הוגנות הבוחן."
              : `${result.correctCount} מתוך ${result.totalQuestions} שאלות נכונות`}
          </p>
          {!result.passed && (
            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
              {result.feedback === "attempt_window_exhausted"
                ? "מכסת ההגשות להיום הסתיימה. אפשר לחזור מחר."
                : `נשארו ${result.attemptsRemaining} הגשות בחלון הנוכחי; אפשר לנסות שוב אחרי דקה.`}
            </p>
          )}

          {/* Score bar */}
          <div className="mx-auto mt-4 max-w-xs">
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${
                  result.passed ? "bg-emerald-500" : "bg-red-500"
                }`}
                style={{ width: `${result.score ?? 0}%` }}
                role="progressbar"
                aria-valuenow={result.score ?? 0}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
            <div className="mt-1 flex justify-between text-xs text-zinc-400">
              <span>0%</span>
              <span className="text-brand-500">מעבר: {passingScore}%</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        {/* Question breakdown */}
        <div className="p-6">
          <h4 className="mb-4 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            פירוט התשובות
          </h4>
          <div className="space-y-3">
            {sortedQuestions.map((q, idx) => {
              const userAnswer = answerStates[idx].selected;
              return (
                <div
                  key={q._id}
                  className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/50"
                >
                  <div className="mb-2 flex items-start gap-2">
                    <span
                      className="mt-0.5 shrink-0 text-sm text-brand-600 dark:text-brand-400"
                      aria-label="תשובה שנשלחה לבדיקה"
                    >
                      •
                    </span>
                    <p className="text-sm font-medium text-zinc-900 dark:text-white">
                      {idx + 1}. {q.question}
                    </p>
                  </div>

                  <p className="mt-2 pr-5 text-xs text-zinc-600 dark:text-zinc-400">
                    {userAnswer === null
                      ? "לא נבחרה תשובה"
                      : `תשובתך: ${q.options[userAnswer]}`}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-wrap gap-3">
            {!result.passed && result.attemptsRemaining > 0 && (
              <button
                type="button"
                onClick={handleReset}
                disabled={submitting}
                className="flex-1 rounded-xl border border-zinc-200 bg-white px-5 py-3 text-sm font-medium text-zinc-700 shadow-sm transition-all hover:border-zinc-300 hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 active:scale-[0.98] dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              >
                נסה שוב אחרי דקה
              </button>
            )}
            {courseId && nextLessonId && result.passed && (
              <Link
                href={`/courses/${courseId}/lessons/${nextLessonId}`}
                className="flex-1 rounded-xl bg-brand-500 px-5 py-3 text-center text-sm font-medium text-white shadow-sm transition-all hover:bg-brand-600 hover:shadow-md active:scale-[0.98]"
              >
                המשך לשיעור הבא
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────
  // PLAYING / FEEDBACK SCREENS
  // ─────────────────────────────────────────────────────────────────────
  const isLastQuestion = currentIndex === sortedQuestions.length - 1;
  const isFeedback = state === "feedback";
  const selectedOption = currentAnswer.selected;

  return (
    <div
      className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
      role="region"
      aria-label={`שאלה ${currentIndex + 1} מתוך ${sortedQuestions.length}`}
    >
      {/* Top bar: title + timer */}
      <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-3 dark:border-zinc-800">
        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          {quizTitle}
        </span>

        {/* Circular timer */}
        {!isFeedback && (
          <div
            className="relative flex h-10 w-10 items-center justify-center"
            role="timer"
            aria-label={`${timeLeft} שניות נותרו`}
            aria-live="polite"
          >
            <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 36 36" aria-hidden="true">
              <circle
                cx="18"
                cy="18"
                r="15.9"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-zinc-100 dark:text-zinc-800"
              />
              <circle
                cx="18"
                cy="18"
                r="15.9"
                fill="none"
                strokeWidth="2.5"
                strokeDasharray="100"
                strokeDashoffset={100 - timerPercent}
                strokeLinecap="round"
                className={`transition-all duration-1000 ${timerColor}`}
              />
            </svg>
            <span
              className={`text-xs font-bold tabular-nums ${
                timeLeft <= 7
                  ? "text-red-600 dark:text-red-400"
                  : "text-zinc-700 dark:text-zinc-300"
              }`}
            >
              {timeLeft}
            </span>
          </div>
        )}

        {isFeedback && (
          <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500">
            {answeredCount}/{sortedQuestions.length} ענו
          </span>
        )}
      </div>

      {/* Progress dots */}
      <div className="flex gap-1 px-5 pt-4" role="navigation" aria-label="התקדמות בבוחן">
        {sortedQuestions.map((_, idx) => {
          const ans = answerStates[idx];
          return (
            <div
              key={idx}
              aria-label={`שאלה ${idx + 1}${ans.submitted ? " - נענתה" : ""}`}
              className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                idx === currentIndex
                  ? "bg-brand-500"
                  : ans.submitted
                    ? "bg-brand-300 dark:bg-brand-700"
                    : "bg-zinc-200 dark:bg-zinc-700"
              }`}
            />
          );
        })}
      </div>

      <div className="p-5">
        {/* Question number + text */}
        <div className="mb-5">
          <p className="mb-1 text-xs font-medium text-zinc-400 dark:text-zinc-500">
            שאלה {currentIndex + 1} מתוך {sortedQuestions.length}
          </p>
          <h4 className="text-base font-semibold leading-relaxed text-zinc-900 dark:text-white">
            {currentQuestion?.question}
          </h4>
        </div>

        {/* Options */}
        <div
          className="mb-4 space-y-2.5"
          role="radiogroup"
          aria-label="אפשרויות תשובה"
        >
          {currentQuestion?.options.map((option, optIdx) => {
            const isSelected = selectedOption === optIdx;

            let buttonClass =
              "relative w-full rounded-xl border px-4 py-3.5 text-right text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1 active:scale-[0.99]";

            buttonClass += isSelected
              ? " border-brand-500 bg-brand-50 text-brand-800 dark:border-brand-400 dark:bg-brand-900/20 dark:text-brand-200"
              : isFeedback
                ? " border-zinc-200 bg-zinc-50 text-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-500"
                : " border-zinc-200 bg-white text-zinc-700 hover:border-brand-300 hover:bg-brand-50/50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-brand-700 dark:hover:bg-brand-900/10";

            return (
              <button
                key={optIdx}
                type="button"
                onClick={() =>
                  !isFeedback && handleSelectAndSubmit(optIdx)
                }
                disabled={isFeedback}
                role="radio"
                aria-checked={isSelected}
                aria-label={`${option}${isFeedback && isSelected ? " - נבחרה" : ""}`}
                className={buttonClass}
              >
                <div className="flex items-center gap-3">
                  {/* Option indicator */}
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold transition-colors ${
                      isSelected
                        ? "border-brand-500 bg-brand-500 text-white"
                        : "border-zinc-300 text-zinc-500 dark:border-zinc-600"
                    }`}
                    aria-hidden="true"
                  >
                    {String.fromCharCode(65 + optIdx)}
                  </span>
                  <span className="flex-1 text-right leading-snug">
                    {option}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selection receipt; grading remains server-side. */}
        {isFeedback && (
          <div
            className="mb-4 flex items-center gap-3 rounded-xl bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
            role="status"
            aria-live="polite"
          >
            <span className="text-xl" aria-hidden="true">
              ✓
            </span>
            {selectedOption === null
              ? "לא נבחרה תשובה. הבדיקה תתבצע בשרת בסיום הבוחן."
              : "התשובה נשמרה. הבדיקה תתבצע בשרת בסיום הבוחן."}
          </div>
        )}

        {submissionError && (
          <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-800 dark:bg-red-900/20 dark:text-red-300" role="alert">
            {submissionError}
          </p>
        )}

        {/* Navigation buttons */}
        <div className="flex items-center justify-between">
          {isFeedback ? (
            <div className="flex w-full items-center justify-end">
              {isLastQuestion ? (
                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  disabled={submitting}
                  className="inline-flex h-10 items-center rounded-xl bg-brand-500 px-6 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-600 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <svg className="me-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      מחשב ציון...
                    </>
                  ) : (
                    "סיים וראה תוצאות"
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand-500 px-6 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-600 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 active:scale-[0.98]"
                >
                  השאלה הבאה
                  <svg className="h-4 w-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              )}
            </div>
          ) : (
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              לחץ על תשובה כדי להמשיך
            </p>
          )}
        </div>
      </div>

      {/* CSS for celebration animation */}
      <style>{`
        @keyframes fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(400px) rotate(360deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
