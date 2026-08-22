import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import {
  requireLessonCourseAccess,
  requireSelfOrAdmin,
} from "./authGuard";
import {
  assertQuizAttemptAllowed,
  assertValidQuizAnswerPayload,
  assertValidQuizPassingScore,
  assertValidQuizQuestionContract,
  assertValidQuizTimeTakenSeconds,
  toLearnerQuizSubmissionResult,
} from "./quizAssessmentPolicy";

export type LearnerQuizSubmissionInput = {
  userId: Id<"users">;
  quizId: Id<"quizzes">;
  lessonId: Id<"lessons">;
  courseId: Id<"courses">;
  answers: number[];
  timeTakenSeconds?: number;
};

/**
 * The single grading implementation behind every legacy/current public submit
 * mutation. Keeping authorization, throttling, grading and feedback together
 * prevents one older endpoint from reintroducing the answer-key oracle.
 */
export async function submitLearnerQuizAttempt(
  ctx: MutationCtx,
  args: LearnerQuizSubmissionInput
) {
  await requireSelfOrAdmin(ctx, args.userId);
  await requireLessonCourseAccess(ctx, args.lessonId, args.courseId);

  const quiz = await ctx.db.get(args.quizId);
  if (!quiz) throw new Error("Quiz not found");
  if (quiz.lessonId !== args.lessonId || quiz.courseId !== args.courseId) {
    throw new Error("QUIZ_CONTEXT_MISMATCH");
  }
  assertValidQuizPassingScore(quiz.passingScore);

  const existingAttempts = await ctx.db
    .query("quizAttempts")
    .withIndex("by_user_quiz", (q) =>
      q.eq("userId", args.userId).eq("quizId", args.quizId)
    )
    .collect();
  const now = Date.now();
  const allowance = assertQuizAttemptAllowed(existingAttempts, now);

  const questions = await ctx.db
    .query("quizQuestions")
    .withIndex("by_quiz", (q) => q.eq("quizId", args.quizId))
    .collect();
  if (questions.length === 0) throw new Error("Quiz has no questions");

  const sortedQuestions = [...questions].sort((a, b) => a.order - b.order);
  assertValidQuizQuestionContract(sortedQuestions);
  assertValidQuizAnswerPayload(args.answers, sortedQuestions);
  if (args.timeTakenSeconds !== undefined) {
    assertValidQuizTimeTakenSeconds(args.timeTakenSeconds);
  }

  let correctCount = 0;
  for (let index = 0; index < sortedQuestions.length; index++) {
    if (args.answers[index] === sortedQuestions[index].correctIndex) {
      correctCount++;
    }
  }
  const score = Math.round((correctCount / sortedQuestions.length) * 100);
  const passed = score >= quiz.passingScore;

  const attemptId = await ctx.db.insert("quizAttempts", {
    userId: args.userId,
    quizId: args.quizId,
    lessonId: args.lessonId,
    courseId: args.courseId,
    answers: args.answers,
    score,
    passed,
    attemptedAt: now,
  });

  return toLearnerQuizSubmissionResult({
    attemptId,
    score,
    correctCount,
    totalQuestions: sortedQuestions.length,
    passed,
    allowance,
  });
}
