"use client";

import { useState, useCallback, useMemo } from "react";
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
    description: "בתשובות שבחרת הופיעה העדפה לשיחה, כנות ובהירות הדדית.",
    color: "#3B82F6",
    emoji: "💬",
  },
  trust: {
    label: "אמון",
    description: "בתשובות שבחרת הופיעה העדפה לאמינות, עקביות ותחושת ביטחון.",
    color: "#8B5CF6",
    emoji: "🤝",
  },
  freedom: {
    label: "חופש אישי",
    description: "בתשובות שבחרת הופיעה העדפה למרחב, בחירה ועצמאות בתוך קשר.",
    color: "#10B981",
    emoji: "🕊️",
  },
  family: {
    label: "משפחה",
    description: "בתשובות שבחרת הופיעה העדפה לבית ולקשרי משפחה; מבנה המשפחה יכול להיראות בדרכים שונות.",
    color: "#F59E0B",
    emoji: "👨‍👩‍👧‍👦",
  },
  career: {
    label: "קריירה",
    description: "בתשובות שבחרת הופיעה העדפה לעשייה מקצועית ולתמיכה במטרות אישיות.",
    color: "#6366F1",
    emoji: "💼",
  },
  adventure: {
    label: "הרפתקאות",
    description: "בתשובות שבחרת הופיעה העדפה לחידוש, חוויות וגמישות.",
    color: "#EF4444",
    emoji: "🏔️",
  },
  stability: {
    label: "יציבות",
    description: "בתשובות שבחרת הופיעה העדפה לשגרה, תכנון ויציבות מעשית או רגשית.",
    color: "#14B8A6",
    emoji: "⚓",
  },
  romance: {
    label: "רומנטיקה",
    description: "בתשובות שבחרת הופיעה העדפה למחוות חיבה ולזמן זוגי מיוחד.",
    color: "#EC4899",
    emoji: "🌹",
  },
  growth: {
    label: "צמיחה",
    description: "בתשובות שבחרת הופיעה העדפה ללמידה ולתמיכה הדדית במטרות.",
    color: "#84CC16",
    emoji: "🌱",
  },
  humor: {
    label: "הומור",
    description: "בתשובות שבחרת הופיעה העדפה להומור, קלילות ומשחקיות.",
    color: "#F97316",
    emoji: "😄",
  },
  intimacy: {
    label: "אינטימיות",
    description: "בתשובות שבחרת הופיעה העדפה לקרבה רגשית או פיזית שנוצרת בהדדיות ובהסכמה.",
    color: "#DB2777",
    emoji: "💕",
  },
  spirituality: {
    label: "רוחניות",
    description: "בתשובות שבחרת הופיעה העדפה למשמעות, אמונה או שיחה על השקפת עולם.",
    color: "#7C3AED",
    emoji: "✨",
  },
};

const QUESTIONS: Question[] = [
  {
    id: 1,
    text: "אם הייתם בוחרים להעביר סוף שבוע יחד — איזו אפשרות מושכת אתכם כרגע?",
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
    text: "איזה מרכיב הייתם רוצים במיוחד לטפח בקשר לאורך זמן?",
    options: [
      { text: "כבוד הדדי ואמון שנבנה לאורך זמן", values: { trust: 3, communication: 2 } },
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
    text: "אדם בקשר רוצה לבלות ערב עם חברים בלעדיכם. איזו תגובה הכי קרובה למה שאתם מרגישים כרגע?",
    options: [
      { text: "מצוין! גם לי מגיע זמן לעצמי", values: { freedom: 3, trust: 1 } },
      { text: "בסדר גמור - בטחון הוא הבסיס", values: { trust: 3, stability: 1 } },
      { text: "אם צריך, נתאם ציפיות מעשיות בלי לדרוש דיווח", values: { communication: 2, trust: 2 } },
      { text: "יצטער/צטערת קצת - אני אוהב/ת להיות ביחד", values: { romance: 2, intimacy: 2 } },
    ],
  },
  {
    id: 9,
    text: "איזו מחווה מרגישה לכם רומנטית יותר כרגע?",
    options: [
      { text: "הפתעות ספונטניות ומחוות מיוחדות", values: { romance: 3, adventure: 1 } },
      { text: "נוכחות מלאה - להיות שם כשצריך", values: { intimacy: 3, trust: 2 } },
      { text: "לשאול מה האחר/ת צריך/ה ולהקשיב לתשובה", values: { communication: 3, intimacy: 2 } },
      { text: "לחגוג יחד כל ניצחון קטן בחיים", values: { humor: 2, romance: 2 } },
    ],
  },
  {
    id: 10,
    text: "בסוף יום קשה, מה הכי מנחם אתכם?",
    options: [
      { text: "חיבוק, אם הוא רצוי ומתאים באותו רגע", values: { intimacy: 3, romance: 2 } },
      { text: "לשפוך את הלב ולקבל אוזן קשבת", values: { communication: 3, trust: 1 } },
      { text: "בדיחה שישברו את המתח", values: { humor: 3, freedom: 1 } },
      { text: "לדעת שיש תוכנית ושהכל ייפתר", values: { stability: 3, trust: 2 } },
    ],
  },
  {
    id: 11,
    text: "איזו התנהגות הייתם מעריכים במיוחד בקשר?",
    options: [
      { text: "כשהוא/היא גדל/ה ומתפתח/ת כל הזמן", values: { growth: 3, career: 1 } },
      { text: "כשהוא/היא מוקסם/ת ממשפחה ורוצה לבנות", values: { family: 3, stability: 1 } },
      { text: "כשהוא/היא נאמן/ה ועקבי/ת", values: { trust: 3, stability: 2 } },
      { text: "פתיחות מבחירה, בלי חובה לחשוף מעבר למה שנוח", values: { intimacy: 3, communication: 2 } },
    ],
  },
  {
    id: 12,
    text: "איך אתם מחליטים על רכישה גדולה - דירה, רכב, חופשה יקרה?",
    options: [
      { text: "שיחה מעמיקה עד שמגיעים להחלטה משותפת", values: { communication: 3, trust: 2 } },
      { text: "כל אחד מביע דעה ואז מגיעים לפשרה", values: { freedom: 2, stability: 2 } },
      { text: "נבדוק למי יש ידע רלוונטי, ונחליט יחד", values: { trust: 2, career: 2 } },
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
    text: "איך הייתם רוצים לתאר קשר שטוב לכם אחרי שנה?",
    options: [
      { text: "תמכנו זה בזו בצמיחה בלי לנסות לעצב אחד את השנייה", values: { growth: 3, spirituality: 1 } },
      { text: "יש בינינו חברות, הומור ויכולת לדבר", values: { humor: 2, intimacy: 2, communication: 2 } },
      { text: "יכולנו לבקש תמיכה ולכבד גם מגבלות", values: { trust: 3, stability: 2 } },
      { text: "יצרנו יחד חוויות חדשות שמתאימות לשנינו", values: { adventure: 3, romance: 2 } },
    ],
  },
  {
    id: 15,
    text: "איזה משפט הכי קרוב לסוג הקשר שהייתם רוצים כרגע?",
    options: [
      { text: "שני אנשים שיכולים להיעזר זה בזו ולשמור גם על בחירה ועצמאות", values: { freedom: 2, trust: 2, growth: 1 } },
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
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Array<number | null>>(
    () => Array(QUESTIONS.length).fill(null),
  );

  const scores = useMemo<Record<ValueKey, number>>(() => {
    const next: Record<ValueKey, number> = {
      communication: 0, trust: 0, freedom: 0, family: 0, career: 0, adventure: 0,
      stability: 0, romance: 0, growth: 0, humor: 0, intimacy: 0, spirituality: 0,
    };

    answers.forEach((optionIndex, questionIndex) => {
      if (optionIndex === null) return;
      const option = QUESTIONS[questionIndex]?.options[optionIndex];
      if (!option) return;
      for (const [key, value] of Object.entries(option.values)) {
        next[key as ValueKey] += value ?? 0;
      }
    });

    return next;
  }, [answers]);

  const handleStart = useCallback(() => {
    setPhase("quiz");
    setCurrentQ(0);
    setAnswers(Array(QUESTIONS.length).fill(null));
    setSelectedOption(null);
  }, []);

  const handleSelectOption = useCallback((optionIndex: number) => {
    setSelectedOption(optionIndex);
  }, []);

  const handleNext = useCallback(() => {
    if (selectedOption === null) return;
    setAnswers((prev) => {
      const next = [...prev];
      next[currentQ] = selectedOption;
      return next;
    });
    setSelectedOption(null);

    if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ((prev) => prev + 1);
    } else {
      setPhase("results");
    }
  }, [selectedOption, currentQ]);

  const handleSkip = useCallback(() => {
    setAnswers((prev) => {
      const next = [...prev];
      next[currentQ] = null;
      return next;
    });
    setSelectedOption(null);

    if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ((prev) => prev + 1);
    } else {
      setPhase("results");
    }
  }, [currentQ]);

  const handleRestart = useCallback(() => {
    setPhase("intro");
    setCurrentQ(0);
    setSelectedOption(null);
    setAnswers(Array(QUESTIONS.length).fill(null));
  }, []);

  const topValues = Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
    .filter(([, score]) => score > 0)
    .slice(0, 5)
    .map(([key, score]) => ({
      key: key as ValueKey,
      score,
      ...VALUE_INFO[key as ValueKey],
    }));

  const maxScore = topValues[0]?.score ?? 1;

  const progressPercent = Math.round(((currentQ) / QUESTIONS.length) * 100);

  const handleShare = useCallback(async () => {
    const text = `בתרגיל רפלקציה קצר סימנתי כמה העדפות שחשובות לי כרגע. זה אינו מבחן או אבחון, והן יכולות להשתנות.\n\nהנושאים שקיבלו יותר משקל בתשובות שלי:\n${topValues
      .slice(0, 3)
      .map((v, i) => `${i + 1}. ${v.emoji} ${v.label}`)
      .join("\n")}`;
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
                <h1 className="mb-2 text-3xl font-bold text-zinc-900 dark:text-white">תרגיל רפלקציה על ערכים</h1>
                <p className="mb-6 text-zinc-500 dark:text-zinc-400">
                  15 שאלות שיעזרו לך לחשוב מה חשוב לך כרגע בקשר. אפשר לדלג על כל שאלה.
                </p>

                <div className="mb-8 rounded-2xl border border-zinc-100 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900/60">
                  <h2 className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">מה יוצג:</h2>
                  <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                    <li className="flex items-center gap-2">
                      <span className="text-pink-500">✦</span>
                      עד חמישה נושאים שקיבלו יותר משקל בתשובות שבחרת
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-pink-500">✦</span>
                      ניסוח קצר לרפלקציה — לא קביעה על האישיות שלך
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-pink-500">✦</span>
                      המחשה של ניקוד פשוט, לא שאלון מקצועי או מדעי
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-pink-500">✦</span>
                      אפשרות לשתף רק אם זה נוח ומתאים לך
                    </li>
                  </ul>
                  <p className="mt-4 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                    התרגיל לא עבר תיקוף פסיכולוגי, אינו מודד התאמה ואינו מנבא הצלחה בקשר.
                    התוצאה מושפעת רק מהאפשרויות המוגבלות שבחרת כאן ויכולה להשתנות.
                  </p>
                </div>

                <button
                  onClick={handleStart}
                  className="w-full rounded-xl bg-gradient-to-l from-pink-500 to-red-500 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-pink-500/20 transition-all hover:opacity-90"
                >
                  ❤️ התחלת התרגיל
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
                      className="h-full w-full origin-right bg-gradient-to-l from-pink-500 to-red-500"
                      initial={{ scaleX: progressPercent / 100 }}
                      animate={{ scaleX: progressPercent / 100 }}
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

                <button
                  onClick={handleSkip}
                  className="mt-3 w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-500 transition-colors hover:border-zinc-300 hover:text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:text-zinc-200"
                >
                  {currentQ < QUESTIONS.length - 1 ? "דלג/י על השאלה" : "דלג/י וסיים/י"}
                </button>

                {/* Back button */}
                {currentQ > 0 && (
                  <button
                    onClick={() => {
                      setCurrentQ((prev) => prev - 1);
                      setSelectedOption(answers[currentQ - 1]);
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
                    תמונת מצב מהתשובות שבחרת
                  </h2>
                  <p className="text-zinc-500 dark:text-zinc-400">
                    זהו ניקוד רפלקטיבי פשוט — לא דירוג קבוע של הערכים שלך
                  </p>
                </div>

                {/* Top values bars */}
                <div className="mb-6 space-y-3">
                  {topValues.length === 0 && (
                    <p className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm leading-relaxed text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
                      דילגת על כל השאלות, ולכן אין מה לסכם — וזה בסדר גמור. אפשר לחזור
                      לתרגיל רק אם מתחשק לך.
                    </p>
                  )}
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
                            {i === 0 && <span className="ml-1.5 text-xs font-normal text-pink-500">קיבל יותר משקל</span>}
                            {value.label}
                          </span>
                        </div>
                        <span className="text-xs text-zinc-500">#{i + 1}</span>
                      </div>
                      <div className="mb-2 h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                        <motion.div
                          className="h-full w-full origin-right"
                          style={{ backgroundColor: value.color }}
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: (value.score / maxScore) * 100 / 100 }}
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
                  {topValues.length > 0 && (
                    <>
                      <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                        לפני שיתוף, כדאי לקרוא את הטקסט ולוודא שנוח לך לחשוף את ההעדפות האלה.
                      </p>
                      <button
                        onClick={handleShare}
                        className="w-full rounded-xl bg-gradient-to-l from-pink-500 to-red-500 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-pink-500/20 transition-all hover:opacity-90"
                      >
                        📤 שתף/י רק אם מתאים לך
                      </button>
                    </>
                  )}
                  <button
                    onClick={handleRestart}
                    className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-600 transition-colors hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-zinc-600"
                  >
                    🔄 התחלת התרגיל מחדש
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
