import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export default function Home() {
  return (
    <div className="min-h-dvh bg-white dark:bg-zinc-950">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute -top-24 right-1/4 h-96 w-96 rounded-full bg-indigo-100/50 blur-3xl dark:bg-indigo-900/20" />
          <div className="absolute top-20 left-1/4 h-72 w-72 rounded-full bg-violet-100/40 blur-3xl dark:bg-violet-900/15" />
          <div className="absolute -bottom-12 right-1/3 h-64 w-64 rounded-full bg-amber-100/30 blur-3xl dark:bg-amber-900/10" />
        </div>

        <div className="container relative mx-auto px-4 pb-20 pt-24 text-center md:pb-28 md:pt-32">
          <div className="mx-auto max-w-3xl">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
              פלטפורמת למידה מובילה בעברית
            </div>

            <h1 className="mb-6 text-4xl font-extrabold leading-tight text-zinc-900 dark:text-white md:text-5xl lg:text-6xl">
              למד בקצב שלך,
              <br />
              <span className="bg-gradient-to-l from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent dark:from-indigo-400 dark:via-violet-400 dark:to-purple-400">
                בדרך שלך
              </span>
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
              פלטפורמת הלימודים המתקדמת שמאפשרת לך ללמוד מהמומחים המובילים,
              לעקוב אחרי ההתקדמות שלך, ולהגיע לתוצאות.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/courses"
                className="inline-flex h-12 items-center justify-center rounded-xl bg-gradient-to-l from-indigo-600 to-violet-600 px-8 text-base font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-xl hover:shadow-indigo-500/30 hover:brightness-110"
              >
                צפה בקורסים
                <svg className="mr-2 h-4 w-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
              <Link
                href="/sign-up"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-zinc-200 bg-white px-8 text-base font-semibold text-zinc-900 shadow-sm transition-all hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:hover:border-indigo-800 dark:hover:bg-indigo-950/30"
              >
                התחל בחינם
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-zinc-100 bg-zinc-50/50 py-12 dark:border-zinc-800 dark:bg-zinc-900/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
            <StatItem value="3+" label="קורסים" icon="book" />
            <StatItem value="16+" label="שיעורים" icon="video" />
            <StatItem value="100%" label="למידה עצמית" icon="self" />
            <StatItem value="24/7" label="זמינות" icon="clock" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-4 max-w-xl text-center">
            <span className="mb-3 inline-block text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              למה הדרך?
            </span>
            <h2 className="mb-4 text-3xl font-bold text-zinc-900 dark:text-white md:text-4xl">
              הכלים שיעזרו לך להצליח
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400">
              הכלים שיעזרו לך ללמוד ביעילות ולהגיע לתוצאות
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <FeatureCard
              iconBg="from-indigo-500 to-blue-500"
              icon={
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
              }
              title="תוכן איכותי"
              description="שיעורים מקצועיים מהמומחים המובילים בתחום, עם תוכן עשיר ותרגילים מעשיים."
            />
            <FeatureCard
              iconBg="from-violet-500 to-purple-500"
              icon={
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                </svg>
              }
              title="למידה גמישה"
              description="למד מכל מכשיר, בכל זמן. המערכת זוכרת איפה עצרת ומאפשרת לך להמשיך."
            />
            <FeatureCard
              iconBg="from-amber-500 to-orange-500"
              icon={
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                </svg>
              }
              title="מעקב ותעודות"
              description="עקוב אחרי ההתקדמות שלך, מלא בחנים, קבל תעודות על סיום קורסים."
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-zinc-100 bg-gradient-to-b from-zinc-50/80 to-white py-20 dark:border-zinc-800 dark:from-zinc-900/80 dark:to-zinc-950">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-4 max-w-xl text-center">
            <span className="mb-3 inline-block text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              פשוט וקל
            </span>
            <h2 className="mb-12 text-3xl font-bold text-zinc-900 dark:text-white md:text-4xl">
              איך זה עובד?
            </h2>
          </div>
          <div className="mx-auto grid max-w-3xl gap-8 md:grid-cols-3">
            <StepCard
              step="1"
              color="from-indigo-500 to-violet-500"
              title="הירשם"
              description="צור חשבון בחינם ובחר את הקורס שמתאים לך"
            />
            <StepCard
              step="2"
              color="from-violet-500 to-purple-500"
              title="למד"
              description="צפה בשיעורים, קרא תוכן, ותרגל עם בחנים"
            />
            <StepCard
              step="3"
              color="from-amber-500 to-orange-500"
              title="קבל תעודה"
              description="סיים את הקורס וקבל תעודת סיום מוכרת"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-12 text-center shadow-2xl shadow-indigo-500/20 md:p-16">
            {/* Decorative circles */}
            <div className="pointer-events-none absolute -top-12 -left-12 h-48 w-48 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
            <div className="pointer-events-none absolute -bottom-12 -right-12 h-48 w-48 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />

            <div className="relative">
              <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
                מוכנים להתחיל?
              </h2>
              <p className="mx-auto mb-8 max-w-md text-indigo-100">
                הצטרפו לאלפי לומדים שכבר בדרך לשינוי. ההרשמה חינמית.
              </p>
              <Link
                href="/sign-up"
                className="inline-flex h-12 items-center justify-center rounded-xl bg-white px-8 text-base font-semibold text-indigo-700 shadow-lg transition-all hover:bg-indigo-50 hover:shadow-xl"
              >
                הרשמה חינמית
                <svg className="mr-2 h-4 w-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          </div>
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
    <div className="card-hover rounded-2xl border border-zinc-100 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${iconBg} shadow-sm`}>
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-white">
        {title}
      </h3>
      <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{description}</p>
    </div>
  );
}

function StatItem({ value, label, icon }: { value: string; label: string; icon: string }) {
  const icons: Record<string, React.ReactNode> = {
    book: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
    video: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z" />
      </svg>
    ),
    self: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
    clock: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
        {icons[icon]}
      </div>
      <p className="text-2xl font-bold text-zinc-900 dark:text-white md:text-3xl">
        {value}
      </p>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{label}</p>
    </div>
  );
}

function StepCard({
  step,
  color,
  title,
  description,
}: {
  step: string;
  color: string;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${color} text-lg font-bold text-white shadow-lg`}>
        {step}
      </div>
      <h3 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-white">
        {title}
      </h3>
      <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{description}</p>
    </div>
  );
}
