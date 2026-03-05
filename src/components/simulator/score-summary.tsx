"use client";

interface ChoiceResult {
  stepId: string;
  choiceIndex: number;
  score: number;
  feedback: string;
}

interface ScoreSummaryProps {
  totalScore: number;
  maxPossibleScore: number;
  grade: string;
  summaryFeedback: string;
  choices: ChoiceResult[];
  scenarioTitle: string;
  onTryAgain?: () => void;
  onChooseAnother?: () => void;
}

function GradeBadge({ grade, score }: { grade: string; score: number }) {
  const isHigh = score >= 80;
  const isMid = score >= 60;

  const bgGrad = isHigh
    ? "from-emerald-400 to-emerald-600"
    : isMid
      ? "from-amber-400 to-amber-600"
      : "from-rose-400 to-rose-600";

  return (
    <div className="relative flex flex-col items-center">
      {/* Glow ring */}
      {isHigh && (
        <div className="absolute inset-0 rounded-full bg-emerald-400/20 blur-xl" />
      )}
      <div
        className={`relative flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br ${bgGrad} shadow-lg`}
      >
        <div className="flex flex-col items-center">
          <span className="text-3xl font-extrabold text-white">{grade}</span>
          <span className="text-xs font-medium text-white/80">{score}%</span>
        </div>
      </div>
    </div>
  );
}

function getScoreLabel(score: number): string {
  if (score >= 90) return "מדהים!";
  if (score >= 80) return "מצוין!";
  if (score >= 70) return "טוב מאוד";
  if (score >= 60) return "טוב";
  if (score >= 50) return "סביר";
  if (score >= 40) return "יש מה לשפר";
  return "המשך להתאמן";
}

function ScoreBar({
  score,
  max,
  stepNumber,
}: {
  score: number;
  max: number;
  stepNumber: number;
}) {
  const pct = max === 0 ? 0 : Math.round((score / max) * 100);
  const color =
    score === max
      ? "bg-emerald-500"
      : score >= max * 0.6
        ? "bg-amber-400"
        : score > 0
          ? "bg-orange-400"
          : "bg-rose-400";

  return (
    <div className="flex items-center gap-3">
      <span className="w-12 text-left text-xs font-medium text-zinc-400 dark:text-zinc-500">
        שלב {stepNumber}
      </span>
      <div className="flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800 h-2">
        <div
          className={`h-2 rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-10 text-right text-xs font-medium tabular-nums text-zinc-600 dark:text-zinc-400">
        {score}/{max}
      </span>
    </div>
  );
}

export function ScoreSummary({
  totalScore,
  maxPossibleScore,
  grade,
  summaryFeedback,
  choices,
  scenarioTitle,
  onTryAgain,
  onChooseAnother,
}: ScoreSummaryProps) {
  const percentScore = maxPossibleScore === 0 ? 0 : Math.round((totalScore / maxPossibleScore) * 100);
  const scoreLabel = getScoreLabel(percentScore);

  // Max score per step = 3
  const maxPerStep = 3;

  return (
    <div className="flex flex-col gap-6">
      {/* Hero score section */}
      <div className="flex flex-col items-center gap-4 rounded-2xl bg-white p-8 text-center shadow-sm dark:bg-zinc-900">
        <GradeBadge grade={grade} score={percentScore} />
        <div>
          <h2 className="mb-1 text-2xl font-bold text-zinc-900 dark:text-white">
            {scoreLabel}
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {scenarioTitle}
          </p>
        </div>
        <p className="max-w-sm text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          {summaryFeedback}
        </p>
      </div>

      {/* Score breakdown */}
      <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-zinc-900">
        <h3 className="mb-4 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          פירוט ציונים לפי שלב
        </h3>
        <div className="flex flex-col gap-3">
          {choices.map((choice, index) => (
            <ScoreBar
              key={choice.stepId}
              score={choice.score}
              max={maxPerStep}
              stepNumber={index + 1}
            />
          ))}
        </div>
        <div className="mt-4 border-t border-zinc-100 pt-4 dark:border-zinc-800">
          <div className="flex items-center justify-between text-sm font-semibold">
            <span className="text-zinc-700 dark:text-zinc-300">סה"כ</span>
            <span className="tabular-nums text-zinc-900 dark:text-white">
              {totalScore}/{maxPossibleScore} ({percentScore}%)
            </span>
          </div>
        </div>
      </div>

      {/* Feedback per step */}
      <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-zinc-900">
        <h3 className="mb-4 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          משוב מפורט
        </h3>
        <div className="flex flex-col gap-3">
          {choices.map((choice, index) => {
            return (
              <div
                key={choice.stepId}
                className="flex items-start gap-3"
              >
                <div
                  className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${
                    choice.score === 3
                      ? "bg-emerald-500"
                      : choice.score === 2
                        ? "bg-amber-400"
                        : choice.score === 1
                          ? "bg-orange-400"
                          : "bg-rose-400"
                  }`}
                >
                  {index + 1}
                </div>
                <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {choice.feedback}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Celebratory message for high scores */}
      {percentScore >= 80 && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center dark:border-emerald-800 dark:bg-emerald-900/20">
          <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
            כל הכבוד! אתה מגלה הבנה מצוינת של תקשורת בינאישית.
          </p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-col gap-3 sm:flex-row">
        {onChooseAnother && (
          <button
            type="button"
            onClick={onChooseAnother}
            className="flex-1 rounded-xl border border-zinc-200 px-5 py-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            בחר תרחיש אחר
          </button>
        )}
        {onTryAgain && (
          <button
            type="button"
            onClick={onTryAgain}
            className="flex-1 rounded-xl bg-gradient-to-l from-brand-500 to-brand-600 px-5 py-3 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md hover:brightness-110"
          >
            נסה שוב
          </button>
        )}
      </div>
    </div>
  );
}
