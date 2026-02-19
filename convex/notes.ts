import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// שליפת הערה של משתמש לשיעור
export const getForLesson = query({
  args: {
    userId: v.id("users"),
    lessonId: v.id("lessons"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("notes")
      .withIndex("by_user_lesson", (q) =>
        q.eq("userId", args.userId).eq("lessonId", args.lessonId)
      )
      .first();
  },
});

// שליפת כל ההערות של משתמש לקורס
export const listByCourse = query({
  args: {
    userId: v.id("users"),
    courseId: v.id("courses"),
  },
  handler: async (ctx, args) => {
    const notes = await ctx.db
      .query("notes")
      .withIndex("by_user_course", (q) =>
        q.eq("userId", args.userId).eq("courseId", args.courseId)
      )
      .collect();

    // Enrich with lesson titles
    const enriched = await Promise.all(
      notes.map(async (note) => {
        const lesson = await ctx.db.get(note.lessonId);
        return {
          ...note,
          lessonTitle: lesson?.title ?? "שיעור לא נמצא",
          lessonOrder: lesson?.order ?? 0,
        };
      })
    );

    return enriched.sort((a, b) => a.lessonOrder - b.lessonOrder);
  },
});

// שליפת כל ההערות של משתמש (כל הקורסים)
export const listAll = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const notes = await ctx.db
      .query("notes")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const enriched = await Promise.all(
      notes.map(async (note) => {
        const lesson = await ctx.db.get(note.lessonId);
        const course = await ctx.db.get(note.courseId);
        return {
          ...note,
          lessonTitle: lesson?.title ?? "שיעור לא נמצא",
          courseTitle: course?.title ?? "קורס לא נמצא",
        };
      })
    );

    return enriched.sort((a, b) => b.updatedAt - a.updatedAt);
  },
});

// שמירת/עדכון הערה (upsert)
export const save = mutation({
  args: {
    lessonId: v.id("lessons"),
    courseId: v.id("courses"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    if (args.content.length > 10000)
      throw new Error("Note too long (max 10000 characters)");

    const now = Date.now();

    // Check if note already exists
    const existing = await ctx.db
      .query("notes")
      .withIndex("by_user_lesson", (q) =>
        q.eq("userId", user._id).eq("lessonId", args.lessonId)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        content: args.content,
        updatedAt: now,
      });
      return existing._id;
    }

    return await ctx.db.insert("notes", {
      userId: user._id,
      lessonId: args.lessonId,
      courseId: args.courseId,
      content: args.content,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// מחיקת הערה
export const remove = mutation({
  args: { id: v.id("notes") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    const note = await ctx.db.get(args.id);
    if (!note) throw new Error("Note not found");

    if (note.userId !== user._id) {
      throw new Error("Not authorized to delete this note");
    }

    await ctx.db.delete(args.id);
  },
});
