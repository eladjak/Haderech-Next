"use client";

import { useState, useCallback } from "react";

interface QuizQuestion {
  _id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
  order: number;
}

interface QuizPlayerProps {
  quizTitle: string;
  questions: QuizQuestion[];
  passingScore: number;
  onSubmit: (answers: number[]) => Promise<{
    score: number;
    passed: boolean;
    correctCount: number;
    totalQuestions: number;
  }>;
  lastScore?: number | null;
  lastPassed?: boolean | null;
}

type QuizState = "intro" | "playing" | "review";

export function QuizPlayer({
  quizTitle,
  questions,
  passingScore,
  onSubmit,
  lastScore,
  lastPassed,
}: QuizPlayerProps) {
  const [state, setState] = useState<QuizState>("intro");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(
    () => new Array(questions.length).fill(null)
  );
  const [result, setResult] = useState<{
    score: number;
    passed: boolean;
    correctCount: number;
    totalQuestions: number;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const sortedQuestions = [...questions].sort((a, b) => a.order - b.order);
  const currentQuestion = sortedQuestions[currentQuestionIndex];
  const allAnswered = answers.every((a) => a !== null);

  const selectAnswer = useCallback(
    (optionIndex: number) => {
      setAnswers((prev) => {
        const next = [...prev];
        next[currentQuestionIndex] = optionIndex;
        return next;
      });
    },
    [currentQuestionIndex]
  );

  const handleSubmit = useCallback(async () => {
    if (!allAnswered) return;
    setSubmitting(true);
    const submitResult = await onSubmit(answers as number[]);
    setResult(submitResult);
    setState("review");
    setSubmitting(false);
  }, [allAnswered, answers, onSubmit]);

  const resetQuiz = useCallback(() => {
    setAnswers(new Array(questions.length).fill(null));
    setCurrentQuestionIndex(0);
    setResult(null);
    setState("playing");
  }, [questions.length]);

  // Intro screen
  if (state === "intro") {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-1 text-sm font-medium text-zinc-500 dark:text-zinc-400">
          בוחן
        </div>
        <h3 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-white">
          {quizTitle}
        </h3>
        <div className="mb-4 space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
          <p>{sortedQuestions.length} שאלות</p>
          <p>ציון מעבר: {passingScore}%</p>
          {lastScore !== null && lastScore !== undefined && (
            <p>
              ציון אחרון: {lastScore}%{" "}
              {lastPassed ? (
                <span className="text-emerald-600 dark:text-emerald-400">
                  (עבר)
                </span>
              ) : (
                <span className="text-red-600 dark:text-red-400">(לא עבר)</span>
              )}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => setState("playing")}
          className="inline-flex h-10 items-center rounded-full bg-zinc-900 px-6 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
        >
          {lastScore !== null && lastScore !== undefined
            ? "נסה שוב"
            : "התחל בוחן"}
        </button>
      </div>
    );
  }

  // Review screen
  if (state === "review" && result) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-6 text-center">
          <div
            className={`mb-2 text-4xl ${result.passed ? "text-emerald-500" : "text-red-500"}`}
          >
            {result.passed ? "\u2713" : "\u2717"}
          </div>
          <h3 className="mb-1 text-xl font-bold text-zinc-900 dark:text-white">
            {result.passed ? "כל הכבוד!" : "לא הצלחת הפעם"}
          </h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            ענית נכון על {result.correctCount} מתוך {result.totalQuestions}{" "}
            שאלות ({result.score}%)
          </p>
        </div>

        {/* Show questions with correct/incorrect indicators */}
        <div className="mb-6 space-y-4">
          {sortedQuestions.map((q, qIdx) => {
            const userAnswer = answers[qIdx];
            const isCorrect = userAnswer === q.correctIndex;
            return (
              <div
                key={q._id}
                className={`rounded-xl border p-4 ${
                  isCorrect
                    ? "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20"
                    : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
                }`}
              >
                <p className="mb-2 text-sm font-medium text-zinc-900 dark:text-white">
                  {qIdx + 1}. {q.question}
                </p>
                <div className="space-y-1">
                  {q.options.map((opt, optIdx) => (
                    <div
                      key={optIdx}
                      className={`rounded-lg px-3 py-1.5 text-sm ${
                        optIdx === q.correctIndex
                          ? "font-medium text-emerald-800 dark:text-emerald-300"
                          : optIdx === userAnswer && !isCorrect
                            ? "text-red-800 line-through dark:text-red-300"
                            : "text-zinc-600 dark:text-zinc-400"
                      }`}
                    >
                      {optIdx === q.correctIndex && "\u2713 "}
                      {optIdx === userAnswer && !isCorrect && "\u2717 "}
                      {opt}
                    </div>
                  ))}
                </div>
                {q.explanation && (
                  <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
                    {q.explanation}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={resetQuiz}
            className="inline-flex h-10 items-center rounded-full bg-zinc-900 px-6 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
          >
            נסה שוב
          </button>
        </div>
      </div>
    );
  }

  // Playing screen
  return (
    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900">
      {/* Progress indicator */}
      <div className="mb-4 flex items-center justify-between text-sm text-zinc-500 dark:text-zinc-400">
        <span>
          שאלה {currentQuestionIndex + 1} מתוך {sortedQuestions.length}
        </span>
        <span>{quizTitle}</span>
      </div>

      {/* Question dots */}
      <div className="mb-6 flex gap-1.5" role="navigation" aria-label="שאלות הבוחן">
        {sortedQuestions.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setCurrentQuestionIndex(idx)}
            aria-label={`שאלה ${idx + 1}`}
            aria-current={idx === currentQuestionIndex ? "step" : undefined}
            className={`h-2 flex-1 rounded-full transition-colors ${
              idx === currentQuestionIndex
                ? "bg-zinc-900 dark:bg-white"
                : answers[idx] !== null
                  ? "bg-zinc-400 dark:bg-zinc-500"
                  : "bg-zinc-200 dark:bg-zinc-700"
            }`}
          />
        ))}
      </div>

      {/* Question */}
      {currentQuestion && (
        <div>
          <h4 className="mb-4 text-lg font-medium text-zinc-900 dark:text-white">
            {currentQuestion.question}
          </h4>

          <div className="mb-6 space-y-2" role="radiogroup" aria-label="אפשרויות תשובה">
            {currentQuestion.options.map((option, optIdx) => (
              <button
                key={optIdx}
                type="button"
                onClick={() => selectAnswer(optIdx)}
                role="radio"
                aria-checked={answers[currentQuestionIndex] === optIdx}
                className={`w-full rounded-xl border p-3 text-right text-sm transition-colors ${
                  answers[currentQuestionIndex] === optIdx
                    ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900"
                    : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-700"
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() =>
                setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))
              }
              disabled={currentQuestionIndex === 0}
              className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 disabled:opacity-30 dark:text-zinc-400 dark:hover:text-white"
            >
              הקודם
            </button>

            {currentQuestionIndex < sortedQuestions.length - 1 ? (
              <button
                type="button"
                onClick={() =>
                  setCurrentQuestionIndex((prev) =>
                    Math.min(sortedQuestions.length - 1, prev + 1)
                  )
                }
                className="inline-flex h-9 items-center rounded-full bg-zinc-200 px-5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600"
              >
                הבא
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!allAnswered || submitting}
                className="inline-flex h-9 items-center rounded-full bg-zinc-900 px-5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
              >
                {submitting ? "שולח..." : "סיים בוחן"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
