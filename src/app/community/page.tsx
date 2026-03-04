"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { useUser, SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { api } from "@/../convex/_generated/api";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

type Category =
  | "all"
  | "general"
  | "dating-tips"
  | "success-stories"
  | "questions"
  | "advice";

const CATEGORIES: { value: Category; label: string; emoji: string }[] = [
  { value: "all", label: "הכל", emoji: "🌟" },
  { value: "dating-tips", label: "טיפים", emoji: "💡" },
  { value: "success-stories", label: "סיפורי הצלחה", emoji: "💕" },
  { value: "questions", label: "שאלות", emoji: "❓" },
  { value: "advice", label: "עצות", emoji: "🎯" },
  { value: "general", label: "כללי", emoji: "💬" },
];

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

type TopicCategory =
  | "general"
  | "dating-tips"
  | "success-stories"
  | "questions"
  | "advice";

function NewTopicModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<TopicCategory>("general");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const createTopic = useMutation(api.community.createTopic);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await createTopic({ title, content, category });
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "אירעה שגיאה");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl dark:bg-zinc-900"
      >
        <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4 dark:border-zinc-800">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
            כתוב פוסט חדש
          </h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"
            aria-label="סגור"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Category */}
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              קטגוריה
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.filter((c) => c.value !== "all").map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value as TopicCategory)}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium transition-all ${
                    category === cat.value
                      ? "bg-brand-500 text-white shadow-sm"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                  }`}
                >
                  {cat.emoji} {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label
              htmlFor="topic-title"
              className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              כותרת
            </label>
            <input
              id="topic-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="על מה תרצה לכתוב?"
              maxLength={200}
              required
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder-zinc-500 dark:focus:border-brand-600 dark:focus:bg-zinc-900"
            />
          </div>

          {/* Content */}
          <div>
            <label
              htmlFor="topic-content"
              className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              תוכן
            </label>
            <textarea
              id="topic-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="שתף את המחשבות, הניסיון, או השאלה שלך..."
              maxLength={5000}
              required
              rows={5}
              className="w-full resize-none rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder-zinc-500 dark:focus:border-brand-600 dark:focus:bg-zinc-900"
            />
            <p className="mt-1 text-left text-xs text-zinc-400">
              {content.length}/5000
            </p>
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-5 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              ביטול
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim() || !content.trim()}
              className="rounded-xl bg-gradient-to-l from-brand-500 to-brand-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:brightness-110 disabled:opacity-50"
            >
              {loading ? "מפרסם..." : "פרסם פוסט"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

function TopicCard({ topic }: { topic: any }) {
  const categoryColor =
    CATEGORY_COLORS[topic.category] ||
    "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300";

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm transition-all hover:border-brand-200 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-brand-800"
    >
      {topic.pinned && (
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

      <div className="mb-3 flex items-start justify-between gap-3">
        <Link
          href={`/community/${topic._id}`}
          className="flex-1 text-base font-semibold text-zinc-900 transition-colors hover:text-brand-600 dark:text-white dark:hover:text-brand-400"
        >
          {topic.title}
        </Link>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${categoryColor}`}>
          {CATEGORY_LABELS[topic.category] ?? topic.category}
        </span>
      </div>

      <p className="mb-4 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
        {topic.content}
      </p>

      <div className="flex items-center justify-between text-xs text-zinc-400 dark:text-zinc-500">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-xs font-bold text-white">
            {(topic.authorName ?? "מ").charAt(0)}
          </div>
          <span className="font-medium text-zinc-500 dark:text-zinc-400">
            {topic.authorName ?? "משתמש"}
          </span>
          <span>·</span>
          <span>{timeAgo(topic.createdAt)}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
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
            {topic.likesCount}
          </span>
          <span className="flex items-center gap-1">
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
            {topic.repliesCount}
          </span>
        </div>
      </div>
    </motion.article>
  );
}

export default function CommunityPage() {
  const { user } = useUser();
  const [selectedCategory, setSelectedCategory] = useState<Category>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewTopicModal, setShowNewTopicModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const topics = useQuery(
    api.community.listTopics,
    selectedCategory === "all" ? {} : { category: selectedCategory as Exclude<Category, "all"> }
  );

  const filteredTopics = useMemo(() => {
    if (!topics) return undefined;
    const q = searchQuery.trim().toLowerCase();
    if (!q) return topics;
    return topics.filter(
      (t: any) =>
        t.title.toLowerCase().includes(q) ||
        t.content.toLowerCase().includes(q) ||
        (t.authorName ?? "").toLowerCase().includes(q)
    );
  }, [topics, searchQuery, refreshKey]);

  return (
    <div className="min-h-dvh bg-zinc-50 dark:bg-zinc-950" dir="rtl">
      <Header />

      <main className="container mx-auto px-4 py-10">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center"
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 shadow-lg">
            <svg
              className="h-8 w-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
              />
            </svg>
          </div>
          <h1 className="mb-2 text-3xl font-bold text-zinc-900 dark:text-white">
            הקהילה שלנו
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            מקום לשתף, ללמוד ולהתחבר עם אנשים בדרך לאהבה
          </p>
        </motion.div>

        {/* Toolbar */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Search */}
          <div className="relative w-full sm:max-w-sm">
            <svg
              className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="חפש נושאים..."
              className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pr-10 pl-4 text-sm text-zinc-900 placeholder-zinc-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:placeholder-zinc-500"
            />
          </div>

          {/* New Post Button */}
          <SignedIn>
            <button
              onClick={() => setShowNewTopicModal(true)}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-l from-brand-500 to-brand-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:brightness-110 hover:shadow-md"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.5"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
              כתוב פוסט חדש
            </button>
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="flex items-center gap-2 rounded-xl bg-gradient-to-l from-brand-500 to-brand-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:brightness-110">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4.5v15m7.5-7.5h-15"
                  />
                </svg>
                הצטרף וכתוב פוסט
              </button>
            </SignInButton>
          </SignedOut>
        </div>

        {/* Category Pills */}
        <div className="mb-6 flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                selectedCategory === cat.value
                  ? "bg-brand-500 text-white shadow-sm"
                  : "bg-white text-zinc-600 shadow-sm hover:bg-brand-50 hover:text-brand-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
              }`}
            >
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>

        {/* Topics List */}
        {filteredTopics === undefined ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-36 animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800"
              />
            ))}
          </div>
        ) : filteredTopics.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="mb-4 text-5xl">💬</div>
            <h3 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-white">
              אין נושאים עדיין
            </h3>
            <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
              {searchQuery
                ? "לא נמצאו נושאים התואמים לחיפוש"
                : "היה הראשון לפתוח דיון!"}
            </p>
            <SignedIn>
              <button
                onClick={() => setShowNewTopicModal(true)}
                className="rounded-xl bg-gradient-to-l from-brand-500 to-brand-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm hover:brightness-110"
              >
                כתוב פוסט ראשון
              </button>
            </SignedIn>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredTopics.map((topic: any) => (
                <TopicCard key={topic._id} topic={topic} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      <Footer />

      {/* New Topic Modal */}
      <AnimatePresence>
        {showNewTopicModal && (
          <NewTopicModal
            onClose={() => setShowNewTopicModal(false)}
            onSuccess={() => setRefreshKey((k) => k + 1)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
