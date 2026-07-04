"use client";

import Link from "next/link";

// Phase 22 — deep-debrief data (all optional; the classic summary still
// renders alone for legacy sessions without them)
export interface KeyMomentView {
  quote: string;
  analysis: string;
  better: string;
}

export interface SkillRadarView {
  initiative: number;
  emotion: number;
  courage: number;
  depth: number;
  leading: number;
}

interface SessionFeedbackProps {
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  onRestart?: () => void;
  onHistory?: () => void;
  connectionLog?: Array<{ turn: number; connection: number }>;
  keyMoments?: KeyMomentView[];
  skillRadar?: SkillRadarView;
  drill?: string;
  recommendedLesson?: {
    lessonId: string;
    courseId: string;
    title: string;
  };
}

const RADAR_LABELS: Array<{ key: keyof SkillRadarView; label: string }> = [
  { key: "initiative", label: "יוזמה" },
  { key: "emotion", label: "הבעת רגש" },
  { key: "courage", label: "אומץ וגבולות" },
  { key: "depth", label: "עומק ופגיעות" },
  { key: "leading", label: "הובלה" },
];

/** SVG polyline of the connection meter across the conversation. */
function ConnectionGraph({
  log,
}: {
  log: Array<{ turn: number; connection: number }>;
}) {
  if (log.length < 2) return null;
  const W = 280;
  const H = 80;
  const PAD = 6;
  const maxTurn = Math.max(...log.map((p) => p.turn));
  const minTurn = Math.min(...log.map((p) => p.turn));
  const span = Math.max(1, maxTurn - minTurn);
  const x = (turn: number) => PAD + ((turn - minTurn) / span) * (W - PAD * 2);
  const y = (c: number) => H - PAD - (c / 100) * (H - PAD * 2);
  const points = log.map((p) => `${x(p.turn)},${y(p.connection)}`).join(" ");
  const last = log[log.length - 1];
  const rising = last.connection >= (log[0]?.connection ?? 50);

  return (
    <div dir="ltr" className="w-full">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-20 w-full"
        role="img"
        aria-label="גרף מד החיבור לאורך השיחה"
      >
        <line
          x1={PAD}
          y1={y(50)}
          x2={W - PAD}
          y2={y(50)}
          stroke="currentColor"
          strokeDasharray="3 4"
          className="text-zinc-200 dark:text-zinc-700"
        />
        <polyline
          points={points}
          fill="none"
          stroke={rising ? "#10b981" : "#f59e0b"}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle
          cx={x(last.turn)}
          cy={y(last.connection)}
          r="4"
          fill={rising ? "#10b981" : "#f59e0b"}
        />
      </svg>
    </div>
  );
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
  connectionLog,
  keyMoments,
  skillRadar,
  drill,
  recommendedLesson,
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

      {/* Connection arc — how the persona's connection moved (Phase 22) */}
      {connectionLog && connectionLog.length >= 2 && (
        <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-zinc-900">
          <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            <span aria-hidden="true">💗</span>
            מד החיבור לאורך השיחה
          </h3>
          <ConnectionGraph log={connectionLog} />
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            סיימת על {connectionLog[connectionLog.length - 1]?.connection}/100 —
            כל תגובה שלך הזיזה את המד. שים לב איפה עלית ואיפה איבדת גובה.
          </p>
        </div>
      )}

      {/* Key moments — quoted coaching (Phase 22) */}
      {keyMoments && keyMoments.length > 0 && (
        <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-zinc-900">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            <span aria-hidden="true">🎬</span>
            רגעי מפתח מהשיחה
          </h3>
          <div className="flex flex-col gap-3">
            {keyMoments.map((m, i) => (
              <div
                key={i}
                className="rounded-xl border border-zinc-100 bg-zinc-50/60 p-3 dark:border-zinc-800 dark:bg-zinc-800/40"
              >
                <p className="border-r-2 border-brand-400 pr-2 text-sm font-medium text-zinc-800 dark:text-zinc-200">
                  &quot;{m.quote}&quot;
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {m.analysis}
                </p>
                {m.better && (
                  <p className="mt-1 text-xs leading-relaxed text-emerald-700 dark:text-emerald-400">
                    <span className="font-semibold">מה היה עובד: </span>
                    {m.better}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skill radar — 5 axes mapped to the 5 course phases (Phase 22) */}
      {skillRadar && (
        <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-zinc-900">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            <span aria-hidden="true">📊</span>
            רדאר הכישורים שלך
          </h3>
          <div className="flex flex-col gap-2.5">
            {RADAR_LABELS.map(({ key, label }) => (
              <div key={key} className="flex items-center gap-3">
                <span className="w-24 flex-shrink-0 text-xs text-zinc-600 dark:text-zinc-400">
                  {label}
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <div
                    className={`h-full rounded-full ${
                      skillRadar[key] >= 70
                        ? "bg-emerald-500"
                        : skillRadar[key] >= 45
                          ? "bg-amber-500"
                          : "bg-orange-500"
                    }`}
                    style={{ width: `${skillRadar[key]}%` }}
                  />
                </div>
                <span className="w-8 flex-shrink-0 text-left text-xs tabular-nums text-zinc-500">
                  {skillRadar[key]}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

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

      {/* Drill + recommended lesson (Phase 22 — closes the loop back to the course) */}
      {(drill || recommendedLesson) && (
        <div className="rounded-2xl border border-brand-200/60 bg-brand-50/50 p-5 dark:border-brand-500/20 dark:bg-brand-900/10">
          {drill && (
            <>
              <h3 className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                <span aria-hidden="true">🎯</span>
                התרגיל שלך לפעם הבאה
              </h3>
              <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                {drill}
              </p>
            </>
          )}
          {recommendedLesson && (
            <Link
              href={`/courses/${recommendedLesson.courseId}/lessons/${recommendedLesson.lessonId}`}
              className="mt-3 flex items-center gap-2 rounded-xl bg-white/80 px-3 py-2.5 text-sm font-medium text-brand-700 shadow-sm transition-colors hover:bg-white dark:bg-zinc-900/60 dark:text-brand-300 dark:hover:bg-zinc-900"
            >
              <span aria-hidden="true">📖</span>
              <span className="min-w-0 flex-1">
                השיעור שמלמד בדיוק את זה: {recommendedLesson.title}
              </span>
              <svg
                className="h-4 w-4 flex-shrink-0 -scale-x-100"
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
            </Link>
          )}
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
