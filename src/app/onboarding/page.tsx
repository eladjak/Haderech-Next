"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import Link from "next/link";
import {
  CANONICAL_COURSE_SCOPE,
  CANONICAL_PHASES,
  chooseStructuredOnboardingNextStep,
} from "@/lib/learner-journey";
import { StructuredNextStepCard } from "@/components/onboarding/structured-next-step-card";

// ==========================================
// Onboarding Wizard - Phase 42
// Multi-step wizard for new users
// ==========================================

const GOALS_OPTIONS = [
  { id: "improve-dating", label: "לתרגל תקשורת בהירה" },
  { id: "find-partner", label: "להרחיב אפשרויות פעולה בהיכרות" },
  { id: "confidence", label: "לזהות ולנסח גבולות" },
  { id: "understand-dynamics", label: "לקבל החלטות בקשר בקצב שלי" },
];

const EXPERIENCE_OPTIONS = [
  {
    id: "beginner",
    label: "מההתחלה",
    description: "נוח לי מסלול מסודר, צעד אחר צעד",
  },
  {
    id: "intermediate",
    label: "לפי נושא",
    description: "נוח לי לבחור מיומנות מסוימת ולתרגל אותה",
  },
  {
    id: "advanced",
    label: "חזרה ממוקדת",
    description: "נוח לי לחזור לנקודות נבחרות ולחדד אותן",
  },
];

const TOPICS_OPTIONS = CANONICAL_PHASES.map((phase) => ({
  id: `phase-${phase.number}`,
  label: `שלב ${phase.number}: ${phase.name}`,
}));

const QUESTION_STEPS = 3;

// --- Confetti CSS animation ---
function ConfettiEffect() {
  const [particles] = useState<
    Array<{
      id: number;
      left: number;
      delay: number;
      color: string;
      size: number;
      duration: number;
    }>
  >(() => {
    const colors = [
      "#E85D75",
      "#1E3A5F",
      "#D4A853",
      "#F08C9E",
      "#c5d4e6",
      "#fde6ea",
    ];
    return Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 4,
      duration: Math.random() * 2 + 2,
    }));
  });

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden motion-reduce:hidden">
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute top-0 block rounded-full"
          style={{
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            animation: `confetti-fall ${p.duration}s ease-in ${p.delay}s forwards`,
          }}
        />
      ))}
      <style>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(-10px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

// --- Progress Bar ---
function ProgressBar({ currentStep }: { currentStep: number }) {
  const questionStep = Math.min(Math.max(currentStep, 1), QUESTION_STEPS);
  const progress = (questionStep / QUESTION_STEPS) * 100;

  return (
    <div
      className="w-full"
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="התקדמות שאלון"
    >
      <div className="flex items-center justify-between mb-2 text-sm text-gray-500">
        <span>
          שלב {questionStep} מתוך {QUESTION_STEPS}
        </span>
        <span>{Math.round(progress)}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-gradient-to-l from-brand-500 to-blue-500 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

// --- Step 0: Welcome ---
function WelcomeStep({
  onNext,
  onSkip,
  isSaving,
}: {
  onNext: () => void;
  onSkip: () => void;
  isSaving: boolean;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`flex flex-col items-center text-center transition-all duration-700 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      }`}
    >
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-blue-500 text-4xl text-white shadow-lg">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-10 w-10"
        >
          <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
        </svg>
      </div>

      <h1 className="mb-4 text-3xl font-bold text-blue-500">נעים להכיר</h1>

      <p className="mb-2 max-w-md text-pretty text-lg text-gray-600">
        אומנות הקשר היא סביבת למידה לתרגול היכרות, תקשורת וקבלת החלטות:{" "}
        {CANONICAL_COURSE_SCOPE.weeks} שבועות, {CANONICAL_COURSE_SCOPE.phases}{" "}
        שלבים ו־{CANONICAL_COURSE_SCOPE.lessons} שיעורים.
      </p>

      <p className="mb-8 text-sm text-gray-400">
        שלוש בחירות קצרות יעזרו לשמור נקודת פתיחה. אפשר לשנות כיוון בהמשך.
      </p>

      <button
        onClick={onNext}
        disabled={isSaving}
        className="rounded-xl bg-gradient-to-l from-brand-500 to-brand-600 px-8 py-3 text-lg font-semibold text-white shadow-md transition-transform duration-200 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
      >
        להתחיל
      </button>
      <button
        onClick={onSkip}
        disabled={isSaving}
        className="mt-3 min-h-11 rounded-xl px-5 py-2 text-sm font-medium text-zinc-600 underline decoration-zinc-300 underline-offset-4 transition-colors hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-60 dark:text-zinc-300 dark:hover:text-white"
      >
        {isSaving ? "ממשיך..." : "להמשיך בלי לענות על השאלון"}
      </button>
      <p className="mt-2 max-w-sm text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
        אין חובה לשמור מטרות או העדפות כדי להשתמש באזור האישי.
      </p>
    </div>
  );
}

// --- Step 1: Goals ---
function GoalsStep({
  selected,
  onSelect,
  onNext,
  onBack,
}: {
  selected: string[];
  onSelect: (goals: string[]) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const toggleGoal = (goalId: string) => {
    if (selected.includes(goalId)) {
      onSelect(selected.filter((g) => g !== goalId));
    } else {
      onSelect([...selected, goalId]);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <h2 className="mb-2 text-2xl font-bold text-blue-500">
        מה מתאים לתרגל עכשיו?
      </h2>
      <p className="mb-6 text-gray-500">אפשר לבחור אפשרות אחת או יותר</p>

      <div className="mb-8 grid w-full max-w-md grid-cols-1 gap-3">
        {GOALS_OPTIONS.map((goal) => {
          const isSelected = selected.includes(goal.id);
          return (
            <button
              key={goal.id}
              onClick={() => toggleGoal(goal.id)}
              className={`rounded-xl border-2 px-5 py-4 text-right text-base font-medium transition-all duration-200 ${
                isSelected
                  ? "border-brand-500 bg-brand-50 text-brand-700 shadow-sm"
                  : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
              }`}
              aria-pressed={isSelected}
            >
              <span className="flex items-center gap-3">
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition-colors ${
                    isSelected
                      ? "border-brand-500 bg-brand-500 text-white"
                      : "border-gray-300 bg-white"
                  }`}
                >
                  {isSelected && (
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </span>
                {goal.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex w-full max-w-md gap-3">
        <button
          onClick={onBack}
          className="flex-1 rounded-xl border-2 border-gray-200 bg-white px-6 py-3 font-semibold text-gray-600 transition-colors hover:bg-gray-50"
        >
          חזרה
        </button>
        <button
          onClick={onNext}
          disabled={selected.length === 0}
          className="flex-1 rounded-xl bg-gradient-to-l from-brand-500 to-brand-600 px-6 py-3 font-semibold text-white shadow-md transition-all duration-200 hover:scale-[1.02] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
        >
          המשך
        </button>
      </div>
    </div>
  );
}

// --- Step 2: Experience ---
function ExperienceStep({
  selected,
  onSelect,
  onNext,
  onBack,
}: {
  selected: string;
  onSelect: (exp: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <div className="flex flex-col items-center">
      <h2 className="mb-2 text-2xl font-bold text-blue-500">איך נוח להתחיל?</h2>
      <p className="mb-6 text-gray-500">
        הבחירה נשמרת כהעדפה ואינה קובעת רמה או יכולת
      </p>

      <div className="mb-8 grid w-full max-w-md grid-cols-1 gap-3">
        {EXPERIENCE_OPTIONS.map((exp) => {
          const isSelected = selected === exp.id;
          return (
            <button
              key={exp.id}
              onClick={() => onSelect(exp.id)}
              className={`rounded-xl border-2 px-5 py-4 text-right transition-all duration-200 ${
                isSelected
                  ? "border-brand-500 bg-brand-50 shadow-sm"
                  : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
              }`}
              role="radio"
              aria-checked={isSelected}
            >
              <span className="flex items-center gap-3">
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                    isSelected
                      ? "border-brand-500 bg-brand-500"
                      : "border-gray-300 bg-white"
                  }`}
                >
                  {isSelected && (
                    <span className="h-2.5 w-2.5 rounded-full bg-white" />
                  )}
                </span>
                <span>
                  <span
                    className={`block text-base font-semibold ${
                      isSelected ? "text-brand-700" : "text-gray-700"
                    }`}
                  >
                    {exp.label}
                  </span>
                  <span className="block text-sm text-gray-500">
                    {exp.description}
                  </span>
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex w-full max-w-md gap-3">
        <button
          onClick={onBack}
          className="flex-1 rounded-xl border-2 border-gray-200 bg-white px-6 py-3 font-semibold text-gray-600 transition-colors hover:bg-gray-50"
        >
          חזרה
        </button>
        <button
          onClick={onNext}
          disabled={!selected}
          className="flex-1 rounded-xl bg-gradient-to-l from-brand-500 to-brand-600 px-6 py-3 font-semibold text-white shadow-md transition-all duration-200 hover:scale-[1.02] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
        >
          המשך
        </button>
      </div>
    </div>
  );
}

// --- Step 3: Topics ---
function TopicsStep({
  selected,
  onSelect,
  onNext,
  onBack,
  isSaving,
}: {
  selected: string[];
  onSelect: (topics: string[]) => void;
  onNext: () => void;
  onBack: () => void;
  isSaving: boolean;
}) {
  const toggleTopic = (topicId: string) => {
    if (selected.includes(topicId)) {
      onSelect(selected.filter((t) => t !== topicId));
    } else {
      onSelect([...selected, topicId]);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <h2 className="mb-2 text-2xl font-bold text-blue-500">
        אילו שלבים מסקרנים כרגע?
      </h2>
      <p className="mb-6 text-gray-500">
        הקורס נשאר פתוח כולו; הבחירה רק מסמנת נקודות לחזרה
      </p>

      <div className="mb-8 grid w-full max-w-md grid-cols-1 gap-3">
        {TOPICS_OPTIONS.map((topic) => {
          const isSelected = selected.includes(topic.id);
          return (
            <button
              key={topic.id}
              onClick={() => toggleTopic(topic.id)}
              className={`rounded-xl border-2 px-5 py-4 text-right text-base font-medium transition-all duration-200 ${
                isSelected
                  ? "border-brand-500 bg-brand-50 text-brand-700 shadow-sm"
                  : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
              }`}
              aria-pressed={isSelected}
            >
              <span className="flex items-center gap-3">
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition-colors ${
                    isSelected
                      ? "border-brand-500 bg-brand-500 text-white"
                      : "border-gray-300 bg-white"
                  }`}
                >
                  {isSelected && (
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </span>
                {topic.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex w-full max-w-md gap-3">
        <button
          onClick={onBack}
          className="flex-1 rounded-xl border-2 border-gray-200 bg-white px-6 py-3 font-semibold text-gray-600 transition-colors hover:bg-gray-50"
        >
          חזרה
        </button>
        <button
          onClick={onNext}
          disabled={selected.length === 0 || isSaving}
          className="flex-1 rounded-xl bg-gradient-to-l from-brand-500 to-brand-600 px-6 py-3 font-semibold text-white shadow-md transition-all duration-200 hover:scale-[1.02] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
        >
          {isSaving ? "שומר..." : "לשמור ולהמשיך"}
        </button>
      </div>
    </div>
  );
}

// --- Completion Screen ---
function CompletionScreen({
  recommendation,
}: {
  recommendation: ReturnType<typeof chooseStructuredOnboardingNextStep>;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <ConfettiEffect />
      <div
        className={`flex flex-col items-center text-center transition-all duration-700 ${
          visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        }`}
      >
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-accent-400 to-accent-300 text-5xl shadow-lg">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="white"
            className="h-12 w-12"
          >
            <path
              fillRule="evenodd"
              d="M5.166 2.621v.858c-1.035.148-2.059.33-3.071.543a.75.75 0 00-.584.859 6.753 6.753 0 006.138 5.6 6.73 6.73 0 002.743 1.346A6.707 6.707 0 019.279 15H8.54c-1.036 0-1.875.84-1.875 1.875V19.5h-.75a.75.75 0 000 1.5h2.625a.75.75 0 000-1.5h-.75v-2.625c0-.207.168-.375.375-.375h.74a6.715 6.715 0 001.713.658 6.73 6.73 0 001.713-.658h.74c.207 0 .375.168.375.375V19.5h-.75a.75.75 0 000 1.5h2.625a.75.75 0 000-1.5h-.75v-2.625c0-1.036-.84-1.875-1.875-1.875h-.739a6.707 6.707 0 00-1.112-3.173 6.73 6.73 0 002.743-1.347 6.753 6.753 0 006.139-5.6.75.75 0 00-.585-.858 47.077 47.077 0 00-3.07-.543V2.62a.75.75 0 00-.658-.744 49.22 49.22 0 00-6.093-.377c-2.063 0-4.096.128-6.093.377a.75.75 0 00-.657.744zm0 2.629c0 1.196.312 2.32.857 3.294A5.266 5.266 0 013.16 5.337a45.6 45.6 0 012.006-.343v.256zm13.5 0v-.256c.674.1 1.343.214 2.006.343a5.265 5.265 0 01-2.863 3.207 6.72 6.72 0 00.857-3.294z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        <h2 className="mb-3 text-3xl font-bold text-blue-500">
          {recommendation.mode === "choice-based"
            ? "ההיכרות נשמרה"
            : "אפשר להתחיל בלי שאלון"}
        </h2>

        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-accent-300/20 px-5 py-2">
          <span className="text-sm font-semibold text-accent-600">
            הבחירות נשמרו לחשבון שלך
          </span>
          <span className="text-sm text-gray-600">על השלמת ההיכרות</span>
        </div>

        <p className="mb-6 max-w-md text-pretty text-gray-500">
          הנה נקודת פתיחה אחת. זו הצעה שאפשר לקבל, לשנות או להשאיר להמשך.
        </p>

        <div className="w-full max-w-md">
          <StructuredNextStepCard recommendation={recommendation} />
          <Link
            href="/dashboard"
            className="mt-3 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-white px-6 py-3 font-semibold text-zinc-700 shadow-[0_0_0_1px_rgba(0,0,0,0.1)] transition-[transform,box-shadow] hover:shadow-md active:scale-[0.96] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 dark:bg-zinc-900 dark:text-zinc-100"
          >
            לעבור לאזור האישי
          </Link>
        </div>
      </div>
    </>
  );
}

// ==========================================
// Main Onboarding Page
// ==========================================
export default function OnboardingPage() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();

  // State
  const [currentStep, setCurrentStep] = useState(0);
  const [goals, setGoals] = useState<string[]>([]);
  const [experience, setExperience] = useState("");
  const [topics, setTopics] = useState<string[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [completionError, setCompletionError] = useState<string | null>(null);

  // Convex
  const onboarding = useQuery(api.onboarding.getOnboarding);
  const saveStepMutation = useMutation(api.onboarding.saveStep);
  const completeOnboardingMutation = useMutation(
    api.onboarding.completeOnboarding,
  );

  // Redirect if not signed in
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  // If already completed, redirect to dashboard
  useEffect(() => {
    if (onboarding?.completed) {
      router.push("/dashboard");
    }
  }, [onboarding, router]);

  // Restore saved progress
  useEffect(() => {
    if (onboarding && !onboarding.completed) {
      setCurrentStep(onboarding.currentStep);
      if (onboarding.answers.goals) setGoals(onboarding.answers.goals);
      if (onboarding.answers.experience)
        setExperience(onboarding.answers.experience);
      if (onboarding.answers.preferredTopics)
        setTopics(onboarding.answers.preferredTopics);
    }
  }, [onboarding]);

  // Save step progress to Convex
  const saveProgress = useCallback(
    async (step: number) => {
      if (isSaving) return;
      setIsSaving(true);
      try {
        await saveStepMutation({
          step,
          answers: {
            goals: goals.length > 0 ? goals : undefined,
            experience: experience || undefined,
            preferredTopics: topics.length > 0 ? topics : undefined,
          },
        });
      } catch {
        // Silent fail on step save - not critical
      } finally {
        setIsSaving(false);
      }
    },
    [saveStepMutation, goals, experience, topics, isSaving],
  );

  const handleNext = useCallback(() => {
    const nextStep = currentStep + 1;
    setCurrentStep(nextStep);
    void saveProgress(nextStep);
  }, [currentStep, saveProgress]);

  const handleBack = useCallback(() => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  }, []);

  const handleComplete = useCallback(async () => {
    if (isSaving) return;
    setIsSaving(true);
    setCompletionError(null);
    try {
      await completeOnboardingMutation({
        answers: {
          goals: goals.length > 0 ? goals : undefined,
          experience: experience || undefined,
          preferredTopics: topics.length > 0 ? topics : undefined,
        },
      });
      setIsCompleted(true);
    } catch {
      setCompletionError(
        "לא הצלחנו לשמור את ההיכרות. שום בחירה לא אבדה במסך הזה; אפשר לנסות שוב.",
      );
    } finally {
      setIsSaving(false);
    }
  }, [completeOnboardingMutation, goals, experience, topics, isSaving]);

  const handleSkipQuestions = useCallback(async () => {
    if (isSaving) return;
    setIsSaving(true);
    setCompletionError(null);
    try {
      await completeOnboardingMutation({ answers: {} });
      setGoals([]);
      setExperience("");
      setTopics([]);
      setIsCompleted(true);
    } catch {
      setCompletionError(
        "לא הצלחנו להמשיך בלי השאלון. לא נשמרו בחירות חדשות; אפשר לנסות שוב.",
      );
    } finally {
      setIsSaving(false);
    }
  }, [completeOnboardingMutation, isSaving]);

  const recommendation = chooseStructuredOnboardingNextStep({
    goals,
    experience,
    preferredTopics: topics,
  });

  // Loading state
  if (!isLoaded || onboarding === undefined) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-500" />
          <p className="text-gray-500">טוען...</p>
        </div>
      </div>
    );
  }

  // If signed out
  if (!isSignedIn) return null;

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-gradient-to-b from-background via-brand-50/30 to-blue-50/30 px-4 py-8">
      <div className="w-full max-w-lg">
        {/* Logo / Brand */}
        {!isCompleted && (
          <div className="mb-6 text-center">
            <span className="text-sm font-medium text-brand-500">
              הדרך - אומנות הקשר
            </span>
          </div>
        )}

        {/* Progress bar */}
        {!isCompleted && currentStep > 0 && (
          <ProgressBar currentStep={currentStep} />
        )}

        {/* Steps container */}
        <div className="mt-8">
          {isCompleted ? (
            <CompletionScreen recommendation={recommendation} />
          ) : currentStep === 0 ? (
            <WelcomeStep
              onNext={handleNext}
              onSkip={handleSkipQuestions}
              isSaving={isSaving}
            />
          ) : currentStep === 1 ? (
            <GoalsStep
              selected={goals}
              onSelect={setGoals}
              onNext={handleNext}
              onBack={handleBack}
            />
          ) : currentStep === 2 ? (
            <ExperienceStep
              selected={experience}
              onSelect={setExperience}
              onNext={handleNext}
              onBack={handleBack}
            />
          ) : currentStep === 3 ? (
            <TopicsStep
              selected={topics}
              onSelect={setTopics}
              onNext={handleComplete}
              onBack={handleBack}
              isSaving={isSaving}
            />
          ) : null}
        </div>

        {/* Saving indicator */}
        {isSaving && currentStep < 3 && (
          <div className="mt-4 text-center text-sm text-gray-400">שומר...</div>
        )}
        {completionError && (
          <p
            className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-center text-sm text-red-700"
            role="alert"
          >
            {completionError}
          </p>
        )}
      </div>
    </main>
  );
}
