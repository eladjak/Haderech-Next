import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { LessonContent } from "@/components/lesson/lesson-content";
import { SafetyUnderstandingCheck } from "@/components/course/safety-understanding-check";
import {
  COURSE_SAFETY_PREFACE,
  COURSE_SAFETY_PREFACE_SOURCE_HASH,
} from "@/generated/course-safety-preface";

export const metadata: Metadata = {
  title: "בטיחות, גבולות ופרטי סיוע | הדרך",
  description: "הצהרת הבטיחות של הקורס ופרטי סיוע רשמיים.",
  robots: { index: false, follow: false },
};

export default function CourseSafetyPage() {
  return (
    <div className="min-h-dvh bg-background">
      <Header />
      <main className="container mx-auto px-4 py-10" dir="rtl">
        <article className="mx-auto max-w-3xl">
          <nav aria-label="מיקום" className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
            <Link href="/courses" className="underline underline-offset-4">
              קורסים
            </Link>
            <span aria-hidden="true" className="mx-2">/</span>
            <span>בטיחות ופרטי סיוע</span>
          </nav>

          <h1 className="text-3xl font-bold text-zinc-950 dark:text-white">
            בטיחות, גבולות ופרטי סיוע
          </h1>
          <p className="mt-4 leading-relaxed text-zinc-700 dark:text-zinc-300">
            הדף הזה נוצר ישירות מפתיח הבטיחות הקנוני של הקורס. פרטי הסיוע
            נבדקים מול המקורות הרשמיים; בזמן צורך מומלץ לוודא גם בערוץ הרשמי.
          </p>

          <div className="mt-6 rounded-xl border-2 border-red-300 bg-red-50 p-5 text-red-950 dark:border-red-900 dark:bg-red-950/30 dark:text-red-100">
            <h2 className="font-bold">סכנה מיידית</h2>
            <p className="mt-2 leading-relaxed">
              במקרה של סכנה מיידית לכם או לאדם אחר: משטרה 100, מד״א 101, או
              חדר מיון. אין להמתין למענה של הקורס או של צ׳אט.
            </p>
          </div>

          <LessonContent
            content={COURSE_SAFETY_PREFACE}
            className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6 md:p-8 dark:border-zinc-800 dark:bg-zinc-900/50"
          />

          <SafetyUnderstandingCheck />

          <p className="mt-6 break-all text-xs text-zinc-500 dark:text-zinc-500">
            מזהה גרסת מקור: {COURSE_SAFETY_PREFACE_SOURCE_HASH}
          </p>
        </article>
      </main>
      <Footer />
    </div>
  );
}
