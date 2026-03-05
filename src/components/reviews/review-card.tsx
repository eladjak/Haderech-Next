"use client";

import { StarRating } from "./star-rating";
import type { Id } from "@/../convex/_generated/dataModel";

export interface ReviewCardData {
  _id: Id<"courseReviews">;
  rating: number;
  title: string;
  content: string;
  helpful: number;
  wouldRecommend?: boolean;
  createdAt: number;
  updatedAt: number;
  userName: string;
  userImage: string | null;
  courseTitle?: string;
}

interface ReviewCardProps {
  review: ReviewCardData;
  isOwn?: boolean;
  hasVotedHelpful?: boolean;
  onVote?: (reviewId: Id<"courseReviews">) => void;
  onDelete?: (reviewId: Id<"courseReviews">) => void;
  onEdit?: () => void;
  showCourse?: boolean;
}

function formatTime(timestamp: number): string {
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
}

export function ReviewCard({
  review,
  isOwn = false,
  hasVotedHelpful = false,
  onVote,
  onDelete,
  onEdit,
  showCourse = false,
}: ReviewCardProps) {
  const initials = review.userName
    .split(" ")
    .map((n) => n.charAt(0))
    .join("")
    .slice(0, 2);

  return (
    <div className="rounded-xl border border-zinc-100 bg-white p-5 transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/50">
      {/* Header */}
      <div className="mb-3 flex items-start gap-3">
        {/* Avatar */}
        {review.userImage ? (
          <img
            src={review.userImage}
            alt=""
            className="h-10 w-10 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-sm font-bold text-white">
            {initials}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="text-sm font-semibold text-zinc-900 dark:text-white">
              {review.userName}
            </span>
            <span className="text-xs text-zinc-400 dark:text-zinc-500">
              {formatTime(review.createdAt)}
            </span>
            {review.updatedAt > review.createdAt + 1000 && (
              <span className="text-xs text-zinc-400">(נערך)</span>
            )}
          </div>
          <StarRating rating={review.rating} size="sm" />
        </div>

        {/* Badges */}
        <div className="flex shrink-0 flex-col items-end gap-1">
          {review.wouldRecommend === true && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
              <svg
                className="h-3 w-3"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                  clipRule="evenodd"
                />
              </svg>
              ממליץ
            </span>
          )}
          {showCourse && review.courseTitle && (
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
              {review.courseTitle}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <h3 className="mb-1 text-sm font-bold text-zinc-900 dark:text-white">
        {review.title}
      </h3>
      <p className="mb-4 whitespace-pre-wrap text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
        {review.content}
      </p>

      {/* Actions */}
      <div className="flex items-center gap-4 text-xs">
        {onVote && (
          <button
            type="button"
            onClick={() => onVote(review._id)}
            className={`flex items-center gap-1.5 transition-colors ${
              hasVotedHelpful
                ? "text-[#D4A853]"
                : "text-zinc-400 hover:text-[#D4A853] dark:text-zinc-500"
            }`}
          >
            <svg
              className="h-4 w-4"
              fill={hasVotedHelpful ? "currentColor" : "none"}
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
            <span>מועיל{review.helpful > 0 ? ` (${review.helpful})` : ""}</span>
          </button>
        )}

        {isOwn && (
          <>
            {onEdit && (
              <button
                type="button"
                onClick={onEdit}
                className="text-zinc-400 transition-colors hover:text-blue-600 dark:text-zinc-500 dark:hover:text-blue-400"
              >
                ערוך
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(review._id)}
                className="text-zinc-400 transition-colors hover:text-red-600 dark:text-zinc-500 dark:hover:text-red-400"
              >
                מחק
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
