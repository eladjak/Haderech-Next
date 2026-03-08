"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/../convex/_generated/api";
import { Header } from "@/components/layout/header";
import { SocialShare } from "@/components/social-share";
import { siteConfig } from "@/lib/site-config";

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_OPTIONS = [
  { value: "all", label: "הכל" },
  { value: "dating", label: "דייטינג" },
  { value: "relationship", label: "זוגיות" },
  { value: "self-growth", label: "צמיחה אישית" },
  { value: "marriage", label: "נישואין" },
] as const;

const CATEGORY_LABELS: Record<string, string> = {
  dating: "דייטינג",
  relationship: "זוגיות",
  "self-growth": "צמיחה אישית",
  marriage: "נישואין",
};

type StoryCategory = "dating" | "relationship" | "self-growth" | "marriage";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return "עכשיו";
  if (minutes < 60) return `לפני ${minutes} דקות`;
  if (hours < 24) return `לפני ${hours} שעות`;
  if (days < 30) return `לפני ${days} ימים`;
  return `לפני ${Math.floor(days / 30)} חודשים`;
}

function StarRating({
  rating,
  interactive,
  onRate,
}: {
  rating: number;
  interactive?: boolean;
  onRate?: (value: number) => void;
}) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex items-center gap-0.5" dir="ltr">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= (hovered || rating);
        return (
          <button
            key={star}
            type={interactive ? "button" : undefined}
            disabled={!interactive}
            onClick={() => onRate?.(star)}
            onMouseEnter={() => interactive && setHovered(star)}
            onMouseLeave={() => interactive && setHovered(0)}
            className={`${interactive ? "cursor-pointer" : "cursor-default"} text-lg`}
            aria-label={`${star} כוכבים`}
          >
            <svg
              className={`h-5 w-5 ${
                isFilled
                  ? "text-amber-400"
                  : "text-zinc-300 dark:text-zinc-600"
              }`}
              fill={isFilled ? "currentColor" : "none"}
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
              />
            </svg>
          </button>
        );
      })}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function StoriesPage() {
  const { user: clerkUser } = useUser();
  const stories = useQuery(api.stories.listApproved);
  const userStory = useQuery(api.stories.getUserStory);
  const submitStory = useMutation(api.stories.submitStory);

  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [expandedStory, setExpandedStory] = useState<string | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formStory, setFormStory] = useState("");
  const [formRating, setFormRating] = useState(0);
  const [formCategory, setFormCategory] = useState<StoryCategory>("dating");
  const [formAnonymous, setFormAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const filteredStories =
    stories?.filter(
      (s) => activeCategory === "all" || s.category === activeCategory
    ) ?? [];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError("");

    if (formRating === 0) {
      setSubmitError("נא לבחור דירוג");
      return;
    }

    setSubmitting(true);
    try {
      await submitStory({
        name: formName,
        story: formStory,
        rating: formRating,
        isAnonymous: formAnonymous,
        category: formCategory,
      });
      setSubmitSuccess(true);
      setFormName("");
      setFormStory("");
      setFormRating(0);
      setFormCategory("dating");
      setFormAnonymous(false);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "שגיאה בשליחת הסיפור"
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-dvh bg-white dark:bg-zinc-950">
      <Header />

      <main className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-4xl">
          {/* Hero */}
          <div className="mb-10 text-center">
            <h1 className="mb-3 text-3xl font-bold text-zinc-900 dark:text-white md:text-4xl">
              סיפורי הצלחה
            </h1>
            <p className="text-lg text-zinc-600 dark:text-zinc-400">
              הסיפורים של התלמידים שלנו מספרים את הכל
            </p>

            {/* Social Share */}
            <div className="mt-4 flex justify-center">
              <SocialShare
                url={`${siteConfig.url}/stories`}
                title="סיפורי הצלחה - הדרך: אומנות הקשר"
                description="קראו סיפורי הצלחה מתלמידים שעברו את הקורסים שלנו"
              />
            </div>
          </div>

          {/* Category Filter Tabs */}
          <div className="mb-8 flex flex-wrap justify-center gap-2">
            {CATEGORY_OPTIONS.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setActiveCategory(cat.value)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  activeCategory === cat.value
                    ? "bg-[#E85D75] text-white"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Stories Grid */}
          {stories === undefined ? (
            <div className="grid gap-6 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-48 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-800"
                />
              ))}
            </div>
          ) : filteredStories.length === 0 ? (
            <div className="rounded-2xl bg-zinc-50 p-12 text-center dark:bg-zinc-900">
              <p className="text-zinc-500 dark:text-zinc-400">
                {activeCategory === "all"
                  ? "עדיין אין סיפורי הצלחה"
                  : "אין סיפורים בקטגוריה זו"}
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {filteredStories.map((story) => {
                const isExpanded = expandedStory === story._id;
                const isLong = story.story.length > 150;

                return (
                  <article
                    key={story._id}
                    className="relative rounded-2xl border border-zinc-200 bg-white p-6 transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    {/* Quote icon */}
                    <div className="mb-3">
                      <svg
                        className="h-8 w-8 text-[#E85D75]/20"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                      </svg>
                    </div>

                    {/* Story text */}
                    <p className="mb-4 leading-relaxed text-zinc-700 dark:text-zinc-300">
                      {isLong && !isExpanded
                        ? `${story.story.slice(0, 150)}...`
                        : story.story}
                    </p>
                    {isLong && (
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedStory(isExpanded ? null : story._id)
                        }
                        className="mb-4 text-sm font-medium text-[#E85D75] hover:underline"
                      >
                        {isExpanded ? "הצג פחות" : "קרא עוד"}
                      </button>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                          {story.isAnonymous ? "אנונימי" : story.name}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="inline-flex items-center rounded-full bg-[#E85D75]/10 px-2 py-0.5 text-xs font-medium text-[#E85D75]">
                            {CATEGORY_LABELS[story.category] ?? story.category}
                          </span>
                          <span className="text-xs text-zinc-400 dark:text-zinc-500">
                            {formatRelativeTime(story.createdAt)}
                          </span>
                        </div>
                      </div>
                      <StarRating rating={story.rating} />
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* Submit Story Form */}
          {clerkUser && (
            <section className="mt-16" aria-labelledby="submit-story-heading">
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 md:p-8">
                <h2
                  id="submit-story-heading"
                  className="mb-2 text-xl font-bold text-zinc-900 dark:text-white"
                >
                  שתף/י את הסיפור שלך
                </h2>
                <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
                  הסיפור שלך יישלח לאישור לפני פרסום
                </p>

                {submitSuccess ? (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center dark:border-emerald-800 dark:bg-emerald-900/20">
                    <svg
                      className="mx-auto mb-3 h-10 w-10 text-emerald-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="font-semibold text-emerald-800 dark:text-emerald-300">
                      הסיפור נשלח בהצלחה!
                    </p>
                    <p className="mt-1 text-sm text-emerald-600 dark:text-emerald-400">
                      הסיפור שלך ייבדק ויפורסם בקרוב.
                    </p>
                  </div>
                ) : userStory ? (
                  <div className="rounded-xl border border-blue-200 bg-blue-50 p-6 text-center dark:border-blue-800 dark:bg-blue-900/20">
                    <p className="font-semibold text-blue-800 dark:text-blue-300">
                      כבר שלחת סיפור
                    </p>
                    <p className="mt-1 text-sm text-blue-600 dark:text-blue-400">
                      {userStory.approved
                        ? "הסיפור שלך אושר ומוצג באתר."
                        : "הסיפור שלך ממתין לאישור."}
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Name */}
                    <div>
                      <label
                        htmlFor="story-name"
                        className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                      >
                        שם
                      </label>
                      <input
                        id="story-name"
                        type="text"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        required
                        maxLength={100}
                        placeholder="השם שלך (למשל: דני, 34)"
                        className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none transition-colors focus:border-[#E85D75] focus:ring-2 focus:ring-[#E85D75]/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                      />
                    </div>

                    {/* Category */}
                    <div>
                      <label
                        htmlFor="story-category"
                        className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                      >
                        קטגוריה
                      </label>
                      <select
                        id="story-category"
                        value={formCategory}
                        onChange={(e) =>
                          setFormCategory(e.target.value as StoryCategory)
                        }
                        className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none transition-colors focus:border-[#E85D75] focus:ring-2 focus:ring-[#E85D75]/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                      >
                        <option value="dating">דייטינג</option>
                        <option value="relationship">זוגיות</option>
                        <option value="self-growth">צמיחה אישית</option>
                        <option value="marriage">נישואין</option>
                      </select>
                    </div>

                    {/* Story */}
                    <div>
                      <label
                        htmlFor="story-text"
                        className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                      >
                        הסיפור שלך
                      </label>
                      <textarea
                        id="story-text"
                        value={formStory}
                        onChange={(e) => setFormStory(e.target.value)}
                        required
                        maxLength={2000}
                        rows={5}
                        placeholder="ספר/י על החוויה שלך עם הדרך..."
                        className="w-full resize-y rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none transition-colors focus:border-[#E85D75] focus:ring-2 focus:ring-[#E85D75]/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                      />
                      <p className="mt-1 text-xs text-zinc-400">
                        {formStory.length}/2000
                      </p>
                    </div>

                    {/* Rating */}
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        דירוג
                      </label>
                      <StarRating
                        rating={formRating}
                        interactive
                        onRate={setFormRating}
                      />
                    </div>

                    {/* Anonymous */}
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formAnonymous}
                        onChange={(e) => setFormAnonymous(e.target.checked)}
                        className="h-4 w-4 rounded border-zinc-300 text-[#E85D75] focus:ring-[#E85D75]/20 dark:border-zinc-600"
                      />
                      <span className="text-sm text-zinc-700 dark:text-zinc-300">
                        פרסום אנונימי
                      </span>
                    </label>

                    {/* Error */}
                    {submitError && (
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {submitError}
                      </p>
                    )}

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex h-11 items-center justify-center rounded-full bg-[#E85D75] px-8 text-sm font-medium text-white transition-colors hover:bg-[#d64d65] disabled:opacity-50"
                    >
                      {submitting ? "שולח..." : "שלח סיפור"}
                    </button>
                  </form>
                )}
              </div>
            </section>
          )}

          {/* Not logged in CTA */}
          {!clerkUser && (
            <div className="mt-16 rounded-2xl bg-zinc-50 p-8 text-center dark:bg-zinc-900">
              <p className="mb-3 text-zinc-600 dark:text-zinc-400">
                רוצה לשתף את הסיפור שלך? התחבר כדי לשלוח סיפור הצלחה.
              </p>
              <a
                href="/sign-in"
                className="inline-flex h-10 items-center rounded-full bg-[#E85D75] px-6 text-sm font-medium text-white transition-colors hover:bg-[#d64d65]"
              >
                התחברות
              </a>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
