"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/../convex/_generated/api";
import type { Id } from "@/../convex/_generated/dataModel";
import { StarRating } from "./star-rating";

interface CourseReviewsProps {
  courseId: Id<"courses">;
}

export function CourseReviews({ courseId }: CourseReviewsProps) {
  const { user: clerkUser } = useUser();

  const reviews = useQuery(api.reviews.getCourseReviews, { courseId });
  const courseRating = useQuery(api.reviews.getCourseRating, { courseId });
  const userReview = useQuery(api.reviews.getUserReview, { courseId });

  const createReview = useMutation(api.reviews.createReview);
  const voteHelpful = useMutation(api.reviews.voteHelpful);
  const deleteReview = useMutation(api.reviews.deleteReview);

  const [showForm, setShowForm] = useState(false);
  const [formRating, setFormRating] = useState(0);
  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Pre-fill form when editing existing review
  const handleOpenForm = useCallback(() => {
    if (userReview) {
      setFormRating(userReview.rating);
      setFormTitle(userReview.title);
      setFormContent(userReview.content);
    } else {
      setFormRating(0);
      setFormTitle("");
      setFormContent("");
    }
    setShowForm(true);
  }, [userReview]);

  const handleSubmit = useCallback(async () => {
    if (formRating === 0 || !formTitle.trim() || !formContent.trim() || submitting)
      return;

    setSubmitting(true);
    try {
      await createReview({
        courseId,
        rating: formRating,
        title: formTitle.trim(),
        content: formContent.trim(),
      });
      setShowForm(false);
      setFormRating(0);
      setFormTitle("");
      setFormContent("");
    } catch {
      // Error handled by Convex
    } finally {
      setSubmitting(false);
    }
  }, [formRating, formTitle, formContent, submitting, createReview, courseId]);

  const handleVote = useCallback(
    async (reviewId: Id<"courseReviews">) => {
      try {
        await voteHelpful({ reviewId });
      } catch {
        // Error handled by Convex
      }
    },
    [voteHelpful]
  );

  const handleDelete = useCallback(
    async (reviewId: Id<"courseReviews">) => {
      try {
        await deleteReview({ reviewId });
      } catch {
        // Error handled by Convex
      }
    },
    [deleteReview]
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
    if (days < 30) {
      const weeks = Math.floor(days / 7);
      return `לפני ${weeks} שבועות`;
    }
    return new Date(timestamp).toLocaleDateString("he-IL");
  };

  return (
    <section className="mt-10 border-t border-zinc-200 pt-8 dark:border-zinc-800">
      {/* Section Header with Average Rating */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
            ביקורות
            {courseRating && courseRating.count > 0 && (
              <span className="mr-2 text-base font-normal text-zinc-500 dark:text-zinc-400">
                ({courseRating.count})
              </span>
            )}
          </h2>

          {courseRating && courseRating.count > 0 && (
            <div className="mt-1 flex items-center gap-2">
              <StarRating rating={Math.round(courseRating.average)} size="sm" />
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {courseRating.average}
              </span>
              <span className="text-sm text-zinc-400">
                מתוך 5
              </span>
            </div>
          )}
        </div>

        {clerkUser && (
          <button
            type="button"
            onClick={handleOpenForm}
            className="inline-flex h-10 items-center rounded-full bg-zinc-900 px-5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
          >
            {userReview ? "ערוך ביקורת" : "כתוב ביקורת"}
          </button>
        )}
      </div>

      {/* Review Form */}
      {showForm && clerkUser && (
        <div className="mb-8 rounded-2xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-700 dark:bg-zinc-900">
          <h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">
            {userReview ? "עריכת ביקורת" : "כתיבת ביקורת"}
          </h3>

          {/* Star selector */}
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              דירוג
            </label>
            <StarRating
              rating={formRating}
              size="lg"
              interactive
              onChange={setFormRating}
            />
            {formRating === 0 && (
              <p className="mt-1 text-xs text-zinc-400">בחר דירוג</p>
            )}
          </div>

          {/* Title */}
          <div className="mb-4">
            <label
              htmlFor="review-title"
              className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              כותרת
            </label>
            <input
              id="review-title"
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="תנו כותרת לביקורת שלכם..."
              maxLength={200}
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder:text-zinc-500 dark:focus:border-zinc-600"
            />
          </div>

          {/* Content */}
          <div className="mb-4">
            <label
              htmlFor="review-content"
              className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              תוכן הביקורת
            </label>
            <textarea
              id="review-content"
              value={formContent}
              onChange={(e) => setFormContent(e.target.value)}
              placeholder="שתפו את החוויה שלכם מהקורס..."
              rows={4}
              maxLength={2000}
              className="w-full resize-none rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder:text-zinc-500 dark:focus:border-zinc-600"
            />
            <p className="mt-1 text-xs text-zinc-400">
              {formContent.length}/2000
            </p>
          </div>

          {/* Form actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={
                formRating === 0 ||
                !formTitle.trim() ||
                !formContent.trim() ||
                submitting
              }
              className="inline-flex h-10 items-center rounded-full bg-zinc-900 px-6 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
            >
              {submitting
                ? "שולח..."
                : userReview
                  ? "עדכן ביקורת"
                  : "שלח ביקורת"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="inline-flex h-10 items-center rounded-full px-6 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              ביטול
            </button>
          </div>
        </div>
      )}

      {/* Not logged in */}
      {!clerkUser && (
        <p className="mb-8 rounded-xl bg-zinc-50 p-4 text-center text-sm text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
          התחבר כדי לכתוב ביקורת
        </p>
      )}

      {/* Reviews List */}
      {reviews === undefined ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-xl bg-zinc-50 p-5 dark:bg-zinc-900"
            >
              <div className="mb-3 flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-zinc-200 dark:bg-zinc-700" />
                <div>
                  <div className="mb-1 h-4 w-24 rounded bg-zinc-200 dark:bg-zinc-700" />
                  <div className="h-3 w-16 rounded bg-zinc-200 dark:bg-zinc-700" />
                </div>
              </div>
              <div className="mb-2 h-4 w-48 rounded bg-zinc-200 dark:bg-zinc-700" />
              <div className="h-4 w-full rounded bg-zinc-200 dark:bg-zinc-700" />
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="rounded-xl bg-zinc-50 p-8 text-center dark:bg-zinc-900">
          <svg
            className="mx-auto mb-2 h-10 w-10 text-zinc-300 dark:text-zinc-600"
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
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            אין ביקורות עדיין. היו הראשונים לכתוב ביקורת!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard
              key={review._id}
              review={review}
              isOwn={userReview?._id === review._id}
              onVote={handleVote}
              onDelete={handleDelete}
              formatTime={formatTime}
            />
          ))}
        </div>
      )}
    </section>
  );
}

// ---

interface ReviewCardProps {
  review: {
    _id: Id<"courseReviews">;
    rating: number;
    title: string;
    content: string;
    helpful: number;
    createdAt: number;
    updatedAt: number;
    userName: string;
    userImage: string | null;
  };
  isOwn: boolean;
  onVote: (reviewId: Id<"courseReviews">) => void;
  onDelete: (reviewId: Id<"courseReviews">) => void;
  formatTime: (timestamp: number) => string;
}

function ReviewCard({
  review,
  isOwn,
  onVote,
  onDelete,
  formatTime,
}: ReviewCardProps) {
  return (
    <div className="rounded-xl border border-zinc-100 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/50">
      {/* Header: avatar, name, time */}
      <div className="mb-3 flex items-center gap-3">
        {review.userImage ? (
          <img
            src={review.userImage}
            alt=""
            className="h-9 w-9 rounded-full"
          />
        ) : (
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-200 text-sm font-medium text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
            {review.userName.charAt(0)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-zinc-900 dark:text-white">
              {review.userName}
            </span>
            <span className="text-xs text-zinc-400">
              {formatTime(review.createdAt)}
            </span>
            {review.updatedAt > review.createdAt + 1000 && (
              <span className="text-xs text-zinc-400">(נערך)</span>
            )}
          </div>
          <StarRating rating={review.rating} size="sm" />
        </div>
      </div>

      {/* Title + Content */}
      <h3 className="mb-1 text-sm font-bold text-zinc-900 dark:text-white">
        {review.title}
      </h3>
      <p className="mb-3 whitespace-pre-wrap text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
        {review.content}
      </p>

      {/* Actions */}
      <div className="flex items-center gap-4 text-xs">
        <button
          type="button"
          onClick={() => onVote(review._id)}
          className="flex items-center gap-1 text-zinc-400 transition-colors hover:text-[#D4A853]"
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
              d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75 2.25 2.25 0 012.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904m7.72 2.02V20.5a2.25 2.25 0 01-2.25 2.25h-.046a.75.75 0 01-.712-.513l-2.16-6.48"
            />
          </svg>
          <span>
            מועיל {review.helpful > 0 ? `(${review.helpful})` : ""}
          </span>
        </button>

        {isOwn && (
          <button
            type="button"
            onClick={() => onDelete(review._id)}
            className="text-zinc-400 transition-colors hover:text-red-600 dark:hover:text-red-400"
          >
            מחק
          </button>
        )}
      </div>
    </div>
  );
}
