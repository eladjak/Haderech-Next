import { describe, it, expect } from "vitest";
import {
  calcOverallPercent,
  countCertificates,
  streakMessage,
  pickContinueCourse,
  clampPercent,
  totalCompletedLessons,
  type SectionProgressInput,
} from "@/lib/progress-utils";

// ─── Test fixtures ────────────────────────────────────────────────────────────

const makeCourse = (
  overrides: Partial<SectionProgressInput> = {}
): SectionProgressInput => ({
  courseId: "course1",
  courseTitle: "קורס בדיקה",
  completedLessons: 0,
  totalLessons: 5,
  completionPercent: 0,
  hasCertificate: false,
  ...overrides,
});

// ─── calcOverallPercent ────────────────────────────────────────────────────────

describe("calcOverallPercent", () => {
  it("returns 0 when there are no sections", () => {
    expect(calcOverallPercent([])).toBe(0);
  });

  it("returns 0 when totalLessons is 0 across all sections", () => {
    const sections = [
      makeCourse({ totalLessons: 0, completedLessons: 0 }),
      makeCourse({ totalLessons: 0, completedLessons: 0, courseId: "c2" }),
    ];
    expect(calcOverallPercent(sections)).toBe(0);
  });

  it("returns 100 when all lessons in all courses are completed", () => {
    const sections = [
      makeCourse({ totalLessons: 4, completedLessons: 4, completionPercent: 100 }),
      makeCourse({
        courseId: "c2",
        totalLessons: 6,
        completedLessons: 6,
        completionPercent: 100,
      }),
    ];
    expect(calcOverallPercent(sections)).toBe(100);
  });

  it("rounds to nearest integer", () => {
    // 1 of 3 completed = 33.33% → rounds to 33
    const sections = [
      makeCourse({ totalLessons: 3, completedLessons: 1 }),
    ];
    expect(calcOverallPercent(sections)).toBe(33);
  });

  it("aggregates across multiple courses correctly", () => {
    // Course A: 2/4 = 50%, Course B: 3/6 = 50%  → combined 5/10 = 50%
    const sections = [
      makeCourse({ totalLessons: 4, completedLessons: 2 }),
      makeCourse({ courseId: "c2", totalLessons: 6, completedLessons: 3 }),
    ];
    expect(calcOverallPercent(sections)).toBe(50);
  });
});

// ─── countCertificates ────────────────────────────────────────────────────────

describe("countCertificates", () => {
  it("returns 0 when no certificates earned", () => {
    const sections = [makeCourse(), makeCourse({ courseId: "c2" })];
    expect(countCertificates(sections)).toBe(0);
  });

  it("counts only courses with hasCertificate=true", () => {
    const sections = [
      makeCourse({ hasCertificate: true }),
      makeCourse({ courseId: "c2", hasCertificate: false }),
      makeCourse({ courseId: "c3", hasCertificate: true }),
    ];
    expect(countCertificates(sections)).toBe(2);
  });

  it("returns 0 for empty list", () => {
    expect(countCertificates([])).toBe(0);
  });
});

// ─── streakMessage ────────────────────────────────────────────────────────────

describe("streakMessage", () => {
  it("returns a start-streak message when streak is 0", () => {
    expect(streakMessage(0)).toBe("למד היום כדי להתחיל streak!");
  });

  it("returns encouragement message for streak < 7", () => {
    expect(streakMessage(1)).toBe("כל הכבוד, המשך כך!");
    expect(streakMessage(6)).toBe("כל הכבוד, המשך כך!");
  });

  it("returns celebration message for streak >= 7", () => {
    expect(streakMessage(7)).toBe("מדהים! שמור על הקצב");
    expect(streakMessage(30)).toBe("מדהים! שמור על הקצב");
  });
});

// ─── pickContinueCourse ────────────────────────────────────────────────────────

describe("pickContinueCourse", () => {
  it("returns null when sections is empty", () => {
    expect(pickContinueCourse([])).toBeNull();
  });

  it("prefers an in-progress course over a not-started course", () => {
    const inProgress = makeCourse({
      courseId: "in-progress",
      completedLessons: 2,
      totalLessons: 5,
      completionPercent: 40,
    });
    const notStarted = makeCourse({
      courseId: "not-started",
      completedLessons: 0,
      completionPercent: 0,
    });
    const result = pickContinueCourse([notStarted, inProgress]);
    expect(result?.courseId).toBe("in-progress");
  });

  it("returns a not-started course when there is no in-progress course", () => {
    const notStarted = makeCourse({
      courseId: "not-started",
      completedLessons: 0,
      completionPercent: 0,
    });
    const result = pickContinueCourse([notStarted]);
    expect(result?.courseId).toBe("not-started");
  });

  it("returns null when all courses are 100% complete", () => {
    const completed = makeCourse({
      courseId: "done",
      completedLessons: 5,
      totalLessons: 5,
      completionPercent: 100,
    });
    expect(pickContinueCourse([completed])).toBeNull();
  });

  it("returns the first in-progress course when multiple exist", () => {
    const a = makeCourse({
      courseId: "a",
      completedLessons: 1,
      completionPercent: 20,
    });
    const b = makeCourse({
      courseId: "b",
      completedLessons: 3,
      completionPercent: 60,
    });
    const result = pickContinueCourse([a, b]);
    expect(result?.courseId).toBe("a");
  });
});

// ─── clampPercent ────────────────────────────────────────────────────────────

describe("clampPercent", () => {
  it("returns the value unchanged when in [0, 100]", () => {
    expect(clampPercent(50)).toBe(50);
    expect(clampPercent(0)).toBe(0);
    expect(clampPercent(100)).toBe(100);
  });

  it("clamps values below 0 to 0", () => {
    expect(clampPercent(-5)).toBe(0);
  });

  it("clamps values above 100 to 100", () => {
    expect(clampPercent(150)).toBe(100);
  });
});

// ─── totalCompletedLessons ─────────────────────────────────────────────────────

describe("totalCompletedLessons", () => {
  it("returns 0 for empty sections", () => {
    expect(totalCompletedLessons([])).toBe(0);
  });

  it("sums completedLessons across all sections", () => {
    const sections = [
      makeCourse({ completedLessons: 3 }),
      makeCourse({ courseId: "c2", completedLessons: 7 }),
      makeCourse({ courseId: "c3", completedLessons: 0 }),
    ];
    expect(totalCompletedLessons(sections)).toBe(10);
  });
});
