import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import { requireCommunityAccess } from "./lib/communityAccessGuard";
import { blockedUserIdsFor } from "./lib/communityModerationData";

// ─── Types ────────────────────────────────────────────────────────────────────

type ForumCategory =
  | "general"
  | "dating-tips"
  | "success-stories"
  | "questions"
  | "advice";

// ─── Categories ───────────────────────────────────────────────────────────────

/** Static list of forum categories */
export const listCategories = query({
  args: {},
  handler: async (ctx) => {
    await requireCommunityAccess(ctx);
    return [
      {
        value: "general" as ForumCategory,
        label: "כללי",
        emoji: "💬",
        description: "שיחות כלליות על חיי הקשר",
      },
      {
        value: "dating-tips" as ForumCategory,
        label: "טיפים",
        emoji: "💡",
        description: "טיפים ועצות לדייטינג מוצלח",
      },
      {
        value: "success-stories" as ForumCategory,
        label: "שיתופים מהדרך",
        emoji: "💕",
        description: "שתפו את הסיפור שלכם",
      },
      {
        value: "questions" as ForumCategory,
        label: "שאלות",
        emoji: "❓",
        description: "שאלו ותקבלו עזרה מהקהילה",
      },
      {
        value: "advice" as ForumCategory,
        label: "עצות",
        emoji: "🎯",
        description: "עצות מניסיון אישי",
      },
    ];
  },
});

// ─── Posts (using communityTopics table) ─────────────────────────────────────

/** List posts by category with sorting and pagination */
export const listPosts = query({
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
    sortBy: v.optional(v.union(v.literal("latest"), v.literal("popular"))),
    take: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await requireCommunityAccess(ctx);
    const blockedUserIds = await blockedUserIdsFor(ctx, user._id);
    const limit = Math.min(Math.max(args.take ?? 30, 1), 100);
    const scanLimit = Math.min(limit * 3, 300);

    let posts: Doc<"communityTopics">[];

    const category = args.category;
    if (category) {
      posts = await ctx.db
        .query("communityTopics")
        .withIndex("by_category", (q) =>
          q.eq("category", category)
        )
        .order("desc")
        .take(scanLimit);
    } else {
      posts = await ctx.db
        .query("communityTopics")
        .withIndex("by_created")
        .order("desc")
        .take(scanLimit);
    }

    // Sort by popular (likes + replies) if requested
    if (args.sortBy === "popular") {
      posts.sort(
        (a, b) =>
          b.likesCount + b.repliesCount - (a.likesCount + a.repliesCount)
      );
    }

    posts = posts
      .filter((post) => !blockedUserIds.has(String(post.userId)))
      .slice(0, limit);

    // Enrich with author info
    const enriched = await Promise.all(
      posts.map(async (post) => {
        const userRaw = await ctx.db.get(post.userId);
        const u = userRaw as {
          name?: string;
          email?: string;
          imageUrl?: string;
        } | null;
        return {
          ...post,
          authorName: u?.name ?? u?.email ?? "משתמש",
          authorImage: u?.imageUrl ?? null,
        };
        })
    );

    // Pinned posts always come first
    return [
      ...enriched.filter((post) => post.pinned),
      ...enriched.filter((post) => !post.pinned),
    ];
  },
});

/** Get single post with full author info */
export const getPost = query({
  args: { postId: v.id("communityTopics") },
  handler: async (ctx, args) => {
    const user = await requireCommunityAccess(ctx);
    const blockedUserIds = await blockedUserIdsFor(ctx, user._id);
    const post = await ctx.db.get(args.postId);
    if (!post) return null;
    if (blockedUserIds.has(String(post.userId))) return null;

    const authorRaw = await ctx.db.get(post.userId);
    const author = authorRaw as {
      name?: string;
      email?: string;
      imageUrl?: string;
    } | null;

    return {
      ...post,
      authorName: author?.name ?? author?.email ?? "משתמש",
      authorImage: author?.imageUrl ?? null,
    };
  },
});

/** Create a new forum post */
export const createPost = mutation({
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
    const user = await requireCommunityAccess(ctx);

    const title = args.title.trim();
    const content = args.content.trim();

    if (!title) throw new Error("כותרת לא יכולה להיות ריקה");
    if (title.length > 200) throw new Error("כותרת ארוכה מדי (מקסימום 200 תווים)");
    if (content.length < 10) throw new Error("תוכן חייב להכיל לפחות 10 תווים");
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

/** Toggle like on a post */
export const likePost = mutation({
  args: { postId: v.id("communityTopics") },
  handler: async (ctx, args) => {
    const user = await requireCommunityAccess(ctx);

    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("פוסט לא נמצא");
    const blockedUserIds = await blockedUserIdsFor(ctx, user._id);
    if (blockedUserIds.has(String(post.userId))) throw new Error("פוסט לא נמצא");

    const existing = await ctx.db
      .query("communityTopicLikes")
      .withIndex("by_user_topic", (q) =>
        q.eq("userId", user._id).eq("topicId", args.postId)
      )
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
      await ctx.db.patch(args.postId, {
        likesCount: Math.max(0, post.likesCount - 1),
      });
      return false;
    } else {
      await ctx.db.insert("communityTopicLikes", {
        topicId: args.postId,
        userId: user._id,
      });
      await ctx.db.patch(args.postId, {
        likesCount: post.likesCount + 1,
      });
      return true;
    }
  },
});

/** Check if current user liked a post */
export const getPostLikeStatus = query({
  args: { postId: v.id("communityTopics") },
  handler: async (ctx, args) => {
    const user = await requireCommunityAccess(ctx);

    const existing = await ctx.db
      .query("communityTopicLikes")
      .withIndex("by_user_topic", (q) =>
        q.eq("userId", user._id).eq("topicId", args.postId)
      )
      .unique();

    return !!existing;
  },
});

// ─── Replies ──────────────────────────────────────────────────────────────────

/** List replies for a post */
export const listReplies = query({
  args: { postId: v.id("communityTopics") },
  handler: async (ctx, args) => {
    const user = await requireCommunityAccess(ctx);
    const blockedUserIds = await blockedUserIdsFor(ctx, user._id);
    const post = await ctx.db.get(args.postId);
    if (!post || blockedUserIds.has(String(post.userId))) return [];
    const replies = await ctx.db
      .query("communityReplies")
      .withIndex("by_topic", (q) => q.eq("topicId", args.postId))
      .order("asc")
      .collect();

    return await Promise.all(
      replies
        .filter((reply) => !blockedUserIds.has(String(reply.userId)))
        .map(async (reply) => {
        const userRaw = await ctx.db.get(reply.userId);
        const u = userRaw as {
          name?: string;
          email?: string;
          imageUrl?: string;
        } | null;
        return {
          ...reply,
          authorName: u?.name ?? u?.email ?? "משתמש",
          authorImage: u?.imageUrl ?? null,
        };
        })
    );
  },
});

/** Create a reply to a post */
export const createReply = mutation({
  args: {
    postId: v.id("communityTopics"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireCommunityAccess(ctx);

    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("פוסט לא נמצא");
    const blockedUserIds = await blockedUserIdsFor(ctx, user._id);
    if (blockedUserIds.has(String(post.userId))) throw new Error("פוסט לא נמצא");

    const content = args.content.trim();
    if (!content) throw new Error("תגובה לא יכולה להיות ריקה");
    if (content.length > 2000) throw new Error("תגובה ארוכה מדי (מקסימום 2000 תווים)");

    const replyId = await ctx.db.insert("communityReplies", {
      topicId: args.postId,
      userId: user._id,
      content,
      likesCount: 0,
      createdAt: Date.now(),
    });

    await ctx.db.patch(args.postId, {
      repliesCount: post.repliesCount + 1,
    });

    return replyId;
  },
});

/** Toggle like on a reply */
export const likeReply = mutation({
  args: { replyId: v.id("communityReplies") },
  handler: async (ctx, args) => {
    const user = await requireCommunityAccess(ctx);

    const reply = await ctx.db.get(args.replyId);
    if (!reply) throw new Error("תגובה לא נמצאה");
    const blockedUserIds = await blockedUserIdsFor(ctx, user._id);
    if (blockedUserIds.has(String(reply.userId))) throw new Error("תגובה לא נמצאה");

    const existing = await ctx.db
      .query("communityReplyLikes")
      .withIndex("by_user_reply", (q) =>
        q.eq("userId", user._id).eq("replyId", args.replyId)
      )
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
      await ctx.db.patch(args.replyId, {
        likesCount: Math.max(0, reply.likesCount - 1),
      });
      return false;
    } else {
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

/** Check if current user liked a reply */
export const getReplyLikeStatus = query({
  args: { replyId: v.id("communityReplies") },
  handler: async (ctx, args) => {
    const user = await requireCommunityAccess(ctx);

    const existing = await ctx.db
      .query("communityReplyLikes")
      .withIndex("by_user_reply", (q) =>
        q.eq("userId", user._id).eq("replyId", args.replyId)
      )
      .unique();

    return !!existing;
  },
});

// ─── Stats ────────────────────────────────────────────────────────────────────

/** Forum statistics: total posts, replies, active users today */
export const getForumStats = query({
  args: {},
  handler: async (ctx) => {
    await requireCommunityAccess(ctx);
    const allPosts = await ctx.db
      .query("communityTopics")
      .withIndex("by_created")
      .collect();

    const allReplies = await ctx.db.query("communityReplies").collect();

    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;

    // Active users = distinct users who posted or replied in last 24 hours
    const recentPostUserIds = new Set(
      allPosts
        .filter((post) => post.createdAt >= oneDayAgo)
        .map((post) => String(post.userId))
    );
    const recentReplyUserIds = new Set(
      allReplies
        .filter((reply) => reply.createdAt >= oneDayAgo)
        .map((reply) => String(reply.userId))
    );
    const activeUsersToday = new Set([
      ...recentPostUserIds,
      ...recentReplyUserIds,
    ]).size;

    return {
      totalPosts: allPosts.length,
      totalReplies: allReplies.length,
      activeUsersToday,
    };
  },
});
