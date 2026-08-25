import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import {
  requireCourseContentAccess,
  requireSelfOrAdmin,
} from "./lib/authGuard";
import { toQuizAttemptSummary } from "./lib/authorizationPolicy";
import {
  averagePassedQuizScore,
  bestPassedQuizAttempt,
} from "./lib/quizAssessmentPolicy";
import { submitLearnerQuizAttempt } from "./lib/quizSubmission";

// שליפת כל הניסיונות של משתמש בבוחן מסוים
export const getAttemptsByUserAndQuiz = query({
  args: {
    userId: v.id("users"),
    quizId: v.id("quizzes"),
  },
  handler: async (ctx, args) => {
    await requireSelfOrAdmin(ctx, args.userId);
    const quiz = await ctx.db.get(args.quizId);
    if (!quiz) return [];
    await requireCourseContentAccess(ctx, quiz.courseId);
    const attempts = await ctx.db
      .query("quizAttempts")
      .withIndex("by_user_quiz", (q) =>
        q.eq("userId", args.userId).eq("quizId", args.quizId)
      )
      .collect();
    return attempts.map(toQuizAttemptSummary);
  },
});

// שליפת כל ניסיונות הבחנים של משתמש בקורס
export const getAttemptsByUserAndCourse = query({
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
    return attempts.map(toQuizAttemptSummary);
  },
});

// שליפת כל ניסיונות הבחנים של משתמש (כל הקורסים)
export const getAllAttemptsByUser = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await requireSelfOrAdmin(ctx, args.userId);
    const attempts = await ctx.db
      .query("quizAttempts")
      .withIndex("by_user_quiz", (q) => q.eq("userId", args.userId))
      .collect();

    const courseIds = [...new Set(attempts.map((attempt) => attempt.courseId))];
    for (const courseId of courseIds) {
      await requireCourseContentAccess(ctx, courseId);
    }
    return attempts.map(toQuizAttemptSummary);
  },
});

// שליפת ציון הטוב ביותר של משתמש בבוחן
export const getBestScore = query({
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

    const best = bestPassedQuizAttempt(attempts);
    if (!best) return null;
    return toQuizAttemptSummary(best);
  },
});

// הגשת בוחן עם תמיכה בסוגי שאלות מרובים
export const submitEnhancedAttempt = mutation({
  args: {
    userId: v.id("users"),
    quizId: v.id("quizzes"),
    lessonId: v.id("lessons"),
    courseId: v.id("courses"),
    answers: v.array(v.number()),
    timeTakenSeconds: v.number(), // זמן שלקח בשניות
  },
  handler: submitLearnerQuizAttempt,
});

// סיכום ביצועי בחנים של משתמש
export const getUserQuizSummary = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await requireSelfOrAdmin(ctx, args.userId);
    // שליפת כל הניסיונות
    const allAttempts = await ctx.db
      .query("quizAttempts")
      .withIndex("by_user_quiz", (q) => q.eq("userId", args.userId))
      .collect();

    const courseIds = [...new Set(allAttempts.map((attempt) => attempt.courseId))];
    for (const courseId of courseIds) {
      await requireCourseContentAccess(ctx, courseId);
    }

    if (allAttempts.length === 0) {
      return {
        totalAttempts: 0,
        totalPassed: 0,
        averageScore: 0,
        bestScore: 0,
        uniqueQuizzesTaken: 0,
      };
    }

    const passedAttempts = allAttempts.filter((attempt) => attempt.passed);
    const totalPassed = passedAttempts.length;
    const averageScore = averagePassedQuizScore(allAttempts) ?? 0;
    const bestScore =
      passedAttempts.length > 0
        ? Math.max(...passedAttempts.map((attempt) => attempt.score))
        : 0;
    const uniqueQuizzes = new Set(allAttempts.map((a) => a.quizId)).size;

    return {
      totalAttempts: allAttempts.length,
      totalPassed,
      averageScore,
      bestScore,
      uniqueQuizzesTaken: uniqueQuizzes,
    };
  },
});
