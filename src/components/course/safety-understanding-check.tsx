"use client";

import { useMemo, useState } from "react";

type SafetyChoice = {
  id: string;
  label: string;
  feedback: string;
  safe: boolean;
};

type SafetyScenario = {
  id: string;
  prompt: string;
  choices: SafetyChoice[];
};

const SAFETY_SCENARIOS: SafetyScenario[] = [
  {
    id: "stop-request",
    prompt:
      "בתרגיל משותף, האדם שמולכם אומר שהוא רוצה לעצור — בלי להסביר למה. מה הצעד הבטוח?",
    choices: [
      {
        id: "stop",
        label: "עוצרים מיד, בלי לדרוש הסבר, ומציעים מרחב או חלופה.",
        feedback:
          "בדיוק. עצירה אינה דורשת הצדקה, ואפשר לבחור אם להמשיך בדרך אחרת או לא להמשיך כלל.",
        safe: true,
      },
      {
        id: "one-more-minute",
        label: "מבקשים עוד דקה, כדי לתת לתרגיל הזדמנות לעבוד.",
        feedback:
          "כדאי לבחור מחדש: בקשת עצירה קודמת להשלמת התרגיל, גם אם הכוונה טובה.",
        safe: false,
      },
      {
        id: "ask-why",
        label: "מבקשים הסבר מלא לפני שמחליטים אם לעצור.",
        feedback:
          "כדאי לבחור מחדש: מותר לעצור בלי להסביר. בירור אפשרי רק אחר כך ורק אם האדם רוצה בו.",
        safe: false,
      },
    ],
  },
  {
    id: "unsafe-contact",
    prompt:
      "מישהו מפעיל לחץ, חוצה גבול או מעורר פחד. מה קודם למה?",
    choices: [
      {
        id: "safe-next-step",
        label:
          "הבטיחות קודמת לסגירת מעגל: מתרחקים לפי הצורך ופונים לאדם או לערוץ סיוע מתאים.",
        feedback:
          "נכון. אין חובה להיפגש, לענות או להסביר כדי להיות מכבדים. במקרה של סכנה מיידית פונים לשירותי החירום.",
        safe: true,
      },
      {
        id: "meet-to-explain",
        label: "נפגשים פנים אל פנים כדי להסביר את הגבול בצורה מכבדת.",
        feedback:
          "כדאי לבחור מחדש: מפגש אינו חובה, ובמצב של פחד, לחץ או שליטה הוא עלול להוסיף סיכון.",
        safe: false,
      },
      {
        id: "communication-tool-first",
        label: "מנסים קודם כלי תקשורת מהקורס ורק אז מחליטים אם להתרחק.",
        feedback:
          "כדאי לבחור מחדש: כלי תקשורת אינו תנאי ליציאה ממצב לא בטוח. בטיחות וגבולות קודמים לתרגול.",
        safe: false,
      },
    ],
  },
  {
    id: "course-scope",
    prompt: "איזו ציפייה מהקורס מתאימה למסגרת שלו?",
    choices: [
      {
        id: "educational-tools",
        label:
          "זהו קורס חינוכי שמציע כלים לבחירה; הוא אינו אבחון או טיפול ואינו מבטיח תוצאה או לוח זמנים.",
        feedback:
          "נכון. אפשר להשתמש בכלים, לדלג עליהם או לבחור תמיכה מקצועית — בלי להפוך השלמת קורס להבטחת תוצאה.",
        safe: true,
      },
      {
        id: "guaranteed-result",
        label: "מי שמשלים את כל השיעורים אמור להגיע לתוצאה זוגית בזמן צפוי.",
        feedback:
          "כדאי לבחור מחדש: השלמת תוכן אינה מבטיחה תוצאה אישית או לוח זמנים.",
        safe: false,
      },
      {
        id: "treatment-replacement",
        label: "התרגילים מחליפים טיפול או סיוע מקצועי כשיש מצוקה.",
        feedback:
          "כדאי לבחור מחדש: הקורס חינוכי ואינו תחליף לטיפול, לסיוע מקצועי או למענה חירום.",
        safe: false,
      },
    ],
  },
];

export function SafetyUnderstandingCheck() {
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const safeAnswerCount = useMemo(
    () =>
      SAFETY_SCENARIOS.filter((scenario) =>
        scenario.choices.some(
          (choice) => choice.id === answers[scenario.id] && choice.safe,
        ),
      ).length,
    [answers],
  );

  const complete = safeAnswerCount === SAFETY_SCENARIOS.length;

  return (
    <section
      aria-labelledby="safety-check-heading"
      className="mt-10 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 md:p-7 dark:border-emerald-900 dark:bg-emerald-950/20"
    >
      <h2
        id="safety-check-heading"
        className="text-xl font-bold text-zinc-950 dark:text-white"
      >
        שלוש בדיקות קצרות לפני שממשיכים
      </h2>
      <p className="mt-2 leading-relaxed text-zinc-700 dark:text-zinc-300">
        המטרה היא לוודא ששני העקרונות החשובים ברורים. אין ציון, התשובות לא
        נשמרות, והבדיקה אינה חוסמת תוכן או פרטי סיוע. אפשר לדלג עליה או לנסות
        שוב.
      </p>

      <div className="mt-6 space-y-8">
        {SAFETY_SCENARIOS.map((scenario, scenarioIndex) => {
          const selectedId = answers[scenario.id];
          const selected = scenario.choices.find(
            (choice) => choice.id === selectedId,
          );
          const feedbackId = `${scenario.id}-feedback`;

          return (
            <fieldset key={scenario.id} aria-describedby={feedbackId}>
              <legend className="font-semibold leading-relaxed text-zinc-950 dark:text-white">
                {scenarioIndex + 1}. {scenario.prompt}
              </legend>
              <div className="mt-3 grid gap-2">
                {scenario.choices.map((choice) => {
                  const inputId = `${scenario.id}-${choice.id}`;
                  return (
                    <label
                      key={choice.id}
                      htmlFor={inputId}
                      className="flex cursor-pointer items-start gap-3 rounded-xl border border-zinc-200 bg-white p-3 leading-relaxed text-zinc-800 transition hover:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-600 focus-within:ring-offset-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                    >
                      <input
                        id={inputId}
                        type="radio"
                        name={scenario.id}
                        value={choice.id}
                        checked={selectedId === choice.id}
                        onChange={() =>
                          setAnswers((current) => ({
                            ...current,
                            [scenario.id]: choice.id,
                          }))
                        }
                        className="mt-1 size-4 accent-emerald-700"
                      />
                      <span>{choice.label}</span>
                    </label>
                  );
                })}
              </div>
              <p
                id={feedbackId}
                role="status"
                aria-live="polite"
                className={`mt-3 min-h-12 rounded-lg px-3 py-2 text-sm leading-relaxed ${
                  selected?.safe
                    ? "bg-emerald-100 text-emerald-950 dark:bg-emerald-950/50 dark:text-emerald-100"
                    : selected
                      ? "bg-amber-100 text-amber-950 dark:bg-amber-950/50 dark:text-amber-100"
                      : "text-zinc-600 dark:text-zinc-400"
                }`}
              >
                {selected?.feedback ?? "בחרו תשובה כדי לקבל משוב מידי."}
              </p>
            </fieldset>
          );
        })}
      </div>

      <p
        role="status"
        aria-live="polite"
        className="mt-6 border-t border-emerald-200 pt-4 font-medium text-zinc-800 dark:border-emerald-900 dark:text-zinc-200"
      >
        {complete
          ? "שלושת העקרונות ברורים: מותר לעצור בלי להסביר, בטיחות קודמת לתרגול או לסגירת מעגל, והקורס אינו טיפול או הבטחת תוצאה."
          : `${safeAnswerCount} מתוך ${SAFETY_SCENARIOS.length} עקרונות סומנו בבחירה הבטוחה.`}
      </p>
    </section>
  );
}
