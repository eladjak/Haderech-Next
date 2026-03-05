import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ---- Watch-time & resume helpers (auth-based, no userId arg) ----

// עדכון זמן צפייה עם זיהוי אוטומטי של המשתמש
export const updateWatchTime = mutation({
  args: {
    lessonId: v.id("lessons"),
    courseId: v.id("courses"),
    watchTimeSeconds: v.number(),
    progressPercent: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    const existing = await ctx.db
      .query("progress")
      .withIndex("by_user_lesson", (q) =>
        q.eq("userId", user._id).eq("lessonId", args.lessonId)
      )
      .first();

    const now = Date.now();

    if (existing) {
      const updates: Record<string, unknown> = {
        progressPercent: Math.max(existing.progressPercent, args.progressPercent),
        lastWatchedAt: now,
        watchTimeSeconds: (existing.watchTimeSeconds ?? 0) + args.watchTimeSeconds,
      };

      // Mark as completed if 90%+
      if (args.progressPercent >= 90 && !existing.completed) {
        updates.completed = true;
        updates.completedAt = now;
      }

      await ctx.db.patch(existing._id, updates);
    } else {
      await ctx.db.insert("progress", {
        userId: user._id,
        lessonId: args.lessonId,
        courseId: args.courseId,
        completed: args.progressPercent >= 90,
        progressPercent: args.progressPercent,
        lastWatchedAt: now,
        completedAt: args.progressPercent >= 90 ? now : undefined,
        watchTimeSeconds: args.watchTimeSeconds,
      });
    }
  },
});

// שליפת התקדמות שיעור לצורך המשך צפייה (auth-based)
export const getLessonProgress = query({
  args: { lessonId: v.id("lessons") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return null;

    return await ctx.db
      .query("progress")
      .withIndex("by_user_lesson", (q) =>
        q.eq("userId", user._id).eq("lessonId", args.lessonId)
      )
      .first();
  },
});

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
    watchTimeSeconds: v.optional(v.number()), // זמן צפייה שנוסף מאז העדכון האחרון
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
      const accumulatedWatchTime =
        (existing.watchTimeSeconds ?? 0) + (args.watchTimeSeconds ?? 0);

      return await ctx.db.patch(existing._id, {
        progressPercent: Math.max(existing.progressPercent, args.progressPercent),
        completed: existing.completed || completed,
        lastWatchedAt: now,
        completedAt: completed && !existing.completedAt ? now : existing.completedAt,
        watchTimeSeconds: accumulatedWatchTime,
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
      watchTimeSeconds: args.watchTimeSeconds ?? 0,
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
