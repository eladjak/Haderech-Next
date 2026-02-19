"use client";

import { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    category: "כללי",
    question: "מהי הדרך?",
    answer:
      "הדרך היא פלטפורמת למידה אונליין בעברית המתמחה בתקשורת זוגית ואישית. אנחנו מציעים קורסים מקצועיים, בחנים, תעודות סיום ומערכת מעקב התקדמות.",
  },
  {
    category: "כללי",
    question: "האם הקורסים בתשלום?",
    answer:
      "כרגע כל הקורסים זמינים בחינם. בעתיד ייתכן שנוסיף קורסים פרימיום עם תוכן מתקדם.",
  },
  {
    category: "כללי",
    question: "באיזו שפה הקורסים?",
    answer:
      "כל הקורסים נכתבו בעברית. ממשק המשתמש וכל התוכן מותאמים לקריאה מימין לשמאל.",
  },
  {
    category: "חשבון והרשמה",
    question: "איך נרשמים?",
    answer:
      'לחצו על "הרשמה" בפינה העליונה, מלאו את הפרטים שלכם ותוכלו להתחיל ללמוד מיד. ניתן גם להירשם באמצעות חשבון Google.',
  },
  {
    category: "חשבון והרשמה",
    question: "שכחתי את הסיסמה, מה עושים?",
    answer:
      'בעמוד ההתחברות לחצו על "שכחתי סיסמה" והזינו את כתובת המייל שלכם. תקבלו קישור לאיפוס הסיסמה.',
  },
  {
    category: "חשבון והרשמה",
    question: "איך אני נרשם לקורס?",
    answer:
      'היכנסו לעמוד הקורס הרצוי ולחצו על כפתור "הירשם לקורס". לאחר ההרשמה הקורס יופיע באזור האישי שלכם.',
  },
  {
    category: "למידה",
    question: "איך עובדת מערכת ההתקדמות?",
    answer:
      'בכל שיעור יש כפתור "סמן כהושלם". כשתסמנו שיעורים, אחוז ההתקדמות שלכם יתעדכן. תוכלו לראות את ההתקדמות בדשבורד ובדף מעקב ההתקדמות.',
  },
  {
    category: "למידה",
    question: "מה קורה בבחנים?",
    answer:
      "בסוף כל שיעור ראשון של קורס יש בוחן. הבוחן כולל שאלות אמריקאיות, עם זמן מוגבל לכל שאלה. ציון מעבר הוא 60%. ניתן לנסות שוב ללא הגבלה.",
  },
  {
    category: "למידה",
    question: "איך מקבלים תעודת סיום?",
    answer:
      "כשתשלימו 80% או יותר משיעורי הקורס, תעודת סיום תונפק אוטומטית. התעודה כוללת מספר ייחודי לאימות וניתנת לשיתוף ברשתות החברתיות.",
  },
  {
    category: "למידה",
    question: "מה זה ה-XP ומערכת ההישגים?",
    answer:
      "XP (נקודות ניסיון) הם נקודות שאתם צוברים על פעילויות: 10 נקודות להשלמת שיעור, 5 לבוחן, 50 לתעודה, ו-3 בונוס יומי. ככל שצוברים יותר, עולים ברמה ומשיגים תגים.",
  },
  {
    category: "תכונות",
    question: "מה זה 'הערות'?",
    answer:
      "בכל שיעור תוכלו לכתוב הערות אישיות פרטיות. ההערות נשמרות אוטומטית וניתנות לצפייה גם מהעמוד הכללי של ההערות.",
  },
  {
    category: "תכונות",
    question: "איך עובדת מערכת הדיונים?",
    answer:
      "בכל שיעור יש אזור דיון שבו תוכלו לשאול שאלות, לשתף תובנות ולהגיב לתגובות של לומדים אחרים. הדיון הוא ציבורי לכל הרשומים לקורס.",
  },
  {
    category: "תכונות",
    question: "מה זה לוח המובילים?",
    answer:
      "לוח המובילים מציג את 50 הלומדים עם הכי הרבה XP. הוא כולל מדליות זהב, כסף וארד לשלושת הראשונים.",
  },
  {
    category: "טכני",
    question: "באילו מכשירים אפשר ללמוד?",
    answer:
      "הפלטפורמה מותאמת למחשב, טאבלט וסמארטפון. אין צורך בהתקנת אפליקציה - הכל עובד מהדפדפן.",
  },
  {
    category: "טכני",
    question: "יש בעיה טכנית, מה עושים?",
    answer:
      "נסו לרענן את הדף. אם הבעיה נמשכת, נקו את המטמון של הדפדפן. אם עדיין לא עובד, צרו קשר דרך עמוד יצירת הקשר.",
  },
];

const CATEGORIES = ["הכל", "כללי", "חשבון והרשמה", "למידה", "תכונות", "טכני"];

export default function HelpPage() {
  const [selectedCategory, setSelectedCategory] = useState("הכל");
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = FAQ_ITEMS.filter((item) => {
    const matchesCategory =
      selectedCategory === "הכל" || item.category === selectedCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      item.question.includes(searchQuery) ||
      item.answer.includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-dvh bg-white dark:bg-zinc-950">
      <Header />

      <main className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h1 className="mb-4 text-4xl font-bold text-zinc-900 dark:text-white">
            מרכז עזרה
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            כאן תמצאו תשובות לשאלות הנפוצות ביותר
          </p>
        </div>

        {/* Search */}
        <div className="mx-auto mb-8 max-w-xl">
          <div className="relative">
            <svg
              className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400"
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
              placeholder="חפש שאלה..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 w-full rounded-xl border border-zinc-200 bg-white pr-10 pl-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:placeholder:text-zinc-500 dark:focus:border-zinc-600"
              aria-label="חיפוש בשאלות נפוצות"
            />
          </div>
        </div>

        {/* Category tabs */}
        <div className="mx-auto mb-8 flex max-w-xl flex-wrap justify-center gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                setSelectedCategory(cat);
                setOpenIndex(null);
              }}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                selectedCategory === cat
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* FAQ Accordion */}
        <div className="mx-auto max-w-2xl">
          {filteredItems.length === 0 ? (
            <div className="rounded-2xl bg-zinc-50 p-12 text-center dark:bg-zinc-900">
              <p className="text-zinc-600 dark:text-zinc-400">
                לא נמצאו תוצאות. נסו מילות חיפוש אחרות.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-200 rounded-2xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
              {filteredItems.map((item, index) => {
                const isOpen = openIndex === index;
                return (
                  <div key={`${item.category}-${item.question}`}>
                    <button
                      type="button"
                      onClick={() =>
                        setOpenIndex(isOpen ? null : index)
                      }
                      className="flex w-full items-center justify-between px-6 py-4 text-right transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900"
                      aria-expanded={isOpen}
                    >
                      <div>
                        <span className="mb-1 block text-xs text-zinc-400">
                          {item.category}
                        </span>
                        <span className="text-sm font-medium text-zinc-900 dark:text-white">
                          {item.question}
                        </span>
                      </div>
                      <svg
                        className={`h-5 w-5 flex-shrink-0 text-zinc-400 transition-transform duration-200 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                        />
                      </svg>
                    </button>
                    {isOpen && (
                      <div className="bg-zinc-50 px-6 py-4 dark:bg-zinc-900/50">
                        <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                          {item.answer}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Still need help? */}
        <div className="mx-auto mt-12 max-w-md text-center">
          <h2 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-white">
            לא מצאתם תשובה?
          </h2>
          <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
            צרו איתנו קשר ונשמח לעזור
          </p>
          <Link
            href="/contact"
            className="inline-flex h-10 items-center justify-center rounded-full bg-zinc-900 px-6 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
          >
            צרו קשר
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
