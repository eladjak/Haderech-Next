"use client";

import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { api } from "@/../convex/_generated/api";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { PostCard } from "@/components/forum/post-card";
import {
  CategoryPills,
  type ForumCategoryOrAll,
  type ForumCategory,
} from "@/components/forum/category-pills";

type SortBy = "latest" | "popular";

// ─── Stats Bar ────────────────────────────────────────────────────────────────

function StatsBar() {
  const stats = useQuery(api.forum.getForumStats, {});

  if (!stats) {
    return (
      <div className="flex gap-6">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-5 w-24 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700"
          />
        ))}
      </div>
    );
  }

  const items = [
    { label: "פוסטים", value: stats.totalPosts, emoji: "📝" },
    { label: "תגובות", value: stats.totalReplies, emoji: "💬" },
    { label: "פעילים היום", value: stats.activeUsersToday, emoji: "🟢" },
  ];

  return (
    <div
      className="flex flex-wrap gap-5 text-sm"
      aria-label="סטטיסטיקות פורום"
    >
      {items.map((item) => (
        <div
          key={item.label}
          className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400"
        >
          <span aria-hidden="true">{item.emoji}</span>
          <span className="font-semibold text-zinc-900 dark:text-white">
            {item.value.toLocaleString("he-IL")}
          </span>
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Post Skeleton ────────────────────────────────────────────────────────────

function PostSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-zinc-100 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="h-5 flex-1 rounded-lg bg-zinc-200 dark:bg-zinc-700" />
        <div className="h-5 w-20 shrink-0 rounded-full bg-zinc-200 dark:bg-zinc-700" />
      </div>
      <div className="mb-2 h-4 rounded bg-zinc-100 dark:bg-zinc-800" />
      <div className="mb-4 h-4 w-3/4 rounded bg-zinc-100 dark:bg-zinc-800" />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-zinc-200 dark:bg-zinc-700" />
          <div className="h-4 w-24 rounded bg-zinc-200 dark:bg-zinc-700" />
        </div>
        <div className="flex gap-3">
          <div className="h-4 w-10 rounded bg-zinc-200 dark:bg-zinc-700" />
          <div className="h-4 w-10 rounded bg-zinc-200 dark:bg-zinc-700" />
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ForumPage() {
  const [selectedCategory, setSelectedCategory] =
    useState<ForumCategoryOrAll>("all");
  const [sortBy, setSortBy] = useState<SortBy>("latest");
  const [searchQuery, setSearchQuery] = useState("");

  const posts = useQuery(api.forum.listPosts, {
    category:
      selectedCategory === "all"
        ? undefined
        : (selectedCategory as ForumCategory),
    sortBy,
    take: 50,
  });

  const filteredPosts = useMemo(() => {
    if (!posts) return undefined;
    const q = searchQuery.trim().toLowerCase();
    if (!q) return posts;
    return posts.filter(
      (p: any) =>
        p.title.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q) ||
        (p.authorName ?? "").toLowerCase().includes(q)
    );
  }, [posts, searchQuery]);

  return (
    <div className="min-h-dvh bg-zinc-50 dark:bg-zinc-950" dir="rtl">
      <Header />

      <main className="container mx-auto px-4 py-10">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
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
                d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
              />
            </svg>
          </div>
          <h1 className="mb-2 text-3xl font-bold text-zinc-900 dark:text-white">
            פורום הקהילה
          </h1>
          <p className="mb-6 text-zinc-600 dark:text-zinc-400">
            שאלו, שתפו, ולמדו מניסיון אחרים
          </p>

          {/* Stats */}
          <div className="flex justify-center">
            <StatsBar />
          </div>
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
              placeholder="חפש פוסטים..."
              aria-label="חיפוש פוסטים"
              className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pr-10 pl-4 text-sm text-zinc-900 placeholder-zinc-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:placeholder-zinc-500"
            />
          </div>

          {/* Sort + New Post */}
          <div className="flex items-center gap-3">
            {/* Sort buttons */}
            <div
              className="flex rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900"
              role="group"
              aria-label="מיון"
            >
              {(
                [
                  { value: "latest" as const, label: "חדש ביותר" },
                  { value: "popular" as const, label: "פופולרי" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSortBy(opt.value)}
                  aria-pressed={sortBy === opt.value}
                  className={`rounded-xl px-3 py-2 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 ${
                    sortBy === opt.value
                      ? "bg-brand-500 text-white"
                      : "text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Create post button */}
            <SignedIn>
              <Link
                href="/community/forum/new"
                className="flex items-center gap-2 rounded-xl bg-gradient-to-l from-brand-500 to-brand-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:brightness-110 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
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
                פוסט חדש
              </Link>
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
                  הצטרף וכתוב
                </button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>

        {/* Category Pills */}
        <CategoryPills
          selected={selectedCategory}
          onChange={setSelectedCategory}
          className="mb-8"
        />

        {/* Posts list */}
        {filteredPosts === undefined ? (
          <div className="space-y-4" aria-busy="true" aria-label="טוען פוסטים">
            {[...Array(5)].map((_, i) => (
              <PostSkeleton key={i} />
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="mb-4 text-5xl" aria-hidden="true">
              💬
            </div>
            <h2 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-white">
              אין פוסטים עדיין
            </h2>
            <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
              {searchQuery
                ? "לא נמצאו פוסטים התואמים לחיפוש"
                : "היה הראשון לפתוח דיון בקטגוריה זו!"}
            </p>
            <SignedIn>
              <Link
                href="/community/forum/new"
                className="rounded-xl bg-gradient-to-l from-brand-500 to-brand-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm hover:brightness-110"
              >
                כתוב פוסט ראשון
              </Link>
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="rounded-xl bg-gradient-to-l from-brand-500 to-brand-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm hover:brightness-110">
                  הצטרף לקהילה
                </button>
              </SignInButton>
            </SignedOut>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredPosts.map((post: any, i: number) => (
                <PostCard
                  key={post._id}
                  post={post}
                  basePath="/community/forum"
                  index={i}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      <Footer />

      {/* Floating Action Button for mobile */}
      <SignedIn>
        <div className="fixed bottom-6 left-6 z-40 sm:hidden">
          <Link
            href="/community/forum/new"
            className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-600 shadow-lg transition-all hover:scale-105 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
            aria-label="צור פוסט חדש"
          >
            <svg
              className="h-6 w-6 text-white"
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
          </Link>
        </div>
      </SignedIn>
    </div>
  );
}
