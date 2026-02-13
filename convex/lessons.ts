import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// שליפת שיעור לפי ID
export const getById = query({
  args: { id: v.id("lessons") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// שליפת שיעורים לפי קורס
export const listByCourse = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("lessons")
      .withIndex("by_course_order", (q) => q.eq("courseId", args.courseId))
      .order("asc")
      .collect();
  },
});

// יצירת שיעור חדש
export const create = mutation({
  args: {
    courseId: v.id("courses"),
    title: v.string(),
    content: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
    duration: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // מציאת הסדר הגבוה ביותר בקורס
    const lastLesson = await ctx.db
      .query("lessons")
      .withIndex("by_course_order", (q) => q.eq("courseId", args.courseId))
      .order("desc")
      .first();

    const order = lastLesson ? lastLesson.order + 1 : 0;

    return await ctx.db.insert("lessons", {
      ...args,
      order,
      published: false,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// עדכון שיעור
export const update = mutation({
  args: {
    id: v.id("lessons"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
    duration: v.optional(v.number()),
    published: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Lesson not found");

    return await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// מחיקת שיעור
export const remove = mutation({
  args: { id: v.id("lessons") },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Lesson not found");

    // מחיקת כל ההתקדמות הקשורה
    const progressEntries = await ctx.db
      .query("progress")
      .withIndex("by_lesson", (q) => q.eq("lessonId", args.id))
      .collect();

    for (const entry of progressEntries) {
      await ctx.db.delete(entry._id);
    }

    return await ctx.db.delete(args.id);
  },
});
