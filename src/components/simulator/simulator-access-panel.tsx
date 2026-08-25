import Link from "next/link";

export type SimulatorAccessStatus = {
  mode: "admin" | "entitled" | "trial" | "locked";
  hasFullAccess: boolean;
  trialLimit: number;
  trialUsed: number;
  trialReserved: number;
  trialRemaining: number;
  commerceAvailable: false;
};

export function SimulatorAccessPanel({
  access,
  compact = false,
}: {
  access: SimulatorAccessStatus;
  compact?: boolean;
}) {
  if (access.hasFullAccess) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200">
        הגישה המלאה לסימולטור פתוחה עבורך.
      </div>
    );
  }

  if (access.mode === "trial") {
    return (
      <div className="rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-800 dark:border-brand-700 dark:bg-brand-950/30 dark:text-brand-200">
        <p className="font-medium">
          נשארו לך {access.trialRemaining} מתוך {access.trialLimit} תגובות תרגול
          בניסיון החינמי.
        </p>
        {!compact && (
          <p className="mt-1 text-xs opacity-80">
            נספרת רק תגובה שהושלמה ונמסרה. בקשה שנכשלה בלי תשובה לא מנצלת יחידת
            ניסיון.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-950 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100">
      <h2 className="font-semibold">הניסיון החינמי הסתיים</h2>
      <p className="mt-2 text-sm leading-relaxed">
        מקווים שהטעימה עזרה לך להרגיש איך התרגול עובד. השיחות והמשוב שכבר יצרת
        נשארים בהיסטוריה שלך, והמשך השימוש ייפתח במסגרת זכאות מתאימה.
      </p>
      <p className="mt-2 text-sm leading-relaxed">
        אנחנו עדיין מחברים את התשלום והגישה באופן אמין, ולכן הרכישה אינה זמינה
        כרגע. אין כאן מחיר נסתר, ולא נחייב אותך לפני שהמסלול יהיה מוכן.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          disabled
          className="cursor-not-allowed rounded-xl bg-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300"
        >
          פתיחת גישה בתשלום — בקרוב
        </button>
        <Link
          href="/courses"
          className="rounded-xl border border-amber-300 px-5 py-2.5 text-sm font-medium hover:bg-amber-100 dark:border-amber-700 dark:hover:bg-amber-900/30"
        >
          להכיר את מסלול הלמידה
        </Link>
      </div>
    </div>
  );
}
