"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { FAQChat } from "@/components/faq/faq-chat";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQCategory {
  id: string;
  label: string;
  icon: string;
  items: FAQItem[];
}

// ─── FAQ Data ──────────────────────────────────────────────────────────────────

const FAQ_CATEGORIES: FAQCategory[] = [
  {
    id: "general",
    label: "כללי",
    icon: "📋",
    items: [
      {
        question: 'מה זה "הדרך"?',
        answer:
          "הדרך היא פלטפורמת למידה בעברית. התוכנית המרכזית נמשכת 12 שבועות, מחולקת ל-6 שלבים וכוללת 75 שיעורים ו-8 מסמכי PDF לתרגול. לצד התוכנית יש כלי AI וסימולטור בדיוני לתרגול, בכפוף לזמינות. הכלים עלולים לטעות ואינם תחליף לאיש מקצוע.",
      },
      {
        question: "למי הפלטפורמה מיועדת?",
        answer:
          "התוכן מיועד למבוגרים שרוצים ללמוד ולתרגל תקשורת, היכרות וקשרים. הוא אינו מבטיח זוגיות, שינוי אישי או שיפור בקשר מסוים. במצב של אלימות, כפייה, מעקב, איום או סכנה אין להסתמך על תרגיל משותף או על כלי AI; עברו לעמוד הבטיחות ופנו לעזרה אנושית מתאימה.",
      },
      {
        question: "האם צריך ידע קודם כדי להתחיל?",
        answer:
          "לא נדרש ידע קודם. התוכנית בנויה ב-6 שלבים לאורך 12 שבועות. אפשר ללמוד בקצב אישי, לדלג על תרגיל שאינו מתאים ולחזור אליו מאוחר יותר. אין חובה לחשוף מידע, ליצור קשר, לגעת, להיפגש או להישאר במערכת יחסים כחלק מהלמידה.",
      },
      {
        question: "האם הפלטפורמה בחינם?",
        answer:
          'יצירת חשבון אינה מבטיחה גישה לקורס, מכסת הודעות או שימוש ללא הגבלה. רכישה מקוונת חדשה אינה זמינה כרגע, ולכן אין להסתמך על קטלוגי מחיר או מסלולי פרימיום ישנים. מצב הגישה שמוצג בחשבון הוא הקובע; במקרה של סתירה פנו לתמיכה.',
      },
      {
        question: "איך מתחילים?",
        answer:
          'פתחו חשבון באמצעות אפשרויות ההזדהות שמופיעות באתר, עברו לעמוד "קורסים" ובחרו בתוכנית הדרך. אין חובה להשלים שאלון או להשתמש בכלי AI כדי ללמוד, ואין להזין בכלי ה-AI מידע שלא תרצו שיעובד אצל ספק חיצוני.',
      },
    ],
  },
  {
    id: "courses",
    label: "קורסים ולמידה",
    icon: "🎓",
    items: [
      {
        question: "כמה קורסים יש בפלטפורמה?",
        answer:
          "המוצר המרכזי הוא תוכנית הדרך: 12 שבועות, 6 שלבים ו-75 שיעורים, לצד 8 מסמכי PDF לתרגול. אל תסיקו מרשומות ישנות או מכרטיסי דוגמה שקיים קטלוג נוסף, ושינויים עתידיים ייחשבו זמינים רק כשהם מופיעים בפועל במערכת.",
      },
      {
        question: "האם יש תעודות סיום?",
        answer:
          "המערכת כוללת אפשרות להנפיק תעודת סיום דיגיטלית לאחר השלמה מתועדת של 80% לפחות מהשיעורים. התעודה מציינת השלמת תוכן בפלטפורמה; היא אינה הסמכה מקצועית, תואר או רישיון לעסוק בטיפול או בייעוץ.",
      },
      {
        question: "כמה זמן לוקח להשלים קורס?",
        answer:
          "תוכנית הדרך בנויה ל-12 שבועות, אבל אפשר להתקדם בקצב אישי. יש בה 75 שיעורים ו-8 מסמכי PDF לתרגול. זמן הקריאה והתרגול משתנה בין אנשים; אין זמן השלמה ממוצע מאומת ואין צורך למהר כדי לעמוד בתוצאה כלשהי.",
      },
      {
        question: "האם אפשר ללמוד מהנייד?",
        answer:
          "האתר תוכנן לשימוש בדפדפנים מודרניים במחשב ובנייד, אבל איננו מבטיחים שכל תכונה תפעל בכל מכשיר או גרסה. בדפדפנים תומכים ייתכן שאפשר להוסיף את האתר למסך הבית. אם נתקלתם בחסם, פנו לתמיכה עם פרטי המכשיר והדפדפן.",
      },
      {
        question: "מה קורה אם לא מסיימים קורס?",
        answer:
          "אין חובה לסיים בזמן קבוע. המערכת מיועדת לשמור התקדמות בחשבון, אך איננו מבטיחים שמירה לנצח או זמינות ללא הפסקה. אל תשמרו בהערות מידע רגיש שאין לכם צורך בו, ושמרו אצלכם עותק של חומר אישי שחשוב לכם.",
      },
    ],
  },
  {
    id: "ai-tools",
    label: "כלי AI",
    icon: "🤖",
    items: [
      {
        question: "מה הכלים של ה-AI עושים?",
        answer:
          'כלי ה-AI יכולים להציע שאלות למחשבה, תרגול ניסוח ומשוב כללי על טקסט שתבחרו לשתף. הסימולטור מייצר דמויות ותרחישים בדיוניים. הכלים אינם מכירים את המציאות מעבר למה שנכתב, אינם יכולים לדעת מה אדם אחר חושב או מרגיש ועלולים להמציא פרטים.',
      },
      {
        question: "האם ה-AI מחליף ייעוץ אישי מקצועי?",
        answer:
          "לא. אלה כלי למידה ותרגול שעלולים לטעות, לא טיפול, אבחון, ייעוץ משפטי או רפואי ולא שירות חירום. אם דרוש ליווי מקצועי, בחרו איש מקצוע מתאים ובדקו ישירות את הכשרתו, תחום עיסוקו ותנאי הפרטיות שלו. במצב סכנה עברו לעמוד הבטיחות ופנו לגורם אנושי מתאים.",
      },
      {
        question: "מי רואה את המידע שאני שולח ל-AI?",
        answer:
          "תוכן השיחה נשמר בחשבון כדי לאפשר היסטוריית שיחות, ונשלח לעיבוד אצל ספקי AI חיצוניים — Google Gemini או Anthropic, בהתאם לזמינות ולהגדרת השירות — כדי להפיק תשובה. העיבוד כפוף גם לתנאי הספק הרלוונטי. אנחנו לא משתמשים בתוכן השיחות לפרסום. מומלץ לא לשלוח מידע שאינכם רוצים שיעובד בשירות חיצוני.",
      },
      {
        question: "האם הכלים עובדים בעברית?",
        answer:
          "הממשק והתוכן המרכזי בעברית ובכיוון RTL. כלי ה-AI מיועדים לקבל ולהחזיר עברית, אבל הם עלולים לטעות בהבנת סלנג, הקשר, מגדר או ניואנסים. אין להסתמך על ניסוח שנוצר אוטומטית בלי לבדוק אותו.",
      },
    ],
  },
  {
    id: "simulator",
    label: "סימולטור דייטים",
    icon: "🎭",
    items: [
      {
        question: "מה זה סימולטור דייטים?",
        answer:
          "הסימולטור הוא כלי תרגול עם דמות ותרחיש בדיוניים שנוצרים באמצעות AI. הוא אינו סביבה נטולת סיכון, אינו אדם אמיתי ואינו יכול לשחזר באופן אמין תגובה של אדם מסוים. אפשר לעצור בכל רגע, ואין להסיק ממנו עניין או הסכמה בעולם האמיתי.",
      },
      {
        question: "האם הסימולטור מבוסס על AI?",
        answer:
          "כן. מודל AI מייצר טקסט לפי תרחיש ופרטי דמות בדיוניים. הוא עשוי להישמע אנושי, אבל אין לדמות רגשות, רצון או יכולת להסכים. התגובה עלולה להיות לא עקבית, סטריאוטיפית או שגויה ואינה תחזית להתנהגות של אדם אמיתי.",
      },
      {
        question: "כמה תרחישים זמינים?",
        answer:
          "מסך הסימולטור מציג את התרחישים הזמינים כרגע. תווית קושי, אם מוצגת, מתארת את הגדרת התרחיש בלבד ואינה אומרת שאדם הוא אתגר שצריך לפצח. איננו מבטיחים מספר קבוע של תרחישים או הוספה שוטפת.",
      },
      {
        question: "האם התוצאות של הסימולטור נשמרות?",
        answer:
          'ייתכן שבסוף תרגול יוצג משוב אוטומטי והסשן יופיע בהיסטוריה. המשוב מתייחס רק לחילופי הדברים הבדיוניים ועלול לטעות; הוא אינו ציון ליכולת, לאטרקטיביות, לבריאות נפשית או להתאמה לקשר. אין להזין בתרגול מידע מזהה או מידע של אדם אחר בלי הרשאה.',
      },
    ],
  },
  {
    id: "payments",
    label: "מנוי ותשלומים",
    icon: "💳",
    items: [
      {
        question: "מה כולל המנוי הפרימיום?",
        answer:
          "התכולה המדויקת של כל מסלול, מגבלות השימוש ותקופת הגישה צריכות להופיע בעמוד התוכניות ובסיכום ההזמנה לפני התשלום. אם יש סתירה, אל תשלימו רכישה ופנו אלינו דרך עמוד יצירת הקשר.",
      },
      {
        question: "האם אפשר לבטל את המנוי בכל עת?",
        answer:
          "תנאי הביטול והמשך הגישה נקבעים לפי המסלול והתנאים שיוצגו לפני התשלום. עד שניתן להשלים ביטול עצמי מאומת בחשבון, יש לפנות לתמיכה ולשמור את אישור הפנייה. אל תניחו שביטול בקשה או מחיקת חשבון מבטלים חיוב באופן אוטומטי.",
      },
      {
        question: "אילו אמצעי תשלום מקבלים?",
        answer:
          "אמצעי התשלום הזמינים נקבעים בעמוד התשלום של ספק הסליקה ומוצגים לפני האישור. איננו מתחייבים כאן לכרטיס, ארנק דיגיטלי או אמצעי מסוים. אם לא מוצג עמוד תשלום תקין ומאובטח, אל תמסרו פרטי תשלום ופנו לתמיכה.",
      },
      {
        question: "האם יש הנחות או מבצעים?",
        answer:
          "רק מחיר או הטבה שמופיעים בעמוד התשלום ובסיכום ההזמנה בזמן הרכישה מחייבים. אין כרגע הבטחה קבועה להנחת סטודנטים, חיילים, מבצע עונתי או תוכנית הפניות.",
      },
    ],
  },
  {
    id: "privacy",
    label: "פרטיות ואבטחה",
    icon: "🔒",
    items: [
      {
        question: "מה אתם עושים עם המידע האישי שלי?",
        answer:
          "המידע האישי משמש להפעלת השירות — למשל להצגת התקדמות, התאמת תכנים ושמירת העדפות. לצורך הפעלת השירות אנחנו נעזרים בספקי תשתית ועיבוד חיצוניים; בכלי ה-AI, תוכן ההודעות עשוי להישלח ל-Google Gemini או Anthropic. אנחנו לא מוכרים את המידע ולא משתמשים בתכני שיחות AI לפרסום.",
      },
      {
        question: "האם אפשר למחוק את החשבון?",
        answer:
          "אפשר לשלוח בקשת מחיקת חשבון מהגדרות החשבון. שליחת הבקשה אינה מוחקת את החשבון או את הנתונים מיד: הבקשה עוברת לטיפול ידני, וניצור איתכם קשר בתוך 48 שעות לגבי המשך התהליך. עד לקבלת אישור שהטיפול הושלם, החשבון והנתונים נשארים במערכת.",
      },
      {
        question: "איך אתם מגנים על המידע?",
        answer:
          "הכניסה לחשבון מבוססת על Clerk, והמערכת מפעילה בקרות הרשאה בצד השרת. בחיבור לאתר המארח התעבורה אמורה לעבור ב-HTTPS. אין מערכת חסינה לחלוטין, ואיננו מצהירים כאן על 2FA, גיבוי או תקן שלא אומתו. אם זיהיתם חשיפה או פעילות חשודה, הפסיקו להשתמש בשירות ופנו אלינו.",
      },
    ],
  },
];

const ALL_CATEGORY_ID = "all";

// ─── Component ─────────────────────────────────────────────────────────────────

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState(ALL_CATEGORY_ID);
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  // Filter items based on category and search
  const filteredCategories = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return FAQ_CATEGORIES.map((category) => ({
      ...category,
      items: category.items.filter((item) => {
        const matchesCategory =
          activeCategory === ALL_CATEGORY_ID || category.id === activeCategory;
        const matchesSearch =
          !q ||
          item.question.toLowerCase().includes(q) ||
          item.answer.toLowerCase().includes(q);
        return matchesCategory && matchesSearch;
      }),
    })).filter((category) => category.items.length > 0);
  }, [activeCategory, searchQuery]);

  const totalResults = filteredCategories.reduce(
    (sum, cat) => sum + cat.items.length,
    0,
  );

  function toggleItem(categoryId: string, index: number) {
    const key = `${categoryId}-${index}`;
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  function handleCategoryChange(categoryId: string) {
    setActiveCategory(categoryId);
    setOpenItems(new Set());
  }

  function handleSearchChange(value: string) {
    setSearchQuery(value);
    setOpenItems(new Set());
  }

  return (
    <div className="min-h-dvh bg-white dark:bg-zinc-950">
      <Header />

      <main id="main-content">
        {/* ── Hero Section ────────────────────────────────────────────── */}
        <section className="bg-gradient-to-b from-brand-50 to-white px-4 pt-16 pb-12 dark:from-blue-500/5 dark:to-zinc-950">
          <div className="mx-auto max-w-3xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 text-2xl shadow-lg">
                <span role="img" aria-label="שאלות נפוצות">
                  💡
                </span>
              </div>
              <h1 className="mb-3 text-4xl font-bold text-zinc-900 dark:text-white">
                שאלות נפוצות
              </h1>
              <p className="mb-8 text-lg text-zinc-600 dark:text-zinc-400">
                מצאו תשובות לכל השאלות על הפלטפורמה, הקורסים וכלי ה-AI
              </p>
              <Image
                src="/images/illustrations/empty-faq.webp"
                alt="איור: שלוש בועות דיבור רכות וריקות מרחפות מעל גבעה שקטה בשעת דמדומים, ושלושה אנשים יושבים למטה"
                width={900}
                height={600}
                sizes="(max-width: 768px) 100vw, 560px"
                className="mx-auto w-full max-w-xl rounded-3xl shadow-md ring-1 ring-black/5 dark:ring-white/10"
              />
            </motion.div>

            {/* ── Search bar ──────────────────────────────────────────── */}
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
                  placeholder="חפשו שאלה... (למשל: מנוי, AI, תעודה, פרטיות)"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="h-13 w-full rounded-2xl border border-zinc-200 bg-white pr-12 pl-4 text-sm text-zinc-900 shadow-sm placeholder:text-zinc-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:placeholder:text-zinc-500 dark:focus:border-brand-500 dark:focus:ring-brand-500/20"
                  aria-label="חיפוש בשאלות נפוצות"
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── Interactive FAQ Chat ────────────────────────────────────── */}
        <section className="px-4 py-6">
          <div className="mx-auto max-w-2xl">
            <FAQChat />
          </div>
        </section>

        {/* ── Category Tabs ───────────────────────────────────────────── */}
        <section className="border-b border-zinc-100 bg-white/80 px-4 py-5 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/80">
          <div className="mx-auto flex max-w-4xl flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={() => handleCategoryChange(ALL_CATEGORY_ID)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                activeCategory === ALL_CATEGORY_ID
                  ? "bg-brand-500 text-white shadow-sm"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
              }`}
            >
              הכל ({FAQ_CATEGORIES.reduce((s, c) => s + c.items.length, 0)})
            </button>
            {FAQ_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryChange(cat.id)}
                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  activeCategory === cat.id
                    ? "bg-brand-500 text-white shadow-sm"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                }`}
              >
                <span aria-hidden="true">{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </section>

        {/* ── FAQ Content ─────────────────────────────────────────────── */}
        <section className="container mx-auto px-4 py-10">
          <div className="mx-auto max-w-3xl">
            {/* Search results count */}
            {searchQuery.trim() && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-6 text-center text-sm text-zinc-500 dark:text-zinc-400"
              >
                נמצאו{" "}
                <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                  {totalResults}
                </span>{" "}
                תוצאות עבור &ldquo;{searchQuery}&rdquo;
              </motion.p>
            )}

            {/* No results */}
            {totalResults === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-2xl bg-zinc-50 p-12 text-center dark:bg-zinc-900"
              >
                <p className="text-4xl" aria-hidden="true">
                  🔍
                </p>
                <p className="mt-3 font-medium text-zinc-700 dark:text-zinc-300">
                  לא נמצאו תוצאות
                </p>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  נסו מילות חיפוש אחרות או{" "}
                  <Link
                    href="/contact"
                    className="font-medium text-brand-500 hover:underline dark:text-brand-400"
                  >
                    פנו אלינו ישירות
                  </Link>
                </p>
              </motion.div>
            )}

            {/* Categories + Accordions */}
            <div className="space-y-8">
              {filteredCategories.map((category, catIdx) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: catIdx * 0.08 }}
                >
                  {/* Category header */}
                  <div className="mb-3 flex items-center gap-2">
                    <span
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-base dark:bg-brand-100/10"
                      aria-hidden="true"
                    >
                      {category.icon}
                    </span>
                    <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                      {category.label}
                    </h2>
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                      {category.items.length}
                    </span>
                  </div>

                  {/* Accordion list */}
                  <div className="divide-y divide-zinc-100 overflow-hidden rounded-2xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
                    {category.items.map((item, index) => {
                      const itemKey = `${category.id}-${index}`;
                      const isOpen = openItems.has(itemKey);

                      return (
                        <div key={itemKey}>
                          <button
                            type="button"
                            onClick={() => toggleItem(category.id, index)}
                            className="flex w-full items-center justify-between gap-4 px-5 py-4 text-right transition-colors hover:bg-zinc-50 sm:px-6 dark:hover:bg-zinc-900/50"
                            aria-expanded={isOpen}
                            aria-controls={`faq-answer-${itemKey}`}
                          >
                            <span className="flex-1 text-sm font-medium text-zinc-900 sm:text-base dark:text-white">
                              {item.question}
                            </span>
                            <motion.svg
                              animate={{ rotate: isOpen ? 180 : 0 }}
                              transition={{ duration: 0.2 }}
                              className="h-4 w-4 flex-shrink-0 text-zinc-400"
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
                                id={`faq-answer-${itemKey}`}
                                role="region"
                                key="answer"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <div className="bg-brand-50/40 px-5 py-4 sm:px-6 dark:bg-brand-100/5">
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
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Still need help CTA ─────────────────────────────────────── */}
        <section className="border-t border-zinc-100 bg-gradient-to-b from-white to-brand-50/50 px-4 py-16 dark:border-zinc-800 dark:from-zinc-950 dark:to-blue-500/5">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-xl text-center"
          >
            <p className="mb-2 text-3xl" aria-hidden="true">
              💬
            </p>
            <h2 className="mb-2 text-xl font-bold text-zinc-900 dark:text-white">
              לא מצאתם תשובה?
            </h2>
            <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
              צוות התמיכה שלנו כאן בשבילכם. שלחו לנו הודעה ונחזור אליכם בהקדם.
            </p>
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/contact"
                className="inline-flex h-11 items-center justify-center rounded-full bg-brand-500 px-8 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-600"
              >
                צרו קשר עכשיו
              </Link>
              <Link
                href="/help"
                className="inline-flex h-11 items-center justify-center rounded-full border border-zinc-200 bg-white px-8 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                מרכז העזרה
              </Link>
            </div>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
