import { describe, expect, it } from "vitest";
import {
  CANONICAL_COURSE_SCOPE,
  CANONICAL_PHASES,
  chooseOnboardingNextStep,
  chooseStructuredOnboardingNextStep,
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
      "/tools/values-quiz",
    );
    expect(chooseOnboardingNextStep(["profile", "conversation"]).href).toBe(
      "/tools/profile-builder",
    );
    expect(chooseOnboardingNextStep(["unknown", "conversation"]).href).toBe(
      "/tools/conversation-starters",
    );
  });

  it("defaults to the structured course instead of a dead or speculative tool", () => {
    expect(chooseOnboardingNextStep([])).toEqual({
      href: "/courses",
      label: "להתחיל במסלול הלימוד",
      description: "לבחור את הקורס ולפתוח את השיעור הראשון.",
    });
  });

  it("gives two different onboarding personas different real next steps and explains every input", () => {
    const communicationBeginner = chooseStructuredOnboardingNextStep({
      goals: ["improve-dating"],
      experience: "beginner",
      preferredTopics: ["phase-2"],
    });
    const commitmentReturner = chooseStructuredOnboardingNextStep({
      goals: ["understand-dynamics"],
      experience: "advanced",
      preferredTopics: ["phase-6"],
    });

    expect(communicationBeginner).toMatchObject({
      href: "/tools/conversation-starters",
      mode: "choice-based",
    });
    expect(communicationBeginner.basis).toEqual([
      "שלב 2: תקשורת",
      "לתרגל תקשורת בהירה",
      "מההתחלה",
    ]);
    expect(communicationBeginner.description).toContain("בחרת להתחיל מההתחלה");

    expect(commitmentReturner).toMatchObject({
      href: "/courses",
      mode: "choice-based",
    });
    expect(commitmentReturner.basis).toEqual([
      "שלב 6: מחויבות",
      "לקבל החלטות בקשר בקצב שלי",
      "חזרה ממוקדת",
    ]);
    expect(commitmentReturner.description).toContain("בחרת חזרה ממוקדת");
    expect(commitmentReturner).not.toEqual(communicationBeginner);
  });

  it("uses an experience-only answer without pretending to infer a topic", () => {
    expect(
      chooseStructuredOnboardingNextStep({ experience: "intermediate" }),
    ).toMatchObject({
      href: "/tools",
      mode: "choice-based",
      basis: ["לפי נושא"],
    });
  });

  it("keeps refusal and empty answers useful without personalization claims", () => {
    const refusal = chooseStructuredOnboardingNextStep({});

    expect(refusal).toEqual({
      href: "/courses",
      label: "להתחיל במסלול הלימוד",
      description: "לבחור את הקורס ולפתוח את השיעור הראשון.",
      mode: "default",
      basis: [],
      explanation:
        "לא נשמרו בחירות, וזה בסדר. מוצג המסלול המלא בלי התאמה ובלי סיווג.",
    });
  });

  it("rejects inherited and unknown keys instead of treating them as recommendations", () => {
    expect(chooseOnboardingNextStep(["toString", "conversation"]).href).toBe(
      "/tools/conversation-starters",
    );
    expect(
      chooseStructuredOnboardingNextStep({
        goals: ["__proto__"],
        preferredTopics: ["constructor"],
      }),
    ).toMatchObject({
      href: "/courses",
      mode: "default",
      basis: [],
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
