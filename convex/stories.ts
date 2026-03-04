import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ─── Queries ──────────────────────────────────────────────────────────────────

// רשימת סיפורי הצלחה מאושרים (תצוגה ציבורית)
export const listApproved = query({
  args: {},
  handler: async (ctx) => {
    const stories = await ctx.db
      .query("successStories")
      .withIndex("by_approved", (q) => q.eq("approved", true))
      .collect();

    // Sort by newest first
    stories.sort((a, b) => b.createdAt - a.createdAt);

    return stories;
  },
});

// רשימת סיפורים מובילים (לעמוד הראשי), מקסימום 6
export const listFeatured = query({
  args: {},
  handler: async (ctx) => {
    const stories = await ctx.db
      .query("successStories")
      .withIndex("by_featured", (q) => q.eq("featured", true))
      .collect();

    // Only approved + featured, sorted by newest, max 6
    const approvedFeatured = stories
      .filter((s) => s.approved)
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 6);

    return approvedFeatured;
  },
});

// רשימת כל הסיפורים (אדמין) כולל ספירת ממתינים
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user || user.role !== "admin") {
      throw new Error("Admin access required");
    }

    const allStories = await ctx.db.query("successStories").collect();

    // Sort by newest first
    allStories.sort((a, b) => b.createdAt - a.createdAt);

    const pendingCount = allStories.filter((s) => !s.approved).length;
    const approvedCount = allStories.filter((s) => s.approved).length;
    const featuredCount = allStories.filter(
      (s) => s.approved && s.featured
    ).length;

    return {
      stories: allStories,
      pendingCount,
      approvedCount,
      featuredCount,
      totalCount: allStories.length,
    };
  },
});

// שליפת סיפור של המשתמש הנוכחי
export const getUserStory = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return null;

    // Find stories by this user
    const allStories = await ctx.db.query("successStories").collect();
    const userStory = allStories.find(
      (s) => s.userId !== undefined && s.userId === user._id
    );

    return userStory ?? null;
  },
});

// ─── Mutations ────────────────────────────────────────────────────────────────

// שליחת סיפור הצלחה
export const submitStory = mutation({
  args: {
    name: v.string(),
    story: v.string(),
    rating: v.number(),
    isAnonymous: v.boolean(),
    category: v.union(
      v.literal("dating"),
      v.literal("relationship"),
      v.literal("self-growth"),
      v.literal("marriage")
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    // Validate
    const trimmedName = args.name.trim();
    if (trimmedName.length === 0)
      throw new Error("שם לא יכול להיות ריק");
    if (trimmedName.length > 100)
      throw new Error("שם ארוך מדי (מקסימום 100 תווים)");

    const trimmedStory = args.story.trim();
    if (trimmedStory.length === 0)
      throw new Error("סיפור לא יכול להיות ריק");
    if (trimmedStory.length > 2000)
      throw new Error("סיפור ארוך מדי (מקסימום 2000 תווים)");

    if (
      args.rating < 1 ||
      args.rating > 5 ||
      !Number.isInteger(args.rating)
    ) {
      throw new Error("דירוג חייב להיות מספר שלם בין 1 ל-5");
    }

    return await ctx.db.insert("successStories", {
      userId: user._id,
      name: args.isAnonymous ? "אנונימי" : trimmedName,
      story: trimmedStory,
      rating: args.rating,
      isAnonymous: args.isAnonymous,
      approved: false,
      featured: false,
      category: args.category,
      createdAt: Date.now(),
    });
  },
});

// אישור סיפור (אדמין)
export const approveStory = mutation({
  args: {
    storyId: v.id("successStories"),
    featured: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user || user.role !== "admin") {
      throw new Error("Admin access required");
    }

    const story = await ctx.db.get(args.storyId);
    if (!story) throw new Error("Story not found");

    await ctx.db.patch(args.storyId, {
      approved: true,
      featured: args.featured ?? false,
    });
  },
});

// מחיקת סיפור (אדמין או בעל הסיפור)
export const deleteStory = mutation({
  args: { storyId: v.id("successStories") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    const story = await ctx.db.get(args.storyId);
    if (!story) throw new Error("Story not found");

    // Only admin or story owner can delete
    const isOwner =
      story.userId !== undefined && story.userId === user._id;
    if (!isOwner && user.role !== "admin") {
      throw new Error("אין הרשאה למחוק סיפור זה");
    }

    await ctx.db.delete(args.storyId);
  },
});

// Toggle featured (אדמין)
export const toggleFeatured = mutation({
  args: { storyId: v.id("successStories") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user || user.role !== "admin") {
      throw new Error("Admin access required");
    }

    const story = await ctx.db.get(args.storyId);
    if (!story) throw new Error("Story not found");

    await ctx.db.patch(args.storyId, {
      featured: !story.featured,
    });
  },
});

// Seed sample stories
export const seedStories = mutation({
  args: {},
  handler: async (ctx) => {
    const sampleStories = [
      {
        name: "דני, 34",
        story: "אחרי שנים של דייטים כושלים, הקורס של הדרך שינה לי את הגישה לגמרי. היום אני בזוגיות מדהימה.",
        rating: 5,
        category: "dating" as const,
        featured: true,
      },
      {
        name: "מיכל, 28",
        story: "למדתי לתקשר טוב יותר עם בן הזוג שלי. הכלים שקיבלתי פה שינו את הדינמיקה שלנו.",
        rating: 5,
        category: "relationship" as const,
        featured: true,
      },
      {
        name: "יונתן, 31",
        story: "הסימולטור עזר לי להבין מה אני עושה לא בסדר בדייטים. מומלץ בחום!",
        rating: 4,
        category: "self-growth" as const,
        featured: true,
      },
      {
        name: "נועה, 26",
        story: "המאמן AI נתן לי ביטחון לפנות לאנשים חדשים. תוך חודשיים מצאתי את הבן אדם שלי.",
        rating: 5,
        category: "dating" as const,
        featured: false,
      },
      {
        name: "אורי, 37",
        story: "אחרי גירושין, חשבתי שנגמר לי. הדרך עזרה לי לחזור לעצמי ולמצוא אהבה מחדש.",
        rating: 5,
        category: "marriage" as const,
        featured: false,
      },
      {
        name: "שירה, 29",
        story: "הקהילה פה מדהימה. הרגשתי שאני לא לבד בתהליך.",
        rating: 4,
        category: "self-growth" as const,
        featured: false,
      },
    ];

    const now = Date.now();
    for (let i = 0; i < sampleStories.length; i++) {
      const s = sampleStories[i];
      await ctx.db.insert("successStories", {
        name: s.name,
        story: s.story,
        rating: s.rating,
        isAnonymous: false,
        approved: true,
        featured: s.featured,
        category: s.category,
        createdAt: now - i * 86400000, // each one day apart
      });
    }
  },
});
