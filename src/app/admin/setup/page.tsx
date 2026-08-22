import Link from "next/link";

export default function AdminSetupPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
      <section className="mx-auto max-w-md rounded-xl border border-zinc-200 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-950">
          <svg
            className="h-8 w-8 text-amber-600 dark:text-amber-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
        </div>
        <h1 className="mb-2 text-xl font-bold text-zinc-900 dark:text-white">
          הגדרת מנהל מערכת
        </h1>
        <p className="mb-2 text-sm text-zinc-600 dark:text-zinc-300">
          מטעמי אבטחה, אי אפשר להעניק הרשאות מנהל מתוך עמוד ציבורי.
        </p>
        <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
          ההקמה הראשונית מתבצעת בפעולה פנימית ומבוקרת. אם דרושה לך גישה, פנה למנהל המערכת.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center rounded-lg bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          חזרה לדשבורד
        </Link>
      </section>
    </main>
  );
}
