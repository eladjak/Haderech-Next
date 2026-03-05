"use client";

export default function OfflinePage() {
  return (
    <div
      className="flex min-h-dvh flex-col items-center justify-center bg-[var(--background)] px-4 text-center"
      dir="rtl"
    >
      <div className="mx-auto max-w-md">
        <div className="mb-6 text-6xl">📡</div>
        <h1 className="mb-4 text-2xl font-bold text-blue-500 dark:text-white">
          אין חיבור לאינטרנט
        </h1>
        <p className="mb-8 text-blue-500/60 dark:text-zinc-400">
          נראה שאין חיבור לאינטרנט כרגע. בדוק את החיבור שלך ונסה שוב.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex h-11 items-center justify-center rounded-xl bg-gradient-to-l from-brand-500 to-brand-600 px-6 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg hover:brightness-110"
        >
          נסה שוב
        </button>
      </div>
    </div>
  );
}
