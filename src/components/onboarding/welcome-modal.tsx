"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import Link from "next/link";
import {
  CANONICAL_COURSE_SCOPE,
  chooseOnboardingNextStep,
  type OnboardingInterest,
} from "@/lib/learner-journey";

const STORAGE_KEY = "haderech_onboarding_dismissed";

const INTEREST_OPTIONS: Array<{
  id: OnboardingInterest;
  label: string;
  icon: string;
  description: string;
}> = [
  {
    id: "course",
    label: "מסלול הלימוד המלא",
    icon: "📚",
    description: "12 שבועות ו־6 שלבים בקצב שלך",
  },
  {
    id: "conversation",
    label: "תרגול שיחה קצר",
    icon: "💬",
    description: "לבחור מצב, טון וניסוח לעריכה",
  },
  {
    id: "profile",
    label: "טיוטת פרופיל",
    icon: "✍️",
    description: "לנסח כמה גרסאות מקומיות בדפדפן",
  },
  {
    id: "values",
    label: "רפלקציה על ערכים",
    icon: "🧭",
    description: "לחדד מה חשוב כרגע, בלי אבחון",
  },
  {
    id: "community",
    label: "מרחב הקהילה",
    icon: "👥",
    description: "להכיר את הכללים ולבחור אם להשתתף",
  },
];

interface WelcomeModalProps {
  userName?: string;
}

export function WelcomeModal({ userName }: WelcomeModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [selectedInterests, setSelectedInterests] = useState<
    OnboardingInterest[]
  >([]);
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

  const toggleInterest = (id: OnboardingInterest) => {
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

  const suggestedNextStep = chooseOnboardingNextStep(selectedInterests);
  const alternateNextStep =
    suggestedNextStep.href === "/courses"
      ? {
          href: "/tools/conversation-starters",
          label: "לתרגל ניסוח קצר",
          description: "לבחור מצב וטון ולערוך ניסוח אחד",
          icon: "💬",
        }
      : {
          href: "/courses",
          label: "לראות את מסלול הלימוד",
          description: "12 שבועות, 6 שלבים ו־75 שיעורים",
          icon: "📚",
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
          <p className="mb-6 text-pretty text-sm text-zinc-500 dark:text-zinc-400">
            סביבת למידה בעברית שמחברת בין שיעורים, תרגול קצר וחזרה מסודרת
            למה שכבר למדת.
          </p>

          {/* Canonical course scope */}
          <div className="mb-8 grid grid-cols-4 gap-2 rounded-2xl bg-brand-50 p-3 dark:bg-brand-900/20">
            {[
              [CANONICAL_COURSE_SCOPE.weeks, "שבועות"],
              [CANONICAL_COURSE_SCOPE.phases, "שלבים"],
              [CANONICAL_COURSE_SCOPE.lessons, "שיעורים"],
              [CANONICAL_COURSE_SCOPE.practicePdfs, "קובצי PDF"],
            ].map(([value, label]) => (
              <div key={label} className="rounded-xl bg-white/70 px-2 py-3 dark:bg-zinc-900/40">
                <p className="tabular-nums text-xl font-bold text-brand-700 dark:text-brand-300">
                  {value}
                </p>
                <p className="mt-0.5 text-[11px] text-brand-700/80 dark:text-brand-300/80">
                  {label}
                </p>
              </div>
            ))}
          </div>

          <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
            עכשיו בוחרים נקודת פתיחה. אפשר לשנות כיוון בכל רגע.
          </p>

          <button
            onClick={() => setStep(1)}
            className="w-full rounded-xl bg-gradient-to-l from-brand-600 to-brand-500 py-3 text-sm font-semibold text-white transition-all hover:brightness-110"
          >
            לבחור נקודת פתיחה
          </button>
        </div>
      ),
    },
    {
      key: "interests",
      content: (
        <div>
          <h2 className="mb-2 text-xl font-bold text-zinc-900 dark:text-white text-center">
            מאיפה מתאים להתחיל?
          </h2>
          <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400 text-center">
            אפשר לבחור כמה אפשרויות. הבחירה רק מסדרת את הצעד הבא ואינה
            מסווגת אותך.
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
            {isSaving
              ? "שומר..."
              : selectedInterests.length > 0
                ? "להכין את הצעד הבא"
                : "להמשיך עם מסלול הלימוד"}
          </button>
        </div>
      ),
    },
    {
      key: "ready",
      content: (
        <div className="text-center">
          <div className="mb-6 text-6xl" aria-hidden="true">
            🧭
          </div>
          <h2 className="mb-3 text-2xl font-bold text-zinc-900 dark:text-white">
            הצעד הראשון מוכן
          </h2>
          <p className="mb-6 text-pretty text-zinc-500 dark:text-zinc-400">
            בעשר הדקות הראשונות מספיק לפתוח יחידה אחת, לבחור מתוכה פעולה
            אחת ולשמור נקודה לחזרה.
          </p>

          <div className="mb-6 grid gap-3">
            <Link
              href={suggestedNextStep.href}
              onClick={handleDismiss}
              className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 text-right transition-all hover:border-blue-300 hover:bg-blue-100 dark:border-blue-700/50 dark:bg-blue-900/20 dark:hover:bg-blue-900/30"
            >
              <span className="text-2xl" aria-hidden="true">←</span>
              <div>
                <p className="font-semibold text-blue-900 dark:text-blue-200">
                  {suggestedNextStep.label}
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-400">
                  {suggestedNextStep.description}
                </p>
              </div>
            </Link>

            <Link
              href={alternateNextStep.href}
              onClick={handleDismiss}
              className="flex items-center gap-3 rounded-xl border border-brand-200 bg-brand-50 p-4 text-right transition-all hover:border-brand-300 hover:bg-brand-100 dark:border-brand-700/50 dark:bg-brand-900/20 dark:hover:bg-brand-900/30"
            >
              <span className="text-2xl" aria-hidden="true">{alternateNextStep.icon}</span>
              <div>
                <p className="font-semibold text-brand-900 dark:text-brand-200">
                  {alternateNextStep.label}
                </p>
                <p className="text-xs text-brand-700 dark:text-brand-400">
                  {alternateNextStep.description}
                </p>
              </div>
            </Link>

            <Link
              href="/tools"
              onClick={handleDismiss}
              className="flex items-center gap-3 rounded-xl border border-purple-200 bg-purple-50 p-4 text-right transition-all hover:border-purple-300 hover:bg-purple-100 dark:border-purple-700/50 dark:bg-purple-900/20 dark:hover:bg-purple-900/30"
            >
              <span className="text-2xl" aria-hidden="true">🛠️</span>
              <div>
                <p className="font-semibold text-purple-900 dark:text-purple-200">
                  לבחור תרגול קצר אחר
                </p>
                <p className="text-xs text-purple-700 dark:text-purple-400">
                  שיחה, ערכים או טיוטת פרופיל
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
    <AnimatePresence initial={false}>
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
              transition={{ type: "spring", duration: 0.3, bounce: 0 }}
              className="relative w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl dark:bg-zinc-900"
            >
              {/* Skip button */}
              {step < 2 && (
                <button
                  onClick={handleSkip}
                  className="absolute left-4 top-4 inline-flex min-h-10 items-center rounded-lg px-3 py-2 text-xs text-zinc-400 transition-colors hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
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
              <AnimatePresence mode="wait" initial={false}>
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
