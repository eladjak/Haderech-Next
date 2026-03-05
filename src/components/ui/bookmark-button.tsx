"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";

interface BookmarkButtonProps {
  itemType: string;
  itemId: string;
  itemTitle: string;
  size?: "sm" | "md";
}

export function BookmarkButton({
  itemType,
  itemId,
  itemTitle,
  size = "md",
}: BookmarkButtonProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  const isBookmarked = useQuery(api.bookmarks.isBookmarked, {
    itemType,
    itemId,
  });

  const toggleBookmark = useMutation(api.bookmarks.toggleBookmark);

  const handleToggle = async () => {
    setIsAnimating(true);
    try {
      await toggleBookmark({ itemType, itemId, itemTitle });
    } catch {
      // silently fail - UI will reflect actual state via query
    }
    setTimeout(() => setIsAnimating(false), 300);
  };

  const sizeClasses = size === "sm" ? "h-8 w-8" : "h-10 w-10";
  const iconSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`${sizeClasses} inline-flex items-center justify-center rounded-full transition-colors hover:bg-brand-50 dark:hover:bg-brand-50/10 ${
        isBookmarked
          ? "text-brand-500"
          : "text-zinc-400 hover:text-brand-400 dark:text-zinc-500 dark:hover:text-brand-400"
      }`}
      style={{
        transform: isAnimating ? "scale(1.25)" : "scale(1)",
        transition: "transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
      aria-label={isBookmarked ? "הסר מהמועדפים" : "הוסף למועדפים"}
      title={isBookmarked ? "הסר מהמועדפים" : "הוסף למועדפים"}
    >
      {isBookmarked ? (
        <svg
          className={iconSize}
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
        </svg>
      ) : (
        <svg
          className={iconSize}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
          />
        </svg>
      )}
    </button>
  );
}
