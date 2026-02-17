"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Badge } from "@/components/ui/badge";

// Mock students data - used when Convex backend is not connected
const mockStudents = [
  {
    _id: "mock_student_1",
    clerkId: "clerk_1",
    email: "dana@example.com",
    name: "דנה כהן",
    imageUrl: undefined as string | undefined,
    role: "student" as const,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 45,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
    coursesEnrolled: 2,
    averageProgress: 85,
    lastActive: Date.now() - 1000 * 60 * 30,
  },
  {
    _id: "mock_student_2",
    clerkId: "clerk_2",
    email: "avi@example.com",
    name: "אבי לוי",
    imageUrl: undefined as string | undefined,
    role: "student" as const,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 30,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 1,
    coursesEnrolled: 3,
    averageProgress: 92,
    lastActive: Date.now() - 1000 * 60 * 60 * 2,
  },
  {
    _id: "mock_student_3",
    clerkId: "clerk_3",
    email: "michal@example.com",
    name: "מיכל ברק",
    imageUrl: undefined as string | undefined,
    role: "student" as const,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 20,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
    coursesEnrolled: 1,
    averageProgress: 45,
    lastActive: Date.now() - 1000 * 60 * 60 * 24,
  },
  {
    _id: "mock_student_4",
    clerkId: "clerk_4",
    email: "yossi@example.com",
    name: "יוסי אברהם",
    imageUrl: undefined as string | undefined,
    role: "student" as const,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 15,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
    coursesEnrolled: 2,
    averageProgress: 67,
    lastActive: Date.now() - 1000 * 60 * 60 * 48,
  },
  {
    _id: "mock_student_5",
    clerkId: "clerk_5",
    email: "ronit@example.com",
    name: "רונית שמש",
    imageUrl: undefined as string | undefined,
    role: "student" as const,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 60,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 1,
    coursesEnrolled: 3,
    averageProgress: 100,
    lastActive: Date.now() - 1000 * 60 * 15,
  },
  {
    _id: "mock_student_6",
    clerkId: "clerk_6",
    email: "ido@example.com",
    name: "עידו פרץ",
    imageUrl: undefined as string | undefined,
    role: "student" as const,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 10,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
    coursesEnrolled: 1,
    averageProgress: 23,
    lastActive: Date.now() - 1000 * 60 * 60 * 72,
  },
  {
    _id: "mock_student_7",
    clerkId: "clerk_7",
    email: "sara@example.com",
    name: "שרה גולד",
    imageUrl: undefined as string | undefined,
    role: "student" as const,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 25,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 4,
    coursesEnrolled: 2,
    averageProgress: 56,
    lastActive: Date.now() - 1000 * 60 * 60 * 6,
  },
  {
    _id: "mock_student_8",
    clerkId: "clerk_8",
    email: "david@example.com",
    name: "דוד חן",
    imageUrl: undefined as string | undefined,
    role: "student" as const,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 35,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 1,
    coursesEnrolled: 3,
    averageProgress: 78,
    lastActive: Date.now() - 1000 * 60 * 60,
  },
];

// Mock student courses for detail view
const mockStudentCourses = [
  {
    title: "אומנות ההקשבה",
    progress: 85,
    enrolledAt: Date.now() - 1000 * 60 * 60 * 24 * 30,
    completed: false,
  },
  {
    title: "תקשורת זוגית מתקדמת",
    progress: 100,
    enrolledAt: Date.now() - 1000 * 60 * 60 * 24 * 45,
    completed: true,
  },
  {
    title: "מפתחות לאינטימיות",
    progress: 42,
    enrolledAt: Date.now() - 1000 * 60 * 60 * 24 * 10,
    completed: false,
  },
];

function formatDate(timestamp: number): string {
  return new Intl.DateTimeFormat("he-IL", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(timestamp));
}

function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return "עכשיו";
  if (minutes < 60) return `לפני ${minutes} דק'`;
  if (hours < 24) return `לפני ${hours} שע'`;
  if (days < 7) return `לפני ${days} ימים`;
  return formatDate(timestamp);
}

type Student = (typeof mockStudents)[number];

export default function AdminStudentsPage() {
  const convexStudents = useQuery(api.admin.listStudents);
  const students = (convexStudents ?? mockStudents) as Student[];

  const [search, setSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const filteredStudents = students.filter((student) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      (student.name ?? "").toLowerCase().includes(term) ||
      student.email.toLowerCase().includes(term)
    );
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          ניהול סטודנטים
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {students.length} סטודנטים רשומים
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-sm">
          <svg
            className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
          <input
            type="search"
            placeholder="חיפוש לפי שם או אימייל..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 bg-white py-2.5 pr-10 pl-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder:text-zinc-500"
            aria-label="חיפוש סטודנטים"
          />
        </div>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Students Table */}
        <div className="flex-1 overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/50">
                  <th className="px-5 py-3 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                    סטודנט
                  </th>
                  <th className="hidden px-5 py-3 text-sm font-medium text-zinc-600 sm:table-cell dark:text-zinc-400">
                    קורסים
                  </th>
                  <th className="hidden px-5 py-3 text-sm font-medium text-zinc-600 md:table-cell dark:text-zinc-400">
                    התקדמות
                  </th>
                  <th className="hidden px-5 py-3 text-sm font-medium text-zinc-600 lg:table-cell dark:text-zinc-400">
                    פעילות אחרונה
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-5 py-12 text-center text-sm text-zinc-500 dark:text-zinc-400"
                    >
                      {search
                        ? "לא נמצאו סטודנטים התואמים לחיפוש"
                        : "אין סטודנטים רשומים"}
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => (
                    <tr
                      key={student._id}
                      onClick={() => setSelectedStudent(student)}
                      className={`cursor-pointer transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/30 ${
                        selectedStudent?._id === student._id
                          ? "bg-zinc-50 dark:bg-zinc-800/30"
                          : ""
                      }`}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-sm font-medium text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
                            {(student.name ?? student.email)
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-zinc-900 dark:text-white">
                              {student.name ?? "ללא שם"}
                            </p>
                            <p
                              className="text-xs text-zinc-500 dark:text-zinc-400"
                              dir="ltr"
                            >
                              {student.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="hidden px-5 py-4 sm:table-cell">
                        <span className="text-sm text-zinc-700 dark:text-zinc-300">
                          {student.coursesEnrolled}
                        </span>
                      </td>
                      <td className="hidden px-5 py-4 md:table-cell">
                        <div className="flex items-center gap-2">
                          <ProgressBar
                            value={student.averageProgress}
                            size="sm"
                            className="w-20"
                          />
                          <span className="text-xs text-zinc-500 dark:text-zinc-400">
                            {student.averageProgress}%
                          </span>
                        </div>
                      </td>
                      <td className="hidden px-5 py-4 lg:table-cell">
                        <span className="text-sm text-zinc-500 dark:text-zinc-400">
                          {formatRelativeTime(student.lastActive)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Student Detail Panel */}
        {selectedStudent && (
          <div className="w-full shrink-0 lg:w-80">
            <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
              {/* Student Header */}
              <div className="border-b border-zinc-200 p-5 dark:border-zinc-800">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-200 text-lg font-medium text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
                      {(selectedStudent.name ?? selectedStudent.email)
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-zinc-900 dark:text-white">
                        {selectedStudent.name ?? "ללא שם"}
                      </h3>
                      <p
                        className="text-sm text-zinc-500 dark:text-zinc-400"
                        dir="ltr"
                      >
                        {selectedStudent.email}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedStudent(null)}
                    className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                    aria-label="סגור פרטי סטודנט"
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-px border-b border-zinc-200 bg-zinc-200 dark:border-zinc-800 dark:bg-zinc-800">
                <div className="bg-white p-4 text-center dark:bg-zinc-900">
                  <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                    {selectedStudent.coursesEnrolled}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    קורסים
                  </p>
                </div>
                <div className="bg-white p-4 text-center dark:bg-zinc-900">
                  <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                    {selectedStudent.averageProgress}%
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    התקדמות
                  </p>
                </div>
              </div>

              {/* Info */}
              <div className="space-y-3 border-b border-zinc-200 p-5 dark:border-zinc-800">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500 dark:text-zinc-400">
                    הצטרף
                  </span>
                  <span className="text-zinc-900 dark:text-white">
                    {formatDate(selectedStudent.createdAt)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500 dark:text-zinc-400">
                    פעילות אחרונה
                  </span>
                  <span className="text-zinc-900 dark:text-white">
                    {formatRelativeTime(selectedStudent.lastActive)}
                  </span>
                </div>
              </div>

              {/* Enrolled Courses */}
              <div className="p-5">
                <h4 className="mb-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  קורסים רשומים
                </h4>
                <div className="space-y-3">
                  {mockStudentCourses
                    .slice(0, selectedStudent.coursesEnrolled)
                    .map((course, index) => (
                      <div
                        key={`${selectedStudent._id}-course-${index}`}
                        className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/50"
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <p className="text-sm font-medium text-zinc-900 dark:text-white">
                            {course.title}
                          </p>
                          <Badge
                            variant={course.completed ? "success" : "default"}
                          >
                            {course.completed ? "הושלם" : "בתהליך"}
                          </Badge>
                        </div>
                        <ProgressBar value={course.progress} size="sm" />
                        <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                          נרשם: {formatDate(course.enrolledAt)}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
