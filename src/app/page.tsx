import Link from "next/link";
import { Header } from "@/components/layout/header";

export default function Home() {
  return (
    <div className="min-h-dvh bg-white dark:bg-zinc-950">
      <Header />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="mx-auto max-w-3xl">
          <h1 className="mb-6 text-4xl font-bold leading-tight text-zinc-900 dark:text-white md:text-5xl lg:text-6xl">
            למד בקצב שלך
            <br />
            <span className="text-zinc-500">בדרך שלך</span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
            פלטפורמת הלימודים המתקדמת שמאפשרת לך ללמוד מהמומחים המובילים, לעקוב
            אחרי ההתקדמות שלך, ולהגיע לתוצאות.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/courses"
              className="inline-flex h-12 items-center justify-center rounded-full bg-zinc-900 px-8 text-base font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
            >
              צפה בקורסים
            </Link>
            <Link
              href="/sign-up"
              className="inline-flex h-12 items-center justify-center rounded-full border border-zinc-300 px-8 text-base font-medium text-zinc-900 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-white dark:hover:bg-zinc-900"
            >
              התחל בחינם
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-t border-zinc-200 py-12 dark:border-zinc-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
            <StatItem value="3+" label="קורסים" />
            <StatItem value="16+" label="שיעורים" />
            <StatItem value="100%" label="למידה עצמית" />
            <StatItem value="24/7" label="זמינות" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-zinc-200 bg-zinc-50 py-20 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="container mx-auto px-4">
          <h2 className="mb-4 text-center text-3xl font-bold text-zinc-900 dark:text-white">
            למה הדרך?
          </h2>
          <p className="mx-auto mb-12 max-w-xl text-center text-zinc-600 dark:text-zinc-400">
            הכלים שיעזרו לך ללמוד ביעילות ולהגיע לתוצאות
          </p>
          <div className="grid gap-8 md:grid-cols-3">
            <FeatureCard
              icon={
                <svg
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                  />
                </svg>
              }
              title="תוכן איכותי"
              description="שיעורים מקצועיים מהמומחים המובילים בתחום, עם תוכן עשיר ותרגילים מעשיים."
            />
            <FeatureCard
              icon={
                <svg
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"
                  />
                </svg>
              }
              title="למידה גמישה"
              description="למד מכל מכשיר, בכל זמן. המערכת זוכרת איפה עצרת ומאפשרת לך להמשיך."
            />
            <FeatureCard
              icon={
                <svg
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5"
                  />
                </svg>
              }
              title="מעקב ותעודות"
              description="עקוב אחרי ההתקדמות שלך, מלא בחנים, קבל תעודות על סיום קורסים."
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold text-zinc-900 dark:text-white">
            איך זה עובד?
          </h2>
          <div className="mx-auto grid max-w-3xl gap-8 md:grid-cols-3">
            <StepCard
              step="1"
              title="הירשם"
              description="צור חשבון בחינם ובחר את הקורס שמתאים לך"
            />
            <StepCard
              step="2"
              title="למד"
              description="צפה בשיעורים, קרא תוכן, ותרגל עם בחנים"
            />
            <StepCard
              step="3"
              title="קבל תעודה"
              description="סיים את הקורס וקבל תעודת סיום מוכרת"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-zinc-200 bg-zinc-50 py-16 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-2xl font-bold text-zinc-900 dark:text-white">
            מוכנים להתחיל?
          </h2>
          <p className="mx-auto mb-8 max-w-md text-zinc-600 dark:text-zinc-400">
            הצטרפו לאלפי לומדים שכבר בדרך לשינוי. ההרשמה חינמית.
          </p>
          <Link
            href="/sign-up"
            className="inline-flex h-12 items-center justify-center rounded-full bg-zinc-900 px-8 text-base font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
          >
            הרשמה חינמית
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 py-8 dark:border-zinc-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              &copy; {new Date().getFullYear()} הדרך. כל הזכויות שמורות.
            </p>
            <nav className="flex gap-6 text-sm" aria-label="קישורים נוספים">
              <Link
                href="/courses"
                className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
              >
                קורסים
              </Link>
              <Link
                href="/sign-in"
                className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
              >
                התחברות
              </Link>
              <Link
                href="/sign-up"
                className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
              >
                הרשמה
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-zinc-800">
      <div className="mb-4 text-zinc-600 dark:text-zinc-300">{icon}</div>
      <h3 className="mb-3 text-xl font-semibold text-zinc-900 dark:text-white">
        {title}
      </h3>
      <p className="text-zinc-600 dark:text-zinc-400">{description}</p>
    </div>
  );
}

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-2xl font-bold text-zinc-900 dark:text-white md:text-3xl">
        {value}
      </p>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">{label}</p>
    </div>
  );
}

function StepCard({
  step,
  title,
  description,
}: {
  step: string;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-lg font-bold text-zinc-900 dark:bg-zinc-800 dark:text-white">
        {step}
      </div>
      <h3 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-white">
        {title}
      </h3>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">{description}</p>
    </div>
  );
}
