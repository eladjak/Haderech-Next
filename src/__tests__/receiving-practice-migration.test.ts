import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  planReceivingPracticeMigration,
  sha256Stable,
  stableStringify,
  type ReceivingPracticePlanInput,
} from "../../convex/lib/receivingPracticeMigrationPlan";

const legacyLessons = Array.from({ length: 75 }, (_, order) => ({
  id: `lesson-${order}`,
  order,
  scriptIndex:
    order === 30 ? "5.3.1" : order === 31 ? "5.4.1" : `fixture-${order}`,
}));
const lessonsWithTarget = [
  ...legacyLessons.slice(0, 31),
  {
    id: "target",
    order: 31,
    scriptIndex: "5.3.2",
    contentKey: "oh.course.lesson.receiving-practice",
  },
  ...legacyLessons.slice(31).map((lesson) => ({
    ...lesson,
    order: lesson.order + 1,
  })),
];

const base = {
  lessons: legacyLessons,
  requiredLessonCount: 75,
  optionalLessonCount: 0,
  targetProgressRows: 0,
  targetQuizRows: 0,
  targetAttemptRows: 0,
  predecessorScriptIndex: "5.3.1",
  successorScriptIndex: "5.4.1",
  targetScriptIndex: "5.3.2",
  targetContentKey: "oh.course.lesson.receiving-practice",
} satisfies ReceivingPracticePlanInput;

describe("receiving-practice staging migration", () => {
  it("plans a deterministic insertion and shifts later lessons once", () => {
    const plan = planReceivingPracticeMigration(base);
    expect(plan).toMatchObject({
      status: "ready",
      insertTarget: true,
      desiredOrder: 31,
      writes: 45,
    });
    expect(plan.shiftedLessonIds).toHaveLength(44);
    expect(plan.shiftedLessonIds[0]).toBe("lesson-74");
    expect(plan.shiftedLessonIds.at(-1)).toBe("lesson-31");
  });

  it("fails closed on duplicate identity", () => {
    const plan = planReceivingPracticeMigration({
      ...base,
      lessons: [
        ...legacyLessons,
        { id: "a", order: 75, scriptIndex: "5.3.2" },
        { id: "b", order: 76, scriptIndex: "5.3.2" },
      ],
      optionalLessonCount: 2,
    });
    expect(plan.status).toBe("conflict");
    expect(plan.conflicts).toContain("DUPLICATE_SCRIPT_INDEX:2");
    expect(plan.writes).toBe(0);
  });

  it("fails closed when an existing optional-practice row has attempts", () => {
    const plan = planReceivingPracticeMigration({
      ...base,
      lessons: lessonsWithTarget,
      optionalLessonCount: 1,
      targetQuizRows: 1,
      targetAttemptRows: 2,
    });
    expect(plan.status).toBe("conflict");
    expect(plan.conflicts).toContain("OPTIONAL_PRACTICE_HAS_ATTEMPTS:2");
    expect(plan.writes).toBe(0);
  });

  it("does not silently repair an ambiguously ordered existing target", () => {
    const plan = planReceivingPracticeMigration({
      ...base,
      lessons: lessonsWithTarget.map((lesson) =>
        lesson.id === "target" ? { ...lesson, order: 32 } : lesson,
      ),
      optionalLessonCount: 1,
    });
    expect(plan.status).toBe("conflict");
    expect(plan.conflicts).toContain("EXISTING_TARGET_ORDER_DRIFT");
    expect(plan.writes).toBe(0);
  });

  it("fails closed unless the projection is exactly 75 required plus one optional", () => {
    const wrongRequired = planReceivingPracticeMigration({
      ...base,
      requiredLessonCount: 74,
    });
    expect(wrongRequired.status).toBe("conflict");
    expect(wrongRequired.conflicts).toContain("REQUIRED_LESSON_COUNT:74");

    const duplicateOrder = planReceivingPracticeMigration({
      ...base,
      lessons: legacyLessons.map((lesson) =>
        lesson.id === "lesson-74" ? { ...lesson, order: 73 } : lesson,
      ),
    });
    expect(duplicateOrder.status).toBe("conflict");
    expect(duplicateOrder.conflicts).toContain("DUPLICATE_LESSON_ORDERS:73");
  });

  it("binds target, candidate SHA and pre/post state into the plan hash", async () => {
    const reviewed = {
      target: { courseId: "course-a", lessonId: null, scriptIndex: "5.3.2" },
      candidateDigest:
        "sha256:85b6c8e4a75c3e1c9ea354db56829995fad44ddeb64c11169721d81adeaafadb",
      preStateHash: "sha256:pre-a",
      expectedPostStateHash: "sha256:post-a",
    };
    const reviewedHash = await sha256Stable(reviewed);
    await expect(
      sha256Stable({
        ...reviewed,
        target: { ...reviewed.target, courseId: "course-b" },
      }),
    ).resolves.not.toBe(reviewedHash);
    await expect(
      sha256Stable({ ...reviewed, candidateDigest: "sha256:different" }),
    ).resolves.not.toBe(reviewedHash);
    await expect(
      sha256Stable({ ...reviewed, preStateHash: "sha256:pre-b" }),
    ).resolves.not.toBe(reviewedHash);
    await expect(
      sha256Stable({ ...reviewed, expectedPostStateHash: "sha256:post-b" }),
    ).resolves.not.toBe(reviewedHash);
  });

  it("preserves historical progress rows and becomes a no-op after the marker", () => {
    const plan = planReceivingPracticeMigration({
      ...base,
      lessons: lessonsWithTarget,
      existingMarkerState: "applied",
      targetProgressRows: 7,
      optionalLessonCount: 1,
    });
    expect(plan).toMatchObject({
      status: "already_applied",
      protectedProgressRows: 7,
      writes: 0,
      shiftedLessonIds: [],
    });
  });

  it("pins the reviewed payload digest and staging-only wrapper", () => {
    const payload = fs.readFileSync(
      path.resolve(process.cwd(), "convex/receivingPracticeMigrationData.json"),
    );
    const digest = `sha256:${createHash("sha256").update(payload).digest("hex")}`;
    const mutation = fs.readFileSync(
      path.resolve(process.cwd(), "convex/receivingPracticeMigration.ts"),
      "utf8",
    );
    const wrapper = fs.readFileSync(
      path.resolve(process.cwd(), "scripts/receiving-practice-staging.mjs"),
      "utf8",
    );
    expect(digest).toBe(
      "sha256:a49d80556069c77a3c0d7a358d34d6674c7303ac53effd2b96b54ef1ed4993ba",
    );
    expect(mutation).toContain(digest);
    expect(mutation).toContain(
      "sha256:85b6c8e4a75c3e1c9ea354db56829995fad44ddeb64c11169721d81adeaafadb",
    );
    const candidateContract = {
      title: "לבחור אם לקבל — תרגול רשות",
      description:
        "תרגול אופציונלי על קבלה וסירוב: אפשר לעבוד עם תרחיש בדיוני, לבחור חלופת כתיבה פרטית או לדלג. אין צורך בחשיפה אישית, באדם נוסף או בקשר, והתרגול אינו משפיע על ההתקדמות ואינו מקבל ציון.",
      duration: 90,
      published: true,
      weekNumber: 5,
      phaseNumber: 2,
      phaseName: "תקשורת",
      scriptIndex: "5.3.2",
      contentKey: "oh.course.lesson.receiving-practice",
      learnerAvailability: "optional",
      completionAffectsProgress: false,
      assessmentOrScoring: false,
      personalDisclosureRequired: false,
      relationshipOrPartnerRequired: false,
      learnerAlternatives: ["written-fictional", "private-written", "skip"],
      content: fs
        .readFileSync(path.resolve(process.cwd(), "convex/lessonContentData.ts"), "utf8")
        .match(/"5\.3\.2":\s*("(?:\\.|[^"\\])*")/u)?.[1],
    };
    candidateContract.content = candidateContract.content
      ? JSON.parse(candidateContract.content)
      : undefined;
    expect(
      `sha256:${createHash("sha256")
        .update(stableStringify(candidateContract))
        .digest("hex")}`,
    ).toBe(
      "sha256:85b6c8e4a75c3e1c9ea354db56829995fad44ddeb64c11169721d81adeaafadb",
    );
    expect(mutation).toContain("confirmPlanHash");
    expect(mutation).toContain("STALE_PLAN_HASH");
    expect(mutation).toContain("POSTCHECK_FAILED");
    expect(wrapper).toContain(digest);
    expect(wrapper).toContain("Production is not supported");
    expect(wrapper).toContain("--confirm-isolated-staging");
    expect(wrapper).toContain("--confirm-plan-hash");
    expect(wrapper).toContain("verifyReceivingPracticeMigration");
    expect(wrapper).not.toContain('convexArgs.push("--prod")');
  });
});
