"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CountUp } from "@/components/ui/count-up";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

// Stories may include historical seed/demo records. Keep the marketing surface
// fail-closed until each item has provenance and publication consent.
const VERIFIED_PUBLIC_STORIES_AVAILABLE: boolean = false;

export default function Home() {
  return (
    <div className="min-h-dvh bg-[var(--background)]">
      <Header />

      <main id="main-content" tabIndex={-1}>
      {/* Hero Section */}
      <section className="relative overflow-hidden animate-hero-gradient" role="region" aria-labelledby="hero-heading">
        {/* Hero background image */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <Image
            src="/images/hero.jpg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover opacity-12 dark:opacity-8"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--background)]/70 to-[var(--background)]" />
        </div>
        {/* Background decoration */}
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden"
          aria-hidden="true"
        >
          <div className="animate-float-slow absolute -top-24 right-1/4 h-96 w-96 rounded-full bg-brand-100/40 blur-3xl dark:bg-brand-100/15" />
          <div className="animate-float absolute top-20 left-1/4 h-72 w-72 rounded-full bg-blue-50/30 blur-3xl dark:bg-blue-100/10" />
          <div className="animate-float-slow absolute -bottom-12 right-1/3 h-64 w-64 rounded-full bg-accent-300/20 blur-3xl dark:bg-accent-400/8" />
        </div>

        <div className="container relative mx-auto px-4 pb-20 pt-24 text-center md:pb-28 md:pt-32">
          <motion.div
            className="mx-auto max-w-3xl"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            {/* Badge */}
            <motion.div variants={fadeIn}>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-600 dark:border-brand-200/30 dark:bg-brand-50/50 dark:text-brand-300">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-500 animate-pulse" aria-hidden="true" />
                12 שבועות • 75 שיעורים • 8 מסמכי תרגול
              </div>
            </motion.div>

            <motion.h1
              id="hero-heading"
              variants={fadeIn}
              className="text-shadow-hero mb-6 text-4xl font-black leading-[1.15] tracking-tight text-blue-500 dark:text-white md:text-5xl lg:text-6xl xl:text-7xl"
            >
              הדרך שלך
              <br />
              <span className="gradient-text bg-gradient-to-l from-brand-500 via-brand-400 to-accent-400">
                לזוגיות שאתה ראוי לה
              </span>
            </motion.h1>

            <motion.p
              variants={fadeIn}
              className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-blue-500/70 dark:text-zinc-400"
            >
              תוכנית &quot;הדרך&quot; של אומנות הקשר היא מסלול למידה ותרגול בן
              12 שבועות. היא כוללת שיעורים, מסמכי תרגול וכלי AI אוטומטיים
              שעלולים לטעות ואינם תחליף לייעוץ מקצועי.
            </motion.p>

            <motion.div
              variants={fadeIn}
              className="flex flex-col items-center justify-center gap-4 sm:flex-row"
            >
              <motion.div
                animate={{ boxShadow: ["0 0 0 0 rgba(232,121,73,0.4)", "0 0 0 12px rgba(232,121,73,0)", "0 0 0 0 rgba(232,121,73,0)"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="rounded-xl"
              >
                <Link
                  href="/courses"
                  className="inline-flex h-12 items-center justify-center rounded-xl bg-gradient-to-l from-brand-500 to-brand-600 px-8 text-base font-semibold text-white shadow-lg shadow-brand-500/25 transition-all hover:shadow-xl hover:shadow-brand-500/30 hover:brightness-110 active:scale-[0.97]"
                >
                  התחילו את המסע
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
              </motion.div>
              <Link
                href="/contact"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-blue-500/20 bg-white px-8 text-base font-semibold text-blue-500 shadow-sm transition-all hover:border-brand-200 hover:bg-brand-50 hover:text-brand-600 active:scale-[0.97] dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:hover:border-brand-200/30 dark:hover:bg-brand-50/20"
              >
                בדקו זמינות
              </Link>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              variants={fadeIn}
              className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2"
            >
              <span className="flex items-center gap-1.5 text-sm text-blue-500/70 dark:text-zinc-400">
                <svg className="h-4 w-4 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
                12 שבועות
              </span>
              <span className="flex items-center gap-1.5 text-sm text-blue-500/70 dark:text-zinc-400">
                <svg className="h-4 w-4 text-accent-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
                75 שיעורים
              </span>
              <span className="flex items-center gap-1.5 text-sm text-blue-500/70 dark:text-zinc-400">
                <svg className="h-4 w-4 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                </svg>
                8 מסמכי תרגול
              </span>
            </motion.div>

            <motion.p
              variants={fadeIn}
              className="mt-4 text-sm text-blue-500/70 dark:text-zinc-400"
            >
              הרכישה והגישה לתוכן בתשלום אינן פתוחות כרגע; פתיחת חשבון לבדה
              אינה מקנה הרשאה לקורס.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Platform Stats Counter Bar */}
      <section className="relative overflow-hidden bg-gradient-to-l from-blue-500 via-blue-600 to-brand-500 py-12" role="region" aria-label="סטטיסטיקות הפלטפורמה">
        {/* Subtle pattern overlay */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.04]" aria-hidden="true"
          style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "24px 24px" }}
        />
        <div className="container relative mx-auto px-4">
          <motion.div
            className="grid grid-cols-2 gap-6 text-center md:grid-cols-4 md:gap-0"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
          >
            <StatItem value="12" label="שבועות" />
            <StatItem value="75" label="שיעורים" hasDivider />
            <StatItem value="8" label="מסמכי תרגול" hasDivider />
            <StatItem value="6" label="שלבי למידה" hasDivider />
          </motion.div>
        </div>
      </section>

      {/* 3 Values Section */}
      <section className="py-20 md:py-28" role="region" aria-labelledby="values-heading">
        <div className="container mx-auto px-4">
          <motion.div
            className="mx-auto mb-4 max-w-xl text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <span className="mb-3 inline-block text-sm font-semibold uppercase tracking-wider text-brand-500">
              הגישה שלנו
            </span>
            <h2 id="values-heading" className="mb-4 text-3xl font-bold text-blue-500 dark:text-white md:text-4xl">
              אמת. כלים. כבוד.
            </h2>
            <p className="text-blue-500/60 dark:text-zinc-400">
              שלושת הערכים שמנחים כל מה שאנחנו עושים
            </p>
          </motion.div>
          <motion.div
            className="mt-12 grid gap-6 md:grid-cols-3"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <FeatureCard
              iconBg="from-brand-500 to-brand-600"
              icon={
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
                  />
                </svg>
              }
              title="אמת"
              description="נבדיל בין עובדה, מקור, פרשנות והצעה לתרגול — ונאמר ביושר גם מה עדיין לא ידוע."
            />
            <FeatureCard
              iconBg="from-blue-500 to-blue-600"
              icon={
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11.42 15.17l-5.33-3.07a.75.75 0 010-1.3l5.33-3.07a.75.75 0 011.14.65v6.14a.75.75 0 01-1.14.65z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M20.25 12a8.25 8.25 0 11-16.5 0 8.25 8.25 0 0116.5 0z"
                  />
                </svg>
              }
              title="כלים"
              description="התוכן מציע תרגילים מעשיים שאפשר לבחור, להתאים, לדלג עליהם או לעצור לפי ההקשר והגבולות שלך."
            />
            <FeatureCard
              iconBg="from-accent-400 to-accent-500"
              icon={
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                  />
                </svg>
              }
              title="כבוד"
              description="אין ציון לערך שלך ואין נוסחה אחת לזוגיות. בחירה, פרטיות, הסכמה ובטיחות קודמות לכל תרגיל."
            />
          </motion.div>
        </div>
      </section>

      {/* What You Get Section */}
      <section className="border-t border-brand-100/30 bg-gradient-to-b from-brand-50/30 to-[var(--background)] py-20 dark:border-blue-100/10 dark:from-blue-50/5" role="region" aria-labelledby="ecosystem-heading">
        <div className="container mx-auto px-4">
          <motion.div
            className="mx-auto mb-4 max-w-xl text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <span className="mb-3 inline-block text-sm font-semibold uppercase tracking-wider text-brand-500">
              מה מחכה לך
            </span>
            <h2 id="ecosystem-heading" className="mb-8 text-3xl font-bold text-blue-500 dark:text-white md:text-4xl">
              לא סתם קורס - אקוסיסטם שלם
            </h2>
          </motion.div>
          <motion.div
            className="mx-auto mb-12 max-w-3xl"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <Image
              src="/images/illustrations/home-ecosystem.webp"
              alt="איור: כמה שבילים מתפתלים על פני גבעות בשעת דמדומים מתאחדים לדרך רחבה אחת שמובילה אל שמש זוהרת, ואנשים הולכים על השבילים השונים"
              width={1536}
              height={1024}
              sizes="(max-width: 768px) 100vw, 768px"
              className="w-full rounded-3xl shadow-lg ring-1 ring-black/5 dark:ring-white/10"
            />
          </motion.div>
          <motion.div
            className="mx-auto grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <EcosystemCard
              emoji="🎓"
              title='תוכנית "הדרך" - 12 שבועות'
              description="75 שיעורים, בחנים ו-8 מסמכי תרגול במסלול מובנה בן 12 שבועות."
              badge="ליבה"
            />
            <EcosystemCard
              emoji="🤖"
              title="כלי AI לתרגול"
              description="תרגול ומשוב אוטומטי המבוסס על תכני הקורס; הוא עלול לטעות ואינו ייעוץ מקצועי."
              badge="AI"
            />
            <EcosystemCard
              emoji="🎭"
              title="סימולטור דייטים"
              description="תרחישי תרגול עם דמויות בדיוניות ומשוב אוטומטי מוגבל."
              badge="AI"
            />
            <EcosystemCard
              emoji="🛠️"
              title="ארגז כלים אינטראקטיבי"
              description="בונה פרופיל, שאלון ערכים, פותחי שיחה, ביו בילדר."
              badge="כלים"
            />
            <EcosystemCard
              emoji="🧭"
              title="התקדמות אישית בקורס"
              description="מעקב פרטי אחר שיעורים ותרגולים, בלי דירוג מול אחרים ובלי להפוך קשרים למשחק."
              badge="למידה בקצב שלך"
            />
            <EcosystemCard
              emoji="📅"
              title="טיפ יומי ואתגרים"
              description="טיפים ואתגרי תרגול מתוך המאגר, שאפשר לבחור, לדלג עליהם או לעצור."
              badge="יומי"
            />
            <EcosystemCard
              emoji="📚"
              title="ספרייה עשירה"
              description="מאמרים ומשאבים לפי נושא; זמינות ומקור מצוינים בכל פריט כשהם מאומתים."
              badge="משאבים"
            />
            <EcosystemCard
              emoji="👥"
              title="קהילה, ייעוץ ותעודות"
              description="כלי קהילה ותיעוד סיום כאשר הם זמינים; תעודה אינה הסמכה מקצועית."
              badge="קהילה"
            />
          </motion.div>
        </div>
      </section>

      {/* Interactive Tools Showcase */}
      <section className="py-20 md:py-28" role="region" aria-labelledby="tools-heading">
        <div className="container mx-auto px-4">
          <motion.div
            className="mx-auto mb-4 max-w-xl text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <span className="mb-3 inline-block text-sm font-semibold uppercase tracking-wider text-brand-500">
              כלים אינטראקטיביים
            </span>
            <h2 id="tools-heading" className="mb-4 text-3xl font-bold text-blue-500 dark:text-white md:text-4xl">
              ארגז הכלים שלך לדייטינג
            </h2>
            <p className="text-blue-500/60 dark:text-zinc-400">
              כלים מעשיים שתוכל להשתמש בהם כבר היום
            </p>
          </motion.div>
          <motion.div
            className="mx-auto mt-12 grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <ToolCard
              emoji="💬"
              title="בונה פרופיל דייטינג"
              description="טיוטת פרופיל בשישה שלבים עם הצעות AI שדורשות בדיקה שלך"
              href="/tools/dating-profile"
            />
            <ToolCard
              emoji="✍️"
              title="בונה ביו AI"
              description="AI מציע טיוטת ביו; אין אבחון אישיות ואין הבטחה לביצועים בפלטפורמה"
              href="/tools/profile-builder"
            />
            <ToolCard
              emoji="💎"
              title="שאלון ערכים בזוגיות"
              description="כלי רפלקציה על העדפות וערכים, לא מבחן התאמה או אבחון"
              href="/tools/values-quiz"
            />
            <ToolCard
              emoji="🗣️"
              title="פותחי שיחה"
              description="רעיונות לפתיחת שיחה בדייט ראשון או בהודעה"
              href="/tools/conversation-starters"
            />
          </motion.div>
          <motion.div
            className="mt-8 text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <Link
              href="/tools"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-500 underline underline-offset-4 transition-colors hover:text-brand-600"
            >
              לכל הכלים
              <svg className="h-3.5 w-3.5 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 md:py-28" role="region" aria-labelledby="how-it-works-heading">
        <div className="container mx-auto px-4">
          <motion.div
            className="mx-auto mb-4 max-w-xl text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <span className="mb-3 inline-block text-sm font-semibold uppercase tracking-wider text-brand-500">
              6 שלבים למסע
            </span>
            <h2 id="how-it-works-heading" className="mb-12 text-3xl font-bold text-blue-500 dark:text-white md:text-4xl">
              איך תוכנית &quot;הדרך&quot; עובדת?
            </h2>
          </motion.div>
          <h4 className="sr-only">שישה שלבי התוכנית לפי שבועות</h4>
          <motion.div
            className="mx-auto grid max-w-5xl gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <PhaseCard step="1" color="from-brand-500 to-brand-600" title="גישה" weeks="שבועות 1-3" description="עבודה פנימית, סיפורים, גבולות" image="/images/illustrations/step-1.webp" imageAlt="איור: אדם יושב לבדו על גבעה בשעת דמדומים, פונה פנימה, ולמרגלותיו שתיל ושורשיו באדמה" />
            <PhaseCard step="2" color="from-blue-500 to-blue-600" title="תקשורת" weeks="שבועות 4-5" description="היכרות עצמית, רגשות, צרכים" image="/images/illustrations/step-2.webp" imageAlt="איור: שני אנשים עומדים זה מול זה על גבעה, ובועת דיבור רכה וריקה מרחפת ביניהם" />
            <PhaseCard step="3" color="from-accent-400 to-accent-500" title="משיכה" weeks="שבועות 6-9" description="אומץ, היכרויות, דייטים" image="/images/illustrations/step-3.webp" imageAlt="איור: שני שבילים מתפתלים על גבעות מתקרבים זה לזה, אדם הולך על כל אחד מהם, וזוהר חם במקום המפגש" />
            <PhaseCard step="4" color="from-brand-400 to-blue-500" title="חיבור" weeks="שבוע 10" description="כימיה, הקשבה, יצירת הזדמנויות" image="/images/illustrations/step-4.webp" imageAlt="איור: שני אנשים עומדים זה לצד זה על גבעה, ידיהם כמעט נוגעות, ומטילים צל משותף אחד" />
            <PhaseCard step="5" color="from-blue-400 to-brand-400" title="אינטימיות" weeks="שבוע 11" description="קרבה מבחירה, פרטיות ושאלות שאפשר לדלג עליהן" image="/images/illustrations/step-5.webp" imageAlt="איור: שני אנשים יושבים קרוב זה לזה על גבעה, מוקפים במעגל אחד של אור חם" />
            <PhaseCard step="6" color="from-blue-500 to-brand-500" title="מחויבות" weeks="שבוע 12" description="שיחה על ערכים, ציפיות ובחירה הדדית בלי לחץ" image="/images/illustrations/step-6.webp" imageAlt="איור: שני אנשים הולכים יחד במעלה שביל מתפתל לעבר שמש עולה, ובראש הגבעה נראית קשת" />
          </motion.div>
        </div>
      </section>

      {/* Purchase containment notice: paid offers are not yet approved or enabled. */}
      <section
        className="border-t border-brand-100/30 bg-gradient-to-b from-[var(--background)] to-brand-50/20 py-20 dark:border-blue-100/10 dark:to-blue-50/5"
        role="region"
        aria-labelledby="availability-heading"
      >
        <div className="container mx-auto px-4">
          <motion.div
            className="mx-auto max-w-2xl rounded-2xl border border-brand-200/60 bg-white p-8 text-center shadow-sm dark:border-brand-500/20 dark:bg-zinc-900"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <span className="mb-3 inline-block text-sm font-semibold uppercase tracking-wider text-brand-500">
              זמינות והרשמה
            </span>
            <h2 id="availability-heading" className="mb-4 text-3xl font-bold text-blue-500 dark:text-white">
              הרכישה המקוונת עדיין לא פתוחה
            </h2>
            <p className="mx-auto mb-6 max-w-xl leading-relaxed text-blue-500/70 dark:text-zinc-400">
              המחירים והמסלולים טרם אושרו, ואין כרגע מסלול תשלום או הרשאת תוכן
              פעילים. פתיחת חשבון לבדה אינה מקנה גישה לקורס בתשלום.
            </p>
            <Link
              href="/contact"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-brand-200 px-6 text-sm font-semibold text-brand-600 transition-colors hover:bg-brand-50 dark:border-brand-700 dark:text-brand-400 dark:hover:bg-zinc-800"
            >
              בירור זמינות
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Success Stories Section */}
      {VERIFIED_PUBLIC_STORIES_AVAILABLE && <SuccessStoriesSection />}

      {/* Featured Blog Posts Section */}
      <FeaturedBlogSection />

      {/* CTA Section */}
      <section className="py-20" role="region" aria-labelledby="cta-heading">
        <div className="container mx-auto px-4">
          <motion.div
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-500 via-brand-600 to-blue-600 p-12 text-center shadow-2xl shadow-brand-500/25 md:p-16 lg:p-20"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            {/* Decorative circles */}
            <div
              className="pointer-events-none absolute -top-16 -left-16 h-56 w-56 rounded-full bg-white/10 blur-3xl"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute -bottom-16 -right-16 h-56 w-56 rounded-full bg-white/10 blur-3xl"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none animate-float-slow absolute top-8 right-8 h-24 w-24 rounded-full bg-accent-400/15 blur-2xl"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none animate-float absolute bottom-12 left-16 h-32 w-32 rounded-full bg-blue-500/20 blur-2xl"
              aria-hidden="true"
            />

            <div className="relative">
              <h2 id="cta-heading" className="mb-4 text-3xl font-black text-white md:text-4xl lg:text-5xl">
                מוכנים להתחיל את המסע?
              </h2>
              <p className="mx-auto mb-8 max-w-md text-lg text-white/80">
                אפשר להכיר את מבנה התוכנית, לקרוא את חומרי ההסבר ולבחור אם
                התרגול מתאים לך — בלי הבטחה לתוצאה קבועה.
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  href="/contact"
                  className="inline-flex h-12 items-center justify-center rounded-xl bg-white px-8 text-base font-semibold text-brand-600 shadow-lg transition-all hover:bg-brand-50 hover:shadow-xl"
                >
                  בדקו זמינות
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
                  className="inline-flex h-12 items-center justify-center rounded-xl border border-white/30 px-8 text-base font-semibold text-white transition-all hover:bg-white/10"
                >
                  צפה בתכנים
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

function StatItem({ value, label, hasDivider }: { value: string; label: string; hasDivider?: boolean }) {
  return (
    <motion.div variants={fadeIn} className={`relative flex flex-col items-center gap-1.5 ${hasDivider ? "stat-divider" : ""}`}>
      <motion.span
        className="text-4xl font-black text-white drop-shadow-sm md:text-5xl [font-variant-numeric:tabular-nums]"
        initial={{ opacity: 0, scale: 0.5 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
      >
        <CountUp>{value}</CountUp>
      </motion.span>
      <span className="text-sm font-medium tracking-wide text-white/70">{label}</span>
    </motion.div>
  );
}

function FeatureCard({
  iconBg,
  icon,
  title,
  description,
}: {
  iconBg: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <motion.div
      variants={fadeIn}
      className="rounded-2xl border border-brand-100/30 bg-white p-6 dark:border-blue-100/10 dark:bg-blue-50/5"
    >
      {/* L7: no interactive descendant in this card — hover-lift removed (was a
          visual lie with no keyboard equivalent possible). */}
      <div
        className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${iconBg} shadow-md shadow-brand-500/10 ring-1 ring-white/20`}
      >
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-bold text-blue-500 dark:text-white">
        {title}
      </h3>
      <p className="text-sm leading-relaxed text-blue-500/60 dark:text-zinc-400">
        {description}
      </p>
    </motion.div>
  );
}

function EcosystemCard({
  emoji,
  title,
  description,
  badge,
}: {
  emoji: string;
  title: string;
  description: string;
  badge: string;
}) {
  return (
    <motion.div
      variants={fadeIn}
      className="flex flex-col items-center rounded-2xl border border-brand-100/30 bg-white p-5 text-center dark:border-blue-100/10 dark:bg-blue-50/5"
    >
      {/* L7: no interactive descendant — hover-lift removed. */}
      <div className="mb-3 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-50 to-brand-100/50 text-2xl shadow-sm dark:from-brand-50/50 dark:to-brand-100/20">
        {emoji}
      </div>
      <h3 className="mb-1 text-sm font-semibold text-blue-500 dark:text-white">
        {title}
      </h3>
      <span className="mb-2 rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-600 dark:bg-brand-50/50 dark:text-brand-300">
        {badge}
      </span>
      <p className="text-xs leading-relaxed text-blue-500/60 dark:text-zinc-400">
        {description}
      </p>
    </motion.div>
  );
}

function ToolCard({
  emoji,
  title,
  description,
  href,
}: {
  emoji: string;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <motion.div variants={fadeIn}>
      <Link
        href={href}
        className="card-hover group flex flex-col items-center rounded-2xl border border-brand-100/30 bg-gradient-to-b from-brand-50/40 to-white p-6 text-center transition-all hover:border-brand-200/50 hover:shadow-md dark:border-blue-100/10 dark:from-blue-50/5 dark:to-blue-50/5 dark:hover:border-blue-100/20"
      >
        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 text-2xl shadow-lg shadow-brand-500/15 ring-1 ring-white/20 transition-transform duration-150 group-hover:scale-110 dark:from-brand-400/80 dark:to-brand-500/80">
          {emoji}
        </div>
        <h3 className="mb-1.5 text-base font-semibold text-blue-500 dark:text-white">
          {title}
        </h3>
        <p className="mb-3 text-sm leading-relaxed text-blue-500/60 dark:text-zinc-400">
          {description}
        </p>
        <span className="inline-flex items-center gap-1 text-xs font-medium text-brand-500 transition-colors group-hover:text-brand-600">
          נסה עכשיו
          <svg className="h-3 w-3 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </span>
      </Link>
    </motion.div>
  );
}

function PhaseCard({
  step,
  color,
  title,
  weeks,
  description,
  image,
  imageAlt,
}: {
  step: string;
  color: string;
  title: string;
  weeks: string;
  description: string;
  image: string;
  imageAlt: string;
}) {
  return (
    <motion.div variants={fadeIn} className="group text-center">
      <div className="relative mx-auto mb-3 w-full max-w-[150px]">
        <Image
          src={image}
          alt={imageAlt}
          width={400}
          height={400}
          sizes="150px"
          className="w-full rounded-2xl shadow-md ring-1 ring-black/5 dark:ring-white/10"
        />
        <span
          className={`absolute -top-2 -start-2 flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br ${color} text-sm font-bold text-white shadow-lg ring-1 ring-white/20`}
        >
          {step}
        </span>
      </div>
      <h3 className="mb-1 text-base font-semibold text-blue-500 dark:text-white">
        {title}
      </h3>
      <p className="mb-1 text-xs font-medium text-brand-500">{weeks}</p>
      <p className="text-xs leading-relaxed text-blue-500/50 dark:text-zinc-400">
        {description}
      </p>
    </motion.div>
  );
}

// ─── Category label helpers ──────────────────────────────────────────────────

const storyCategoryLabels: Record<string, string> = {
  dating: "דייטינג",
  relationship: "זוגיות",
  "self-growth": "צמיחה אישית",
  marriage: "נישואין",
};

const blogCategoryLabels: Record<string, string> = {
  "dating-tips": "טיפים לדייטינג",
  relationship: "זוגיות",
  "self-improvement": "פיתוח עצמי",
  communication: "תקשורת",
  psychology: "פסיכולוגיה",
};

// ─── Verified participant stories (currently fail-closed) ───────────────────

function SuccessStoriesSection() {
  const stories = useQuery(api.stories.listFeatured);

  // Render nothing while loading or if no stories
  if (!stories || stories.length === 0) return null;

  // Show up to 3 stories on the landing page
  const displayStories = stories.slice(0, 3);

  return (
    <section className="bg-gradient-to-b from-brand-50/40 to-[var(--background)] py-20 dark:from-blue-50/5">
      <div className="container mx-auto px-4">
        <motion.div
          className="mx-auto mb-4 max-w-xl text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
        >
          <span className="mb-3 inline-block text-sm font-semibold uppercase tracking-wider text-brand-500">
            סיפורי משתתפים מאומתים
          </span>
          <h2 className="mb-4 text-3xl font-bold text-blue-500 dark:text-white md:text-4xl">
            פורסמו בהסכמה מפורשת
          </h2>
        </motion.div>

        <motion.div
          className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          {displayStories.map((story) => (
            <motion.div
              key={story._id}
              variants={fadeIn}
              className="relative rounded-2xl border border-brand-100/30 bg-white p-6 dark:border-blue-100/10 dark:bg-blue-50/5"
            >
              {/* L7: testimonial card has no interactive descendant — hover-lift removed. */}
              {/* Quote icon */}
              <svg
                className="mb-4 h-8 w-8 text-brand-200 dark:text-brand-200/30"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zm-14.017 0v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H0z" />
              </svg>

              {/* Story text - truncated to 3 lines */}
              <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-blue-500/70 dark:text-zinc-400">
                {story.story}
              </p>

              {/* Star rating */}
              <div className="mb-3 flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg
                    key={i}
                    className={`h-4 w-4 ${i < story.rating ? "text-accent-400" : "text-zinc-200 dark:text-zinc-700"}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* Name + category */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-blue-500 dark:text-white">
                  {story.name}
                </span>
                <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-600 dark:bg-brand-50/50 dark:text-brand-300">
                  {storyCategoryLabels[story.category] ?? story.category}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="mt-8 text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
        >
          <Link
            href="/stories"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-500 underline underline-offset-4 transition-colors hover:text-brand-600"
          >
            מידע על אימות והסכמה
            <svg className="h-3.5 w-3.5 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Featured Blog Posts Section ─────────────────────────────────────────────

function FeaturedBlogSection() {
  const posts = useQuery(api.blog.listRecent);

  // Render nothing while loading or if no posts
  if (!posts || posts.length === 0) return null;

  return (
    <section className="py-20 md:py-28">
      <div className="container mx-auto px-4">
        <motion.div
          className="mx-auto mb-4 max-w-xl text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
        >
          <span className="mb-3 inline-block text-sm font-semibold uppercase tracking-wider text-brand-500">
            תוכן חדש
          </span>
          <h2 className="mb-12 text-3xl font-bold text-blue-500 dark:text-white md:text-4xl">
            מהבלוג שלנו
          </h2>
        </motion.div>

        <motion.div
          className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          {posts.map((post) => (
            <motion.div
              key={post._id}
              variants={fadeIn}
              className="card-hover flex flex-col rounded-2xl border border-brand-100/30 bg-white p-6 dark:border-blue-100/10 dark:bg-blue-50/5"
            >
              {/* Category badge */}
              <span className="mb-3 inline-flex w-fit rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-600 dark:bg-brand-50/50 dark:text-brand-300">
                {blogCategoryLabels[post.category] ?? post.category}
              </span>

              {/* Title */}
              <h3 className="mb-2 text-base font-semibold leading-snug text-blue-500 dark:text-white">
                {post.title}
              </h3>

              {/* Excerpt - 2 lines */}
              <p className="mb-4 line-clamp-2 flex-1 text-sm leading-relaxed text-blue-500/60 dark:text-zinc-400">
                {post.excerpt}
              </p>

              {/* Read time + link */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-blue-500/70 dark:text-zinc-400">
                  {post.readTime} דקות קריאה
                </span>
                <Link
                  href={`/blog/${post.slug}`}
                  className="inline-flex items-center gap-1 text-xs font-medium text-brand-500 transition-colors hover:text-brand-600"
                >
                  קרא עוד
                  <svg className="h-3 w-3 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="mt-8 text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
        >
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-500 underline underline-offset-4 transition-colors hover:text-brand-600"
          >
            לכל המאמרים
            <svg className="h-3.5 w-3.5 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
