"use client";

import { useParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useCallback } from "react";
import { api } from "@/../convex/_generated/api";
import { Header } from "@/components/layout/header";
import { QuizPlayer } from "@/components/quiz/quiz-player";
import type { Id } from "@/../convex/_generated/dataModel";

export default function QuizPage() {
  const params = useParams<{ courseId: string; lessonId: string }>();
  const courseId = params.courseId as Id<"courses">;
  const lessonId = params.lessonId as Id<"lessons">;
  const { user: clerkUser } = useUser();

  // Current lesson
  const lesson = useQuery(api.lessons.getById, { id: lessonId });

  // Course with lessons (for navigation)
  const courseWithLessons = useQuery(api.courses.getWithLessons, {
    id: courseId,
  });

  // User from Convex
  const convexUser = useQuery(
    api.users.getByClerkId,
    clerkUser?.id ? { clerkId: clerkUser.id } : "skip"
  );

  // Quiz data
  const quiz = useQuery(api.quizzes.getByLesson, { lessonId });
  const quizQuestions = useQuery(
    api.quizzes.getQuestions,
    quiz?._id ? { quizId: quiz._id } : "skip"
  );
  const lastAttempt = useQuery(
    api.quizzes.getLastAttempt,
    quiz?._id && convexUser?._id
      ? { userId: convexUser._id, quizId: quiz._id }
      : "skip"
  );

  // Submit mutation
  const submitAttempt = useMutation(api.quizzes.submitAttempt);

  const handleSubmit = useCallback(
    async (answers: number[]) => {
      if (!convexUser?._id || !quiz?._id) {
        throw new Error("Missing user or quiz data");
      }
      return await submitAttempt({
        userId: convexUser._id,
        quizId: quiz._id,
        lessonId,
        courseId,
        answers,
      });
    },
    [convexUser?._id, quiz?._id, submitAttempt, lessonId, courseId]
  );

  // Determine next lesson for navigation
  const publishedLessons =
    courseWithLessons?.lessons.filter((l) => l.published) ?? [];
  const currentLessonIndex = publishedLessons.findIndex(
    (l) => l._id === lessonId
  );
  const nextLesson =
    currentLessonIndex >= 0 && currentLessonIndex < publishedLessons.length - 1
      ? publishedLessons[currentLessonIndex + 1]
      : null;

  // Loading state
  if (lesson === undefined || quiz === undefined) {
    return (
      <div className="min-h-dvh bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="mx-auto max-w-2xl">
            {/* Breadcrumb skeleton */}
            <div className="mb-6 h-4 w-48 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            {/* Card skeleton */}
            <div className="h-96 animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
          </div>
        </main>
      </div>
    );
  }

  // Lesson or quiz not found
  if (lesson === null || quiz === null) {
    return (
      <div className="min-h-dvh bg-background">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <div className="mx-auto max-w-2xl text-center">
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
                  d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
                />
              </svg>
            </div>
            <h1 className="mb-4 text-2xl font-bold text-zinc-900 dark:text-white">
              {lesson === null ? "השיעור לא נמצא" : "לשיעור זה אין בוחן"}
            </h1>
            <p className="mb-6 text-zinc-600 dark:text-zinc-400">
              {lesson === null
                ? "הדף שחיפשת לא קיים או שהוסר."
                : "הבוחן לשיעור זה טרם נוסף. חזור לשיעור להמשיך ללמוד."}
            </p>
            <Link
              href={`/courses/${courseId}/lessons/${lessonId}`}
              className="inline-flex h-10 items-center rounded-full bg-brand-500 px-6 text-sm font-medium text-white transition-colors hover:bg-brand-600"
            >
              חזרה לשיעור
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const course = courseWithLessons
    ? { title: courseWithLessons.title }
    : { title: "קורס" };

  return (
    <div className="min-h-dvh bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-2xl">
          {/* Breadcrumb */}
          <nav
            className="mb-6 flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400"
            aria-label="מיקום בקורס"
          >
            <Link
              href={`/courses/${courseId}`}
              className="transition-colors hover:text-zinc-700 dark:hover:text-zinc-200"
            >
              {course.title}
            </Link>
            <svg
              className="h-4 w-4 rotate-180"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
            <Link
              href={`/courses/${courseId}/lessons/${lessonId}`}
              className="transition-colors hover:text-zinc-700 dark:hover:text-zinc-200"
            >
              {lesson.title}
            </Link>
            <svg
              className="h-4 w-4 rotate-180"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
            <span className="font-medium text-zinc-700 dark:text-zinc-200">בוחן</span>
          </nav>

          {/* Page header */}
          <div className="mb-6">
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-100 dark:bg-brand-900/30">
                <svg
                  className="h-4 w-4 text-brand-600 dark:text-brand-400"
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
              </div>
              <span className="text-sm font-medium text-brand-600 dark:text-brand-400">
                בוחן ידע
              </span>
            </div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white md:text-3xl">
              {quiz.title}
            </h1>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              שיעור: {lesson.title}
            </p>
          </div>

          {/* Quiz Player */}
          {quizQuestions && quizQuestions.length > 0 ? (
            <QuizPlayer
              quizTitle={quiz.title}
              questions={quizQuestions}
              passingScore={quiz.passingScore}
              onSubmit={handleSubmit}
              lastScore={lastAttempt?.score ?? null}
              lastPassed={lastAttempt?.passed ?? null}
              courseId={courseId}
              lessonId={lessonId}
              nextLessonId={nextLesson?._id}
            />
          ) : (
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                <svg
                  className="h-7 w-7 text-zinc-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
                  />
                </svg>
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                שאלות הבוחן טרם נוספו
              </p>
            </div>
          )}

          {/* Back to lesson link */}
          <div className="mt-6">
            <Link
              href={`/courses/${courseId}/lessons/${lessonId}`}
              className="inline-flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
              חזרה לשיעור
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
