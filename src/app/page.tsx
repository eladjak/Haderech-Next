"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

export default function Home() {
  return (
    <div className="min-h-dvh bg-[var(--background)]">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Hero background image */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <Image
            src="/images/hero.jpg"
            alt=""
            fill
            className="object-cover opacity-15 dark:opacity-10"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--background)]/60 via-[var(--background)]/80 to-[var(--background)]" />
        </div>
        {/* Background decoration */}
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden"
          aria-hidden="true"
        >
          <div className="absolute -top-24 right-1/4 h-96 w-96 rounded-full bg-brand-100/40 blur-3xl dark:bg-brand-100/15" />
          <div className="absolute top-20 left-1/4 h-72 w-72 rounded-full bg-blue-50/30 blur-3xl dark:bg-blue-100/10" />
          <div className="absolute -bottom-12 right-1/3 h-64 w-64 rounded-full bg-accent-300/15 blur-3xl dark:bg-accent-400/8" />
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
                <span className="h-1.5 w-1.5 rounded-full bg-brand-500 animate-pulse" />
                461 זוגות כבר מצאו אהבה
              </div>
            </motion.div>

            <motion.h1
              variants={fadeIn}
              className="mb-6 text-4xl font-extrabold leading-tight text-blue-500 dark:text-white md:text-5xl lg:text-6xl"
            >
              הדרך שלך
              <br />
              <span className="bg-gradient-to-l from-brand-500 via-brand-400 to-accent-400 bg-clip-text text-transparent">
                לזוגיות שאתה ראוי לה
              </span>
            </motion.h1>

            <motion.p
              variants={fadeIn}
              className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-blue-500/70 dark:text-zinc-400"
            >
              תוכנית "הדרך" של אומנות הקשר - 12 שבועות שישנו לך את חיי
              הזוגיות. עם צ'אט AI חכם שמלווה אותך, סימולטור דייטים להתאמנות, וקהילה
              תומכת של אנשים בדרך.
            </motion.p>

            <motion.div
              variants={fadeIn}
              className="flex flex-col items-center justify-center gap-4 sm:flex-row"
            >
              <Link
                href="/courses"
                className="inline-flex h-12 items-center justify-center rounded-xl bg-gradient-to-l from-brand-500 to-brand-600 px-8 text-base font-semibold text-white shadow-lg shadow-brand-500/25 transition-all hover:shadow-xl hover:shadow-brand-500/30 hover:brightness-110"
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
              <Link
                href="/sign-up"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-blue-500/20 bg-white px-8 text-base font-semibold text-blue-500 shadow-sm transition-all hover:border-brand-200 hover:bg-brand-50 hover:text-brand-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:hover:border-brand-200/30 dark:hover:bg-brand-50/20"
              >
                התחל בחינם
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-brand-100/50 bg-brand-50/30 py-12 dark:border-blue-100/20 dark:bg-blue-50/10">
        <div className="container mx-auto px-4">
          <motion.div
            className="grid grid-cols-2 gap-8 text-center md:grid-cols-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
          >
            <StatItem value="461" label="זוגות שנוצרו" icon="heart" />
            <StatItem value="12" label="שבועות תוכנית" icon="calendar" />
            <StatItem value="73" label="שיעורי וידאו" icon="video" />
            <StatItem value="15+" label="שנות ניסיון" icon="star" />
          </motion.div>
        </div>
      </section>

      {/* 3 Values Section */}
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
              הגישה שלנו
            </span>
            <h2 className="mb-4 text-3xl font-bold text-blue-500 dark:text-white md:text-4xl">
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
              description='לא אגיד לך מה נעים לשמוע. אגיד לך מה אתה צריך לשמוע. ישר, בלי בולשיט.'
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
              description="כל פרק, כל מפגש, כל שיחה - כוללים משהו שאפשר ליישם כבר מחר בבוקר. לא תיאוריה מופשטת - כלים שעובדים."
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
              description="לא אטיף לך מוסר. באת לכאן כי אתה רוצה לשנות משהו - וזה לבד כבר אומר משהו על הערך שלך."
            />
          </motion.div>
        </div>
      </section>

      {/* What You Get Section */}
      <section className="border-t border-brand-100/30 bg-gradient-to-b from-brand-50/30 to-[var(--background)] py-20 dark:border-blue-100/10 dark:from-blue-50/5">
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
            <h2 className="mb-12 text-3xl font-bold text-blue-500 dark:text-white md:text-4xl">
              לא סתם קורס - אקוסיסטם שלם
            </h2>
          </motion.div>
          <motion.div
            className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <EcosystemCard
              emoji="🎓"
              title='תוכנית "הדרך" - 12 שבועות'
              description="73 שיעורי וידאו, תרגילים מעשיים, שאלונים ובחנים. מסע מובנה מ'מי אני' עד 'מוכן לזוגיות'."
              badge="ליבה"
            />
            <EcosystemCard
              emoji="🤖"
              title="צ'אט AI חכם - המאמן שלך"
              description="בינה מלאכותית שמכירה את הקורס, את הספר ואותך. שואלת, מייעצת, מחזקת ומלווה כל שלב."
              badge="AI"
            />
            <EcosystemCard
              emoji="🎭"
              title="סימולטור דייטים"
              description="תתאמן על שיחות דייט עם פרסונות מציאותיות. בחר אופי, רמת קושי ותרחיש - וקבל משוב בזמן אמת."
              badge="AI"
            />
            <EcosystemCard
              emoji="📚"
              title="ספרייה עשירה"
              description="ספרים מומלצים, מאמרים, מחקרים, סרטונים ופודקאסטים - הכל מסודר לפי נושא ורמה."
              badge="משאבים"
            />
            <EcosystemCard
              emoji="💬"
              title="כלי דייטינג מעשיים"
              description="יוצר פרופיל היכרויות, ניתוח דייטים עם AI, נוסח הודעות פתיחה ועוד."
              badge="כלים"
            />
            <EcosystemCard
              emoji="👥"
              title="קהילה ומועדון"
              description="פורום, קבוצות, אתגרים יומיים, טיפ יומי, וקהילת לומדים שתומכת אחד בשני."
              badge="קהילה"
            />
          </motion.div>
        </div>
      </section>

      {/* How it works */}
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
              6 שלבים למסע
            </span>
            <h2 className="mb-12 text-3xl font-bold text-blue-500 dark:text-white md:text-4xl">
              איך תוכנית "הדרך" עובדת?
            </h2>
          </motion.div>
          <motion.div
            className="mx-auto grid max-w-5xl gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <PhaseCard step="1" color="from-brand-500 to-brand-600" title="גישה" weeks="שבועות 1-3" description="עבודה פנימית, סיפורים, גבולות" />
            <PhaseCard step="2" color="from-blue-500 to-blue-600" title="תקשורת" weeks="שבועות 4-5" description="היכרות עצמית, רגשות, צרכים" />
            <PhaseCard step="3" color="from-accent-400 to-accent-500" title="משיכה" weeks="שבועות 6-9" description="אומץ, היכרויות, דייטים" />
            <PhaseCard step="4" color="from-brand-400 to-blue-500" title="חיבור" weeks="שבוע 10" description="כימיה, הקשבה, יצירת הזדמנויות" />
            <PhaseCard step="5" color="from-blue-400 to-brand-400" title="אינטימיות" weeks="שבוע 11" description="פגיעות, קרבה, 36 שאלות להתאהבות" />
            <PhaseCard step="6" color="from-blue-500 to-brand-500" title="מחויבות" weeks="שבוע 12" description="החלטה, זוגיות רשמית, בניית עתיד" />
          </motion.div>
        </div>
      </section>

      {/* Pricing Preview Section */}
      <section className="border-t border-brand-100/30 bg-gradient-to-b from-[var(--background)] to-brand-50/20 py-20 dark:border-blue-100/10 dark:to-blue-50/5">
        <div className="container mx-auto px-4">
          <motion.div
            className="mx-auto mb-12 max-w-xl text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <span className="mb-3 inline-block text-sm font-semibold uppercase tracking-wider text-brand-500">
              תוכניות ומחירים
            </span>
            <h2 className="mb-4 text-3xl font-bold text-blue-500 dark:text-white md:text-4xl">
              בחר את המסלול שלך
            </h2>
            <p className="text-blue-500/60 dark:text-zinc-400">
              התחל בחינם, שדרג כשתרגיש מוכן
            </p>
          </motion.div>
          <motion.div
            className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <PricingCard
              name="טעימה"
              price="חינם"
              period=""
              description="5 שיעורים, 10 הודעות AI בחודש, 2 תרחישי סימולטור"
              features={["5 שיעורים ראשונים", "מאמן AI - 10 הודעות", "2 תרחישי סימולטור", "ספריית מאמרים"]}
              cta="התחל בחינם"
              ctaHref="/sign-up"
              highlighted={false}
            />
            <PricingCard
              name="משנה"
              price="₪149"
              period="/חודש"
              description="שינוי אמיתי: AI ללא הגבלה, סימולטור קולי, קהילה פעילה"
              features={["כל 73 השיעורים", "מאמן AI ללא הגבלה", "סימולטור קולי + וידאו", "קהילה + לוח מובילים", "תעודת סיום"]}
              badge="הכי פופולרי"
              cta="התחל תקופת ניסיון"
              ctaHref="/sign-up"
              highlighted={true}
            />
            <PricingCard
              name="מוביל"
              price="₪299"
              period="/חודש"
              description="VIP: קואצ׳ינג קבוצתי חי, מאסטרקלאסים בלעדיים, גישה מוקדמת"
              features={["הכל במשנה +", "קואצ׳ינג קבוצתי עם אלעד", "מאסטרקלאסים בלעדיים", "דוחות AI מעמיקים", "תמיכה בעדיפות"]}
              cta="הצטרף ל-VIP"
              ctaHref="/sign-up"
              highlighted={false}
            />
          </motion.div>
          <motion.p
            className="mx-auto mt-8 max-w-lg text-center text-sm text-blue-500/50 dark:text-zinc-500"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            חיסכון של עד 37% בתוכנית שנתית. ביטול בכל עת.
          </motion.p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-500 via-brand-600 to-blue-500 p-12 text-center shadow-2xl shadow-brand-500/20 md:p-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            {/* Decorative circles */}
            <div
              className="pointer-events-none absolute -top-12 -left-12 h-48 w-48 rounded-full bg-white/10 blur-2xl"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute -bottom-12 -right-12 h-48 w-48 rounded-full bg-white/10 blur-2xl"
              aria-hidden="true"
            />

            <div className="relative">
              <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
                מוכנים להתחיל את המסע?
              </h2>
              <p className="mx-auto mb-8 max-w-md text-brand-100">
                461 זוגות כבר מצאו אהבה דרך אומנות הקשר. הצעד הראשון שלך
                מתחיל כאן.
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  href="/sign-up"
                  className="inline-flex h-12 items-center justify-center rounded-xl bg-white px-8 text-base font-semibold text-brand-600 shadow-lg transition-all hover:bg-brand-50 hover:shadow-xl"
                >
                  התחל בחינם
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

      <Footer />
    </div>
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
      className="card-hover rounded-2xl border border-brand-100/30 bg-white p-6 dark:border-blue-100/10 dark:bg-blue-50/5"
    >
      <div
        className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${iconBg} shadow-sm`}
      >
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-semibold text-blue-500 dark:text-white">
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
      className="card-hover flex gap-4 rounded-2xl border border-brand-100/30 bg-white p-5 dark:border-blue-100/10 dark:bg-blue-50/5"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-2xl dark:bg-brand-50/50">
        {emoji}
      </div>
      <div>
        <div className="mb-1 flex items-center gap-2">
          <h3 className="text-base font-semibold text-blue-500 dark:text-white">
            {title}
          </h3>
          <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-600 dark:bg-brand-50/50 dark:text-brand-300">
            {badge}
          </span>
        </div>
        <p className="text-sm leading-relaxed text-blue-500/60 dark:text-zinc-400">
          {description}
        </p>
      </div>
    </motion.div>
  );
}

function StatItem({
  value,
  label,
  icon,
}: {
  value: string;
  label: string;
  icon: string;
}) {
  const icons: Record<string, React.ReactNode> = {
    heart: (
      <svg
        className="h-5 w-5"
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
    ),
    calendar: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
        />
      </svg>
    ),
    video: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z"
        />
      </svg>
    ),
    star: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
        />
      </svg>
    ),
  };

  return (
    <motion.div variants={fadeIn} className="flex flex-col items-center gap-2">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100/50 text-brand-500 dark:bg-brand-100/20 dark:text-brand-300">
        {icons[icon]}
      </div>
      <p className="text-2xl font-bold text-blue-500 dark:text-white md:text-3xl">
        {value}
      </p>
      <p className="text-sm text-blue-500/50 dark:text-zinc-400">{label}</p>
    </motion.div>
  );
}

function PhaseCard({
  step,
  color,
  title,
  weeks,
  description,
}: {
  step: string;
  color: string;
  title: string;
  weeks: string;
  description: string;
}) {
  return (
    <motion.div variants={fadeIn} className="text-center">
      <div
        className={`mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${color} text-lg font-bold text-white shadow-lg`}
      >
        {step}
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

function PricingCard({
  name,
  price,
  period,
  description,
  features,
  badge,
  cta,
  ctaHref,
  highlighted,
}: {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  badge?: string;
  cta: string;
  ctaHref: string;
  highlighted: boolean;
}) {
  return (
    <motion.div
      variants={fadeIn}
      className={`relative flex flex-col rounded-2xl border p-6 ${
        highlighted
          ? "border-brand-300 bg-gradient-to-b from-brand-50/60 to-white shadow-lg shadow-brand-500/10 dark:border-brand-500/40 dark:from-brand-50/10 dark:to-blue-50/5"
          : "border-brand-100/30 bg-white dark:border-blue-100/10 dark:bg-blue-50/5"
      }`}
    >
      {badge && (
        <span className="absolute -top-3 right-6 rounded-full bg-brand-500 px-3 py-1 text-xs font-semibold text-white shadow-sm">
          {badge}
        </span>
      )}
      <h3 className="mb-1 text-lg font-bold text-blue-500 dark:text-white">{name}</h3>
      <div className="mb-3 flex items-baseline gap-1">
        <span className="text-3xl font-bold text-blue-500 dark:text-white">{price}</span>
        {period && <span className="text-sm text-blue-500/50 dark:text-zinc-400">{period}</span>}
      </div>
      <p className="mb-5 text-sm text-blue-500/60 dark:text-zinc-400">{description}</p>
      <ul className="mb-6 flex-1 space-y-2.5">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-blue-500/80 dark:text-zinc-300">
            <svg className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            {f}
          </li>
        ))}
      </ul>
      <Link
        href={ctaHref}
        className={`inline-flex h-11 items-center justify-center rounded-xl text-sm font-semibold transition-all ${
          highlighted
            ? "bg-gradient-to-l from-brand-500 to-brand-600 text-white shadow-md hover:shadow-lg hover:brightness-110"
            : "border border-brand-200 text-brand-600 hover:bg-brand-50 dark:border-brand-700 dark:text-brand-400 dark:hover:bg-zinc-900"
        }`}
      >
        {cta}
      </Link>
    </motion.div>
  );
}
