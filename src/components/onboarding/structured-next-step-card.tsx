import Link from "next/link";
import type { StructuredOnboardingNextStep } from "@/lib/learner-journey";

interface StructuredNextStepCardProps {
  recommendation: StructuredOnboardingNextStep;
  headingLevel?: "h2" | "h3";
}

export function StructuredNextStepCard({
  recommendation,
  headingLevel = "h2",
}: StructuredNextStepCardProps) {
  const Heading = headingLevel;
  const isChoiceBased = recommendation.mode === "choice-based";

  return (
    <div className="rounded-2xl border border-brand-200 bg-brand-50/70 p-5 text-right dark:border-brand-800/70 dark:bg-brand-950/20">
      <p className="text-sm font-semibold text-brand-700 dark:text-brand-300">
        {isChoiceBased
          ? "נקודת פתיחה לפי הבחירות שלך"
          : "נקודת פתיחה בלי שאלון"}
      </p>
      <Heading className="mt-2 text-xl font-bold text-zinc-900 dark:text-white">
        {recommendation.label}
      </Heading>
      <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
        {recommendation.description}
      </p>

      {recommendation.basis.length > 0 && (
        <div className="mt-3" aria-label="הבחירות שעליהן מבוססת ההצעה">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            לפי מה שסומן:
          </p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {recommendation.basis.map((item) => (
              <li
                key={item}
                className="rounded-full bg-white px-3 py-1 text-xs text-zinc-700 shadow-[0_0_0_1px_rgba(0,0,0,0.06)] dark:bg-zinc-900 dark:text-zinc-200 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08)]"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="mt-3 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
        {recommendation.explanation}
      </p>

      <Link
        href={recommendation.href}
        className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white transition-[transform,background-color] hover:bg-brand-800 active:scale-[0.96] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700 dark:bg-brand-500 dark:hover:bg-brand-400 dark:focus-visible:outline-brand-300"
      >
        {recommendation.label}
      </Link>
    </div>
  );
}
