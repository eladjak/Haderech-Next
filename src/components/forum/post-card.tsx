"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { timeAgoHe } from "./time-ago";
import {
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  type ForumCategory,
} from "./category-pills";

interface PostCardProps {
  post: {
    _id: string;
    title: string;
    content: string;
    category: ForumCategory;
    authorName: string;
    authorImage?: string | null;
    likesCount: number;
    repliesCount: number;
    createdAt: number;
    pinned?: boolean;
  };
  /** Base path for post links (default: /community/forum) */
  basePath?: string;
  index?: number;
}

function AuthorAvatar({
  name,
  imageUrl,
  size = "sm",
}: {
  name: string;
  imageUrl?: string | null;
  size?: "sm" | "md";
}) {
  const sizeClasses = size === "md" ? "h-10 w-10 text-sm" : "h-6 w-6 text-xs";
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name}
        className={`${sizeClasses} rounded-full object-cover`}
      />
    );
  }
  return (
    <div
      className={`${sizeClasses} flex items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 font-bold text-white`}
      aria-hidden="true"
    >
      {name.charAt(0)}
    </div>
  );
}

export function PostCard({
  post,
  basePath = "/community/forum",
  index = 0,
}: PostCardProps) {
  const categoryColor =
    CATEGORY_COLORS[post.category] ??
    "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300";

  const preview =
    post.content.length > 150
      ? `${post.content.slice(0, 150).trimEnd()}...`
      : post.content;

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.25 }}
      className="group relative rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm transition-all hover:border-brand-200 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-brand-800"
    >
      {/* Pinned badge */}
      {post.pinned && (
        <div className="mb-2 flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
          <svg
            className="h-3.5 w-3.5"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z" />
          </svg>
          נושא מוצמד
        </div>
      )}

      {/* Title row */}
      <div className="mb-3 flex items-start justify-between gap-3">
        <Link
          href={`${basePath}/${post._id}`}
          className="flex-1 text-base font-semibold text-zinc-900 transition-colors hover:text-brand-600 focus:outline-none focus-visible:underline dark:text-white dark:hover:text-brand-400"
        >
          {post.title}
        </Link>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${categoryColor}`}
        >
          {CATEGORY_LABELS[post.category] ?? post.category}
        </span>
      </div>

      {/* Preview */}
      <p className="mb-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        {preview}
      </p>

      {/* Footer: author + stats */}
      <div className="flex items-center justify-between text-xs text-zinc-400 dark:text-zinc-500">
        <div className="flex items-center gap-2">
          <AuthorAvatar name={post.authorName} imageUrl={post.authorImage} />
          <span className="font-medium text-zinc-500 dark:text-zinc-400">
            {post.authorName}
          </span>
          <span aria-hidden="true">·</span>
          <span>{timeAgoHe(post.createdAt)}</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Likes */}
          <span className="flex items-center gap-1" title="לייקים">
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <span>{post.likesCount}</span>
          </span>

          {/* Replies */}
          <span className="flex items-center gap-1" title="תגובות">
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <span>{post.repliesCount}</span>
          </span>
        </div>
      </div>
    </motion.article>
  );
}
