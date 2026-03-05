"use client";

import { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Badge } from "@/components/ui/badge";

// נתוני מוק - כשהבקאנד לא מחובר
const mockUsers = [
  {
    _id: "mock_user_1" as string,
    clerkId: "clerk_admin_1",
    email: "admin@haderech.co.il",
    name: "אלעד - מנהל",
    imageUrl: undefined as string | undefined,
    role: "admin" as const,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 90,
    updatedAt: Date.now() - 1000 * 60 * 60 * 2,
    enrollmentCount: 0,
    completedLessons: 0,
    preferences: undefined as Record<string, unknown> | undefined,
  },
  {
    _id: "mock_user_2" as string,
    clerkId: "clerk_2",
    email: "dana@example.com",
    name: "דנה כהן",
    imageUrl: undefined as string | undefined,
    role: "student" as const,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 45,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
    enrollmentCount: 2,
    completedLessons: 8,
    preferences: undefined as Record<string, unknown> | undefined,
  },
  {
    _id: "mock_user_3" as string,
    clerkId: "clerk_3",
    email: "avi@example.com",
    name: "אבי לוי",
    imageUrl: undefined as string | undefined,
    role: "student" as const,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 30,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 1,
    enrollmentCount: 3,
    completedLessons: 15,
    preferences: undefined as Record<string, unknown> | undefined,
  },
  {
    _id: "mock_user_4" as string,
    clerkId: "clerk_4",
    email: "michal@example.com",
    name: "מיכל ברק",
    imageUrl: undefined as string | undefined,
    role: "student" as const,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 20,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
    enrollmentCount: 1,
    completedLessons: 3,
    preferences: undefined as Record<string, unknown> | undefined,
  },
  {
    _id: "mock_user_5" as string,
    clerkId: "clerk_5",
    email: "yossi@example.com",
    name: "יוסי אברהם",
    imageUrl: undefined as string | undefined,
    role: "student" as const,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 15,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
    enrollmentCount: 2,
    completedLessons: 10,
    preferences: undefined as Record<string, unknown> | undefined,
  },
  {
    _id: "mock_user_6" as string,
    clerkId: "clerk_6",
    email: "ronit@example.com",
    name: "רונית שמש",
    imageUrl: undefined as string | undefined,
    role: "student" as const,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 60,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 1,
    enrollmentCount: 3,
    completedLessons: 24,
    preferences: undefined as Record<string, unknown> | undefined,
  },
  {
    _id: "mock_user_7" as string,
    clerkId: "clerk_7",
    email: "ido@example.com",
    name: "עידו פרץ",
    imageUrl: undefined as string | undefined,
    role: "student" as const,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 10,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
    enrollmentCount: 1,
    completedLessons: 2,
    preferences: undefined as Record<string, unknown> | undefined,
  },
  {
    _id: "mock_user_8" as string,
    clerkId: "clerk_8",
    email: "sara@example.com",
    name: "שרה גולד",
    imageUrl: undefined as string | undefined,
    role: "student" as const,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 25,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 4,
    enrollmentCount: 2,
    completedLessons: 6,
    preferences: undefined as Record<string, unknown> | undefined,
  },
];

type User = (typeof mockUsers)[number];

function formatDate(timestamp: number): string {
  return new Intl.DateTimeFormat("he-IL", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(timestamp));
}

export default function AdminUsersPage() {
  const convexUsers = useQuery(api.adminUsers.listAll);
  const updateRoleMutation = useMutation(api.adminUsers.updateRole);

  const users = (convexUsers ?? mockUsers) as User[];

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "student" | "admin">(
    "all"
  );
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [roleChangeConfirm, setRoleChangeConfirm] = useState<{
    user: User;
    newRole: "student" | "admin";
  } | null>(null);
  const [saving, setSaving] = useState(false);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      // סינון לפי תפקיד
      if (roleFilter !== "all" && user.role !== roleFilter) return false;

      // סינון לפי חיפוש
      if (search.trim()) {
        const term = search.toLowerCase();
        const nameMatch = (user.name ?? "").toLowerCase().includes(term);
        const emailMatch = user.email.toLowerCase().includes(term);
        if (!nameMatch && !emailMatch) return false;
      }

      return true;
    });
  }, [users, search, roleFilter]);

  const handleRoleChange = useCallback(
    async (userId: string, newRole: "student" | "admin") => {
      setSaving(true);
      try {
        await updateRoleMutation({
          userId: userId as Parameters<typeof updateRoleMutation>[0]["userId"],
          role: newRole,
        });
        setRoleChangeConfirm(null);
        // עדכן את המשתמש הנבחר אם נדרש
        if (selectedUser?._id === userId) {
          setSelectedUser({ ...selectedUser, role: newRole });
        }
      } catch {
        // שגיאה - מצב מוק
      } finally {
        setSaving(false);
      }
    },
    [updateRoleMutation, selectedUser]
  );

  const adminCount = users.filter((u) => u.role === "admin").length;
  const studentCount = users.filter((u) => u.role === "student").length;

  return (
    <div>
      {/* כותרת */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          ניהול משתמשים
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {users.length} משתמשים במערכת ({adminCount} מנהלים, {studentCount}{" "}
          סטודנטים)
        </p>
      </div>

      {/* חיפוש וסינון */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        {/* שדה חיפוש */}
        <div className="relative max-w-sm flex-1">
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
            aria-label="חיפוש משתמשים"
          />
        </div>

        {/* כפתורי סינון */}
        <div className="flex gap-2">
          {(["all", "student", "admin"] as const).map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => setRoleFilter(role)}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                roleFilter === role
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                  : "border border-zinc-300 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
              }`}
            >
              {role === "all"
                ? "הכל"
                : role === "admin"
                  ? "מנהלים"
                  : "סטודנטים"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* טבלת משתמשים */}
        <div className="flex-1 overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/50">
                  <th className="px-5 py-3 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                    משתמש
                  </th>
                  <th className="hidden px-5 py-3 text-sm font-medium text-zinc-600 sm:table-cell dark:text-zinc-400">
                    תפקיד
                  </th>
                  <th className="hidden px-5 py-3 text-sm font-medium text-zinc-600 md:table-cell dark:text-zinc-400">
                    הצטרף
                  </th>
                  <th className="hidden px-5 py-3 text-sm font-medium text-zinc-600 lg:table-cell dark:text-zinc-400">
                    קורסים
                  </th>
                  <th className="hidden px-5 py-3 text-sm font-medium text-zinc-600 lg:table-cell dark:text-zinc-400">
                    שיעורים שהושלמו
                  </th>
                  <th className="px-5 py-3 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                    פעולות
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-12 text-center text-sm text-zinc-500 dark:text-zinc-400"
                    >
                      {search || roleFilter !== "all"
                        ? "לא נמצאו משתמשים התואמים לחיפוש"
                        : "אין משתמשים במערכת"}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr
                      key={user._id}
                      onClick={() => setSelectedUser(user)}
                      className={`cursor-pointer transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/30 ${
                        selectedUser?._id === user._id
                          ? "bg-zinc-50 dark:bg-zinc-800/30"
                          : ""
                      }`}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-sm font-medium text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
                            {(user.name ?? user.email)
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-zinc-900 dark:text-white">
                              {user.name ?? "ללא שם"}
                            </p>
                            <p
                              className="text-xs text-zinc-500 dark:text-zinc-400"
                              dir="ltr"
                            >
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="hidden px-5 py-4 sm:table-cell">
                        <Badge
                          variant={
                            user.role === "admin" ? "default" : "success"
                          }
                        >
                          {user.role === "admin" ? "מנהל" : "סטודנט"}
                        </Badge>
                      </td>
                      <td className="hidden px-5 py-4 md:table-cell">
                        <span className="text-sm text-zinc-500 dark:text-zinc-400">
                          {formatDate(user.createdAt)}
                        </span>
                      </td>
                      <td className="hidden px-5 py-4 lg:table-cell">
                        <span className="text-sm text-zinc-700 dark:text-zinc-300">
                          {user.enrollmentCount}
                        </span>
                      </td>
                      <td className="hidden px-5 py-4 lg:table-cell">
                        <span className="text-sm text-zinc-700 dark:text-zinc-300">
                          {user.completedLessons}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setRoleChangeConfirm({
                              user,
                              newRole:
                                user.role === "admin" ? "student" : "admin",
                            });
                          }}
                          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                            user.role === "admin"
                              ? "border border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-900/20"
                              : "border border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/20"
                          }`}
                          aria-label={
                            user.role === "admin"
                              ? `הורד ${user.name ?? user.email} מתפקיד מנהל`
                              : `קדם ${user.name ?? user.email} למנהל`
                          }
                        >
                          {user.role === "admin"
                            ? "הורד למשתמש"
                            : "קדם למנהל"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* פאנל פרטי משתמש */}
        {selectedUser && (
          <div className="w-full shrink-0 lg:w-80">
            <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
              {/* כותרת משתמש */}
              <div className="border-b border-zinc-200 p-5 dark:border-zinc-800">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-200 text-lg font-medium text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
                      {(selectedUser.name ?? selectedUser.email)
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-zinc-900 dark:text-white">
                        {selectedUser.name ?? "ללא שם"}
                      </h3>
                      <p
                        className="text-sm text-zinc-500 dark:text-zinc-400"
                        dir="ltr"
                      >
                        {selectedUser.email}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedUser(null)}
                    className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                    aria-label="סגור פרטי משתמש"
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

              {/* סטטיסטיקות */}
              <div className="grid grid-cols-2 gap-px border-b border-zinc-200 bg-zinc-200 dark:border-zinc-800 dark:bg-zinc-800">
                <div className="bg-white p-4 text-center dark:bg-zinc-900">
                  <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                    {selectedUser.enrollmentCount}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    קורסים
                  </p>
                </div>
                <div className="bg-white p-4 text-center dark:bg-zinc-900">
                  <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                    {selectedUser.completedLessons}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    שיעורים שהושלמו
                  </p>
                </div>
              </div>

              {/* פרטים */}
              <div className="space-y-3 border-b border-zinc-200 p-5 dark:border-zinc-800">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500 dark:text-zinc-400">
                    תפקיד
                  </span>
                  <Badge
                    variant={
                      selectedUser.role === "admin" ? "default" : "success"
                    }
                  >
                    {selectedUser.role === "admin" ? "מנהל" : "סטודנט"}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500 dark:text-zinc-400">
                    הצטרף
                  </span>
                  <span className="text-zinc-900 dark:text-white">
                    {formatDate(selectedUser.createdAt)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500 dark:text-zinc-400">
                    עודכן
                  </span>
                  <span className="text-zinc-900 dark:text-white">
                    {formatDate(selectedUser.updatedAt)}
                  </span>
                </div>
              </div>

              {/* פעולות */}
              <div className="p-5">
                <button
                  type="button"
                  onClick={() =>
                    setRoleChangeConfirm({
                      user: selectedUser,
                      newRole:
                        selectedUser.role === "admin" ? "student" : "admin",
                    })
                  }
                  className={`w-full rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                    selectedUser.role === "admin"
                      ? "border border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-900/20"
                      : "border border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/20"
                  }`}
                >
                  {selectedUser.role === "admin"
                    ? "הורד לסטודנט"
                    : "קדם למנהל"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* מודל אישור שינוי תפקיד */}
      {roleChangeConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setRoleChangeConfirm(null)}
            aria-hidden="true"
          />
          <div
            className="relative mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900"
            role="alertdialog"
            aria-modal="true"
            aria-label="אישור שינוי תפקיד"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
              <svg
                className="h-6 w-6 text-blue-600 dark:text-blue-400"
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
            </div>
            <h3 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-white">
              שינוי תפקיד
            </h3>
            <p className="mb-5 text-sm text-zinc-600 dark:text-zinc-400">
              האם לשנות את התפקיד של{" "}
              <span className="font-semibold">
                {roleChangeConfirm.user.name ?? roleChangeConfirm.user.email}
              </span>{" "}
              ל
              <span className="font-semibold">
                {roleChangeConfirm.newRole === "admin" ? "מנהל" : "סטודנט"}
              </span>
              ?
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() =>
                  handleRoleChange(
                    roleChangeConfirm.user._id,
                    roleChangeConfirm.newRole
                  )
                }
                disabled={saving}
                className="flex-1 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
              >
                {saving ? "משנה..." : "אשר שינוי"}
              </button>
              <button
                type="button"
                onClick={() => setRoleChangeConfirm(null)}
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
