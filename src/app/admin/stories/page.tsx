"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { useState } from "react";
import type { Id } from "@/../convex/_generated/dataModel";

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  dating: "דייטינג",
  relationship: "זוגיות",
  "self-growth": "צמיחה אישית",
  marriage: "נישואין",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" dir="ltr">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`h-4 w-4 ${
            star <= rating
              ? "text-amber-400"
              : "text-zinc-300 dark:text-zinc-600"
          }`}
          fill={star <= rating ? "currentColor" : "none"}
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
          />
        </svg>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminStoriesPage() {
  const data = useQuery(api.stories.listAll);
  const approveStory = useMutation(api.stories.approveStory);
  const toggleFeatured = useMutation(api.stories.toggleFeatured);
  const deleteStory = useMutation(api.stories.deleteStory);
  const seedStories = useMutation(api.stories.seedStories);

  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [featuringId, setFeaturingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);

  const handleApprove = async (
    storyId: Id<"successStories">,
    featured: boolean
  ) => {
    setApprovingId(storyId);
    try {
      await approveStory({ storyId, featured });
    } catch (err) {
      console.error("Approve error:", err);
    } finally {
      setApprovingId(null);
    }
  };

  const handleToggleFeatured = async (storyId: Id<"successStories">) => {
    setFeaturingId(storyId);
    try {
      await toggleFeatured({ storyId });
    } catch (err) {
      console.error("Featured toggle error:", err);
    } finally {
      setFeaturingId(null);
    }
  };

  const handleDelete = async (storyId: Id<"successStories">) => {
    if (confirmDeleteId !== storyId) {
      setConfirmDeleteId(storyId);
      return;
    }
    setDeletingId(storyId);
    setConfirmDeleteId(null);
    try {
      await deleteStory({ storyId });
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await seedStories();
    } catch (err) {
      console.error("Seed error:", err);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
            ניהול סיפורי הצלחה
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            אישור, הצגה בראשי ומחיקת סיפורים
          </p>
        </div>

        {/* Seed Button */}
        {data && data.totalCount === 0 && (
          <button
            type="button"
            onClick={handleSeed}
            disabled={seeding}
            className="inline-flex h-9 items-center rounded-lg bg-[#E85D75] px-4 text-sm font-medium text-white transition-colors hover:bg-[#d64d65] disabled:opacity-50"
          >
            {seeding ? "יוצר..." : "צור סיפורים לדוגמה"}
          </button>
        )}
      </div>

      {/* Stats Cards */}
      {data ? (
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              סה&quot;כ סיפורים
            </p>
            <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-white">
              {data.totalCount}
            </p>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-800 dark:bg-amber-900/20">
            <p className="text-xs font-medium text-amber-600 dark:text-amber-400">
              ממתינים לאישור
            </p>
            <p className="mt-1 text-2xl font-bold text-amber-700 dark:text-amber-300">
              {data.pendingCount}
            </p>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-800 dark:bg-emerald-900/20">
            <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
              מאושרים
            </p>
            <p className="mt-1 text-2xl font-bold text-emerald-700 dark:text-emerald-300">
              {data.approvedCount}
            </p>
          </div>
          <div className="rounded-xl border border-[#E85D75]/20 bg-[#E85D75]/5 p-5 dark:border-[#E85D75]/30 dark:bg-[#E85D75]/10">
            <p className="text-xs font-medium text-[#E85D75]">
              מוצגים בראשי
            </p>
            <p className="mt-1 text-2xl font-bold text-[#E85D75]">
              {data.featuredCount}
            </p>
          </div>
        </div>
      ) : (
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800"
            />
          ))}
        </div>
      )}

      {/* Stories List */}
      <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
            כל הסיפורים
          </h2>
        </div>

        {data === undefined ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800"
              />
            ))}
          </div>
        ) : data.stories.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-zinc-500 dark:text-zinc-400">
            אין סיפורים עדיין
          </div>
        ) : (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {data.stories.map((story) => {
              const isApproving = approvingId === story._id;
              const isFeaturing = featuringId === story._id;
              const isDeleting = deletingId === story._id;
              const isConfirmingDelete = confirmDeleteId === story._id;

              return (
                <div
                  key={story._id}
                  className={`px-5 py-4 transition-colors ${
                    isDeleting ? "opacity-50" : ""
                  } ${!story.approved ? "bg-amber-50/50 dark:bg-amber-900/5" : ""}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      {/* Badges */}
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        {!story.approved && (
                          <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                            ממתין לאישור
                          </span>
                        )}
                        {story.approved && (
                          <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                            מאושר
                          </span>
                        )}
                        {story.featured && (
                          <span className="inline-flex items-center rounded-full bg-[#E85D75]/10 px-2 py-0.5 text-xs font-medium text-[#E85D75]">
                            בראשי
                          </span>
                        )}
                        <span className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                          {CATEGORY_LABELS[story.category] ?? story.category}
                        </span>
                        {story.isAnonymous && (
                          <span className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                            אנונימי
                          </span>
                        )}
                      </div>

                      {/* Name + Rating */}
                      <div className="mb-1 flex items-center gap-3">
                        <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                          {story.name}
                        </p>
                        <StarDisplay rating={story.rating} />
                      </div>

                      {/* Story text */}
                      <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                        {story.story}
                      </p>

                      {/* Meta */}
                      <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">
                        {formatRelativeTime(story.createdAt)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      {/* Approve button (only for pending) */}
                      {!story.approved && (
                        <button
                          type="button"
                          onClick={() =>
                            handleApprove(
                              story._id as Id<"successStories">,
                              false
                            )
                          }
                          disabled={isApproving}
                          className="flex h-8 items-center rounded-lg bg-emerald-100 px-3 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-200 disabled:opacity-50 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50"
                        >
                          {isApproving ? "מאשר..." : "אשר"}
                        </button>
                      )}

                      {/* Toggle Featured (only for approved) */}
                      {story.approved && (
                        <button
                          type="button"
                          onClick={() =>
                            handleToggleFeatured(
                              story._id as Id<"successStories">
                            )
                          }
                          disabled={isFeaturing}
                          className={`flex h-8 items-center rounded-lg px-3 text-xs font-medium transition-colors disabled:opacity-50 ${
                            story.featured
                              ? "bg-[#E85D75]/10 text-[#E85D75] hover:bg-[#E85D75]/20"
                              : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                          }`}
                        >
                          {isFeaturing
                            ? "..."
                            : story.featured
                              ? "הסר מראשי"
                              : "הצג בראשי"}
                        </button>
                      )}

                      {/* Delete */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(
                              story._id as Id<"successStories">
                            )
                          }
                          disabled={isDeleting}
                          title={
                            isConfirmingDelete
                              ? "לחץ שוב לאישור מחיקה"
                              : "מחק"
                          }
                          aria-label={
                            isConfirmingDelete ? "אשר מחיקה" : "מחק סיפור"
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

                        {isConfirmingDelete && (
                          <button
                            type="button"
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
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
