import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// שליפת כל הקורסים המפורסמים
export const listPublished = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("courses")
      .withIndex("by_published", (q) => q.eq("published", true))
      .order("asc")
      .collect();
  },
});

// שליפת קורס לפי ID
export const getById = query({
  args: { id: v.id("courses") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// שליפת קורס עם השיעורים שלו
export const getWithLessons = query({
  args: { id: v.id("courses") },
  handler: async (ctx, args) => {
    const course = await ctx.db.get(args.id);
    if (!course) return null;

    const lessons = await ctx.db
      .query("lessons")
      .withIndex("by_course_order", (q) => q.eq("courseId", args.id))
      .order("asc")
      .collect();

    return { ...course, lessons };
  },
});

// יצירת קורס חדש (למנהלים)
export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // מציאת הסדר הגבוה ביותר
    const lastCourse = await ctx.db
      .query("courses")
      .withIndex("by_order")
      .order("desc")
      .first();

    const order = lastCourse ? lastCourse.order + 1 : 0;

    return await ctx.db.insert("courses", {
      ...args,
      published: false,
      order,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// עדכון קורס
export const update = mutation({
  args: {
    id: v.id("courses"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    published: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Course not found");

    return await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});
