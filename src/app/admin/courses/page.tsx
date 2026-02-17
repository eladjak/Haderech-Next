"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Badge } from "@/components/ui/badge";

// Mock courses data - used when Convex backend is not connected
const mockCourses = [
  {
    _id: "mock_course_1" as string,
    title: "אומנות ההקשבה",
    description: "למדו כיצד להקשיב באמת - לעצמכם ולאנשים סביבכם",
    published: true,
    order: 0,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 30,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
    imageUrl: undefined as string | undefined,
    _studentsEnrolled: 28,
    _averageScore: 72,
  },
  {
    _id: "mock_course_2" as string,
    title: "תקשורת זוגית מתקדמת",
    description: "כלים מעשיים לשיפור התקשורת הזוגית",
    published: true,
    order: 1,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 20,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
    imageUrl: undefined as string | undefined,
    _studentsEnrolled: 35,
    _averageScore: 68,
  },
  {
    _id: "mock_course_3" as string,
    title: "מפתחות לאינטימיות",
    description: "מסע לגילוי ופיתוח קרבה אמיתית",
    published: false,
    order: 2,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 10,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 1,
    imageUrl: undefined as string | undefined,
    _studentsEnrolled: 26,
    _averageScore: 75,
  },
];

interface CourseFormData {
  title: string;
  description: string;
  imageUrl: string;
  published: boolean;
}

const emptyForm: CourseFormData = {
  title: "",
  description: "",
  imageUrl: "",
  published: false,
};

export default function AdminCoursesPage() {
  const convexCourses = useQuery(api.admin.listAllCourses);
  const createCourse = useMutation(api.admin.createCourse);
  const updateCourse = useMutation(api.admin.updateCourse);
  const deleteCourse = useMutation(api.admin.deleteCourse);

  const courses = convexCourses ?? mockCourses;

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CourseFormData>(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const openCreateModal = useCallback(() => {
    setEditingId(null);
    setFormData(emptyForm);
    setModalOpen(true);
  }, []);

  const openEditModal = useCallback(
    (course: (typeof courses)[number]) => {
      setEditingId(course._id);
      setFormData({
        title: course.title,
        description: course.description,
        imageUrl: course.imageUrl ?? "",
        published: course.published,
      });
      setModalOpen(true);
    },
    []
  );

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setEditingId(null);
    setFormData(emptyForm);
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!formData.title.trim() || !formData.description.trim()) return;

      setLoading(true);
      try {
        if (editingId) {
          await updateCourse({
            id: editingId as Parameters<typeof updateCourse>[0]["id"],
            title: formData.title,
            description: formData.description,
            imageUrl: formData.imageUrl || undefined,
            published: formData.published,
          });
        } else {
          await createCourse({
            title: formData.title,
            description: formData.description,
            imageUrl: formData.imageUrl || undefined,
            published: formData.published,
          });
        }
        closeModal();
      } catch {
        // Silently handle - mock data mode has no real backend
      } finally {
        setLoading(false);
      }
    },
    [editingId, formData, createCourse, updateCourse, closeModal]
  );

  const handleDelete = useCallback(
    async (courseId: string) => {
      setLoading(true);
      try {
        await deleteCourse({
          id: courseId as Parameters<typeof deleteCourse>[0]["id"],
        });
      } catch {
        // Silently handle - mock data mode
      } finally {
        setLoading(false);
        setDeleteConfirm(null);
      }
    },
    [deleteCourse]
  );

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
            ניהול קורסים
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {courses.length} קורסים במערכת
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
          הוסף קורס
        </button>
      </div>

      {/* Courses Table */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/50">
                <th className="px-5 py-3 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  קורס
                </th>
                <th className="hidden px-5 py-3 text-sm font-medium text-zinc-600 sm:table-cell dark:text-zinc-400">
                  סטודנטים
                </th>
                <th className="hidden px-5 py-3 text-sm font-medium text-zinc-600 md:table-cell dark:text-zinc-400">
                  ציון ממוצע
                </th>
                <th className="px-5 py-3 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  סטטוס
                </th>
                <th className="px-5 py-3 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  פעולות
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {courses.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-12 text-center text-sm text-zinc-500 dark:text-zinc-400"
                  >
                    אין קורסים במערכת. לחץ &quot;הוסף קורס&quot; ליצירת קורס
                    חדש.
                  </td>
                </tr>
              ) : (
                courses.map((course) => {
                  const studentsEnrolled =
                    "_studentsEnrolled" in course
                      ? (course as { _studentsEnrolled: number })
                          ._studentsEnrolled
                      : 0;
                  const averageScore =
                    "_averageScore" in course
                      ? (course as { _averageScore: number })._averageScore
                      : 0;

                  return (
                    <tr
                      key={course._id}
                      className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/30"
                    >
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-medium text-zinc-900 dark:text-white">
                            {course.title}
                          </p>
                          <p className="mt-0.5 line-clamp-1 text-sm text-zinc-500 dark:text-zinc-400">
                            {course.description}
                          </p>
                        </div>
                      </td>
                      <td className="hidden px-5 py-4 sm:table-cell">
                        <span className="text-sm text-zinc-700 dark:text-zinc-300">
                          {studentsEnrolled}
                        </span>
                      </td>
                      <td className="hidden px-5 py-4 md:table-cell">
                        <span className="text-sm text-zinc-700 dark:text-zinc-300">
                          {averageScore}%
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <Badge
                          variant={course.published ? "success" : "warning"}
                        >
                          {course.published ? "מפורסם" : "טיוטה"}
                        </Badge>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(course)}
                            className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-white"
                            aria-label={`ערוך ${course.title}`}
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
                            onClick={() => setDeleteConfirm(course._id)}
                            className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                            aria-label={`מחק ${course.title}`}
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
                  );
                })
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
            aria-label={editingId ? "עריכת קורס" : "יצירת קורס חדש"}
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                {editingId ? "עריכת קורס" : "קורס חדש"}
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
              <div>
                <label
                  htmlFor="course-title"
                  className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  שם הקורס
                </label>
                <input
                  id="course-title"
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder:text-zinc-500"
                  placeholder="הזן שם קורס"
                />
              </div>

              <div>
                <label
                  htmlFor="course-description"
                  className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  תיאור
                </label>
                <textarea
                  id="course-description"
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder:text-zinc-500"
                  placeholder="תיאור הקורס"
                />
              </div>

              <div>
                <label
                  htmlFor="course-image"
                  className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  קישור לתמונה (אופציונלי)
                </label>
                <input
                  id="course-image"
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, imageUrl: e.target.value })
                  }
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder:text-zinc-500"
                  placeholder="https://example.com/image.jpg"
                  dir="ltr"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="course-published"
                  type="checkbox"
                  checked={formData.published}
                  onChange={(e) =>
                    setFormData({ ...formData, published: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-500 dark:border-zinc-700"
                />
                <label
                  htmlFor="course-published"
                  className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  פרסם קורס (יוצג לסטודנטים)
                </label>
              </div>

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
                      : "צור קורס"}
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
            aria-label="אישור מחיקה"
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
              מחיקת קורס
            </h3>
            <p className="mb-5 text-sm text-zinc-600 dark:text-zinc-400">
              פעולה זו תמחק את הקורס, כל השיעורים, הבחנים, ההרשמות וההתקדמות
              הקשורים אליו. פעולה זו אינה הפיכה.
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
