/**
 * Versioned staging synchronizer for the optional Week 5 receiving practice.
 *
 * This is intentionally internal-only and fail-closed behind SEED_ENABLED.
 * Always run preview first and use the guarded local wrapper documented in
 * docs/staging/receiving-practice-v1.md. It is not a deploy command.
 */

import { v } from "convex/values";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { internalMutation, internalQuery } from "./_generated/server";
import migrationData from "./receivingPracticeMigrationData.json";
import { LESSON_CONTENT } from "./lessonContentData";
import { assertSeedAllowed } from "./lib/seedGuard";
import {
  planReceivingPracticeMigration,
  sha256Stable,
} from "./lib/receivingPracticeMigrationPlan";

export const RECEIVING_PRACTICE_SOURCE_DIGEST =
  "sha256:160d45adaf1d2c3fd83db048c4e871c0b3653e1ad29d1078029ae280b34fce5a";
export const RECEIVING_PRACTICE_CANDIDATE_DIGEST =
  "sha256:85b6c8e4a75c3e1c9ea354db56829995fad44ddeb64c11169721d81adeaafadb";

type ReadCtx = QueryCtx | MutationCtx;

function canonicalCandidate() {
  return {
    title: migrationData.lesson.title,
    description: migrationData.lesson.description,
    duration: migrationData.lesson.duration,
    published: migrationData.lesson.published,
    weekNumber: migrationData.lesson.weekNumber,
    phaseNumber: migrationData.lesson.phaseNumber,
    phaseName: migrationData.lesson.phaseName,
    scriptIndex: migrationData.lesson.scriptIndex,
    contentKey: migrationData.lesson.contentKey,
    learnerAvailability: "optional" as const,
    completionAffectsProgress: false,
    assessmentOrScoring: false,
    personalDisclosureRequired: false,
    relationshipOrPartnerRequired: false,
    learnerAlternatives: migrationData.lesson.learnerAlternatives,
    content: LESSON_CONTENT[migrationData.lesson.scriptIndex],
  };
}

async function inspect(ctx: ReadCtx) {
  const courses = (await ctx.db.query("courses").collect()).filter(
    (course) => course.title === migrationData.courseTitle,
  );
  if (courses.length !== 1) {
    return {
      status: "conflict" as const,
      conflicts: [`COURSE_COUNT:${courses.length}`],
      migrationKey: migrationData.migrationKey,
      migrationVersion: migrationData.migrationVersion,
      sourceDigest: RECEIVING_PRACTICE_SOURCE_DIGEST,
      backendInspected: true,
      writes: 0,
    };
  }

  const course = courses[0];
  const lessons = await ctx.db
    .query("lessons")
    .withIndex("by_course", (q) => q.eq("courseId", course._id))
    .collect();
  const markers = await ctx.db
    .query("courseContentMigrations")
    .withIndex("by_key_version", (q) =>
      q
        .eq("migrationKey", migrationData.migrationKey)
        .eq("migrationVersion", migrationData.migrationVersion),
    )
    .collect();
  if (markers.length > 1) {
    return {
      status: "conflict" as const,
      conflicts: [`VERSION_MARKER_COUNT:${markers.length}`],
      migrationKey: migrationData.migrationKey,
      migrationVersion: migrationData.migrationVersion,
      sourceDigest: RECEIVING_PRACTICE_SOURCE_DIGEST,
      backendInspected: true,
      writes: 0,
    };
  }

  const marker = markers[0];
  const markerConflicts: string[] = [];
  if (marker?.sourceDigest !== undefined && marker.sourceDigest !== RECEIVING_PRACTICE_SOURCE_DIGEST) {
    markerConflicts.push("VERSION_MARKER_DIGEST_DRIFT");
  }
  if (marker && marker.candidateDigest !== RECEIVING_PRACTICE_CANDIDATE_DIGEST) {
    markerConflicts.push("VERSION_MARKER_CANDIDATE_DRIFT");
  }
  if (marker && marker.courseId !== course._id) {
    markerConflicts.push("VERSION_MARKER_COURSE_DRIFT");
  }

  const targets = lessons.filter(
    (lesson) =>
      lesson.scriptIndex === migrationData.lesson.scriptIndex ||
      lesson.contentKey === migrationData.lesson.contentKey,
  );
  const requiredLessonCount = lessons.filter(
    (lesson) => lesson.completionAffectsProgress !== false,
  ).length;
  const optionalLessonCount = lessons.length - requiredLessonCount;
  if (
    marker?.state === "applied" &&
    (!marker.targetLessonId || !targets.some((target) => target._id === marker.targetLessonId))
  ) {
    markerConflicts.push("VERSION_MARKER_TARGET_DRIFT");
  }
  if (markerConflicts.length > 0) {
    return {
      status: "conflict" as const,
      conflicts: markerConflicts,
      migrationKey: migrationData.migrationKey,
      migrationVersion: migrationData.migrationVersion,
      sourceDigest: RECEIVING_PRACTICE_SOURCE_DIGEST,
      backendInspected: true,
      writes: 0,
    };
  }
  let targetProgressRows = 0;
  let targetQuizRows = 0;
  let targetAttemptRows = 0;
  for (const target of targets) {
    targetProgressRows += (
      await ctx.db
        .query("progress")
        .withIndex("by_lesson", (q) => q.eq("lessonId", target._id))
        .collect()
    ).length;
    const quizzes = await ctx.db
      .query("quizzes")
      .withIndex("by_lesson", (q) => q.eq("lessonId", target._id))
      .collect();
    targetQuizRows += quizzes.length;
    for (const quiz of quizzes) {
      targetAttemptRows += (
        await ctx.db
          .query("quizAttempts")
          .filter((q) => q.eq(q.field("quizId"), quiz._id))
          .collect()
      ).length;
    }
  }

  const plan = planReceivingPracticeMigration({
    lessons: lessons.map((lesson) => ({
      id: lesson._id,
      order: lesson.order,
      scriptIndex: lesson.scriptIndex,
      contentKey: lesson.contentKey,
    })),
    requiredLessonCount,
    optionalLessonCount,
    existingMarkerState: marker?.state,
    targetProgressRows,
    targetQuizRows,
    targetAttemptRows,
    predecessorScriptIndex: migrationData.predecessorScriptIndex,
    successorScriptIndex: migrationData.successorScriptIndex,
    targetScriptIndex: migrationData.lesson.scriptIndex,
    targetContentKey: migrationData.lesson.contentKey,
  });

  const candidateDigest = await sha256Stable(canonicalCandidate());
  if (candidateDigest !== RECEIVING_PRACTICE_CANDIDATE_DIGEST) {
    return {
      status: "conflict" as const,
      conflicts: ["CANDIDATE_DIGEST_DRIFT"],
      migrationKey: migrationData.migrationKey,
      migrationVersion: migrationData.migrationVersion,
      sourceDigest: RECEIVING_PRACTICE_SOURCE_DIGEST,
      candidateDigest,
      backendInspected: true,
      writes: 0,
    };
  }
  if (marker?.state === "applied" && targets.length === 1) {
    const stored = targets[0];
    const storedCandidateDigest = await sha256Stable({
      title: stored.title,
      description: stored.description,
      duration: stored.duration,
      published: stored.published,
      weekNumber: stored.weekNumber,
      phaseNumber: stored.phaseNumber,
      phaseName: stored.phaseName,
      scriptIndex: stored.scriptIndex,
      contentKey: stored.contentKey,
      learnerAvailability: stored.learnerAvailability,
      completionAffectsProgress: stored.completionAffectsProgress,
      assessmentOrScoring: stored.assessmentOrScoring,
      personalDisclosureRequired: stored.personalDisclosureRequired,
      relationshipOrPartnerRequired: stored.relationshipOrPartnerRequired,
      learnerAlternatives: stored.learnerAlternatives,
      content: stored.content,
    });
    if (storedCandidateDigest !== candidateDigest) {
      return {
        status: "conflict" as const,
        conflicts: ["APPLIED_TARGET_CONTENT_DRIFT"],
        migrationKey: migrationData.migrationKey,
        migrationVersion: migrationData.migrationVersion,
        sourceDigest: RECEIVING_PRACTICE_SOURCE_DIGEST,
        candidateDigest,
        backendInspected: true,
        writes: 0,
      };
    }
  }
  const preState = {
    courseId: course._id,
    marker: marker
      ? {
          id: marker._id,
          state: marker.state,
          sourceDigest: marker.sourceDigest,
          candidateDigest: marker.candidateDigest,
        }
      : null,
    requiredLessonCount,
    optionalLessonCount,
    targetProgressRows,
    targetQuizRows,
    targetAttemptRows,
    lessons: lessons
      .map((lesson) => ({
        id: lesson._id,
        order: lesson.order,
        scriptIndex: lesson.scriptIndex ?? null,
        contentKey: lesson.contentKey ?? null,
        completionAffectsProgress: lesson.completionAffectsProgress ?? true,
      }))
      .sort((left, right) => left.order - right.order || left.id.localeCompare(right.id)),
  };
  const expectedPostState = {
    courseId: course._id,
    targetLessonId: plan.targetLessonId ?? "NEW_LESSON_ID",
    targetScriptIndex: migrationData.lesson.scriptIndex,
    targetContentKey: migrationData.lesson.contentKey,
    candidateDigest,
    targetOrder: plan.desiredOrder ?? null,
    requiredLessonCount: plan.expectedRequiredLessonCount,
    optionalLessonCount: plan.expectedOptionalLessonCount,
    totalLessonCount: plan.expectedTotalLessonCount,
    shiftedLessonIds: plan.shiftedLessonIds,
    lessons: [
      ...lessons.map((lesson) => ({
        id: lesson._id,
        order: plan.shiftedLessonIds.includes(lesson._id)
          ? lesson.order + 1
          : lesson.order,
        scriptIndex:
          lesson._id === plan.targetLessonId
            ? migrationData.lesson.scriptIndex
            : (lesson.scriptIndex ?? null),
        contentKey:
          lesson._id === plan.targetLessonId
            ? migrationData.lesson.contentKey
            : (lesson.contentKey ?? null),
        completionAffectsProgress:
          lesson._id === plan.targetLessonId
            ? false
            : (lesson.completionAffectsProgress ?? true),
      })),
      ...(plan.insertTarget
        ? [
            {
              id: "NEW_LESSON_ID",
              order: plan.desiredOrder as number,
              scriptIndex: migrationData.lesson.scriptIndex,
              contentKey: migrationData.lesson.contentKey,
              completionAffectsProgress: false,
            },
          ]
        : []),
    ].sort((left, right) => left.order - right.order || left.id.localeCompare(right.id)),
  };
  const preStateHash = await sha256Stable(preState);
  const expectedPostStateHash = await sha256Stable(expectedPostState);
  const planHash = await sha256Stable({
    migrationKey: migrationData.migrationKey,
    migrationVersion: migrationData.migrationVersion,
    sourceDigest: RECEIVING_PRACTICE_SOURCE_DIGEST,
    candidateDigest,
    preStateHash,
    expectedPostStateHash,
  });

  return {
    ...plan,
    migrationKey: migrationData.migrationKey,
    migrationVersion: migrationData.migrationVersion,
    sourceDigest: RECEIVING_PRACTICE_SOURCE_DIGEST,
    candidateDigest,
    planHash,
    preStateHash,
    expectedPostStateHash,
    backendInspected: true,
    courseId: course._id,
    markerId: marker?._id,
    currentLessonCount: lessons.length,
    requiredLessonCount,
    optionalLessonCount,
    expectedPostLessonCount: plan.expectedTotalLessonCount,
  };
}

export const previewReceivingPracticeMigration = internalQuery({
  args: {},
  handler: async (ctx) => inspect(ctx),
});

export const applyReceivingPracticeMigration = internalMutation({
  args: {
    confirmMigrationVersion: v.string(),
    confirmSourceDigest: v.string(),
    confirmPlanHash: v.string(),
  },
  handler: async (ctx, args) => {
    // Convex mutations are atomic/optimistically concurrent. Recomputing and
    // matching the reviewed plan hash inside this transaction makes a stale
    // preview abort before the first write; an OCC retry recomputes it again.
    assertSeedAllowed("applyReceivingPracticeMigration");
    if (args.confirmMigrationVersion !== migrationData.migrationVersion) {
      throw new Error("RECEIVING_PRACTICE_MIGRATION:VERSION_CONFIRMATION_MISMATCH");
    }
    if (args.confirmSourceDigest !== RECEIVING_PRACTICE_SOURCE_DIGEST) {
      throw new Error("RECEIVING_PRACTICE_MIGRATION:DIGEST_CONFIRMATION_MISMATCH");
    }

    const plan = await inspect(ctx);
    if (plan.status === "already_applied") return plan;
    if (plan.status !== "ready" || !plan.courseId || plan.desiredOrder === undefined) {
      throw new Error(
        `RECEIVING_PRACTICE_MIGRATION:PREVIEW_NOT_READY:${plan.conflicts.join(",")}`,
      );
    }
    if (args.confirmPlanHash !== plan.planHash) {
      throw new Error("RECEIVING_PRACTICE_MIGRATION:STALE_PLAN_HASH");
    }

    const courseId = plan.courseId;
    const lessons = await ctx.db
      .query("lessons")
      .withIndex("by_course", (q) => q.eq("courseId", courseId))
      .collect();
    const byId = new Map<string, (typeof lessons)[number]>(
      lessons.map((lesson) => [lesson._id, lesson]),
    );
    const shiftedLessons = plan.shiftedLessonIds.map((lessonId) => {
      const lesson = byId.get(lessonId);
      if (!lesson) throw new Error(`RECEIVING_PRACTICE_MIGRATION:MISSING_SHIFT:${lessonId}`);
      return { lessonId: lesson._id, previousOrder: lesson.order };
    });
    const now = Date.now();

    for (const shifted of shiftedLessons) {
      await ctx.db.patch(shifted.lessonId, {
        order: shifted.previousOrder + 1,
        updatedAt: now,
      });
    }

    const targetDocument = plan.targetLessonId
      ? byId.get(plan.targetLessonId)
      : undefined;
    let targetBefore;
    if (targetDocument) {
      const { _id: targetId, _creationTime: targetCreationTime, ...snapshot } = targetDocument;
      void targetId;
      void targetCreationTime;
      targetBefore = snapshot;
    }
    const canonicalFields = {
      ...canonicalCandidate(),
      order: plan.desiredOrder,
      updatedAt: now,
    };
    const targetLessonId = targetDocument
      ? targetDocument._id
      : await ctx.db.insert("lessons", {
          courseId,
          videoUrl: undefined,
          pdfUrl: undefined,
          createdAt: now,
          ...canonicalFields,
        });
    if (targetDocument) await ctx.db.patch(targetDocument._id, canonicalFields);

    await ctx.db.insert("courseContentMigrations", {
      migrationKey: migrationData.migrationKey,
      migrationVersion: migrationData.migrationVersion,
      sourceDigest: RECEIVING_PRACTICE_SOURCE_DIGEST,
      candidateDigest: plan.candidateDigest,
      planHash: plan.planHash,
      preStateHash: plan.preStateHash,
      expectedPostStateHash: plan.expectedPostStateHash,
      state: "applied",
      courseId,
      targetLessonId,
      targetWasInserted: plan.insertTarget,
      targetBefore,
      shiftedLessons,
      protectedProgressRows: plan.protectedProgressRows,
      appliedAt: now,
    });

    const postcheck = await inspect(ctx);
    if (
      postcheck.status !== "already_applied" ||
      postcheck.requiredLessonCount !== 75 ||
      postcheck.optionalLessonCount !== 1 ||
      postcheck.currentLessonCount !== 76 ||
      postcheck.targetLessonId !== targetLessonId
    ) {
      throw new Error("RECEIVING_PRACTICE_MIGRATION:POSTCHECK_FAILED");
    }

    return {
      success: true,
      status: "applied" as const,
      migrationVersion: migrationData.migrationVersion,
      sourceDigest: RECEIVING_PRACTICE_SOURCE_DIGEST,
      targetLessonId,
      targetWasInserted: plan.insertTarget,
      shiftedLessons: shiftedLessons.length,
      protectedProgressRows: plan.protectedProgressRows,
      planHash: plan.planHash,
      candidateDigest: plan.candidateDigest,
      postcheck: {
        status: postcheck.status,
        requiredLessonCount: postcheck.requiredLessonCount,
        optionalLessonCount: postcheck.optionalLessonCount,
        totalLessonCount: postcheck.currentLessonCount,
        contained: true,
      },
    };
  },
});

export const verifyReceivingPracticeMigration = internalQuery({
  args: {},
  handler: async (ctx) => {
    const result = await inspect(ctx);
    return {
      ...result,
      contained:
        result.status === "already_applied" &&
        result.requiredLessonCount === 75 &&
        result.optionalLessonCount === 1 &&
        result.currentLessonCount === 76,
    };
  },
});

export const rollbackReceivingPracticeMigration = internalMutation({
  args: {
    confirmMigrationVersion: v.string(),
    confirmSourceDigest: v.string(),
    confirmRollback: v.literal("ROLLBACK_RECEIVING_PRACTICE"),
  },
  handler: async (ctx, args) => {
    assertSeedAllowed("rollbackReceivingPracticeMigration");
    if (
      args.confirmMigrationVersion !== migrationData.migrationVersion ||
      args.confirmSourceDigest !== RECEIVING_PRACTICE_SOURCE_DIGEST
    ) {
      throw new Error("RECEIVING_PRACTICE_ROLLBACK:CONFIRMATION_MISMATCH");
    }
    const markers = await ctx.db
      .query("courseContentMigrations")
      .withIndex("by_key_version", (q) =>
        q
          .eq("migrationKey", migrationData.migrationKey)
          .eq("migrationVersion", migrationData.migrationVersion),
      )
      .collect();
    if (markers.length !== 1 || markers[0].state !== "applied") {
      throw new Error(`RECEIVING_PRACTICE_ROLLBACK:ACTIVE_MARKER_COUNT:${markers.length}`);
    }
    const marker = markers[0];
    const now = Date.now();
    if (!marker.targetLessonId) {
      throw new Error("RECEIVING_PRACTICE_ROLLBACK:MISSING_TARGET_ID");
    }

    const progressRows = await ctx.db
      .query("progress")
      .withIndex("by_lesson", (q) => q.eq("lessonId", marker.targetLessonId!))
      .collect();
    if (marker.targetWasInserted && progressRows.length > 0) {
      throw new Error(
        `RECEIVING_PRACTICE_ROLLBACK:TARGET_HAS_PROGRESS:${progressRows.length}`,
      );
    }

    if (marker.targetWasInserted) {
      await ctx.db.delete(marker.targetLessonId);
    } else if (marker.targetBefore) {
      await ctx.db.replace(marker.targetLessonId, marker.targetBefore);
    } else {
      throw new Error("RECEIVING_PRACTICE_ROLLBACK:MISSING_TARGET_SNAPSHOT");
    }

    for (const shifted of marker.shiftedLessons) {
      const lesson = await ctx.db.get(shifted.lessonId);
      if (!lesson || lesson.order !== shifted.previousOrder + 1) {
        throw new Error(
          `RECEIVING_PRACTICE_ROLLBACK:SHIFTED_LESSON_DRIFT:${shifted.lessonId}`,
        );
      }
      await ctx.db.patch(shifted.lessonId, {
        order: shifted.previousOrder,
        updatedAt: now,
      });
    }
    await ctx.db.patch(marker._id, { state: "rolled_back", rolledBackAt: now });
    return {
      success: true,
      status: "rolled_back" as const,
      migrationVersion: marker.migrationVersion,
      restoredShiftedLessons: marker.shiftedLessons.length,
    };
  },
});
