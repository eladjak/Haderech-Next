import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getOptionalUser, requireAdmin } from "./lib/authGuard";
import { toPublicLessonSummary } from "./lib/authorizationPolicy";

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

// שליפת כל הקטגוריות הקיימות
export const listCategories = query({
  args: {},
  handler: async (ctx) => {
    const courses = await ctx.db
      .query("courses")
      .withIndex("by_published", (q) => q.eq("published", true))
      .collect();

    const categories = new Set<string>();
    for (const course of courses) {
      if (course.category) {
        categories.add(course.category);
      }
    }
    return Array.from(categories).sort();
  },
});

// שליפת קורס לפי ID
export const getById = query({
  args: { id: v.id("courses") },
  handler: async (ctx, args) => {
    const course = await ctx.db.get(args.id);
    if (!course) return null;
    if (course.published) return course;
    const user = await getOptionalUser(ctx);
    return user?.role === "admin" ? course : null;
  },
});

// שליפת קורס עם השיעורים שלו
export const getWithLessons = query({
  args: { id: v.id("courses") },
  handler: async (ctx, args) => {
    const course = await ctx.db.get(args.id);
    if (!course) return null;

    const user = await getOptionalUser(ctx);
    const isAdmin = user?.role === "admin";
    if (!course.published && !isAdmin) return null;

    const lessons = await ctx.db
      .query("lessons")
      .withIndex("by_course_order", (q) => q.eq("courseId", args.id))
      .order("asc")
      .collect();

    if (isAdmin) return { ...course, lessons };

    // Public catalog metadata only. Full lesson text, video and PDF locations
    // are served exclusively by lessons.getById behind the course-access gate.
    return {
      ...course,
      lessons: lessons
        .filter((lesson) => lesson.published)
        .map(toPublicLessonSummary),
    };
  },
});

// יצירת קורס חדש (למנהלים)
export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    imageUrl: v.optional(v.string()),
    category: v.optional(v.string()),
    level: v.optional(
      v.union(
        v.literal("beginner"),
        v.literal("intermediate"),
        v.literal("advanced")
      )
    ),
    estimatedHours: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
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
    category: v.optional(v.string()),
    level: v.optional(
      v.union(
        v.literal("beginner"),
        v.literal("intermediate"),
        v.literal("advanced")
      )
    ),
    estimatedHours: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const { id, ...updates } = args;

    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Course not found");

    return await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});
