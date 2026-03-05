"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

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
          "הדרך היא פלטפורמת למידה מקיפה בעברית, שנבנתה כדי לעזור לרווקים ורווקות לפתח מיומנויות תקשורת, היכרות ודייטינג. הפלטפורמה משלבת קורסים מקצועיים מובנים ב-6 שלבים, מאמן AI אישי שזמין 24/7, סימולטור דייטים אינטראקטיבי לתרגול בסביבה בטוחה, וקהילה תומכת של לומדים. כל התכנים מותאמים לתרבות הישראלית ונכתבו בעברית.",
      },
      {
        question: "למי הפלטפורמה מיועדת?",
        answer:
          "הפלטפורמה מיועדת לכל מי שרוצה לשפר את מיומנויות ההיכרות והתקשורת שלו. בין אם אתם רווקים בתחילת הדרך שמחפשים כלים להיכרות, אנשים שחוזרים לעולם הדייטינג אחרי הפסקה, או אלו שרוצים לחזק את הביטחון העצמי שלהם בשיחות ובמפגשים - התוכן מתאים לכל הרמות ולכל גיל.",
      },
      {
        question: "האם צריך ידע קודם כדי להתחיל?",
        answer:
          "לא צריך שום ידע קודם. הקורסים בנויים בצורה הדרגתית מהבסיס ועד לרמה מתקדמת. שלב 1 (גישה) מתחיל מעבודה פנימית וגבולות בריאים, ומשם מתקדמים דרך תקשורת, היכרות, דייטינג, מערכת יחסים ועד בניית עתיד משותף. כל אחד יכול להצטרף ולהתחיל מהנקודה שמתאימה לו.",
      },
      {
        question: "האם הפלטפורמה בחינם?",
        answer:
          'הפלטפורמה מציעה גישה חינמית שכוללת קורסים בסיסיים, 30 הודעות חודשיות למאמן AI, ו-3 סשנים חודשיים בסימולטור. למי שרוצה גישה מלאה לכל התכנים, כלי ה-AI ללא הגבלה, וליווי מתקדם - ישנם מסלולי פרימיום במחירים נגישים. בדקו את עמוד "תוכניות ומחירים" לפרטים.',
      },
      {
        question: "איך מתחילים?",
        answer:
          'פשוט מאוד: נרשמים עם אימייל או חשבון Google, עוברים את שאלון ההיכרות הקצר (2 דקות) שמתאים את החוויה אליכם, ומתחילים ללמוד. מומלץ להתחיל מהקורס "יסודות הגישה" ולהתנסות עם מאמן ה-AI כבר מהיום הראשון.',
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
          "הספרייה שלנו כוללת מגוון קורסים שמכסים את כל שלבי ההיכרות והדייטינג - מעבודה פנימית וביטחון עצמי, דרך תקשורת ושפת רגשות, ועד ניהול דייטים ובניית מערכת יחסים. הספרייה מתעדכנת באופן שוטף עם תכנים חדשים. כל קורס כולל שיעורי וידאו, תוכן כתוב, בחנים ותרגילים מעשיים.",
      },
      {
        question: "האם יש תעודות סיום?",
        answer:
          "כן! כשמשלימים 80% ויותר מהשיעורים בקורס, מקבלים תעודת סיום דיגיטלית עם מספר ייחודי לאימות. ניתן לשתף את התעודה ברשתות החברתיות או להוריד אותה כקובץ. התעודות מופיעות גם בפרופיל האישי שלכם.",
      },
      {
        question: "כמה זמן לוקח להשלים קורס?",
        answer:
          "כל הקורסים הם בקצב אישי - אתם לומדים מתי ואיך שנוח לכם. קורס ממוצע כולל בין 6 ל-20 שיעורים, וכל שיעור לוקח בין 10 ל-25 דקות. רוב הלומדים משלימים קורס בתוך 2-4 שבועות עם למידה של 15-30 דקות ביום. ההתקדמות שלכם נשמרת אוטומטית ואפשר להמשיך מאיפה שעצרתם.",
      },
      {
        question: "האם אפשר ללמוד מהנייד?",
        answer:
          "בהחלט! הפלטפורמה מותאמת לחלוטין לכל מכשיר - מחשב, טאבלט וסמארטפון. ניתן גם להוסיף את האתר למסך הבית כאפליקציית PWA לחוויה דמוית אפליקציה. כל הפיצ'רים זמינים בנייד כולל צפייה בוידאו, בחנים, צ'אט AI וסימולטור.",
      },
      {
        question: "מה קורה אם לא מסיימים קורס?",
        answer:
          "שום דבר רע! ההתקדמות שלכם נשמרת אוטומטית ולנצח. אפשר לחזור לקורס בכל עת ולהמשיך מאותה נקודה בדיוק. אפילו ההערות שרשמתם והבחנים שעשיתם נשמרים. אין לחץ של זמן - למדו בקצב שלכם.",
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
          'הפלטפורמה כוללת מספר כלי AI מתקדמים: מאמן אישי שעונה על שאלות ונותן עצות מותאמות, מצב "תרגול" לאימון שיחות, מצב "ניתוח" לפירוק מצבים שקרו לכם, סימולטור דייטים עם דמויות מציאותיות, ועוד כלים כמו מחולל נושאי שיחה ובוחן ערכים. הכל בעברית ומותאם לתרבות המקומית.',
      },
      {
        question: "האם ה-AI מחליף ייעוץ אישי מקצועי?",
        answer:
          "לא. כלי ה-AI שלנו הם כלי למידה ותרגול, לא תחליף לטיפול או ייעוץ מקצועי. הם נועדו לעזור בפיתוח מיומנויות תקשורת ודייטינג, לתת פידבק ולתרגל תרחישים. אם אתם מרגישים צורך בליווי מקצועי, אנחנו ממליצים לפנות לאיש מקצוע ואפילו מציעים אפשרות ליעוץ אישי דרך שירות הליווי (Mentoring) שלנו.",
      },
      {
        question: "מי רואה את המידע שאני שולח ל-AI?",
        answer:
          "הפרטיות שלכם חשובה לנו מאוד. השיחות עם מאמן ה-AI פרטיות ומוצפנות. אנחנו לא חולקים את תוכן השיחות עם גורמים שלישיים ולא משתמשים בהן לפרסום. ניתן למחוק את היסטוריית השיחות בכל עת מהגדרות החשבון.",
      },
      {
        question: "האם הכלים עובדים בעברית?",
        answer:
          "כן, כל הכלים עובדים בעברית מלאה. ה-AI מאומן להבין ולענות בעברית טבעית, כולל סלנג ישראלי וניואנסים תרבותיים. הממשק כולו בעברית עם תמיכה מלאה בכיוון RTL (מימין לשמאל). ניתן גם לכתוב באנגלית אם מעדיפים.",
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
          "סימולטור הדייטים הוא כלי ייחודי שמאפשר לכם לתרגל שיחות והיכרויות בסביבה בטוחה ונטולת לחץ. אתם בוחרים תרחיש (למשל: פגישה ראשונה בבית קפה, שיחת טלפון ראשונה, דייט שני) ומנהלים שיחה עם דמות וירטואלית שמגיבה כמו אדם אמיתי - עם רגשות, אישיות וסיפור רקע.",
      },
      {
        question: "האם הסימולטור מבוסס על AI?",
        answer:
          "כן, הסימולטור מופעל על ידי מודל AI מתקדם (Claude) שאומן לדמות שיחות אנושיות מציאותיות. כל דמות בנויה עם אישיות מוגדרת, רקע אישי, העדפות וסגנון תקשורת ייחודי. הדמויות יכולות להביע רגשות, להגיב לבדיחות, לגלות עניין או חוסר עניין - בדיוק כמו בשיחה אמיתית.",
      },
      {
        question: "כמה תרחישים זמינים?",
        answer:
          "כרגע יש מגוון תרחישים ברמות קושי שונות - קל, בינוני ומאתגר. התרחישים כוללים סיטואציות כמו: פגישה ראשונה, שיחת טלפון, דייט ראשון, שיחה עם חברים משותפים, ועוד. כל תרחיש מציע חוויה שונה עם דמות בעלת אישיות ורקע ייחודיים. תרחישים חדשים מתווספים באופן שוטף.",
      },
      {
        question: "האם התוצאות של הסימולטור נשמרות?",
        answer:
          'כן! בסוף כל סשן מקבלים ניתוח מפורט שכולל ציון כללי, נקודות חוזק, תחומים לשיפור והמלצות ספציפיות. כל הסשנים נשמרים בהיסטוריה האישית שלכם, כך שתוכלו לעקוב אחרי ההתקדמות לאורך זמן. ניתן לצפות בסשנים קודמים בעמוד "היסטוריית סימולציות".',
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
          "המנוי הפרימיום פותח גישה מלאה לכל הקורסים (כולל מתקדמים), הודעות ללא הגבלה למאמן AI, סשנים ללא הגבלה בסימולטור, תעודות סיום, גישה לקהילת הפרימיום, ועוד תכונות מתקדמות. ישנם מספר מסלולים במחירים שונים - מחודשי ועד שנתי עם הנחה משמעותית.",
      },
      {
        question: "האם אפשר לבטל את המנוי בכל עת?",
        answer:
          "בהחלט. ניתן לבטל את המנוי בכל רגע דרך הגדרות החשבון, ללא דמי ביטול וללא שאלות. אחרי הביטול, תמשיכו ליהנות מהגישה הפרימיומית עד סוף תקופת החיוב הנוכחית. לאחר מכן, החשבון יחזור למסלול החינמי.",
      },
      {
        question: "אילו אמצעי תשלום מקבלים?",
        answer:
          "אנחנו מקבלים כרטיסי אשראי (ויזה, מאסטרקארד, אמריקן אקספרס), Google Pay, Apple Pay ו-PayPal. כל התשלומים מעובדים בצורה מאובטחת דרך Stripe. ניתן גם לשלם בביט (Bit) דרך PayPal.",
      },
      {
        question: "האם יש הנחות או מבצעים?",
        answer:
          'כן! אנחנו מציעים הנחות בהזדמנויות שונות: הנחה משמעותית על מנוי שנתי (עד 40% לעומת חודשי), מבצעים עונתיים בחגים, הנחות לסטודנטים ולחיילים, ותוכנית "חבר מביא חבר" עם הטבות לשני הצדדים. עקבו אחרינו ברשתות החברתיות לעדכונים.',
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
          "המידע האישי שלכם משמש אך ורק לצורך אספקת השירות - הצגת ההתקדמות, התאמת תכנים, ושמירת העדפות. אנחנו לא מוכרים ולא חולקים מידע אישי עם צדדים שלישיים. לא נשתמש בתכני השיחות עם ה-AI לפרסום. מדיניות הפרטיות המלאה שלנו זמינה באתר.",
      },
      {
        question: "האם אפשר למחוק את החשבון?",
        answer:
          'כן, ניתן למחוק את החשבון באופן מלא מהגדרות החשבון. המחיקה כוללת את כל המידע: פרופיל, היסטוריית למידה, שיחות AI, סשנים בסימולטור, תגובות בקהילה והערות. המחיקה היא סופית ובלתי הפיכה - תקבלו אישור לפני ביצוע. התהליך עומד בדרישות חוק הגנת הפרטיות ותקנות ה-GDPR.',
      },
      {
        question: "איך אתם מגנים על המידע?",
        answer:
          "אנחנו משתמשים באמצעי אבטחה מתקדמים: הצפנת SSL/TLS לכל התקשורת, אימות דו-שלבי (2FA) אופציונלי, אחסון מאובטח בשרתי ענן מוגנים, גיבויים אוטומטיים, ומערכת הרשאות קפדנית. מערכת האימות שלנו מבוססת על Clerk, אחד הפתרונות המוכרים והמאובטחים ביותר בתעשייה.",
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
              <p className="text-lg text-zinc-600 dark:text-zinc-400">
                מצאו תשובות לכל השאלות על הפלטפורמה, הקורסים וכלי ה-AI
              </p>
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
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
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
