"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAction, useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import type { Id } from "@/../convex/_generated/dataModel";

// ============================================================
// LessonAdvisor — Phase 18
// Context-aware Smart Advisor embedded in the lesson page.
// Knows the current lesson/phase, answers via advisor.ask
// (free-degradation: template engine without a key, Claude with).
// Surfaces a "practice in simulator" bridge for the SYNC model.
// ============================================================

interface LessonAdvisorProps {
  lessonId: Id<"lessons">;
  userId?: Id<"users">;
}

type Turn = {
  role: "user" | "assistant";
  content: string;
  /** citation refs from the RAG layer (Phase 21) — shown under AI replies */
  sources?: string[];
};

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith("**") && p.endsWith("**") ? (
      <strong key={i}>{p.slice(2, -2)}</strong>
    ) : (
      <span key={i}>{p}</span>
    )
  );
}

export function LessonAdvisor({ lessonId, userId }: LessonAdvisorProps) {
  const [open, setOpen] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestSim, setSuggestSim] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const ctx = useQuery(api.advisor.getLessonContext, {
    lessonId,
    ...(userId ? { userId } : {}),
  });
  const recommended = useQuery(api.advisor.getRecommendedScenario, { lessonId });
  const practice = useQuery(api.simulator.getLessonPracticeStats, { lessonId });
  const ask = useAction(api.advisor.ask);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [turns, loading]);

  const send = useCallback(
    async (message: string) => {
      const text = message.trim();
      if (!text || loading) return;
      setInput("");
      setTurns((t) => [...t, { role: "user", content: text }]);
      setLoading(true);
      try {
        const history = turns
          .slice(-6)
          .map(({ role, content }) => ({ role, content }));
        const res = await ask({
          message: text,
          lessonId,
          ...(userId ? { userId } : {}),
          history,
        });
        setTurns((t) => [
          ...t,
          {
            role: "assistant",
            content: res.reply,
            ...(res.sources && res.sources.length > 0
              ? { sources: res.sources }
              : {}),
          },
        ]);
        setSuggestSim(res.suggestSimulator);
      } catch {
        setTurns((t) => [
          ...t,
          {
            role: "assistant",
            content: "סליחה, משהו השתבש. נסה/י שוב בעוד רגע.",
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [ask, lessonId, userId, turns, loading]
  );

  const profile = ctx?.profile;
  const simHref =
    recommended?.type === "dialogue"
      ? `/simulator/dialogue/${recommended.scenarioId}?from=lesson&lessonId=${lessonId}`
      : recommended
        ? `/simulator/${recommended.scenarioId}?from=lesson&lessonId=${lessonId}`
        : `/simulator?lessonId=${lessonId}`;

  return (
    <section
      className="mb-10 overflow-hidden rounded-2xl border border-brand-200/60 bg-gradient-to-br from-brand-50/60 to-white shadow-sm dark:border-brand-500/20 dark:from-brand-900/10 dark:to-zinc-900/50"
      aria-label="היועץ החכם"
      dir="rtl"
    >
      {/* Header */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 p-4 text-right transition-colors hover:bg-brand-50/40 dark:hover:bg-brand-900/10"
        aria-expanded={open}
      >
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-600 text-lg font-bold text-white shadow-sm">
          ✦
        </div>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-white">
            היועץ החכם שלך
            {profile && profile.phaseNumber > 0 && (
              <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[11px] font-medium text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
                שלב {profile.phaseNumber} · {profile.name}
              </span>
            )}
          </p>
          <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
            {profile?.skill
              ? `מתאמנים על: ${profile.skill}`
              : "ייעוץ מותאם בדיוק לשיעור הזה"}
          </p>
        </div>
        <svg
          className={`h-5 w-5 flex-shrink-0 text-zinc-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {open && (
        <div className="border-t border-brand-200/40 dark:border-brand-500/10">
          {/* Phase essence */}
          {profile && profile.phaseNumber > 0 && turns.length === 0 && (
            <div className="px-4 pt-4">
              <p className="rounded-xl bg-white/70 p-3 text-sm leading-relaxed text-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-300">
                {profile.essence}
              </p>
            </div>
          )}

          {/* Messages */}
          <div
            ref={scrollRef}
            className="max-h-80 overflow-y-auto px-4 py-3"
            aria-live="polite"
          >
            {turns.length === 0 && profile && (
              <p className="py-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                {profile.opener}
              </p>
            )}
            <div className="space-y-3">
              {turns.map((t, i) => (
                <div
                  key={i}
                  className={`flex ${t.role === "user" ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm ${
                      t.role === "user"
                        ? "rounded-tr-sm bg-gradient-to-br from-brand-500 to-brand-600 text-white"
                        : "rounded-tl-sm border border-zinc-200 bg-white text-zinc-800 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                    }`}
                  >
                    {t.role === "assistant" ? renderInline(t.content) : t.content}
                    {t.role === "assistant" && t.sources && t.sources.length > 0 && (
                      <p className="mt-2 border-t border-zinc-200/70 pt-1.5 text-[11px] leading-relaxed text-zinc-400 dark:border-zinc-700 dark:text-zinc-500">
                        <span aria-hidden="true">📚 </span>
                        מבוסס על: {t.sources.join(" · ")}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-end">
                  <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800">
                    {[0, 150, 300].map((d) => (
                      <span
                        key={d}
                        className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-400"
                        style={{ animationDelay: `${d}ms` }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Practice loop feedback — sessions run from this lesson (sync) */}
          {practice && practice.total > 0 && (
            <div className="px-4 pb-1 pt-1">
              <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                <span aria-hidden="true">🎯</span>
                <span>
                  תרגלת {practice.total}{" "}
                  {practice.total === 1 ? "פעם" : "פעמים"} מהשיעור הזה
                </span>
                {practice.bestScore !== null && (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                    הציון הכי טוב שלך: {practice.bestScore}
                  </span>
                )}
              </p>
            </div>
          )}

          {/* Simulator bridge (sync) */}
          {(suggestSim || turns.length === 0) && recommended && (
            <div className="px-4 pb-2">
              <Link
                href={simHref}
                className="flex items-center gap-2 rounded-xl border border-blue-200/60 bg-blue-50/60 px-3 py-2.5 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100/60 dark:border-blue-500/20 dark:bg-blue-900/15 dark:text-blue-300"
              >
                <span className="text-base" aria-hidden="true">
                  {recommended.personaEmoji}
                </span>
                <span className="flex-1">
                  תרגל/י את {profile?.skill ?? "הכישור"} בסימולטור — &quot;{recommended.title}&quot;
                </span>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
              </Link>
            </div>
          )}

          {/* Quick prompts */}
          {turns.length === 0 && profile && (
            <div className="flex flex-wrap gap-2 px-4 pb-2">
              {[
                "סכם לי את השיעור",
                ...(profile.applyPrompts?.slice(0, 1) ?? []),
                "אני קצת תקוע/ה",
              ].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => send(p)}
                  disabled={loading}
                  className="rounded-full border border-brand-200/50 bg-white/70 px-3 py-1.5 text-xs font-medium text-brand-600 transition-colors hover:bg-brand-50 disabled:opacity-50 dark:border-brand-500/20 dark:bg-zinc-800/60 dark:text-brand-300"
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-end gap-2 border-t border-brand-200/40 p-3 dark:border-brand-500/10"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              rows={1}
              placeholder="שאל/י את היועץ על השיעור..."
              aria-label="הקלד הודעה ליועץ"
              className="max-h-28 min-h-[2.5rem] flex-1 resize-none rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition-colors focus:border-brand-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-40"
              aria-label="שלח"
            >
              <svg className="h-5 w-5 -scale-x-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </section>
  );
}
