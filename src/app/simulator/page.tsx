"use client";

import { useQuery } from "convex/react";
import { useState, useMemo } from "react";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { api } from "@/../convex/_generated/api";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ScenarioCard } from "@/components/simulator/scenario-card";
import { DifficultyBadge } from "@/components/simulator/difficulty-badge";
import Link from "next/link";

const DIFFICULTY_FILTERS = [
  { value: "all", label: "כל הרמות" },
  { value: "easy", label: "קל" },
  { value: "medium", label: "בינוני" },
  { value: "hard", label: "קשה" },
] as const;

export default function SimulatorPage() {
  const scenarios = useQuery(api.simulator.listScenarios);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<
    "all" | "easy" | "medium" | "hard"
  >("all");

  const filteredScenarios = useMemo(() => {
    if (!scenarios) return undefined;

    return scenarios.filter((s) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        s.title.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.personaName.toLowerCase().includes(q);
      const matchesDifficulty =
        selectedDifficulty === "all" || s.difficulty === selectedDifficulty;
      return matchesSearch && matchesDifficulty;
    });
  }, [scenarios, searchQuery, selectedDifficulty]);

  return (
    <div className="min-h-dvh bg-white dark:bg-zinc-950">
      <Header />

      <main className="container mx-auto px-4 py-12">
        {/* Page header */}
        <div className="mb-10">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-600 dark:bg-blue-500/20 dark:text-brand-400">
            <svg
              className="h-3 w-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            סימולטור דייטינג
          </div>
          <h1 className="mb-2 text-3xl font-bold text-zinc-900 dark:text-white">
            תרגל שיחות דייט
          </h1>
          <p className="max-w-xl text-zinc-600 dark:text-zinc-400">
            תרגל שיחות דייט עם דמויות AI ריאליסטיות. קבל ציון ומשוב אישי
            בסוף כל סשן.
          </p>
        </div>

        {/* History link for signed-in users */}
        <SignedIn>
          <div className="mb-6 flex items-center justify-between">
            <div />
            <Link
              href="/simulator/history"
              className="flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
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
                  d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              ההיסטוריה שלי
            </Link>
          </div>
        </SignedIn>

        {/* Search & Filters */}
        <div className="mb-8 flex flex-wrap gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-60">
            <svg
              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
            <input
              type="search"
              placeholder="חפש תרחיש..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-xl border border-zinc-200 bg-white pr-9 pl-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:placeholder:text-zinc-500 dark:focus:border-brand-700 dark:focus:ring-blue-500/30"
              aria-label="חיפוש תרחישים"
            />
          </div>

          {/* Difficulty filter */}
          <div className="flex items-center gap-1.5">
            {DIFFICULTY_FILTERS.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setSelectedDifficulty(filter.value)}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  selectedDifficulty === filter.value
                    ? "bg-brand-500 text-white"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Count */}
        {filteredScenarios !== undefined && filteredScenarios.length > 0 && (
          <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
            {filteredScenarios.length} תרחישים
          </p>
        )}

        {/* Loading */}
        {filteredScenarios === undefined && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-64 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-800"
              />
            ))}
          </div>
        )}

        {/* Empty */}
        {filteredScenarios !== undefined && filteredScenarios.length === 0 && (
          <div className="rounded-2xl bg-zinc-50 p-12 text-center dark:bg-zinc-900">
            <svg
              className="mx-auto mb-3 h-10 w-10 text-zinc-300 dark:text-zinc-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <p className="text-zinc-500 dark:text-zinc-400">
              {searchQuery ? "לא נמצאו תרחישים" : "עדיין אין תרחישים"}
            </p>
          </div>
        )}

        {/* Auth gate */}
        <SignedOut>
          <div className="mb-8 rounded-2xl border border-brand-100 bg-brand-50 p-6 text-center dark:border-blue-500/20 dark:bg-blue-500/10">
            <p className="mb-2 font-medium text-zinc-900 dark:text-white">
              כדי להשתמש בסימולטור, יש להתחבר
            </p>
            <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
              הרשמה חינמית ומיידית
            </p>
            <SignInButton mode="modal">
              <button
                type="button"
                className="rounded-xl bg-brand-500 px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-brand-600"
              >
                התחבר / הרשם
              </button>
            </SignInButton>
          </div>
        </SignedOut>

        {/* Scenarios grid */}
        {filteredScenarios !== undefined && filteredScenarios.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredScenarios.map((scenario) => (
              <ScenarioCard
                key={scenario._id}
                id={scenario._id}
                title={scenario.title}
                description={scenario.description}
                personaName={scenario.personaName}
                personaAge={scenario.personaAge}
                personaGender={scenario.personaGender}
                difficulty={scenario.difficulty}
                category={scenario.category}
              />
            ))}
          </div>
        )}

        {/* How it works */}
        <div className="mt-16">
          <h2 className="mb-6 text-center text-xl font-bold text-zinc-900 dark:text-white">
            איך עובד הסימולטור?
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                step: "1",
                title: "בחר תרחיש",
                desc: "בחר מגוון תרחישים לפי רמת קושי ונושא",
              },
              {
                step: "2",
                title: "שוחח עם הדמות",
                desc: "תרגל שיחה טבעית עם דמות AI ריאליסטית בעברית",
              },
              {
                step: "3",
                title: "קבל משוב",
                desc: "בסוף הסשן קבל ציון וטיפים לשיפור",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="flex flex-col items-center rounded-2xl bg-zinc-50 p-6 text-center dark:bg-zinc-900"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-brand-500 text-sm font-bold text-white">
                  {item.step}
                </div>
                <h3 className="mb-1.5 font-semibold text-zinc-900 dark:text-white">
                  {item.title}
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
