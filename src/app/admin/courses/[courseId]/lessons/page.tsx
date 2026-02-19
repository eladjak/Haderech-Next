"use client";

import { useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import type { Id } from "@/../convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import { formatDuration, truncateText } from "@/lib/admin-utils";

// ─── Types ──────────────────────────────────────────────────────────────────────

interface LessonFormData {
  title: string;
  content: string;
  videoUrl: string;
  duration: string;
  published: boolean;
}

const emptyForm: LessonFormData = {
  title: "",
  content: "",
  videoUrl: "",
  duration: "",
  published: false,
};

// ─── Mock Data ──────────────────────────────────────────────────────────────────

const mockLessons = [
  {
    _id: "mock_lesson_1" as string,
    courseId: "mock_course_1" as string,
    title: "מהי הקשבה אמיתית?",
    content: "הקשבה אמיתית היא לא רק לשמוע מילים...",
    videoUrl: "https://youtube.com/watch?v=example1",
    duration: 480,
    order: 0,
    published: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 30,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
  },
  {
    _id: "mock_lesson_2" as string,
    courseId: "mock_course_1" as string,
    title: "חסמים להקשבה",
    content: "ישנם חסמים רבים שמונעים מאיתנו להקשיב...",
    videoUrl: undefined as string | undefined,
    duration: 360,
    order: 1,
    published: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 25,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
  },
  {
    _id: "mock_lesson_3" as string,
    courseId: "mock_course_1" as string,
    title: "תרגול הקשבה פעילה",
    content: "",
    videoUrl: undefined as string | undefined,
    duration: undefined as number | undefined,
    order: 2,
    published: false,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 10,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 1,
  },
];

const mockCourse = {
  _id: "mock_course_1" as string,
  title: "אומנות ההקשבה",
};

// ─── Component ──────────────────────────────────────────────────────────────────

export default function AdminLessonsPage() {
  const params = useParams();
  const courseId = params.courseId as string;

  // Convex queries
  const convexLessons = useQuery(
    api.adminLessons.listByCourse,
    courseId && !courseId.startsWith("mock_")
      ? { courseId: courseId as Id<"courses"> }
      : "skip"
  );
  const convexCourse = useQuery(
    api.courses.getById,
    courseId && !courseId.startsWith("mock_")
      ? { id: courseId as Id<"courses"> }
      : "skip"
  );

  // Convex mutations
  const createLesson = useMutation(api.adminLessons.create);
  const updateLesson = useMutation(api.adminLessons.update);
  const removeLesson = useMutation(api.adminLessons.remove);
  const reorderLessons = useMutation(api.adminLessons.reorder);

  // Use Convex data or mock
  const lessons = convexLessons ?? mockLessons;
  const course = convexCourse ?? mockCourse;

  // ─── State ──────────────────────────────────────────────────────────────────

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<LessonFormData>(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // ─── Handlers ───────────────────────────────────────────────────────────────

  const openCreateModal = useCallback(() => {
    setEditingId(null);
    setFormData(emptyForm);
    setModalOpen(true);
  }, []);

  const openEditModal = useCallback((lesson: (typeof lessons)[number]) => {
    setEditingId(lesson._id);
    setFormData({
      title: lesson.title,
      content: lesson.content ?? "",
      videoUrl: lesson.videoUrl ?? "",
      duration: lesson.duration ? String(lesson.duration) : "",
      published: lesson.published,
    });
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setEditingId(null);
    setFormData(emptyForm);
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!formData.title.trim()) return;

      setLoading(true);
      try {
        const durationNum = formData.duration ? parseInt(formData.duration, 10) : undefined;

        if (editingId) {
          await updateLesson({
            id: editingId as Id<"lessons">,
            title: formData.title,
            content: formData.content || undefined,
            videoUrl: formData.videoUrl || undefined,
            duration: durationNum && !isNaN(durationNum) ? durationNum : undefined,
            published: formData.published,
          });
        } else {
          await createLesson({
            courseId: courseId as Id<"courses">,
            title: formData.title,
            content: formData.content || undefined,
            videoUrl: formData.videoUrl || undefined,
            duration: durationNum && !isNaN(durationNum) ? durationNum : undefined,
            published: formData.published,
          });
        }
        closeModal();
      } catch {
        // Silently handle - mock data mode
      } finally {
        setLoading(false);
      }
    },
    [editingId, formData, courseId, createLesson, updateLesson, closeModal]
  );

  const handleDelete = useCallback(
    async (lessonId: string) => {
      setLoading(true);
      try {
        await removeLesson({
          id: lessonId as Id<"lessons">,
        });
      } catch {
        // Silently handle - mock data mode
      } finally {
        setLoading(false);
        setDeleteConfirm(null);
      }
    },
    [removeLesson]
  );

  const handleMoveUp = useCallback(
    async (index: number) => {
      if (index <= 0) return;
      const newOrder = lessons.map((l) => l._id);
      [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
      try {
        await reorderLessons({
          lessonIds: newOrder as Id<"lessons">[],
        });
      } catch {
        // Silently handle - mock data mode
      }
    },
    [lessons, reorderLessons]
  );

  const handleMoveDown = useCallback(
    async (index: number) => {
      if (index >= lessons.length - 1) return;
      const newOrder = lessons.map((l) => l._id);
      [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
      try {
        await reorderLessons({
          lessonIds: newOrder as Id<"lessons">[],
        });
      } catch {
        // Silently handle - mock data mode
      }
    },
    [lessons, reorderLessons]
  );

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Breadcrumb + Header */}
      <div className="mb-8">
        <nav className="mb-3 text-sm text-zinc-500 dark:text-zinc-400">
          <Link
            href="/admin/courses"
            className="transition-colors hover:text-zinc-900 dark:hover:text-white"
          >
            קורסים
          </Link>
          <span className="mx-2">←</span>
          <span className="text-zinc-900 dark:text-white">
            {course ? course.title : "טוען..."}
          </span>
        </nav>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
              ניהול שיעורים
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {lessons.length} שיעורים בקורס &quot;{course?.title}&quot;
            </p>
          </div>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            הוסף שיעור
          </button>
        </div>
      </div>

      {/* Lessons Table */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/50">
                <th className="w-16 px-4 py-3 text-center text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  #
                </th>
                <th className="px-5 py-3 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  שיעור
                </th>
                <th className="hidden px-5 py-3 text-sm font-medium text-zinc-600 md:table-cell dark:text-zinc-400">
                  וידאו
                </th>
                <th className="hidden px-5 py-3 text-sm font-medium text-zinc-600 sm:table-cell dark:text-zinc-400">
                  משך
                </th>
                <th className="px-5 py-3 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  סטטוס
                </th>
                <th className="px-5 py-3 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  סדר
                </th>
                <th className="px-5 py-3 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  פעולות
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {lessons.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-12 text-center text-sm text-zinc-500 dark:text-zinc-400"
                  >
                    אין שיעורים בקורס. לחץ &quot;הוסף שיעור&quot; ליצירת שיעור
                    חדש.
                  </td>
                </tr>
              ) : (
                lessons.map((lesson, index) => (
                  <tr
                    key={lesson._id}
                    className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/30"
                  >
                    {/* Order number */}
                    <td className="px-4 py-4 text-center">
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                        {index + 1}
                      </span>
                    </td>

                    {/* Title + content preview */}
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-medium text-zinc-900 dark:text-white">
                          {lesson.title}
                        </p>
                        {lesson.content && (
                          <p className="mt-0.5 line-clamp-1 text-sm text-zinc-500 dark:text-zinc-400">
                            {truncateText(lesson.content, 60)}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Video indicator */}
                    <td className="hidden px-5 py-4 md:table-cell">
                      {lesson.videoUrl ? (
                        <span className="inline-flex items-center gap-1 text-sm text-emerald-600 dark:text-emerald-400">
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
                              d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"
                            />
                          </svg>
                          יש וידאו
                        </span>
                      ) : (
                        <span className="text-sm text-zinc-400 dark:text-zinc-500">
                          ללא
                        </span>
                      )}
                    </td>

                    {/* Duration */}
                    <td className="hidden px-5 py-4 sm:table-cell">
                      <span className="text-sm text-zinc-700 dark:text-zinc-300">
                        {formatDuration(lesson.duration)}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <Badge
                        variant={lesson.published ? "success" : "warning"}
                      >
                        {lesson.published ? "מפורסם" : "טיוטה"}
                      </Badge>
                    </td>

                    {/* Reorder buttons */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleMoveUp(index)}
                          disabled={index === 0}
                          className="rounded p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 disabled:opacity-30 disabled:hover:bg-transparent dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                          aria-label={`העבר "${lesson.title}" למעלה`}
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M4.5 15.75l7.5-7.5 7.5 7.5"
                            />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveDown(index)}
                          disabled={index === lessons.length - 1}
                          className="rounded p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 disabled:opacity-30 disabled:hover:bg-transparent dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                          aria-label={`העבר "${lesson.title}" למטה`}
                        >
                          <svg
                            className="h-4 w-4"
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
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(lesson)}
                          className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-white"
                          aria-label={`ערוך "${lesson.title}"`}
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
                              d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                            />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirm(lesson._id)}
                          className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                          aria-label={`מחק "${lesson.title}"`}
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
                              d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={closeModal}
            aria-hidden="true"
          />
          <div
            className="relative mx-4 w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900"
            role="dialog"
            aria-modal="true"
            aria-label={editingId ? "עריכת שיעור" : "יצירת שיעור חדש"}
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                {editingId ? "עריכת שיעור" : "שיעור חדש"}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                aria-label="סגור"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <label
                  htmlFor="lesson-title"
                  className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  שם השיעור
                </label>
                <input
                  id="lesson-title"
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder:text-zinc-500"
                  placeholder="הזן שם שיעור"
                />
              </div>

              {/* Content */}
              <div>
                <label
                  htmlFor="lesson-content"
                  className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  תוכן (Markdown)
                </label>
                <textarea
                  id="lesson-content"
                  rows={5}
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder:text-zinc-500"
                  placeholder="כתוב את תוכן השיעור (תומך Markdown)"
                  dir="rtl"
                />
              </div>

              {/* Video URL */}
              <div>
                <label
                  htmlFor="lesson-video"
                  className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  קישור לוידאו (אופציונלי)
                </label>
                <input
                  id="lesson-video"
                  type="url"
                  value={formData.videoUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, videoUrl: e.target.value })
                  }
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder:text-zinc-500"
                  placeholder="https://youtube.com/watch?v=..."
                  dir="ltr"
                />
              </div>

              {/* Duration */}
              <div>
                <label
                  htmlFor="lesson-duration"
                  className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  משך בשניות (אופציונלי)
                </label>
                <input
                  id="lesson-duration"
                  type="number"
                  min="0"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({ ...formData, duration: e.target.value })
                  }
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder:text-zinc-500"
                  placeholder="480"
                  dir="ltr"
                />
                {formData.duration && !isNaN(parseInt(formData.duration, 10)) && (
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    = {formatDuration(parseInt(formData.duration, 10))} דקות
                  </p>
                )}
              </div>

              {/* Published */}
              <div className="flex items-center gap-2">
                <input
                  id="lesson-published"
                  type="checkbox"
                  checked={formData.published}
                  onChange={(e) =>
                    setFormData({ ...formData, published: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-500 dark:border-zinc-700"
                />
                <label
                  htmlFor="lesson-published"
                  className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  פרסם שיעור (יוצג לסטודנטים)
                </label>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
                >
                  {loading
                    ? "שומר..."
                    : editingId
                      ? "שמור שינויים"
                      : "צור שיעור"}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  ביטול
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setDeleteConfirm(null)}
            aria-hidden="true"
          />
          <div
            className="relative mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900"
            role="alertdialog"
            aria-modal="true"
            aria-label="אישור מחיקת שיעור"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <svg
                className="h-6 w-6 text-red-600 dark:text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-white">
              מחיקת שיעור
            </h3>
            <p className="mb-5 text-sm text-zinc-600 dark:text-zinc-400">
              פעולה זו תמחק את השיעור, כל ההתקדמות, הבחנים והשאלות הקשורים אליו.
              פעולה זו אינה הפיכה.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirm)}
                disabled={loading}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? "מוחק..." : "מחק"}
              </button>
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
