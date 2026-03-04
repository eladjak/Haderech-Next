"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { useState } from "react";
import type { Id } from "@/../convex/_generated/dataModel";

const CATEGORY_LABELS: Record<string, string> = {
  general: "כללי",
  "dating-tips": "טיפי דייטינג",
  "success-stories": "סיפורי הצלחה",
  questions: "שאלות",
  advice: "עצות",
};

function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return "עכשיו";
  if (minutes < 60) return `לפני ${minutes} דקות`;
  if (hours < 24) return `לפני ${hours} שעות`;
  return `לפני ${days} ימים`;
}

export default function AdminCommunityPage() {
  const topics = useQuery(api.adminCommunity.listAllTopics, { limit: 100 });
  const stats = useQuery(api.adminCommunity.getCommunityStats);

  const pinTopic = useMutation(api.adminCommunity.pinTopic);
  const unpinTopic = useMutation(api.adminCommunity.unpinTopic);
  const deleteTopic = useMutation(api.adminCommunity.deleteTopic);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pinningId, setPinningId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handlePin = async (topicId: Id<"communityTopics">, isPinned: boolean) => {
    setPinningId(topicId);
    try {
      if (isPinned) {
        await unpinTopic({ topicId });
      } else {
        await pinTopic({ topicId });
      }
    } catch (err) {
      console.error("Pin error:", err);
    } finally {
      setPinningId(null);
    }
  };

  const handleDelete = async (topicId: Id<"communityTopics">) => {
    if (confirmDeleteId !== topicId) {
      setConfirmDeleteId(topicId);
      return;
    }
    setDeletingId(topicId);
    setConfirmDeleteId(null);
    try {
      await deleteTopic({ topicId });
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          ניהול קהילה
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          ניהול נושאים, הצמדה ומחיקה
        </p>
      </div>

      {/* Stats Cards */}
      {stats ? (
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              נושאים
            </p>
            <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-white">
              {stats.totalTopics}
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              תגובות
            </p>
            <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-white">
              {stats.totalReplies}
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              לייקים
            </p>
            <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-white">
              {stats.totalLikes}
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              מוצמדים
            </p>
            <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-white">
              {stats.pinnedTopics}
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              משתמשים פעילים
            </p>
            <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-white">
              {stats.activeUsers}
            </p>
          </div>
        </div>
      ) : (
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800"
            />
          ))}
        </div>
      )}

      {/* Category Breakdown */}
      {stats?.categoryBreakdown && Object.keys(stats.categoryBreakdown).length > 0 && (
        <div className="mb-8 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-4 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            פילוג לפי קטגוריה
          </h2>
          <div className="flex flex-wrap gap-3">
            {Object.entries(stats.categoryBreakdown).map(([cat, count]) => (
              <div
                key={cat}
                className="flex items-center gap-2 rounded-lg bg-zinc-50 px-3 py-1.5 dark:bg-zinc-800"
              >
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  {CATEGORY_LABELS[cat] ?? cat}
                </span>
                <span className="rounded-full bg-zinc-200 px-1.5 py-0.5 text-xs font-bold text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
                  {String(count)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Topics Table */}
      <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
            כל הנושאים
          </h2>
        </div>

        {topics === undefined ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-16 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800"
              />
            ))}
          </div>
        ) : topics.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-zinc-500 dark:text-zinc-400">
            אין נושאים עדיין
          </div>
        ) : (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {topics.map((topic) => {
              const isDeleting = deletingId === topic._id;
              const isPinning = pinningId === topic._id;
              const isConfirmingDelete = confirmDeleteId === topic._id;

              return (
                <div
                  key={topic._id}
                  className={`px-5 py-4 transition-colors ${
                    isDeleting ? "opacity-50" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      {/* Badges */}
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        {topic.pinned && (
                          <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                            מוצמד
                          </span>
                        )}
                        <span className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                          {CATEGORY_LABELS[topic.category] ?? topic.category}
                        </span>
                      </div>

                      {/* Title */}
                      <p className="truncate text-sm font-semibold text-zinc-900 dark:text-white">
                        {topic.title}
                      </p>

                      {/* Meta */}
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
                        <span>{topic.authorName}</span>
                        <span>{formatRelativeTime(topic.createdAt)}</span>
                        <span>{topic.repliesCount} תגובות</span>
                        <span>{topic.likesCount} לייקים</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex shrink-0 items-center gap-2">
                      {/* Pin / Unpin */}
                      <button
                        onClick={() =>
                          handlePin(topic._id as Id<"communityTopics">, topic.pinned)
                        }
                        disabled={isPinning}
                        title={topic.pinned ? "בטל הצמדה" : "הצמד"}
                        aria-label={topic.pinned ? "בטל הצמדה" : "הצמד נושא"}
                        className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                          topic.pinned
                            ? "bg-amber-100 text-amber-600 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-900/50"
                            : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                        }`}
                      >
                        {isPinning ? (
                          <svg
                            className="h-4 w-4 animate-spin"
                            fill="none"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8v8z"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                            />
                          </svg>
                        )}
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() =>
                          handleDelete(topic._id as Id<"communityTopics">)
                        }
                        disabled={isDeleting}
                        title={isConfirmingDelete ? "לחץ שוב לאישור מחיקה" : "מחק"}
                        aria-label={
                          isConfirmingDelete ? "אשר מחיקה" : "מחק נושא"
                        }
                        className={`flex h-8 items-center justify-center rounded-lg px-2 text-xs font-medium transition-colors ${
                          isConfirmingDelete
                            ? "bg-red-500 text-white hover:bg-red-600"
                            : "bg-zinc-100 text-zinc-500 hover:bg-red-50 hover:text-red-600 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                        }`}
                      >
                        {isDeleting ? (
                          <svg
                            className="h-4 w-4 animate-spin"
                            fill="none"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8v8z"
                            />
                          </svg>
                        ) : isConfirmingDelete ? (
                          "אשר מחיקה"
                        ) : (
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                            />
                          </svg>
                        )}
                      </button>

                      {/* Cancel confirm */}
                      {isConfirmingDelete && (
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="flex h-8 items-center justify-center rounded-lg bg-zinc-100 px-2 text-xs font-medium text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                          aria-label="בטל מחיקה"
                        >
                          ביטול
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
