"use client";

import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "../../../../convex/_generated/api";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function AdminSetupPage() {
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const hasAdmin = useQuery(api.users.hasAnyAdmin);
  const me = useQuery(api.users.getMe);
  const ensureUser = useMutation(api.users.ensureUser);
  const promoteSelf = useMutation(api.users.promoteSelfToAdmin);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [ensured, setEnsured] = useState(false);

  // יצירת משתמש ב-Convex אם לא קיים
  useEffect(() => {
    if (clerkLoaded && clerkUser && me === null && !ensured) {
      ensureUser().then(() => setEnsured(true));
    }
  }, [clerkLoaded, clerkUser, me, ensured, ensureUser]);

  const handlePromote = async () => {
    setStatus("loading");
    setErrorMsg("");
    try {
      await promoteSelf();
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "שגיאה לא ידועה");
    }
  };

  // טוען
  if (!clerkLoaded || hasAdmin === undefined) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900 dark:border-zinc-600 dark:border-t-white" />
      </div>
    );
  }

  // לא מחובר
  if (!clerkUser) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="mx-auto max-w-md rounded-xl border border-zinc-200 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h1 className="mb-4 text-xl font-bold text-zinc-900 dark:text-white">
            הגדרת מנהל ראשון
          </h1>
          <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
            יש להתחבר לפני הגדרת מנהל המערכת.
          </p>
          <Link
            href="/sign-in"
            className="inline-flex items-center justify-center rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            התחברות
          </Link>
        </div>
      </div>
    );
  }

  // כבר הוקם מנהל
  if (hasAdmin && status !== "success") {
    const isCurrentUserAdmin = me?.role === "admin";

    return (
      <div className="flex min-h-dvh items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="mx-auto max-w-md rounded-xl border border-zinc-200 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950">
            <svg
              className="h-8 w-8 text-emerald-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
              />
            </svg>
          </div>
          <h1 className="mb-2 text-xl font-bold text-zinc-900 dark:text-white">
            מנהל כבר הוגדר
          </h1>
          <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
            המערכת כבר מוגדרת עם מנהל. {!isCurrentUserAdmin && "אם אתה צריך גישת מנהל, פנה למנהל הקיים."}
          </p>
          <Link
            href={isCurrentUserAdmin ? "/admin" : "/dashboard"}
            className="inline-flex items-center justify-center rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {isCurrentUserAdmin ? "ללוח הניהול" : "לדשבורד"}
          </Link>
        </div>
      </div>
    );
  }

  // הצלחה
  if (status === "success") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="mx-auto max-w-md rounded-xl border border-zinc-200 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950">
            <svg
              className="h-8 w-8 text-emerald-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12.75l6 6 9-13.5"
              />
            </svg>
          </div>
          <h1 className="mb-2 text-xl font-bold text-zinc-900 dark:text-white">
            הוגדרת כמנהל!
          </h1>
          <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
            כעת יש לך גישה מלאה ללוח הניהול.
          </p>
          <Link
            href="/admin"
            className="inline-flex items-center justify-center rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            ללוח הניהול
          </Link>
        </div>
      </div>
    );
  }

  // מצב הגדרה ראשונית
  return (
    <div className="flex min-h-dvh items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-md rounded-xl border border-zinc-200 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-950">
          <svg
            className="h-8 w-8 text-amber-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.42 15.17l-5.385 3.365a.75.75 0 01-1.114-.67V4.128a2.25 2.25 0 012.25-2.25h10.663a2.25 2.25 0 012.175 1.679l1.494 5.98a2.25 2.25 0 01-2.175 2.82H16.5"
            />
          </svg>
        </div>
        <h1 className="mb-2 text-xl font-bold text-zinc-900 dark:text-white">
          הגדרת מנהל ראשון
        </h1>
        <p className="mb-2 text-sm text-zinc-500 dark:text-zinc-400">
          לא הוגדר מנהל מערכת עדיין. המשתמש הראשון שילחץ יקבל הרשאות מנהל.
        </p>
        <p className="mb-6 text-xs text-zinc-400 dark:text-zinc-500">
          מחובר כ: {clerkUser.emailAddresses[0]?.emailAddress ?? clerkUser.id}
        </p>

        {errorMsg && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
            {errorMsg}
          </div>
        )}

        <button
          type="button"
          onClick={handlePromote}
          disabled={status === "loading"}
          className="inline-flex items-center justify-center rounded-lg bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {status === "loading" ? (
            <>
              <span className="ml-2 h-4 w-4 animate-spin rounded-full border-2 border-zinc-400 border-t-white" />
              מגדיר...
            </>
          ) : (
            "הגדר אותי כמנהל"
          )}
        </button>
      </div>
    </div>
  );
}
