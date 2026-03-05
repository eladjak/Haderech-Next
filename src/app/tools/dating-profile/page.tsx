"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ProfilePreview } from "@/components/tools/profile-preview";
import { ProfileTips } from "@/components/tools/profile-tips";
import { motion, AnimatePresence } from "framer-motion";

// -----------------------------------------------
// Types
// -----------------------------------------------

type LookingFor = "relationship" | "casual" | "friendship" | "not-sure";

interface ProfileData {
  displayName: string;
  age: string;
  location: string;
  lookingFor: LookingFor | "";
  genderIdentity: string;
  bio: string;
  interests: string[];
  customInterests: string[];
  idealPartner: string;
  dealBreakers: string[];
  relationshipValues: string[];
}

// -----------------------------------------------
// Constants
// -----------------------------------------------

const TOTAL_STEPS = 6;

const STEP_LABELS = [
  "מידע בסיסי",
  "עלייך",
  "תחביבים",
  "מחפש/ת",
  "תמונות",
  "סקירה",
];

const LOOKING_FOR_OPTIONS: { value: LookingFor; label: string; emoji: string }[] = [
  { value: "relationship", label: "זוגיות רצינית", emoji: "❤️" },
  { value: "casual", label: "קשר קליל", emoji: "😊" },
  { value: "friendship", label: "חברות", emoji: "🤝" },
  { value: "not-sure", label: "לא בטוח/ה עדיין", emoji: "🤷" },
];

const PRESET_INTERESTS = [
  "טיולים", "בישול", "ספורט", "מוזיקה", "קריאה",
  "צילום", "יוגה", "נסיעות", "אומנות", "סרטים",
  "משחקים", "ריקוד", "גינון", "מדיטציה", "התנדבות",
];

const DEAL_BREAKER_OPTIONS = [
  "עישון", "ילדים (לא מעוניין/ת)", "מרחק רב", "אמונות דתיות שונות",
  "חוסר אמביציה", "ריחוק רגשי", "היסטוריה של בגידות",
];

const RELATIONSHIP_VALUES_OPTIONS = [
  "אמון", "תקשורת", "הומור", "נאמנות",
  "כנות", "חופש", "תמיכה", "אינטימיות",
];

const PHOTO_TIPS = [
  {
    number: 1,
    title: "תמונת פנים ברורה עם חיוך",
    desc: "תמונה ראשית - חייבת להיות ברורה, תאורה טובה, חיוך אמיתי. לא תמונת קבוצה ולא תמונה מרחוק.",
    do: "פנים ברורות, עיניים פתוחות, חיוך אמיתי, תאורה טובה",
    dont: "תמונת קבוצה, תמונה עם פנים מוסתרות, פילטרים קיצוניים",
  },
  {
    number: 2,
    title: "תמונת גוף מלא בפעילות",
    desc: "הראה את עצמך בפעולה - ריצה, בישול, ספורט. מעביר שיש לך חיים פעילים ומעניינים.",
    do: "פעילות אמיתית, תנועה, חיוך טבעי",
    dont: "עמידה קפואה לצלמה, תמונה עם אפקטים, פוזה מלאכותית",
  },
  {
    number: 3,
    title: "תמונה חברתית עם חברים",
    desc: "תמונה עם אנשים אחרים מראה שיש לך מעגל חברתי חם. אבל ודא שניתן לזהות אותך בקלות.",
    do: "קבוצה קטנה, אתה בולט, אירוע חברתי",
    dont: "תמונת קבוצה גדולה שקשה לזהות בה אותך",
  },
  {
    number: 4,
    title: "תמונה שמספרת סיפור",
    desc: "תמונה שמגלה משהו ייחודי עליך - עם חיית מחמד, בטיול מיוחד, בפעילות תחביב.",
    do: "תחביב אמיתי, מקום מיוחד, רגע אותנטי",
    dont: "תמונה גנרית ללא סיפור, תמונת 'מירון'",
  },
];

// -----------------------------------------------
// Main Component
// -----------------------------------------------

export default function DatingProfileBuilderPage() {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<ProfileData>({
    displayName: "",
    age: "",
    location: "",
    lookingFor: "",
    genderIdentity: "",
    bio: "",
    interests: [],
    customInterests: [],
    idealPartner: "",
    dealBreakers: [],
    relationshipValues: [],
  });
  const [customInterestInput, setCustomInterestInput] = useState("");
  const [analysisResult, setAnalysisResult] = useState<{
    score: number;
    breakdown: { section: string; points: number; max: number; tip: string }[];
    qualityTips: string[];
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savedFeedback, setSavedFeedback] = useState(false);

  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Convex hooks
  const savedProfile = useQuery(api.datingProfile.getProfile);
  const tips = useQuery(api.datingProfile.getProfileTips, { step });
  const saveProfileMutation = useMutation(api.datingProfile.saveProfile);
  const analyzeProfileMutation = useMutation(api.datingProfile.analyzeProfile);

  // Hydrate from saved profile once loaded
  useEffect(() => {
    if (savedProfile) {
      setProfile({
        displayName: savedProfile.displayName ?? "",
        age: savedProfile.age != null ? String(savedProfile.age) : "",
        location: savedProfile.location ?? "",
        lookingFor: (savedProfile.lookingFor as LookingFor | "") ?? "",
        genderIdentity: savedProfile.genderIdentity ?? "",
        bio: savedProfile.bio ?? "",
        interests: savedProfile.interests ?? [],
        customInterests: savedProfile.customInterests ?? [],
        idealPartner: savedProfile.idealPartner ?? "",
        dealBreakers: savedProfile.dealBreakers ?? [],
        relationshipValues: savedProfile.relationshipValues ?? [],
      });
      if (savedProfile.currentStep) {
        setStep(savedProfile.currentStep);
      }
    }
  }, [savedProfile]);

  // Auto-save with debounce
  const triggerAutoSave = useCallback(() => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(async () => {
      try {
        await saveProfileMutation({
          displayName: profile.displayName || undefined,
          age: profile.age ? Number(profile.age) : undefined,
          location: profile.location || undefined,
          lookingFor: (profile.lookingFor as LookingFor) || undefined,
          genderIdentity: profile.genderIdentity || undefined,
          bio: profile.bio || undefined,
          interests: profile.interests.length > 0 ? profile.interests : undefined,
          customInterests: profile.customInterests.length > 0 ? profile.customInterests : undefined,
          idealPartner: profile.idealPartner || undefined,
          dealBreakers: profile.dealBreakers.length > 0 ? profile.dealBreakers : undefined,
          relationshipValues: profile.relationshipValues.length > 0 ? profile.relationshipValues : undefined,
          currentStep: step,
        });
      } catch {
        // Silently fail auto-save (user may be logged out)
      }
    }, 2000);
  }, [profile, step, saveProfileMutation]);

  useEffect(() => {
    triggerAutoSave();
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [triggerAutoSave]);

  // Update a profile field
  const update = useCallback(<K extends keyof ProfileData>(key: K, value: ProfileData[K]) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  }, []);

  // Toggle interest chip
  const toggleInterest = useCallback((interest: string) => {
    setProfile((prev) => {
      const current = prev.interests;
      if (current.includes(interest)) {
        return { ...prev, interests: current.filter((i) => i !== interest) };
      }
      if (current.length + prev.customInterests.length >= 10) return prev;
      return { ...prev, interests: [...current, interest] };
    });
  }, []);

  // Add custom interest
  const addCustomInterest = useCallback(() => {
    const val = customInterestInput.trim();
    if (!val) return;
    setProfile((prev) => {
      if (prev.customInterests.includes(val)) return prev;
      if (prev.interests.length + prev.customInterests.length >= 10) return prev;
      return { ...prev, customInterests: [...prev.customInterests, val] };
    });
    setCustomInterestInput("");
  }, [customInterestInput]);

  // Toggle deal breaker
  const toggleDealBreaker = useCallback((item: string) => {
    setProfile((prev) => ({
      ...prev,
      dealBreakers: prev.dealBreakers.includes(item)
        ? prev.dealBreakers.filter((d) => d !== item)
        : [...prev.dealBreakers, item],
    }));
  }, []);

  // Toggle relationship value (max 3)
  const toggleValue = useCallback((val: string) => {
    setProfile((prev) => {
      if (prev.relationshipValues.includes(val)) {
        return { ...prev, relationshipValues: prev.relationshipValues.filter((v) => v !== val) };
      }
      if (prev.relationshipValues.length >= 3) return prev;
      return { ...prev, relationshipValues: [...prev.relationshipValues, val] };
    });
  }, []);

  // Navigation
  const goNext = useCallback(() => setStep((s) => Math.min(s + 1, TOTAL_STEPS)), []);
  const goBack = useCallback(() => setStep((s) => Math.max(s - 1, 1)), []);

  // Save & Analyze (step 6)
  const handleSaveAndAnalyze = useCallback(async () => {
    setIsSaving(true);
    try {
      const result = await analyzeProfileMutation({
        displayName: profile.displayName || undefined,
        age: profile.age ? Number(profile.age) : undefined,
        location: profile.location || undefined,
        lookingFor: (profile.lookingFor as LookingFor) || undefined,
        genderIdentity: profile.genderIdentity || undefined,
        bio: profile.bio || undefined,
        interests: profile.interests,
        customInterests: profile.customInterests,
        idealPartner: profile.idealPartner || undefined,
        dealBreakers: profile.dealBreakers,
        relationshipValues: profile.relationshipValues,
      });
      setAnalysisResult(result);

      await saveProfileMutation({
        displayName: profile.displayName || undefined,
        age: profile.age ? Number(profile.age) : undefined,
        location: profile.location || undefined,
        lookingFor: (profile.lookingFor as LookingFor) || undefined,
        genderIdentity: profile.genderIdentity || undefined,
        bio: profile.bio || undefined,
        interests: profile.interests.length > 0 ? profile.interests : undefined,
        customInterests: profile.customInterests.length > 0 ? profile.customInterests : undefined,
        idealPartner: profile.idealPartner || undefined,
        dealBreakers: profile.dealBreakers.length > 0 ? profile.dealBreakers : undefined,
        relationshipValues: profile.relationshipValues.length > 0 ? profile.relationshipValues : undefined,
        completenessScore: result.score,
        currentStep: TOTAL_STEPS,
      });

      setSavedFeedback(true);
      setTimeout(() => setSavedFeedback(false), 3000);
    } finally {
      setIsSaving(false);
    }
  }, [profile, analyzeProfileMutation, saveProfileMutation]);

  // Input class shared
  const inputClass =
    "w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 placeholder-zinc-400 transition-colors focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:placeholder-zinc-500 dark:focus:border-indigo-500";

  const allInterests = [...profile.interests, ...profile.customInterests];

  return (
    <div className="min-h-dvh bg-white dark:bg-zinc-950" dir="rtl">
      <Header />

      <main id="main-content" className="container mx-auto px-4 py-10">
        <div className="mx-auto max-w-4xl">
          {/* Back link */}
          <Link
            href="/tools"
            className="mb-6 inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-brand-500 dark:text-zinc-400 dark:hover:text-brand-400"
          >
            <svg className="h-4 w-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            חזרה לכלים
          </Link>

          {/* Header */}
          <div className="mb-8">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 shadow-lg shadow-rose-500/20">
              <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            </div>
            <h1 className="mb-1 text-3xl font-bold text-zinc-900 dark:text-white">בונה פרופיל דייטינג</h1>
            <p className="text-zinc-500 dark:text-zinc-400">
              בנה פרופיל דייטינג שמבטא אותך באמת ומושך את ההתאמה הנכונה
            </p>
          </div>

          {/* Step indicator */}
          <div className="mb-8">
            <div className="mb-2 flex items-center justify-between">
              {STEP_LABELS.map((label, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setStep(i + 1)}
                  className={`flex flex-col items-center gap-1 transition-colors ${
                    step > i + 1
                      ? "text-rose-500"
                      : step === i + 1
                        ? "text-rose-600 dark:text-rose-400"
                        : "text-zinc-400 dark:text-zinc-600"
                  }`}
                >
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all ${
                      step > i + 1
                        ? "bg-rose-500 text-white"
                        : step === i + 1
                          ? "bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-md shadow-rose-500/30"
                          : "bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500"
                    }`}
                  >
                    {step > i + 1 ? (
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      i + 1
                    )}
                  </span>
                  <span className="hidden text-xs sm:block">{label}</span>
                </button>
              ))}
            </div>
            {/* Progress bar */}
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
              <div
                className="h-full rounded-full bg-gradient-to-l from-rose-500 to-pink-600 transition-all duration-500"
                style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
              />
            </div>
          </div>

          {/* Main two-column layout (form + preview/tips) */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
            {/* Form column */}
            <div className="lg:col-span-3">
              <AnimatePresence mode="wait">
                {/* ---- STEP 1: Basic Info ---- */}
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.22 }}
                    className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    <h2 className="mb-5 text-lg font-semibold text-zinc-900 dark:text-white">
                      מידע בסיסי
                    </h2>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="dp-name" className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                          שם תצוגה <span className="text-rose-500">*</span>
                        </label>
                        <input
                          id="dp-name"
                          type="text"
                          value={profile.displayName}
                          onChange={(e) => update("displayName", e.target.value)}
                          placeholder="השם שיופיע בפרופיל"
                          className={inputClass}
                          aria-required="true"
                        />
                      </div>

                      <div>
                        <label htmlFor="dp-age" className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                          גיל <span className="text-rose-500">*</span>
                        </label>
                        <input
                          id="dp-age"
                          type="number"
                          min={18}
                          max={99}
                          value={profile.age}
                          onChange={(e) => update("age", e.target.value)}
                          placeholder="28"
                          className={inputClass}
                          aria-required="true"
                        />
                      </div>

                      <div>
                        <label htmlFor="dp-location" className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                          מיקום
                        </label>
                        <input
                          id="dp-location"
                          type="text"
                          value={profile.location}
                          onChange={(e) => update("location", e.target.value)}
                          placeholder="תל אביב, ירושלים, חיפה..."
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                          מחפש/ת <span className="text-rose-500">*</span>
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {LOOKING_FOR_OPTIONS.map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => update("lookingFor", opt.value)}
                              className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-right text-sm font-medium transition-all ${
                                profile.lookingFor === opt.value
                                  ? "border-rose-500 bg-rose-50 text-rose-700 dark:border-rose-400 dark:bg-rose-500/10 dark:text-rose-300"
                                  : "border-zinc-200 bg-white text-zinc-600 hover:border-rose-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:border-rose-800"
                              }`}
                            >
                              <span>{opt.emoji}</span>
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label htmlFor="dp-gender" className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                          זהות מגדרית (אופציונלי)
                        </label>
                        <input
                          id="dp-gender"
                          type="text"
                          value={profile.genderIdentity}
                          onChange={(e) => update("genderIdentity", e.target.value)}
                          placeholder="גבר, אישה, נון-בינארי..."
                          className={inputClass}
                        />
                      </div>
                    </div>

                    <div className="mt-6">
                      <button
                        type="button"
                        onClick={goNext}
                        disabled={!profile.displayName || !profile.age || !profile.lookingFor}
                        className="w-full rounded-xl bg-gradient-to-l from-rose-500 to-pink-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-rose-500/20 transition-all hover:opacity-90 disabled:opacity-40"
                      >
                        המשך ←
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* ---- STEP 2: Bio ---- */}
                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.22 }}
                    className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    <h2 className="mb-1 text-lg font-semibold text-zinc-900 dark:text-white">
                      הביוגרפיה שלך
                    </h2>
                    <p className="mb-5 text-sm text-zinc-500 dark:text-zinc-400">
                      זו ההזדמנות שלך לספר מי אתה/את ולמשוך את האדם הנכון
                    </p>

                    <div>
                      <div className="mb-1.5 flex items-center justify-between">
                        <label htmlFor="dp-bio" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                          ביו
                        </label>
                        <span className={`text-xs ${profile.bio.length > 450 ? "text-rose-500" : "text-zinc-400"}`}>
                          {profile.bio.length}/500
                        </span>
                      </div>
                      <textarea
                        id="dp-bio"
                        rows={7}
                        maxLength={500}
                        value={profile.bio}
                        onChange={(e) => update("bio", e.target.value)}
                        placeholder="ספר/י על עצמך בצורה שמעניינת ומושכת. מה מייחד אותך? מה תשמח לגלות לאנשים עליך?"
                        className={`${inputClass} resize-none`}
                      />
                    </div>

                    {/* Live preview snippet */}
                    {profile.bio.length > 0 && (
                      <div className="mt-4 rounded-xl border border-zinc-100 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-800/50">
                        <p className="mb-1 text-xs font-medium text-zinc-500">תצוגה מקדימה</p>
                        <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                          {profile.bio}
                        </p>
                      </div>
                    )}

                    <div className="mt-6 flex gap-2.5">
                      <button
                        type="button"
                        onClick={goBack}
                        className="flex-shrink-0 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-600 transition-colors hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
                      >
                        → חזרה
                      </button>
                      <button
                        type="button"
                        onClick={goNext}
                        className="flex-1 rounded-xl bg-gradient-to-l from-rose-500 to-pink-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-rose-500/15 transition-all hover:opacity-90"
                      >
                        המשך ←
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* ---- STEP 3: Interests ---- */}
                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.22 }}
                    className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    <h2 className="mb-1 text-lg font-semibold text-zinc-900 dark:text-white">
                      תחביבים ותשוקות
                    </h2>
                    <p className="mb-5 text-sm text-zinc-500 dark:text-zinc-400">
                      בחר/י עד 10 תחביבים. אלו יופיעו בפרופיל ויפתחו שיחות.
                    </p>

                    {/* Preset chips */}
                    <div className="mb-4 flex flex-wrap gap-2">
                      {PRESET_INTERESTS.map((interest) => {
                        const selected = profile.interests.includes(interest);
                        const maxReached = allInterests.length >= 10;
                        return (
                          <button
                            key={interest}
                            type="button"
                            onClick={() => toggleInterest(interest)}
                            disabled={!selected && maxReached}
                            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                              selected
                                ? "bg-rose-500 text-white shadow-sm shadow-rose-500/20"
                                : maxReached
                                  ? "cursor-not-allowed border border-zinc-100 bg-zinc-50 text-zinc-300 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-600"
                                  : "border border-zinc-200 bg-white text-zinc-700 hover:border-rose-300 hover:bg-rose-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-rose-700 dark:hover:bg-rose-500/10"
                            }`}
                          >
                            {interest}
                          </button>
                        );
                      })}
                    </div>

                    {/* Custom interest input */}
                    <div className="mb-4">
                      <label htmlFor="dp-custom-interest" className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        הוסף תחביב משלך
                      </label>
                      <div className="flex gap-2">
                        <input
                          id="dp-custom-interest"
                          type="text"
                          value={customInterestInput}
                          onChange={(e) => setCustomInterestInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") { e.preventDefault(); addCustomInterest(); }
                          }}
                          placeholder="למשל: אסטרולוגיה, שחמט..."
                          disabled={allInterests.length >= 10}
                          className={`${inputClass} flex-1`}
                        />
                        <button
                          type="button"
                          onClick={addCustomInterest}
                          disabled={!customInterestInput.trim() || allInterests.length >= 10}
                          className="shrink-0 rounded-xl bg-rose-500 px-4 py-3 text-sm font-medium text-white transition-all hover:bg-rose-600 disabled:opacity-40"
                        >
                          הוסף
                        </button>
                      </div>
                    </div>

                    {/* Custom interest chips */}
                    {profile.customInterests.length > 0 && (
                      <div className="mb-4 flex flex-wrap gap-2">
                        {profile.customInterests.map((interest) => (
                          <span
                            key={interest}
                            className="flex items-center gap-1.5 rounded-full bg-rose-500 px-3 py-1.5 text-sm font-medium text-white"
                          >
                            {interest}
                            <button
                              type="button"
                              onClick={() =>
                                setProfile((prev) => ({
                                  ...prev,
                                  customInterests: prev.customInterests.filter((i) => i !== interest),
                                }))
                              }
                              className="flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 hover:bg-rose-700"
                              aria-label={`הסר ${interest}`}
                            >
                              <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Counter */}
                    <p className="mb-4 text-xs text-zinc-500">
                      נבחרו {allInterests.length}/10 תחביבים
                    </p>

                    <div className="flex gap-2.5">
                      <button type="button" onClick={goBack} className="flex-shrink-0 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-600 transition-colors hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
                        → חזרה
                      </button>
                      <button type="button" onClick={goNext} className="flex-1 rounded-xl bg-gradient-to-l from-rose-500 to-pink-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-rose-500/15 transition-all hover:opacity-90">
                        המשך ←
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* ---- STEP 4: What I'm looking for ---- */}
                {step === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.22 }}
                    className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    <h2 className="mb-1 text-lg font-semibold text-zinc-900 dark:text-white">
                      מה אני מחפש/ת
                    </h2>
                    <p className="mb-5 text-sm text-zinc-500 dark:text-zinc-400">
                      תאר/י את ההתאמה האידיאלית שלך וערכים חשובים לך
                    </p>

                    <div className="space-y-5">
                      {/* Ideal partner */}
                      <div>
                        <div className="mb-1.5 flex items-center justify-between">
                          <label htmlFor="dp-ideal" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            תאר/י את ההתאמה האידיאלית שלך
                          </label>
                          <span className={`text-xs ${profile.idealPartner.length > 270 ? "text-rose-500" : "text-zinc-400"}`}>
                            {profile.idealPartner.length}/300
                          </span>
                        </div>
                        <textarea
                          id="dp-ideal"
                          rows={4}
                          maxLength={300}
                          value={profile.idealPartner}
                          onChange={(e) => update("idealPartner", e.target.value)}
                          placeholder="מחפש/ת מישהו שמביא/ה קלות וחום לחיים. מישהו שיודע לצחוק על עצמו ולהיות שם כשצריך..."
                          className={`${inputClass} resize-none`}
                        />
                      </div>

                      {/* Deal breakers */}
                      <div>
                        <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                          דיל-ברייקרים (אופציונלי)
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {DEAL_BREAKER_OPTIONS.map((item) => {
                            const selected = profile.dealBreakers.includes(item);
                            return (
                              <button
                                key={item}
                                type="button"
                                onClick={() => toggleDealBreaker(item)}
                                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                                  selected
                                    ? "bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900"
                                    : "border border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
                                }`}
                              >
                                {selected ? "✓ " : ""}{item}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Relationship values */}
                      <div>
                        <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                          ערכי זוגיות (בחר/י עד 3)
                        </label>
                        <p className="mb-2 text-xs text-zinc-500">נבחרו {profile.relationshipValues.length}/3</p>
                        <div className="flex flex-wrap gap-2">
                          {RELATIONSHIP_VALUES_OPTIONS.map((val) => {
                            const selected = profile.relationshipValues.includes(val);
                            const maxReached = profile.relationshipValues.length >= 3;
                            return (
                              <button
                                key={val}
                                type="button"
                                onClick={() => toggleValue(val)}
                                disabled={!selected && maxReached}
                                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                                  selected
                                    ? "bg-gradient-to-l from-rose-500 to-pink-600 text-white shadow-sm shadow-rose-500/20"
                                    : maxReached
                                      ? "cursor-not-allowed border border-zinc-100 bg-zinc-50 text-zinc-300 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-600"
                                      : "border border-zinc-200 bg-white text-zinc-700 hover:border-rose-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                                }`}
                              >
                                {val}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex gap-2.5">
                      <button type="button" onClick={goBack} className="flex-shrink-0 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-600 transition-colors hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
                        → חזרה
                      </button>
                      <button type="button" onClick={goNext} className="flex-1 rounded-xl bg-gradient-to-l from-rose-500 to-pink-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-rose-500/15 transition-all hover:opacity-90">
                        המשך ←
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* ---- STEP 5: Photos Strategy ---- */}
                {step === 5 && (
                  <motion.div
                    key="step5"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.22 }}
                    className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    <h2 className="mb-1 text-lg font-semibold text-zinc-900 dark:text-white">
                      אסטרטגיית תמונות
                    </h2>
                    <p className="mb-5 text-sm text-zinc-500 dark:text-zinc-400">
                      התמונות הן 70% מהפרופיל. הנה המדריך לתמונות שעובדות.
                    </p>

                    <div className="space-y-4">
                      {PHOTO_TIPS.map((photo) => (
                        <div
                          key={photo.number}
                          className="rounded-2xl border border-zinc-100 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-800/50"
                        >
                          <div className="mb-2 flex items-center gap-3">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 text-sm font-bold text-white shadow-sm shadow-rose-500/20">
                              {photo.number}
                            </span>
                            <h3 className="font-semibold text-zinc-900 dark:text-white">
                              {photo.title}
                            </h3>
                          </div>
                          <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-400">
                            {photo.desc}
                          </p>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-xl border border-green-200 bg-green-50 p-3 dark:border-green-900/40 dark:bg-green-500/5">
                              <p className="mb-1 text-xs font-semibold text-green-700 dark:text-green-400">✓ עשה/י</p>
                              <p className="text-xs text-green-700 dark:text-green-300">{photo.do}</p>
                            </div>
                            <div className="rounded-xl border border-red-200 bg-red-50 p-3 dark:border-red-900/40 dark:bg-red-500/5">
                              <p className="mb-1 text-xs font-semibold text-red-700 dark:text-red-400">✗ הימנע/י</p>
                              <p className="text-xs text-red-700 dark:text-red-300">{photo.dont}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 flex gap-2.5">
                      <button type="button" onClick={goBack} className="flex-shrink-0 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-600 transition-colors hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
                        → חזרה
                      </button>
                      <button type="button" onClick={goNext} className="flex-1 rounded-xl bg-gradient-to-l from-rose-500 to-pink-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-rose-500/15 transition-all hover:opacity-90">
                        לסקירת הפרופיל ←
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* ---- STEP 6: Profile Review ---- */}
                {step === 6 && (
                  <motion.div
                    key="step6"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ duration: 0.28 }}
                    className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    <h2 className="mb-1 text-lg font-semibold text-zinc-900 dark:text-white">
                      סקירת הפרופיל
                    </h2>
                    <p className="mb-5 text-sm text-zinc-500 dark:text-zinc-400">
                      ניתוח מלא של הפרופיל שלך עם ציון ועצות לשיפור
                    </p>

                    {/* Analyze button */}
                    {!analysisResult && (
                      <button
                        type="button"
                        onClick={handleSaveAndAnalyze}
                        disabled={isSaving}
                        className="mb-6 w-full rounded-xl bg-gradient-to-l from-rose-500 to-pink-600 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-rose-500/20 transition-all hover:opacity-90 disabled:opacity-60"
                      >
                        {isSaving ? (
                          <span className="flex items-center justify-center gap-2">
                            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            מנתח פרופיל...
                          </span>
                        ) : (
                          "✨ נתח ושמור פרופיל"
                        )}
                      </button>
                    )}

                    {/* Analysis results */}
                    {analysisResult && (
                      <div className="space-y-5">
                        {/* Score ring */}
                        <div className="flex items-center gap-6 rounded-2xl border border-zinc-100 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-800/50">
                          <div className="relative flex h-24 w-24 shrink-0 items-center justify-center">
                            <svg className="h-24 w-24 -rotate-90" viewBox="0 0 100 100">
                              <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="8" className="text-zinc-200 dark:text-zinc-700" />
                              <circle
                                cx="50"
                                cy="50"
                                r="40"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="8"
                                strokeDasharray={`${2 * Math.PI * 40}`}
                                strokeDashoffset={`${2 * Math.PI * 40 * (1 - analysisResult.score / 100)}`}
                                strokeLinecap="round"
                                className={`transition-all duration-1000 ${analysisResult.score >= 70 ? "text-green-500" : analysisResult.score >= 40 ? "text-amber-500" : "text-rose-500"}`}
                              />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <span className="text-2xl font-bold text-zinc-900 dark:text-white">{analysisResult.score}</span>
                              <span className="text-xs text-zinc-500">/100</span>
                            </div>
                          </div>
                          <div>
                            <p className={`mb-1 text-lg font-bold ${analysisResult.score >= 70 ? "text-green-600 dark:text-green-400" : analysisResult.score >= 40 ? "text-amber-600 dark:text-amber-400" : "text-rose-600 dark:text-rose-400"}`}>
                              {analysisResult.score >= 70 ? "פרופיל מצוין!" : analysisResult.score >= 40 ? "פרופיל טוב" : "יש מה לשפר"}
                            </p>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">
                              ציון שלמות ואיכות הפרופיל שלך
                            </p>
                          </div>
                        </div>

                        {/* Breakdown */}
                        <div className="space-y-2">
                          {analysisResult.breakdown.map((item) => (
                            <div key={item.section} className="rounded-xl border border-zinc-100 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-800/50">
                              <div className="mb-1.5 flex items-center justify-between">
                                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{item.section}</span>
                                <span className="text-sm font-semibold text-zinc-900 dark:text-white">{item.points}/{item.max}</span>
                              </div>
                              <div className="mb-1.5 h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
                                <div
                                  className="h-full rounded-full bg-gradient-to-l from-rose-500 to-pink-600 transition-all duration-700"
                                  style={{ width: `${(item.points / item.max) * 100}%` }}
                                />
                              </div>
                              {item.points < item.max && (
                                <p className="text-xs text-zinc-500">{item.tip}</p>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Quality tips */}
                        {analysisResult.qualityTips.length > 0 && (
                          <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-4 dark:border-amber-900/30 dark:bg-amber-500/5">
                            <h4 className="mb-2 text-sm font-semibold text-amber-800 dark:text-amber-300">💡 המלצות לשיפור</h4>
                            <ul className="space-y-1.5">
                              {analysisResult.qualityTips.map((tip, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-amber-700 dark:text-amber-300">
                                  <span className="mt-0.5 shrink-0">•</span>
                                  {tip}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Save feedback */}
                        {savedFeedback && (
                          <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700 dark:border-green-900/40 dark:bg-green-500/5 dark:text-green-400">
                            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            הפרופיל נשמר בהצלחה!
                          </div>
                        )}

                        {/* Action buttons */}
                        <div className="flex gap-2.5">
                          <button
                            type="button"
                            onClick={goBack}
                            className="flex-1 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-600 transition-colors hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
                          >
                            → ערוך פרופיל
                          </button>
                          <Link
                            href="/chat"
                            className="flex-1 rounded-xl bg-gradient-to-l from-rose-500 to-pink-600 px-4 py-3 text-center text-sm font-semibold text-white shadow-md shadow-rose-500/15 transition-all hover:opacity-90"
                          >
                            שתף עם מאמן ←
                          </Link>
                        </div>
                      </div>
                    )}

                    {!analysisResult && (
                      <button
                        type="button"
                        onClick={goBack}
                        className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-600 transition-colors hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
                      >
                        → חזרה לעריכה
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right column - Preview + Tips */}
            <div className="flex flex-col gap-5 lg:col-span-2">
              {/* Profile Preview */}
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-400">
                  תצוגה מקדימה
                </p>
                <ProfilePreview
                  displayName={profile.displayName}
                  age={profile.age ? Number(profile.age) : undefined}
                  location={profile.location}
                  bio={profile.bio}
                  interests={profile.interests}
                  customInterests={profile.customInterests}
                  lookingFor={profile.lookingFor}
                  score={analysisResult?.score}
                />
              </div>

              {/* Tips panel */}
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-400">
                  טיפים לשלב זה
                </p>
                <ProfileTips tips={tips} isLoading={tips === undefined} />
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
