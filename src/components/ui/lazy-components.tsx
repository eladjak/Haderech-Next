"use client";
import dynamic from "next/dynamic";

// Lazy load heavy components
export const LazyVideoPlayer = dynamic(
  () =>
    import("@/components/lesson/video-player").then((m) => ({
      default: m.VideoPlayer,
    })),
  {
    loading: () => (
      <div className="animate-pulse bg-zinc-200 dark:bg-zinc-800 rounded-xl aspect-video" />
    ),
    ssr: false,
  }
);

export const LazyCourseReviews = dynamic(
  () =>
    import("@/components/reviews/course-reviews").then((m) => ({
      default: m.CourseReviews,
    })),
  {
    loading: () => (
      <div className="animate-pulse bg-zinc-200 dark:bg-zinc-800 rounded-xl h-64" />
    ),
  }
);

export const LazyXpProfile = dynamic(
  () =>
    import("@/components/gamification/xp-profile").then((m) => ({
      default: m.XpProfile,
    })),
  {
    loading: () => (
      <div className="animate-pulse bg-zinc-200 dark:bg-zinc-800 rounded-xl h-24" />
    ),
  }
);
