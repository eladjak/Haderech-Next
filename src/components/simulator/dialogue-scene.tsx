"use client";

import { useState } from "react";

interface DialogueOption {
  text: string;
  score: number;
  feedback: string;
}

interface DialoguePoint {
  id: string;
  situation: string;
  options: DialogueOption[];
  tip: string;
}

interface DialogueSceneProps {
  dialoguePoint: DialoguePoint;
  stepNumber: number;
  totalSteps: number;
  personaName: string;
  personaEmoji: string;
  runningScore: number;
  maxRunningScore: number;
  onChoiceSubmit: (choiceIndex: number) => Promise<{
    score: number;
    feedback: string;
    tip: string;
    isLast: boolean;
  }>;
  isSubmitting: boolean;
}

function ScoreIndicator({
  score,
  max,
}: {
  score: number;
  max: number;
}) {
  const pct = max === 0 ? 0 : Math.round((score / max) * 100);
  const color =
    pct >= 80
      ? "bg-emerald-500"
      : pct >= 60
        ? "bg-amber-400"
        : pct >= 40
          ? "bg-orange-400"
          : "bg-rose-500";

  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
        <div
          className={`h-1.5 rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-medium tabular-nums text-zinc-600 dark:text-zinc-400">
        {score}/{max}
      </span>
    </div>
  );
}

function OptionButton({
  option,
  index,
  selected,
  revealed,
  onClick,
  disabled,
}: {
  option: DialogueOption;
  index: number;
  selected: boolean;
  revealed: boolean;
  onClick: () => void;
  disabled: boolean;
}) {
  const scoreColor =
    option.score === 3
      ? "border-emerald-400 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-900/20"
      : option.score === 2
        ? "border-amber-400 bg-amber-50 dark:border-amber-700 dark:bg-amber-900/20"
        : option.score === 1
          ? "border-orange-400 bg-orange-50 dark:border-orange-700 dark:bg-orange-900/20"
          : "border-rose-400 bg-rose-50 dark:border-rose-700 dark:bg-rose-900/20";

  const scoreLabel =
    option.score === 3
      ? "מושלם"
      : option.score === 2
        ? "טוב"
        : option.score === 1
          ? "סביר"
          : "לא מומלץ";

  const scoreLabelColor =
    option.score === 3
      ? "text-emerald-600 dark:text-emerald-400"
      : option.score === 2
        ? "text-amber-600 dark:text-amber-400"
        : option.score === 1
          ? "text-orange-600 dark:text-orange-400"
          : "text-rose-600 dark:text-rose-400";

  if (revealed) {
    return (
      <div
        className={`rounded-xl border-2 p-4 text-sm transition-all ${
          selected
            ? scoreColor
            : "border-zinc-200 bg-zinc-50 opacity-60 dark:border-zinc-700 dark:bg-zinc-800/40"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <p className={`leading-relaxed ${selected ? "font-medium text-zinc-900 dark:text-white" : "text-zinc-500 dark:text-zinc-400"}`}>
            {option.text}
          </p>
          {selected && (
            <span className={`flex-shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${scoreLabelColor} ${
              option.score === 3
                ? "bg-emerald-100 dark:bg-emerald-900/30"
                : option.score === 2
                  ? "bg-amber-100 dark:bg-amber-900/30"
                  : option.score === 1
                    ? "bg-orange-100 dark:bg-orange-900/30"
                    : "bg-rose-100 dark:bg-rose-900/30"
            }`}>
              {scoreLabel}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`w-full rounded-xl border-2 p-4 text-right text-sm leading-relaxed transition-all ${
        selected
          ? "border-brand-400 bg-brand-50 text-brand-900 dark:border-brand-600 dark:bg-blue-500/10 dark:text-white"
          : "border-zinc-200 bg-white text-zinc-700 hover:border-brand-200 hover:bg-brand-50/50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-brand-800 dark:hover:bg-blue-500/5"
      } disabled:cursor-not-allowed disabled:opacity-60`}
    >
      <span className="flex items-start gap-3">
        <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border border-zinc-300 text-xs font-medium text-zinc-400 dark:border-zinc-600 dark:text-zinc-500">
          {index + 1}
        </span>
        <span>{option.text}</span>
      </span>
    </button>
  );
}

export function DialogueScene({
  dialoguePoint,
  stepNumber,
  totalSteps,
  personaName,
  personaEmoji,
  runningScore,
  maxRunningScore,
  onChoiceSubmit,
  isSubmitting,
}: DialogueSceneProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    feedback: string;
    tip: string;
    isLast: boolean;
  } | null>(null);
  const [confirming, setConfirming] = useState(false);

  const handleSelect = (index: number) => {
    if (revealed || isSubmitting) return;
    setSelectedIndex(index);
  };

  const handleConfirm = async () => {
    if (selectedIndex === null || revealed || confirming) return;
    setConfirming(true);
    try {
      const res = await onChoiceSubmit(selectedIndex);
      setResult(res);
      setRevealed(true);
    } finally {
      setConfirming(false);
    }
  };

  const progressPct = Math.round(((stepNumber - 1) / totalSteps) * 100);

  return (
    <div className="flex flex-col gap-5">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-rose-100 to-pink-200 text-lg dark:from-rose-900/40 dark:to-pink-800/40">
            {personaEmoji}
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-900 dark:text-white">
              {personaName}
            </p>
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              שלב {stepNumber} מתוך {totalSteps}
            </p>
          </div>
        </div>
        <ScoreIndicator score={runningScore} max={maxRunningScore} />
      </div>

      {/* Progress bar */}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
        <div
          className="h-1.5 rounded-full bg-gradient-to-l from-brand-500 to-brand-400 transition-all duration-700"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Situation card */}
      <div className="rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500 mb-2">
          הסיטואציה
        </p>
        <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          {dialoguePoint.situation}
        </p>
      </div>

      {/* Options */}
      <div>
        <p className="mb-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          מה תגיד?
        </p>
        <div className="flex flex-col gap-2.5">
          {dialoguePoint.options.map((option, index) => (
            <OptionButton
              key={index}
              option={option}
              index={index}
              selected={selectedIndex === index}
              revealed={revealed}
              onClick={() => handleSelect(index)}
              disabled={revealed || isSubmitting || confirming}
            />
          ))}
        </div>
      </div>

      {/* Confirm button */}
      {!revealed && (
        <button
          type="button"
          onClick={() => void handleConfirm()}
          disabled={
            selectedIndex === null || confirming || isSubmitting
          }
          className="w-full rounded-xl bg-gradient-to-l from-brand-500 to-brand-600 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {confirming ? "שולח..." : "אשר בחירה"}
        </button>
      )}

      {/* Feedback panel - slides in after choice */}
      {revealed && result && (
        <div className="rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          {/* Score chips */}
          <div className="mb-3 flex items-center gap-2">
            <div
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white ${
                result.score === 3
                  ? "bg-emerald-500"
                  : result.score === 2
                    ? "bg-amber-400"
                    : result.score === 1
                      ? "bg-orange-400"
                      : "bg-rose-500"
              }`}
            >
              {result.score === 3 ? "✓" : result.score === 2 ? "↑" : result.score === 1 ? "~" : "✗"}
            </div>
            <p className="text-sm font-semibold text-zinc-900 dark:text-white">
              {result.score === 3
                ? "מצוין!"
                : result.score === 2
                  ? "טוב"
                  : result.score === 1
                    ? "סביר"
                    : "יש מה לשפר"}
            </p>
            <span className="mr-auto text-xs font-medium text-zinc-400">
              +{result.score} נקודות
            </span>
          </div>

          {/* Feedback text */}
          <p className="mb-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            {result.feedback}
          </p>

          {/* Tip */}
          <div className="rounded-xl border-r-4 border-brand-400 bg-brand-50/60 py-3 pr-4 pl-3 dark:border-brand-700 dark:bg-blue-500/10">
            <p className="text-xs font-semibold text-brand-700 dark:text-brand-400 mb-1">
              טיפ
            </p>
            <p className="text-sm text-brand-800 dark:text-brand-300">
              {result.tip}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
