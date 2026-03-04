"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useAction } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { motion, AnimatePresence } from "framer-motion";

type Context = "first_date" | "dating_app" | "social" | "after_date";
type Tone = "serious" | "casual" | "funny" | "romantic";

const CONTEXTS: { value: Context; label: string; emoji: string }[] = [
  { value: "first_date", label: "דייט ראשון", emoji: "💫" },
  { value: "dating_app", label: "אפליקציית דייטינג", emoji: "📱" },
  { value: "social", label: "מפגש חברתי", emoji: "🌟" },
  { value: "after_date", label: "אחרי דייט", emoji: "💬" },
];

const TONES: { value: Tone; label: string; emoji: string }[] = [
  { value: "serious", label: "רציני", emoji: "🎯" },
  { value: "casual", label: "קליל", emoji: "😊" },
  { value: "funny", label: "מצחיק", emoji: "😄" },
  { value: "romantic", label: "רומנטי", emoji: "❤️" },
];

export default function ConversationStartersPage() {
  const [selectedContext, setSelectedContext] = useState<Context>("first_date");
  const [selectedTone, setSelectedTone] = useState<Tone>("casual");
  const [starters, setStarters] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem("cs-favorites") ?? "[]");
    } catch {
      return [];
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"generate" | "favorites">("generate");

  const generateStarters = useAction(api.tools.generateConversationStarters);

  const handleGenerate = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await generateStarters({
        context: selectedContext,
        tone: selectedTone,
      });
      setStarters(result);
      setActiveTab("generate");
    } catch (err) {
      setError("שגיאה ביצירת פותחי השיחה. נסה שוב.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [generateStarters, selectedContext, selectedTone]);

  const handleCopy = useCallback(async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  }, []);

  const toggleFavorite = useCallback((starter: string) => {
    setFavorites((prev) => {
      const next = prev.includes(starter)
        ? prev.filter((s) => s !== starter)
        : [...prev, starter];
      localStorage.setItem("cs-favorites", JSON.stringify(next));
      return next;
    });
  }, []);

  const displayedStarters = activeTab === "favorites" ? favorites : starters;

  return (
    <div className="min-h-dvh bg-white dark:bg-zinc-950" dir="rtl">
      <Header />

      <main className="container mx-auto px-4 py-10">
        <div className="mx-auto max-w-2xl">
          {/* Back link */}
          <Link
            href="/tools"
            className="mb-6 inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-brand-500 dark:text-zinc-400 dark:hover:text-brand-400"
          >
            <svg className="h-4 w-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            חזרה לכלים
          </Link>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="mb-8"
          >
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 shadow-lg shadow-brand-500/20">
              <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
              </svg>
            </div>
            <h1 className="mb-2 text-3xl font-bold text-zinc-900 dark:text-white">
              פותחי שיחה
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400">
              AI יוצר פותחי שיחה מותאמים לסיטואציה ולסגנון שלך
            </p>
          </motion.div>

          {/* Context selector */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
            className="mb-5"
          >
            <label className="mb-2.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              סיטואציה
            </label>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {CONTEXTS.map((ctx) => (
                <button
                  key={ctx.value}
                  onClick={() => setSelectedContext(ctx.value)}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border px-3 py-3 text-sm font-medium transition-all ${
                    selectedContext === ctx.value
                      ? "border-brand-500 bg-brand-50 text-brand-700 dark:border-brand-400 dark:bg-brand-500/10 dark:text-brand-300"
                      : "border-zinc-200 bg-white text-zinc-600 hover:border-brand-200 hover:bg-brand-50/50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-brand-700"
                  }`}
                >
                  <span className="text-xl">{ctx.emoji}</span>
                  <span className="text-center text-xs leading-tight">{ctx.label}</span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Tone selector */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="mb-7"
          >
            <label className="mb-2.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              טון
            </label>
            <div className="grid grid-cols-4 gap-2">
              {TONES.map((tone) => (
                <button
                  key={tone.value}
                  onClick={() => setSelectedTone(tone.value)}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-sm font-medium transition-all ${
                    selectedTone === tone.value
                      ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-500/10 dark:text-blue-300"
                      : "border-zinc-200 bg-white text-zinc-600 hover:border-blue-200 hover:bg-blue-50/50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-blue-800"
                  }`}
                >
                  <span className="text-xl">{tone.emoji}</span>
                  <span className="text-xs">{tone.label}</span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Generate button */}
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.15 }}
            onClick={handleGenerate}
            disabled={isLoading}
            className="mb-8 w-full rounded-xl bg-gradient-to-l from-brand-500 to-brand-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-brand-500/20 transition-all hover:shadow-brand-500/30 hover:opacity-90 disabled:opacity-60"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                יוצר פותחי שיחה...
              </span>
            ) : (
              "✨ צור פותחי שיחה"
            )}
          </motion.button>

          {/* Error */}
          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Tabs */}
          {(starters.length > 0 || favorites.length > 0) && (
            <div className="mb-4 flex gap-1 rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800/60">
              <button
                onClick={() => setActiveTab("generate")}
                className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  activeTab === "generate"
                    ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-white"
                    : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                }`}
              >
                תוצאות ({starters.length})
              </button>
              <button
                onClick={() => setActiveTab("favorites")}
                className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  activeTab === "favorites"
                    ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-white"
                    : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                }`}
              >
                ⭐ מועדפים ({favorites.length})
              </button>
            </div>
          )}

          {/* Results */}
          <AnimatePresence mode="wait">
            {displayedStarters.length > 0 && (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="space-y-3"
              >
                {displayedStarters.map((starter, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: i * 0.05 }}
                    className="group relative rounded-xl border border-zinc-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    <p className="ml-16 text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
                      {starter}
                    </p>
                    <div className="absolute left-3 top-3 flex gap-1.5">
                      <button
                        onClick={() => toggleFavorite(starter)}
                        title="הוסף למועדפים"
                        className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm transition-colors ${
                          favorites.includes(starter)
                            ? "bg-yellow-100 text-yellow-600 dark:bg-yellow-500/10 dark:text-yellow-400"
                            : "bg-zinc-100 text-zinc-400 hover:bg-yellow-50 hover:text-yellow-500 dark:bg-zinc-800 dark:hover:bg-yellow-500/10 dark:hover:text-yellow-400"
                        }`}
                      >
                        {favorites.includes(starter) ? "⭐" : "☆"}
                      </button>
                      <button
                        onClick={() => handleCopy(starter, i)}
                        title="העתק"
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-400 transition-colors hover:bg-brand-50 hover:text-brand-600 dark:bg-zinc-800 dark:hover:bg-brand-500/10 dark:hover:text-brand-400"
                      >
                        {copiedIndex === i ? (
                          <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </motion.div>
                ))}

                {activeTab === "generate" && starters.length > 0 && (
                  <button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-600 transition-colors hover:border-brand-200 hover:text-brand-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-brand-700 dark:hover:text-brand-400 disabled:opacity-50"
                  >
                    🔄 צור עוד פותחי שיחה
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty favorites */}
          {activeTab === "favorites" && favorites.length === 0 && (
            <div className="py-12 text-center">
              <div className="mb-3 text-4xl">⭐</div>
              <p className="text-zinc-500 dark:text-zinc-400">
                עדיין אין מועדפים. לחץ על ⭐ על פותחי שיחה שאהבת כדי לשמור אותם.
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
