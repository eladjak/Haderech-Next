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
    description: "גלו את כל הקורסים הזמינים",
  },
  {
    href: "/chat",
    emoji: "💬",
    title: "צ'אט AI",
    description: "שאלו את מאמן ה-AI",
  },
  {
    href: "/simulator",
    emoji: "🎭",
    title: "סימולטור",
    description: "תרגלו בתרחישים אמיתיים",
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
    description: "בחרו את המסלול המתאים",
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
      "הדרך היא פלטפורמת למידה מתקדמת לתקשורת זוגית ואישית. אנחנו משלבים קורסים מקצועיים, מאמן AI אישי, סימולטור שיחות ריאליסטי וקהילה תומכת - הכל בעברית ומותאם לתרבות הישראלית.",
  },
  {
    category: "כללי",
    question: "למי מתאימה הפלטפורמה?",
    answer:
      "הפלטפורמה מתאימה לכל מי שרוצה לשפר את מיומנויות התקשורת שלו - בין אם אתם רווקים שמחפשים קשר, בזוגיות שרוצים לחזק אותה, או פשוט אנשים שרוצים להיות יותר טובים בתקשורת בינאישית.",
  },
  {
    category: "כללי",
    question: "כמה זמן לוקח לראות שינוי?",
    answer:
      "רוב המשתמשים מדווחים על שיפור ניכר כבר אחרי שבועיים של תרגול עקבי. הסימולטור ומאמן ה-AI מאיצים את הלמידה משמעותית בהשוואה ללמידה עצמאית.",
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
      'היכנסו לעמוד "קורסים", בחרו קורס שמעניין אתכם ולחצו על "הירשם לקורס". לאחר ההרשמה הקורס יופיע בדשבורד האישי שלכם ותוכלו להתחיל מיד.',
  },
  {
    category: "קורסים",
    question: "האם יש תעודת סיום?",
    answer:
      "כן! כשמשלימים 80% ויותר מהשיעורים בקורס מקבלים תעודת סיום עם מספר ייחודי לאימות. ניתן לשתף את התעודה ברשתות החברתיות.",
  },
  {
    category: "קורסים",
    question: "כמה שיעורים יש בקורס?",
    answer:
      "מספר השיעורים משתנה בין קורסים - בדרך כלל בין 6 ל-20 שיעורים. כל שיעור כולל תוכן כתוב, ובחלק מהשיעורים גם וידאו ובחנים.",
  },
  {
    category: "קורסים",
    question: "מה קורה אם לא עברתי בוחן?",
    answer:
      "ניתן לנסות את הבחן שוב ללא הגבלה. ציון מעבר הוא 60%. אחרי כל ניסיון תקבלו משוב על התשובות הנכונות.",
  },
  {
    category: "קורסים",
    question: "האם הקורסים בתשלום?",
    answer:
      "ישנם קורסים בחינם וקורסים פרימיום. גישה לקורסים הבסיסיים חינמית לגמרי. לקורסים המתקדמים ולתכונות ה-AI נדרש מנוי.",
  },

  // AI ומאמן
  {
    category: "AI ומאמן",
    question: "מה יכול המאמן לעשות?",
    answer:
      "מאמן ה-AI יכול לענות על שאלות אישיות, לנתח מצבים שעברתם, לתת עצות מותאמות אישית ולעזור לכם להתכונן לשיחות חשובות. הוא למד על בסיס הקורסים שלנו ומותאם לתרבות הישראלית.",
  },
  {
    category: "AI ומאמן",
    question: "האם השיחות עם המאמן סודיות?",
    answer:
      "כן, השיחות עם מאמן ה-AI פרטיות ומאובטחות. אנחנו לא חולקים את תכני השיחות עם צדדים שלישיים. ניתן למחוק את ההיסטוריה בכל עת.",
  },
  {
    category: "AI ומאמן",
    question: "כמה הודעות אפשר לשלוח בחודש?",
    answer:
      "תלוי בסוג המנוי: בחינמי - 30 הודעות לחודש, בפרימיום - הודעות ללא הגבלה. ההודעות מתחדשות בתחילת כל חודש.",
  },

  // סימולטור
  {
    category: "סימולטור",
    question: "איך עובד הסימולטור?",
    answer:
      "הסימולטור מציב אתכם בשיחה עם דמות וירטואלית מציאותית. הדמות מגיבה לפי האישיות והרקע שלה, כמו שיחה אמיתית. בסוף כל סשן תקבלו ניתוח מפורט של הביצועים שלכם.",
  },
  {
    category: "סימולטור",
    question: "אילו תרחישים זמינים?",
    answer:
      "ישנם תרחישים ברמות קושי שונות: פגישה ראשונה, שיחת טלפון, דייט ראשון, ועוד. כל תרחיש עם אישיות שונה ורקע שונה לחוויה מגוונת.",
  },
  {
    category: "סימולטור",
    question: "האם הסימולטור מציאותי?",
    answer:
      "הדמויות בסימולטור מגובות על ידי AI מתקדם שאומן להגיב באופן אנושי ומציאותי. הן יכולות לבטא רגשות, היסוסים ותגובות ספונטניות.",
  },

  // תשלומים
  {
    category: "תשלומים",
    question: "מה כלול בחינם?",
    answer:
      "הגרסה החינמית כוללת: גישה לקורסים הבסיסיים, 30 הודעות חודשיות למאמן AI, 3 סשנים בחודש בסימולטור, וגישה לקהילה.",
  },
  {
    category: "תשלומים",
    question: "איך לשדרג למנוי פרימיום?",
    answer:
      'היכנסו לעמוד "תוכניות ומחירים" ובחרו את המסלול המתאים. ניתן לשלם באשראי, PayPal ובביט.',
  },
  {
    category: "תשלומים",
    question: "האם אפשר לבטל את המנוי?",
    answer:
      "כן, ניתן לבטל את המנוי בכל עת מהגדרות החשבון. הגישה לתכונות הפרימיום תישמר עד סוף תקופת החיוב.",
  },

  // טכני
  {
    category: "טכני",
    question: "על אילו מכשירים האתר עובד?",
    answer:
      "הפלטפורמה עובדת על כל מכשיר עם דפדפן מודרני: מחשב, טאבלט וסמארטפון. אין צורך בהתקנת אפליקציה.",
  },
  {
    category: "טכני",
    question: "האם יש אפליקציה?",
    answer:
      "כרגע אין אפליקציה ייעודית, אך האתר מותאם לחלוטין לניידים וניתן להוסיף אותו למסך הבית (PWA) לחוויה דמוית אפליקציה.",
  },
  {
    category: "טכני",
    question: "איך לאפס סיסמה?",
    answer:
      'בעמוד ההתחברות לחצו על "שכחתי סיסמה" והזינו את כתובת המייל שלכם. תקבלו קישור לאיפוס הסיסמה בתוך כמה דקות.',
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
          <h2 className="mb-5 text-center text-sm font-semibold tracking-wide text-zinc-400 uppercase dark:text-zinc-500">
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
