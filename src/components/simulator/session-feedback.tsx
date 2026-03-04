"use client";

interface SessionFeedbackProps {
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  onRestart?: () => void;
  onHistory?: () => void;
}

function ScoreRing({ score }: { score: number }) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const color =
    score >= 80
      ? "#10b981"
      : score >= 60
        ? "#f59e0b"
        : score >= 40
          ? "#f97316"
          : "#ef4444";

  return (
    <div className="relative flex h-28 w-28 items-center justify-center">
      <svg
        className="-rotate-90"
        width="112"
        height="112"
        viewBox="0 0 112 112"
        aria-hidden="true"
      >
        <circle
          cx="56"
          cy="56"
          r={radius}
          stroke="currentColor"
          strokeWidth="8"
          fill="none"
          className="text-zinc-100 dark:text-zinc-800"
        />
        <circle
          cx="56"
          cy="56"
          r={radius}
          stroke={color}
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-bold text-zinc-900 dark:text-white">
          {score}
        </span>
        <span className="text-xs text-zinc-400 dark:text-zinc-500">מתוך 100</span>
      </div>
    </div>
  );
}

function getScoreLabel(score: number): string {
  if (score >= 90) return "מדהים!";
  if (score >= 80) return "מצוין";
  if (score >= 70) return "טוב מאוד";
  if (score >= 60) return "טוב";
  if (score >= 50) return "סביר";
  if (score >= 40) return "יש מה לשפר";
  return "המשך להתאמן";
}

export function SessionFeedback({
  score,
  feedback,
  strengths,
  improvements,
  onRestart,
  onHistory,
}: SessionFeedbackProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Score section */}
      <div className="flex flex-col items-center gap-3 rounded-2xl bg-white p-6 text-center shadow-sm dark:bg-zinc-900">
        <ScoreRing score={score} />
        <div>
          <p className="text-xl font-bold text-zinc-900 dark:text-white">
            {getScoreLabel(score)}
          </p>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {feedback}
          </p>
        </div>
      </div>

      {/* Strengths */}
      {strengths.length > 0 && (
        <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-zinc-900">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
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
            </span>
            מה עשית טוב
          </h3>
          <ul className="flex flex-col gap-2">
            {strengths.map((strength, i) => (
              <li
                key={i}
                className="flex items-start gap-2.5 text-sm text-zinc-600 dark:text-zinc-400"
              >
                <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-500" />
                {strength}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Improvements */}
      {improvements.length > 0 && (
        <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-zinc-900">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
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
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>
            </span>
            נקודות לשיפור
          </h3>
          <ul className="flex flex-col gap-2">
            {improvements.map((improvement, i) => (
              <li
                key={i}
                className="flex items-start gap-2.5 text-sm text-zinc-600 dark:text-zinc-400"
              >
                <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-500" />
                {improvement}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        {onHistory && (
          <button
            type="button"
            onClick={onHistory}
            className="flex-1 rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            ההיסטוריה שלי
          </button>
        )}
        {onRestart && (
          <button
            type="button"
            onClick={onRestart}
            className="flex-1 rounded-xl bg-gradient-to-l from-brand-500 to-brand-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md hover:brightness-110"
          >
            נסה שוב
          </button>
        )}
      </div>
    </div>
  );
}
