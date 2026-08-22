import { describe, expect, it } from "vitest";
import {
  CANONICAL_COURSE_SCOPE,
  CANONICAL_PHASES,
  chooseOnboardingNextStep,
  getRemainingWeeklyMinutes,
  getWeeklyGoalMessage,
} from "@/lib/learner-journey";

describe("canonical learner journey", () => {
  it("keeps the verified course scope in one shared contract", () => {
    expect(CANONICAL_COURSE_SCOPE).toEqual({
      weeks: 12,
      phases: 6,
      lessons: 75,
      practicePdfs: 8,
    });
    expect(CANONICAL_PHASES.map((phase) => phase.number)).toEqual([
      1, 2, 3, 4, 5, 6,
    ]);
    expect(CANONICAL_PHASES.map((phase) => phase.name)).toEqual([
      "גישה",
      "תקשורת",
      "מעבר ומשיכה",
      "חיבור וכימיה",
      "אינטימיות",
      "מחויבות",
    ]);
  });

  it("turns the learner's first recognized interest into a real route", () => {
    expect(chooseOnboardingNextStep(["values"]).href).toBe(
      "/tools/values-quiz"
    );
    expect(
      chooseOnboardingNextStep(["profile", "conversation"]).href
    ).toBe("/tools/profile-builder");
    expect(chooseOnboardingNextStep(["unknown", "conversation"]).href).toBe(
      "/tools/conversation-starters"
    );
  });

  it("defaults to the structured course instead of a dead or speculative tool", () => {
    expect(chooseOnboardingNextStep([])).toEqual({
      href: "/courses",
      label: "להתחיל במסלול הלימוד",
      description: "לבחור את הקורס ולפתוח את השיעור הראשון.",
    });
  });

  it("converts a flexible weekly target to a non-negative remaining duration", () => {
    expect(getRemainingWeeklyMinutes(5, 1.5)).toBe(210);
    expect(getRemainingWeeklyMinutes(2, 3)).toBe(0);
    expect(getRemainingWeeklyMinutes(Number.NaN, 1)).toBe(0);
  });

  it("gives an actionable message without pressuring the learner to preserve a streak", () => {
    expect(getWeeklyGoalMessage(0, 0)).toContain("שיעור אחד");
    expect(getWeeklyGoalMessage(20, 4)).toContain("תרגול קצר");
    expect(getWeeklyGoalMessage(100, 9)).toContain("לנוח");
    expect(getWeeklyGoalMessage(100, 9)).not.toContain("אל תפסיק");
  });
});
