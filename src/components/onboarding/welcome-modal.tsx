"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import Link from "next/link";

const STORAGE_KEY = "haderech_onboarding_dismissed";

const INTEREST_OPTIONS = [
  { id: "course", label: "קורס מלא", icon: "📚", description: "תכנית לימודים מובנית" },
  { id: "ai-coach", label: "מאמן AI", icon: "🤖", description: "שיחות אישיות עם מאמן" },
  { id: "simulator", label: "סימולטור דייטים", icon: "🎭", description: "תרגול תרחישי דייטינג" },
  { id: "community", label: "קהילה", icon: "👥", description: "שיתוף וקבלת עצות" },
  { id: "tools", label: "כלי דייטינג", icon: "🛠️", description: "בניית פרופיל ועוד" },
];

interface WelcomeModalProps {
  userName?: string;
}

export function WelcomeModal({ userName }: WelcomeModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const preferences = useQuery(api.users.getPreferences);
  const updatePreferences = useMutation(api.users.updatePreferences);

  // Determine whether to show modal
  useEffect(() => {
    // Already dismissed locally
    if (typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY)) {
      return;
    }
    // If preferences loaded and onboarding already completed → skip
    if (preferences !== undefined) {
      if (preferences?.onboardingCompleted) {
        return;
      }
      // Show modal after a short delay for better UX
      const timer = setTimeout(() => setIsOpen(true), 1200);
      return () => clearTimeout(timer);
    }
  }, [preferences]);

  const handleDismiss = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, "1");
    }
    setIsOpen(false);
  };

  const handleSkip = async () => {
    try {
      await updatePreferences({ onboardingCompleted: true });
    } catch {
      // ignore errors - user is being dismissed anyway
    }
    handleDismiss();
  };

  const toggleInterest = (id: string) => {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSaveInterests = async () => {
    setIsSaving(true);
    try {
      await updatePreferences({
        interests: selectedInterests,
        onboardingCompleted: true,
      });
    } catch {
      // still proceed
    } finally {
      setIsSaving(false);
    }
    setStep(2);
  };

  const STEPS = [
    {
      key: "welcome",
      content: (
        <div className="text-center">
          <div className="mb-6 text-6xl" aria-hidden="true">
            🎉
          </div>
          <h2 className="mb-3 text-2xl font-bold text-zinc-900 dark:text-white">
            ברוכים הבאים להדרך!
          </h2>
          <p className="mb-2 text-zinc-600 dark:text-zinc-400">
            {userName ? `שמחים שהצטרפת אלינו, ${userName}!` : "שמחים שהצטרפת אלינו!"}
          </p>
          <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
            פלטפורמת הלמידה המובילה לדייטינג ומציאת אהבה אמיתית
          </p>

          {/* Social proof */}
          <div className="mb-8 rounded-2xl bg-brand-50 px-6 py-4 dark:bg-brand-900/20">
            <p className="text-2xl font-bold text-brand-600 dark:text-brand-400">
              461
            </p>
            <p className="text-sm text-brand-700 dark:text-brand-300">
              זוגות כבר מצאו אהבה דרכנו
            </p>
          </div>

          <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
            כדי להתאים לך את החוויה הטובה ביותר, ספר לנו מה מעניין אותך
          </p>

          <button
            onClick={() => setStep(1)}
            className="w-full rounded-xl bg-gradient-to-l from-brand-600 to-brand-500 py-3 text-sm font-semibold text-white transition-all hover:brightness-110"
          >
            בוא נתחיל!
          </button>
        </div>
      ),
    },
    {
      key: "interests",
      content: (
        <div>
          <h2 className="mb-2 text-xl font-bold text-zinc-900 dark:text-white text-center">
            מה מעניין אותך?
          </h2>
          <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400 text-center">
            בחר את האזורים שמושכים אותך (ניתן לבחור כמה)
          </p>

          <div className="mb-6 grid gap-3">
            {INTEREST_OPTIONS.map((option) => {
              const isSelected = selectedInterests.includes(option.id);
              return (
                <button
                  key={option.id}
                  onClick={() => toggleInterest(option.id)}
                  className={`flex items-center gap-4 rounded-xl border-2 p-4 text-right transition-all ${
                    isSelected
                      ? "border-brand-500 bg-brand-50 dark:border-brand-400 dark:bg-brand-900/20"
                      : "border-zinc-200 bg-white hover:border-brand-200 dark:border-zinc-700 dark:bg-zinc-800"
                  }`}
                  aria-pressed={isSelected}
                >
                  <span className="text-2xl" aria-hidden="true">
                    {option.icon}
                  </span>
                  <div className="flex-1">
                    <p
                      className={`font-semibold ${
                        isSelected
                          ? "text-brand-700 dark:text-brand-300"
                          : "text-zinc-900 dark:text-white"
                      }`}
                    >
                      {option.label}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {option.description}
                    </p>
                  </div>
                  {isSelected && (
                    <svg
                      className="h-5 w-5 shrink-0 text-brand-600 dark:text-brand-400"
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
                  )}
                </button>
              );
            })}
          </div>

          <button
            onClick={handleSaveInterests}
            disabled={isSaving}
            className="w-full rounded-xl bg-gradient-to-l from-brand-600 to-brand-500 py-3 text-sm font-semibold text-white transition-all hover:brightness-110 disabled:opacity-60"
          >
            {isSaving ? "שומר..." : "המשך"}
          </button>
        </div>
      ),
    },
    {
      key: "ready",
      content: (
        <div className="text-center">
          <div className="mb-6 text-6xl" aria-hidden="true">
            🚀
          </div>
          <h2 className="mb-3 text-2xl font-bold text-zinc-900 dark:text-white">
            מוכן להתחיל!
          </h2>
          <p className="mb-8 text-zinc-500 dark:text-zinc-400">
            כל הכלים שלך מוכנים. מאיפה תרצה להתחיל?
          </p>

          <div className="mb-6 grid gap-3">
            <Link
              href="/courses"
              onClick={handleDismiss}
              className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 text-right transition-all hover:border-blue-300 hover:bg-blue-100 dark:border-blue-700/50 dark:bg-blue-900/20 dark:hover:bg-blue-900/30"
            >
              <span className="text-2xl" aria-hidden="true">📚</span>
              <div>
                <p className="font-semibold text-blue-900 dark:text-blue-200">
                  התחל את הקורס
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-400">
                  למד מתודולוגיה מוכחת לדייטינג
                </p>
              </div>
            </Link>

            <Link
              href="/chat"
              onClick={handleDismiss}
              className="flex items-center gap-3 rounded-xl border border-brand-200 bg-brand-50 p-4 text-right transition-all hover:border-brand-300 hover:bg-brand-100 dark:border-brand-700/50 dark:bg-brand-900/20 dark:hover:bg-brand-900/30"
            >
              <span className="text-2xl" aria-hidden="true">🤖</span>
              <div>
                <p className="font-semibold text-brand-900 dark:text-brand-200">
                  דבר עם המאמן
                </p>
                <p className="text-xs text-brand-700 dark:text-brand-400">
                  קבל עצות אישיות מ-AI מאמן
                </p>
              </div>
            </Link>

            <Link
              href="/simulator"
              onClick={handleDismiss}
              className="flex items-center gap-3 rounded-xl border border-purple-200 bg-purple-50 p-4 text-right transition-all hover:border-purple-300 hover:bg-purple-100 dark:border-purple-700/50 dark:bg-purple-900/20 dark:hover:bg-purple-900/30"
            >
              <span className="text-2xl" aria-hidden="true">🎭</span>
              <div>
                <p className="font-semibold text-purple-900 dark:text-purple-200">
                  נסה סימולציה
                </p>
                <p className="text-xs text-purple-700 dark:text-purple-400">
                  תרגל דייטינג עם AI פרסונה
                </p>
              </div>
            </Link>
          </div>

          <button
            onClick={handleDismiss}
            className="text-sm text-zinc-500 transition-colors hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            סגור ותסתכל מסביב
          </button>
        </div>
      ),
    },
  ];

  const currentStep = STEPS[step];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={step === 2 ? handleDismiss : undefined}
            aria-hidden="true"
          />

          {/* Modal */}
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="onboarding-title"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.25, type: "spring", stiffness: 300, damping: 25 }}
              className="relative w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl dark:bg-zinc-900"
            >
              {/* Skip button */}
              {step < 2 && (
                <button
                  onClick={handleSkip}
                  className="absolute left-4 top-4 rounded-lg px-2 py-1 text-xs text-zinc-400 transition-colors hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
                  aria-label="דלג על ההדרכה"
                >
                  דלג
                </button>
              )}

              {/* Step indicator */}
              <div className="mb-6 flex justify-center gap-2" aria-label={`שלב ${step + 1} מתוך 3`}>
                {STEPS.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === step
                        ? "w-8 bg-brand-500"
                        : i < step
                          ? "w-3 bg-brand-300"
                          : "w-3 bg-zinc-200 dark:bg-zinc-700"
                    }`}
                    aria-hidden="true"
                  />
                ))}
              </div>

              {/* Step content with slide animation */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep.key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                >
                  <span id="onboarding-title" className="sr-only">
                    {step === 0 ? "ברוכים הבאים" : step === 1 ? "מה מעניין אותך" : "מוכן להתחיל"}
                  </span>
                  {currentStep.content}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
