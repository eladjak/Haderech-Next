"use client";

import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import {
  Fragment,
  Suspense,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import { api } from "@/../convex/_generated/api";
import { ProgressBar } from "@/components/ui/progress-bar";
import { LessonCompleteButton } from "@/components/course/lesson-complete-button";
import { CourseSafetyNotice } from "@/components/course/course-safety-notice";
import { LessonContent } from "@/components/lesson/lesson-content";
import { LessonPdfResource } from "@/components/lesson/lesson-pdf-resource";
import { LessonAdvisor } from "@/components/lesson/lesson-advisor";
import { LessonNotes } from "@/components/lesson/lesson-notes";
import { QuizPlayer } from "@/components/quiz/quiz-player";
import { VideoPlayer } from "@/components/lesson/video-player";
import type { Id } from "@/../convex/_generated/dataModel";

function LearnContent() {
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

  // Lesson progress for video resume
  const lessonProgress = useQuery(
    api.progress.getLessonProgress,
    lessonId ? { lessonId } : "skip"
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

  // Sibling lesson ids for keyboard navigation, derived without touching the
  // values computed after the early-return guards (keeps hook order stable).
  const router = useRouter();
  const { prevLessonId, nextLessonId } = useMemo(() => {
    if (!courseWithLessons) {
      return { prevLessonId: null as Id<"lessons"> | null, nextLessonId: null as Id<"lessons"> | null };
    }
    const published = courseWithLessons.lessons.filter((l) => l.published);
    const activeId = lessonId ?? published[0]?._id ?? null;
    const idx = published.findIndex((l) => l._id === activeId);
    return {
      prevLessonId: idx > 0 ? published[idx - 1]._id : null,
      nextLessonId:
        idx >= 0 && idx < published.length - 1 ? published[idx + 1]._id : null,
    };
  }, [courseWithLessons, lessonId]);

  // Keyboard navigation between lessons (RTL-aware). ArrowRight goes to the
  // previous lesson (visually to the right in RTL), ArrowLeft to the next.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      if (e.key === "ArrowRight" && prevLessonId) {
        router.push(`/courses/${courseId}/learn?lesson=${prevLessonId}`);
      } else if (e.key === "ArrowLeft" && nextLessonId) {
        router.push(`/courses/${courseId}/learn?lesson=${nextLessonId}`);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router, courseId, prevLessonId, nextLessonId]);

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
  const progressLessons = publishedLessons.filter(
    (lesson) => lesson.completionAffectsProgress !== false,
  );
  const progressLessonIds = new Set(progressLessons.map((lesson) => lesson._id));

  // Build progress map
  const progressMap = new Map(
    (courseProgress ?? []).map((p) => [p.lessonId, p])
  );
  const completedCount = (courseProgress ?? []).filter(
    (p) => p.completed && progressLessonIds.has(p.lessonId),
  ).length;
  const completionPercent =
    progressLessons.length > 0
      ? Math.round((completedCount / progressLessons.length) * 100)
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

  const courseComplete =
    progressLessons.length > 0 && completedCount >= progressLessons.length;

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
        <p className="tabular-nums mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          {completedCount}/{progressLessons.length} שיעורי ליבה הושלמו
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
          const previousLesson = publishedLessons[index - 1];
          const startsPhase =
            lesson.phaseNumber !== undefined &&
            previousLesson?.phaseNumber !== lesson.phaseNumber;
          const startsWeek =
            lesson.weekNumber !== undefined &&
            previousLesson?.weekNumber !== lesson.weekNumber;

          return (
            <Fragment key={lesson._id}>
              {startsPhase && (
                <div className="mb-2 mt-5 px-3 first:mt-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-400">
                    שלב {lesson.phaseNumber} מתוך 6
                  </p>
                  <p className="mt-0.5 text-sm font-bold text-zinc-900 dark:text-white">
                    {lesson.phaseName ?? `שלב ${lesson.phaseNumber}`}
                  </p>
                </div>
              )}
              {startsWeek && (
                <p className="mb-1 mt-3 px-3 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  שבוע {lesson.weekNumber}
                </p>
              )}
              <Link
                href={`/courses/${courseId}/learn?lesson=${lesson._id}`}
                onClick={closeMobileSidebar}
                aria-current={isActive ? "page" : undefined}
                className={`mb-1 flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                  isActive
                    ? "bg-zinc-200 font-medium text-zinc-900 dark:bg-zinc-800 dark:text-white"
                    : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                }`}
              >
                <span
                  className={`tabular-nums flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-medium ${
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
            </Fragment>
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
            <div className="tabular-nums mb-2 flex flex-wrap items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
              <span>
                שיעור {currentIndex + 1} מתוך {publishedLessons.length}
              </span>
              {activeLesson.phaseNumber && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>
                    שלב {activeLesson.phaseNumber} מתוך 6
                    {activeLesson.phaseName
                      ? `: ${activeLesson.phaseName}`
                      : ""}
                  </span>
                </>
              )}
              {activeLesson.weekNumber && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>שבוע {activeLesson.weekNumber}</span>
                </>
              )}
            </div>

            {/* Lesson Title */}
            <h1 className="mb-6 text-2xl font-bold text-zinc-900 md:text-3xl dark:text-white">
              {activeLesson.title}
            </h1>

            <CourseSafetyNotice />

            {/* Video Player */}
            {activeLesson.videoUrl && (
              <div className="mb-8">
                <VideoPlayer
                  videoUrl={activeLesson.videoUrl}
                  lessonId={activeLessonId}
                  courseId={courseId}
                  initialProgress={lessonProgress?.progressPercent}
                  onComplete={handleMarkComplete}
                />
              </div>
            )}

            {!activeLesson.videoUrl && (
              <div className="mb-6 flex items-center gap-3 rounded-2xl bg-zinc-50 p-4 shadow-[0_0_0_1px_rgba(0,0,0,0.06)] dark:bg-zinc-900 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-zinc-800">
                  <svg
                    className="h-5 w-5 text-zinc-400 dark:text-zinc-500"
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
                <div>
                  <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                    השיעור זמין לקריאה ולתרגול
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                    אין וידאו לשיעור הזה כרגע; התוכן המלא מופיע מיד בהמשך.
                  </p>
                </div>
              </div>
            )}

            {/* Lesson Content */}
            {activeLesson.content && (
              <LessonContent content={activeLesson.content} className="mb-8" />
            )}

            {activeLesson.completionAffectsProgress === false && (
              <OptionalReceivingPractice
                onSkip={() => {
                  if (nextLesson) {
                    router.push(
                      `/courses/${courseId}/learn?lesson=${nextLesson._id}`,
                    );
                  }
                }}
              />
            )}

            <LessonPdfResource
              pdfUrl={
                "pdfUrl" in activeLesson ? activeLesson.pdfUrl : undefined
              }
              lessonTitle={activeLesson.title}
              courseId={courseId}
              lessonId={activeLesson._id}
            />

            {/* Notes (self-managing collapsible) */}
            {convexUser && activeLessonId && (
              <LessonNotes
                lessonId={activeLessonId}
                courseId={courseId}
                userId={convexUser._id}
              />
            )}

            {/* Smart Advisor — context-aware, lesson-synced */}
            {activeLessonId && (
              <LessonAdvisor
                lessonId={activeLessonId}
                userId={convexUser?._id}
              />
            )}

            {/* Quiz Section */}
            {activeLesson.assessmentOrScoring !== false &&
              quiz && quizQuestions && quizQuestions.length > 0 && (
              <div className="mb-8">
                <QuizPlayer
                  quizTitle={quiz.title}
                  questions={quizQuestions}
                  passingScore={quiz.passingScore}
                  onSubmit={handleSubmitQuiz}
                  lastScore={lastQuizAttempt?.score ?? null}
                  lastPassed={lastQuizAttempt?.passed ?? null}
                  courseId={courseId}
                  lessonId={activeLessonId ?? undefined}
                  nextLessonId={nextLesson?._id}
                />
              </div>
            )}

            {/* Completion belongs after the lesson, its practice and optional quiz. */}
            {convexUser && activeLesson.completionAffectsProgress !== false && (
              <div className="mb-8 rounded-2xl bg-zinc-50 p-5 shadow-[0_0_0_1px_rgba(0,0,0,0.06)] dark:bg-zinc-900 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
                <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-400">
                  אחרי הקריאה והתרגול שמתאים לך, אפשר לשמור כאן את נקודת
                  החזרה לשיעור הבא.
                </p>
                <LessonCompleteButton
                  isCompleted={isCurrentLessonComplete}
                  onMarkComplete={handleMarkComplete}
                />
              </div>
            )}

            {/* Course-completion celebration */}
            {courseComplete && (
              <div className="mb-8 overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-l from-emerald-50 to-white dark:border-emerald-800 dark:from-emerald-900/20 dark:to-zinc-900">
                <div className="p-6 text-center">
                  <div
                    className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-3xl dark:bg-emerald-900/40"
                    aria-hidden="true"
                  >
                    🎓
                  </div>
                  <h2 className="mb-1 text-xl font-bold text-emerald-800 dark:text-emerald-300">
                    כל הכבוד! סיימת את כל השיעורים
                  </h2>
                  <p className="mb-5 text-sm text-emerald-700 dark:text-emerald-400">
                    השלמת 100% מהקורס. אפשר להנפיק תעודת סיום ולשתף את ההישג.
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <Link
                      href={`/courses/${courseId}`}
                      className="inline-flex h-10 items-center gap-2 rounded-full bg-emerald-600 px-6 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
                    >
                      הנפק תעודת סיום
                    </Link>
                    <Link
                      href="/certificates"
                      className="inline-flex h-10 items-center gap-2 rounded-full border border-emerald-300 bg-white px-6 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-50 dark:border-emerald-700 dark:bg-zinc-900 dark:text-emerald-400 dark:hover:bg-zinc-800"
                    >
                      התעודות שלי
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <nav
              className="flex flex-col gap-3 border-t border-zinc-200 pt-6 sm:flex-row sm:items-stretch sm:justify-between dark:border-zinc-800"
              aria-label="מעבר בין שיעורים"
            >
              {prevLesson ? (
                <Link
                  href={`/courses/${courseId}/learn?lesson=${prevLesson._id}`}
                  className="flex min-h-12 flex-1 items-center gap-3 rounded-xl bg-white px-4 py-3 text-sm text-zinc-700 shadow-[0_0_0_1px_rgba(0,0,0,0.08)] transition-[transform,box-shadow] hover:shadow-md active:scale-[0.96] dark:bg-zinc-900 dark:text-zinc-300 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.1)]"
                >
                  <span aria-hidden="true">→</span>
                  <span className="min-w-0">
                    <span className="block text-xs text-zinc-500 dark:text-zinc-400">
                      השיעור הקודם
                    </span>
                    <span className="block truncate font-medium">
                      {prevLesson.title}
                    </span>
                  </span>
                </Link>
              ) : (
                <div className="hidden flex-1 sm:block" />
              )}
              {nextLesson ? (
                <Link
                  href={`/courses/${courseId}/learn?lesson=${nextLesson._id}`}
                  className="flex min-h-12 flex-1 items-center justify-end gap-3 rounded-xl bg-zinc-900 px-4 py-3 text-left text-sm text-white shadow-sm transition-[transform,box-shadow,background-color] hover:bg-zinc-800 hover:shadow-md active:scale-[0.96] dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
                >
                  <span className="min-w-0">
                    <span className="block text-xs text-zinc-300 dark:text-zinc-500">
                      השיעור הבא
                    </span>
                    <span className="block truncate font-semibold">
                      {nextLesson.title}
                    </span>
                  </span>
                  <span aria-hidden="true">←</span>
                </Link>
              ) : (
                <Link
                  href={`/courses/${courseId}`}
                  className="inline-flex min-h-12 flex-1 items-center justify-center rounded-xl bg-emerald-100 px-4 py-3 text-sm font-semibold text-emerald-800 transition-[transform,background-color] hover:bg-emerald-200 active:scale-[0.96] dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/30"
                >
                  חזרה לסיכום ולתוכנית הקורס
                </Link>
              )}
            </nav>
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

function OptionalReceivingPractice({ onSkip }: { onSkip: () => void }) {
  const [choice, setChoice] = useState<"fictional" | "private" | null>(null);

  return (
    <section className="mb-8 rounded-3xl border border-sky-200 bg-sky-50/70 p-6 dark:border-sky-800 dark:bg-sky-950/20">
      <p className="text-sm font-semibold text-sky-800 dark:text-sky-300">
        תרגול רשות — לא משפיע על ההתקדמות ואין בו ציון
      </p>
      <h2 className="mt-2 text-xl font-bold text-zinc-950 dark:text-white">
        איך מתאים לך לתרגל?
      </h2>
      <p className="mt-2 text-sm leading-7 text-zinc-700 dark:text-zinc-300">
        אין צורך בקשר, באדם נוסף או בחשיפה אישית. אפשר לבחור אפשרות אחת,
        להחליף ביניהן או לדלג בלי שהשיעור יסומן כחסר.
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setChoice("fictional")}
          className="min-h-11 rounded-xl border border-sky-300 bg-white px-4 py-3 text-sm font-semibold text-sky-900 hover:bg-sky-100 dark:border-sky-700 dark:bg-zinc-900 dark:text-sky-200"
        >
          לבחור תרחיש בדיוני
        </button>
        <button
          type="button"
          onClick={() => setChoice("private")}
          className="min-h-11 rounded-xl border border-sky-300 bg-white px-4 py-3 text-sm font-semibold text-sky-900 hover:bg-sky-100 dark:border-sky-700 dark:bg-zinc-900 dark:text-sky-200"
        >
          לבחור חלופת כתיבה פרטית
        </button>
        <button
          type="button"
          onClick={onSkip}
          className="min-h-11 rounded-xl px-4 py-3 text-sm font-semibold text-zinc-700 hover:bg-white dark:text-zinc-300 dark:hover:bg-zinc-900"
        >
          לדלג ולהמשיך
        </button>
      </div>
      {choice === "fictional" && (
        <div className="mt-5 rounded-2xl bg-white p-4 text-sm leading-7 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
          דמות בדיונית מקבלת הצעה לעזרה קטנה. כתבו שתי תגובות אפשריות:
          אחת שמקבלת בתודה ואחת שמסרבת או מבקשת זמן. אין תשובה מדורגת.
        </div>
      )}
      {choice === "private" && (
        <div className="mt-5 rounded-2xl bg-white p-4 text-sm leading-7 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
          אפשר לכתוב לעצמך משפט קבלה ומשפט סירוב כלליים, בלי שם, אירוע או
          פרט מזהה. הכתיבה נשארת אצלך ואין צורך להזין אותה למערכת.
        </div>
      )}
    </section>
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
      <LearnContent />
    </Suspense>
  );
}
