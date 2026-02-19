"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/../convex/_generated/api";
import { Header } from "@/components/layout/header";

export default function StudentNotesPage() {
  const { user: clerkUser } = useUser();
  const convexUser = useQuery(
    api.users.getByClerkId,
    clerkUser?.id ? { clerkId: clerkUser.id } : "skip"
  );
  const notes = useQuery(
    api.notes.listAll,
    convexUser?._id ? { userId: convexUser._id } : "skip"
  );

  // Group notes by course
  const groupedByCourse =
    notes?.reduce(
      (acc, note) => {
        const key = note.courseId;
        if (!acc[key]) {
          acc[key] = {
            courseTitle: note.courseTitle,
            notes: [],
          };
        }
        acc[key].notes.push(note);
        return acc;
      },
      {} as Record<string, { courseTitle: string; notes: typeof notes }>
    ) ?? {};

  const formatDate = (timestamp: number) =>
    new Date(timestamp).toLocaleDateString("he-IL", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  return (
    <div className="min-h-dvh bg-white dark:bg-zinc-950">
      <Header />

      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="mx-auto max-w-3xl">
          {/* Breadcrumb */}
          <nav
            className="mb-6 text-sm text-zinc-500 dark:text-zinc-400"
            aria-label="ניווט"
          >
            <Link
              href="/dashboard"
              className="hover:text-zinc-900 dark:hover:text-white"
            >
              אזור אישי
            </Link>
            <span className="mx-2">/</span>
            <span className="text-zinc-900 dark:text-white">ההערות שלי</span>
          </nav>

          <h1 className="mb-2 text-2xl font-bold text-zinc-900 dark:text-white">
            ההערות שלי
          </h1>
          <p className="mb-8 text-sm text-zinc-500 dark:text-zinc-400">
            כל ההערות שרשמת בשיעורים, מאורגנות לפי קורס
          </p>

          {/* Loading */}
          {notes === undefined && (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-xl bg-zinc-50 p-6 dark:bg-zinc-900"
                >
                  <div className="mb-3 h-5 w-40 rounded bg-zinc-200 dark:bg-zinc-700" />
                  <div className="h-4 w-full rounded bg-zinc-200 dark:bg-zinc-700" />
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {notes && notes.length === 0 && (
            <div className="rounded-2xl bg-zinc-50 p-12 text-center dark:bg-zinc-900">
              <svg
                className="mx-auto mb-3 h-12 w-12 text-zinc-300 dark:text-zinc-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"
                />
              </svg>
              <h2 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-white">
                אין הערות עדיין
              </h2>
              <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
                התחל לרשום הערות בשיעורים כדי לזכור נקודות חשובות
              </p>
              <Link
                href="/courses"
                className="inline-flex h-10 items-center rounded-full bg-zinc-900 px-6 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
              >
                עבור לקורסים
              </Link>
            </div>
          )}

          {/* Notes grouped by course */}
          {Object.entries(groupedByCourse).map(([courseId, group]) => (
            <div key={courseId} className="mb-8">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-zinc-900 dark:text-white">
                <svg
                  className="h-5 w-5 text-amber-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                  />
                </svg>
                {group.courseTitle}
              </h2>

              <div className="space-y-3">
                {group.notes.map((note) => (
                  <Link
                    key={note._id}
                    href={`/course/${note.courseId}/lesson/${note.lessonId}`}
                    className="block rounded-xl border border-zinc-200 bg-white p-4 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:border-zinc-700 dark:hover:bg-zinc-900"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-medium text-zinc-900 dark:text-white">
                        {note.lessonTitle}
                      </span>
                      <span className="text-xs text-zinc-400">
                        {formatDate(note.updatedAt)}
                      </span>
                    </div>
                    <p className="line-clamp-3 whitespace-pre-wrap text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                      {note.content}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
