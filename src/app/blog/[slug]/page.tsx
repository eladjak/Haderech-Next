"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { motion } from "framer-motion";
import Link from "next/link";
import { api } from "@/../convex/_generated/api";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { SocialShare } from "@/components/social-share";
import { ShareButton } from "@/components/ui/share-button";
import { sanityClient } from "@/lib/sanity/client";
import { blogPostBySlugQuery } from "@/lib/sanity/queries";
import type { SanityBlogPost } from "@/lib/sanity/types";

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

/**
 * Simple markdown-to-HTML renderer.
 * Handles: headings (#, ##, ###), bold (**), italic (*),
 * unordered lists (-), and paragraphs (double newline).
 */
function renderMarkdown(markdown: string): string {
  const lines = markdown.split("\n");
  const htmlParts: string[] = [];
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Empty line closes list and is a paragraph break
    if (line.trim() === "") {
      if (inList) {
        htmlParts.push("</ul>");
        inList = false;
      }
      continue;
    }

    // Headings
    if (line.startsWith("### ")) {
      if (inList) { htmlParts.push("</ul>"); inList = false; }
      const text = processInline(line.slice(4));
      htmlParts.push(`<h3 class="mt-6 mb-3 text-lg font-bold text-zinc-900 dark:text-white">${text}</h3>`);
      continue;
    }
    if (line.startsWith("## ")) {
      if (inList) { htmlParts.push("</ul>"); inList = false; }
      const text = processInline(line.slice(3));
      htmlParts.push(`<h2 class="mt-8 mb-4 text-xl font-bold text-zinc-900 dark:text-white">${text}</h2>`);
      continue;
    }
    if (line.startsWith("# ")) {
      if (inList) { htmlParts.push("</ul>"); inList = false; }
      // Skip top-level heading (already shown as page title)
      continue;
    }

    // Unordered list items
    if (line.startsWith("- ")) {
      if (!inList) {
        htmlParts.push('<ul class="mb-4 mr-6 list-disc space-y-1 text-zinc-700 dark:text-zinc-300">');
        inList = true;
      }
      const text = processInline(line.slice(2));
      htmlParts.push(`<li>${text}</li>`);
      continue;
    }

    // Regular paragraph
    if (inList) { htmlParts.push("</ul>"); inList = false; }
    const text = processInline(line);
    htmlParts.push(`<p class="mb-4 leading-relaxed text-zinc-700 dark:text-zinc-300">${text}</p>`);
  }

  if (inList) {
    htmlParts.push("</ul>");
  }

  return htmlParts.join("\n");
}

/** Process inline markdown: **bold** and *italic* */
function processInline(text: string): string {
  // Bold: **text**
  let result = text.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-zinc-900 dark:text-white">$1</strong>');
  // Italic: *text* (but not inside bold)
  result = result.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');
  return result;
}

function RecentPostCard({ post }: { post: any }) {
  const gradient =
    CATEGORY_GRADIENTS[post.category] ?? "from-brand-400 to-brand-600";

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex gap-4 rounded-xl border border-zinc-100 bg-white p-4 shadow-sm transition-all hover:border-brand-200 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-brand-800"
    >
      <div
        className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${gradient}`}
      >
        <svg
          className="h-8 w-8 text-white/40"
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
      <div className="flex flex-1 flex-col justify-center">
        <h4 className="text-sm font-semibold text-zinc-900 transition-colors group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-400">
          {post.title}
        </h4>
        <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
          {post.readTime} דק&apos; קריאה
        </p>
      </div>
    </Link>
  );
}

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const viewIncrementedRef = useRef(false);

  // Sanity post state
  const [sanityPost, setSanityPost] = useState<SanityBlogPost | null | undefined>(undefined);
  const [sanityLoaded, setSanityLoaded] = useState(false);

  // Fetch from Sanity first
  useEffect(() => {
    sanityClient
      .fetch<SanityBlogPost | null>(blogPostBySlugQuery, { slug })
      .then((data) => {
        setSanityPost(data);
        setSanityLoaded(true);
      })
      .catch(() => {
        setSanityPost(null);
        setSanityLoaded(true);
      });
  }, [slug]);

  // Always query Convex (used as fallback if Sanity has no match)
  const convexPost = useQuery(api.blog.getBySlug, { slug });
  const recentPosts = useQuery(api.blog.listRecent);
  const incrementViews = useMutation(api.blog.incrementViews);

  // Determine which post to show: Sanity takes priority
  const isSanitySource = sanityLoaded && sanityPost != null;
  const post = isSanitySource ? sanityPost : convexPost;

  // Increment views once when Convex post loads (Sanity has no view tracking)
  useEffect(() => {
    if (convexPost && convexPost._id && !viewIncrementedRef.current && !isSanitySource) {
      viewIncrementedRef.current = true;
      incrementViews({ postId: convexPost._id }).catch(() => {
        // Silently ignore view increment errors
      });
    }
  }, [convexPost, incrementViews, isSanitySource]);

  // Filter out current post from recent
  const otherRecentPosts = recentPosts?.filter(
    (p: any) => p.slug !== slug
  );

  // Still loading both sources
  if (!sanityLoaded || (convexPost === undefined && !isSanitySource)) {
    return (
      <div className="min-h-dvh bg-zinc-50 dark:bg-zinc-950" dir="rtl">
        <Header />
        <main className="container mx-auto max-w-3xl px-4 py-10">
          <div className="space-y-4">
            <div className="h-8 w-48 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-12 w-full animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-6 w-64 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
            <div className="mt-8 space-y-3">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="h-5 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-800"
                />
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (post === null || post === undefined) {
    // Not found in either source
    return (
      <div className="min-h-dvh bg-zinc-50 dark:bg-zinc-950" dir="rtl">
        <Header />
        <main className="container mx-auto flex max-w-3xl flex-col items-center justify-center px-4 py-20 text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800">
            <svg
              className="h-10 w-10 text-zinc-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
          </div>
          <h1 className="mb-2 text-2xl font-bold text-zinc-900 dark:text-white">
            המאמר לא נמצא
          </h1>
          <p className="mb-6 text-zinc-500 dark:text-zinc-400">
            המאמר שחיפשתם לא קיים או הוסר
          </p>
          <Link
            href="/blog"
            className="rounded-xl bg-gradient-to-l from-brand-500 to-brand-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:brightness-110"
          >
            חזרה לבלוג
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const categoryColor =
    CATEGORY_COLORS[post.category ?? ""] ??
    "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300";

  const renderedContent = renderMarkdown(post.content ?? "");

  // Determine display values depending on source
  const displayDate = isSanitySource
    ? (sanityPost?.publishedAt ?? "")
    : formatDate((post as any).createdAt);
  const displayAuthor = isSanitySource
    ? "צוות הדרך"
    : ((post as any).authorName ?? "צוות הדרך");
  const displayReadTime = post.readTime ?? "";
  const displayViews = isSanitySource ? null : (post as any).views;
  const displayTags = isSanitySource ? [] : ((post as any).tags ?? []);
  const displayFeaturedImage = isSanitySource ? sanityPost?.featuredImage : null;

  return (
    <div className="min-h-dvh bg-zinc-50 dark:bg-zinc-950" dir="rtl">
      <Header />

      <main className="container mx-auto max-w-3xl px-4 py-10">
        <motion.article
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Breadcrumb */}
          <nav
            className="mb-6 flex items-center gap-2 text-sm text-zinc-400 dark:text-zinc-500"
            aria-label="breadcrumb"
          >
            <Link
              href="/blog"
              className="transition-colors hover:text-brand-600 dark:hover:text-brand-400"
            >
              בלוג
            </Link>
            <span aria-hidden="true">&lsaquo;</span>
            <span className="text-zinc-500 dark:text-zinc-400">
              {CATEGORY_LABELS[post.category ?? ""] ?? post.category}
            </span>
            <span aria-hidden="true">&lsaquo;</span>
            <span className="truncate text-zinc-600 dark:text-zinc-300">
              {post.title}
            </span>
          </nav>

          {/* Featured Image */}
          {displayFeaturedImage && (
            <div className="mb-6 overflow-hidden rounded-2xl">
              <img
                src={displayFeaturedImage}
                alt={post.title}
                className="h-auto w-full object-cover"
              />
            </div>
          )}

          {/* Title */}
          <h1 className="mb-4 text-3xl font-bold leading-snug text-zinc-900 dark:text-white md:text-4xl">
            {post.title}
          </h1>

          {/* Share Button */}
          <div className="mb-4">
            <ShareButton
              title={post.title}
              text={post.excerpt}
              url={`https://haderech.co.il/blog/${post.slug}`}
            />
          </div>

          {/* Meta */}
          <div className="mb-6 flex flex-wrap items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-xs font-bold text-white">
                {displayAuthor.charAt(0)}
              </div>
              <span className="font-medium">
                {displayAuthor}
              </span>
            </div>
            {displayDate && <span>{displayDate}</span>}
            {displayReadTime && (
              <span className="flex items-center gap-1">
                <svg
                  className="h-4 w-4"
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
                {displayReadTime} {!isSanitySource && "דק\u0027 קריאה"}
              </span>
            )}
            {displayViews != null && (
              <span className="flex items-center gap-1">
                <svg
                  className="h-4 w-4"
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
                {displayViews} צפיות
              </span>
            )}
            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${categoryColor}`}>
              {CATEGORY_LABELS[post.category ?? ""] ?? post.category}
            </span>
          </div>

          {/* Tags */}
          {displayTags.length > 0 && (
            <div className="mb-8 flex flex-wrap gap-2">
              {displayTags.map((tag: string) => (
                <span
                  key={tag}
                  className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Content */}
          <div
            className="prose-custom mb-10"
            dangerouslySetInnerHTML={{ __html: renderedContent }}
          />

          {/* Divider */}
          <div className="mb-8 border-t border-zinc-200 pt-8 dark:border-zinc-800">
            <SocialShare
              url={`https://haderech.co.il/blog/${post.slug}`}
              title={post.title}
              description={post.excerpt}
            />
          </div>
        </motion.article>

        {/* More Articles */}
        {otherRecentPosts && otherRecentPosts.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-6 text-xl font-bold text-zinc-900 dark:text-white">
              מאמרים נוספים
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {otherRecentPosts.slice(0, 3).map((recentPost: any) => (
                <RecentPostCard key={recentPost._id} post={recentPost} />
              ))}
            </div>
            <div className="mt-6 text-center">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-2.5 text-sm font-medium text-zinc-700 shadow-sm transition-all hover:shadow-md dark:bg-zinc-900 dark:text-zinc-300"
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
                    d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                  />
                </svg>
                כל המאמרים
              </Link>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
