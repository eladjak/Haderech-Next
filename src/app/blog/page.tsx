"use client";

import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { api } from "@/../convex/_generated/api";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

type BlogCategory =
  | "all"
  | "dating-tips"
  | "relationship"
  | "self-improvement"
  | "communication"
  | "psychology";

const CATEGORIES: { value: BlogCategory; label: string }[] = [
  { value: "all", label: "הכל" },
  { value: "dating-tips", label: "טיפים לדייטינג" },
  { value: "relationship", label: "זוגיות" },
  { value: "self-improvement", label: "צמיחה אישית" },
  { value: "communication", label: "תקשורת" },
  { value: "psychology", label: "פסיכולוגיה" },
];

const CATEGORY_LABELS: Record<string, string> = {
  "dating-tips": "טיפים לדייטינג",
  relationship: "זוגיות",
  "self-improvement": "צמיחה אישית",
  communication: "תקשורת",
  psychology: "פסיכולוגיה",
};

const CATEGORY_COLORS: Record<string, string> = {
  "dating-tips":
    "bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300",
  relationship:
    "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300",
  "self-improvement":
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  communication:
    "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
  psychology:
    "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300",
};

const CATEGORY_ICONS: Record<string, string> = {
  "dating-tips": "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
  relationship: "M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z",
  "self-improvement": "M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18",
  communication: "M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z",
  psychology: "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z",
};

const CATEGORY_GRADIENTS: Record<string, string> = {
  "dating-tips": "from-brand-400 to-brand-600",
  relationship: "from-rose-400 to-rose-600",
  "self-improvement": "from-emerald-400 to-emerald-600",
  communication: "from-blue-400 to-blue-600",
  psychology: "from-purple-400 to-purple-600",
};

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("he-IL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function BlogCard({ post }: { post: any }) {
  const categoryColor =
    CATEGORY_COLORS[post.category] ??
    "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300";
  const gradient =
    CATEGORY_GRADIENTS[post.category] ?? "from-brand-400 to-brand-600";
  const iconPath =
    CATEGORY_ICONS[post.category] ?? CATEGORY_ICONS["dating-tips"];

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm transition-all hover:border-brand-200 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-brand-800"
    >
      {/* Cover Image / Gradient Placeholder */}
      <div
        className={`relative flex h-48 items-center justify-center bg-gradient-to-br ${gradient}`}
      >
        <svg
          className="h-16 w-16 text-white/30"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d={iconPath}
          />
        </svg>
        <div className="absolute bottom-3 right-3">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${categoryColor}`}
          >
            {CATEGORY_LABELS[post.category] ?? post.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <Link
          href={`/blog/${post.slug}`}
          className="mb-2 text-lg font-bold text-zinc-900 transition-colors hover:text-brand-600 dark:text-white dark:hover:text-brand-400"
        >
          {post.title}
        </Link>

        <p className="mb-4 line-clamp-2 flex-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          {post.excerpt}
        </p>

        {/* Meta */}
        <div className="flex items-center justify-between border-t border-zinc-100 pt-4 text-xs text-zinc-400 dark:border-zinc-800 dark:text-zinc-500">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-[10px] font-bold text-white">
              {(post.authorName ?? "צ").charAt(0)}
            </div>
            <span className="font-medium text-zinc-500 dark:text-zinc-400">
              {post.authorName ?? "צוות הדרך"}
            </span>
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
                  d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {post.readTime} דק&apos;
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
                  d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.64 0 8.577 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.64 0-8.577-3.007-9.963-7.178z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              {post.views}
            </span>
          </div>
        </div>

        <div className="mt-2 text-left text-xs text-zinc-400 dark:text-zinc-500">
          {formatDate(post.createdAt)}
        </div>
      </div>
    </motion.article>
  );
}

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] =
    useState<BlogCategory>("all");

  const posts = useQuery(
    api.blog.listPublished,
    selectedCategory === "all"
      ? {}
      : { category: selectedCategory as Exclude<BlogCategory, "all"> }
  );

  const filteredPosts = useMemo(() => {
    if (!posts) return undefined;
    return posts;
  }, [posts]);

  return (
    <div className="min-h-dvh bg-zinc-50 dark:bg-zinc-950" dir="rtl">
      <Header />

      <main id="main-content" className="container mx-auto px-4 py-10">
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
                d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z"
              />
            </svg>
          </div>
          <h1 className="mb-2 text-3xl font-bold text-zinc-900 dark:text-white">
            הבלוג של הדרך
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            מאמרים, טיפים ותובנות על דייטינג, זוגיות וצמיחה אישית
          </p>
        </motion.div>

        {/* Category Filter Tabs */}
        <div className="mb-8 flex flex-wrap justify-center gap-2">
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
              {cat.label}
            </button>
          ))}
        </div>

        {/* Articles Grid */}
        {filteredPosts === undefined ? (
          <div className="grid gap-6 md:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-80 animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800"
              />
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800">
              <svg
                className="h-8 w-8 text-zinc-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-white">
              אין מאמרים בקטגוריה זו
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              נסו לבחור קטגוריה אחרת או חזרו מאוחר יותר
            </p>
          </motion.div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            <AnimatePresence mode="popLayout">
              {filteredPosts.map((post: any) => (
                <BlogCard key={post._id} post={post} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
