"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { useUser, SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { api } from "@/../convex/_generated/api";
import { type Id } from "@/../convex/_generated/dataModel";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ReplyItem } from "@/components/forum/reply-item";
import { TimeAgo } from "@/components/forum/time-ago";
import {
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  type ForumCategory,
} from "@/components/forum/category-pills";

// ─── Author Avatar ────────────────────────────────────────────────────────────

function AuthorAvatar({
  name,
  imageUrl,
  size = "md",
}: {
  name: string;
  imageUrl?: string | null;
  size?: "sm" | "md" | "lg";
}) {
  const sizeMap = {
    sm: "h-8 w-8 text-xs",
    md: "h-11 w-11 text-sm",
    lg: "h-14 w-14 text-base",
  };
  const cls = sizeMap[size];

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name}
        className={`${cls} rounded-full object-cover ring-2 ring-brand-100 dark:ring-brand-900`}
      />
    );
  }
  return (
    <div
      className={`${cls} flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 font-bold text-white ring-2 ring-brand-100 dark:ring-brand-900`}
      aria-hidden="true"
    >
      {name.charAt(0)}
    </div>
  );
}

// ─── Like Button ──────────────────────────────────────────────────────────────

function LikeButton({
  count,
  liked,
  onToggle,
  size = "sm",
}: {
  count: number;
  liked: boolean;
  onToggle: () => void;
  size?: "sm" | "md";
}) {
  const iconSize = size === "md" ? "h-5 w-5" : "h-4 w-4";
  return (
    <button
      onClick={onToggle}
      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 ${
        liked
          ? "bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400"
          : "text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
      }`}
      aria-label={liked ? "הסר לייק" : "תן לייק"}
      aria-pressed={liked}
    >
      <svg
        className={iconSize}
        viewBox="0 0 24 24"
        fill={liked ? "currentColor" : "none"}
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
      <span>{count}</span>
    </button>
  );
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div className="min-h-dvh bg-zinc-50 dark:bg-zinc-950" dir="rtl">
      <Header />
      <main className="container mx-auto px-4 py-10">
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="h-6 w-32 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-700" />
          <div className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-4 h-8 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-700" />
            <div className="mb-6 flex items-center gap-3">
              <div className="h-11 w-11 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-700" />
              <div className="space-y-2">
                <div className="h-4 w-24 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
                <div className="h-3 w-16 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
              </div>
            </div>
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-4 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800"
                  style={{ width: `${85 + (i % 2) * 10}%` }}
                />
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const postId = params.postId as Id<"communityTopics">;

  // Queries
  const post = useQuery(api.forum.getPost, { postId });
  const replies = useQuery(api.forum.listReplies, { postId });
  const likedFromServer = useQuery(api.forum.getPostLikeStatus, { postId });

  // Mutations
  const likePost = useMutation(api.forum.likePost);
  const createReply = useMutation(api.forum.createReply);

  // Use community.deleteReply for the delete action (same table)
  const deleteReply = useMutation(api.community.deleteReply);

  // Local optimistic like state
  const [optimisticLiked, setOptimisticLiked] = useState<boolean | null>(null);
  const [optimisticLikeCount, setOptimisticLikeCount] = useState<
    number | null
  >(null);

  // Reply form state
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [replyError, setReplyError] = useState("");

  const isLiked =
    optimisticLiked !== null ? optimisticLiked : (likedFromServer ?? false);
  const likeCount =
    optimisticLikeCount !== null
      ? optimisticLikeCount
      : (post?.likesCount ?? 0);

  async function handleToggleLike() {
    if (!user) return;
    const wasLiked = isLiked;
    setOptimisticLiked(!wasLiked);
    setOptimisticLikeCount(likeCount + (wasLiked ? -1 : 1));
    try {
      await likePost({ postId });
    } catch {
      setOptimisticLiked(wasLiked);
      setOptimisticLikeCount(likeCount);
    }
  }

  async function handleSubmitReply(e: React.FormEvent) {
    e.preventDefault();
    setReplyError("");
    setSubmitting(true);
    try {
      await createReply({ postId, content: replyContent });
      setReplyContent("");
    } catch (err: unknown) {
      setReplyError(err instanceof Error ? err.message : "אירעה שגיאה");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteReply(replyId: Id<"communityReplies">) {
    await deleteReply({ replyId });
  }

  // Loading
  if (post === undefined || replies === undefined) {
    return <PageSkeleton />;
  }

  // Not found
  if (post === null) {
    return (
      <div className="min-h-dvh bg-zinc-50 dark:bg-zinc-950" dir="rtl">
        <Header />
        <main className="container mx-auto flex flex-col items-center justify-center px-4 py-20 text-center">
          <div className="mb-4 text-5xl" aria-hidden="true">
            😕
          </div>
          <h1 className="mb-2 text-2xl font-bold text-zinc-900 dark:text-white">
            פוסט לא נמצא
          </h1>
          <p className="mb-6 text-zinc-500 dark:text-zinc-400">
            הפוסט שחיפשת לא קיים או נמחק
          </p>
          <Link
            href="/community/forum"
            className="rounded-xl bg-gradient-to-l from-brand-500 to-brand-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm hover:brightness-110"
          >
            חזור לפורום
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const categoryColor =
    CATEGORY_COLORS[post.category as ForumCategory] ??
    "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300";

  return (
    <div className="min-h-dvh bg-zinc-50 dark:bg-zinc-950" dir="rtl">
      <Header />

      <main className="container mx-auto px-4 py-10">
        <div className="mx-auto max-w-3xl">
          {/* Back link */}
          <Link
            href="/community/forum"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition-colors hover:text-brand-600 focus:outline-none focus-visible:underline dark:text-zinc-400 dark:hover:text-brand-400"
          >
            <svg
              className="h-4 w-4 rotate-180"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            חזור לפורום
          </Link>

          {/* Main Post */}
          <motion.article
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
          >
            {/* Category + pinned */}
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${categoryColor}`}
              >
                {CATEGORY_LABELS[post.category as ForumCategory] ??
                  post.category}
              </span>
              {post.pinned && (
                <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
                  <svg
                    className="h-3 w-3"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z" />
                  </svg>
                  מוצמד
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="mb-5 text-2xl font-bold leading-snug text-zinc-900 dark:text-white">
              {post.title}
            </h1>

            {/* Author */}
            <div className="mb-6 flex items-center gap-3">
              <AuthorAvatar name={post.authorName} imageUrl={post.authorImage} />
              <div>
                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                  {post.authorName}
                </p>
                <TimeAgo
                  timestamp={post.createdAt}
                  className="text-xs text-zinc-500"
                />
              </div>
            </div>

            {/* Content */}
            <div className="mb-6 whitespace-pre-wrap leading-relaxed text-zinc-700 dark:text-zinc-300">
              {post.content}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between border-t border-zinc-100 pt-4 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <SignedIn>
                  <LikeButton
                    count={likeCount}
                    liked={isLiked}
                    onToggle={handleToggleLike}
                    size="md"
                  />
                </SignedIn>
                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800">
                      <svg
                        className="h-5 w-5"
                        viewBox="0 0 24 24"
                        fill="none"
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
                      {likeCount}
                    </button>
                  </SignInButton>
                </SignedOut>

                <span className="flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400">
                  <svg
                    className="h-5 w-5"
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
                  {replies.length} תגובות
                </span>
              </div>
            </div>
          </motion.article>

          {/* Replies Section */}
          <section aria-label="תגובות">
            <h2 className="mb-5 text-lg font-bold text-zinc-900 dark:text-white">
              תגובות ({replies.length})
            </h2>

            {replies.length > 0 ? (
              <div className="mb-8 space-y-5">
                <AnimatePresence mode="popLayout">
                  {replies.map((reply, i) => (
                    <ReplyItem
                      key={reply._id}
                      reply={reply}
                      onDelete={user ? handleDeleteReply : undefined}
                      index={i}
                    />
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="mb-8 rounded-2xl border border-dashed border-zinc-200 p-8 text-center dark:border-zinc-700">
                <p className="text-zinc-500 dark:text-zinc-400">
                  אין תגובות עדיין. היה הראשון להגיב!
                </p>
              </div>
            )}

            {/* Reply Form */}
            <SignedIn>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
              >
                <h3 className="mb-4 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  הוסף תגובה
                </h3>
                <form onSubmit={handleSubmitReply} className="space-y-4">
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="שתף את המחשבות שלך..."
                    maxLength={2000}
                    required
                    rows={4}
                    aria-label="תוכן התגובה"
                    className="w-full resize-none rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder-zinc-500 dark:focus:border-brand-600 dark:focus:bg-zinc-900"
                  />
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-zinc-500">
                      {replyContent.length}/2000
                    </p>
                    {replyError && (
                      <p role="alert" className="text-xs text-red-500">
                        {replyError}
                      </p>
                    )}
                    <button
                      type="submit"
                      disabled={submitting || !replyContent.trim()}
                      className="rounded-xl bg-gradient-to-l from-brand-500 to-brand-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:brightness-110 disabled:opacity-50"
                    >
                      {submitting ? "שולח..." : "פרסם תגובה"}
                    </button>
                  </div>
                </form>
              </motion.div>
            </SignedIn>

            <SignedOut>
              <div className="rounded-2xl border border-zinc-100 bg-white p-6 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <p className="mb-4 text-zinc-600 dark:text-zinc-400">
                  יש להתחבר כדי להגיב
                </p>
                <SignInButton mode="modal">
                  <button className="rounded-xl bg-gradient-to-l from-brand-500 to-brand-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm hover:brightness-110">
                    התחברות
                  </button>
                </SignInButton>
              </div>
            </SignedOut>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
