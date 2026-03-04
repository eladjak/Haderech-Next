"use client";

import Link from "next/link";
import { DifficultyBadge } from "./difficulty-badge";

interface ScenarioCardProps {
  id: string;
  title: string;
  description: string;
  personaName: string;
  personaAge: number;
  personaGender: "male" | "female";
  difficulty: "easy" | "medium" | "hard";
  category: string;
}

const GENDER_ICON: Record<string, string> = {
  female: "♀",
  male: "♂",
};

const GENDER_LABEL: Record<string, string> = {
  female: "אישה",
  male: "גבר",
};

export function ScenarioCard({
  id,
  title,
  description,
  personaName,
  personaAge,
  personaGender,
  difficulty,
  category,
}: ScenarioCardProps) {
  return (
    <Link
      href={`/simulator/${id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-100 bg-white transition-all hover:-translate-y-0.5 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
    >
      {/* Top accent bar */}
      <div
        className={`h-1.5 w-full ${
          difficulty === "easy"
            ? "bg-emerald-400"
            : difficulty === "medium"
              ? "bg-amber-400"
              : "bg-rose-500"
        }`}
      />

      <div className="flex flex-1 flex-col p-5">
        {/* Header row */}
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1">
            <h3 className="text-lg font-semibold text-zinc-900 transition-colors group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-400">
              {title}
            </h3>
            <span className="text-xs text-zinc-400 dark:text-zinc-500">
              {category}
            </span>
          </div>
          <DifficultyBadge difficulty={difficulty} />
        </div>

        {/* Description */}
        <p className="mb-4 line-clamp-2 flex-1 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
          {description}
        </p>

        {/* Persona info */}
        <div className="flex items-center gap-3 rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/60">
          {/* Avatar placeholder */}
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-100 to-brand-200 text-lg dark:from-brand-800/40 dark:to-brand-700/40">
            {GENDER_ICON[personaGender]}
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-900 dark:text-white">
              {personaName}, {personaAge}
            </p>
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              {GENDER_LABEL[personaGender]}
            </p>
          </div>
          <div className="mr-auto">
            <span className="flex items-center gap-1 rounded-lg bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-600 transition-colors group-hover:bg-brand-100 dark:bg-blue-500/20 dark:text-brand-400">
              <svg
                className="h-3 w-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.25 4.5l7.5 7.5-7.5 7.5"
                />
              </svg>
              התחל
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
