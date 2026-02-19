import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./lib/authGuard";

// שליפת בחנים לפי קורס (admin)
export const listByCourse = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const quizzes = await ctx.db
      .query("quizzes")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .collect();

    // Add question count and lesson title for each quiz
    const enriched = await Promise.all(
      quizzes.map(async (quiz) => {
        const questions = await ctx.db
          .query("quizQuestions")
          .withIndex("by_quiz", (q) => q.eq("quizId", quiz._id))
          .collect();

        const lesson = await ctx.db.get(quiz.lessonId);

        return {
          ...quiz,
          questionCount: questions.length,
          lessonTitle: lesson?.title ?? "שיעור לא נמצא",
        };
      })
    );

    return enriched;
  },
});

// שליפת בוחן עם שאלות (admin)
export const getWithQuestions = query({
  args: { quizId: v.id("quizzes") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const quiz = await ctx.db.get(args.quizId);
    if (!quiz) return null;

    const questions = await ctx.db
      .query("quizQuestions")
      .withIndex("by_quiz", (q) => q.eq("quizId", args.quizId))
      .collect();

    const sortedQuestions = [...questions].sort((a, b) => a.order - b.order);

    return { ...quiz, questions: sortedQuestions };
  },
});

// יצירת בוחן חדש (admin)
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

// עדכון בוחן (admin) - title, passing score
export const update = mutation({
  args: {
    id: v.id("quizzes"),
    title: v.optional(v.string()),
    passingScore: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const { id, ...updates } = args;
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Quiz not found");

    const patchData: Record<string, unknown> = {};
    if (updates.title !== undefined) patchData.title = updates.title;
    if (updates.passingScore !== undefined) patchData.passingScore = updates.passingScore;

    if (Object.keys(patchData).length > 0) {
      await ctx.db.patch(id, patchData);
    }
  },
});

// מחיקת בוחן (admin) - כולל שאלות ותוצאות
export const remove = mutation({
  args: { id: v.id("quizzes") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const quiz = await ctx.db.get(args.id);
    if (!quiz) throw new Error("Quiz not found");

    // מחיקת שאלות
    const questions = await ctx.db
      .query("quizQuestions")
      .withIndex("by_quiz", (q) => q.eq("quizId", args.id))
      .collect();
    for (const question of questions) {
      await ctx.db.delete(question._id);
    }

    // מחיקת ניסיונות
    const attempts = await ctx.db
      .query("quizAttempts")
      .filter((q) => q.eq(q.field("quizId"), args.id))
      .collect();
    for (const attempt of attempts) {
      await ctx.db.delete(attempt._id);
    }

    await ctx.db.delete(args.id);
  },
});

// הוספת שאלה לבוחן (admin)
export const addQuestion = mutation({
  args: {
    quizId: v.id("quizzes"),
    question: v.string(),
    options: v.array(v.string()),
    correctIndex: v.number(),
    explanation: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const quiz = await ctx.db.get(args.quizId);
    if (!quiz) throw new Error("Quiz not found");

    // Find highest order
    const questions = await ctx.db
      .query("quizQuestions")
      .withIndex("by_quiz", (q) => q.eq("quizId", args.quizId))
      .collect();

    const maxOrder =
      questions.length > 0
        ? Math.max(...questions.map((q) => q.order))
        : -1;

    return await ctx.db.insert("quizQuestions", {
      quizId: args.quizId,
      question: args.question,
      options: args.options,
      correctIndex: args.correctIndex,
      explanation: args.explanation,
      order: maxOrder + 1,
    });
  },
});

// עדכון שאלה (admin)
export const updateQuestion = mutation({
  args: {
    id: v.id("quizQuestions"),
    question: v.optional(v.string()),
    options: v.optional(v.array(v.string())),
    correctIndex: v.optional(v.number()),
    explanation: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const { id, ...updates } = args;
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Question not found");

    const patchData: Record<string, unknown> = {};
    if (updates.question !== undefined) patchData.question = updates.question;
    if (updates.options !== undefined) patchData.options = updates.options;
    if (updates.correctIndex !== undefined) patchData.correctIndex = updates.correctIndex;
    if (updates.explanation !== undefined) patchData.explanation = updates.explanation;

    if (Object.keys(patchData).length > 0) {
      await ctx.db.patch(id, patchData);
    }
  },
});

// מחיקת שאלה (admin)
export const removeQuestion = mutation({
  args: { id: v.id("quizQuestions") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Question not found");

    await ctx.db.delete(args.id);
  },
});
