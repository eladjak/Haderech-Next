import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const read = (relative: string) =>
  fs.readFileSync(path.resolve(process.cwd(), relative), "utf8");

describe("Week 5 receiving practice projection", () => {
  it("uses the approved collision-free identity and ordering", () => {
    const seed = read("convex/seedCourseData.ts");
    const receiving = seed.indexOf('scriptIndex: "5.3.2"');
    expect(receiving).toBeGreaterThan(seed.indexOf('scriptIndex: "5.3.1"'));
    expect(receiving).toBeLessThan(seed.indexOf('scriptIndex: "5.4.1"'));
    expect(seed).toContain(
      'contentKey: "oh.course.lesson.receiving-practice"',
    );
  });

  it("is optional, unscored, disclosure-free and excluded from progress", () => {
    const seed = read("convex/seedCourseData.ts");
    const progress = read("convex/progress.ts");
    expect(seed).toContain('learnerAvailability: "optional"');
    expect(seed).toContain("completionAffectsProgress: false");
    expect(seed).toContain("assessmentOrScoring: false");
    expect(seed).toContain("personalDisclosureRequired: false");
    expect(seed).toContain("relationshipOrPartnerRequired: false");
    expect(progress).toContain("OPTIONAL_PRACTICE_DOES_NOT_AFFECT_PROGRESS");
    expect(progress).toContain("lesson.completionAffectsProgress !== false");
  });

  it("shows fictional, private-written and skip choices without persistence", () => {
    const page = read("src/app/courses/[courseId]/learn/page.tsx");
    expect(page).toContain("לבחור תרחיש בדיוני");
    expect(page).toContain("לבחור חלופת כתיבה פרטית");
    expect(page).toContain("לדלג ולהמשיך");
    expect(page).toContain("לא משפיע על ההתקדמות");
    expect(page).toContain("הכתיבה נשארת אצלך");
    expect(page).not.toContain("saveOptionalPractice");
  });
});
