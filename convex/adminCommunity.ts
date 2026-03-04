import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ─── Helper ───────────────────────────────────────────────────────────────────

async function requireAdmin(ctx: {
  auth: { getUserIdentity: () => Promise<{ subject: string } | null> };
  db: any;
}) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");
  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", identity.subject))
    .unique();
  if (!user) throw new Error("User not found");
  if (user.role !== "admin") throw new Error("Admin access required");
  return user;
}

// ─── Admin Queries ────────────────────────────────────────────────────────────

// רשימת כל הנושאים (ללא מגבלת auth, עם מידע מורחב)
export const listAllTopics = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 100;

    const topics = await ctx.db
      .query("communityTopics")
      .withIndex("by_created")
      .order("desc")
      .take(limit);

    const enriched = await Promise.all(
      topics.map(async (topic: any) => {
        const user = await ctx.db.get(topic.userId);
        const u = user as
          | { name?: string; email?: string; imageUrl?: string }
          | null;
        return {
          ...topic,
          authorName: u?.name ?? u?.email ?? "משתמש",
          authorEmail: u?.email ?? null,
          authorImage: u?.imageUrl ?? null,
        };
      })
    );

    return [
      ...enriched.filter((t: any) => t.pinned),
      ...enriched.filter((t: any) => !t.pinned),
    ];
  },
});

// סטטיסטיקות קהילה
export const getCommunityStats = query({
  args: {},
  handler: async (ctx) => {
    const topics = await ctx.db.query("communityTopics").collect();
    const replies = await ctx.db.query("communityReplies").collect();
    const topicLikes = await ctx.db.query("communityTopicLikes").collect();
    const replyLikes = await ctx.db.query("communityReplyLikes").collect();

    const pinnedCount = topics.filter((t: any) => t.pinned).length;

    // unique users who posted or replied
    const userIds = new Set<string>([
      ...topics.map((t: any) => String(t.userId)),
      ...replies.map((r: any) => String(r.userId)),
    ]);

    const categoryBreakdown = topics.reduce(
      (acc: Record<string, number>, topic: any) => {
        acc[topic.category] = (acc[topic.category] ?? 0) + 1;
        return acc;
      },
      {}
    );

    return {
      totalTopics: topics.length,
      totalReplies: replies.length,
      totalLikes: topicLikes.length + replyLikes.length,
      pinnedTopics: pinnedCount,
      activeUsers: userIds.size,
      categoryBreakdown,
    };
  },
});

// ─── Admin Mutations ──────────────────────────────────────────────────────────

// הצמדת נושא
export const pinTopic = mutation({
  args: { topicId: v.id("communityTopics") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const topic = await ctx.db.get(args.topicId);
    if (!topic) throw new Error("נושא לא נמצא");

    await ctx.db.patch(args.topicId, { pinned: true });
    return { success: true };
  },
});

// ביטול הצמדת נושא
export const unpinTopic = mutation({
  args: { topicId: v.id("communityTopics") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const topic = await ctx.db.get(args.topicId);
    if (!topic) throw new Error("נושא לא נמצא");

    await ctx.db.patch(args.topicId, { pinned: false });
    return { success: true };
  },
});

// מחיקת נושא על-ידי admin (force delete - כולל כל התגובות)
export const deleteTopic = mutation({
  args: { topicId: v.id("communityTopics") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const topic = await ctx.db.get(args.topicId);
    if (!topic) throw new Error("נושא לא נמצא");

    // מחיקת כל התגובות ולייקים שלהן
    const replies = await ctx.db
      .query("communityReplies")
      .withIndex("by_topic", (q) => q.eq("topicId", args.topicId))
      .collect();

    for (const reply of replies) {
      const replyLikes = await ctx.db
        .query("communityReplyLikes")
        .withIndex("by_reply", (q) => q.eq("replyId", reply._id))
        .collect();
      for (const like of replyLikes) {
        await ctx.db.delete(like._id);
      }
      await ctx.db.delete(reply._id);
    }

    // מחיקת לייקים של הנושא
    const topicLikes = await ctx.db
      .query("communityTopicLikes")
      .withIndex("by_topic", (q) => q.eq("topicId", args.topicId))
      .collect();
    for (const like of topicLikes) {
      await ctx.db.delete(like._id);
    }

    await ctx.db.delete(args.topicId);
    return { success: true };
  },
});

// מחיקת תגובה על-ידי admin
export const deleteReply = mutation({
  args: { replyId: v.id("communityReplies") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const reply = await ctx.db.get(args.replyId);
    if (!reply) throw new Error("תגובה לא נמצאה");

    // מחיקת לייקים של התגובה
    const replyLikes = await ctx.db
      .query("communityReplyLikes")
      .withIndex("by_reply", (q) => q.eq("replyId", args.replyId))
      .collect();
    for (const like of replyLikes) {
      await ctx.db.delete(like._id);
    }

    // עדכון מונה תגובות
    const topic = await ctx.db.get(reply.topicId);
    if (topic) {
      await ctx.db.patch(reply.topicId, {
        repliesCount: Math.max(0, topic.repliesCount - 1),
      });
    }

    await ctx.db.delete(args.replyId);
    return { success: true };
  },
});
