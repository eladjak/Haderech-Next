"use client";

import { useParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useState, useCallback } from "react";
import { api } from "@/../convex/_generated/api";
import { Header } from "@/components/layout/header";
import { VideoPlayer } from "@/components/lesson/video-player";
import { LessonCompleteButton } from "@/components/course/lesson-complete-button";
import { LessonNotes } from "@/components/lesson/lesson-notes";
import { CommentsSection } from "@/components/lesson/comments-section";
import { LessonNav } from "@/components/course/lesson-nav";
import { QuizPlayer } from "@/components/quiz/quiz-player";
import type { Id } from "@/../convex/_generated/dataModel";

export default function LessonPlayerPage() {
  const params = useParams<{ courseId: string; lessonId: string }>();
  const courseId = params.courseId as Id<"courses">;
  const lessonId = params.lessonId as Id<"lessons">;
  const { user: clerkUser } = useUser();
  const [showNotes, setShowNotes] = useState(false);

  // Course and lessons
  const courseWithLessons = useQuery(api.courses.getWithLessons, {
    id: courseId,
  });

  // Current lesson
  const lesson = useQuery(api.lessons.getById, { id: lessonId });

  // User from Convex
  const convexUser = useQuery(
    api.users.getByClerkId,
    clerkUser?.id ? { clerkId: clerkUser.id } : "skip"
  );

  // Enrollment
  const isEnrolled = useQuery(
    api.enrollments.isEnrolled,
    convexUser?._id ? { userId: convexUser._id, courseId } : "skip"
  );

  // Course progress
  const courseProgress = useQuery(
    api.progress.getForCourse,
    convexUser?._id ? { userId: convexUser._id, courseId } : "skip"
  );

  // Lesson progress for video resume
  const lessonProgress = useQuery(
    api.progress.getLessonProgress,
    { lessonId }
  );

  // Quiz
  const quiz = useQuery(api.quizzes.getByLesson, { lessonId });
  const quizQuestions = useQuery(
    api.quizzes.getQuestions,
    quiz?._id ? { quizId: quiz._id } : "skip"
  );
  const lastQuizAttempt = useQuery(
    api.quizzes.getLastAttempt,
    quiz?._id && convexUser?._id
      ? { userId: convexUser._id, quizId: quiz._id }
      : "skip"
  );

  // Mutations
  const markComplete = useMutation(api.progress.markComplete);
  const submitQuizAttempt = useMutation(api.quizzes.submitAttempt);

  // Loading state
  if (courseWithLessons === undefined || lesson === undefined) {
    return (
      <div className="min-h-dvh bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="mx-auto max-w-4xl">
            {/* Breadcrumb skeleton */}
            <div className="mb-6 h-4 w-64 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            {/* Title skeleton */}
            <div className="mb-4 h-8 w-3/4 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
            {/* Video placeholder skeleton */}
            <div className="mb-8 aspect-video animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
            {/* Content skeleton */}
            <div className="space-y-3">
              <div className="h-4 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-4 w-4/6 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Not found states
  if (courseWithLessons === null || lesson === null) {
    return (
      <div className="min-h-dvh bg-background">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
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
            <h1 className="mb-4 text-2xl font-bold text-zinc-900 dark:text-white">
              {lesson === null ? "השיעור לא נמצא" : "הקורס לא נמצא"}
            </h1>
            <p className="mb-6 text-zinc-600 dark:text-zinc-400">
              הדף שחיפשת לא קיים או שהוסר.
            </p>
            <Link
              href={`/courses/${courseId}`}
              className="inline-flex h-10 items-center rounded-full bg-brand-500 px-6 text-sm font-medium text-white transition-colors hover:bg-brand-600"
            >
              חזרה לדף הקורס
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const { lessons, ...course } = courseWithLessons;
  const publishedLessons = lessons.filter((l) => l.published);

  // Navigation
  const currentIndex = publishedLessons.findIndex((l) => l._id === lessonId);
  const prevLesson =
    currentIndex > 0 ? publishedLessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < publishedLessons.length - 1
      ? publishedLessons[currentIndex + 1]
      : null;

  // Progress
  const progressMap = new Map(
    (courseProgress ?? []).map((p) => [p.lessonId, p])
  );
  const isCurrentLessonComplete =
    progressMap.get(lessonId)?.completed === true;

  const handleMarkComplete = useCallback(async () => {
    if (!convexUser?._id) return;
    await markComplete({
      userId: convexUser._id,
      lessonId,
      courseId,
    });
  }, [convexUser?._id, markComplete, lessonId, courseId]);

  const handleSubmitQuiz = useCallback(
    async (answers: number[]) => {
      if (!convexUser?._id || !quiz?._id) {
        throw new Error("Missing data for quiz submission");
      }
      return await submitQuizAttempt({
        userId: convexUser._id,
        quizId: quiz._id,
        lessonId,
        courseId,
        answers,
      });
    },
    [convexUser?._id, quiz?._id, submitQuizAttempt, lessonId, courseId]
  );

  // Render markdown-like content
  const renderContent = (content: string) => {
    const lines = content.split("\n");
    const elements: React.ReactNode[] = [];
    let inList = false;
    let listItems: string[] = [];

    const flushList = () => {
      if (listItems.length > 0) {
        elements.push(
          <ul
            key={`list-${elements.length}`}
            className="my-4 list-inside list-disc space-y-2 text-zinc-700 dark:text-zinc-300"
          >
            {listItems.map((item, idx) => (
              <li key={idx} className="leading-relaxed">
                {item}
              </li>
            ))}
          </ul>
        );
        listItems = [];
      }
      inList = false;
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Headers
      if (trimmed.startsWith("### ")) {
        flushList();
        elements.push(
          <h3
            key={i}
            className="mb-3 mt-8 text-lg font-bold text-zinc-900 dark:text-white"
          >
            {trimmed.slice(4)}
          </h3>
        );
        continue;
      }
      if (trimmed.startsWith("## ")) {
        flushList();
        elements.push(
          <h2
            key={i}
            className="mb-4 mt-10 text-xl font-bold text-zinc-900 dark:text-white"
          >
            {trimmed.slice(3)}
          </h2>
        );
        continue;
      }
      if (trimmed.startsWith("# ")) {
        flushList();
        elements.push(
          <h1
            key={i}
            className="mb-4 mt-10 text-2xl font-bold text-zinc-900 dark:text-white"
          >
            {trimmed.slice(2)}
          </h1>
        );
        continue;
      }

      // List items
      if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        inList = true;
        listItems.push(trimmed.slice(2));
        continue;
      }

      // Numbered list items
      if (/^\d+\.\s/.test(trimmed)) {
        if (!inList) {
          flushList();
          inList = true;
        }
        listItems.push(trimmed.replace(/^\d+\.\s/, ""));
        continue;
      }

      // Empty line
      if (trimmed === "") {
        flushList();
        continue;
      }

      // Horizontal rule
      if (trimmed === "---" || trimmed === "***") {
        flushList();
        elements.push(
          <hr
            key={i}
            className="my-8 border-zinc-200 dark:border-zinc-800"
          />
        );
        continue;
      }

      // Blockquote
      if (trimmed.startsWith("> ")) {
        flushList();
        elements.push(
          <blockquote
            key={i}
            className="my-4 border-r-4 border-brand-400 bg-brand-50/50 py-3 pr-4 pl-2 text-zinc-700 dark:border-brand-500 dark:bg-brand-900/10 dark:text-zinc-300"
          >
            {trimmed.slice(2)}
          </blockquote>
        );
        continue;
      }

      // Regular paragraph
      flushList();
      // Process inline formatting: **bold**, *italic*, `code`
      const formatted = formatInline(trimmed);
      elements.push(
        <p
          key={i}
          className="my-3 leading-relaxed text-zinc-700 dark:text-zinc-300"
        >
          {formatted}
        </p>
      );
    }

    flushList();
    return elements;
  };

  return (
    <div className="min-h-dvh bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl">
          {/* Lesson Navigation */}
          <LessonNav
            courseId={courseId}
            courseTitle={course.title}
            currentIndex={currentIndex}
            totalLessons={publishedLessons.length}
            prevLesson={
              prevLesson
                ? { _id: prevLesson._id, title: prevLesson.title }
                : null
            }
            nextLesson={
              nextLesson
                ? { _id: nextLesson._id, title: nextLesson.title }
                : null
            }
          />

          {/* Lesson Title */}
          <h1 className="mb-6 text-2xl font-bold text-zinc-900 md:text-3xl dark:text-white">
            {lesson.title}
          </h1>

          {/* Video Player or Placeholder */}
          {lesson.videoUrl ? (
            <div className="mb-8">
              <VideoPlayer
                videoUrl={lesson.videoUrl}
                lessonId={lessonId}
                courseId={courseId}
                initialProgress={lessonProgress?.progressPercent}
                onComplete={handleMarkComplete}
              />
            </div>
          ) : (
            <div className="mb-8 flex aspect-video items-center justify-center rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <svg
                    className="h-8 w-8 text-zinc-400 dark:text-zinc-500"
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
                </div>
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  וידאו עדיין לא הועלה לשיעור זה
                </p>
                <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
                  תוכן הוידאו יתווסף בקרוב
                </p>
              </div>
            </div>
          )}

          {/* Action Bar: Mark Complete + Notes toggle */}
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center gap-3">
              {convexUser && (
                <LessonCompleteButton
                  isCompleted={isCurrentLessonComplete}
                  onMarkComplete={handleMarkComplete}
                />
              )}
              {lesson.duration && (
                <span className="flex items-center gap-1 text-sm text-zinc-500 dark:text-zinc-400">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {formatDuration(lesson.duration)}
                </span>
              )}
            </div>

            {convexUser && (
              <button
                type="button"
                onClick={() => setShowNotes((prev) => !prev)}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  showNotes
                    ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                    : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                }`}
                aria-expanded={showNotes}
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"
                  />
                </svg>
                {showNotes ? "הסתר הערות" : "ההערות שלי"}
              </button>
            )}
          </div>

          {/* Notes Section (collapsible) */}
          {showNotes && convexUser && (
            <div className="mb-8">
              <LessonNotes
                lessonId={lessonId}
                courseId={courseId}
                userId={convexUser._id}
              />
            </div>
          )}

          {/* Lesson Content */}
          {lesson.content && (
            <section
              className="mb-10"
              aria-label="תוכן השיעור"
            >
              <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-zinc-900 dark:text-white">
                <svg
                  className="h-5 w-5 text-brand-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                  />
                </svg>
                תוכן השיעור
              </h2>
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 md:p-8 dark:border-zinc-800 dark:bg-zinc-900/50">
                {renderContent(lesson.content)}
              </div>
            </section>
          )}

          {/* Quiz Section */}
          {quiz && quizQuestions && quizQuestions.length > 0 && (
            <section className="mb-10" aria-label="בוחן">
              <QuizPlayer
                quizTitle={quiz.title}
                questions={quizQuestions}
                passingScore={quiz.passingScore}
                onSubmit={handleSubmitQuiz}
                lastScore={lastQuizAttempt?.score ?? null}
                lastPassed={lastQuizAttempt?.passed ?? null}
              />
            </section>
          )}

          {/* Previous/Next Navigation */}
          <div className="mb-10 flex items-stretch gap-4">
            {prevLesson ? (
              <Link
                href={`/courses/${courseId}/lessons/${prevLesson._id}`}
                className="card-hover flex flex-1 items-center gap-3 rounded-xl border border-zinc-200 bg-white p-4 transition-colors hover:border-brand-200 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
              >
                <svg
                  className="h-5 w-5 shrink-0 text-zinc-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.25 4.5l7.5 7.5-7.5 7.5"
                  />
                </svg>
                <div className="min-w-0">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    השיעור הקודם
                  </p>
                  <p className="truncate text-sm font-medium text-zinc-900 dark:text-white">
                    {prevLesson.title}
                  </p>
                </div>
              </Link>
            ) : (
              <div className="flex-1" />
            )}

            {nextLesson ? (
              <Link
                href={`/courses/${courseId}/lessons/${nextLesson._id}`}
                className="card-hover flex flex-1 items-center justify-end gap-3 rounded-xl border border-zinc-200 bg-white p-4 text-left transition-colors hover:border-brand-200 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
              >
                <div className="min-w-0">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    השיעור הבא
                  </p>
                  <p className="truncate text-sm font-medium text-zinc-900 dark:text-white">
                    {nextLesson.title}
                  </p>
                </div>
                <svg
                  className="h-5 w-5 shrink-0 text-zinc-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 19.5L8.25 12l7.5-7.5"
                  />
                </svg>
              </Link>
            ) : (
              <Link
                href={`/courses/${courseId}`}
                className="card-hover flex flex-1 items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800 transition-colors hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/30"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                סיימת את הקורס! חזרה לדף הקורס
              </Link>
            )}
          </div>

          {/* Comments Section */}
          <CommentsSection
            lessonId={lessonId}
            courseId={courseId}
            userId={convexUser?._id ?? null}
            userRole={convexUser?.role}
          />
        </div>
      </main>
    </div>
  );
}

// -- Helpers --

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes === 0) return `${remainingSeconds} שניות`;
  if (remainingSeconds === 0) return `${minutes} דקות`;
  return `${minutes}:${String(remainingSeconds).padStart(2, "0")} דקות`;
}

function formatInline(text: string): React.ReactNode {
  // Process **bold**, *italic*, `code` patterns
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let keyIdx = 0;

  while (remaining.length > 0) {
    // Bold: **text**
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    // Code: `text`
    const codeMatch = remaining.match(/`(.+?)`/);
    // Italic: *text* (not **)
    const italicMatch = remaining.match(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/);

    // Find earliest match
    const matches = [
      boldMatch ? { type: "bold", match: boldMatch } : null,
      codeMatch ? { type: "code", match: codeMatch } : null,
      italicMatch ? { type: "italic", match: italicMatch } : null,
    ]
      .filter(Boolean)
      .sort((a, b) => (a!.match.index ?? 0) - (b!.match.index ?? 0));

    if (matches.length === 0 || matches[0] === null) {
      parts.push(remaining);
      break;
    }

    const first = matches[0]!;
    const idx = first.match.index ?? 0;

    // Text before the match
    if (idx > 0) {
      parts.push(remaining.slice(0, idx));
    }

    // The formatted text
    if (first.type === "bold") {
      parts.push(
        <strong
          key={keyIdx++}
          className="font-bold text-zinc-900 dark:text-white"
        >
          {first.match[1]}
        </strong>
      );
    } else if (first.type === "code") {
      parts.push(
        <code
          key={keyIdx++}
          className="rounded bg-zinc-100 px-1.5 py-0.5 text-sm font-mono text-brand-600 dark:bg-zinc-800 dark:text-brand-400"
        >
          {first.match[1]}
        </code>
      );
    } else {
      parts.push(
        <em key={keyIdx++} className="italic">
          {first.match[1]}
        </em>
      );
    }

    remaining = remaining.slice(idx + first.match[0].length);
  }

  return parts.length === 1 ? parts[0] : parts;
}
