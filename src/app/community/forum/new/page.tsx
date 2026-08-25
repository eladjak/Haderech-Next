"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { motion } from "framer-motion";
import Link from "next/link";
import { api } from "@/../convex/_generated/api";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import {
  FORUM_CATEGORIES,
  type ForumCategory,
} from "@/components/forum/category-pills";

const MIN_CONTENT_LENGTH = 10;
const MAX_CONTENT_LENGTH = 5000;
const MAX_TITLE_LENGTH = 200;

// ─── Form ─────────────────────────────────────────────────────────────────────

function NewPostForm() {
  const router = useRouter();
  const createPost = useMutation(api.forum.createPost);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<ForumCategory>("general");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [titleError, setTitleError] = useState("");
  const [contentError, setContentError] = useState("");

  const titleRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  const titleTrimmed = title.trim();
  const contentTrimmed = content.trim();
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Say what is wrong, tie it to the field, and put the caret there.
    // A silent `return` leaves a screen-reader or keyboard user with nothing.
    const nextTitleError =
      titleTrimmed.length === 0
        ? "יש להזין כותרת לפוסט"
        : titleTrimmed.length > MAX_TITLE_LENGTH
          ? `הכותרת ארוכה מדי - עד ${MAX_TITLE_LENGTH} תווים`
          : "";
    const nextContentError =
      contentTrimmed.length < MIN_CONTENT_LENGTH
        ? `התוכן קצר מדי - יש להוסיף עוד ${MIN_CONTENT_LENGTH - contentTrimmed.length} תווים לפחות`
        : contentTrimmed.length > MAX_CONTENT_LENGTH
          ? `התוכן ארוך מדי - עד ${MAX_CONTENT_LENGTH} תווים`
          : "";

    setTitleError(nextTitleError);
    setContentError(nextContentError);

    if (nextTitleError || nextContentError) {
      const firstInvalid = nextTitleError ? titleRef.current : contentRef.current;
      firstInvalid?.focus();
      return;
    }

    setError("");
    setLoading(true);
    try {
      const postId = await createPost({
        title: titleTrimmed,
        content: contentTrimmed,
        category,
      });
      router.push(`/community/forum/${postId}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "אירעה שגיאה, נסה שנית");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Category */}
      <fieldset>
        <legend className="mb-3 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          קטגוריה
          <span className="mr-1 text-red-500" aria-hidden="true">
            *
          </span>
        </legend>
        <div className="flex flex-wrap gap-2" role="group">
          {FORUM_CATEGORIES.map((cat) => {
            const isSelected = category === cat.value;
            return (
              <button
                key={cat.value}
                type="button"
                onClick={() => setCategory(cat.value)}
                aria-pressed={isSelected}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 ${
                  isSelected
                    ? "bg-brand-500 text-white shadow-sm"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                }`}
              >
                <span aria-hidden="true">{cat.emoji}</span> {cat.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Title */}
      <div>
        <label
          htmlFor="post-title"
          className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300"
        >
          כותרת
          <span className="mr-1 text-red-500" aria-hidden="true">
            *
          </span>
        </label>
        <input
          id="post-title"
          ref={titleRef}
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (titleError) setTitleError("");
          }}
          placeholder="על מה תרצה לכתוב?"
          maxLength={MAX_TITLE_LENGTH}
          required
          aria-required="true"
          aria-invalid={titleError ? "true" : undefined}
          aria-describedby={
            titleError ? "title-error title-count" : "title-count"
          }
          className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder-zinc-500 dark:focus:border-brand-600 dark:focus:bg-zinc-900"
        />
        {/* Mounted before it has content: a live region injected in the same
            tick as its text is frequently not announced. */}
        <p
          id="title-error"
          role="alert"
          className={
            titleError
              ? "mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400"
              : "sr-only"
          }
        >
          {titleError ? (
            <>
              <span aria-hidden="true">⚠</span>
              {titleError}
            </>
          ) : null}
        </p>
        <p
          id="title-count"
          className="mt-1 text-left text-xs text-zinc-400"
          aria-live="polite"
        >
          {titleTrimmed.length}/{MAX_TITLE_LENGTH}
        </p>
      </div>

      {/* Content */}
      <div>
        <label
          htmlFor="post-content"
          className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300"
        >
          תוכן
          <span className="mr-1 text-red-500" aria-hidden="true">
            *
          </span>
        </label>
        <textarea
          id="post-content"
          ref={contentRef}
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            if (contentError) setContentError("");
          }}
          placeholder="שתף את המחשבות, הניסיון, או השאלה שלך..."
          maxLength={MAX_CONTENT_LENGTH}
          required
          aria-required="true"
          aria-invalid={contentError ? "true" : undefined}
          aria-describedby={
            contentError
              ? "content-error content-help content-count"
              : "content-help content-count"
          }
          rows={8}
          className="w-full resize-none rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder-zinc-500 dark:focus:border-brand-600 dark:focus:bg-zinc-900"
        />
        {/* Mounted before it has content — see title-error above. */}
        <p
          id="content-error"
          role="alert"
          className={
            contentError
              ? "mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400"
              : "sr-only"
          }
        >
          {contentError ? (
            <>
              <span aria-hidden="true">⚠</span>
              {contentError}
            </>
          ) : null}
        </p>
        <div className="mt-1 flex items-center justify-between">
          <p id="content-help" className="text-xs text-zinc-400">
            מינימום {MIN_CONTENT_LENGTH} תווים
          </p>
          <p
            id="content-count"
            className={`text-xs ${
              contentTrimmed.length < MIN_CONTENT_LENGTH
                ? "text-amber-600 dark:text-amber-500"
                : "text-zinc-400"
            }`}
            aria-live="polite"
          >
            {/* the shortfall must be readable, not only amber */}
            {contentTrimmed.length < MIN_CONTENT_LENGTH
              ? `חסרים ${MIN_CONTENT_LENGTH - contentTrimmed.length} תווים`
              : `${content.length}/${MAX_CONTENT_LENGTH}`}
          </p>
        </div>
      </div>

      {/* Submit failure. Mounted before it has content, same reason. */}
      <p
        role="alert"
        className={
          error
            ? "rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400"
            : "sr-only"
        }
      >
        {error || null}
      </p>

      {/* Buttons */}
      <div className="flex items-center justify-end gap-3 border-t border-zinc-100 pt-4 dark:border-zinc-800">
        <Link
          href="/community/forum"
          className="rounded-xl px-5 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          ביטול
        </Link>
        <button
          type="submit"
          // Stays reachable while invalid: a disabled button leaves the tab
          // order with no way to find out what is missing. handleSubmit
          // reports the problem instead.
          disabled={loading}
          className="rounded-xl bg-gradient-to-l from-brand-500 to-brand-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg
                className="h-4 w-4 animate-spin"
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
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              מפרסם...
            </span>
          ) : (
            "פרסם פוסט"
          )}
        </button>
      </div>
    </form>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NewPostPage() {
  return (
    <div className="min-h-dvh bg-zinc-50 dark:bg-zinc-950" dir="rtl">
      <Header />

      <main className="container mx-auto px-4 py-10">
        <div className="mx-auto max-w-2xl">
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

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
              פוסט חדש
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              שתף שאלה, טיפ, או חוויה עם הקהילה
            </p>
          </motion.div>

          {/* Card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
          >
            <SignedIn>
              <NewPostForm />
            </SignedIn>

            <SignedOut>
              <div className="flex flex-col items-center py-10 text-center">
                <div className="mb-4 text-4xl" aria-hidden="true">
                  🔒
                </div>
                <h2 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-white">
                  יש להתחבר
                </h2>
                <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
                  כדי לפרסם בפורום נדרשת התחברות לחשבון
                </p>
                <SignInButton mode="modal">
                  <button className="rounded-xl bg-gradient-to-l from-brand-500 to-brand-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm hover:brightness-110">
                    התחברות
                  </button>
                </SignInButton>
              </div>
            </SignedOut>
          </motion.div>

          {/* Tips */}
          <SignedIn>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="mt-5 rounded-xl border border-zinc-100 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                טיפים לפוסט טוב
              </h3>
              <ul className="space-y-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                <li className="flex items-start gap-2">
                  <span aria-hidden="true">✓</span>
                  <span>כותרת ברורה ומסכמת את הנושא</span>
                </li>
                <li className="flex items-start gap-2">
                  <span aria-hidden="true">✓</span>
                  <span>הוסף פרטים רלוונטיים כדי לקבל תגובות טובות יותר</span>
                </li>
                <li className="flex items-start gap-2">
                  <span aria-hidden="true">✓</span>
                  <span>בחר קטגוריה מתאימה לנושא</span>
                </li>
                <li className="flex items-start gap-2">
                  <span aria-hidden="true">✓</span>
                  <span>כתוב בכבוד ואחווה לחברי הקהילה</span>
                </li>
              </ul>
            </motion.div>
          </SignedIn>
        </div>
      </main>

      <Footer />
    </div>
  );
}
