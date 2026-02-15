"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { Suspense, useState, useCallback } from "react";
import { api } from "@/../convex/_generated/api";
import { ProgressBar } from "@/components/ui/progress-bar";
import { LessonCompleteButton } from "@/components/course/lesson-complete-button";
import { QuizPlayer } from "@/components/quiz/quiz-player";
import type { Id } from "@/../convex/_generated/dataModel";

function LessonContent() {
  const params = useParams<{ courseId: string }>();
  const searchParams = useSearchParams();
  const courseId = params.courseId as Id<"courses">;
  const lessonId = searchParams.get("lesson") as Id<"lessons"> | null;
  const { user: clerkUser } = useUser();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const courseWithLessons = useQuery(api.courses.getWithLessons, {
    id: courseId,
  });

  const currentLesson = useQuery(
    api.lessons.getById,
    lessonId ? { id: lessonId } : "skip"
  );

  // Get user from Convex
  const convexUser = useQuery(
    api.users.getByClerkId,
    clerkUser?.id ? { clerkId: clerkUser.id } : "skip"
  );

  // Progress for the course
  const courseProgress = useQuery(
    api.progress.getForCourse,
    convexUser?._id ? { userId: convexUser._id, courseId } : "skip"
  );

  // Quiz for current lesson
  const quiz = useQuery(
    api.quizzes.getByLesson,
    lessonId ? { lessonId } : "skip"
  );

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

  const closeMobileSidebar = useCallback(() => {
    setMobileSidebarOpen(false);
  }, []);

  if (courseWithLessons === undefined) {
    return (
      <div className="flex min-h-dvh">
        <div className="w-80 shrink-0 animate-pulse bg-zinc-50 dark:bg-zinc-900" />
        <div className="flex-1 animate-pulse bg-zinc-100 dark:bg-zinc-800" />
      </div>
    );
  }

  if (courseWithLessons === null) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-white dark:bg-zinc-950">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-zinc-900 dark:text-white">
            הקורס לא נמצא
          </h1>
          <Link
            href="/courses"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          >
            חזרה לקורסים
          </Link>
        </div>
      </div>
    );
  }

  const { lessons, ...course } = courseWithLessons;
  const publishedLessons = lessons.filter((l) => l.published);

  // Build progress map
  const progressMap = new Map(
    (courseProgress ?? []).map((p) => [p.lessonId, p])
  );
  const completedCount = (courseProgress ?? []).filter(
    (p) => p.completed
  ).length;
  const completionPercent =
    publishedLessons.length > 0
      ? Math.round((completedCount / publishedLessons.length) * 100)
      : 0;

  // Default to first lesson if none selected
  const activeLessonId = lessonId ?? publishedLessons[0]?._id ?? null;
  const activeLesson =
    activeLessonId === lessonId
      ? currentLesson
      : publishedLessons.find((l) => l._id === activeLessonId) ?? null;

  const currentIndex = publishedLessons.findIndex(
    (l) => l._id === activeLessonId
  );
  const prevLesson =
    currentIndex > 0 ? publishedLessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < publishedLessons.length - 1
      ? publishedLessons[currentIndex + 1]
      : null;

  const isCurrentLessonComplete =
    activeLessonId !== null &&
    progressMap.get(activeLessonId)?.completed === true;

  async function handleMarkComplete() {
    if (!convexUser?._id || !activeLessonId) return;
    await markComplete({
      userId: convexUser._id,
      lessonId: activeLessonId,
      courseId,
    });
  }

  async function handleSubmitQuiz(answers: number[]) {
    if (!convexUser?._id || !quiz?._id || !activeLessonId) {
      throw new Error("Missing data for quiz submission");
    }
    return await submitQuizAttempt({
      userId: convexUser._id,
      quizId: quiz._id,
      lessonId: activeLessonId,
      courseId,
      answers,
    });
  }

  // Sidebar content (shared between desktop and mobile)
  const sidebarContent = (
    <>
      <div className="border-b border-zinc-200 p-4 dark:border-zinc-800">
        <Link
          href={`/courses/${courseId}`}
          className="mb-1 block text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          onClick={closeMobileSidebar}
        >
          &rarr; חזרה לקורס
        </Link>
        <h2 className="font-semibold text-zinc-900 dark:text-white">
          {course.title}
        </h2>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          {completedCount}/{publishedLessons.length} שיעורים הושלמו
        </p>
        {completionPercent > 0 && (
          <div className="mt-2">
            <ProgressBar value={completionPercent} size="sm" />
          </div>
        )}
      </div>

      <nav className="p-2" aria-label="רשימת שיעורים">
        {publishedLessons.map((lesson, index) => {
          const isActive = lesson._id === activeLessonId;
          const lessonProgress = progressMap.get(lesson._id);
          const isComplete = lessonProgress?.completed === true;

          return (
            <Link
              key={lesson._id}
              href={`/courses/${courseId}/learn?lesson=${lesson._id}`}
              onClick={closeMobileSidebar}
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
              <span className="truncate">{lesson.title}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );

  return (
    <div className="flex min-h-dvh bg-white dark:bg-zinc-950">
      {/* Desktop Sidebar */}
      <aside className="sticky top-0 hidden h-dvh w-80 shrink-0 overflow-y-auto border-l border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 md:block">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30 md:hidden"
            onClick={closeMobileSidebar}
            aria-hidden="true"
          />
          <aside className="fixed inset-y-0 right-0 z-50 w-80 overflow-y-auto bg-zinc-50 shadow-xl md:hidden dark:bg-zinc-900">
            <div className="flex justify-end p-2">
              <button
                type="button"
                onClick={closeMobileSidebar}
                className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                aria-label="סגור תפריט שיעורים"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            {sidebarContent}
          </aside>
        </>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Mobile Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 p-4 md:hidden dark:border-zinc-800">
          <Link
            href={`/courses/${courseId}`}
            className="text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          >
            &rarr; {course.title}
          </Link>
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(true)}
            className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            aria-label="פתח רשימת שיעורים"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </button>
        </div>

        {activeLesson ? (
          <div className="mx-auto max-w-4xl p-6 md:p-10">
            {/* Lesson number badge */}
            <div className="mb-2 text-sm text-zinc-500 dark:text-zinc-400">
              שיעור {currentIndex + 1} מתוך {publishedLessons.length}
            </div>

            {/* Lesson Title */}
            <h1 className="mb-6 text-2xl font-bold text-zinc-900 md:text-3xl dark:text-white">
              {activeLesson.title}
            </h1>

            {/* Video Player */}
            {activeLesson.videoUrl && (
              <div className="mb-8 aspect-video overflow-hidden rounded-2xl bg-zinc-900">
                <video
                  src={activeLesson.videoUrl}
                  controls
                  className="h-full w-full"
                  playsInline
                >
                  <track kind="captions" />
                  הדפדפן שלך לא תומך בוידאו.
                </video>
              </div>
            )}

            {!activeLesson.videoUrl && (
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

            {/* Mark as complete button */}
            {convexUser && (
              <div className="mb-8">
                <LessonCompleteButton
                  isCompleted={isCurrentLessonComplete}
                  onMarkComplete={handleMarkComplete}
                />
              </div>
            )}

            {/* Lesson Content */}
            {activeLesson.content && (
              <div className="prose prose-zinc dark:prose-invert mb-8 max-w-none">
                <div className="whitespace-pre-wrap leading-relaxed text-zinc-700 dark:text-zinc-300">
                  {activeLesson.content}
                </div>
              </div>
            )}

            {/* Quiz Section */}
            {quiz && quizQuestions && quizQuestions.length > 0 && (
              <div className="mb-8">
                <QuizPlayer
                  quizTitle={quiz.title}
                  questions={quizQuestions}
                  passingScore={quiz.passingScore}
                  onSubmit={handleSubmitQuiz}
                  lastScore={lastQuizAttempt?.score ?? null}
                  lastPassed={lastQuizAttempt?.passed ?? null}
                />
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between border-t border-zinc-200 pt-6 dark:border-zinc-800">
              {prevLesson ? (
                <Link
                  href={`/courses/${courseId}/learn?lesson=${prevLesson._id}`}
                  className="flex items-center gap-2 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                >
                  <span>&larr;</span>
                  <span className="max-w-[200px] truncate">
                    {prevLesson.title}
                  </span>
                </Link>
              ) : (
                <div />
              )}
              {nextLesson ? (
                <Link
                  href={`/courses/${courseId}/learn?lesson=${nextLesson._id}`}
                  className="flex items-center gap-2 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                >
                  <span className="max-w-[200px] truncate">
                    {nextLesson.title}
                  </span>
                  <span>&rarr;</span>
                </Link>
              ) : (
                <Link
                  href={`/courses/${courseId}`}
                  className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-800 transition-colors hover:bg-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/30"
                >
                  סיימת את הקורס! חזרה לדף הקורס
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center p-10">
            <div className="text-center">
              <p className="text-zinc-600 dark:text-zinc-400">
                {publishedLessons.length === 0
                  ? "אין שיעורים זמינים בקורס זה עדיין."
                  : "בחר שיעור מהרשימה כדי להתחיל."}
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function LearnPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh">
          <div className="w-80 shrink-0 animate-pulse bg-zinc-50 dark:bg-zinc-900" />
          <div className="flex-1 animate-pulse bg-zinc-100 dark:bg-zinc-800" />
        </div>
      }
    >
      <LessonContent />
    </Suspense>
  );
}
