"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import {
  buildDateReflectionSummary,
  DATE_REFLECTION_SOURCE,
  DATE_REFLECTION_STEPS,
  EMPTY_DATE_REFLECTION,
  REFLECTION_CHOICE_OPTIONS,
  REFLECTION_DIRECTION_OPTIONS,
  REFLECTION_FEELING_OPTIONS,
  REFLECTION_FOCUS_OPTIONS,
  REFLECTION_NEED_OPTIONS,
  type DateReflectionDraft,
  type ReflectionFeelingId,
  type ReflectionNeedId,
} from "@/content/tools/date-reflection";

const TEXT_LIMIT = 600;

const textareaClassName =
  "min-h-32 w-full resize-y rounded-xl border border-zinc-300 bg-white px-4 py-3 text-start text-base leading-relaxed text-zinc-900 placeholder:text-zinc-400 focus:border-brand-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:placeholder:text-zinc-500";

function toggleValue<T extends string>(values: T[], value: T): T[] {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

export default function DateReflectionPage() {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<DateReflectionDraft>({
    ...EMPTY_DATE_REFLECTION,
  });
  const [copyStatus, setCopyStatus] = useState("");
  const stepHeadingRef = useRef<HTMLHeadingElement>(null);
  const hasMounted = useRef(false);

  const hasTryContent =
    draft.intention.trim().length > 0 ||
    draft.observation.trim().length > 0 ||
    draft.feelings.length > 0 ||
    draft.needs.length > 0;
  const canContinueFromTry = hasTryContent && draft.choice !== null;
  const visibleDirectionOptions =
    draft.choice === "pressure"
      ? REFLECTION_DIRECTION_OPTIONS.filter((option) =>
          ["pause", "end", "support"].includes(option.id),
        )
      : REFLECTION_DIRECTION_OPTIONS;
  const summary = useMemo(() => buildDateReflectionSummary(draft), [draft]);

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }
    stepHeadingRef.current?.focus();
  }, [step]);

  const updateDraft = <K extends keyof DateReflectionDraft>(
    key: K,
    value: DateReflectionDraft[K],
  ) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setCopyStatus("");
  };

  const copySummary = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setCopyStatus("הסיכום הועתק. אפשר להדביק אותו במסמך פרטי.");
    } catch {
      setCopyStatus("ההעתקה לא הצליחה. אפשר לסמן את הסיכום ולהעתיק ידנית.");
    }
  };

  const updateChoice = (choice: DateReflectionDraft["choice"]) => {
    setDraft((current) => ({
      ...current,
      choice,
      direction:
        choice === "pressure" &&
        current.direction !== null &&
        !["pause", "end", "support"].includes(current.direction)
          ? null
          : current.direction,
    }));
    setCopyStatus("");
  };

  const clearReflection = () => {
    const shouldClear = window.confirm(
      "לנקות את כל התשובות? הפעולה תמחק את הטקסט מהלשונית הזו.",
    );
    if (!shouldClear) return;
    setDraft({ ...EMPTY_DATE_REFLECTION });
    setStep(0);
    setCopyStatus("התרגול נוקה.");
  };

  return (
    <div
      className="min-h-dvh bg-zinc-50 dark:bg-zinc-950"
      dir="rtl"
      lang="he"
      data-source-key={DATE_REFLECTION_SOURCE.sourceKey}
      data-source-revision={DATE_REFLECTION_SOURCE.sourceRevision}
    >
      <Header />

      <main id="main-content" tabIndex={-1} className="container mx-auto px-4 py-10">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/tools"
            className="mb-6 inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-sm text-zinc-600 hover:text-brand-600 dark:text-zinc-300 dark:hover:text-brand-300"
          >
            <svg
              className="h-4 w-4 rotate-180"
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
            חזרה לכלים
          </Link>

          <header className="mb-6">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-2xl text-white shadow-lg shadow-brand-500/20" aria-hidden="true">
              ✍️
            </div>
            <p className="mb-2 text-sm font-semibold text-brand-600 dark:text-brand-300">
              מעבדת למידה מקומית
            </p>
            <h1 className="mb-3 text-3xl font-bold text-zinc-950 dark:text-white md:text-4xl">
              רפלקציה אחרי דייט
            </h1>
            <p className="max-w-2xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-300">
              עשר דקות כדי להבין את החוויה שלך ולבחור צעד קטן — בלי לדרג את
              המפגש ובלי לנסות לקרוא את המחשבות של האדם האחר.
            </p>
          </header>

          <aside className="mb-8 rounded-2xl border border-teal-300 bg-teal-50 p-5 text-sm leading-relaxed text-teal-950 dark:border-teal-700 dark:bg-teal-950/30 dark:text-teal-100" aria-label="פרטיות ושימוש בטוח">
            <h2 className="mb-2 font-semibold">התשובות נשארות בלשונית הזו</h2>
            <p>
              הכלי אינו שולח או שומר את התשובות. רענון או סגירת הלשונית ימחקו
              אותן. עדיף לא לכתוב שמות, כתובות, צילומי מסך או פרטים מזהים של
              אדם אחר. כל שאלה היא רשות, ואפשר לעצור בכל רגע.
            </p>
          </aside>

          <nav className="mb-8" aria-label="שלבי התרגול">
            <p className="sr-only" aria-live="polite">
              שלב {step + 1} מתוך {DATE_REFLECTION_STEPS.length}
            </p>
            <ol className="grid grid-cols-3 gap-2">
              {DATE_REFLECTION_STEPS.map((item, index) => (
                <li
                  key={item.id}
                  className={`rounded-xl border px-3 py-3 text-center text-sm font-medium ${
                    index === step
                      ? "border-brand-500 bg-brand-50 text-brand-800 dark:border-brand-400 dark:bg-brand-950/40 dark:text-brand-200"
                      : index < step
                        ? "border-teal-300 bg-teal-50 text-teal-800 dark:border-teal-700 dark:bg-teal-950/30 dark:text-teal-200"
                        : "border-zinc-200 bg-white text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400"
                  }`}
                  aria-current={index === step ? "step" : undefined}
                >
                  <span className="mb-1 block text-xs" dir="ltr">
                    {index + 1} / {DATE_REFLECTION_STEPS.length}
                  </span>
                  {item.shortLabel}
                </li>
              ))}
            </ol>
          </nav>

          <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
            <h2
              ref={stepHeadingRef}
              tabIndex={-1}
              className="mb-2 text-2xl font-bold text-zinc-950 dark:text-white"
            >
              {DATE_REFLECTION_STEPS[step].title}
            </h2>
            <p className="mb-7 leading-relaxed text-zinc-600 dark:text-zinc-300">
              {DATE_REFLECTION_STEPS[step].description}
            </p>

            {step === 0 && (
              <fieldset>
                <legend className="mb-4 text-base font-semibold text-zinc-900 dark:text-white">
                  אפשר לבחור מוקד אחד. אין כאן תשובה נכונה.
                </legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  {REFLECTION_FOCUS_OPTIONS.map((option) => (
                    <label
                      key={option.id}
                      className={`flex min-h-28 cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors ${
                        draft.focus === option.id
                          ? "border-brand-500 bg-brand-50 dark:border-brand-400 dark:bg-brand-950/40"
                          : "border-zinc-200 hover:border-brand-300 hover:bg-brand-50/40 dark:border-zinc-700 dark:hover:border-brand-700 dark:hover:bg-brand-950/20"
                      }`}
                    >
                      <input
                        type="radio"
                        name="reflection-focus"
                        value={option.id}
                        checked={draft.focus === option.id}
                        onChange={() => updateDraft("focus", option.id)}
                        className="mt-1 h-5 w-5 shrink-0 accent-brand-600"
                      />
                      <span>
                        <span className="mb-1 block font-semibold text-zinc-950 dark:text-white">
                          {option.label}
                        </span>
                        <span className="block text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                          {option.description}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
            )}

            {step === 1 && (
              <div className="space-y-7">
                <div>
                  <label htmlFor="reflection-intention" className="mb-2 block font-semibold text-zinc-900 dark:text-white">
                    מה בחרתי לנסות?
                  </label>
                  <p id="reflection-intention-help" className="mb-3 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                    לדוגמה: להקשיב עד הסוף, לשאול שאלה שמסקרנת אותי או לשים לב
                    לקצב שנוח לי. אפשר להשאיר ריק.
                  </p>
                  <textarea
                    id="reflection-intention"
                    value={draft.intention}
                    onChange={(event) => updateDraft("intention", event.target.value)}
                    maxLength={TEXT_LIMIT}
                    aria-describedby="reflection-intention-help reflection-intention-count"
                    className={textareaClassName}
                    placeholder="כתבתי לעצמי כוונה קטנה..."
                  />
                  <p id="reflection-intention-count" className="mt-1 text-end text-xs text-zinc-500 dark:text-zinc-400">
                    <bdi dir="ltr">{draft.intention.length} / {TEXT_LIMIT}</bdi>
                  </p>
                </div>

                <div>
                  <label htmlFor="reflection-observation" className="mb-2 block font-semibold text-zinc-900 dark:text-white">
                    מה קרה בפועל?
                  </label>
                  <p id="reflection-observation-help" className="mb-3 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                    מתארים עובדות שאפשר היה לראות או לשמוע, בלי שם ובלי להסיק
                    כוונה. למשל: ״שאלתי שתי שאלות״ או ״החלטנו לסיים אחרי שעה״.
                  </p>
                  <textarea
                    id="reflection-observation"
                    value={draft.observation}
                    onChange={(event) => updateDraft("observation", event.target.value)}
                    maxLength={TEXT_LIMIT}
                    aria-describedby="reflection-observation-help reflection-observation-count"
                    className={textareaClassName}
                    placeholder="מה ראיתי או שמעתי, בלי פרשנות..."
                  />
                  <p id="reflection-observation-count" className="mt-1 text-end text-xs text-zinc-500 dark:text-zinc-400">
                    <bdi dir="ltr">{draft.observation.length} / {TEXT_LIMIT}</bdi>
                  </p>
                </div>

                <fieldset>
                  <legend className="mb-2 font-semibold text-zinc-900 dark:text-white">
                    מה הרגשתי? <span className="font-normal text-zinc-500">אפשר כמה</span>
                  </legend>
                  <div className="flex flex-wrap gap-2">
                    {REFLECTION_FEELING_OPTIONS.map((option) => {
                      const selected = draft.feelings.includes(option.id);
                      return (
                        <button
                          key={option.id}
                          type="button"
                          aria-pressed={selected}
                          onClick={() =>
                            updateDraft(
                              "feelings",
                              toggleValue<ReflectionFeelingId>(draft.feelings, option.id),
                            )
                          }
                          className={`min-h-11 rounded-full border px-4 py-2 text-sm font-medium ${
                            selected
                              ? "border-blue-600 bg-blue-600 text-white dark:border-blue-400 dark:bg-blue-400 dark:text-zinc-950"
                              : "border-zinc-300 bg-white text-zinc-700 hover:border-blue-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200"
                          }`}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>

                <fieldset>
                  <legend className="mb-2 font-semibold text-zinc-900 dark:text-white">
                    מה היה חסר או חשוב לי? <span className="font-normal text-zinc-500">אפשר כמה</span>
                  </legend>
                  <div className="flex flex-wrap gap-2">
                    {REFLECTION_NEED_OPTIONS.map((option) => {
                      const selected = draft.needs.includes(option.id);
                      return (
                        <button
                          key={option.id}
                          type="button"
                          aria-pressed={selected}
                          onClick={() =>
                            updateDraft(
                              "needs",
                              toggleValue<ReflectionNeedId>(draft.needs, option.id),
                            )
                          }
                          className={`min-h-11 rounded-full border px-4 py-2 text-sm font-medium ${
                            selected
                              ? "border-teal-700 bg-teal-700 text-white dark:border-teal-300 dark:bg-teal-300 dark:text-zinc-950"
                              : "border-zinc-300 bg-white text-zinc-700 hover:border-teal-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200"
                          }`}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>

                <fieldset>
                  <legend className="mb-3 font-semibold text-zinc-900 dark:text-white">
                    בדיקת בחירה וגבולות
                  </legend>
                  <div className="space-y-3">
                    {REFLECTION_CHOICE_OPTIONS.map((option) => (
                      <label
                        key={option.id}
                        className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 ${
                          draft.choice === option.id
                            ? "border-brand-500 bg-brand-50 dark:border-brand-400 dark:bg-brand-950/40"
                            : "border-zinc-200 hover:border-brand-300 dark:border-zinc-700 dark:hover:border-brand-700"
                        }`}
                      >
                        <input
                          type="radio"
                          name="reflection-choice"
                          value={option.id}
                          checked={draft.choice === option.id}
                          onChange={() => updateChoice(option.id)}
                          className="mt-1 h-5 w-5 shrink-0 accent-brand-600"
                        />
                        <span>
                          <span className="block font-semibold text-zinc-950 dark:text-white">
                            {option.label}
                          </span>
                          <span className="mt-1 block text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                            {option.description}
                          </span>
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                {draft.choice === "pressure" && (
                  <div role="alert" className="rounded-2xl border border-amber-400 bg-amber-50 p-5 text-sm leading-relaxed text-amber-950 dark:border-amber-600 dark:bg-amber-950/30 dark:text-amber-100">
                    <h3 className="mb-2 font-semibold">לחץ או חציית גבול אינם כישלון בתרגול</h3>
                    <p>
                      אין צורך להשלים את הרפלקציה או לנסות לתקן את המפגש. אפשר
                      לעצור, להתרחק, לחסום קשר ולשתף אדם אמין. במקרה של סכנה
                      מיידית יש לפנות לשירותי החירום באזורכם.
                    </p>
                  </div>
                )}

                {!canContinueFromTry && (
                  <p id="try-step-requirements" className="rounded-xl bg-zinc-100 p-3 text-sm text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                    כדי לעבור לבדיקה, יש לבחור תשובה בבדיקת הגבולות ולתעד לפחות
                    פרט אחד על הבחירה או החוויה שלך.
                  </p>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-7">
                <fieldset>
                  <legend className="mb-4 font-semibold text-zinc-900 dark:text-white">
                    איזה כיוון משרת אותי עכשיו?
                  </legend>
                  {draft.choice === "pressure" && (
                    <p className="mb-4 rounded-xl bg-amber-50 p-4 text-sm leading-relaxed text-amber-950 dark:bg-amber-950/30 dark:text-amber-100">
                      בעקבות סימון של לחץ או חציית גבול, מוצגים רק כיוונים שלא
                      דורשים להמשיך את המפגש או ליצור קשר נוסף.
                    </p>
                  )}
                  <div className="grid gap-3 sm:grid-cols-2">
                    {visibleDirectionOptions.map((option) => (
                      <label
                        key={option.id}
                        className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 ${
                          draft.direction === option.id
                            ? "border-brand-500 bg-brand-50 dark:border-brand-400 dark:bg-brand-950/40"
                            : "border-zinc-200 hover:border-brand-300 dark:border-zinc-700 dark:hover:border-brand-700"
                        }`}
                      >
                        <input
                          type="radio"
                          name="reflection-direction"
                          value={option.id}
                          checked={draft.direction === option.id}
                          onChange={() => updateDraft("direction", option.id)}
                          className="mt-1 h-5 w-5 shrink-0 accent-brand-600"
                        />
                        <span>
                          <span className="block font-semibold text-zinc-950 dark:text-white">
                            {option.label}
                          </span>
                          <span className="mt-1 block text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                            {option.description}
                          </span>
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                <div>
                  <label htmlFor="reflection-next-step" className="mb-2 block font-semibold text-zinc-900 dark:text-white">
                    הצעד הקטן שלי <span className="font-normal text-zinc-500">(לא חובה)</span>
                  </label>
                  <p id="reflection-next-step-help" className="mb-3 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                    פעולה שנמצאת בשליטה שלך ומשאירה מקום לבחירה. גם מנוחה,
                    בירור או החלטה שלא להמשיך הם צעדים תקפים.
                  </p>
                  <textarea
                    id="reflection-next-step"
                    value={draft.nextStep}
                    onChange={(event) => updateDraft("nextStep", event.target.value)}
                    maxLength={TEXT_LIMIT}
                    aria-describedby="reflection-next-step-help reflection-next-step-count"
                    className={textareaClassName}
                    placeholder="צעד אחד קטן, בלי מכסה ובלי יעד תוצאה..."
                  />
                  <p id="reflection-next-step-count" className="mt-1 text-end text-xs text-zinc-500 dark:text-zinc-400">
                    <bdi dir="ltr">{draft.nextStep.length} / {TEXT_LIMIT}</bdi>
                  </p>
                </div>

                {draft.direction && (
                  <div className="rounded-2xl border border-teal-300 bg-teal-50 p-5 dark:border-teal-700 dark:bg-teal-950/30">
                    <h3 className="mb-3 text-lg font-semibold text-teal-950 dark:text-teal-100">
                      הסיכום הפרטי שלי
                    </h3>
                    <pre className="whitespace-pre-wrap font-sans text-sm leading-7 text-teal-950 dark:text-teal-100">
                      {summary}
                    </pre>
                    <button
                      type="button"
                      onClick={copySummary}
                      className="mt-5 min-h-11 rounded-xl bg-teal-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-900 dark:bg-teal-300 dark:text-teal-950 dark:hover:bg-teal-200"
                    >
                      העתקת הסיכום
                    </button>
                  </div>
                )}

                {!draft.direction && (
                  <p className="rounded-xl bg-zinc-100 p-3 text-sm text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                    אחרי בחירת כיוון יופיע כאן סיכום שאפשר להעתיק למסמך פרטי.
                  </p>
                )}
              </div>
            )}

            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-zinc-200 pt-6 dark:border-zinc-700 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-3">
                {step > 0 && (
                  <button
                    type="button"
                    onClick={() => setStep((current) => current - 1)}
                    className="min-h-11 rounded-xl border border-zinc-300 px-5 py-2.5 text-sm font-semibold text-zinc-700 hover:border-brand-400 hover:text-brand-700 dark:border-zinc-700 dark:text-zinc-200 dark:hover:border-brand-500"
                  >
                    חזרה
                  </button>
                )}
                {step < 2 && (
                  <button
                    type="button"
                    onClick={() => setStep((current) => current + 1)}
                    disabled={step === 0 ? draft.focus === null : !canContinueFromTry}
                    aria-describedby={step === 1 && !canContinueFromTry ? "try-step-requirements" : undefined}
                    className="min-h-11 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-600 dark:disabled:bg-zinc-700 dark:disabled:text-zinc-400"
                  >
                    {step === 0 ? "להתבוננות" : "לבדיקה"}
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={clearReflection}
                className="min-h-11 rounded-xl px-3 py-2 text-sm text-zinc-500 underline decoration-zinc-300 underline-offset-4 hover:text-red-700 dark:text-zinc-400 dark:hover:text-red-300"
              >
                ניקוי התרגול
              </button>
            </div>

            <p className="mt-4 min-h-6 text-sm text-zinc-600 dark:text-zinc-300" role="status" aria-live="polite">
              {copyStatus}
            </p>
          </section>

          <p className="mt-6 text-center text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
            הכלי נועד ללמידה עצמית ואינו אבחון, טיפול או המלצה אם להמשיך בקשר.
            הבחירה נשארת שלך ויכולה להשתנות.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
