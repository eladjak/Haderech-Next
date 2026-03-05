import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// שליפת בוחן לפי שיעור (alias לשימוש מהדף החדש)
export const getQuizByLesson = query({
  args: { lessonId: v.id("lessons") },
  handler: async (ctx, args) => {
    const quiz = await ctx.db
      .query("quizzes")
      .withIndex("by_lesson", (q) => q.eq("lessonId", args.lessonId))
      .first();

    if (!quiz) return null;

    const questions = await ctx.db
      .query("quizQuestions")
      .withIndex("by_quiz", (q) => q.eq("quizId", quiz._id))
      .collect();

    const sortedQuestions = [...questions].sort((a, b) => a.order - b.order);
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
  handler: async (ctx, args) => {
    const questions = await ctx.db
      .query("quizQuestions")
      .withIndex("by_quiz", (q) => q.eq("quizId", args.quizId))
      .collect();

    if (questions.length === 0) throw new Error("Quiz has no questions");

    const sortedQuestions = [...questions].sort((a, b) => a.order - b.order);
    let correctCount = 0;
    for (let i = 0; i < sortedQuestions.length; i++) {
      if (args.answers[i] === sortedQuestions[i].correctIndex) correctCount++;
    }

    const score = Math.round((correctCount / sortedQuestions.length) * 100);
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
    };
  },
});

// שליפת תוצאות בחנים של משתמש בקורס
export const getQuizResults = query({
  args: {
    userId: v.id("users"),
    courseId: v.id("courses"),
  },
  handler: async (ctx, args) => {
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
          ...attempt,
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
    let allAttempts;
    if (args.courseId) {
      allAttempts = await ctx.db
        .query("quizAttempts")
        .filter((q) => q.eq(q.field("courseId"), args.courseId))
        .collect();
    } else {
      // Collect all attempts (no per-course filter)
      allAttempts = await ctx.db.query("quizAttempts").collect();
    }

    if (allAttempts.length === 0) {
      return {
        totalAttempts: 0,
        uniqueStudents: 0,
        averageScore: 0,
        passRate: 0,
        totalQuizzesTaken: 0,
      };
    }

    const totalPassed = allAttempts.filter((a) => a.passed).length;
    const averageScore = Math.round(
      allAttempts.reduce((sum, a) => sum + a.score, 0) / allAttempts.length
    );
    const uniqueStudents = new Set(allAttempts.map((a) => a.userId)).size;
    const uniqueQuizzes = new Set(allAttempts.map((a) => a.quizId)).size;
    const passRate = Math.round((totalPassed / allAttempts.length) * 100);

    return {
      totalAttempts: allAttempts.length,
      uniqueStudents,
      averageScore,
      passRate,
      totalQuizzesTaken: uniqueQuizzes,
    };
  },
});

// שליפת בוחן לפי שיעור
export const getByLesson = query({
  args: { lessonId: v.id("lessons") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("quizzes")
      .withIndex("by_lesson", (q) => q.eq("lessonId", args.lessonId))
      .first();
  },
});

// שליפת שאלות בוחן
export const getQuestions = query({
  args: { quizId: v.id("quizzes") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("quizQuestions")
      .withIndex("by_quiz", (q) => q.eq("quizId", args.quizId))
      .collect();
  },
});

// שליפת ניסיון אחרון של משתמש בבוחן
export const getLastAttempt = query({
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

    // החזר את הניסיון האחרון
    return attempts.reduce((latest, attempt) =>
      attempt.attemptedAt > latest.attemptedAt ? attempt : latest
    );
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

    return { attemptId, score, passed, correctCount, totalQuestions: sortedQuestions.length };
  },
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
