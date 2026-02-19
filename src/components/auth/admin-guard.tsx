"use client";

import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";
import { useEffect, useState } from "react";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const me = useQuery(api.users.getMe);
  const ensureUser = useMutation(api.users.ensureUser);
  const [ensured, setEnsured] = useState(false);

  // יצירת משתמש ב-Convex אם לא קיים
  useEffect(() => {
    if (clerkLoaded && clerkUser && me === null && !ensured) {
      ensureUser().then(() => setEnsured(true));
    }
  }, [clerkLoaded, clerkUser, me, ensured, ensureUser]);

  // טוען
  if (!clerkLoaded || me === undefined) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900 dark:border-zinc-600 dark:border-t-white" />
          <p className="mt-3 text-sm text-zinc-500">טוען...</p>
        </div>
      </div>
    );
  }

  // משתמש לא נמצא (עדיין נוצר)
  if (me === null) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900 dark:border-zinc-600 dark:border-t-white" />
          <p className="mt-3 text-sm text-zinc-500">יוצר חשבון...</p>
        </div>
      </div>
    );
  }

  // לא admin
  if (me.role !== "admin") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="mx-auto max-w-md rounded-xl border border-zinc-200 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 dark:bg-red-950">
            <svg
              className="h-8 w-8 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
              />
            </svg>
          </div>
          <h1 className="mb-2 text-xl font-bold text-zinc-900 dark:text-white">
            אין הרשאת גישה
          </h1>
          <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
            רק מנהלים יכולים לגשת ללוח הניהול. אם אתה צריך גישה, פנה למנהל
            המערכת.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            חזרה לדשבורד
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
