import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// שליפת התקדמות משתמש בשיעור
export const getForLesson = query({
  args: {
    userId: v.id("users"),
    lessonId: v.id("lessons"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("progress")
      .withIndex("by_user_lesson", (q) =>
        q.eq("userId", args.userId).eq("lessonId", args.lessonId)
      )
      .unique();
  },
});

// שליפת כל ההתקדמות של משתמש בקורס
export const getForCourse = query({
  args: {
    userId: v.id("users"),
    courseId: v.id("courses"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("progress")
      .withIndex("by_user_course", (q) =>
        q.eq("userId", args.userId).eq("courseId", args.courseId)
      )
      .collect();
  },
});

// חישוב אחוז השלמת קורס
export const getCourseCompletion = query({
  args: {
    userId: v.id("users"),
    courseId: v.id("courses"),
  },
  handler: async (ctx, args) => {
    const lessons = await ctx.db
      .query("lessons")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .collect();

    if (lessons.length === 0) return 0;

    const progress = await ctx.db
      .query("progress")
      .withIndex("by_user_course", (q) =>
        q.eq("userId", args.userId).eq("courseId", args.courseId)
      )
      .collect();

    const completedCount = progress.filter((p) => p.completed).length;
    return Math.round((completedCount / lessons.length) * 100);
  },
});

// עדכון התקדמות בשיעור
export const updateProgress = mutation({
  args: {
    userId: v.id("users"),
    lessonId: v.id("lessons"),
    courseId: v.id("courses"),
    progressPercent: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const completed = args.progressPercent >= 90;

    const existing = await ctx.db
      .query("progress")
      .withIndex("by_user_lesson", (q) =>
        q.eq("userId", args.userId).eq("lessonId", args.lessonId)
      )
      .unique();

    if (existing) {
      return await ctx.db.patch(existing._id, {
        progressPercent: Math.max(existing.progressPercent, args.progressPercent),
        completed: existing.completed || completed,
        lastWatchedAt: now,
        completedAt: completed && !existing.completedAt ? now : existing.completedAt,
      });
    }

    return await ctx.db.insert("progress", {
      userId: args.userId,
      lessonId: args.lessonId,
      courseId: args.courseId,
      progressPercent: args.progressPercent,
      completed,
      lastWatchedAt: now,
      completedAt: completed ? now : undefined,
    });
  },
});

// סימון שיעור כהושלם
export const markComplete = mutation({
  args: {
    userId: v.id("users"),
    lessonId: v.id("lessons"),
    courseId: v.id("courses"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const existing = await ctx.db
      .query("progress")
      .withIndex("by_user_lesson", (q) =>
        q.eq("userId", args.userId).eq("lessonId", args.lessonId)
      )
      .unique();

    if (existing) {
      return await ctx.db.patch(existing._id, {
        progressPercent: 100,
        completed: true,
        lastWatchedAt: now,
        completedAt: existing.completedAt ?? now,
      });
    }

    return await ctx.db.insert("progress", {
      userId: args.userId,
      lessonId: args.lessonId,
      courseId: args.courseId,
      progressPercent: 100,
      completed: true,
      lastWatchedAt: now,
      completedAt: now,
    });
  },
});
