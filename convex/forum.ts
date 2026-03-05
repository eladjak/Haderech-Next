import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { type Id } from "./_generated/dataModel";

// ─── Types ────────────────────────────────────────────────────────────────────

type ForumCategory =
  | "general"
  | "dating-tips"
  | "success-stories"
  | "questions"
  | "advice";

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function requireUser(ctx: {
  auth: { getUserIdentity: () => Promise<{ subject: string } | null> };
  db: any;
}) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("נדרשת התחברות");
  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", identity.subject))
    .unique();
  if (!user) throw new Error("משתמש לא נמצא");
  return user as {
    _id: Id<"users">;
    clerkId: string;
    email: string;
    name?: string;
    imageUrl?: string;
    role: "student" | "admin";
  };
}

// ─── Categories ───────────────────────────────────────────────────────────────

/** Static list of forum categories */
export const listCategories = query({
  args: {},
  handler: async () => {
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
        label: "סיפורי הצלחה",
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
    const limit = args.take ?? 30;

    let posts: any[];

    if (args.category) {
      posts = await ctx.db
        .query("communityTopics")
        .withIndex("by_category", (q: any) =>
          q.eq("category", args.category)
        )
        .order("desc")
        .take(limit);
    } else {
      posts = await ctx.db
        .query("communityTopics")
        .withIndex("by_created")
        .order("desc")
        .take(limit);
    }

    // Sort by popular (likes + replies) if requested
    if (args.sortBy === "popular") {
      posts.sort(
        (a: any, b: any) =>
          b.likesCount + b.repliesCount - (a.likesCount + a.repliesCount)
      );
    }

    // Enrich with author info
    const enriched = await Promise.all(
      posts.map(async (post: any) => {
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
      ...enriched.filter((p: any) => p.pinned),
      ...enriched.filter((p: any) => !p.pinned),
    ];
  },
});

/** Get single post with full author info */
export const getPost = query({
  args: { postId: v.id("communityTopics") },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post) return null;

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
    const user = await requireUser(ctx);

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
    const user = await requireUser(ctx);

    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("פוסט לא נמצא");

    const existing = await ctx.db
      .query("communityTopicLikes")
      .withIndex("by_user_topic", (q: any) =>
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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return false;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q: any) =>
        q.eq("clerkId", identity.subject)
      )
      .unique();
    if (!user) return false;

    const existing = await ctx.db
      .query("communityTopicLikes")
      .withIndex("by_user_topic", (q: any) =>
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
    const replies = await ctx.db
      .query("communityReplies")
      .withIndex("by_topic", (q: any) => q.eq("topicId", args.postId))
      .order("asc")
      .collect();

    return await Promise.all(
      replies.map(async (reply: any) => {
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
    const user = await requireUser(ctx);

    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("פוסט לא נמצא");

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
    const user = await requireUser(ctx);

    const reply = await ctx.db.get(args.replyId);
    if (!reply) throw new Error("תגובה לא נמצאה");

    const existing = await ctx.db
      .query("communityReplyLikes")
      .withIndex("by_user_reply", (q: any) =>
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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return false;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q: any) =>
        q.eq("clerkId", identity.subject)
      )
      .unique();
    if (!user) return false;

    const existing = await ctx.db
      .query("communityReplyLikes")
      .withIndex("by_user_reply", (q: any) =>
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
    const allPosts = await ctx.db
      .query("communityTopics")
      .withIndex("by_created")
      .collect();

    const allReplies = await ctx.db.query("communityReplies").collect();

    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;

    // Active users = distinct users who posted or replied in last 24 hours
    const recentPostUserIds = new Set(
      allPosts
        .filter((p: any) => p.createdAt >= oneDayAgo)
        .map((p: any) => String(p.userId))
    );
    const recentReplyUserIds = new Set(
      allReplies
        .filter((r: any) => r.createdAt >= oneDayAgo)
        .map((r: any) => String(r.userId))
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
