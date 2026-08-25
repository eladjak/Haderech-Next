"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

// ─── Quick Links ───────────────────────────────────────────────────────────────

const QUICK_LINKS = [
  {
    href: "/courses",
    emoji: "🎓",
    title: "איך להתחיל",
    description: "פתחו את תוכנית הדרך",
  },
  {
    href: "/chat",
    emoji: "💬",
    title: "צ'אט AI",
    description: "השתמשו בכלי AI בזהירות",
  },
  {
    href: "/simulator",
    emoji: "🎭",
    title: "סימולטור",
    description: "תרגלו תרחישים בדיוניים",
  },
  {
    href: "/community",
    emoji: "👥",
    title: "קהילה",
    description: "התחברו עם לומדים נוספים",
  },
  {
    href: "/pricing",
    emoji: "💰",
    title: "תוכניות ומחירים",
    description: "בדקו את מצב הרכישה",
  },
  {
    href: "/contact",
    emoji: "📧",
    title: "צור קשר",
    description: "שלחו לנו הודעה ישירה",
  },
];

// ─── FAQ Data ──────────────────────────────────────────────────────────────────

const FAQ_ITEMS: FAQItem[] = [
  // כללי
  {
    category: "כללי",
    question: "מה זה הדרך?",
    answer:
      "הדרך היא פלטפורמת למידה בעברית. התוכנית המרכזית נמשכת 12 שבועות, מחולקת ל-6 שלבים וכוללת 75 שיעורים ו-8 מסמכי PDF לתרגול. כלי ה-AI והסימולטור הם כלי תרגול שעלולים לטעות; הם אינם בני אדם ואינם תחליף לאיש מקצוע.",
  },
  {
    category: "כללי",
    question: "למי מתאימה הפלטפורמה?",
    answer:
      "התוכן מיועד למבוגרים שרוצים ללמוד ולתרגל תקשורת, היכרות וקשרים. אין הבטחה שהתוכנית תיצור זוגיות או תשפר קשר מסוים. במצב של אלימות, כפייה, מעקב, איום או סכנה אין להסתמך על תרגיל זוגי או כלי AI; עברו לעמוד הבטיחות ופנו לעזרה אנושית מתאימה.",
  },
  {
    category: "כללי",
    question: "כמה זמן לוקח לראות שינוי?",
    answer:
      "אין פרק זמן קבוע או תוצאה מובטחת. הקצב תלוי בנקודת הפתיחה, בתרגול, בנסיבות ובמטרות שלכם. התרגול הבדיוני וכלי הרפלקציה ב-AI נותנים משוב אוטומטי מוגבל; הם אינם תחליף לליווי מקצועי ואיננו טוענים שהם מבטיחים או מאיצים שינוי מסוים.",
  },
  {
    category: "כללי",
    question: "באיזו שפה הקורסים?",
    answer:
      "כל הקורסים נכתבו בעברית. ממשק המשתמש וכל התוכן מותאמים לקריאה מימין לשמאל ולתרבות הישראלית.",
  },

  // קורסים
  {
    category: "קורסים",
    question: "איך מתחילים קורס?",
    answer:
      'היכנסו לעמוד "קורסים" ובחרו בתוכנית "הדרך". הגישה בפועל נקבעת לפי מצב החשבון וההרשאה שמוצגים במערכת; יצירת חשבון לבדה אינה הוכחה לרכישה או לזכאות לתוכן בתשלום.',
  },
  {
    category: "קורסים",
    question: "האם יש תעודת סיום?",
    answer:
      "המערכת כוללת אפשרות להנפיק תעודת סיום דיגיטלית לאחר השלמה מתועדת של 80% לפחות מהשיעורים. התעודה מציינת השלמת תוכן בפלטפורמה; היא אינה הסמכה מקצועית או רישיון לעסוק בטיפול או בייעוץ.",
  },
  {
    category: "קורסים",
    question: "כמה שיעורים יש בקורס?",
    answer:
      "בתוכנית הדרך יש 75 שיעורים לאורך 12 שבועות וב-6 שלבים. לצדם יש 8 מסמכי PDF לתרגול. חלק מהשיעורים כוללים שאלות בדיקה או רפלקציה; לא כל שאלה מיועדת לציון.",
  },
  {
    category: "קורסים",
    question: "מה קורה אם לא עברתי בוחן?",
    answer:
      "המערכת כוללת שאלות בדיקה ושאלות רפלקציה. כאשר מוצג ציון, הוא מתייחס רק לתשובות באותו בוחן ואינו מדד ליכולת זוגית, לבריאות נפשית או להתאמה לקשר. פעלו לפי אפשרויות הניסיון והמשוב שמופיעות במסך הבוחן.",
  },
  {
    category: "קורסים",
    question: "האם הקורסים בתשלום?",
    answer:
      "פתיחת חשבון אינה מבטיחה גישה לכל התוכן. רכישה מקוונת חדשה אינה זמינה כרגע, ולכן אין להסתמך על קטלוגי מחיר או מסלולי פרימיום ישנים. מצב הגישה שמופיע בחשבון הוא הקובע; במקרה של סתירה פנו לתמיכה.",
  },

  // AI ומאמן
  {
    category: "AI ומאמן",
    question: "מה יכול המאמן לעשות?",
    answer:
      "כלי ה-AI יכול להציע שאלות למחשבה, תרגול ניסוח ומשוב כללי על טקסט שתבחרו לשתף. הוא אינו מכיר את המציאות מעבר למה שכתבתם, אינו יכול לדעת מה אדם אחר חושב או מרגיש, ועלול להמציא פרטים או לתת תשובה לא מתאימה.",
  },
  {
    category: "AI ומאמן",
    question: "האם השיחות עם המאמן סודיות?",
    answer:
      "תוכן השיחות נשמר בחשבון כדי לאפשר היסטוריה, ונשלח לעיבוד אצל ספקי AI חיצוניים — Google Gemini או Anthropic — כדי להפיק תשובה. אל תשלחו מידע שלא תרצו שיעובד בשירות חיצוני. אפשר לשלוח בקשת מחיקה מהגדרות החשבון; זו בקשה לטיפול ידני ואינה מחיקה מיידית.",
  },
  {
    category: "AI ומאמן",
    question: "כמה הודעות אפשר לשלוח בחודש?",
    answer:
      "אין כאן הבטחה למכסת הודעות קבועה או לשימוש ללא הגבלה. הזמינות והמגבלות יכולות להשתנות ותלויות גם בספקי ה-AI. אם הכלי אינו זמין, נסו מאוחר יותר או פנו לתמיכה; אין להשתמש בו במצב חירום.",
  },

  // סימולטור
  {
    category: "סימולטור",
    question: "איך עובד הסימולטור?",
    answer:
      "הסימולטור יוצר שיחה בדיונית עם דמות AI. הוא אינו אדם אמיתי ואינו משחזר באופן אמין איך אדם מסוים יגיב. משוב אוטומטי, אם מוצג, מתייחס רק לתרחיש הזה ועלול לטעות; הוא אינו ציון לערך, לאטרקטיביות או ליכולת שלכם בקשר.",
  },
  {
    category: "סימולטור",
    question: "אילו תרחישים זמינים?",
    answer:
      "מסך הסימולטור מציג את התרחישים הזמינים באותו רגע. כל תרחיש הוא בדיוני ונועד לתרגול בלבד. מותר לעצור בכל שלב, ואין להסיק מהתגובה של הדמות מה אדם אמיתי ירצה או יסכים לו.",
  },
  {
    category: "סימולטור",
    question: "האם הסימולטור מציאותי?",
    answer:
      "לא במובן של שיחה עם אדם אמיתי. מודל AI מייצר טקסט לפי תרחיש, ולכן הוא עשוי להישמע אנושי אך גם להיות לא עקבי, סטריאוטיפי או שגוי. הסכמה בעולם האמיתי מתקבלת רק מאדם אמיתי ובכל שלב מחדש.",
  },

  // תשלומים
  {
    category: "תשלומים",
    question: "מה כלול בחינם?",
    answer:
      "יצירת חשבון יכולה לפתוח משטחים מסוימים, אך אינה הבטחה למכסת שימוש מסוימת, לקורס מסוים או לזכאות בתשלום. התוכן והכלים שנגישים בפועל בחשבון הם הזמינים כרגע, בכפוף לשינויים ולזמינות השירות.",
  },
  {
    category: "תשלומים",
    question: "איך לשדרג למנוי פרימיום?",
    answer:
      'היכנסו לעמוד "תוכניות ומחירים" ובחרו מסלול. אמצעי התשלום, המחיר, תקופת הגישה ותנאי הביטול הקובעים הם אלה שיוצגו לפני אישור התשלום. אם עמוד תשלום מאובטח אינו זמין, לא ניתן להשלים רכישה ויש לפנות לתמיכה.',
  },
  {
    category: "תשלומים",
    question: "האם אפשר לבטל את המנוי?",
    answer:
      "אין כרגע תהליך ביטול עצמי מאומת שאפשר להבטיח כאן. תנאי הביטול והמשך הגישה נקבעים לפי התנאים שהוצגו ברכישה. פנו לתמיכה ושמרו את אישור הפנייה; מחיקת חשבון אינה מבטלת חיוב באופן אוטומטי.",
  },

  // טכני
  {
    category: "טכני",
    question: "על אילו מכשירים האתר עובד?",
    answer:
      "האתר תוכנן לשימוש בדפדפנים מודרניים במחשב ובנייד, אך איננו מבטיחים תאימות לכל מכשיר, גרסה או טכנולוגיה מסייעת. אם נתקלתם בחסם, ציינו בפנייה לתמיכה את המכשיר, הדפדפן והפעולה שניסיתם לבצע.",
  },
  {
    category: "טכני",
    question: "האם יש אפליקציה?",
    answer:
      "אין כרגע אפליקציה ייעודית בחנות. בדפדפנים תומכים ייתכן שתופיע אפשרות להוסיף את האתר למסך הבית, אך הזמינות תלויה במכשיר ובדפדפן.",
  },
  {
    category: "טכני",
    question: "איך לאפס סיסמה?",
    answer:
      'בעמוד ההתחברות השתמשו באפשרות איפוס הסיסמה שמוצגת על ידי מערכת ההזדהות. אם לא התקבלה הודעה, בדקו את תיקיית הספאם ושהזנתם את הכתובת הנכונה; לאחר מכן פנו לתמיכה בלי לשלוח לנו סיסמה או קוד אימות.',
  },
];

const CATEGORIES = [
  "הכל",
  "כללי",
  "קורסים",
  "AI ומאמן",
  "סימולטור",
  "תשלומים",
  "טכני",
];

// ─── Component ─────────────────────────────────────────────────────────────────

export default function HelpPage() {
  const [selectedCategory, setSelectedCategory] = useState("הכל");
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = FAQ_ITEMS.filter((item) => {
    const matchesCategory =
      selectedCategory === "הכל" || item.category === selectedCategory;
    const q = searchQuery.trim();
    const matchesSearch =
      !q || item.question.includes(q) || item.answer.includes(q);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-dvh bg-white dark:bg-zinc-950">
      <Header />

      <main id="main-content">
        {/* Hero */}
        <section className="bg-gradient-to-b from-violet-50 to-white px-4 pt-16 pb-12 dark:from-violet-950/20 dark:to-zinc-950">
          <div className="mx-auto max-w-3xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-600 text-2xl shadow-lg">
                🆘
              </div>
              <h1 className="mb-3 text-4xl font-bold text-zinc-900 dark:text-white">
                מרכז עזרה
              </h1>
              <p className="text-lg text-zinc-600 dark:text-zinc-400">
                כאן תמצאו תשובות לכל השאלות. לא מצאתם?{" "}
                <Link
                  href="/contact"
                  className="font-medium text-violet-600 hover:underline dark:text-violet-400"
                >
                  צרו קשר
                </Link>
              </p>
            </motion.div>

            {/* Search bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="mx-auto mt-8 max-w-xl"
            >
              <div className="relative">
                <svg
                  className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400"
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
                  placeholder="חפש שאלה... (למשל: תעודה, סיסמה, AI)"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setOpenIndex(null);
                  }}
                  className="h-13 w-full rounded-2xl border border-zinc-200 bg-white pr-12 pl-4 text-sm text-zinc-900 shadow-sm placeholder:text-zinc-400 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:placeholder:text-zinc-500 dark:focus:border-violet-600 dark:focus:ring-violet-900/30"
                  aria-label="חיפוש בשאלות נפוצות"
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Quick Links */}
        <section className="container mx-auto px-4 py-10">
              <h2 className="mb-5 text-center text-sm font-semibold tracking-wide text-zinc-700 uppercase dark:text-zinc-300">
            קישורים מהירים
          </h2>
          <div className="mx-auto grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {QUICK_LINKS.map((link, i) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
              >
                <Link
                  href={link.href}
                  className="flex flex-col items-center gap-2 rounded-2xl border border-zinc-100 bg-white p-4 text-center transition-all hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-violet-800"
                >
                  <span className="text-2xl" aria-hidden="true">
                    {link.emoji}
                  </span>
                  <span className="text-xs font-semibold text-zinc-800 dark:text-white">
                    {link.title}
                  </span>
                  <span className="hidden text-[10px] text-zinc-400 sm:block dark:text-zinc-500">
                    {link.description}
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="container mx-auto px-4 pb-16">
          <div className="mx-auto max-w-3xl">
            {/* Category Tabs */}
            <div className="mb-6 flex flex-wrap justify-center gap-2">
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
                      ? "bg-violet-600 text-white shadow-sm"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* FAQ count */}
            {searchQuery.trim() && (
              <p className="mb-4 text-center text-sm text-zinc-500">
                נמצאו {filteredItems.length} תוצאות עבור &ldquo;{searchQuery}&rdquo;
              </p>
            )}

            {/* Accordion */}
            {filteredItems.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-2xl bg-zinc-50 p-12 text-center dark:bg-zinc-900"
              >
                <p className="text-4xl">🔍</p>
                <p className="mt-3 font-medium text-zinc-700 dark:text-zinc-300">
                  לא נמצאו תוצאות
                </p>
                <p className="mt-1 text-sm text-zinc-500">
                  נסו מילות חיפוש אחרות או{" "}
                  <Link
                    href="/contact"
                    className="text-violet-600 hover:underline dark:text-violet-400"
                  >
                    פנו אלינו
                  </Link>
                </p>
              </motion.div>
            ) : (
              <div className="divide-y divide-zinc-100 overflow-hidden rounded-2xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
                {filteredItems.map((item, index) => {
                  const isOpen = openIndex === index;
                  return (
                    <div key={`${item.category}-${item.question}`}>
                      <button
                        type="button"
                        onClick={() => setOpenIndex(isOpen ? null : index)}
                        className="flex w-full items-start justify-between gap-4 px-6 py-4 text-right transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                        aria-expanded={isOpen}
                      >
                        <div className="flex-1">
                          <span className="mb-1 block text-[11px] font-medium text-violet-600 dark:text-violet-400">
                            {item.category}
                          </span>
                          <span className="text-sm font-medium text-zinc-900 dark:text-white">
                            {item.question}
                          </span>
                        </div>
                        <motion.svg
                          animate={{ rotate: isOpen ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                          className="mt-1 h-4 w-4 flex-shrink-0 text-zinc-400"
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
                        </motion.svg>
                      </button>

                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            key="answer"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="bg-violet-50/50 px-6 py-4 dark:bg-violet-950/10">
                              <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                                {item.answer}
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Still need help? CTA */}
        <section className="border-t border-zinc-100 bg-gradient-to-b from-white to-violet-50 px-4 py-16 dark:border-zinc-800 dark:from-zinc-950 dark:to-violet-950/10">
          <div className="mx-auto max-w-xl text-center">
            <p className="mb-2 text-3xl">💬</p>
            <h2 className="mb-2 text-xl font-bold text-zinc-900 dark:text-white">
              עדיין לא מצאתם תשובה?
            </h2>
            <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
              צוות התמיכה שלנו כאן בשבילכם. נשמח לענות על כל שאלה.
            </p>
            <Link
              href="/contact"
              className="inline-flex h-11 items-center justify-center rounded-full bg-violet-600 px-8 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-violet-700"
            >
              צרו קשר עכשיו
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
