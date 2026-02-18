import { describe, it, expect } from "vitest";
import {
  calcOverallPercent,
  countCertificates,
  streakMessage,
  pickContinueCourse,
  clampPercent,
  totalCompletedLessons,
  sortByCompletion,
  averageScore,
  computeLevel,
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

// ─── sortByCompletion ────────────────────────────────────────────────────────

describe("sortByCompletion", () => {
  it("returns empty array for empty input", () => {
    expect(sortByCompletion([])).toEqual([]);
  });

  it("sorts sections ascending by completionPercent", () => {
    const a = makeCourse({ courseId: "a", completionPercent: 80 });
    const b = makeCourse({ courseId: "b", completionPercent: 20 });
    const c = makeCourse({ courseId: "c", completionPercent: 50 });
    const result = sortByCompletion([a, b, c]);
    expect(result.map((s) => s.courseId)).toEqual(["b", "c", "a"]);
  });

  it("does not mutate the original array", () => {
    const original = [
      makeCourse({ courseId: "x", completionPercent: 90 }),
      makeCourse({ courseId: "y", completionPercent: 10 }),
    ];
    const originalCopy = [...original];
    sortByCompletion(original);
    expect(original).toEqual(originalCopy);
  });
});

// ─── averageScore ────────────────────────────────────────────────────────────

describe("averageScore", () => {
  it("returns 0 for empty array", () => {
    expect(averageScore([])).toBe(0);
  });

  it("returns the score for a single element", () => {
    expect(averageScore([75])).toBe(75);
  });

  it("returns the rounded average for multiple scores", () => {
    expect(averageScore([80, 90, 70])).toBe(80);
    expect(averageScore([33, 67])).toBe(50);
  });

  it("rounds to nearest integer", () => {
    expect(averageScore([33, 34])).toBe(34); // 33.5 rounds to 34
  });
});

// ─── computeLevel ────────────────────────────────────────────────────────────

describe("computeLevel", () => {
  it("returns level 1 for 0 XP", () => {
    const result = computeLevel(0);
    expect(result.level).toBe(1);
    expect(result.progressPercent).toBe(0);
  });

  it("returns correct level for small XP", () => {
    // 25 XP → sqrt(1) = 1 → level 2
    const result = computeLevel(25);
    expect(result.level).toBe(2);
  });

  it("returns correct level for 100 XP", () => {
    // 100 XP → sqrt(4) = 2 → level 3
    const result = computeLevel(100);
    expect(result.level).toBe(3);
  });

  it("returns progress toward next level", () => {
    // At level 1: need 0-25 XP. With 12 XP → 12/25 = 48%
    const result = computeLevel(12);
    expect(result.level).toBe(1);
    expect(result.xpInCurrentLevel).toBe(12);
    expect(result.xpNeededForNextLevel).toBe(25);
    expect(result.progressPercent).toBe(48);
  });
});
