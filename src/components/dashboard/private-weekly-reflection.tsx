"use client";

import { useMemo, useState } from "react";

const REFLECTION_PROMPTS = [
  {
    id: "understood",
    label: "מה הבנתי השבוע?",
    placeholder: "רעיון אחד שהתבהר לי...",
  },
  {
    id: "noticed",
    label: "מה ניסיתי או שמתי לב אליו?",
    placeholder: "שיחה, תרגול או רגע קטן ששמתי לב אליו...",
  },
  {
    id: "carry",
    label: "מה ארצה לקחת איתי לשבוע הבא?",
    placeholder: "בחירה קטנה, גבול או תרגול שאפשר לנסות...",
  },
] as const;

type ReflectionId = (typeof REFLECTION_PROMPTS)[number]["id"];
type ReflectionValues = Record<ReflectionId, string>;

const EMPTY_VALUES: ReflectionValues = {
  understood: "",
  noticed: "",
  carry: "",
};

export function PrivateWeeklyReflection() {
  const [values, setValues] = useState<ReflectionValues>(EMPTY_VALUES);
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");

  const hasContent = Object.values(values).some((value) => value.trim());
  const summary = useMemo(
    () =>
      REFLECTION_PROMPTS.map(({ id, label }) => {
        const answer = values[id].trim() || "—";
        return `${label}\n${answer}`;
      }).join("\n\n"),
    [values]
  );

  async function copyReflection() {
    if (!hasContent) return;
    try {
      await navigator.clipboard.writeText(summary);
      setStatus("copied");
    } catch {
      setStatus("error");
    }
  }

  function clearReflection() {
    setValues(EMPTY_VALUES);
    setStatus("idle");
  }

  return (
    <section
      className="mt-8 rounded-3xl border border-sky-200 bg-sky-50/70 p-6 shadow-sm dark:border-sky-800 dark:bg-sky-950/20 sm:p-8"
      aria-labelledby="private-weekly-reflection-title"
    >
      <div className="mb-6 max-w-2xl">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-sky-700 dark:text-sky-300">
          עצירה קצרה, בלי ציון
        </p>
        <h2
          id="private-weekly-reflection-title"
          className="text-2xl font-bold text-zinc-900 dark:text-white"
        >
          סיכום שבועי פרטי
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
          הכתיבה נשארת רק במסך הזה: היא אינה נשמרת בחשבון, אינה נשלחת ל-AI
          ונמחקת ברענון או ביציאה. אפשר לענות רק על מה שמועיל עכשיו.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {REFLECTION_PROMPTS.map(({ id, label, placeholder }) => (
          <label key={id} className="block">
            <span className="mb-2 block text-sm font-semibold text-zinc-800 dark:text-zinc-100">
              {label}
            </span>
            <textarea
              value={values[id]}
              onChange={(event) => {
                setValues((current) => ({
                  ...current,
                  [id]: event.target.value,
                }));
                setStatus("idle");
              }}
              maxLength={500}
              rows={5}
              placeholder={placeholder}
              className="w-full resize-y rounded-xl border border-sky-200 bg-white p-3 text-sm leading-relaxed text-zinc-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-500/15 dark:border-sky-800 dark:bg-zinc-950 dark:text-white"
            />
          </label>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={copyReflection}
          disabled={!hasContent}
          className="inline-flex min-h-11 items-center rounded-xl bg-sky-700 px-5 text-sm font-semibold text-white hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-45"
        >
          להעתיק לעצמי
        </button>
        <button
          type="button"
          onClick={clearReflection}
          disabled={!hasContent}
          className="inline-flex min-h-11 items-center rounded-xl border border-zinc-300 bg-white px-5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-45 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          לנקות
        </button>
        <p className="text-sm text-zinc-600 dark:text-zinc-300" role="status" aria-live="polite">
          {status === "copied"
            ? "הסיכום הועתק. עכשיו אפשר לשמור אותו במקום פרטי שבחרת."
            : status === "error"
              ? "הדפדפן לא אפשר העתקה. אפשר לסמן את הטקסט ולהעתיק ידנית."
              : "אין חובה למלא את כל השדות."}
        </p>
      </div>
    </section>
  );
}
