import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { type Id } from "./_generated/dataModel";

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function requireUser(ctx: { auth: { getUserIdentity: () => Promise<{ subject: string } | null> }; db: any }) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");
  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", identity.subject))
    .unique();
  if (!user) throw new Error("User not found");
  return user as {
    _id: Id<"users">;
    clerkId: string;
    email: string;
    name?: string;
    imageUrl?: string;
    role: "student" | "admin";
  };
}

// ─── Queries ──────────────────────────────────────────────────────────────────

// רשימת נושאים - עם אפשרות לסינון לפי קטגוריה
export const listTopics = query({
  args: {
    category: v.optional(
      v.union(
        v.literal("general"),
        v.literal("dating-tips"),
        v.literal("success-stories"),
        v.literal("questions"),
        v.literal("advice")
      )
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;

    const topics = args.category
      ? await ctx.db
          .query("communityTopics")
          .withIndex("by_category", (q) => q.eq("category", args.category!))
          .order("desc")
          .take(limit)
      : await ctx.db
          .query("communityTopics")
          .withIndex("by_created")
          .order("desc")
          .take(limit);

    // Enrich with user data
    const enriched = await Promise.all(
      topics.map(async (topic) => {
        const user = await ctx.db.get(topic.userId);
        const u = user as { name?: string; email?: string; imageUrl?: string } | null;
        return {
          ...topic,
          authorName: u?.name ?? u?.email ?? "משתמש",
          authorImage: u?.imageUrl ?? null,
        };
      })
    );

    // Pinned topics always first
    return [
      ...enriched.filter((t) => t.pinned),
      ...enriched.filter((t) => !t.pinned),
    ];
  },
});

// פרטי נושא יחיד כולל תגובות
export const getTopic = query({
  args: { topicId: v.id("communityTopics") },
  handler: async (ctx, args) => {
    const topic = await ctx.db.get(args.topicId);
    if (!topic) return null;

    const authorRaw = await ctx.db.get(topic.userId);
    const author = authorRaw as { name?: string; email?: string; imageUrl?: string } | null;

    // Fetch replies
    const replies = await ctx.db
      .query("communityReplies")
      .withIndex("by_topic", (q) => q.eq("topicId", args.topicId))
      .order("asc")
      .collect();

    const enrichedReplies = await Promise.all(
      replies.map(async (reply) => {
        const userRaw = await ctx.db.get(reply.userId);
        const u = userRaw as { name?: string; email?: string; imageUrl?: string } | null;
        return {
          ...reply,
          authorName: u?.name ?? u?.email ?? "משתמש",
          authorImage: u?.imageUrl ?? null,
        };
      })
    );

    return {
      ...topic,
      authorName: author?.name ?? author?.email ?? "משתמש",
      authorImage: author?.imageUrl ?? null,
      replies: enrichedReplies,
    };
  },
});

// בדיקה אם המשתמש אהב נושא
export const getTopicLikeStatus = query({
  args: { topicId: v.id("communityTopics") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return false;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return false;

    const existing = await ctx.db
      .query("communityTopicLikes")
      .withIndex("by_user_topic", (q) =>
        q.eq("userId", user._id).eq("topicId", args.topicId)
      )
      .unique();

    return !!existing;
  },
});

// בדיקה אם המשתמש אהב תגובה
export const getReplyLikeStatus = query({
  args: { replyId: v.id("communityReplies") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return false;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return false;

    const existing = await ctx.db
      .query("communityReplyLikes")
      .withIndex("by_user_reply", (q) =>
        q.eq("userId", user._id).eq("replyId", args.replyId)
      )
      .unique();

    return !!existing;
  },
});

// ─── Mutations ────────────────────────────────────────────────────────────────

// יצירת נושא חדש
export const createTopic = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    category: v.union(
      v.literal("general"),
      v.literal("dating-tips"),
      v.literal("success-stories"),
      v.literal("questions"),
      v.literal("advice")
    ),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const title = args.title.trim();
    const content = args.content.trim();

    if (title.length === 0) throw new Error("כותרת לא יכולה להיות ריקה");
    if (title.length > 200) throw new Error("כותרת ארוכה מדי (מקסימום 200 תווים)");
    if (content.length === 0) throw new Error("תוכן לא יכול להיות ריק");
    if (content.length > 5000) throw new Error("תוכן ארוך מדי (מקסימום 5000 תווים)");

    return await ctx.db.insert("communityTopics", {
      userId: user._id,
      title,
      content,
      category: args.category,
      pinned: false,
      likesCount: 0,
      repliesCount: 0,
      createdAt: Date.now(),
    });
  },
});

// יצירת תגובה לנושא
export const createReply = mutation({
  args: {
    topicId: v.id("communityTopics"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const topic = await ctx.db.get(args.topicId);
    if (!topic) throw new Error("נושא לא נמצא");

    const content = args.content.trim();
    if (content.length === 0) throw new Error("תגובה לא יכולה להיות ריקה");
    if (content.length > 2000) throw new Error("תגובה ארוכה מדי (מקסימום 2000 תווים)");

    const replyId = await ctx.db.insert("communityReplies", {
      topicId: args.topicId,
      userId: user._id,
      content,
      likesCount: 0,
      createdAt: Date.now(),
    });

    // Update reply count on topic
    await ctx.db.patch(args.topicId, {
      repliesCount: topic.repliesCount + 1,
    });

    return replyId;
  },
});

// Toggle לייק על נושא
export const toggleLikeTopic = mutation({
  args: { topicId: v.id("communityTopics") },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const topic = await ctx.db.get(args.topicId);
    if (!topic) throw new Error("נושא לא נמצא");

    const existing = await ctx.db
      .query("communityTopicLikes")
      .withIndex("by_user_topic", (q) =>
        q.eq("userId", user._id).eq("topicId", args.topicId)
      )
      .unique();

    if (existing) {
      // Unlike
      await ctx.db.delete(existing._id);
      await ctx.db.patch(args.topicId, {
        likesCount: Math.max(0, topic.likesCount - 1),
      });
      return false;
    } else {
      // Like
      await ctx.db.insert("communityTopicLikes", {
        topicId: args.topicId,
        userId: user._id,
      });
      await ctx.db.patch(args.topicId, {
        likesCount: topic.likesCount + 1,
      });
      return true;
    }
  },
});

// Toggle לייק על תגובה
export const toggleLikeReply = mutation({
  args: { replyId: v.id("communityReplies") },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const reply = await ctx.db.get(args.replyId);
    if (!reply) throw new Error("תגובה לא נמצאה");

    const existing = await ctx.db
      .query("communityReplyLikes")
      .withIndex("by_user_reply", (q) =>
        q.eq("userId", user._id).eq("replyId", args.replyId)
      )
      .unique();

    if (existing) {
      // Unlike
      await ctx.db.delete(existing._id);
      await ctx.db.patch(args.replyId, {
        likesCount: Math.max(0, reply.likesCount - 1),
      });
      return false;
    } else {
      // Like
      await ctx.db.insert("communityReplyLikes", {
        replyId: args.replyId,
        userId: user._id,
      });
      await ctx.db.patch(args.replyId, {
        likesCount: reply.likesCount + 1,
      });
      return true;
    }
  },
});

// מחיקת נושא (רק הכותב או admin)
export const deleteTopic = mutation({
  args: { topicId: v.id("communityTopics") },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const topic = await ctx.db.get(args.topicId);
    if (!topic) throw new Error("נושא לא נמצא");

    if (topic.userId !== user._id && user.role !== "admin") {
      throw new Error("אין הרשאה למחוק נושא זה");
    }

    // Delete all replies and their likes
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

    // Delete topic likes
    const topicLikes = await ctx.db
      .query("communityTopicLikes")
      .withIndex("by_topic", (q) => q.eq("topicId", args.topicId))
      .collect();
    for (const like of topicLikes) {
      await ctx.db.delete(like._id);
    }

    await ctx.db.delete(args.topicId);
  },
});

// מחיקת תגובה (רק הכותב או admin)
export const deleteReply = mutation({
  args: { replyId: v.id("communityReplies") },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const reply = await ctx.db.get(args.replyId);
    if (!reply) throw new Error("תגובה לא נמצאה");

    if (reply.userId !== user._id && user.role !== "admin") {
      throw new Error("אין הרשאה למחוק תגובה זו");
    }

    // Delete reply likes
    const replyLikes = await ctx.db
      .query("communityReplyLikes")
      .withIndex("by_reply", (q) => q.eq("replyId", args.replyId))
      .collect();
    for (const like of replyLikes) {
      await ctx.db.delete(like._id);
    }

    // Decrement reply count on topic
    const topic = await ctx.db.get(reply.topicId);
    if (topic) {
      await ctx.db.patch(reply.topicId, {
        repliesCount: Math.max(0, topic.repliesCount - 1),
      });
    }

    await ctx.db.delete(args.replyId);
  },
});
