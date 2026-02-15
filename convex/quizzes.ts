import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

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
