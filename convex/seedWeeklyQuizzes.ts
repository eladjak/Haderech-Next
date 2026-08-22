/**
 * Deterministically synchronize the 12 weekly LMS quizzes from the canonical
 * course assessment contract.
 *
 * Canonical source:
 *   ../omanut-hakesher-course/quizzes/assessment-contract.json
 *   ../omanut-hakesher-course/quizzes/week-*.json
 *
 * Generated runtime data:
 *   ./weeklyQuizData.generated.json
 *
 * Before running a seed, verify the generated artifact locally:
 *   node scripts/sync-weekly-quizzes.mjs --check
 *
 * Seeding remains fail-closed behind SEED_ENABLED=true. This file is not run
 * by the audit and must not be used against a live deployment without an
 * explicit owner decision and a verified backup/rollback plan.
 */

import { internalMutation } from "./_generated/server";
import { assertSeedAllowed } from "./lib/seedGuard";
import weeklyQuizData from "./weeklyQuizData.generated.json";

type WeeklyQuestion = {
  sourceId: string;
  questionType: "multiple_choice" | "true_false";
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

type WeeklyQuiz = {
  weekNumber: number;
  sourceKey: string;
  sourceFile: string;
  lessonScriptIndex: string;
  title: string;
  passingScore: number;
  questions: WeeklyQuestion[];
  contentHash: string;
};

export const WEEKLY_QUIZZES = weeklyQuizData.quizzes as unknown as WeeklyQuiz[];
const COURSE_TITLE = weeklyQuizData.courseTitle;

function stringArraysEqual(left: string[], right: string[]): boolean {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function isRecognizedLegacyQuiz(title: string, weekNumber: number): boolean {
  return title.trim().startsWith(`בוחן שבוע ${weekNumber}`);
}

export const seedWeeklyQuizzes = internalMutation({
  args: {},
  handler: async (ctx) => {
    assertSeedAllowed("seedWeeklyQuizzes");

    const course = await ctx.db
      .query("courses")
      .filter((q) => q.eq(q.field("title"), COURSE_TITLE))
      .first();

    if (!course) {
      return {
        success: false,
        message: `Course "${COURSE_TITLE}" not found.`,
        sourceDigest: weeklyQuizData.sourceDigest,
      };
    }

    const lessons = await ctx.db
      .query("lessons")
      .withIndex("by_course", (q) => q.eq("courseId", course._id))
      .collect();
    const byIndex = new Map(
      lessons.filter((lesson) => lesson.scriptIndex).map((lesson) => [lesson.scriptIndex as string, lesson])
    );

    let quizzesCreated = 0;
    let quizzesUpdated = 0;
    let quizzesUnchanged = 0;
    let questionsInserted = 0;
    let questionsPatched = 0;
    let questionsDeleted = 0;
    for (const canonicalQuiz of WEEKLY_QUIZZES) {
      const lesson = byIndex.get(canonicalQuiz.lessonScriptIndex);
      if (!lesson) {
        throw new Error(
          `QUIZ_SYNC_CONFLICT:${canonicalQuiz.sourceKey}:MISSING_LESSON:${canonicalQuiz.lessonScriptIndex}`
        );
      }

      const quizzesForLesson = await ctx.db
        .query("quizzes")
        .withIndex("by_lesson", (q) => q.eq("lessonId", lesson._id))
        .collect();

      if (quizzesForLesson.length > 1) {
        throw new Error(
          `QUIZ_SYNC_CONFLICT:${canonicalQuiz.sourceKey}:MULTIPLE_QUIZZES_FOR_LESSON:${quizzesForLesson.length}`
        );
      }

      if (quizzesForLesson.length === 0) {
        const now = Date.now();
        const quizId = await ctx.db.insert("quizzes", {
          lessonId: lesson._id,
          courseId: course._id,
          title: canonicalQuiz.title,
          passingScore: canonicalQuiz.passingScore,
          sourceKey: canonicalQuiz.sourceKey,
          contentHash: canonicalQuiz.contentHash,
          createdAt: now,
          updatedAt: now,
        });

        for (const [order, question] of canonicalQuiz.questions.entries()) {
          await ctx.db.insert("quizQuestions", {
            quizId,
            sourceId: question.sourceId,
            questionType: question.questionType,
            question: question.question,
            options: question.options,
            correctIndex: question.correctIndex,
            explanation: question.explanation,
            order,
          });
          questionsInserted += 1;
        }
        quizzesCreated += 1;
        continue;
      }

      const existingQuiz = quizzesForLesson[0];
      if (existingQuiz.courseId !== course._id) {
        throw new Error(
          `QUIZ_SYNC_CONFLICT:${canonicalQuiz.sourceKey}:QUIZ_COURSE_MISMATCH`
        );
      }

      const isManaged = existingQuiz.sourceKey === canonicalQuiz.sourceKey;
      const isLegacy =
        existingQuiz.sourceKey === undefined &&
        isRecognizedLegacyQuiz(existingQuiz.title, canonicalQuiz.weekNumber);
      if (!isManaged && !isLegacy) {
        const reason = existingQuiz.sourceKey
          ? `FOREIGN_SOURCE_KEY:${existingQuiz.sourceKey}`
          : "UNRECOGNIZED_LEGACY_QUIZ";
        throw new Error(`QUIZ_SYNC_CONFLICT:${canonicalQuiz.sourceKey}:${reason}`);
      }

      const existingQuestions = (
        await ctx.db
          .query("quizQuestions")
          .withIndex("by_quiz", (q) => q.eq("quizId", existingQuiz._id))
          .collect()
      ).sort((left, right) => left.order - right.order);

      const bySourceId = new Map<string, (typeof existingQuestions)[number]>();
      const byLegacyOrder = new Map<number, (typeof existingQuestions)[number]>();
      for (const question of existingQuestions) {
        if (question.sourceId) {
          if (bySourceId.has(question.sourceId)) {
            throw new Error(
              `QUIZ_SYNC_CONFLICT:${canonicalQuiz.sourceKey}:DUPLICATE_SOURCE_ID:${question.sourceId}`
            );
          }
          bySourceId.set(question.sourceId, question);
        } else {
          if (byLegacyOrder.has(question.order)) {
            throw new Error(
              `QUIZ_SYNC_CONFLICT:${canonicalQuiz.sourceKey}:DUPLICATE_LEGACY_ORDER:${question.order}`
            );
          }
          byLegacyOrder.set(question.order, question);
        }
      }

      const usedQuestionIds = new Set<string>();
      const metadataChanged =
        existingQuiz.title !== canonicalQuiz.title ||
        existingQuiz.passingScore !== canonicalQuiz.passingScore ||
        existingQuiz.sourceKey !== canonicalQuiz.sourceKey ||
        existingQuiz.contentHash !== canonicalQuiz.contentHash;

      const questionPlans: Array<{
        order: number;
        canonical: WeeklyQuestion;
        stored: (typeof existingQuestions)[number] | undefined;
        changed: boolean;
      }> = [];

      for (const [order, canonicalQuestion] of canonicalQuiz.questions.entries()) {
        const storedQuestion =
          bySourceId.get(canonicalQuestion.sourceId) ?? byLegacyOrder.get(order);
        if (storedQuestion) usedQuestionIds.add(storedQuestion._id);
        const questionChanged =
          !storedQuestion ||
          storedQuestion.sourceId !== canonicalQuestion.sourceId ||
          storedQuestion.questionType !== canonicalQuestion.questionType ||
          storedQuestion.question !== canonicalQuestion.question ||
          !stringArraysEqual(storedQuestion.options, canonicalQuestion.options) ||
          storedQuestion.correctIndex !== canonicalQuestion.correctIndex ||
          storedQuestion.explanation !== canonicalQuestion.explanation ||
          storedQuestion.order !== order;
        questionPlans.push({
          order,
          canonical: canonicalQuestion,
          stored: storedQuestion,
          changed: questionChanged,
        });
      }

      const questionsToDelete = existingQuestions.filter(
        (storedQuestion) => !usedQuestionIds.has(storedQuestion._id)
      );
      const quizChanged =
        metadataChanged ||
        questionPlans.some((plan) => plan.changed) ||
        questionsToDelete.length > 0;

      if (quizChanged) {
        const historicalAttempt = await ctx.db
          .query("quizAttempts")
          .filter((q) => q.eq(q.field("quizId"), existingQuiz._id))
          .first();
        if (historicalAttempt) {
          throw new Error(
            `QUIZ_SYNC_CONFLICT:${canonicalQuiz.sourceKey}:HISTORICAL_ATTEMPTS_REQUIRE_VERSIONED_MIGRATION`
          );
        }
      }

      if (quizChanged) {
        const now = Date.now();
        await ctx.db.patch(existingQuiz._id, {
          title: canonicalQuiz.title,
          passingScore: canonicalQuiz.passingScore,
          sourceKey: canonicalQuiz.sourceKey,
          contentHash: canonicalQuiz.contentHash,
          updatedAt: now,
        });

        for (const plan of questionPlans) {
          if (!plan.changed) continue;
          const questionData = {
            sourceId: plan.canonical.sourceId,
            questionType: plan.canonical.questionType,
            question: plan.canonical.question,
            options: plan.canonical.options,
            correctIndex: plan.canonical.correctIndex,
            explanation: plan.canonical.explanation,
            order: plan.order,
          };
          if (plan.stored) {
            await ctx.db.patch(plan.stored._id, questionData);
            questionsPatched += 1;
          } else {
            await ctx.db.insert("quizQuestions", {
              quizId: existingQuiz._id,
              ...questionData,
            });
            questionsInserted += 1;
          }
        }
        for (const storedQuestion of questionsToDelete) {
          await ctx.db.delete(storedQuestion._id);
          questionsDeleted += 1;
        }
        quizzesUpdated += 1;
      } else {
        quizzesUnchanged += 1;
      }
    }

    return {
      success: true,
      sourceDigest: weeklyQuizData.sourceDigest,
      canonicalItems: weeklyQuizData.totals.canonicalItems,
      gradedItems: weeklyQuizData.totals.gradedItems,
      excludedItems: weeklyQuizData.totals.excludedItems,
      quizzesCreated,
      quizzesUpdated,
      quizzesUnchanged,
      questionsInserted,
      questionsPatched,
      questionsDeleted,
      missingLessons: [],
      conflicts: [],
    };
  },
});
