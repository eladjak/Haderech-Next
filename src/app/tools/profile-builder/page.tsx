"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useAction } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { motion, AnimatePresence } from "framer-motion";

// -----------------------------------------------
// Types
// -----------------------------------------------

type Platform = "tinder" | "bumble" | "hinge" | "okcupid" | "general";
type RelationshipType = "serious" | "casual" | "open" | "marriage";

interface FormData {
  platform: Platform;
  age: string;
  profession: string;
  hobbies: string;
  thingsYouLove: string;
  lookingFor: RelationshipType | "";
  partnerQualities: string;
}

// -----------------------------------------------
// Constants
// -----------------------------------------------

const PLATFORMS: { value: Platform; label: string; emoji: string; description: string }[] = [
  { value: "tinder", label: "Tinder", emoji: "🔥", description: "קצר ומושך" },
  { value: "bumble", label: "Bumble", emoji: "🐝", description: "עם אישיות" },
  { value: "hinge", label: "Hinge", emoji: "💎", description: "תשובות לשאלות" },
  { value: "okcupid", label: "OkCupid", emoji: "🎯", description: "מפורט ועמוק" },
  { value: "general", label: "כללי", emoji: "✨", description: "לכל פלטפורמה" },
];

const RELATIONSHIP_TYPES: { value: RelationshipType; label: string }[] = [
  { value: "serious", label: "זוגיות רצינית" },
  { value: "casual", label: "היכרות קלילה" },
  { value: "open", label: "פתוח לכל אפשרות" },
  { value: "marriage", label: "חתונה ומשפחה" },
];

const STEP_LABELS = ["פלטפורמה", "עלייך", "מחפש", "ביוגרפיה", "עריכה"];
const TOTAL_STEPS = 5;

// -----------------------------------------------
// Component
// -----------------------------------------------

export default function ProfileBuilderPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    platform: "tinder",
    age: "",
    profession: "",
    hobbies: "",
    thingsYouLove: "",
    lookingFor: "",
    partnerQualities: "",
  });
  const [bios, setBios] = useState<string[]>([]);
  const [selectedBioIndex, setSelectedBioIndex] = useState(0);
  const [editedBio, setEditedBio] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedBio, setCopiedBio] = useState(false);

  const generateBio = useAction(api.tools.generateProfileBio);

  const handleNext = useCallback(() => {
    setStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
  }, []);

  const handleBack = useCallback(() => {
    setStep((prev) => Math.max(prev - 1, 1));
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!formData.age || !formData.profession || !formData.hobbies || !formData.lookingFor) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await generateBio({
        platform: formData.platform,
        age: parseInt(formData.age, 10),
        profession: formData.profession,
        hobbies: formData.hobbies,
        thingsYouLove: formData.thingsYouLove,
        lookingFor: formData.lookingFor,
        partnerQualities: formData.partnerQualities,
      });
      setBios(result);
      setSelectedBioIndex(0);
      setEditedBio(result[0] ?? "");
      setStep(4);
    } catch (err) {
      setError("שגיאה ביצירת הביו. נסה שוב.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [generateBio, formData]);

  const handleSelectBio = useCallback(
    (index: number) => {
      setSelectedBioIndex(index);
      setEditedBio(bios[index] ?? "");
    },
    [bios]
  );

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(editedBio);
    setCopiedBio(true);
    setTimeout(() => setCopiedBio(false), 2000);
  }, [editedBio]);

  const isStep3Valid =
    formData.age.trim() !== "" &&
    formData.profession.trim() !== "" &&
    formData.hobbies.trim() !== "";

  return (
    <div className="min-h-dvh bg-white dark:bg-zinc-950" dir="rtl">
      <Header />

      <main className="container mx-auto px-4 py-10">
        <div className="mx-auto max-w-xl">
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
          <div className="mb-6">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20">
              <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
            <h1 className="mb-1 text-3xl font-bold text-zinc-900 dark:text-white">בונה הפרופיל</h1>
            <p className="text-zinc-500 dark:text-zinc-400">
              AI כותב לך ביו מקצועי שמושך תשומת לב
            </p>
          </div>

          {/* Step indicator */}
          <div className="mb-8">
            <div className="mb-2 flex items-center justify-between text-xs text-zinc-400">
              {STEP_LABELS.map((label, i) => (
                <span
                  key={i}
                  className={`${step > i + 1 ? "text-indigo-500" : step === i + 1 ? "font-semibold text-indigo-600 dark:text-indigo-400" : ""}`}
                >
                  {label}
                </span>
              ))}
            </div>
            <div className="flex gap-1">
              {STEP_LABELS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                    i < step ? "bg-indigo-500" : "bg-zinc-100 dark:bg-zinc-800"
                  }`}
                />
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {/* ---- STEP 1: Platform ---- */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">
                  באיזה פלטפורמה תשתמש?
                </h2>
                <div className="mb-8 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {PLATFORMS.map((platform) => (
                    <button
                      key={platform.value}
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, platform: platform.value }))
                      }
                      className={`flex items-center gap-3 rounded-xl border px-4 py-3.5 text-right transition-all ${
                        formData.platform === platform.value
                          ? "border-indigo-500 bg-indigo-50 dark:border-indigo-400 dark:bg-indigo-500/10"
                          : "border-zinc-200 bg-white hover:border-indigo-200 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-indigo-800"
                      }`}
                    >
                      <span className="text-2xl">{platform.emoji}</span>
                      <div>
                        <div className={`font-semibold ${formData.platform === platform.value ? "text-indigo-700 dark:text-indigo-300" : "text-zinc-800 dark:text-zinc-200"}`}>
                          {platform.label}
                        </div>
                        <div className="text-xs text-zinc-400">{platform.description}</div>
                      </div>
                      {formData.platform === platform.value && (
                        <div className="mr-auto flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500">
                          <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleNext}
                  className="w-full rounded-xl bg-gradient-to-l from-indigo-500 to-purple-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:opacity-90"
                >
                  המשך ←
                </button>
              </motion.div>
            )}

            {/* ---- STEP 2: About you ---- */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">
                  ספר/י על עצמך
                </h2>
                <div className="mb-4 space-y-3.5">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      גיל
                    </label>
                    <input
                      type="number"
                      min={18}
                      max={99}
                      value={formData.age}
                      onChange={(e) => setFormData((prev) => ({ ...prev, age: e.target.value }))}
                      placeholder="28"
                      className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 placeholder-zinc-400 transition-colors focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:placeholder-zinc-500 dark:focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      מקצוע / תחום עיסוק
                    </label>
                    <input
                      type="text"
                      value={formData.profession}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, profession: e.target.value }))
                      }
                      placeholder="מהנדס תוכנה, מעצב/ת גרפי, מורה..."
                      className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 placeholder-zinc-400 transition-colors focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:placeholder-zinc-500 dark:focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      תחביבים ותשוקות
                    </label>
                    <input
                      type="text"
                      value={formData.hobbies}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, hobbies: e.target.value }))
                      }
                      placeholder="טיולים, בישול, גיטרה, ריצה, קריאה..."
                      className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 placeholder-zinc-400 transition-colors focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:placeholder-zinc-500 dark:focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      3 דברים שאתה/את מאוד אוהב/ת
                    </label>
                    <textarea
                      rows={3}
                      value={formData.thingsYouLove}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, thingsYouLove: e.target.value }))
                      }
                      placeholder="קפה בבוקר עם ספר טוב, שקיעות על חוף הים, ערבי שישי ארוכים עם משפחה..."
                      className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 placeholder-zinc-400 transition-colors focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:placeholder-zinc-500 dark:focus:border-indigo-500"
                    />
                  </div>
                </div>
                <div className="flex gap-2.5">
                  <button
                    onClick={handleBack}
                    className="flex-1 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-600 transition-colors hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400"
                  >
                    → חזרה
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={!formData.age || !formData.profession || !formData.hobbies}
                    className="flex-1 rounded-xl bg-gradient-to-l from-indigo-500 to-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-500/15 transition-all hover:opacity-90 disabled:opacity-40"
                  >
                    המשך ←
                  </button>
                </div>
              </motion.div>
            )}

            {/* ---- STEP 3: What you're looking for ---- */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">
                  מה אתה/את מחפש/ת?
                </h2>
                <div className="mb-4 space-y-3">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      סוג הקשר שאתה/את מחפש/ת
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {RELATIONSHIP_TYPES.map((type) => (
                        <button
                          key={type.value}
                          onClick={() =>
                            setFormData((prev) => ({ ...prev, lookingFor: type.value }))
                          }
                          className={`rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                            formData.lookingFor === type.value
                              ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-500/10 dark:text-indigo-300"
                              : "border-zinc-200 bg-white text-zinc-600 hover:border-indigo-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-indigo-800"
                          }`}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      תכונות חשובות בפרטנר (אופציונלי)
                    </label>
                    <textarea
                      rows={3}
                      value={formData.partnerQualities}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, partnerQualities: e.target.value }))
                      }
                      placeholder="אמין, בעל הומור, אוהב חיות, עצמאי, חם ואכפתי..."
                      className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 placeholder-zinc-400 transition-colors focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:placeholder-zinc-500 dark:focus:border-indigo-500"
                    />
                  </div>
                </div>

                {error && (
                  <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
                    {error}
                  </div>
                )}

                <div className="flex gap-2.5">
                  <button
                    onClick={handleBack}
                    className="flex-1 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-600 transition-colors hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400"
                  >
                    → חזרה
                  </button>
                  <button
                    onClick={handleGenerate}
                    disabled={!isStep3Valid || !formData.lookingFor || isLoading}
                    className="flex-1 rounded-xl bg-gradient-to-l from-indigo-500 to-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-500/15 transition-all hover:opacity-90 disabled:opacity-40"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        יוצר ביו...
                      </span>
                    ) : (
                      "✨ צור ביו"
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {/* ---- STEP 4: Choose bio ---- */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-white">
                  3 גרסאות לביו שלך
                </h2>
                <p className="mb-5 text-sm text-zinc-500 dark:text-zinc-400">
                  בחר/י את הגרסה שהכי מרגישה לך ועבור לעריכה
                </p>

                <div className="mb-6 space-y-3">
                  {bios.map((bio, i) => {
                    const labels = ["רציני ואמיתי", "קליל ומצחיק", "רומנטי ושירי"];
                    const emojis = ["🎯", "😄", "🌹"];
                    return (
                      <button
                        key={i}
                        onClick={() => handleSelectBio(i)}
                        className={`w-full rounded-xl border p-4 text-right transition-all ${
                          selectedBioIndex === i
                            ? "border-indigo-500 bg-indigo-50 dark:border-indigo-400 dark:bg-indigo-500/10"
                            : "border-zinc-200 bg-white hover:border-indigo-200 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-indigo-800"
                        }`}
                      >
                        <div className="mb-2 flex items-center gap-2">
                          <span>{emojis[i]}</span>
                          <span className={`text-sm font-semibold ${selectedBioIndex === i ? "text-indigo-700 dark:text-indigo-300" : "text-zinc-700 dark:text-zinc-300"}`}>
                            {labels[i] ?? `גרסה ${i + 1}`}
                          </span>
                          {selectedBioIndex === i && (
                            <span className="mr-auto flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500">
                              <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            </span>
                          )}
                        </div>
                        <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                          {bio}
                        </p>
                      </button>
                    );
                  })}
                </div>

                <div className="flex gap-2.5">
                  <button
                    onClick={() => setStep(3)}
                    className="flex-shrink-0 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-600 transition-colors hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400"
                  >
                    → צור שוב
                  </button>
                  <button
                    onClick={() => setStep(5)}
                    className="flex-1 rounded-xl bg-gradient-to-l from-indigo-500 to-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-500/15 transition-all hover:opacity-90"
                  >
                    ✏️ ערוך והשתמש ←
                  </button>
                </div>
              </motion.div>
            )}

            {/* ---- STEP 5: Edit & copy ---- */}
            {step === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-2 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-400">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                    הביו שלך מוכן!
                  </h2>
                </div>
                <p className="mb-5 text-sm text-zinc-500 dark:text-zinc-400">
                  ערוך/י לפי הטעם שלך ואז העתק לפרופיל
                </p>

                <div className="mb-4">
                  <textarea
                    rows={8}
                    value={editedBio}
                    onChange={(e) => setEditedBio(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm leading-relaxed text-zinc-900 transition-colors focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:border-indigo-500"
                  />
                  <div className="mt-1.5 flex justify-between text-xs text-zinc-400">
                    <span>ערוך/י לפי הרצון שלך</span>
                    <span>{editedBio.length} תווים</span>
                  </div>
                </div>

                <button
                  onClick={handleCopy}
                  className={`mb-3 w-full rounded-xl px-6 py-3.5 text-base font-semibold text-white shadow-lg transition-all ${
                    copiedBio
                      ? "bg-green-500 shadow-green-500/20"
                      : "bg-gradient-to-l from-indigo-500 to-purple-600 shadow-indigo-500/20 hover:opacity-90"
                  }`}
                >
                  {copiedBio ? "✓ הועתק!" : "📋 העתק לקליפבורד"}
                </button>

                <div className="flex gap-2.5">
                  <button
                    onClick={() => setStep(4)}
                    className="flex-1 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-600 transition-colors hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400"
                  >
                    → בחר גרסה אחרת
                  </button>
                  <button
                    onClick={() => {
                      setStep(1);
                      setFormData({
                        platform: "tinder",
                        age: "",
                        profession: "",
                        hobbies: "",
                        thingsYouLove: "",
                        lookingFor: "",
                        partnerQualities: "",
                      });
                      setBios([]);
                      setEditedBio("");
                    }}
                    className="flex-1 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-600 transition-colors hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400"
                  >
                    🔄 התחל מחדש
                  </button>
                </div>

                <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 dark:border-indigo-900 dark:bg-indigo-500/5">
                  <p className="text-xs leading-relaxed text-indigo-700 dark:text-indigo-400">
                    <strong>טיפ:</strong> הביו הטוב ביותר הוא זה שמרגיש לך הכי אמיתי. אל תפחד/י לשנות, להוסיף, ולגרום לו להיות שלך באמת.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <Footer />
    </div>
  );
}
