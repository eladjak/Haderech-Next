import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./lib/authGuard";

// שליפת שיעורים לפי קורס (admin - כולל לא מפורסמים)
export const listByCourse = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db
      .query("lessons")
      .withIndex("by_course_order", (q) => q.eq("courseId", args.courseId))
      .order("asc")
      .collect();
  },
});

// יצירת שיעור חדש (admin)
export const create = mutation({
  args: {
    courseId: v.id("courses"),
    title: v.string(),
    content: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
    duration: v.optional(v.number()),
    order: v.optional(v.number()),
    published: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const now = Date.now();

    let order = args.order;
    if (order === undefined) {
      const lastLesson = await ctx.db
        .query("lessons")
        .withIndex("by_course_order", (q) => q.eq("courseId", args.courseId))
        .order("desc")
        .first();
      order = lastLesson ? lastLesson.order + 1 : 0;
    }

    return await ctx.db.insert("lessons", {
      courseId: args.courseId,
      title: args.title,
      content: args.content,
      videoUrl: args.videoUrl,
      duration: args.duration,
      order,
      published: args.published ?? false,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// עדכון שיעור (admin)
export const update = mutation({
  args: {
    id: v.id("lessons"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
    duration: v.optional(v.number()),
    order: v.optional(v.number()),
    published: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const { id, ...updates } = args;

    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Lesson not found");

    return await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// מחיקת שיעור (admin) - כולל נתונים קשורים
export const remove = mutation({
  args: { id: v.id("lessons") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Lesson not found");

    // מחיקת התקדמות
    const progressEntries = await ctx.db
      .query("progress")
      .withIndex("by_lesson", (q) => q.eq("lessonId", args.id))
      .collect();
    for (const entry of progressEntries) {
      await ctx.db.delete(entry._id);
    }

    // מחיקת בחנים ושאלות ותוצאות
    const quizzes = await ctx.db
      .query("quizzes")
      .withIndex("by_lesson", (q) => q.eq("lessonId", args.id))
      .collect();
    for (const quiz of quizzes) {
      const questions = await ctx.db
        .query("quizQuestions")
        .withIndex("by_quiz", (q) => q.eq("quizId", quiz._id))
        .collect();
      for (const question of questions) {
        await ctx.db.delete(question._id);
      }
      const quizAttempts = await ctx.db
        .query("quizAttempts")
        .filter((q) => q.eq(q.field("lessonId"), args.id))
        .collect();
      for (const attempt of quizAttempts) {
        await ctx.db.delete(attempt._id);
      }
      await ctx.db.delete(quiz._id);
    }

    // מחיקת תגובות
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_lesson", (q) => q.eq("lessonId", args.id))
      .collect();
    for (const comment of comments) {
      await ctx.db.delete(comment._id);
    }

    return await ctx.db.delete(args.id);
  },
});

// שינוי סדר שיעורים (admin) - עדכון order field
export const reorder = mutation({
  args: {
    lessonIds: v.array(v.id("lessons")),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const now = Date.now();
    for (let i = 0; i < args.lessonIds.length; i++) {
      await ctx.db.patch(args.lessonIds[i], {
        order: i,
        updatedAt: now,
      });
    }
  },
});
