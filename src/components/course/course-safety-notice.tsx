import Link from "next/link";

/**
 * Always-visible safety summary for every learner entry point.
 * The complete, generated canonical preface lives at /course-safety.
 */
export function CourseSafetyNotice() {
  return (
    <aside
      className="mb-6 rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-950 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100"
      aria-labelledby="course-safety-notice-title"
    >
      <h2 id="course-safety-notice-title" className="font-bold">
        חשוב לפני שממשיכים
      </h2>
      <p className="mt-2 text-sm leading-relaxed">
        הקורס הוא תוכן חינוכי, לא טיפול. מותר לעצור, לדלג או לבחור חלופה בכל
        תרגיל. אם יש פחד, איום, אלימות, שליטה, הטרדה או מעקב — בטיחות ופנייה
        לתמיכה קודמות לעבודה על הקשר. בסכנה מיידית מתקשרים למשטרה 100 או למד״א
        101.
      </p>
      <Link
        href="/course-safety"
        className="mt-3 inline-flex min-h-11 items-center rounded-lg font-semibold underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-800 dark:focus-visible:outline-amber-200"
      >
        להצהרת הבטיחות המלאה ולפרטי סיוע
      </Link>
    </aside>
  );
}
