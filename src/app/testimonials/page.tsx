"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Header } from "@/components/layout/header";
import { StarRating } from "@/components/reviews/star-rating";
import { RatingDistribution } from "@/components/reviews/rating-distribution";

// ─── Video Testimonial Placeholder Cards ────────────────────────────────────

const VIDEO_PLACEHOLDERS = [
  {
    name: "אורי מ.",
    course: "אומנות הקשר",
    quote: "הקורס נתן לי את הביטחון שחיפשתי שנים. היום יש לי מערכת יחסים מדהימה.",
    emoji: "💬",
    bgColor: "from-brand-500/10 to-blue-500/10",
  },
  {
    name: "מיכל ב.",
    course: "מסע אל הלב",
    quote: "בזכות הכלים שלמדתי, אני מבינה עכשיו מה אני מחפשת בבן זוג.",
    emoji: "💬",
    bgColor: "from-emerald-500/10 to-brand-500/10",
  },
  {
    name: "דוד ש.",
    course: "בנין הקשר",
    quote: "מהפכה אמיתית בחיי הדייטינג. מומלץ לכל גבר שמחפש קשר אמיתי.",
    emoji: "💬",
    bgColor: "from-blue-500/10 to-purple-500/10",
  },
  {
    name: "שרה כ.",
    course: "אומנות הקשר",
    quote: "אחרי הקורס פגשתי את האיש של חיי. הכלים פשוט עובדים.",
    emoji: "💬",
    bgColor: "from-pink-500/10 to-brand-500/10",
  },
];

// ─── Star display helper ─────────────────────────────────────────────────────

function StarDisplay({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5" dir="ltr" aria-label={`${count} כוכבים מתוך 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          className={`h-5 w-5 ${i < count ? "text-[#D4A853]" : "text-zinc-200 dark:text-zinc-700"}`}
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
        </svg>
      ))}
    </div>
  );
}

// ─── Testimonials Page ───────────────────────────────────────────────────────

export default function TestimonialsPage() {
  const testimonials = useQuery(api.reviews.getFeaturedTestimonials, { limit: 12 });
  const globalStats = useQuery(api.reviews.getGlobalStats);

  // Compute distribution across all testimonials for global chart
  const distribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  if (testimonials) {
    for (const t of testimonials) {
      distribution[t.rating] = (distribution[t.rating] ?? 0) + 1;
    }
  }

  const isLoading = testimonials === undefined || globalStats === undefined;

  return (
    <div className="min-h-dvh bg-background">
      <Header />

      <main>
        {/* ═══════════════════════════════════════════════════════════════════
            HERO SECTION
        ═══════════════════════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-bl from-[#D4A853]/10 via-background to-brand-500/8" />
          <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
            <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-[#D4A853]/5 blur-3xl" />
            <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-brand-500/5 blur-3xl" />
          </div>

          <div className="relative container mx-auto px-4 py-20 text-center">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#D4A853]/10 px-4 py-2 text-sm font-medium text-[#B8912E]">
              <StarDisplay count={5} />
              <span>מה אומרים הסטודנטים שלנו</span>
            </div>

            <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-5xl dark:text-white">
              סיפורי הצלחה
              <br />
              <span className="bg-gradient-to-l from-brand-600 to-[#D4A853] bg-clip-text text-transparent">
                אמיתיים
              </span>
            </h1>

            <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
              אלפי גברים ונשים שינו את חיי הדייטינג שלהם עם הדרך. הנה מה שהם
              אומרים על החוויה שלהם.
            </p>

            {/* Global Stats */}
            {isLoading ? (
              <div className="mx-auto grid max-w-xl grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="animate-pulse rounded-2xl border border-zinc-100 bg-white/80 p-4 dark:border-zinc-800 dark:bg-zinc-900/80"
                  >
                    <div className="mx-auto mb-1.5 h-8 w-16 rounded bg-zinc-200 dark:bg-zinc-700" />
                    <div className="mx-auto h-3 w-20 rounded bg-zinc-200 dark:bg-zinc-700" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="mx-auto grid max-w-xl grid-cols-3 gap-4">
                <div className="rounded-2xl border border-zinc-100 bg-white/80 p-5 shadow-sm backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80">
                  <div className="text-3xl font-extrabold text-zinc-900 dark:text-white">
                    {globalStats.totalReviews}+
                  </div>
                  <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    ביקורות
                  </div>
                </div>
                <div className="rounded-2xl border border-zinc-100 bg-white/80 p-5 shadow-sm backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80">
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-3xl font-extrabold text-[#D4A853]">
                      {globalStats.averageRating}
                    </span>
                    <svg
                      className="h-6 w-6 text-[#D4A853]"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                    </svg>
                  </div>
                  <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    דירוג ממוצע
                  </div>
                </div>
                <div className="rounded-2xl border border-zinc-100 bg-white/80 p-5 shadow-sm backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80">
                  <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                    {globalStats.wouldRecommendPercent}%
                  </div>
                  <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    ממליצים
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            FEATURED REVIEWS GRID
        ═══════════════════════════════════════════════════════════════════ */}
        <section className="container mx-auto px-4 py-16">
          <h2 className="mb-10 text-center text-2xl font-bold text-zinc-900 dark:text-white">
            ביקורות נבחרות
          </h2>

          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2">
              {Array.from({ length: 6 }, (_, i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-2xl border border-zinc-100 bg-white p-7 dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div className="mb-4 h-5 w-28 rounded-full bg-zinc-200 dark:bg-zinc-700" />
                  <div className="mb-3 space-y-2">
                    <div className="h-4 w-full rounded bg-zinc-200 dark:bg-zinc-700" />
                    <div className="h-4 w-5/6 rounded bg-zinc-200 dark:bg-zinc-700" />
                    <div className="h-4 w-4/6 rounded bg-zinc-200 dark:bg-zinc-700" />
                  </div>
                  <div className="mt-5 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-zinc-200 dark:bg-zinc-700" />
                    <div>
                      <div className="mb-1 h-4 w-24 rounded bg-zinc-200 dark:bg-zinc-700" />
                      <div className="h-3 w-16 rounded bg-zinc-200 dark:bg-zinc-700" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : testimonials && testimonials.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2">
              {testimonials.map((review) => {
                const initials = review.userName
                  .split(" ")
                  .map((n) => n.charAt(0))
                  .join("")
                  .slice(0, 2);

                return (
                  <article
                    key={review._id}
                    className="group relative flex flex-col rounded-2xl border border-zinc-100 bg-white p-7 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/80"
                  >
                    {/* Stars */}
                    <div className="mb-4">
                      <StarDisplay count={review.rating} />
                    </div>

                    {/* Quote */}
                    <blockquote className="mb-6 flex-1 text-base leading-relaxed text-zinc-700 dark:text-zinc-300">
                      <span className="mr-1 text-2xl leading-none text-[#D4A853]">"</span>
                      {review.content}
                      <span className="ml-1 text-2xl leading-none text-[#D4A853]">"</span>
                    </blockquote>

                    {/* Footer */}
                    <footer>
                      {/* Would recommend + course badge */}
                      <div className="mb-4 flex flex-wrap gap-2">
                        {review.wouldRecommend === true && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                            <svg
                              className="h-3.5 w-3.5"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                              aria-hidden="true"
                            >
                              <path
                                fillRule="evenodd"
                                d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                                clipRule="evenodd"
                              />
                            </svg>
                            ממליץ
                          </span>
                        )}
                        {review.courseTitle && (
                          <Link
                            href={`/courses/${review.courseId}`}
                            className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700 transition-colors hover:bg-brand-100 dark:bg-brand-900/20 dark:text-brand-300 dark:hover:bg-brand-900/30"
                          >
                            {review.courseTitle}
                          </Link>
                        )}
                      </div>

                      {/* Author */}
                      <div className="flex items-center gap-3">
                        {review.userImage ? (
                          <img
                            src={review.userImage}
                            alt=""
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-sm font-bold text-white">
                            {initials}
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-semibold text-zinc-900 dark:text-white">
                            {review.userName}
                          </div>
                          <div className="text-xs text-zinc-400 dark:text-zinc-500">
                            {new Intl.DateTimeFormat("he-IL", {
                              year: "numeric",
                              month: "long",
                            }).format(new Date(review.createdAt))}
                          </div>
                        </div>
                      </div>
                    </footer>
                  </article>
                );
              })}
            </div>
          ) : (
            /* No reviews yet */
            <div className="rounded-2xl border border-dashed border-zinc-200 p-16 text-center dark:border-zinc-700">
              <p className="text-zinc-500 dark:text-zinc-400">
                עדיין אין ביקורות. היה הראשון!
              </p>
              <Link
                href="/courses"
                className="mt-4 inline-flex h-10 items-center rounded-full bg-brand-500 px-6 text-sm font-medium text-white transition-colors hover:bg-brand-600"
              >
                עבור לקורסים
              </Link>
            </div>
          )}
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            RATING STATS SECTION
        ═══════════════════════════════════════════════════════════════════ */}
        {globalStats && globalStats.totalReviews > 0 && (
          <section className="border-y border-zinc-100 bg-zinc-50 py-16 dark:border-zinc-800 dark:bg-zinc-900/50">
            <div className="container mx-auto px-4">
              <div className="mx-auto max-w-3xl">
                <h2 className="mb-10 text-center text-2xl font-bold text-zinc-900 dark:text-white">
                  נתוני שביעות רצון
                </h2>

                <div className="grid gap-8 sm:grid-cols-2">
                  {/* Overall rating summary */}
                  <div className="flex flex-col items-center justify-center rounded-2xl border border-zinc-100 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900">
                    <div className="mb-2 text-7xl font-extrabold text-zinc-900 dark:text-white">
                      {globalStats.averageRating}
                    </div>
                    <StarRating rating={Math.round(globalStats.averageRating)} size="lg" />
                    <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
                      מבוסס על {globalStats.totalReviews} ביקורות
                    </p>
                    {globalStats.wouldRecommendPercent > 0 && (
                      <div className="mt-4 rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                        {globalStats.wouldRecommendPercent}% ממליצים לחברים
                      </div>
                    )}
                  </div>

                  {/* Distribution */}
                  <div className="rounded-2xl border border-zinc-100 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900">
                    <h3 className="mb-4 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                      התפלגות דירוגים
                    </h3>
                    <RatingDistribution
                      distribution={distribution}
                      total={testimonials?.length ?? 0}
                      average={globalStats.averageRating}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            VIDEO TESTIMONIALS (PLACEHOLDER)
        ═══════════════════════════════════════════════════════════════════ */}
        <section className="container mx-auto px-4 py-16">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
              סיפורי הצלחה
            </h2>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              עדויות וידאו מסטודנטים שסיימו את התוכנית
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VIDEO_PLACEHOLDERS.map((item, i) => (
              <div
                key={i}
                className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${item.bgColor} border border-zinc-100 p-6 dark:border-zinc-800`}
              >
                {/* Play button placeholder */}
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/80 shadow-sm backdrop-blur-sm dark:bg-zinc-900/80">
                  <svg
                    className="h-6 w-6 translate-x-0.5 text-brand-500"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M8 5.14v14l11-7-11-7z" />
                  </svg>
                </div>

                {/* Quote */}
                <blockquote className="mb-4 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                  "{item.quote}"
                </blockquote>

                {/* Author info */}
                <div className="mt-auto">
                  <div className="text-sm font-semibold text-zinc-900 dark:text-white">
                    {item.name}
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">
                    {item.course}
                  </div>
                </div>

                {/* Coming soon badge */}
                <div className="absolute top-4 left-4 rounded-full bg-white/80 px-2 py-0.5 text-xs font-medium text-zinc-500 backdrop-blur-sm dark:bg-zinc-900/80">
                  בקרוב
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            CTA SECTION
        ═══════════════════════════════════════════════════════════════════ */}
        <section className="border-t border-zinc-100 bg-white py-16 text-center dark:border-zinc-800 dark:bg-zinc-950">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl">
              <div className="mb-4 flex justify-center">
                <StarDisplay count={5} />
              </div>
              <h2 className="mb-4 text-3xl font-extrabold text-zinc-900 dark:text-white">
                הצטרף לאלפי הסטודנטים המרוצים
              </h2>
              <p className="mb-8 text-base text-zinc-600 dark:text-zinc-400">
                התחל את המסע שלך לקשרים עמוקים ומשמעותיים יותר. הקורסים
                שלנו זמינים לצפייה מיידית.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  href="/courses"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-l from-brand-500 to-brand-600 px-8 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition-all hover:shadow-xl hover:shadow-brand-500/30"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342"
                    />
                  </svg>
                  עיין בקורסים
                </Link>
                <Link
                  href="/sign-up"
                  className="inline-flex h-12 items-center justify-center rounded-full border border-zinc-200 px-8 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
                >
                  הרשם חינם
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
