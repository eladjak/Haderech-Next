"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { motion, AnimatePresence } from "framer-motion";

// -----------------------------------------------
// Types
// -----------------------------------------------

type ValueKey =
  | "communication"
  | "trust"
  | "freedom"
  | "family"
  | "career"
  | "adventure"
  | "stability"
  | "romance"
  | "growth"
  | "humor"
  | "intimacy"
  | "spirituality";

interface Question {
  id: number;
  text: string;
  options: { text: string; values: Partial<Record<ValueKey, number>> }[];
}

interface ValueInfo {
  label: string;
  description: string;
  color: string;
  emoji: string;
}

// -----------------------------------------------
// Data
// -----------------------------------------------

const VALUE_INFO: Record<ValueKey, ValueInfo> = {
  communication: {
    label: "תקשורת",
    description: "שיחות עמוקות, כנות ופתיחות הדדית הם הבסיס לכל.",
    color: "#3B82F6",
    emoji: "💬",
  },
  trust: {
    label: "אמון",
    description: "ביטחון, יציבות ואמינות הם הדברים הכי חשובים לך.",
    color: "#8B5CF6",
    emoji: "🤝",
  },
  freedom: {
    label: "חופש אישי",
    description: "מרחב אישי ועצמאות הם חיוניים לך גם בתוך זוגיות.",
    color: "#10B981",
    emoji: "🕊️",
  },
  family: {
    label: "משפחה",
    description: "בניית בית, ילדים וקשרים משפחתיים חזקים הם מרכזיים.",
    color: "#F59E0B",
    emoji: "👨‍👩‍👧‍👦",
  },
  career: {
    label: "קריירה",
    description: "שאיפות מקצועיות, הצלחה ותמיכה בצמיחה אישית.",
    color: "#6366F1",
    emoji: "💼",
  },
  adventure: {
    label: "הרפתקאות",
    description: "חוויות חדשות, טיולים ורגעים בלתי נשכחים יחד.",
    color: "#EF4444",
    emoji: "🏔️",
  },
  stability: {
    label: "יציבות",
    description: "שגרה, תכנון לטווח ארוך ובסיס כלכלי ורגשי איתן.",
    color: "#14B8A6",
    emoji: "⚓",
  },
  romance: {
    label: "רומנטיקה",
    description: "רגעים מיוחדים, מחוות אהבה ושמירה על הניצוץ.",
    color: "#EC4899",
    emoji: "🌹",
  },
  growth: {
    label: "צמיחה",
    description: "ללמוד יחד, להתפתח ולתמוך בחלומות זה של זה.",
    color: "#84CC16",
    emoji: "🌱",
  },
  humor: {
    label: "הומור",
    description: "צחוק, קלילות ויכולת לשחק יחד הם המפתח לאושר.",
    color: "#F97316",
    emoji: "😄",
  },
  intimacy: {
    label: "אינטימיות",
    description: "קרבה רגשית ופיזית, חיבור עמוק ופגיעות הדדית.",
    color: "#DB2777",
    emoji: "💕",
  },
  spirituality: {
    label: "רוחניות",
    description: "ערכים משותפים, אמונה ומשמעות עמוקה יותר בחיים.",
    color: "#7C3AED",
    emoji: "✨",
  },
};

const QUESTIONS: Question[] = [
  {
    id: 1,
    text: "שאתם נסגרים בדירה ביחד לסוף שבוע - מה הכי מפתה אתכם?",
    options: [
      { text: "שיחות עמוקות עד השעות הקטנות", values: { communication: 3, intimacy: 2 } },
      { text: "טיול ספונטני לאן שיוביל הלב", values: { adventure: 3, freedom: 1 } },
      { text: "סדרה מרתקת עם אוכל טוב ושלווה", values: { stability: 3, humor: 1 } },
      { text: "ארוחת שבת ביחד עם משפחה", values: { family: 3, stability: 1 } },
    ],
  },
  {
    id: 2,
    text: "בן/בת הזוג קיבל/ה הצעת עבודה מצוינת - בחוץ לארץ. איך תגיבו?",
    options: [
      { text: "הרפתקה! נלך יחד!", values: { adventure: 3, freedom: 2 } },
      { text: "נשוחח רצינית - שניים מחליטים", values: { communication: 3, trust: 2 } },
      { text: "קשה... לא בטוח שאוכל לעזוב משפחה", values: { family: 3, stability: 2 } },
      { text: "נמשיך לחשוב - הקריירה שלו/שלה חשובה", values: { career: 3, growth: 1 } },
    ],
  },
  {
    id: 3,
    text: "ביום יום, מה שמשמח אתכם הכי הרבה בזוגיות?",
    options: [
      { text: "מסרון אחד קטן באמצע היום שמחמם את הלב", values: { romance: 3, communication: 1 } },
      { text: "שאפשר לסמוך שהדברים ייעשו ללא תזכורות", values: { trust: 3, stability: 2 } },
      { text: "צחוק על בדיחות פנימיות שרק אנחנו מבינים", values: { humor: 3, intimacy: 1 } },
      { text: "שמגדלים יחד - קריירה, תחביבים, חלומות", values: { growth: 3, career: 1 } },
    ],
  },
  {
    id: 4,
    text: "כשיש ויכוח - מה הכי חשוב לכם?",
    options: [
      { text: "לפתור את זה עכשיו, לא לשכב עם טינה", values: { communication: 3, trust: 1 } },
      { text: "מרחב להירגע לפני שמדברים", values: { freedom: 3, stability: 1 } },
      { text: "שהצד השני יבין באמת מה הרגשתי", values: { intimacy: 3, communication: 2 } },
      { text: "למצוא פתרון הגיוני שמתאים לשניים", values: { trust: 2, stability: 2 } },
    ],
  },
  {
    id: 5,
    text: "חבר מתחתן - מה המתנה שהכי מתאימה לכם לתת?",
    options: [
      { text: "חוויה משותפת - ארוחה, טיול, ספא", values: { adventure: 2, romance: 2 } },
      { text: "כסף - פרקטי ויכול לקנות מה שצריכים", values: { stability: 3, career: 1 } },
      { text: "משהו אישי ומיוחד שחשבתם עליו", values: { intimacy: 2, romance: 3 } },
      { text: "דבר שיעזור להם בבית ובחיי היום-יום", values: { family: 3, stability: 2 } },
    ],
  },
  {
    id: 6,
    text: "מה לדעתכם ה'דבק' שמחזיק זוגות לאורך שנים?",
    options: [
      { text: "כבוד הדדי ואמון מוחלט", values: { trust: 3, communication: 2 } },
      { text: "הומור ויכולת לצחוק יחד גם בקשיים", values: { humor: 3, intimacy: 1 } },
      { text: "ערכים משותפים ומטרות בחיים", values: { spirituality: 3, family: 2 } },
      { text: "עדכון מתמיד - לא לקחת זה את זה כמובן מאליו", values: { romance: 3, growth: 2 } },
    ],
  },
  {
    id: 7,
    text: "לאיזה חוויה הייתם מחכים הכי הרבה?",
    options: [
      { text: "שנה כחופשיים ברחבי העולם", values: { adventure: 3, freedom: 2 } },
      { text: "לבנות יחד בית חלומות בסביבה ירוקה", values: { family: 2, stability: 3 } },
      { text: "לפתח ביחד פרויקט/עסק שמדליק אתכם", values: { career: 3, growth: 2 } },
      { text: "נסיגה רוחנית - מדיטציה, טבע, שקט", values: { spirituality: 3, intimacy: 1 } },
    ],
  },
  {
    id: 8,
    text: "בן/בת הזוג רוצה לבלות ערב עם חברים ללא כם. מה תרגישו?",
    options: [
      { text: "מצוין! גם לי מגיע זמן לעצמי", values: { freedom: 3, trust: 1 } },
      { text: "בסדר גמור - בטחון הוא הבסיס", values: { trust: 3, stability: 1 } },
      { text: "אשמח לדעת מה מתוכנן ועם מי", values: { communication: 2, trust: 2 } },
      { text: "יצטער/צטערת קצת - אני אוהב/ת להיות ביחד", values: { romance: 2, intimacy: 2 } },
    ],
  },
  {
    id: 9,
    text: "מה הגדרתכם לרומנטיקה אמיתית?",
    options: [
      { text: "הפתעות ספונטניות ומחוות מיוחדות", values: { romance: 3, adventure: 1 } },
      { text: "נוכחות מלאה - להיות שם כשצריך", values: { intimacy: 3, trust: 2 } },
      { text: "לדעת בדיוק מה האחר/ת צריך/ה ולהביא את זה", values: { communication: 3, intimacy: 2 } },
      { text: "לחגוג יחד כל ניצחון קטן בחיים", values: { humor: 2, romance: 2 } },
    ],
  },
  {
    id: 10,
    text: "בסוף יום קשה, מה הכי מנחם אתכם?",
    options: [
      { text: "חיבוק ארוך בלי מילים", values: { intimacy: 3, romance: 2 } },
      { text: "לשפוך את הלב ולקבל אוזן קשבת", values: { communication: 3, trust: 1 } },
      { text: "בדיחה שישברו את המתח", values: { humor: 3, freedom: 1 } },
      { text: "לדעת שיש תוכנית ושהכל ייפתר", values: { stability: 3, trust: 2 } },
    ],
  },
  {
    id: 11,
    text: "מה יגרום לכם לאהוב יותר את בן/בת הזוג שלכם?",
    options: [
      { text: "כשהוא/היא גדל/ה ומתפתח/ת כל הזמן", values: { growth: 3, career: 1 } },
      { text: "כשהוא/היא מוקסם/ת ממשפחה ורוצה לבנות", values: { family: 3, stability: 1 } },
      { text: "כשהוא/היא נאמן/ה ועקבי/ת", values: { trust: 3, stability: 2 } },
      { text: "כשהוא/היא מסוגל/ת לפגיעות ופתיחות", values: { intimacy: 3, communication: 2 } },
    ],
  },
  {
    id: 12,
    text: "איך אתם מחליטים על רכישה גדולה - דירה, רכב, חופשה יקרה?",
    options: [
      { text: "שיחה מעמיקה עד שמגיעים להחלטה משותפת", values: { communication: 3, trust: 2 } },
      { text: "כל אחד מביע דעה ואז מגיעים לפשרה", values: { freedom: 2, stability: 2 } },
      { text: "מי שיודע יותר - מוביל", values: { trust: 2, career: 2 } },
      { text: "לפי מה שטוב למשפחה כולה", values: { family: 3, stability: 2 } },
    ],
  },
  {
    id: 13,
    text: "מה הדבר שהכי מפחיד אתכם בזוגיות?",
    options: [
      { text: "לאבד את העצמאות שלי", values: { freedom: 3, adventure: 1 } },
      { text: "אי-נאמנות ובגידה", values: { trust: 3, intimacy: 1 } },
      { text: "להפוך לשגרתיים ומשעממים", values: { romance: 3, adventure: 2 } },
      { text: "לא להסכים על ילדים ועתיד", values: { family: 3, communication: 2 } },
    ],
  },
  {
    id: 14,
    text: "מה היה אומר עליכם הפרטנר האידיאלי אחרי שנה יחד?",
    options: [
      { text: "שהוא/היא עשה/תה אותי לגרסה טובה יותר של עצמי", values: { growth: 3, spirituality: 1 } },
      { text: "שהוא/היא הפך/הפכה לחבר הכי טוב שלי", values: { humor: 2, intimacy: 2, communication: 2 } },
      { text: "שהוא/היא תמיד שם/שמה בשבילי", values: { trust: 3, stability: 2 } },
      { text: "שהחיים שלנו הם הרפתקה אחת ארוכה ומגניבה", values: { adventure: 3, romance: 2 } },
    ],
  },
  {
    id: 15,
    text: "איזה משפט מתאר לכם הכי טוב את הזוגיות שאתם רוצים?",
    options: [
      { text: "שני אנשים שלמים שבוחרים זה בזה כל יום מחדש", values: { freedom: 2, trust: 2, growth: 1 } },
      { text: "בית חם, ילדים, ושגרה שמחה ביחד", values: { family: 3, stability: 3 } },
      { text: "שותפים לחיים שתמיד מצחיקים זה את זה", values: { humor: 3, communication: 1 } },
      { text: "אהבה גדולה שמתחדשת כל הזמן", values: { romance: 3, intimacy: 2 } },
    ],
  },
];

// -----------------------------------------------
// Component
// -----------------------------------------------

export default function ValuesQuizPage() {
  const [phase, setPhase] = useState<"intro" | "quiz" | "results">("intro");
  const [currentQ, setCurrentQ] = useState(0);
  const [scores, setScores] = useState<Record<ValueKey, number>>({
    communication: 0, trust: 0, freedom: 0, family: 0, career: 0, adventure: 0,
    stability: 0, romance: 0, growth: 0, humor: 0, intimacy: 0, spirituality: 0,
  });
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);

  const handleStart = useCallback(() => {
    setPhase("quiz");
    setCurrentQ(0);
    setScores({
      communication: 0, trust: 0, freedom: 0, family: 0, career: 0, adventure: 0,
      stability: 0, romance: 0, growth: 0, humor: 0, intimacy: 0, spirituality: 0,
    });
    setAnswers([]);
    setSelectedOption(null);
  }, []);

  const handleSelectOption = useCallback((optionIndex: number) => {
    setSelectedOption(optionIndex);
  }, []);

  const handleNext = useCallback(() => {
    if (selectedOption === null) return;

    const question = QUESTIONS[currentQ];
    const option = question.options[selectedOption];

    // Accumulate scores
    setScores((prev) => {
      const next = { ...prev };
      for (const [key, val] of Object.entries(option.values)) {
        next[key as ValueKey] = (next[key as ValueKey] ?? 0) + (val ?? 0);
      }
      return next;
    });

    setAnswers((prev) => [...prev, selectedOption]);
    setSelectedOption(null);

    if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ((prev) => prev + 1);
    } else {
      setPhase("results");
    }
  }, [selectedOption, currentQ]);

  const handleRestart = useCallback(() => {
    setPhase("intro");
    setCurrentQ(0);
    setSelectedOption(null);
    setAnswers([]);
  }, []);

  const topValues = Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([key, score]) => ({
      key: key as ValueKey,
      score,
      ...VALUE_INFO[key as ValueKey],
    }));

  const maxScore = topValues[0]?.score ?? 1;

  const progressPercent = Math.round(((currentQ) / QUESTIONS.length) * 100);

  const handleShare = useCallback(async () => {
    const text = `גיליתי את הערכים הכי חשובים לי בזוגיות דרך "מבחן ערכים" של הדרך!\n\nהערכים המובילים שלי:\n${topValues
      .slice(0, 3)
      .map((v, i) => `${i + 1}. ${v.emoji} ${v.label}`)
      .join("\n")}\n\nגלה את הערכים שלך: הדרך.co.il/tools/values-quiz`;
    try {
      await navigator.share({ text });
    } catch {
      await navigator.clipboard.writeText(text);
    }
  }, [topValues]);

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

          <AnimatePresence mode="wait">
            {/* ---- INTRO ---- */}
            {phase === "intro" && (
              <motion.div
                key="intro"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-red-500 shadow-lg shadow-pink-500/20">
                  <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                </div>
                <h1 className="mb-2 text-3xl font-bold text-zinc-900 dark:text-white">מבחן ערכים</h1>
                <p className="mb-6 text-zinc-500 dark:text-zinc-400">
                  15 שאלות שיחשפו לך את הערכים הכי חשובים בזוגיות ואת מה שאתה/את באמת מחפש/ת.
                </p>

                <div className="mb-8 rounded-2xl border border-zinc-100 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900/60">
                  <h2 className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">מה תגלה:</h2>
                  <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                    <li className="flex items-center gap-2">
                      <span className="text-pink-500">✦</span>
                      5 הערכים החשובים ביותר לך בזוגיות
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-pink-500">✦</span>
                      הסבר אישי על כל ערך ומה הוא אומר עלייך
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-pink-500">✦</span>
                      ויזואליזציה של פרופיל הערכים שלך
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-pink-500">✦</span>
                      אפשרות לשתף עם פרטנר
                    </li>
                  </ul>
                </div>

                <button
                  onClick={handleStart}
                  className="w-full rounded-xl bg-gradient-to-l from-pink-500 to-red-500 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-pink-500/20 transition-all hover:opacity-90"
                >
                  ❤️ התחל את המבחן
                </button>
              </motion.div>
            )}

            {/* ---- QUIZ ---- */}
            {phase === "quiz" && (
              <motion.div
                key={`quiz-${currentQ}`}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.25 }}
              >
                {/* Progress */}
                <div className="mb-6">
                  <div className="mb-2 flex items-center justify-between text-sm text-zinc-500 dark:text-zinc-400">
                    <span>שאלה {currentQ + 1} מתוך {QUESTIONS.length}</span>
                    <span>{progressPercent}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-l from-pink-500 to-red-500"
                      initial={{ width: `${progressPercent}%` }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 0.4 }}
                    />
                  </div>
                </div>

                {/* Question */}
                <div className="mb-6 rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                  <p className="text-lg font-semibold leading-relaxed text-zinc-900 dark:text-white">
                    {QUESTIONS[currentQ].text}
                  </p>
                </div>

                {/* Options */}
                <div className="mb-6 space-y-2.5">
                  {QUESTIONS[currentQ].options.map((option, i) => (
                    <button
                      key={i}
                      onClick={() => handleSelectOption(i)}
                      className={`w-full rounded-xl border px-5 py-3.5 text-right text-sm font-medium transition-all ${
                        selectedOption === i
                          ? "border-pink-500 bg-pink-50 text-pink-700 dark:border-pink-400 dark:bg-pink-500/10 dark:text-pink-300"
                          : "border-zinc-200 bg-white text-zinc-700 hover:border-pink-200 hover:bg-pink-50/50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-pink-800 dark:hover:bg-pink-500/5"
                      }`}
                    >
                      {option.text}
                    </button>
                  ))}
                </div>

                {/* Next button */}
                <button
                  onClick={handleNext}
                  disabled={selectedOption === null}
                  className="w-full rounded-xl bg-gradient-to-l from-pink-500 to-red-500 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-pink-500/20 transition-all hover:opacity-90 disabled:opacity-40"
                >
                  {currentQ < QUESTIONS.length - 1 ? "השאלה הבאה ←" : "סיים וראה תוצאות ✨"}
                </button>

                {/* Back button */}
                {currentQ > 0 && (
                  <button
                    onClick={() => {
                      setCurrentQ((prev) => prev - 1);
                      setSelectedOption(answers[currentQ - 1] ?? null);
                    }}
                    className="mt-3 w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-500 transition-colors hover:text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400"
                  >
                    → שאלה קודמת
                  </button>
                )}
              </motion.div>
            )}

            {/* ---- RESULTS ---- */}
            {phase === "results" && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="mb-6 text-center">
                  <div className="mb-2 text-5xl">🌟</div>
                  <h2 className="mb-2 text-2xl font-bold text-zinc-900 dark:text-white">
                    פרופיל הערכים שלך
                  </h2>
                  <p className="text-zinc-500 dark:text-zinc-400">
                    אלו הערכים הכי חשובים לך בזוגיות
                  </p>
                </div>

                {/* Top values bars */}
                <div className="mb-6 space-y-3">
                  {topValues.map((value, i) => (
                    <motion.div
                      key={value.key}
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.08 }}
                      className="rounded-xl border border-zinc-100 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{value.emoji}</span>
                          <span className="font-semibold text-zinc-900 dark:text-white">
                            {i === 0 && <span className="ml-1.5 text-xs font-normal text-pink-500">ערך מוביל</span>}
                            {value.label}
                          </span>
                        </div>
                        <span className="text-xs text-zinc-400">#{i + 1}</span>
                      </div>
                      <div className="mb-2 h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: value.color }}
                          initial={{ width: 0 }}
                          animate={{ width: `${(value.score / maxScore) * 100}%` }}
                          transition={{ duration: 0.6, delay: i * 0.1 }}
                        />
                      </div>
                      <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                        {value.description}
                      </p>
                    </motion.div>
                  ))}
                </div>

                {/* Action buttons */}
                <div className="space-y-2.5">
                  <button
                    onClick={handleShare}
                    className="w-full rounded-xl bg-gradient-to-l from-pink-500 to-red-500 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-pink-500/20 transition-all hover:opacity-90"
                  >
                    📤 שתף את התוצאות
                  </button>
                  <button
                    onClick={handleRestart}
                    className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-600 transition-colors hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-zinc-600"
                  >
                    🔄 עשה את המבחן שוב
                  </button>
                  <Link
                    href="/tools/conversation-starters"
                    className="flex w-full items-center justify-center rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm font-medium text-brand-600 transition-colors hover:bg-brand-100 dark:border-brand-800 dark:bg-brand-500/10 dark:text-brand-400 dark:hover:bg-brand-500/15"
                  >
                    💬 נסה גם את פותחי השיחה
                  </Link>
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
