/**
 * Pure utility functions for admin panel calculations.
 * These are extracted so they can be unit-tested independently.
 */

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface AdminStats {
  totalStudents: number;
  totalCourses: number;
  totalEnrollments: number;
  totalCertificates: number;
  averageProgress: number;
  completionRate: number;
}

export interface StudentRecord {
  _id: string;
  name: string | null;
  email: string;
  coursesEnrolled: number;
  averageProgress: number;
  lastActive: number;
}

export interface CourseRecord {
  _id: string;
  title: string;
  description: string;
  published: boolean;
  studentsEnrolled: number;
  averageScore: number;
}

export interface ActivityRecord {
  type: "enrollment" | "certificate";
  userName: string;
  courseName: string;
  timestamp: number;
}

// ─── Time Formatting ───────────────────────────────────────────────────────────

/**
 * Formats a timestamp as a relative time string in Hebrew.
 * E.g., "now", "15 minutes ago", "3 hours ago", "2 days ago".
 */
export function formatRelativeTime(timestamp: number, now?: number): string {
  const currentTime = now ?? Date.now();
  const diff = currentTime - timestamp;
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return "עכשיו";
  if (minutes < 60) return `לפני ${minutes} דקות`;
  if (hours < 24) return `לפני ${hours} שעות`;
  return `לפני ${days} ימים`;
}

/**
 * Formats a timestamp as a short relative time string in Hebrew.
 * Falls back to a formatted date for timestamps older than a week.
 */
export function formatShortRelativeTime(
  timestamp: number,
  now?: number
): string {
  const currentTime = now ?? Date.now();
  const diff = currentTime - timestamp;
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return "עכשיו";
  if (minutes < 60) return `לפני ${minutes} דק'`;
  if (hours < 24) return `לפני ${hours} שע'`;
  if (days < 7) return `לפני ${days} ימים`;
  return formatDate(timestamp);
}

/**
 * Formats a timestamp to a localized Hebrew date string.
 */
export function formatDate(timestamp: number): string {
  return new Intl.DateTimeFormat("he-IL", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(timestamp));
}

// ─── Student Filtering & Sorting ───────────────────────────────────────────────

/**
 * Filters students by a search term (matches name or email, case-insensitive).
 * Returns all students if search is empty.
 */
export function filterStudents(
  students: StudentRecord[],
  search: string
): StudentRecord[] {
  const trimmed = search.trim().toLowerCase();
  if (!trimmed) return students;
  return students.filter(
    (s) =>
      (s.name ?? "").toLowerCase().includes(trimmed) ||
      s.email.toLowerCase().includes(trimmed)
  );
}

/**
 * Sorts students by average progress descending (best performers first).
 * Does not mutate the original array.
 */
export function sortStudentsByProgress(
  students: StudentRecord[]
): StudentRecord[] {
  return [...students].sort((a, b) => b.averageProgress - a.averageProgress);
}

/**
 * Returns students with progress below the given threshold (at-risk students).
 */
export function findAtRiskStudents(
  students: StudentRecord[],
  threshold: number
): StudentRecord[] {
  return students.filter((s) => s.averageProgress < threshold);
}

// ─── Stats Calculations ────────────────────────────────────────────────────────

/**
 * Calculates the enrollment-to-student ratio.
 * Returns 0 if there are no students.
 */
export function enrollmentRatio(stats: AdminStats): number {
  if (stats.totalStudents === 0) return 0;
  return Math.round((stats.totalEnrollments / stats.totalStudents) * 100) / 100;
}

/**
 * Calculates the certificate-per-enrollment rate as a percentage.
 * Returns 0 if there are no enrollments.
 */
export function certificateRate(stats: AdminStats): number {
  if (stats.totalEnrollments === 0) return 0;
  return Math.round(
    (stats.totalCertificates / stats.totalEnrollments) * 100
  );
}

/**
 * Counts published and draft courses from a list of course records.
 */
export function countCoursesByStatus(
  courses: CourseRecord[]
): { published: number; draft: number } {
  const published = courses.filter((c) => c.published).length;
  return { published, draft: courses.length - published };
}

/**
 * Counts activity records by type.
 */
export function countActivitiesByType(
  activities: ActivityRecord[]
): { enrollments: number; certificates: number } {
  const enrollments = activities.filter((a) => a.type === "enrollment").length;
  return { enrollments, certificates: activities.length - enrollments };
}

/**
 * Returns the initial letter of a student's display name (name or email).
 * Used for avatar display in the admin panel.
 */
export function getStudentInitial(student: Pick<StudentRecord, "name" | "email">): string {
  const display = student.name ?? student.email;
  return display.charAt(0).toUpperCase();
}
