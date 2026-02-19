import { query, mutation } from "./_generated/server";
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
    const notification = await ctx.db.get(args.id);
    if (!notification) throw new Error("Notification not found");
    await ctx.db.patch(args.id, { read: true });
  },
});

// סימון כל ההתראות כנקראו
export const markAllAsRead = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
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
export const create = mutation({
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
