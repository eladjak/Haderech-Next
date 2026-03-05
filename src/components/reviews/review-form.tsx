"use client";

import { useState, useCallback } from "react";
import { StarRating } from "./star-rating";

interface ReviewFormProps {
  initialRating?: number;
  initialTitle?: string;
  initialContent?: string;
  initialWouldRecommend?: boolean;
  isEditing?: boolean;
  submitting?: boolean;
  onSubmit: (data: {
    rating: number;
    title: string;
    content: string;
    wouldRecommend: boolean;
  }) => Promise<void>;
  onCancel: () => void;
}

export function ReviewForm({
  initialRating = 0,
  initialTitle = "",
  initialContent = "",
  initialWouldRecommend = true,
  isEditing = false,
  submitting = false,
  onSubmit,
  onCancel,
}: ReviewFormProps) {
  const [rating, setRating] = useState(initialRating);
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [wouldRecommend, setWouldRecommend] = useState(initialWouldRecommend);

  const isValid = rating > 0 && title.trim().length > 0 && content.trim().length > 0;

  const handleSubmit = useCallback(async () => {
    if (!isValid || submitting) return;
    await onSubmit({ rating, title: title.trim(), content: content.trim(), wouldRecommend });
  }, [isValid, submitting, onSubmit, rating, title, content, wouldRecommend]);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-700 dark:bg-zinc-900">
      <h3 className="mb-5 text-lg font-bold text-zinc-900 dark:text-white">
        {isEditing ? "עריכת ביקורת" : "כתיבת ביקורת"}
      </h3>

      {/* Star Rating */}
      <div className="mb-5">
        <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          דירוג כללי
        </label>
        <StarRating
          rating={rating}
          size="lg"
          interactive
          onChange={setRating}
        />
        {rating === 0 && (
          <p className="mt-1.5 text-xs text-zinc-400 dark:text-zinc-500">
            לחץ על כוכב כדי לדרג
          </p>
        )}
        {rating > 0 && (
          <p className="mt-1.5 text-xs text-[#D4A853]">
            {rating === 1 && "לא טוב"}
            {rating === 2 && "בסדר"}
            {rating === 3 && "טוב"}
            {rating === 4 && "מצוין"}
            {rating === 5 && "יוצא מן הכלל!"}
          </p>
        )}
      </div>

      {/* Title */}
      <div className="mb-4">
        <label
          htmlFor="review-title"
          className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          כותרת הביקורת
        </label>
        <input
          id="review-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="תן כותרת קצרה לביקורת שלך..."
          maxLength={200}
          className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-400/30 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder:text-zinc-500 dark:focus:border-zinc-600"
        />
      </div>

      {/* Content */}
      <div className="mb-4">
        <label
          htmlFor="review-content"
          className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          תוכן הביקורת
        </label>
        <textarea
          id="review-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="שתף את החוויה שלך מהקורס - מה למדת? מה עזר לך? מה אתה ממליץ לאחרים לדעת?"
          rows={5}
          maxLength={2000}
          className="w-full resize-none rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-400/30 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder:text-zinc-500 dark:focus:border-zinc-600"
        />
        <p className="mt-1 text-right text-xs text-zinc-400 dark:text-zinc-500">
          {content.length}/2000
        </p>
      </div>

      {/* Would Recommend Toggle */}
      <div className="mb-6">
        <button
          type="button"
          onClick={() => setWouldRecommend((v) => !v)}
          className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${
            wouldRecommend
              ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300"
              : "border-zinc-200 bg-white text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
          }`}
        >
          <span
            className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors ${
              wouldRecommend
                ? "border-emerald-500 bg-emerald-500"
                : "border-zinc-300 dark:border-zinc-600"
            }`}
          >
            {wouldRecommend && (
              <svg
                className="h-3 w-3 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 12.75l6 6 9-13.5"
                />
              </svg>
            )}
          </span>
          <span className="text-sm font-medium">
            {wouldRecommend ? "אני ממליץ על הקורס הזה" : "אינני ממליץ על הקורס הזה"}
          </span>
        </button>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!isValid || submitting}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-gradient-to-l from-brand-500 to-brand-600 px-7 text-sm font-semibold text-white shadow-md shadow-brand-500/20 transition-all hover:shadow-lg hover:shadow-brand-500/30 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? (
            <>
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
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              שולח...
            </>
          ) : isEditing ? (
            "עדכן ביקורת"
          ) : (
            "פרסם ביקורת"
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="inline-flex h-11 items-center justify-center rounded-full px-6 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 disabled:opacity-50 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          ביטול
        </button>
      </div>
    </div>
  );
}
