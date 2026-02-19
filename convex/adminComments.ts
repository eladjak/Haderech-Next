import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./lib/authGuard";

// שליפת כל התגובות לקורס (admin)
export const listByCourse = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const comments = await ctx.db
      .query("comments")
      .filter((q) => q.eq(q.field("courseId"), args.courseId))
      .collect();

    const enriched = await Promise.all(
      comments.map(async (comment) => {
        const user = await ctx.db.get(comment.userId);
        const lesson = await ctx.db.get(comment.lessonId);
        return {
          ...comment,
          userName: user?.name ?? user?.email ?? "Unknown",
          lessonTitle: lesson?.title ?? "שיעור לא נמצא",
        };
      })
    );

    return enriched.sort((a, b) => b.createdAt - a.createdAt);
  },
});

// ספירת תגובות לקורס (admin)
export const countByCourse = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const comments = await ctx.db
      .query("comments")
      .filter((q) => q.eq(q.field("courseId"), args.courseId))
      .collect();
    return comments.length;
  },
});

// מחיקת תגובה (admin) - כולל תשובות
export const remove = mutation({
  args: { id: v.id("comments") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const comment = await ctx.db.get(args.id);
    if (!comment) throw new Error("Comment not found");

    // Delete replies if top-level
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
