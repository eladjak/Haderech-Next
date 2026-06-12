import { query, mutation, internalMutation } from "./_generated/server";
import { requireSelfOrAdmin, requireUser } from "./lib/authGuard";
import { v } from "convex/values";

// שליפת התראות של משתמש (50 אחרונות)
export const list = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(50);
  },
});

// ספירת התראות שלא נקראו
export const countUnread = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_user_read", (q) =>
        q.eq("userId", args.userId).eq("read", false)
      )
      .collect();
    return unread.length;
  },
});

// סימון התראה כנקראה
export const markAsRead = mutation({
  args: { id: v.id("notifications") },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const notification = await ctx.db.get(args.id);
    if (!notification) throw new Error("Notification not found");
    if (notification.userId !== user._id && user.role !== "admin") {
      throw new Error("Not authorized");
    }
    await ctx.db.patch(args.id, { read: true });
  },
});

// סימון כל ההתראות כנקראו
export const markAllAsRead = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await requireSelfOrAdmin(ctx, args.userId);
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_user_read", (q) =>
        q.eq("userId", args.userId).eq("read", false)
      )
      .collect();

    for (const notification of unread) {
      await ctx.db.patch(notification._id, { read: true });
    }
    return unread.length;
  },
});

// יצירת התראה (internal - נקרא מפונקציות אחרות)
export const create = internalMutation({
  args: {
    userId: v.id("users"),
    type: v.union(
      v.literal("achievement"),
      v.literal("comment_reply"),
      v.literal("course_update"),
      v.literal("certificate"),
      v.literal("quiz_result")
    ),
    title: v.string(),
    message: v.string(),
    link: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("notifications", {
      userId: args.userId,
      type: args.type,
      title: args.title,
      message: args.message,
      link: args.link,
      read: false,
      createdAt: Date.now(),
    });
  },
});
