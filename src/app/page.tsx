import Link from "next/link";
import { Header } from "@/components/layout/header";

export default function Home() {
  return (
    <div className="min-h-dvh bg-white dark:bg-zinc-950">
      <Header />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="mb-6 text-4xl font-bold leading-tight text-zinc-900 dark:text-white md:text-5xl lg:text-6xl">
          למד בקצב שלך
          <br />
          <span className="text-zinc-500">בדרך שלך</span>
        </h1>
        <p className="mx-auto mb-10 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
          פלטפורמת הלימודים המתקדמת שמאפשרת לך ללמוד מהמומחים המובילים, לעקוב אחרי
          ההתקדמות שלך, ולהגיע לתוצאות.
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
      </section>

      {/* Features Section */}
      <section className="border-t border-zinc-200 bg-zinc-50 py-20 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold text-zinc-900 dark:text-white">
            למה הדרך?
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            <FeatureCard
              title="תוכן איכותי"
              description="שיעורים מקצועיים מהמומחים המובילים בתחום, עם וידאו HD ותרגילים מעשיים."
            />
            <FeatureCard
              title="למידה גמישה"
              description="למד מכל מכשיר, בכל זמן. המערכת זוכרת איפה עצרת ומאפשרת לך להמשיך."
            />
            <FeatureCard
              title="מעקב התקדמות"
              description="עקוב אחרי ההתקדמות שלך, קבל תעודות על סיום קורסים, והגיע למטרות."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 py-8 dark:border-zinc-800">
        <div className="container mx-auto px-4 text-center text-sm text-zinc-600 dark:text-zinc-400">
          <p>&copy; {new Date().getFullYear()} הדרך. כל הזכויות שמורות.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-zinc-800">
      <h3 className="mb-3 text-xl font-semibold text-zinc-900 dark:text-white">
        {title}
      </h3>
      <p className="text-zinc-600 dark:text-zinc-400">{description}</p>
    </div>
  );
}
