import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

const notificationType = v.union(
  v.literal("achievement"),
  v.literal("comment_reply"),
  v.literal("course_update"),
  v.literal("certificate"),
  v.literal("quiz_result")
);

// Internal mutation to create a notification for a user
export const createNotification = internalMutation({
  args: {
    userId: v.id("users"),
    type: notificationType,
    title: v.string(),
    message: v.string(),
    link: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("notifications", {
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

// Batch create notifications for multiple users
export const createBulkNotification = internalMutation({
  args: {
    userIds: v.array(v.id("users")),
    type: notificationType,
    title: v.string(),
    message: v.string(),
    link: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    for (const userId of args.userIds) {
      await ctx.db.insert("notifications", {
        userId,
        type: args.type,
        title: args.title,
        message: args.message,
        link: args.link,
        read: false,
        createdAt: now,
      });
    }
  },
});
