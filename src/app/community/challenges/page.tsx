import Link from "next/link";
import { Header } from "@/components/layout/header";

export default function ContainedProgressPage() {
  return (
    <div className="min-h-dvh bg-white dark:bg-zinc-950">
      <Header />
      <main id="main-content" className="container mx-auto max-w-3xl px-4 py-16">
        <section className="rounded-3xl border border-zinc-200 bg-zinc-50 p-8 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
            התקדמות אישית
          </p>
          <h1 className="mt-2 text-3xl font-bold text-zinc-950 dark:text-white">
            תרגול בלי לחץ
          </h1>
          <p className="mt-4 text-base leading-8 text-zinc-700 dark:text-zinc-300">
            אתגרי צבירת נקודות הוסרו. אפשר לבחור שיעור או תרגול אחד שמתאים עכשיו, לדלג, לעצור ולחזור בלי לאבד רצף ובלי לקבל ציון על שיתוף אישי או על קשרים.
          </p>
          <Link
            href="/courses"
            className="mt-8 inline-flex min-h-11 items-center rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500"
          >
            לבחור שיעור
          </Link>
        </section>
      </main>
    </div>
  );
}
