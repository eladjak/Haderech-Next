/**
 * Pure utility functions for course progress calculations.
 * These are extracted so they can be unit-tested independently.
 */

export interface SectionProgressInput {
  courseId: string;
  courseTitle: string;
  completedLessons: number;
  totalLessons: number;
  completionPercent: number;
  hasCertificate: boolean;
  enrolledAt?: number;
}

/**
 * Calculates overall completion percentage across all enrolled courses.
 * Returns 0 when there are no lessons.
 */
export function calcOverallPercent(sections: SectionProgressInput[]): number {
  const totalCompleted = sections.reduce(
    (sum, s) => sum + s.completedLessons,
    0
  );
  const totalLessons = sections.reduce((sum, s) => sum + s.totalLessons, 0);
  if (totalLessons === 0) return 0;
  return Math.round((totalCompleted / totalLessons) * 100);
}

/**
 * Returns the count of courses that have an earned certificate.
 */
export function countCertificates(sections: SectionProgressInput[]): number {
  return sections.filter((s) => s.hasCertificate).length;
}

/**
 * Returns a human-readable streak message based on the streak count.
 */
export function streakMessage(streak: number): string {
  if (streak === 0) return "למד היום כדי להתחיל streak!";
  if (streak >= 7) return "מדהים! שמור על הקצב";
  return "כל הכבוד, המשך כך!";
}

/**
 * Picks the best "continue learning" course.
 * Prefers an in-progress course (some lessons done, not 100%), else not-started.
 * Returns null when there are no sections.
 */
export function pickContinueCourse(
  sections: SectionProgressInput[]
): SectionProgressInput | null {
  const inProgress = sections.filter(
    (s) => s.completedLessons > 0 && s.completionPercent < 100
  );
  if (inProgress.length > 0) return inProgress[0];

  const notStarted = sections.filter((s) => s.completedLessons === 0);
  if (notStarted.length > 0) return notStarted[0];

  return null;
}

/**
 * Clamps a value to the [0, 100] range.
 */
export function clampPercent(value: number): number {
  return Math.min(100, Math.max(0, value));
}

/**
 * Computes total completed lessons across all sections.
 */
export function totalCompletedLessons(
  sections: SectionProgressInput[]
): number {
  return sections.reduce((sum, s) => sum + s.completedLessons, 0);
}
