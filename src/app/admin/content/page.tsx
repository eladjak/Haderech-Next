"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Badge } from "@/components/ui/badge";

// נתוני מוק - כשהבקאנד לא מחובר
const mockCoursesWithStats = [
  {
    _id: "mock_1" as string,
    title: "אומנות ההקשבה",
    description: "למדו כיצד להקשיב באמת - לעצמכם ולאנשים סביבכם",
    published: true,
    order: 0,
    lessonCount: 12,
    enrollmentCount: 28,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 30,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
  },
  {
    _id: "mock_2" as string,
    title: "תקשורת זוגית מתקדמת",
    description: "כלים מעשיים לשיפור התקשורת הזוגית",
    published: true,
    order: 1,
    lessonCount: 8,
    enrollmentCount: 35,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 20,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
  },
  {
    _id: "mock_3" as string,
    title: "מפתחות לאינטימיות",
    description: "מסע לגילוי ופיתוח קרבה אמיתית",
    published: false,
    order: 2,
    lessonCount: 6,
    enrollmentCount: 26,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 10,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 1,
  },
];

type CourseWithStats = (typeof mockCoursesWithStats)[number];

function formatDate(timestamp: number): string {
  return new Intl.DateTimeFormat("he-IL", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(timestamp));
}

export default function AdminContentPage() {
  const convexCourses = useQuery(api.admin.listAllCoursesWithStats);
  const updateCourseMutation = useMutation(api.admin.updateCourse);
  const reorderCourseMutation = useMutation(api.admin.reorderCourse);

  const courses = (convexCourses ?? mockCoursesWithStats) as CourseWithStats[];

  const [editingField, setEditingField] = useState<{
    courseId: string;
    field: "title" | "description";
  } | null>(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const startEditing = useCallback(
    (courseId: string, field: "title" | "description", currentValue: string) => {
      setEditingField({ courseId, field });
      setEditValue(currentValue);
    },
    []
  );

  const cancelEditing = useCallback(() => {
    setEditingField(null);
    setEditValue("");
  }, []);

  const saveEdit = useCallback(async () => {
    if (!editingField || !editValue.trim()) return;

    setSaving(true);
    try {
      await updateCourseMutation({
        id: editingField.courseId as Parameters<
          typeof updateCourseMutation
        >[0]["id"],
        [editingField.field]: editValue.trim(),
      });
      setEditingField(null);
      setEditValue("");
    } catch {
      // שגיאת שמירה - מצב מוק
    } finally {
      setSaving(false);
    }
  }, [editingField, editValue, updateCourseMutation]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        saveEdit();
      } else if (e.key === "Escape") {
        cancelEditing();
      }
    },
    [saveEdit, cancelEditing]
  );

  const togglePublished = useCallback(
    async (courseId: string, currentPublished: boolean) => {
      setTogglingId(courseId);
      try {
        await updateCourseMutation({
          id: courseId as Parameters<typeof updateCourseMutation>[0]["id"],
          published: !currentPublished,
        });
      } catch {
        // שגיאה - מצב מוק
      } finally {
        setTogglingId(null);
      }
    },
    [updateCourseMutation]
  );

  const handleReorder = useCallback(
    async (courseId: string, direction: "up" | "down") => {
      try {
        await reorderCourseMutation({
          id: courseId as Parameters<typeof reorderCourseMutation>[0]["id"],
          direction,
        });
      } catch {
        // שגיאה - מצב מוק
      }
    },
    [reorderCourseMutation]
  );

  const totalLessons = courses.reduce((sum, c) => sum + c.lessonCount, 0);
  const totalEnrollments = courses.reduce(
    (sum, c) => sum + c.enrollmentCount,
    0
  );
  const publishedCount = courses.filter((c) => c.published).length;

  return (
    <div>
      {/* כותרת */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          ניהול תוכן
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          ניהול קורסים, שיעורים וסדר הצגה
        </p>
      </div>

      {/* סטטיסטיקות מהירות */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            סה&quot;כ קורסים
          </p>
          <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-white">
            {courses.length}
          </p>
          <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">
            {publishedCount} מפורסמים
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            סה&quot;כ שיעורים
          </p>
          <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-white">
            {totalLessons}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            סה&quot;כ הרשמות
          </p>
          <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-white">
            {totalEnrollments}
          </p>
        </div>
      </div>

      {/* רשימת קורסים */}
      <div className="space-y-4">
        {courses.length === 0 ? (
          <div className="rounded-xl border border-zinc-200 bg-white px-5 py-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              אין קורסים במערכת
            </p>
          </div>
        ) : (
          courses.map((course, index) => (
            <div
              key={course._id}
              className="rounded-xl border border-zinc-200 bg-white transition-shadow hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="p-5">
                {/* שורה עליונה - כותרת + פעולות */}
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    {/* כותרת - עריכה אינליין */}
                    {editingField?.courseId === course._id &&
                    editingField.field === "title" ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={handleKeyDown}
                          autoFocus
                          className="flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-lg font-semibold text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                          aria-label="ערוך שם קורס"
                        />
                        <button
                          type="button"
                          onClick={saveEdit}
                          disabled={saving}
                          className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-zinc-900"
                          aria-label="שמור"
                        >
                          {saving ? "שומר..." : "שמור"}
                        </button>
                        <button
                          type="button"
                          onClick={cancelEditing}
                          className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400"
                          aria-label="ביטול"
                        >
                          ביטול
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          startEditing(course._id, "title", course.title)
                        }
                        className="group flex items-center gap-2 text-right"
                        aria-label={`ערוך שם: ${course.title}`}
                      >
                        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                          {course.title}
                        </h3>
                        <svg
                          className="h-3.5 w-3.5 text-zinc-400 opacity-0 transition-opacity group-hover:opacity-100"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"
                          />
                        </svg>
                      </button>
                    )}

                    {/* תיאור - עריכה אינליין */}
                    {editingField?.courseId === course._id &&
                    editingField.field === "description" ? (
                      <div className="mt-2 flex items-start gap-2">
                        <textarea
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={handleKeyDown}
                          autoFocus
                          rows={2}
                          className="flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-700 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                          aria-label="ערוך תיאור קורס"
                        />
                        <div className="flex flex-col gap-1">
                          <button
                            type="button"
                            onClick={saveEdit}
                            disabled={saving}
                            className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-zinc-900"
                            aria-label="שמור"
                          >
                            {saving ? "..." : "שמור"}
                          </button>
                          <button
                            type="button"
                            onClick={cancelEditing}
                            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400"
                            aria-label="ביטול"
                          >
                            ביטול
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          startEditing(
                            course._id,
                            "description",
                            course.description
                          )
                        }
                        className="group mt-1 flex items-center gap-2 text-right"
                        aria-label={`ערוך תיאור: ${course.title}`}
                      >
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                          {course.description}
                        </p>
                        <svg
                          className="h-3 w-3 shrink-0 text-zinc-400 opacity-0 transition-opacity group-hover:opacity-100"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"
                          />
                        </svg>
                      </button>
                    )}
                  </div>

                  {/* כפתורי סדר */}
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleReorder(course._id, "up")}
                      disabled={index === 0}
                      className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                      aria-label="הזז למעלה"
                      title="הזז למעלה"
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
                      onClick={() => handleReorder(course._id, "down")}
                      disabled={index === courses.length - 1}
                      className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                      aria-label="הזז למטה"
                      title="הזז למטה"
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
                </div>

                {/* שורה תחתונה - מטא-דאטה + סטטוס */}
                <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-zinc-100 pt-4 dark:border-zinc-800">
                  {/* מספר שיעורים */}
                  <div className="flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400">
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
                        d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z"
                      />
                    </svg>
                    <span>{course.lessonCount} שיעורים</span>
                  </div>

                  {/* מספר הרשמות */}
                  <div className="flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400">
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
                        d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                      />
                    </svg>
                    <span>{course.enrollmentCount} נרשמים</span>
                  </div>

                  {/* תאריך עדכון */}
                  <div className="flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400">
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
                    <span>עודכן {formatDate(course.updatedAt)}</span>
                  </div>

                  {/* Spacer */}
                  <div className="flex-1" />

                  {/* Toggle פרסום */}
                  <button
                    type="button"
                    onClick={() =>
                      togglePublished(course._id, course.published)
                    }
                    disabled={togglingId === course._id}
                    className="flex items-center gap-2 transition-opacity disabled:opacity-50"
                    aria-label={
                      course.published ? "בטל פרסום קורס" : "פרסם קורס"
                    }
                  >
                    {/* Toggle switch */}
                    <div
                      className={`relative h-6 w-11 rounded-full transition-colors ${
                        course.published
                          ? "bg-emerald-500"
                          : "bg-zinc-300 dark:bg-zinc-600"
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                          course.published
                            ? "right-0.5"
                            : "right-[22px]"
                        }`}
                      />
                    </div>
                    <Badge
                      variant={course.published ? "success" : "warning"}
                    >
                      {course.published ? "מפורסם" : "טיוטה"}
                    </Badge>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
