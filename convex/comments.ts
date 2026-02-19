import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// שליפת תגובות לשיעור (כולל פרטי משתמש)
export const listByLesson = query({
  args: { lessonId: v.id("lessons") },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_lesson", (q) => q.eq("lessonId", args.lessonId))
      .collect();

    // Enrich with user data
    const enriched = await Promise.all(
      comments.map(async (comment) => {
        const user = await ctx.db.get(comment.userId);
        return {
          ...comment,
          userName: user?.name ?? user?.email ?? "משתמש",
          userImage: user?.imageUrl ?? null,
        };
      })
    );

    // Sort: newest first for top-level, oldest first for replies
    const topLevel = enriched
      .filter((c) => !c.parentId)
      .sort((a, b) => b.createdAt - a.createdAt);

    const replies = enriched.filter((c) => c.parentId);

    // Attach replies to parent comments
    return topLevel.map((comment) => ({
      ...comment,
      replies: replies
        .filter((r) => r.parentId === comment._id)
        .sort((a, b) => a.createdAt - b.createdAt),
    }));
  },
});

// ספירת תגובות לשיעור
export const countByLesson = query({
  args: { lessonId: v.id("lessons") },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_lesson", (q) => q.eq("lessonId", args.lessonId))
      .collect();
    return comments.length;
  },
});

// יצירת תגובה חדשה
export const create = mutation({
  args: {
    lessonId: v.id("lessons"),
    courseId: v.id("courses"),
    content: v.string(),
    parentId: v.optional(v.id("comments")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    // Validate content
    const trimmed = args.content.trim();
    if (trimmed.length === 0) throw new Error("Comment cannot be empty");
    if (trimmed.length > 2000)
      throw new Error("Comment too long (max 2000 characters)");

    // If reply, verify parent exists
    if (args.parentId) {
      const parent = await ctx.db.get(args.parentId);
      if (!parent) throw new Error("Parent comment not found");
    }

    const now = Date.now();
    return await ctx.db.insert("comments", {
      userId: user._id,
      lessonId: args.lessonId,
      courseId: args.courseId,
      content: trimmed,
      parentId: args.parentId,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// עדכון תגובה (רק הכותב או admin)
export const update = mutation({
  args: {
    id: v.id("comments"),
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

    const comment = await ctx.db.get(args.id);
    if (!comment) throw new Error("Comment not found");

    // Only author or admin can update
    if (comment.userId !== user._id && user.role !== "admin") {
      throw new Error("Not authorized to edit this comment");
    }

    const trimmed = args.content.trim();
    if (trimmed.length === 0) throw new Error("Comment cannot be empty");
    if (trimmed.length > 2000)
      throw new Error("Comment too long (max 2000 characters)");

    await ctx.db.patch(args.id, {
      content: trimmed,
      updatedAt: Date.now(),
    });
  },
});

// מחיקת תגובה (רק הכותב או admin) - כולל תגובות תשובה
export const remove = mutation({
  args: { id: v.id("comments") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    const comment = await ctx.db.get(args.id);
    if (!comment) throw new Error("Comment not found");

    // Only author or admin can delete
    if (comment.userId !== user._id && user.role !== "admin") {
      throw new Error("Not authorized to delete this comment");
    }

    // Delete replies if this is a top-level comment
    if (!comment.parentId) {
      const replies = await ctx.db
        .query("comments")
        .withIndex("by_parent", (q) => q.eq("parentId", args.id))
        .collect();
      for (const reply of replies) {
        await ctx.db.delete(reply._id);
      }
    }

    await ctx.db.delete(args.id);
  },
});
