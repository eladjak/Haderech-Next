"use client";

import { useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import type { Id } from "@/../convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";

// ─── Types ──────────────────────────────────────────────────────────────────────

interface QuestionFormData {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface QuizFormData {
  title: string;
  lessonId: string;
  passingScore: string;
  questions: QuestionFormData[];
}

const emptyQuestion: QuestionFormData = {
  question: "",
  options: ["", "", "", ""],
  correctIndex: 0,
  explanation: "",
};

const emptyForm: QuizFormData = {
  title: "",
  lessonId: "",
  passingScore: "60",
  questions: [{ ...emptyQuestion }],
};

// ─── Mock Data ──────────────────────────────────────────────────────────────────

const mockQuizzes = [
  {
    _id: "mock_quiz_1" as string,
    lessonId: "mock_lesson_1" as string,
    courseId: "mock_course_1" as string,
    title: "בוחן: מהי הקשבה?",
    passingScore: 60,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 10,
    questionCount: 3,
    lessonTitle: "מהי הקשבה אמיתית?",
  },
];

const mockLessons = [
  { _id: "mock_lesson_1" as string, title: "מהי הקשבה אמיתית?", order: 0 },
  { _id: "mock_lesson_2" as string, title: "חסמים להקשבה", order: 1 },
];

const mockCourse = {
  _id: "mock_course_1" as string,
  title: "אומנות ההקשבה",
};

// ─── Component ──────────────────────────────────────────────────────────────────

export default function AdminQuizzesPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const isMock = courseId.startsWith("mock_");

  // Convex queries
  const convexQuizzes = useQuery(
    api.adminQuizzes.listByCourse,
    !isMock ? { courseId: courseId as Id<"courses"> } : "skip"
  );
  const convexLessons = useQuery(
    api.adminLessons.listByCourse,
    !isMock ? { courseId: courseId as Id<"courses"> } : "skip"
  );
  const convexCourse = useQuery(
    api.courses.getById,
    !isMock ? { id: courseId as Id<"courses"> } : "skip"
  );

  // Convex mutations
  const createQuiz = useMutation(api.adminQuizzes.create);
  const updateQuiz = useMutation(api.adminQuizzes.update);
  const removeQuiz = useMutation(api.adminQuizzes.remove);

  // Data
  const quizzes = convexQuizzes ?? mockQuizzes;
  const lessons = convexLessons ?? mockLessons;
  const course = convexCourse ?? mockCourse;

  // ─── State ──────────────────────────────────────────────────────────────────

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<QuizFormData>(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // ─── Handlers ───────────────────────────────────────────────────────────────

  const openCreateModal = useCallback(() => {
    setEditingId(null);
    setFormData({
      ...emptyForm,
      lessonId: lessons.length > 0 ? lessons[0]._id : "",
      questions: [{ ...emptyQuestion }],
    });
    setModalOpen(true);
  }, [lessons]);

  const openEditModal = useCallback(
    (quiz: (typeof quizzes)[number]) => {
      setEditingId(quiz._id);
      setFormData({
        title: quiz.title,
        lessonId: quiz.lessonId,
        passingScore: String(quiz.passingScore),
        questions: [], // Edit mode only updates title/passingScore, not questions
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

  const addQuestion = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      questions: [...prev.questions, { ...emptyQuestion }],
    }));
  }, []);

  const removeQuestion = useCallback((index: number) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }));
  }, []);

  const updateQuestion = useCallback(
    (index: number, field: keyof QuestionFormData, value: unknown) => {
      setFormData((prev) => ({
        ...prev,
        questions: prev.questions.map((q, i) =>
          i === index ? { ...q, [field]: value } : q
        ),
      }));
    },
    []
  );

  const updateOption = useCallback(
    (qIndex: number, oIndex: number, value: string) => {
      setFormData((prev) => ({
        ...prev,
        questions: prev.questions.map((q, i) =>
          i === qIndex
            ? {
                ...q,
                options: q.options.map((o, j) => (j === oIndex ? value : o)),
              }
            : q
        ),
      }));
    },
    []
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!formData.title.trim()) return;

      setLoading(true);
      try {
        if (editingId) {
          await updateQuiz({
            id: editingId as Id<"quizzes">,
            title: formData.title,
            passingScore: parseInt(formData.passingScore, 10) || 60,
          });
        } else {
          if (!formData.lessonId || formData.questions.length === 0) return;

          const validQuestions = formData.questions
            .filter((q) => q.question.trim() && q.options.every((o) => o.trim()))
            .map((q) => ({
              question: q.question,
              options: q.options,
              correctIndex: q.correctIndex,
              explanation: q.explanation || undefined,
            }));

          if (validQuestions.length === 0) return;

          await createQuiz({
            lessonId: formData.lessonId as Id<"lessons">,
            courseId: courseId as Id<"courses">,
            title: formData.title,
            passingScore: parseInt(formData.passingScore, 10) || 60,
            questions: validQuestions,
          });
        }
        closeModal();
      } catch {
        // Silently handle - mock data mode
      } finally {
        setLoading(false);
      }
    },
    [editingId, formData, courseId, createQuiz, updateQuiz, closeModal]
  );

  const handleDelete = useCallback(
    async (quizId: string) => {
      setLoading(true);
      try {
        await removeQuiz({ id: quizId as Id<"quizzes"> });
      } catch {
        // Silently handle
      } finally {
        setLoading(false);
        setDeleteConfirm(null);
      }
    },
    [removeQuiz]
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
            {course?.title ?? "טוען..."}
          </span>
        </nav>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
              ניהול בחנים
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {quizzes.length} בחנים בקורס &quot;{course?.title}&quot;
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
            הוסף בוחן
          </button>
        </div>
      </div>

      {/* Quizzes Table */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/50">
                <th className="px-5 py-3 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  בוחן
                </th>
                <th className="hidden px-5 py-3 text-sm font-medium text-zinc-600 sm:table-cell dark:text-zinc-400">
                  שיעור
                </th>
                <th className="hidden px-5 py-3 text-sm font-medium text-zinc-600 md:table-cell dark:text-zinc-400">
                  שאלות
                </th>
                <th className="px-5 py-3 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  ציון מעבר
                </th>
                <th className="px-5 py-3 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  פעולות
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {quizzes.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-12 text-center text-sm text-zinc-500 dark:text-zinc-400"
                  >
                    אין בחנים בקורס. לחץ &quot;הוסף בוחן&quot; ליצירת בוחן חדש.
                  </td>
                </tr>
              ) : (
                quizzes.map((quiz) => (
                  <tr
                    key={quiz._id}
                    className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/30"
                  >
                    <td className="px-5 py-4">
                      <p className="font-medium text-zinc-900 dark:text-white">
                        {quiz.title}
                      </p>
                    </td>
                    <td className="hidden px-5 py-4 sm:table-cell">
                      <span className="text-sm text-zinc-700 dark:text-zinc-300">
                        {quiz.lessonTitle}
                      </span>
                    </td>
                    <td className="hidden px-5 py-4 md:table-cell">
                      <Badge variant="default">
                        {quiz.questionCount} שאלות
                      </Badge>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-zinc-700 dark:text-zinc-300">
                        {quiz.passingScore}%
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(quiz)}
                          className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-white"
                          aria-label={`ערוך "${quiz.title}"`}
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
                          onClick={() => setDeleteConfirm(quiz._id)}
                          className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                          aria-label={`מחק "${quiz.title}"`}
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
            className="relative mx-4 max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900"
            role="dialog"
            aria-modal="true"
            aria-label={editingId ? "עריכת בוחן" : "יצירת בוחן חדש"}
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                {editingId ? "עריכת בוחן" : "בוחן חדש"}
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

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Quiz Title */}
              <div>
                <label
                  htmlFor="quiz-title"
                  className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  שם הבוחן
                </label>
                <input
                  id="quiz-title"
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  placeholder="הזן שם בוחן"
                />
              </div>

              {/* Lesson selection (only for create) */}
              {!editingId && (
                <div>
                  <label
                    htmlFor="quiz-lesson"
                    className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                  >
                    שיוך לשיעור
                  </label>
                  <select
                    id="quiz-lesson"
                    required
                    value={formData.lessonId}
                    onChange={(e) =>
                      setFormData({ ...formData, lessonId: e.target.value })
                    }
                    className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  >
                    {lessons.map((lesson) => (
                      <option key={lesson._id} value={lesson._id}>
                        שיעור {lesson.order + 1}: {lesson.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Passing Score */}
              <div>
                <label
                  htmlFor="quiz-passing-score"
                  className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  ציון מעבר (%)
                </label>
                <input
                  id="quiz-passing-score"
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={formData.passingScore}
                  onChange={(e) =>
                    setFormData({ ...formData, passingScore: e.target.value })
                  }
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  placeholder="60"
                  dir="ltr"
                />
              </div>

              {/* Questions (only for create) */}
              {!editingId && (
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      שאלות ({formData.questions.length})
                    </h3>
                    <button
                      type="button"
                      onClick={addQuestion}
                      className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                    >
                      + הוסף שאלה
                    </button>
                  </div>

                  <div className="space-y-4">
                    {formData.questions.map((q, qIndex) => (
                      <div
                        key={qIndex}
                        className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-700"
                      >
                        <div className="mb-3 flex items-center justify-between">
                          <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                            שאלה {qIndex + 1}
                          </span>
                          {formData.questions.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeQuestion(qIndex)}
                              className="text-xs text-red-500 hover:text-red-700"
                            >
                              הסר
                            </button>
                          )}
                        </div>

                        {/* Question text */}
                        <input
                          type="text"
                          value={q.question}
                          onChange={(e) =>
                            updateQuestion(qIndex, "question", e.target.value)
                          }
                          className="mb-3 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                          placeholder="הזן שאלה"
                        />

                        {/* Options */}
                        <div className="mb-3 space-y-2">
                          {q.options.map((option, oIndex) => (
                            <div key={oIndex} className="flex items-center gap-2">
                              <input
                                type="radio"
                                name={`correct-${qIndex}`}
                                checked={q.correctIndex === oIndex}
                                onChange={() =>
                                  updateQuestion(qIndex, "correctIndex", oIndex)
                                }
                                className="h-4 w-4 border-zinc-300 text-zinc-900 focus:ring-zinc-500 dark:border-zinc-700"
                                aria-label={`תשובה נכונה: אפשרות ${oIndex + 1}`}
                              />
                              <input
                                type="text"
                                value={option}
                                onChange={(e) =>
                                  updateOption(qIndex, oIndex, e.target.value)
                                }
                                className="flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                                placeholder={`אפשרות ${oIndex + 1}`}
                              />
                            </div>
                          ))}
                        </div>

                        {/* Explanation */}
                        <input
                          type="text"
                          value={q.explanation}
                          onChange={(e) =>
                            updateQuestion(qIndex, "explanation", e.target.value)
                          }
                          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                          placeholder="הסבר לתשובה הנכונה (אופציונלי)"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
                      : "צור בוחן"}
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
            aria-label="אישור מחיקת בוחן"
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
              מחיקת בוחן
            </h3>
            <p className="mb-5 text-sm text-zinc-600 dark:text-zinc-400">
              פעולה זו תמחק את הבוחן, כל השאלות ותוצאות הסטודנטים הקשורים אליו.
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
