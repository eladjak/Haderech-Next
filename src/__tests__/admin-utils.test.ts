import { describe, it, expect } from "vitest";
import {
  formatRelativeTime,
  formatShortRelativeTime,
  filterStudents,
  sortStudentsByProgress,
  findAtRiskStudents,
  enrollmentRatio,
  certificateRate,
  countCoursesByStatus,
  countActivitiesByType,
  getStudentInitial,
  type AdminStats,
  type StudentRecord,
  type CourseRecord,
  type ActivityRecord,
} from "@/lib/admin-utils";

// ─── Fixtures ──────────────────────────────────────────────────────────────────

const NOW = 1708000000000; // Fixed "now" for deterministic tests

const makeStudent = (
  overrides: Partial<StudentRecord> = {}
): StudentRecord => ({
  _id: "s1",
  name: "דנה כהן",
  email: "dana@example.com",
  coursesEnrolled: 2,
  averageProgress: 50,
  lastActive: NOW - 1000 * 60 * 30,
  ...overrides,
});

const makeStats = (overrides: Partial<AdminStats> = {}): AdminStats => ({
  totalStudents: 10,
  totalCourses: 3,
  totalEnrollments: 25,
  totalCertificates: 5,
  averageProgress: 65,
  completionRate: 40,
  ...overrides,
});

const makeCourse = (
  overrides: Partial<CourseRecord> = {}
): CourseRecord => ({
  _id: "c1",
  title: "קורס בדיקה",
  description: "תיאור קורס",
  published: true,
  studentsEnrolled: 10,
  averageScore: 70,
  ...overrides,
});

// ─── formatRelativeTime ────────────────────────────────────────────────────────

describe("formatRelativeTime", () => {
  it("returns 'now' for timestamps less than 1 minute ago", () => {
    expect(formatRelativeTime(NOW - 1000 * 30, NOW)).toBe("עכשיו");
  });

  it("returns minutes for timestamps less than 1 hour ago", () => {
    expect(formatRelativeTime(NOW - 1000 * 60 * 15, NOW)).toBe("לפני 15 דקות");
  });

  it("returns hours for timestamps less than 24 hours ago", () => {
    expect(formatRelativeTime(NOW - 1000 * 60 * 60 * 3, NOW)).toBe(
      "לפני 3 שעות"
    );
  });

  it("returns days for timestamps older than 24 hours", () => {
    expect(formatRelativeTime(NOW - 1000 * 60 * 60 * 24 * 5, NOW)).toBe(
      "לפני 5 ימים"
    );
  });

  it("returns 'now' for timestamps at exactly the current time", () => {
    expect(formatRelativeTime(NOW, NOW)).toBe("עכשיו");
  });
});

// ─── formatShortRelativeTime ───────────────────────────────────────────────────

describe("formatShortRelativeTime", () => {
  it("returns 'now' for very recent timestamps", () => {
    expect(formatShortRelativeTime(NOW - 1000 * 10, NOW)).toBe("עכשיו");
  });

  it("returns short minutes notation", () => {
    expect(formatShortRelativeTime(NOW - 1000 * 60 * 5, NOW)).toBe(
      "לפני 5 דק'"
    );
  });

  it("returns short hours notation", () => {
    expect(formatShortRelativeTime(NOW - 1000 * 60 * 60 * 2, NOW)).toBe(
      "לפני 2 שע'"
    );
  });

  it("returns days for timestamps 1-6 days ago", () => {
    expect(formatShortRelativeTime(NOW - 1000 * 60 * 60 * 24 * 3, NOW)).toBe(
      "לפני 3 ימים"
    );
  });

  it("returns formatted date for timestamps older than a week", () => {
    // For timestamps older than 7 days, should return a formatted date
    const result = formatShortRelativeTime(
      NOW - 1000 * 60 * 60 * 24 * 10,
      NOW
    );
    // Should NOT be a relative string, but a formatted date
    expect(result).not.toContain("לפני");
    expect(result).not.toContain("עכשיו");
  });
});

// ─── filterStudents ────────────────────────────────────────────────────────────

describe("filterStudents", () => {
  const students = [
    makeStudent({ _id: "s1", name: "דנה כהן", email: "dana@example.com" }),
    makeStudent({ _id: "s2", name: "אבי לוי", email: "avi@example.com" }),
    makeStudent({ _id: "s3", name: null, email: "unknown@example.com" }),
  ];

  it("returns all students when search is empty", () => {
    expect(filterStudents(students, "")).toHaveLength(3);
    expect(filterStudents(students, "   ")).toHaveLength(3);
  });

  it("filters by name (Hebrew)", () => {
    const result = filterStudents(students, "דנה");
    expect(result).toHaveLength(1);
    expect(result[0]._id).toBe("s1");
  });

  it("filters by email", () => {
    const result = filterStudents(students, "avi@");
    expect(result).toHaveLength(1);
    expect(result[0]._id).toBe("s2");
  });

  it("is case-insensitive for email", () => {
    const result = filterStudents(students, "AVI@EXAMPLE");
    expect(result).toHaveLength(1);
  });

  it("returns empty array when no matches", () => {
    expect(filterStudents(students, "nonexistent")).toHaveLength(0);
  });

  it("handles students with null names by matching email", () => {
    const result = filterStudents(students, "unknown");
    expect(result).toHaveLength(1);
    expect(result[0]._id).toBe("s3");
  });
});

// ─── sortStudentsByProgress ────────────────────────────────────────────────────

describe("sortStudentsByProgress", () => {
  it("sorts students descending by average progress", () => {
    const students = [
      makeStudent({ _id: "low", averageProgress: 20 }),
      makeStudent({ _id: "high", averageProgress: 90 }),
      makeStudent({ _id: "mid", averageProgress: 55 }),
    ];
    const sorted = sortStudentsByProgress(students);
    expect(sorted.map((s) => s._id)).toEqual(["high", "mid", "low"]);
  });

  it("does not mutate the original array", () => {
    const students = [
      makeStudent({ _id: "a", averageProgress: 30 }),
      makeStudent({ _id: "b", averageProgress: 80 }),
    ];
    const copy = [...students];
    sortStudentsByProgress(students);
    expect(students).toEqual(copy);
  });

  it("returns empty array for empty input", () => {
    expect(sortStudentsByProgress([])).toEqual([]);
  });
});

// ─── findAtRiskStudents ────────────────────────────────────────────────────────

describe("findAtRiskStudents", () => {
  const students = [
    makeStudent({ _id: "good", averageProgress: 85 }),
    makeStudent({ _id: "ok", averageProgress: 50 }),
    makeStudent({ _id: "bad", averageProgress: 15 }),
    makeStudent({ _id: "zero", averageProgress: 0 }),
  ];

  it("returns students below the threshold", () => {
    const atRisk = findAtRiskStudents(students, 30);
    expect(atRisk).toHaveLength(2);
    expect(atRisk.map((s) => s._id)).toEqual(["bad", "zero"]);
  });

  it("returns empty when all students are above threshold", () => {
    expect(findAtRiskStudents(students, 0)).toHaveLength(0);
  });

  it("returns all when threshold is very high", () => {
    expect(findAtRiskStudents(students, 100)).toHaveLength(4);
  });
});

// ─── enrollmentRatio ───────────────────────────────────────────────────────────

describe("enrollmentRatio", () => {
  it("returns enrollments per student", () => {
    expect(enrollmentRatio(makeStats())).toBe(2.5);
  });

  it("returns 0 when there are no students", () => {
    expect(enrollmentRatio(makeStats({ totalStudents: 0 }))).toBe(0);
  });

  it("returns 1 when enrollments equals students", () => {
    expect(
      enrollmentRatio(makeStats({ totalStudents: 5, totalEnrollments: 5 }))
    ).toBe(1);
  });
});

// ─── certificateRate ───────────────────────────────────────────────────────────

describe("certificateRate", () => {
  it("returns certificate percentage of enrollments", () => {
    // 5 certificates / 25 enrollments = 20%
    expect(certificateRate(makeStats())).toBe(20);
  });

  it("returns 0 when there are no enrollments", () => {
    expect(certificateRate(makeStats({ totalEnrollments: 0 }))).toBe(0);
  });

  it("returns 100 when all enrollments have certificates", () => {
    expect(
      certificateRate(
        makeStats({ totalEnrollments: 10, totalCertificates: 10 })
      )
    ).toBe(100);
  });
});

// ─── countCoursesByStatus ──────────────────────────────────────────────────────

describe("countCoursesByStatus", () => {
  it("counts published and draft courses correctly", () => {
    const courses = [
      makeCourse({ _id: "c1", published: true }),
      makeCourse({ _id: "c2", published: true }),
      makeCourse({ _id: "c3", published: false }),
    ];
    expect(countCoursesByStatus(courses)).toEqual({
      published: 2,
      draft: 1,
    });
  });

  it("returns zeros for empty array", () => {
    expect(countCoursesByStatus([])).toEqual({ published: 0, draft: 0 });
  });

  it("handles all published", () => {
    const courses = [
      makeCourse({ published: true }),
      makeCourse({ _id: "c2", published: true }),
    ];
    expect(countCoursesByStatus(courses)).toEqual({ published: 2, draft: 0 });
  });
});

// ─── countActivitiesByType ─────────────────────────────────────────────────────

describe("countActivitiesByType", () => {
  it("counts enrollment and certificate activities", () => {
    const activities: ActivityRecord[] = [
      { type: "enrollment", userName: "a", courseName: "b", timestamp: 0 },
      { type: "enrollment", userName: "c", courseName: "d", timestamp: 0 },
      { type: "certificate", userName: "e", courseName: "f", timestamp: 0 },
    ];
    expect(countActivitiesByType(activities)).toEqual({
      enrollments: 2,
      certificates: 1,
    });
  });

  it("returns zeros for empty array", () => {
    expect(countActivitiesByType([])).toEqual({
      enrollments: 0,
      certificates: 0,
    });
  });
});

// ─── getStudentInitial ─────────────────────────────────────────────────────────

describe("getStudentInitial", () => {
  it("returns the first character of the name uppercased", () => {
    expect(getStudentInitial({ name: "דנה כהן", email: "d@x.com" })).toBe("ד");
  });

  it("falls back to email when name is null", () => {
    expect(getStudentInitial({ name: null, email: "avi@example.com" })).toBe(
      "A"
    );
  });

  it("uppercases latin characters", () => {
    expect(getStudentInitial({ name: "alice", email: "a@x.com" })).toBe("A");
  });
});
