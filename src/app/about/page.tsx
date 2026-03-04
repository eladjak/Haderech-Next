"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

/* ─── Animation variants ──────────────────────────────────────────── */

const fadeIn = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55 } },
};

const fadeInLeft = {
  hidden: { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.55 } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.88 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.45 } },
};

/* ─── Data ────────────────────────────────────────────────────────── */

const PHASES = [
  {
    num: 1,
    title: "גישה",
    subtitle: "Approach",
    desc: "עבודה פנימית, סיפורים מעצבים, גבולות בריאים – הכנה של האדם הפנימי.",
    color: "from-brand-400 to-brand-600",
    bg: "bg-brand-50 dark:bg-brand-100/10",
    border: "border-brand-200 dark:border-brand-200/25",
    text: "text-brand-600 dark:text-brand-300",
  },
  {
    num: 2,
    title: "תקשורת",
    subtitle: "Communication",
    desc: "היכרות עצמית עמוקה, שפת רגשות, ביטוי צרכים – הכלים לשיחה אמיתית.",
    color: "from-blue-500 to-blue-600",
    bg: "bg-blue-50 dark:bg-blue-50/10",
    border: "border-blue-100 dark:border-blue-100/20",
    text: "text-blue-500 dark:text-blue-400",
  },
  {
    num: 3,
    title: "מעבר ומשיכה",
    subtitle: "Transition & Attraction",
    desc: "אומץ ליצור קשר, כיצד לגשת להיכרויות, ניהול דייטים ראשונים בביטחון.",
    color: "from-accent-400 to-accent-500",
    bg: "bg-amber-50 dark:bg-amber-50/10",
    border: "border-amber-100 dark:border-amber-100/20",
    text: "text-accent-500 dark:text-accent-300",
  },
  {
    num: 4,
    title: "חיבור וכימיה",
    subtitle: "Connection & Chemistry",
    desc: "בניית כימיה אמיתית, הקשבה עמוקה, זיהוי הזדמנויות לחיבור.",
    color: "from-rose-400 to-brand-500",
    bg: "bg-rose-50 dark:bg-rose-50/10",
    border: "border-rose-100 dark:border-rose-100/20",
    text: "text-rose-600 dark:text-rose-400",
  },
  {
    num: 5,
    title: "אינטימיות",
    subtitle: "Intimacy",
    desc: "פגיעות בטוחה, קרבה רגשית אמיתית, 36 השאלות להתאהבות.",
    color: "from-purple-400 to-purple-600",
    bg: "bg-purple-50 dark:bg-purple-50/10",
    border: "border-purple-100 dark:border-purple-100/20",
    text: "text-purple-600 dark:text-purple-400",
  },
  {
    num: 6,
    title: "מחויבות",
    subtitle: "Commitment",
    desc: "קבלת החלטה מודעת, כניסה לזוגיות רשמית ובניית עתיד משותף.",
    color: "from-emerald-400 to-emerald-600",
    bg: "bg-emerald-50 dark:bg-emerald-50/10",
    border: "border-emerald-100 dark:border-emerald-100/20",
    text: "text-emerald-600 dark:text-emerald-400",
  },
];

const VALUES = [
  {
    emoji: "🔍",
    title: "אמת",
    desc: "אנחנו מאמינים בכנות מוחלטת – עם עצמנו ועם הפרטנר. אמת היא הבסיס של כל חיבור אמיתי.",
    color: "bg-brand-50 dark:bg-brand-100/10 border-brand-100 dark:border-brand-200/20",
    badge: "text-brand-600 dark:text-brand-300 bg-brand-100 dark:bg-brand-200/20",
  },
  {
    emoji: "🛠",
    title: "כלים",
    desc: "לא רק תיאוריה – כלים פרקטיים שעובדים בשטח. כל שיעור מסתיים עם משהו שאפשר לעשות עם זה מחר.",
    color: "bg-blue-50 dark:bg-blue-50/10 border-blue-100 dark:border-blue-100/20",
    badge: "text-blue-500 dark:text-blue-400 bg-blue-100 dark:bg-blue-100/20",
  },
  {
    emoji: "🤝",
    title: "כבוד",
    desc: "כבוד לעצמך, לפרטנר ולתהליך. כל אדם בדרכו, בקצב שלו – ואנחנו כאן לליוות, לא לשפוט.",
    color: "bg-amber-50 dark:bg-amber-50/10 border-amber-100 dark:border-amber-100/20",
    badge: "text-accent-500 dark:text-accent-300 bg-amber-100 dark:bg-amber-100/20",
  },
];

const STATS = [
  { value: "461", label: "זוגות מצאו אהבה", icon: "❤️" },
  { value: "73", label: "שיעורים מקצועיים", icon: "🎬" },
  { value: "15+", label: "שנות ניסיון", icon: "⭐" },
  { value: "6", label: "שלבים מוכחים", icon: "🗺️" },
];

const DIFFERENTIATORS = [
  {
    icon: "🤖",
    title: "AI מאמן אישי 24/7",
    desc: "צ'אט עם AI שמלווה אותך לאורך כל הדרך – עונה על שאלות, מנחה ומעודד בכל שעה.",
  },
  {
    icon: "🎭",
    title: "סימולטור דייטים מתקדם",
    desc: "התאמן על שיחות ודייטים בסביבה בטוחה לפני שהולכים לעולם האמיתי.",
  },
  {
    icon: "👥",
    title: "קהילה תומכת",
    desc: "הצטרף לאנשים בדרך – שתף, שאל ותמוך. אתה לא לבד במסע הזה.",
  },
  {
    icon: "📊",
    title: "שיטה מבוססת מחקר",
    desc: "15 שנות עבודה עם מאות זוגות + ממצאים מהפסיכולוגיה החיובית ומחקרי קשרים.",
  },
];

/* ─── Page Component ──────────────────────────────────────────────── */

export default function AboutPage() {
  return (
    <div className="min-h-dvh bg-[var(--background)]">
      <Header />

      <main id="main-content">
        {/* ── Hero ──────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden pb-24 pt-20 md:pb-32 md:pt-28">
          {/* Background image */}
          <div
            className="pointer-events-none absolute inset-0"
            aria-hidden="true"
          >
            <Image
              src="/images/hero.jpg"
              alt=""
              fill
              className="object-cover opacity-10 dark:opacity-7"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[var(--background)]/70 via-[var(--background)]/85 to-[var(--background)]" />
          </div>

          {/* Decorations */}
          <div
            className="pointer-events-none absolute inset-0 overflow-hidden"
            aria-hidden="true"
          >
            <div className="absolute -top-20 right-1/3 h-80 w-80 rounded-full bg-brand-100/50 blur-3xl dark:bg-brand-100/12" />
            <div className="absolute top-28 left-1/4 h-64 w-64 rounded-full bg-blue-50/40 blur-3xl dark:bg-blue-100/8" />
            <div className="absolute bottom-0 right-1/4 h-48 w-48 rounded-full bg-accent-300/20 blur-3xl dark:bg-accent-300/8" />
          </div>

          <div className="container relative mx-auto px-4 text-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="mx-auto max-w-3xl"
            >
              {/* Badge */}
              <motion.div variants={fadeIn}>
                <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-600 dark:border-brand-200/30 dark:bg-brand-50/50 dark:text-brand-300">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-500" />
                  הסיפור שמאחורי הפלטפורמה
                </span>
              </motion.div>

              <motion.h1
                variants={fadeIn}
                className="mb-5 text-4xl font-extrabold leading-tight text-blue-500 dark:text-white md:text-5xl lg:text-6xl"
              >
                הסיפור שלנו
              </motion.h1>

              <motion.p
                variants={fadeIn}
                className="mx-auto max-w-2xl text-lg leading-relaxed text-blue-500/70 dark:text-zinc-400"
              >
                אומנות הקשר הוקמה מתוך אמונה אחת פשוטה: כל אחד ואחת ראויים
                לאהבה אמיתית. "הדרך" היא הפלטפורמה שהפכה 15 שנות ניסיון
                לתהליך מובנה ועוצמתי שעובד.
              </motion.p>
            </motion.div>
          </div>
        </section>

        {/* ── The Story ─────────────────────────────────────────────── */}
        <section className="py-20 md:py-24">
          <div className="container mx-auto px-4">
            <div className="mx-auto grid max-w-5xl gap-12 md:grid-cols-2 md:items-center">
              {/* Text */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                variants={stagger}
              >
                <motion.div variants={fadeIn}>
                  <span className="mb-3 inline-block rounded-lg bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-600 dark:bg-brand-100/15 dark:text-brand-300">
                    מי אנחנו
                  </span>
                </motion.div>

                <motion.h2
                  variants={fadeIn}
                  className="mb-5 text-3xl font-bold text-blue-500 dark:text-white md:text-4xl"
                >
                  15 שנה. אלפי שיחות.
                  <br />
                  <span className="bg-gradient-to-l from-brand-500 to-accent-400 bg-clip-text text-transparent">
                    461 זוגות.
                  </span>
                </motion.h2>

                <motion.div
                  variants={stagger}
                  className="space-y-4 text-blue-500/70 dark:text-zinc-400"
                >
                  <motion.p variants={fadeIn} className="leading-relaxed">
                    אומנות הקשר נוסדה לפני למעלה מ-15 שנה על ידי מטפלים
                    ומאמנים שראו שוב ושוב אנשים מדהימים שנתקעים בדרך לזוגיות.
                    לא מחוסר רצון – אלא מחוסר כלים.
                  </motion.p>
                  <motion.p variants={fadeIn} className="leading-relaxed">
                    מאז ליווינו מאות לקוחות בהתאמה אישית, ראינו מה עובד ומה
                    לא, מה אנשים באמת צריכים ואיפה הם נתקעים. "הדרך" היא
                    המיטב של כל הידע הזה – ארוז בתהליך ברור, נגיש, ועם
                    ליווי של AI חכם.
                  </motion.p>
                  <motion.p variants={fadeIn} className="leading-relaxed">
                    הגישה שלנו אישית ואותנטית. אנחנו לא מציעים "שיטות פיק-אפ"
                    או טריקים – אלא עבודה אמיתית שמביאה תוצאות אמיתיות.
                  </motion.p>
                </motion.div>
              </motion.div>

              {/* Visual card */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                variants={fadeInLeft}
                className="relative"
              >
                <div className="relative overflow-hidden rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-50 to-white p-8 shadow-xl shadow-brand-100/30 dark:border-brand-200/20 dark:from-brand-100/10 dark:to-blue-50/5 dark:shadow-none">
                  {/* Decorative circles */}
                  <div
                    className="pointer-events-none absolute -top-12 -left-12 h-40 w-40 rounded-full bg-brand-100/60 blur-2xl dark:bg-brand-100/15"
                    aria-hidden="true"
                  />
                  <div
                    className="pointer-events-none absolute -bottom-8 -right-8 h-32 w-32 rounded-full bg-accent-300/30 blur-2xl dark:bg-accent-300/10"
                    aria-hidden="true"
                  />

                  <div className="relative space-y-6">
                    {/* Quote */}
                    <div className="text-5xl leading-none text-brand-300 dark:text-brand-400/60">
                      &ldquo;
                    </div>
                    <p className="text-lg font-medium leading-relaxed text-blue-500 dark:text-zinc-200">
                      כל אחד ואחת ראויים לאהבה אמיתית. המשימה שלנו היא לתת
                      לכם את הכלים, האומץ והדרך להגיע אליה.
                    </p>
                    <div className="flex items-center gap-3 pt-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-600 text-lg">
                        ❤️
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-blue-500 dark:text-zinc-200">
                          צוות אומנות הקשר
                        </div>
                        <div className="text-xs text-blue-500/60 dark:text-zinc-500">
                          מייסדי הפלטפורמה
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── Stats ─────────────────────────────────────────────────── */}
        <section className="border-y border-brand-100/50 bg-gradient-to-l from-brand-50/40 via-white to-blue-50/30 py-16 dark:border-blue-100/15 dark:bg-gradient-to-l dark:from-brand-100/8 dark:via-transparent dark:to-blue-50/5">
          <div className="container mx-auto px-4">
            <motion.div
              className="grid grid-cols-2 gap-8 md:grid-cols-4"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={stagger}
            >
              {STATS.map((stat) => (
                <motion.div
                  key={stat.label}
                  variants={scaleIn}
                  className="text-center"
                >
                  <div className="mb-2 text-3xl">{stat.icon}</div>
                  <div className="mb-1 text-3xl font-extrabold text-blue-500 dark:text-white md:text-4xl">
                    {stat.value}
                  </div>
                  <div className="text-sm text-blue-500/60 dark:text-zinc-400">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── Methodology – 6 Phases ────────────────────────────────── */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4">
            {/* Section header */}
            <motion.div
              className="mx-auto mb-14 max-w-2xl text-center"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={stagger}
            >
              <motion.div variants={fadeIn}>
                <span className="mb-3 inline-block rounded-lg bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-500 dark:bg-blue-50/15 dark:text-blue-400">
                  המתודולוגיה
                </span>
              </motion.div>
              <motion.h2
                variants={fadeIn}
                className="mb-4 text-3xl font-bold text-blue-500 dark:text-white md:text-4xl"
              >
                6 שלבים לזוגיות שאתה ראוי לה
              </motion.h2>
              <motion.p
                variants={fadeIn}
                className="text-blue-500/70 dark:text-zinc-400"
              >
                תהליך מובנה, מדורג ומוכח שמוביל מהיכן שאתה עכשיו עד לזוגיות
                אמיתית. כל שלב בונה על הקודם.
              </motion.p>
            </motion.div>

            {/* Phases grid */}
            <motion.div
              className="mx-auto grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-3"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={stagger}
            >
              {PHASES.map((phase) => (
                <motion.div
                  key={phase.num}
                  variants={fadeIn}
                  className={`relative overflow-hidden rounded-2xl border p-6 ${phase.bg} ${phase.border} transition-shadow hover:shadow-md`}
                >
                  {/* Number badge */}
                  <div
                    className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${phase.color} text-sm font-bold text-white shadow-sm`}
                  >
                    {phase.num}
                  </div>

                  <div className={`mb-0.5 text-xs font-medium uppercase tracking-wider opacity-60 ${phase.text}`}>
                    {phase.subtitle}
                  </div>
                  <h3 className={`mb-2 text-xl font-bold ${phase.text}`}>
                    {phase.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-blue-500/65 dark:text-zinc-400">
                    {phase.desc}
                  </p>

                  {/* Large faint number decoration */}
                  <div
                    className={`pointer-events-none absolute -bottom-3 -left-1 text-8xl font-black opacity-6 ${phase.text}`}
                    aria-hidden="true"
                  >
                    {phase.num}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── Core Values ───────────────────────────────────────────── */}
        <section className="bg-gradient-to-b from-transparent via-brand-50/25 to-transparent py-20 dark:via-brand-100/5 md:py-24">
          <div className="container mx-auto px-4">
            <motion.div
              className="mx-auto mb-12 max-w-xl text-center"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={stagger}
            >
              <motion.div variants={fadeIn}>
                <span className="mb-3 inline-block rounded-lg bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-600 dark:bg-brand-100/15 dark:text-brand-300">
                  הערכים שלנו
                </span>
              </motion.div>
              <motion.h2
                variants={fadeIn}
                className="mb-3 text-3xl font-bold text-blue-500 dark:text-white md:text-4xl"
              >
                מה מנחה אותנו
              </motion.h2>
              <motion.p
                variants={fadeIn}
                className="text-blue-500/70 dark:text-zinc-400"
              >
                שלושה עמודי יסוד שעומדים בבסיס כל מה שאנחנו עושים
              </motion.p>
            </motion.div>

            <motion.div
              className="mx-auto grid max-w-4xl gap-6 md:grid-cols-3"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={stagger}
            >
              {VALUES.map((val) => (
                <motion.div
                  key={val.title}
                  variants={scaleIn}
                  className={`rounded-2xl border p-7 ${val.color} text-center transition-shadow hover:shadow-md`}
                >
                  <div className="mb-4 text-4xl">{val.emoji}</div>
                  <div
                    className={`mb-2 inline-block rounded-full px-3 py-0.5 text-xs font-bold uppercase tracking-wider ${val.badge}`}
                  >
                    {val.title}
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-blue-500/70 dark:text-zinc-400">
                    {val.desc}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── What Makes Us Different ───────────────────────────────── */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4">
            <motion.div
              className="mx-auto mb-12 max-w-xl text-center"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={stagger}
            >
              <motion.div variants={fadeIn}>
                <span className="mb-3 inline-block rounded-lg bg-accent-300/20 px-3 py-1 text-sm font-semibold text-accent-500 dark:bg-accent-300/15 dark:text-accent-300">
                  למה דווקא אנחנו?
                </span>
              </motion.div>
              <motion.h2
                variants={fadeIn}
                className="mb-3 text-3xl font-bold text-blue-500 dark:text-white md:text-4xl"
              >
                מה הופך את "הדרך" לשונה
              </motion.h2>
              <motion.p
                variants={fadeIn}
                className="text-blue-500/70 dark:text-zinc-400"
              >
                לא קורס סטנדרטי – חוויה מלאה עם ליווי, תרגול ותמיכה
              </motion.p>
            </motion.div>

            <motion.div
              className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={stagger}
            >
              {DIFFERENTIATORS.map((item) => (
                <motion.div
                  key={item.title}
                  variants={fadeIn}
                  className="flex gap-5 rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/60"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-50 to-brand-100/80 text-2xl dark:from-brand-100/15 dark:to-brand-100/5">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="mb-1.5 font-bold text-blue-500 dark:text-white">
                      {item.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-blue-500/65 dark:text-zinc-400">
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── CTA ───────────────────────────────────────────────────── */}
        <section className="pb-24 pt-4 md:pb-32">
          <div className="container mx-auto px-4">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={fadeIn}
              className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-blue-600 via-blue-500 to-blue-600 px-8 py-16 text-center shadow-2xl md:px-16"
            >
              {/* Background decorations */}
              <div
                className="pointer-events-none absolute inset-0 overflow-hidden"
                aria-hidden="true"
              >
                <div className="absolute -top-16 -right-16 h-64 w-64 rounded-full bg-white/5 blur-2xl" />
                <div className="absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-brand-300/15 blur-2xl" />
                <div className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-400/10 blur-3xl" />
              </div>

              <div className="relative">
                <div className="mb-4 text-4xl">🚀</div>
                <h2 className="mb-4 text-3xl font-extrabold text-white md:text-4xl">
                  מוכנים להתחיל?
                </h2>
                <p className="mx-auto mb-8 max-w-lg text-lg text-white/80">
                  הצטרפו ל-461 זוגות שכבר מצאו אהבה אמיתית. המסע שלכם מתחיל
                  עכשיו.
                </p>
                <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                  <Link
                    href="/sign-up"
                    className="inline-flex h-13 items-center justify-center rounded-xl bg-white px-8 text-base font-bold text-blue-600 shadow-lg transition-all hover:shadow-xl hover:brightness-105"
                  >
                    הרשמה חינם
                    <svg
                      className="mr-2 h-4 w-4 rotate-180"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                      />
                    </svg>
                  </Link>
                  <Link
                    href="/courses"
                    className="inline-flex h-13 items-center justify-center rounded-xl border border-white/30 bg-white/10 px-8 text-base font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20"
                  >
                    צפו בקורסים
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
