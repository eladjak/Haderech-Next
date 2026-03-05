"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useUser, SignedIn } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { api } from "@/../convex/_generated/api";
import { type Id } from "@/../convex/_generated/dataModel";
import { timeAgoHe } from "./time-ago";

interface ReplyItemProps {
  reply: {
    _id: Id<"communityReplies">;
    content: string;
    authorName: string;
    authorImage?: string | null;
    likesCount: number;
    createdAt: number;
  };
  onDelete?: (replyId: Id<"communityReplies">) => Promise<void>;
  index?: number;
}

function AuthorAvatar({
  name,
  imageUrl,
}: {
  name: string;
  imageUrl?: string | null;
}) {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name}
        className="h-10 w-10 rounded-full object-cover ring-2 ring-brand-100 dark:ring-brand-900"
      />
    );
  }
  return (
    <div
      className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-sm font-bold text-white ring-2 ring-brand-100 dark:ring-brand-900"
      aria-hidden="true"
    >
      {name.charAt(0)}
    </div>
  );
}

export function ReplyItem({ reply, onDelete, index = 0 }: ReplyItemProps) {
  const { user } = useUser();

  const likedFromServer = useQuery(api.forum.getReplyLikeStatus, {
    replyId: reply._id,
  });
  const toggleLike = useMutation(api.forum.likeReply);

  const [optimisticLiked, setOptimisticLiked] = useState<boolean | null>(null);
  const [optimisticCount, setOptimisticCount] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const isLiked = optimisticLiked !== null ? optimisticLiked : (likedFromServer ?? false);
  const likeCount =
    optimisticCount !== null ? optimisticCount : reply.likesCount;

  async function handleLike() {
    const wasLiked = isLiked;
    setOptimisticLiked(!wasLiked);
    setOptimisticCount(likeCount + (wasLiked ? -1 : 1));
    try {
      await toggleLike({ replyId: reply._id });
    } catch {
      // Revert
      setOptimisticLiked(wasLiked);
      setOptimisticCount(likeCount);
    }
  }

  async function handleDelete() {
    if (!onDelete) return;
    if (!confirm("האם למחוק את התגובה?")) return;
    setDeleting(true);
    try {
      await onDelete(reply._id);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ delay: index * 0.05, duration: 0.2 }}
      className="flex gap-4"
    >
      {/* Avatar */}
      <div className="shrink-0">
        <AuthorAvatar name={reply.authorName} imageUrl={reply.authorImage} />
      </div>

      {/* Content */}
      <div className="flex-1">
        <div className="rounded-2xl rounded-tr-sm bg-zinc-50 p-4 dark:bg-zinc-800/60">
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
              {reply.authorName}
            </span>
            <span className="text-xs text-zinc-400">
              {timeAgoHe(reply.createdAt)}
            </span>
          </div>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
            {reply.content}
          </p>
        </div>

        {/* Actions */}
        <div className="mt-1.5 flex items-center gap-2 px-2">
          <SignedIn>
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 ${
                isLiked
                  ? "bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400"
                  : "text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              }`}
              aria-label={isLiked ? "הסר לייק" : "תן לייק"}
            >
              <svg
                className="h-3.5 w-3.5"
                viewBox="0 0 24 24"
                fill={isLiked ? "currentColor" : "none"}
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
              <span>{likeCount}</span>
            </button>
          </SignedIn>

          {/* Delete button - shown only to the reply author (backend enforces) */}
          {user && onDelete && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-full px-2 py-1 text-xs text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 disabled:opacity-50 dark:hover:bg-red-950/30 dark:hover:text-red-400"
              aria-label="מחק תגובה"
            >
              {deleting ? "מוחק..." : "מחק"}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
