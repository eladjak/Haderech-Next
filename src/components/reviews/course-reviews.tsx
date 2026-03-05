"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/../convex/_generated/api";
import type { Id } from "@/../convex/_generated/dataModel";
import { StarRating } from "./star-rating";
import { ReviewCard } from "./review-card";
import { ReviewForm } from "./review-form";
import { RatingDistribution } from "./rating-distribution";

interface CourseReviewsProps {
  courseId: Id<"courses">;
}

type SortOption = "newest" | "highest" | "lowest";

const SORT_LABELS: Record<SortOption, string> = {
  newest: "חדש ביותר",
  highest: "דירוג גבוה",
  lowest: "דירוג נמוך",
};

export function CourseReviews({ courseId }: CourseReviewsProps) {
  const { user: clerkUser } = useUser();

  const [sort, setSort] = useState<SortOption>("newest");
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const reviews = useQuery(api.reviews.getReviewsByCourse, { courseId, sort });
  const reviewStats = useQuery(api.reviews.getReviewStats, { courseId });
  const userReview = useQuery(api.reviews.getUserReview, { courseId });

  const createReview = useMutation(api.reviews.submitReview);
  const voteHelpful = useMutation(api.reviews.markReviewHelpful);
  const deleteReview = useMutation(api.reviews.deleteReview);

  const handleOpenForm = useCallback(() => {
    setShowForm(true);
  }, []);

  const handleSubmit = useCallback(
    async (data: {
      rating: number;
      title: string;
      content: string;
      wouldRecommend: boolean;
    }) => {
      setSubmitting(true);
      try {
        await createReview({
          courseId,
          rating: data.rating,
          title: data.title,
          content: data.content,
          wouldRecommend: data.wouldRecommend,
        });
        setShowForm(false);
      } catch {
        // Error handled by Convex
      } finally {
        setSubmitting(false);
      }
    },
    [createReview, courseId]
  );

  const handleVote = useCallback(
    async (reviewId: Id<"courseReviews">) => {
      try {
        await voteHelpful({ reviewId });
      } catch {
        // noop
      }
    },
    [voteHelpful]
  );

  const handleDelete = useCallback(
    async (reviewId: Id<"courseReviews">) => {
      try {
        await deleteReview({ reviewId });
      } catch {
        // noop
      }
    },
    [deleteReview]
  );

  return (
    <section className="mt-10 border-t border-zinc-200 pt-10 dark:border-zinc-800">
      {/* ── Section header ── */}
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
            ביקורות
            {reviewStats && reviewStats.total > 0 && (
              <span className="mr-2 text-lg font-normal text-zinc-400">
                ({reviewStats.total})
              </span>
            )}
          </h2>

          {reviewStats && reviewStats.total > 0 && (
            <div className="mt-2 flex items-center gap-2">
              <StarRating rating={Math.round(reviewStats.average)} size="md" />
              <span className="text-lg font-bold text-zinc-900 dark:text-white">
                {reviewStats.average}
              </span>
              <span className="text-sm text-zinc-500 dark:text-zinc-400">
                מתוך 5
              </span>
              {reviewStats.wouldRecommendPercent > 0 && (
                <span className="mr-2 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                  {reviewStats.wouldRecommendPercent}% ממליצים
                </span>
              )}
            </div>
          )}
        </div>

        {clerkUser && !userReview && !showForm && (
          <button
            type="button"
            onClick={handleOpenForm}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-zinc-900 px-5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
          >
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
                d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125"
              />
            </svg>
            כתוב ביקורת
          </button>
        )}

        {clerkUser && userReview && !showForm && (
          <button
            type="button"
            onClick={handleOpenForm}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-zinc-200 px-5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            ערוך ביקורת
          </button>
        )}
      </div>

      {/* ── Rating Distribution (if reviews exist) ── */}
      {reviewStats && reviewStats.total > 0 && (
        <div className="mb-8 rounded-2xl border border-zinc-100 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/50">
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Summary */}
            <div className="flex flex-col items-center justify-center">
              <div className="text-6xl font-extrabold text-zinc-900 dark:text-white">
                {reviewStats.average}
              </div>
              <StarRating rating={Math.round(reviewStats.average)} size="lg" />
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                מבוסס על {reviewStats.total} ביקורות
              </p>
            </div>

            {/* Distribution bars */}
            <RatingDistribution
              distribution={reviewStats.distribution}
              total={reviewStats.total}
              average={reviewStats.average}
            />
          </div>
        </div>
      )}

      {/* ── Review Form ── */}
      {showForm && clerkUser && (
        <div className="mb-8">
          <ReviewForm
            initialRating={userReview?.rating ?? 0}
            initialTitle={userReview?.title ?? ""}
            initialContent={userReview?.content ?? ""}
            initialWouldRecommend={userReview?.wouldRecommend ?? true}
            isEditing={!!userReview}
            submitting={submitting}
            onSubmit={handleSubmit}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {/* ── Not logged in prompt ── */}
      {!clerkUser && (
        <div className="mb-8 rounded-xl border border-zinc-100 bg-zinc-50 p-5 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            <a href="/sign-in" className="text-brand-600 underline dark:text-brand-400">
              התחבר
            </a>{" "}
            כדי לכתוב ביקורת
          </p>
        </div>
      )}

      {/* ── Sort Controls ── */}
      {reviews && reviews.length > 1 && (
        <div className="mb-4 flex items-center gap-3">
          <span className="text-sm text-zinc-500 dark:text-zinc-400">מיין לפי:</span>
          <div className="flex gap-2">
            {(["newest", "highest", "lowest"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setSort(option)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  sort === option
                    ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                }`}
              >
                {SORT_LABELS[option]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Reviews List ── */}
      {reviews === undefined ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-xl bg-zinc-50 p-5 dark:bg-zinc-900"
            >
              <div className="mb-3 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-zinc-200 dark:bg-zinc-700" />
                <div>
                  <div className="mb-1.5 h-4 w-28 rounded bg-zinc-200 dark:bg-zinc-700" />
                  <div className="h-3 w-20 rounded bg-zinc-200 dark:bg-zinc-700" />
                </div>
              </div>
              <div className="mb-2 h-4 w-52 rounded bg-zinc-200 dark:bg-zinc-700" />
              <div className="space-y-1.5">
                <div className="h-3 w-full rounded bg-zinc-200 dark:bg-zinc-700" />
                <div className="h-3 w-5/6 rounded bg-zinc-200 dark:bg-zinc-700" />
              </div>
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-200 p-10 text-center dark:border-zinc-700">
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
              d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
            />
          </svg>
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            אין ביקורות עדיין
          </p>
          <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
            היו הראשונים לשתף את החוויה שלכם!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard
              key={review._id}
              review={{
                ...review,
                userImage: review.userImage ?? null,
              }}
              isOwn={userReview?._id === review._id}
              onVote={handleVote}
              onDelete={handleDelete}
              onEdit={userReview?._id === review._id ? handleOpenForm : undefined}
            />
          ))}
        </div>
      )}
    </section>
  );
}
