"use client";

import { useParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useState, useCallback, useMemo } from "react";
import { api } from "@/../convex/_generated/api";
import { Header } from "@/components/layout/header";
import { ProgressBar } from "@/components/ui/progress-bar";
import { LessonCompleteButton } from "@/components/course/lesson-complete-button";
import type { Id } from "@/../convex/_generated/dataModel";

// Simple markdown renderer - handles common markdown syntax
function renderMarkdown(content: string): string {
  let html = content;

  // Headings
  html = html.replace(/^### (.+)$/gm, '<h3 class="mb-3 mt-6 text-lg font-semibold text-zinc-900 dark:text-white">$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2 class="mb-4 mt-8 text-xl font-bold text-zinc-900 dark:text-white">$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1 class="mb-4 mt-8 text-2xl font-bold text-zinc-900 dark:text-white">$1</h1>');

  // Bold and italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-zinc-900 dark:text-white">$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em class="italic">$1</em>');

  // Code blocks
  html = html.replace(
    /```(\w*)\n([\s\S]*?)```/g,
    '<pre class="my-4 overflow-x-auto rounded-xl bg-zinc-100 p-4 text-sm dark:bg-zinc-800"><code>$2</code></pre>'
  );

  // Inline code
  html = html.replace(
    /`([^`]+)`/g,
    '<code class="rounded bg-zinc-100 px-1.5 py-0.5 text-sm font-mono dark:bg-zinc-800">$1</code>'
  );

  // Blockquotes
  html = html.replace(
    /^> (.+)$/gm,
    '<blockquote class="my-3 border-r-4 border-zinc-300 pr-4 text-zinc-600 dark:border-zinc-600 dark:text-zinc-400">$1</blockquote>'
  );

  // Unordered lists
  html = html.replace(
    /^[*-] (.+)$/gm,
    '<li class="mr-4 mb-1 text-zinc-700 dark:text-zinc-300">$1</li>'
  );

  // Ordered lists
  html = html.replace(
    /^\d+\. (.+)$/gm,
    '<li class="mr-4 mb-1 text-zinc-700 dark:text-zinc-300">$1</li>'
  );

  // Horizontal rule
  html = html.replace(
    /^---$/gm,
    '<hr class="my-6 border-zinc-200 dark:border-zinc-700" />'
  );

  // Links
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="font-medium text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">$1</a>'
  );

  // Paragraphs (wrap remaining lines)
  html = html.replace(
    /^(?!<[hblpua]|<hr|<pre|<code|<li|<block)(.+)$/gm,
    '<p class="mb-3 leading-relaxed text-zinc-700 dark:text-zinc-300">$1</p>'
  );

  // Empty lines
  html = html.replace(/\n\n/g, "\n");

  return html;
}

// YouTube URL parser
function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export default function LessonPage() {
  const params = useParams<{ id: string; lessonId: string }>();
  const courseId = params.id as Id<"courses">;
  const lessonId = params.lessonId as Id<"lessons">;
  const { user: clerkUser } = useUser();
  const [markingComplete, setMarkingComplete] = useState(false);

  // Queries
  const course = useQuery(api.courses.getWithLessons, { id: courseId });
  const lesson = useQuery(api.lessons.getById, { id: lessonId });

  const convexUser = useQuery(
    api.users.getByClerkId,
    clerkUser?.id ? { clerkId: clerkUser.id } : "skip"
  );

  const courseProgress = useQuery(
    api.progress.getForCourse,
    convexUser?._id ? { userId: convexUser._id, courseId } : "skip"
  );

  const lessonProgress = useQuery(
    api.progress.getForLesson,
    convexUser?._id ? { userId: convexUser._id, lessonId } : "skip"
  );

  // Mutations
  const markComplete = useMutation(api.progress.markComplete);

  // Derived data
  const publishedLessons = useMemo(() => {
    if (!course) return [];
    return course.lessons.filter((l) => l.published);
  }, [course]);

  const currentIndex = useMemo(
    () => publishedLessons.findIndex((l) => l._id === lessonId),
    [publishedLessons, lessonId]
  );

  const prevLesson =
    currentIndex > 0 ? publishedLessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < publishedLessons.length - 1
      ? publishedLessons[currentIndex + 1]
      : null;

  const completedCount = useMemo(
    () => (courseProgress ?? []).filter((p) => p.completed).length,
    [courseProgress]
  );

  const completionPercent =
    publishedLessons.length > 0
      ? Math.round((completedCount / publishedLessons.length) * 100)
      : 0;

  const isCurrentLessonComplete = lessonProgress?.completed === true;

  const handleMarkComplete = useCallback(async () => {
    if (!convexUser?._id || markingComplete) return;
    setMarkingComplete(true);
    await markComplete({
      userId: convexUser._id,
      lessonId,
      courseId,
    });
    setMarkingComplete(false);
  }, [convexUser, lessonId, courseId, markComplete, markingComplete]);

  // Loading
  if (course === undefined || lesson === undefined) {
    return (
      <div className="min-h-dvh bg-white dark:bg-zinc-950">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <div className="mx-auto max-w-3xl">
            <div className="mb-4 h-4 w-32 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
            <div className="mb-6 h-8 w-96 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800" />
            <div className="mb-8 aspect-video animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-800" />
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-4 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800"
                  style={{ width: `${100 - i * 15}%` }}
                />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Not found
  if (course === null || lesson === null) {
    return (
      <div className="min-h-dvh bg-white dark:bg-zinc-950">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-4 text-2xl font-bold text-zinc-900 dark:text-white">
              {lesson === null ? "השיעור לא נמצא" : "הקורס לא נמצא"}
            </h1>
            <p className="mb-6 text-zinc-600 dark:text-zinc-400">
              התוכן שחיפשת לא קיים או שהוסר.
            </p>
            <Link
              href="/courses"
              className="inline-flex h-10 items-center rounded-full bg-zinc-900 px-6 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
            >
              חזרה לקורסים
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // Parse video
  const youtubeId = lesson.videoUrl
    ? extractYouTubeId(lesson.videoUrl)
    : null;
  const isYouTube = youtubeId !== null;
  const isDirectVideo =
    lesson.videoUrl && !isYouTube;

  // Render markdown content
  const renderedContent = lesson.content
    ? renderMarkdown(lesson.content)
    : null;

  return (
    <div className="min-h-dvh bg-white dark:bg-zinc-950">
      <Header />

      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="mx-auto max-w-3xl">
          {/* Breadcrumb */}
          <nav
            className="mb-6 text-sm text-zinc-500 dark:text-zinc-400"
            aria-label="ניווט"
          >
            <Link
              href="/courses"
              className="hover:text-zinc-900 dark:hover:text-white"
            >
              קורסים
            </Link>
            <span className="mx-2">/</span>
            <Link
              href={`/courses/${courseId}`}
              className="hover:text-zinc-900 dark:hover:text-white"
            >
              {course.title}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-zinc-900 dark:text-white">
              {lesson.title}
            </span>
          </nav>

          {/* Course progress bar */}
          {convexUser && completionPercent > 0 && (
            <div className="mb-6 rounded-xl bg-zinc-50 p-4 dark:bg-zinc-900">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-zinc-600 dark:text-zinc-400">
                  התקדמות בקורס
                </span>
                <span className="font-medium text-zinc-900 dark:text-white">
                  {completedCount}/{publishedLessons.length} שיעורים (
                  {completionPercent}%)
                </span>
              </div>
              <ProgressBar value={completionPercent} size="sm" />
            </div>
          )}

          {/* Lesson header */}
          <div className="mb-2 text-sm text-zinc-500 dark:text-zinc-400">
            שיעור {currentIndex + 1} מתוך {publishedLessons.length}
          </div>
          <h1 className="mb-6 text-2xl font-bold text-zinc-900 md:text-3xl dark:text-white">
            {lesson.title}
          </h1>

          {/* Video player */}
          {isYouTube && (
            <div className="mb-8 aspect-video overflow-hidden rounded-2xl bg-zinc-900">
              <iframe
                src={`https://www.youtube.com/embed/${youtubeId}?rel=0`}
                title={lesson.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
          )}

          {isDirectVideo && (
            <div className="mb-8 aspect-video overflow-hidden rounded-2xl bg-zinc-900">
              <video
                src={lesson.videoUrl}
                controls
                className="h-full w-full"
                playsInline
              >
                <track kind="captions" />
                הדפדפן שלך לא תומך בוידאו.
              </video>
            </div>
          )}

          {!lesson.videoUrl && (
            <div className="mb-8 flex aspect-video items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-900">
              <div className="text-center">
                <svg
                  className="mx-auto mb-2 h-12 w-12 text-zinc-300 dark:text-zinc-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z"
                  />
                </svg>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  וידאו עדיין לא הועלה
                </p>
              </div>
            </div>
          )}

          {/* Mark as completed */}
          {convexUser && (
            <div className="mb-8">
              <LessonCompleteButton
                isCompleted={isCurrentLessonComplete}
                onMarkComplete={handleMarkComplete}
              />
            </div>
          )}

          {/* Lesson content (markdown) */}
          {renderedContent ? (
            <article
              className="prose-custom mb-8"
              dangerouslySetInnerHTML={{ __html: renderedContent }}
            />
          ) : lesson.content ? (
            <div className="prose prose-zinc dark:prose-invert mb-8 max-w-none">
              <div className="whitespace-pre-wrap leading-relaxed text-zinc-700 dark:text-zinc-300">
                {lesson.content}
              </div>
            </div>
          ) : (
            <div className="mb-8 rounded-2xl bg-zinc-50 p-8 text-center dark:bg-zinc-900">
              <p className="text-zinc-500 dark:text-zinc-400">
                תוכן השיעור יתווסף בקרוב.
              </p>
            </div>
          )}

          {/* Lesson duration */}
          {lesson.duration && lesson.duration > 0 && (
            <div className="mb-8 text-sm text-zinc-500 dark:text-zinc-400">
              <span>
                משך השיעור:{" "}
                {lesson.duration >= 60
                  ? `${Math.floor(lesson.duration / 60)} דקות`
                  : `${lesson.duration} שניות`}
              </span>
            </div>
          )}

          {/* Navigation: prev/next lesson */}
          <nav
            className="flex items-center justify-between border-t border-zinc-200 pt-6 dark:border-zinc-800"
            aria-label="ניווט בין שיעורים"
          >
            {prevLesson ? (
              <Link
                href={`/course/${courseId}/lesson/${prevLesson._id}`}
                className="group flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900"
              >
                <svg
                  className="h-5 w-5 text-zinc-400 transition-colors group-hover:text-zinc-900 dark:group-hover:text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                  />
                </svg>
                <div className="text-right">
                  <p className="text-xs text-zinc-400 dark:text-zinc-500">
                    שיעור קודם
                  </p>
                  <p className="max-w-[200px] truncate text-sm font-medium text-zinc-700 transition-colors group-hover:text-zinc-900 dark:text-zinc-300 dark:group-hover:text-white">
                    {prevLesson.title}
                  </p>
                </div>
              </Link>
            ) : (
              <div />
            )}

            {nextLesson ? (
              <Link
                href={`/course/${courseId}/lesson/${nextLesson._id}`}
                className="group flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900"
              >
                <div className="text-left">
                  <p className="text-xs text-zinc-400 dark:text-zinc-500">
                    שיעור הבא
                  </p>
                  <p className="max-w-[200px] truncate text-sm font-medium text-zinc-700 transition-colors group-hover:text-zinc-900 dark:text-zinc-300 dark:group-hover:text-white">
                    {nextLesson.title}
                  </p>
                </div>
                <svg
                  className="h-5 w-5 text-zinc-400 transition-colors group-hover:text-zinc-900 dark:group-hover:text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                  />
                </svg>
              </Link>
            ) : (
              <Link
                href={`/courses/${courseId}`}
                className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-800 transition-colors hover:bg-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/30"
              >
                סיימת! חזרה לדף הקורס
              </Link>
            )}
          </nav>

          {/* Lesson list (collapsible) */}
          <LessonList
            courseId={courseId}
            lessonId={lessonId}
            lessons={publishedLessons}
            courseProgress={courseProgress}
          />
        </div>
      </main>
    </div>
  );
}

function LessonList({
  courseId,
  lessonId,
  lessons,
  courseProgress,
}: {
  courseId: Id<"courses">;
  lessonId: Id<"lessons">;
  lessons: Array<{
    _id: Id<"lessons">;
    title: string;
    duration?: number;
    published: boolean;
  }>;
  courseProgress:
    | Array<{
        lessonId: Id<"lessons">;
        completed: boolean;
        progressPercent: number;
      }>
    | undefined
    | null;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const progressMap = new Map(
    (courseProgress ?? []).map((p) => [p.lessonId, p])
  );

  return (
    <div className="mt-8 rounded-2xl border border-zinc-200 dark:border-zinc-800">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between p-4 text-right"
        aria-expanded={isOpen}
      >
        <span className="text-sm font-semibold text-zinc-900 dark:text-white">
          כל השיעורים ({lessons.length})
        </span>
        <svg
          className={`h-5 w-5 text-zinc-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 8.25l-7.5 7.5-7.5-7.5"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="border-t border-zinc-200 p-2 dark:border-zinc-800">
          {lessons.map((l, index) => {
            const isActive = l._id === lessonId;
            const lProgress = progressMap.get(l._id);
            const isComplete = lProgress?.completed === true;

            return (
              <Link
                key={l._id}
                href={`/course/${courseId}/lesson/${l._id}`}
                aria-current={isActive ? "page" : undefined}
                className={`mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  isActive
                    ? "bg-zinc-200 font-medium text-zinc-900 dark:bg-zinc-800 dark:text-white"
                    : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                }`}
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium ${
                    isComplete
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                      : "bg-zinc-300 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  {isComplete ? (
                    <svg
                      className="h-3.5 w-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      aria-label="הושלם"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 12.75l6 6 9-13.5"
                      />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </span>
                <span className="truncate">{l.title}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
