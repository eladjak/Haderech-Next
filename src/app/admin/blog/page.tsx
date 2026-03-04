"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { useState } from "react";
import type { Id } from "@/../convex/_generated/dataModel";

// ─── Constants ─────────────────────────────────────────────────────────────

const CATEGORY_OPTIONS = [
  { value: "dating-tips", label: "טיפים לדייטינג" },
  { value: "relationship", label: "זוגיות" },
  { value: "self-improvement", label: "שיפור עצמי" },
  { value: "communication", label: "תקשורת" },
  { value: "psychology", label: "פסיכולוגיה" },
] as const;

const CATEGORY_LABELS: Record<string, string> = {
  "dating-tips": "טיפים לדייטינג",
  relationship: "זוגיות",
  "self-improvement": "שיפור עצמי",
  communication: "תקשורת",
  psychology: "פסיכולוגיה",
};

type BlogCategory =
  | "dating-tips"
  | "relationship"
  | "self-improvement"
  | "communication"
  | "psychology";

// ─── Helpers ───────────────────────────────────────────────────────────────

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("he-IL", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u0590-\u05FF\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// ─── Form State ────────────────────────────────────────────────────────────

interface PostForm {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: BlogCategory;
  tags: string;
  readTime: number;
  published: boolean;
}

const emptyForm: PostForm = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  category: "dating-tips",
  tags: "",
  readTime: 5,
  published: false,
};

// ─── Page ──────────────────────────────────────────────────────────────────

export default function AdminBlogPage() {
  const posts = useQuery(api.blog.listAll);
  const stats = useQuery(api.blog.getStats);
  const createPost = useMutation(api.blog.createPost);
  const updatePost = useMutation(api.blog.updatePost);
  const deletePost = useMutation(api.blog.deletePost);
  const seedBlogPosts = useMutation(api.blog.seedBlogPosts);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<Id<"blogPosts"> | null>(null);
  const [form, setForm] = useState<PostForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ── Form Handlers ──

  const handleTitleChange = (title: string) => {
    setForm((prev) => ({
      ...prev,
      title,
      // Auto-generate slug only if not editing and slug hasn't been manually changed
      slug: editingId ? prev.slug : slugify(title),
    }));
  };

  const handleOpenNewForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setError(null);
    setShowForm(true);
  };

  const handleEditPost = (post: {
    _id: Id<"blogPosts">;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    category: BlogCategory;
    tags: string[];
    readTime: number;
    published: boolean;
  }) => {
    setForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      category: post.category,
      tags: post.tags.join(", "),
      readTime: post.readTime,
      published: post.published,
    });
    setEditingId(post._id);
    setError(null);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setError(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      const tagsArray = form.tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      if (editingId) {
        await updatePost({
          postId: editingId,
          title: form.title,
          slug: form.slug,
          excerpt: form.excerpt,
          content: form.content,
          category: form.category,
          tags: tagsArray,
          readTime: form.readTime,
          published: form.published,
        });
      } else {
        await createPost({
          title: form.title,
          slug: form.slug,
          excerpt: form.excerpt,
          content: form.content,
          category: form.category,
          tags: tagsArray,
          readTime: form.readTime,
          published: form.published,
        });
      }

      handleCancel();
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה בשמירה");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (postId: Id<"blogPosts">) => {
    if (confirmDeleteId !== postId) {
      setConfirmDeleteId(postId);
      return;
    }
    setDeletingId(postId);
    setConfirmDeleteId(null);
    try {
      await deletePost({ postId });
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await seedBlogPosts();
    } catch (err) {
      console.error("Seed error:", err);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
            ניהול בלוג
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            יצירה, עריכה ופרסום מאמרים
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Seed button */}
          {posts && posts.length === 0 && (
            <button
              type="button"
              onClick={handleSeed}
              disabled={seeding}
              className="inline-flex h-9 items-center rounded-lg border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              {seeding ? "יוצר..." : "צור מאמרים לדוגמה"}
            </button>
          )}

          {/* New post button */}
          <button
            type="button"
            onClick={handleOpenNewForm}
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#E85D75] px-4 text-sm font-medium text-white transition-colors hover:bg-[#d64d65] disabled:opacity-50"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            מאמר חדש
          </button>
        </div>
      </div>

      {/* Stats Row */}
      {stats ? (
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              סה&quot;כ מאמרים
            </p>
            <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-white">
              {stats.totalPosts}
            </p>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-800 dark:bg-emerald-900/20">
            <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
              מפורסמים
            </p>
            <p className="mt-1 text-2xl font-bold text-emerald-700 dark:text-emerald-300">
              {stats.published}
            </p>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-800 dark:bg-amber-900/20">
            <p className="text-xs font-medium text-amber-600 dark:text-amber-400">
              טיוטות
            </p>
            <p className="mt-1 text-2xl font-bold text-amber-700 dark:text-amber-300">
              {stats.drafts}
            </p>
          </div>
          <div className="rounded-xl border border-[#1E3A5F]/20 bg-[#1E3A5F]/5 p-5 dark:border-[#1E3A5F]/30 dark:bg-[#1E3A5F]/10">
            <p className="text-xs font-medium text-[#1E3A5F] dark:text-blue-300">
              סה&quot;כ צפיות
            </p>
            <p className="mt-1 text-2xl font-bold text-[#1E3A5F] dark:text-blue-200">
              {stats.totalViews.toLocaleString("he-IL")}
            </p>
          </div>
        </div>
      ) : (
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800"
            />
          ))}
        </div>
      )}

      {/* Post Form */}
      {showForm && (
        <div className="mb-8 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">
            {editingId ? "עריכת מאמר" : "מאמר חדש"}
          </h2>

          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Title */}
            <div className="sm:col-span-2">
              <label
                htmlFor="post-title"
                className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                כותרת
              </label>
              <input
                id="post-title"
                type="text"
                value={form.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="כותרת המאמר..."
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 transition-colors focus:border-[#E85D75] focus:outline-none focus:ring-1 focus:ring-[#E85D75] dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
              />
            </div>

            {/* Slug */}
            <div className="sm:col-span-2">
              <label
                htmlFor="post-slug"
                className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Slug (כתובת URL)
              </label>
              <input
                id="post-slug"
                type="text"
                value={form.slug}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, slug: e.target.value }))
                }
                placeholder="my-blog-post"
                dir="ltr"
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 transition-colors focus:border-[#E85D75] focus:outline-none focus:ring-1 focus:ring-[#E85D75] dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
              />
            </div>

            {/* Excerpt */}
            <div className="sm:col-span-2">
              <label
                htmlFor="post-excerpt"
                className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                תקציר
              </label>
              <textarea
                id="post-excerpt"
                value={form.excerpt}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, excerpt: e.target.value }))
                }
                placeholder="תקציר קצר של המאמר..."
                rows={2}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 transition-colors focus:border-[#E85D75] focus:outline-none focus:ring-1 focus:ring-[#E85D75] dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
              />
            </div>

            {/* Content */}
            <div className="sm:col-span-2">
              <label
                htmlFor="post-content"
                className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                תוכן (Markdown)
              </label>
              <textarea
                id="post-content"
                value={form.content}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, content: e.target.value }))
                }
                placeholder="כתוב את תוכן המאמר כאן... (תומך ב-Markdown)"
                rows={12}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 font-mono text-sm text-zinc-900 transition-colors focus:border-[#E85D75] focus:outline-none focus:ring-1 focus:ring-[#E85D75] dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
              />
            </div>

            {/* Category */}
            <div>
              <label
                htmlFor="post-category"
                className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                קטגוריה
              </label>
              <select
                id="post-category"
                value={form.category}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    category: e.target.value as BlogCategory,
                  }))
                }
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 transition-colors focus:border-[#E85D75] focus:outline-none focus:ring-1 focus:ring-[#E85D75] dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
              >
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div>
              <label
                htmlFor="post-tags"
                className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                תגיות (מופרדות בפסיקים)
              </label>
              <input
                id="post-tags"
                type="text"
                value={form.tags}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, tags: e.target.value }))
                }
                placeholder="דייטינג, טיפים, תקשורת"
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 transition-colors focus:border-[#E85D75] focus:outline-none focus:ring-1 focus:ring-[#E85D75] dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
              />
            </div>

            {/* Read Time */}
            <div>
              <label
                htmlFor="post-readtime"
                className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                זמן קריאה (דקות)
              </label>
              <input
                id="post-readtime"
                type="number"
                min={1}
                max={60}
                value={form.readTime}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    readTime: parseInt(e.target.value, 10) || 1,
                  }))
                }
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 transition-colors focus:border-[#E85D75] focus:outline-none focus:ring-1 focus:ring-[#E85D75] dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
              />
            </div>

            {/* Published Toggle */}
            <div className="flex items-end">
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      published: e.target.checked,
                    }))
                  }
                  className="h-4 w-4 rounded border-zinc-300 text-[#E85D75] focus:ring-[#E85D75]"
                />
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  פרסם מיד
                </span>
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="mt-6 flex items-center justify-end gap-3 border-t border-zinc-200 pt-4 dark:border-zinc-700">
            <button
              type="button"
              onClick={handleCancel}
              className="inline-flex h-9 items-center rounded-lg border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              ביטול
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !form.title.trim() || !form.excerpt.trim()}
              className="inline-flex h-9 items-center rounded-lg bg-[#E85D75] px-4 text-sm font-medium text-white transition-colors hover:bg-[#d64d65] disabled:opacity-50"
            >
              {saving ? "שומר..." : editingId ? "עדכן" : "צור מאמר"}
            </button>
          </div>
        </div>
      )}

      {/* Posts Table */}
      <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
            כל המאמרים
          </h2>
        </div>

        {posts === undefined ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-16 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800"
              />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-zinc-500 dark:text-zinc-400">
            אין מאמרים עדיין. לחץ על &quot;מאמר חדש&quot; או &quot;צור מאמרים
            לדוגמה&quot;.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800">
                  <th className="px-5 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    כותרת
                  </th>
                  <th className="px-3 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    קטגוריה
                  </th>
                  <th className="px-3 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    סטטוס
                  </th>
                  <th className="px-3 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    צפיות
                  </th>
                  <th className="px-3 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    תאריך
                  </th>
                  <th className="px-5 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    פעולות
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {posts.map((post) => {
                  const isDeleting = deletingId === post._id;
                  const isConfirmingDelete = confirmDeleteId === post._id;

                  return (
                    <tr
                      key={post._id}
                      className={`transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50 ${
                        isDeleting ? "opacity-50" : ""
                      }`}
                    >
                      {/* Title */}
                      <td className="px-5 py-3">
                        <div>
                          <p className="font-medium text-zinc-900 dark:text-white">
                            {post.title}
                          </p>
                          <p
                            className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500"
                            dir="ltr"
                          >
                            /{post.slug}
                          </p>
                        </div>
                      </td>

                      {/* Category Badge */}
                      <td className="px-3 py-3">
                        <span className="inline-flex items-center rounded-full bg-[#1E3A5F]/10 px-2.5 py-0.5 text-xs font-medium text-[#1E3A5F] dark:bg-[#1E3A5F]/20 dark:text-blue-300">
                          {CATEGORY_LABELS[post.category] ?? post.category}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-3 py-3">
                        {post.published ? (
                          <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                            מפורסם
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                            טיוטה
                          </span>
                        )}
                      </td>

                      {/* Views */}
                      <td className="px-3 py-3 text-zinc-600 dark:text-zinc-400">
                        {post.views.toLocaleString("he-IL")}
                      </td>

                      {/* Date */}
                      <td className="px-3 py-3 text-zinc-500 dark:text-zinc-400">
                        {formatDate(post.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          {/* Edit */}
                          <button
                            type="button"
                            onClick={() =>
                              handleEditPost(
                                post as typeof post & {
                                  _id: Id<"blogPosts">;
                                  category: BlogCategory;
                                }
                              )
                            }
                            className="flex h-8 items-center rounded-lg bg-zinc-100 px-3 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                            aria-label={`ערוך ${post.title}`}
                          >
                            <svg
                              className="h-3.5 w-3.5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                              aria-hidden="true"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                              />
                            </svg>
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(post._id as Id<"blogPosts">)
                            }
                            disabled={isDeleting}
                            title={
                              isConfirmingDelete
                                ? "לחץ שוב לאישור מחיקה"
                                : "מחק"
                            }
                            aria-label={
                              isConfirmingDelete ? "אשר מחיקה" : "מחק מאמר"
                            }
                            className={`flex h-8 items-center justify-center rounded-lg px-2 text-xs font-medium transition-colors ${
                              isConfirmingDelete
                                ? "bg-red-500 text-white hover:bg-red-600"
                                : "bg-zinc-100 text-zinc-500 hover:bg-red-50 hover:text-red-600 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                            }`}
                          >
                            {isDeleting ? (
                              <svg
                                className="h-3.5 w-3.5 animate-spin"
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
                                  d="M4 12a8 8 0 018-8v8z"
                                />
                              </svg>
                            ) : isConfirmingDelete ? (
                              "אשר"
                            ) : (
                              <svg
                                className="h-3.5 w-3.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                                aria-hidden="true"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                                />
                              </svg>
                            )}
                          </button>

                          {isConfirmingDelete && (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(null)}
                              className="flex h-8 items-center justify-center rounded-lg bg-zinc-100 px-2 text-xs font-medium text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                              aria-label="בטל מחיקה"
                            >
                              ביטול
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
