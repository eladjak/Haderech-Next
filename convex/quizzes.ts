import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import {
  requireAdmin,
  requireCourseContentAccess,
  requireSelfOrAdmin,
} from "./lib/authGuard";
import {
  toLearnerQuizQuestion,
  toQuizAttemptSummary,
} from "./lib/authorizationPolicy";
import { submitLearnerQuizAttempt } from "./lib/quizSubmission";
import { assertValidQuizPassingScore } from "./lib/quizAssessmentPolicy";

// שליפת בוחן לפי שיעור (alias לשימוש מהדף החדש)
export const getQuizByLesson = query({
  args: { lessonId: v.id("lessons") },
  handler: async (ctx, args) => {
    const quiz = await ctx.db
      .query("quizzes")
      .withIndex("by_lesson", (q) => q.eq("lessonId", args.lessonId))
      .first();

    if (!quiz) return null;
    await requireCourseContentAccess(ctx, quiz.courseId);

    const questions = await ctx.db
      .query("quizQuestions")
      .withIndex("by_quiz", (q) => q.eq("quizId", quiz._id))
      .collect();

    const sortedQuestions = [...questions]
      .sort((a, b) => a.order - b.order)
      .map(toLearnerQuizQuestion);
    return { ...quiz, questions: sortedQuestions };
  },
});

// הגשת תשובה ומעקב ציון (עם גמישות לשאלה בשאלה)
export const submitQuizAnswer = mutation({
  args: {
    userId: v.id("users"),
    quizId: v.id("quizzes"),
    lessonId: v.id("lessons"),
    courseId: v.id("courses"),
    answers: v.array(v.number()),
    timeTakenSeconds: v.optional(v.number()),
  },
  handler: submitLearnerQuizAttempt,
});

// שליפת תוצאות בחנים של משתמש בקורס
export const getQuizResults = query({
  args: {
    userId: v.id("users"),
    courseId: v.id("courses"),
  },
  handler: async (ctx, args) => {
    await requireSelfOrAdmin(ctx, args.userId);
    await requireCourseContentAccess(ctx, args.courseId);
    const attempts = await ctx.db
      .query("quizAttempts")
      .withIndex("by_user_course", (q) =>
        q.eq("userId", args.userId).eq("courseId", args.courseId)
      )
      .collect();

    // עשיר כל ניסיון עם שם הבוחן
    const enriched = await Promise.all(
      attempts.map(async (attempt) => {
        const quiz = await ctx.db.get(attempt.quizId);
        return {
          ...toQuizAttemptSummary(attempt),
          quizTitle: quiz?.title ?? "בוחן לא נמצא",
        };
      })
    );

    // ממיין לפי תאריך (חדש קודם)
    return enriched.sort((a, b) => b.attemptedAt - a.attemptedAt);
  },
});

// סטטיסטיקות בחנים למנהל
export const getQuizStats = query({
  args: { courseId: v.optional(v.id("courses")) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    void args;
    // There is currently no course-first index on quizAttempts. Returning
    // partial aggregates would be misleading, while collect() can become an
    // unbounded self-DoS. Keep this unused admin surface fail-closed until a
    // separately approved schema/index change enables bounded pagination.
    throw new Error("QUIZ_STATS_REQUIRES_BOUNDED_INDEX");
  },
});

// שליפת בוחן לפי שיעור
export const getByLesson = query({
  args: { lessonId: v.id("lessons") },
  handler: async (ctx, args) => {
    const quiz = await ctx.db
      .query("quizzes")
      .withIndex("by_lesson", (q) => q.eq("lessonId", args.lessonId))
      .first();
    if (!quiz) return null;
    await requireCourseContentAccess(ctx, quiz.courseId);
    return quiz;
  },
});

// Learner-facing quiz metadata. Questions are projected separately so the
// answer key never shares a response envelope with public quiz data.
export const getById = query({
  args: { quizId: v.id("quizzes") },
  handler: async (ctx, args) => {
    const quiz = await ctx.db.get(args.quizId);
    if (!quiz) return null;
    await requireCourseContentAccess(ctx, quiz.courseId);
    return quiz;
  },
});

// שליפת שאלות בוחן
export const getQuestions = query({
  args: { quizId: v.id("quizzes") },
  handler: async (ctx, args) => {
    const quiz = await ctx.db.get(args.quizId);
    if (!quiz) return [];
    await requireCourseContentAccess(ctx, quiz.courseId);
    const questions = await ctx.db
      .query("quizQuestions")
      .withIndex("by_quiz", (q) => q.eq("quizId", args.quizId))
      .collect();
    return questions
      .sort((a, b) => a.order - b.order)
      .map(toLearnerQuizQuestion);
  },
});

// שליפת ניסיון אחרון של משתמש בבוחן
export const getLastAttempt = query({
  args: {
    userId: v.id("users"),
    quizId: v.id("quizzes"),
  },
  handler: async (ctx, args) => {
    await requireSelfOrAdmin(ctx, args.userId);
    const quiz = await ctx.db.get(args.quizId);
    if (!quiz) return null;
    await requireCourseContentAccess(ctx, quiz.courseId);
    const attempts = await ctx.db
      .query("quizAttempts")
      .withIndex("by_user_quiz", (q) =>
        q.eq("userId", args.userId).eq("quizId", args.quizId)
      )
      .collect();

    if (attempts.length === 0) return null;

    // החזר את הניסיון האחרון
    const latest = attempts.reduce((latestAttempt, attempt) =>
      attempt.attemptedAt > latestAttempt.attemptedAt ? attempt : latestAttempt
    );
    return toQuizAttemptSummary(latest);
  },
});

// הגשת תשובות בוחן
export const submitAttempt = mutation({
  args: {
    userId: v.id("users"),
    quizId: v.id("quizzes"),
    lessonId: v.id("lessons"),
    courseId: v.id("courses"),
    answers: v.array(v.number()),
  },
  handler: submitLearnerQuizAttempt,
});

// יצירת בוחן (למנהלים)
export const create = mutation({
  args: {
    lessonId: v.id("lessons"),
    courseId: v.id("courses"),
    title: v.string(),
    passingScore: v.number(),
    questions: v.array(
      v.object({
        question: v.string(),
        options: v.array(v.string()),
        correctIndex: v.number(),
        explanation: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    assertValidQuizPassingScore(args.passingScore);
    const quizId = await ctx.db.insert("quizzes", {
      lessonId: args.lessonId,
      courseId: args.courseId,
      title: args.title,
      passingScore: args.passingScore,
      createdAt: Date.now(),
    });

    for (let i = 0; i < args.questions.length; i++) {
      const q = args.questions[i];
      await ctx.db.insert("quizQuestions", {
        quizId,
        question: q.question,
        options: q.options,
        correctIndex: q.correctIndex,
        explanation: q.explanation,
        order: i,
      });
    }

    return quizId;
  },
});
