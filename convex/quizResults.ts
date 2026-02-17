import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// שליפת כל הניסיונות של משתמש בבוחן מסוים
export const getAttemptsByUserAndQuiz = query({
  args: {
    userId: v.id("users"),
    quizId: v.id("quizzes"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("quizAttempts")
      .withIndex("by_user_quiz", (q) =>
        q.eq("userId", args.userId).eq("quizId", args.quizId)
      )
      .collect();
  },
});

// שליפת כל ניסיונות הבחנים של משתמש בקורס
export const getAttemptsByUserAndCourse = query({
  args: {
    userId: v.id("users"),
    courseId: v.id("courses"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("quizAttempts")
      .withIndex("by_user_course", (q) =>
        q.eq("userId", args.userId).eq("courseId", args.courseId)
      )
      .collect();
  },
});

// שליפת כל ניסיונות הבחנים של משתמש (כל הקורסים)
export const getAllAttemptsByUser = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const attempts = await ctx.db
      .query("quizAttempts")
      .withIndex("by_user_quiz")
      .collect();

    // Filter by userId since we can't query by userId alone on this index
    return attempts.filter((a) => a.userId === args.userId);
  },
});

// שליפת ציון הטוב ביותר של משתמש בבוחן
export const getBestScore = query({
  args: {
    userId: v.id("users"),
    quizId: v.id("quizzes"),
  },
  handler: async (ctx, args) => {
    const attempts = await ctx.db
      .query("quizAttempts")
      .withIndex("by_user_quiz", (q) =>
        q.eq("userId", args.userId).eq("quizId", args.quizId)
      )
      .collect();

    if (attempts.length === 0) return null;

    return attempts.reduce((best, attempt) =>
      attempt.score > best.score ? attempt : best
    );
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
  handler: async (ctx, args) => {
    // שליפת השאלות
    const questions = await ctx.db
      .query("quizQuestions")
      .withIndex("by_quiz", (q) => q.eq("quizId", args.quizId))
      .collect();

    if (questions.length === 0) {
      throw new Error("Quiz has no questions");
    }

    // חישוב ציון
    const sortedQuestions = [...questions].sort((a, b) => a.order - b.order);
    let correctCount = 0;
    for (let i = 0; i < sortedQuestions.length; i++) {
      if (args.answers[i] === sortedQuestions[i].correctIndex) {
        correctCount++;
      }
    }

    const score = Math.round((correctCount / sortedQuestions.length) * 100);

    // שליפת ציון מעבר
    const quiz = await ctx.db.get(args.quizId);
    if (!quiz) throw new Error("Quiz not found");

    const passed = score >= quiz.passingScore;

    const attemptId = await ctx.db.insert("quizAttempts", {
      userId: args.userId,
      quizId: args.quizId,
      lessonId: args.lessonId,
      courseId: args.courseId,
      answers: args.answers,
      score,
      passed,
      attemptedAt: Date.now(),
    });

    // ספירת כמה ניסיונות היו למשתמש בבוחן
    const allAttempts = await ctx.db
      .query("quizAttempts")
      .withIndex("by_user_quiz", (q) =>
        q.eq("userId", args.userId).eq("quizId", args.quizId)
      )
      .collect();

    return {
      attemptId,
      score,
      passed,
      correctCount,
      totalQuestions: sortedQuestions.length,
      attemptNumber: allAttempts.length,
      timeTakenSeconds: args.timeTakenSeconds,
    };
  },
});

// סיכום ביצועי בחנים של משתמש
export const getUserQuizSummary = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // שליפת כל הניסיונות
    const allAttempts = await ctx.db
      .query("quizAttempts")
      .withIndex("by_user_quiz")
      .collect();

    const userAttempts = allAttempts.filter((a) => a.userId === args.userId);

    if (userAttempts.length === 0) {
      return {
        totalAttempts: 0,
        totalPassed: 0,
        averageScore: 0,
        bestScore: 0,
        uniqueQuizzesTaken: 0,
      };
    }

    const totalPassed = userAttempts.filter((a) => a.passed).length;
    const averageScore = Math.round(
      userAttempts.reduce((sum, a) => sum + a.score, 0) / userAttempts.length
    );
    const bestScore = Math.max(...userAttempts.map((a) => a.score));
    const uniqueQuizzes = new Set(userAttempts.map((a) => a.quizId)).size;

    return {
      totalAttempts: userAttempts.length,
      totalPassed,
      averageScore,
      bestScore,
      uniqueQuizzesTaken: uniqueQuizzes,
    };
  },
});
