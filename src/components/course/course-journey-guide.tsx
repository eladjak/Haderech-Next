import Image from "next/image";
import Link from "next/link";
import { COURSE_PHASE_ILLUSTRATIONS } from "@/generated/course-phase-illustrations";
import {
  CANONICAL_COURSE_SCOPE,
  LEARNING_LOOP,
} from "@/lib/learner-journey";

interface CourseJourneyGuideProps {
  lessonCount: number;
  isEnrolled: boolean;
  continueHref: string;
}

export function CourseJourneyGuide({
  lessonCount,
  isEnrolled,
  continueHref,
}: CourseJourneyGuideProps) {
  const scope = [
    { value: CANONICAL_COURSE_SCOPE.weeks, label: "שבועות" },
    { value: CANONICAL_COURSE_SCOPE.phases, label: "שלבי למידה" },
    { value: lessonCount, label: "שיעורים זמינים" },
    { value: CANONICAL_COURSE_SCOPE.practicePdfs, label: "קובצי PDF לתרגול" },
  ];

  return (
    <section
      className="mb-10 overflow-hidden rounded-3xl bg-white p-6 shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_8px_30px_rgba(15,23,42,0.06)] sm:p-8 dark:bg-zinc-900 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08)]"
      aria-labelledby="course-journey-title"
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <p className="mb-2 text-sm font-semibold text-brand-600 dark:text-brand-400">
            כך עובדים עם הקורס
          </p>
          <h2
            id="course-journey-title"
            className="text-balance text-2xl font-bold text-zinc-900 dark:text-white"
          >
            מסלול מסודר, עם מקום לבחור את הקצב
          </h2>
          <p className="mt-3 text-pretty leading-relaxed text-zinc-600 dark:text-zinc-400">
            התוכנית בנויה כרצף, אבל יחידת העבודה היא קטנה: שיעור אחד,
            תרגול אחד ותובנה אחת שאפשר לחזור אליה. אין צורך לבצע כל תרגיל או
            להתקדם לפי לוח זמנים קשיח.
          </p>
        </div>

        <Link
          href={isEnrolled ? continueHref : "#curriculum"}
          className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-[transform,box-shadow,background-color] duration-150 hover:bg-zinc-800 hover:shadow-md active:scale-[0.96] dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
        >
          {isEnrolled ? "לצעד הבא שלי" : "לראות את תוכנית הלימודים"}
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
            />
          </svg>
        </Link>
      </div>

      <dl className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {scope.map((item) => (
          <div
            key={item.label}
            className="flex flex-col-reverse rounded-2xl bg-zinc-50 px-4 py-3 dark:bg-zinc-800/70"
          >
            <dt className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
              {item.label}
            </dt>
            <dd className="tabular-nums text-2xl font-bold text-zinc-900 dark:text-white">
              {item.value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-8">
        <p className="mb-3 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
          ששת השלבים במסלול
        </p>
        <ol
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6"
          aria-label="ששת שלבי הלמידה בקורס"
        >
          {COURSE_PHASE_ILLUSTRATIONS.map((phase) => {
            const firstWeek = phase.weeks[0];
            const lastWeek = phase.weeks[phase.weeks.length - 1];
            const weekLabel =
              firstWeek === lastWeek
                ? `שבוע ${firstWeek}`
                : `שבועות ${firstWeek}–${lastWeek}`;
            return (
              <li
                key={phase.phase}
                className="overflow-hidden rounded-2xl bg-zinc-50 ring-1 ring-zinc-200/70 dark:bg-zinc-800/70 dark:ring-zinc-700"
              >
                <div className="relative aspect-video bg-zinc-100 dark:bg-zinc-800">
                  <Image
                    src={phase.src}
                    alt={phase.alt}
                    fill
                    sizes="(min-width: 1024px) 150px, (min-width: 640px) 33vw, 50vw"
                    className="object-cover"
                  />
                </div>
                <div className="px-3 py-3">
                  <p className="text-[11px] font-medium text-brand-600 dark:text-brand-400">
                    שלב {phase.phase} · {weekLabel}
                  </p>
                  <h3 className="mt-1 text-sm font-bold text-zinc-900 dark:text-white">
                    {phase.name}
                  </h3>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      <ol className="mt-7 grid gap-4 md:grid-cols-3">
        {LEARNING_LOOP.map((step, index) => (
          <li key={step.title} className="flex gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-sm font-bold text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
              {index + 1}
            </span>
            <div>
              <h3 className="font-semibold text-zinc-900 dark:text-white">
                {step.title}
              </h3>
              <p className="mt-1 text-pretty text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                {step.description}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
