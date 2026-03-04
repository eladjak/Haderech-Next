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

const CATEGORY_LABELS: Record<string, string> = {
  general: "כללי",
  "dating-tips": "טיפים",
  "success-stories": "סיפורי הצלחה",
  questions: "שאלות",
  advice: "עצות",
};

const CATEGORY_COLORS: Record<string, string> = {
  general: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
  "dating-tips":
    "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
  "success-stories":
    "bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300",
  questions:
    "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  advice:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
};

function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "לפני רגע";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `לפני ${minutes} דקות`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `לפני ${hours} שעות`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `לפני ${days} ימים`;
  const months = Math.floor(days / 30);
  return `לפני ${months} חודשים`;
}

function AuthorAvatar({ name, imageUrl }: { name: string; imageUrl?: string | null }) {
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
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-sm font-bold text-white ring-2 ring-brand-100 dark:ring-brand-900">
      {name.charAt(0)}
    </div>
  );
}

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
  return (
    <button
      onClick={onToggle}
      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all ${
        liked
          ? "bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400"
          : "text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
      }`}
      aria-label={liked ? "הסר לייק" : "תן לייק"}
    >
      <svg
        className={`${size === "md" ? "h-5 w-5" : "h-4 w-4"} ${liked ? "fill-brand-500" : ""}`}
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

function ReplyItem({
  reply,
  currentUserId,
  onDelete,
}: {
  reply: any;
  currentUserId?: string;
  onDelete: (id: Id<"communityReplies">) => void;
}) {
  const liked = useQuery(api.community.getReplyLikeStatus, {
    replyId: reply._id,
  });
  const toggleLike = useMutation(api.community.toggleLikeReply);
  const [likeCount, setLikeCount] = useState(reply.likesCount);
  const [isLiked, setIsLiked] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Sync with server like state
  const serverLiked = liked ?? false;

  async function handleToggleLike() {
    const wasLiked = isLiked !== undefined ? isLiked : serverLiked;
    setIsLiked(!wasLiked);
    setLikeCount((prev: number) => prev + (wasLiked ? -1 : 1));
    try {
      await toggleLike({ replyId: reply._id });
    } catch {
      // Revert on error
      setIsLiked(wasLiked);
      setLikeCount((prev: number) => prev + (wasLiked ? 1 : -1));
    }
  }

  async function handleDelete() {
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
      className="flex gap-4"
    >
      <div className="shrink-0">
        <AuthorAvatar name={reply.authorName} imageUrl={reply.authorImage} />
      </div>
      <div className="flex-1">
        <div className="rounded-2xl rounded-tr-sm bg-zinc-50 p-4 dark:bg-zinc-800/60">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
              {reply.authorName}
            </span>
            <span className="text-xs text-zinc-500">{timeAgo(reply.createdAt)}</span>
          </div>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
            {reply.content}
          </p>
        </div>
        <div className="mt-1.5 flex items-center gap-2 px-2">
          <SignedIn>
            <LikeButton
              count={likeCount}
              liked={isLiked !== undefined ? isLiked : serverLiked}
              onToggle={handleToggleLike}
            />
          </SignedIn>
          {currentUserId && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-full px-2 py-1 text-xs text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30 dark:hover:text-red-400"
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

export default function TopicDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const topicId = params.topicId as Id<"communityTopics">;

  const topic = useQuery(api.community.getTopic, { topicId });
  const topicLiked = useQuery(api.community.getTopicLikeStatus, { topicId });

  const toggleTopicLike = useMutation(api.community.toggleLikeTopic);
  const createReply = useMutation(api.community.createReply);
  const deleteTopic = useMutation(api.community.deleteTopic);
  const deleteReply = useMutation(api.community.deleteReply);

  const [replyContent, setReplyContent] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);
  const [replyError, setReplyError] = useState("");
  const [localLikeCount, setLocalLikeCount] = useState<number | null>(null);
  const [localLiked, setLocalLiked] = useState<boolean | null>(null);

  async function handleToggleLike() {
    if (!user) return;
    const wasLiked = localLiked !== null ? localLiked : (topicLiked ?? false);
    const count = localLikeCount !== null ? localLikeCount : (topic?.likesCount ?? 0);
    setLocalLiked(!wasLiked);
    setLocalLikeCount(count + (wasLiked ? -1 : 1));
    try {
      await toggleTopicLike({ topicId });
    } catch {
      setLocalLiked(wasLiked);
      setLocalLikeCount(count);
    }
  }

  async function handleSubmitReply(e: React.FormEvent) {
    e.preventDefault();
    setReplyError("");
    setSubmittingReply(true);
    try {
      await createReply({ topicId, content: replyContent });
      setReplyContent("");
    } catch (err: unknown) {
      setReplyError(err instanceof Error ? err.message : "אירעה שגיאה");
    } finally {
      setSubmittingReply(false);
    }
  }

  async function handleDeleteTopic() {
    if (!confirm("האם למחוק את הנושא? פעולה זו אינה ניתנת לביטול.")) return;
    try {
      await deleteTopic({ topicId });
      router.push("/community");
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "שגיאה במחיקה");
    }
  }

  async function handleDeleteReply(replyId: Id<"communityReplies">) {
    await deleteReply({ replyId });
  }

  // Loading state
  if (topic === undefined) {
    return (
      <div className="min-h-dvh bg-zinc-50 dark:bg-zinc-950" dir="rtl">
        <Header />
        <main className="container mx-auto px-4 py-10">
          <div className="mx-auto max-w-3xl space-y-4">
            <div className="h-10 w-40 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-64 animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Not found
  if (topic === null) {
    return (
      <div className="min-h-dvh bg-zinc-50 dark:bg-zinc-950" dir="rtl">
        <Header />
        <main className="container mx-auto flex flex-col items-center justify-center px-4 py-20 text-center">
          <div className="mb-4 text-5xl">😕</div>
          <h1 className="mb-2 text-2xl font-bold text-zinc-900 dark:text-white">
            נושא לא נמצא
          </h1>
          <p className="mb-6 text-zinc-500 dark:text-zinc-400">
            הנושא שחיפשת לא קיים או נמחק
          </p>
          <Link
            href="/community"
            className="rounded-xl bg-gradient-to-l from-brand-500 to-brand-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm hover:brightness-110"
          >
            חזור לקהילה
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const displayLiked = localLiked !== null ? localLiked : (topicLiked ?? false);
  const displayLikeCount = localLikeCount !== null ? localLikeCount : topic.likesCount;
  const categoryColor =
    CATEGORY_COLORS[topic.category] ||
    "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300";

  // Check if current user is the author (compare Clerk user IDs via the users table)
  // topic.userId is a Convex user ID - we check ownership in backend, show delete for UI feedback
  const isAdmin = false; // determined by backend

  return (
    <div className="min-h-dvh bg-zinc-50 dark:bg-zinc-950" dir="rtl">
      <Header />

      <main className="container mx-auto px-4 py-10">
        <div className="mx-auto max-w-3xl">
          {/* Back link */}
          <Link
            href="/community"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition-colors hover:text-brand-600 dark:text-zinc-400 dark:hover:text-brand-400"
          >
            <svg
              className="h-4 w-4 rotate-180"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            חזור לקהילה
          </Link>

          {/* Main Topic Card */}
          <motion.article
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
          >
            {/* Category + Pinned */}
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${categoryColor}`}>
                {CATEGORY_LABELS[topic.category] ?? topic.category}
              </span>
              {topic.pinned && (
                <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
                  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z" />
                  </svg>
                  מוצמד
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="mb-5 text-2xl font-bold text-zinc-900 dark:text-white">
              {topic.title}
            </h1>

            {/* Author info */}
            <div className="mb-6 flex items-center gap-3">
              <AuthorAvatar name={topic.authorName} imageUrl={topic.authorImage} />
              <div>
                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                  {topic.authorName}
                </p>
                <p className="text-xs text-zinc-500">{timeAgo(topic.createdAt)}</p>
              </div>
            </div>

            {/* Content */}
            <div className="mb-6 whitespace-pre-wrap leading-relaxed text-zinc-700 dark:text-zinc-300">
              {topic.content}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between border-t border-zinc-100 pt-4 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <SignedIn>
                  <LikeButton
                    count={displayLikeCount}
                    liked={displayLiked}
                    onToggle={handleToggleLike}
                    size="md"
                  />
                </SignedIn>
                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800">
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      {displayLikeCount}
                    </button>
                  </SignInButton>
                </SignedOut>
                <span className="flex items-center gap-1.5 text-sm text-zinc-500">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  {topic.replies?.length ?? 0} תגובות
                </span>
              </div>

              {/* Delete topic (show when signed in - backend enforces ownership) */}
              <SignedIn>
                <button
                  onClick={handleDeleteTopic}
                  className="rounded-lg px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                >
                  מחק נושא
                </button>
              </SignedIn>
            </div>
          </motion.article>

          {/* Replies Section */}
          <section aria-label="תגובות">
            <h2 className="mb-5 text-lg font-bold text-zinc-900 dark:text-white">
              תגובות ({topic.replies?.length ?? 0})
            </h2>

            {/* Replies list */}
            {topic.replies && topic.replies.length > 0 ? (
              <div className="mb-8 space-y-5">
                <AnimatePresence mode="popLayout">
                  {topic.replies.map((reply: any) => (
                    <ReplyItem
                      key={reply._id}
                      reply={reply}
                      currentUserId={user?.id}
                      onDelete={handleDeleteReply}
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
                    placeholder="כתוב את תגובתך כאן..."
                    maxLength={2000}
                    required
                    rows={4}
                    className="w-full resize-none rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder-zinc-500 dark:focus:border-brand-600 dark:focus:bg-zinc-900"
                  />
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-zinc-500">{replyContent.length}/2000</p>
                    {replyError && (
                      <p className="text-xs text-red-500">{replyError}</p>
                    )}
                    <button
                      type="submit"
                      disabled={submittingReply || !replyContent.trim()}
                      className="rounded-xl bg-gradient-to-l from-brand-500 to-brand-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:brightness-110 disabled:opacity-50"
                    >
                      {submittingReply ? "שולח..." : "פרסם תגובה"}
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
