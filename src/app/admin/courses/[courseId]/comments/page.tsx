"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import type { Id } from "@/../convex/_generated/dataModel";

// Mock comments for development without Convex
const mockComments = [
  {
    _id: "mock_c1" as string,
    userId: "u1" as string,
    lessonId: "l1" as string,
    courseId: "c1" as string,
    content: "שיעור מעולה! למדתי הרבה על הקשבה פעילה.",
    parentId: undefined,
    createdAt: Date.now() - 3600000,
    updatedAt: Date.now() - 3600000,
    userName: "דני כהן",
    lessonTitle: "מהי הקשבה אמיתית?",
  },
  {
    _id: "mock_c2" as string,
    userId: "u2" as string,
    lessonId: "l2" as string,
    courseId: "c1" as string,
    content:
      "האם יש תרגילים נוספים שאפשר לעשות? הייתי שמח לקבל חומרי העשרה.",
    parentId: undefined,
    createdAt: Date.now() - 7200000,
    updatedAt: Date.now() - 7200000,
    userName: "שרה לוי",
    lessonTitle: "חסמי הקשבה נפוצים",
  },
];

export default function AdminCommentsPage() {
  const params = useParams<{ courseId: string }>();
  const courseId = params.courseId as Id<"courses">;

  const commentsRaw = useQuery(api.adminComments.listByCourse, { courseId });
  const removeComment = useMutation(api.adminComments.remove);

  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Use mock data if Convex returns undefined (not connected)
  const comments = commentsRaw ?? mockComments;

  const handleDelete = useCallback(
    async (id: string) => {
      await removeComment({ id: id as Id<"comments"> });
      setDeleteConfirm(null);
    },
    [removeComment]
  );

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "עכשיו";
    if (minutes < 60) return `לפני ${minutes} דקות`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `לפני ${hours} שעות`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `לפני ${days} ימים`;
    return new Date(timestamp).toLocaleDateString("he-IL");
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <nav className="mb-2 text-sm text-zinc-500 dark:text-zinc-400">
            <Link
              href="/admin/courses"
              className="hover:text-zinc-900 dark:hover:text-white"
            >
              קורסים
            </Link>
            <span className="mx-2">/</span>
            <span className="text-zinc-900 dark:text-white">תגובות</span>
          </nav>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
            ניהול תגובות
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {comments.length} תגובות בקורס
          </p>
        </div>
      </div>

      {/* Comments list */}
      {comments.length === 0 ? (
        <div className="rounded-xl bg-zinc-50 p-12 text-center dark:bg-zinc-800/50">
          <svg
            className="mx-auto mb-3 h-10 w-10 text-zinc-300 dark:text-zinc-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
            />
          </svg>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            אין תגובות עדיין בקורס זה
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div
              key={comment._id}
              className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800/50"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Comment meta */}
                  <div className="mb-2 flex flex-wrap items-center gap-2 text-sm">
                    <span className="font-medium text-zinc-900 dark:text-white">
                      {comment.userName}
                    </span>
                    <span className="text-zinc-300 dark:text-zinc-600">|</span>
                    <span className="text-zinc-500 dark:text-zinc-400">
                      {("lessonTitle" in comment && comment.lessonTitle) ||
                        "שיעור"}
                    </span>
                    <span className="text-zinc-300 dark:text-zinc-600">|</span>
                    <span className="text-zinc-400">
                      {formatTime(comment.createdAt)}
                    </span>
                    {comment.parentId && (
                      <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400">
                        תשובה
                      </span>
                    )}
                  </div>

                  {/* Comment content */}
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                    {comment.content}
                  </p>
                </div>

                {/* Delete button */}
                <button
                  type="button"
                  onClick={() => setDeleteConfirm(comment._id)}
                  className="mr-3 shrink-0 rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                  aria-label="מחק תגובה"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900">
            <h3 className="mb-2 text-lg font-bold text-zinc-900 dark:text-white">
              מחיקת תגובה
            </h3>
            <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
              האם אתה בטוח שברצונך למחוק תגובה זו? אם זו תגובה ראשית, כל
              התשובות אליה יימחקו גם כן.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="rounded-lg px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                ביטול
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirm)}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                מחק
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
