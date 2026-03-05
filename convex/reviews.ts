import { query, mutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";

// ─────────────────────────────────────────────────────────────────────────────
// QUERIES
// ─────────────────────────────────────────────────────────────────────────────

// שליפת ביקורות לקורס (כולל פרטי משתמש)
export const getCourseReviews = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const reviews = await ctx.db
      .query("courseReviews")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .collect();

    // Sort by newest first
    reviews.sort((a, b) => b.createdAt - a.createdAt);

    // Enrich with user data
    const enriched = await Promise.all(
      reviews.map(async (review) => {
        const user = await ctx.db.get(review.userId);
        return {
          ...review,
          userName: user?.name ?? user?.email ?? "משתמש",
          userImage: user?.imageUrl ?? null,
        };
      })
    );

    return enriched;
  },
});

// שליפת ביקורות לקורס עם דף, מיון ודירוג (pagination)
export const getReviewsByCourse = query({
  args: {
    courseId: v.id("courses"),
    sort: v.optional(
      v.union(
        v.literal("newest"),
        v.literal("highest"),
        v.literal("lowest")
      )
    ),
  },
  handler: async (ctx, args) => {
    const reviews = await ctx.db
      .query("courseReviews")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .collect();

    const sort = args.sort ?? "newest";

    reviews.sort((a, b) => {
      if (sort === "newest") return b.createdAt - a.createdAt;
      if (sort === "highest") return b.rating - a.rating || b.createdAt - a.createdAt;
      if (sort === "lowest") return a.rating - b.rating || b.createdAt - a.createdAt;
      return b.createdAt - a.createdAt;
    });

    const enriched = await Promise.all(
      reviews.map(async (review) => {
        const user = await ctx.db.get(review.userId);
        return {
          ...review,
          userName: user?.name ?? user?.email ?? "משתמש",
          userImage: user?.imageUrl ?? null,
        };
      })
    );

    return enriched;
  },
});

// סטטיסטיקות ביקורות לקורס - התפלגות דירוגים, ממוצע, ספירה
export const getReviewStats = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const reviews = await ctx.db
      .query("courseReviews")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .collect();

    if (reviews.length === 0) {
      return {
        average: 0,
        total: 0,
        distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        wouldRecommendPercent: 0,
      };
    }

    const distribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let sum = 0;
    let wouldRecommendCount = 0;

    for (const review of reviews) {
      sum += review.rating;
      distribution[review.rating] = (distribution[review.rating] ?? 0) + 1;
      if (review.wouldRecommend === true) {
        wouldRecommendCount++;
      }
    }

    const average = Math.round((sum / reviews.length) * 10) / 10;
    const wouldRecommendPercent =
      reviews.some((r) => r.wouldRecommend !== undefined)
        ? Math.round((wouldRecommendCount / reviews.length) * 100)
        : 0;

    return {
      average,
      total: reviews.length,
      distribution,
      wouldRecommendPercent,
    };
  },
});

// שליפת ביקורת של המשתמש הנוכחי לקורס
export const getUserReview = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return null;

    const review = await ctx.db
      .query("courseReviews")
      .withIndex("by_user_course", (q) =>
        q.eq("userId", user._id).eq("courseId", args.courseId)
      )
      .unique();

    return review;
  },
});

// ממוצע דירוגים וספירה לקורס
export const getCourseRating = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const reviews = await ctx.db
      .query("courseReviews")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .collect();

    if (reviews.length === 0) {
      return { average: 0, count: 0 };
    }

    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    const average = Math.round((sum / reviews.length) * 10) / 10;

    return { average, count: reviews.length };
  },
});

// שליפת ביקורות מומלצות לעמוד testimonials
export const getFeaturedTestimonials = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 12;

    const allReviews = await ctx.db.query("courseReviews").collect();

    // Filter high-rated reviews with content
    const eligible = allReviews.filter(
      (r) => r.rating >= 4 && r.content.length >= 50
    );

    // Sort by rating desc, then helpful desc, then newest
    eligible.sort(
      (a, b) =>
        b.rating - a.rating ||
        b.helpful - a.helpful ||
        b.createdAt - a.createdAt
    );

    const top = eligible.slice(0, limit);

    const enriched = await Promise.all(
      top.map(async (review) => {
        const user = await ctx.db.get(review.userId);
        const course = await ctx.db.get(review.courseId);
        return {
          ...review,
          userName: user?.name ?? user?.email ?? "משתמש",
          userImage: user?.imageUrl ?? null,
          courseTitle: course?.title ?? "",
          courseId: review.courseId,
        };
      })
    );

    return enriched;
  },
});

// שליפת הביקורות של המשתמש הנוכחי בכל הקורסים
export const getMyReviews = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return [];

    const reviews = await ctx.db
      .query("courseReviews")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    reviews.sort((a, b) => b.createdAt - a.createdAt);

    const enriched = await Promise.all(
      reviews.map(async (review) => {
        const course = await ctx.db.get(review.courseId);
        return {
          ...review,
          courseTitle: course?.title ?? "",
        };
      })
    );

    return enriched;
  },
});

// בדיקה אם המשתמש הצביע על ביקורת
export const hasVoted = query({
  args: { reviewId: v.id("courseReviews") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return false;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return false;

    const vote = await ctx.db
      .query("reviewVotes")
      .withIndex("by_user_review", (q) =>
        q.eq("userId", user._id).eq("reviewId", args.reviewId)
      )
      .unique();

    return vote !== null;
  },
});

// סטטיסטיקות גלובליות לעמוד testimonials
export const getGlobalStats = query({
  args: {},
  handler: async (ctx) => {
    const allReviews = await ctx.db.query("courseReviews").collect();

    if (allReviews.length === 0) {
      return { totalReviews: 0, averageRating: 0, wouldRecommendPercent: 0 };
    }

    const sum = allReviews.reduce((acc, r) => acc + r.rating, 0);
    const averageRating = Math.round((sum / allReviews.length) * 10) / 10;

    const withRecommend = allReviews.filter((r) => r.wouldRecommend !== undefined);
    const wouldRecommendCount = withRecommend.filter((r) => r.wouldRecommend === true).length;
    const wouldRecommendPercent =
      withRecommend.length > 0
        ? Math.round((wouldRecommendCount / withRecommend.length) * 100)
        : 0;

    return {
      totalReviews: allReviews.length,
      averageRating,
      wouldRecommendPercent,
    };
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// MUTATIONS
// ─────────────────────────────────────────────────────────────────────────────

// יצירת ביקורת חדשה
export const submitReview = mutation({
  args: {
    courseId: v.id("courses"),
    rating: v.number(),
    title: v.string(),
    content: v.string(),
    wouldRecommend: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    // Validate rating
    if (args.rating < 1 || args.rating > 5 || !Number.isInteger(args.rating)) {
      throw new Error("Rating must be an integer between 1 and 5");
    }

    const trimmedTitle = args.title.trim();
    if (trimmedTitle.length === 0) throw new Error("Title cannot be empty");
    if (trimmedTitle.length > 200)
      throw new Error("Title too long (max 200 characters)");

    const trimmedContent = args.content.trim();
    if (trimmedContent.length === 0) throw new Error("Content cannot be empty");
    if (trimmedContent.length > 2000)
      throw new Error("Content too long (max 2000 characters)");

    // Check enrollment
    const enrollment = await ctx.db
      .query("enrollments")
      .withIndex("by_user_course", (q) =>
        q.eq("userId", user._id).eq("courseId", args.courseId)
      )
      .unique();
    if (!enrollment)
      throw new Error("You must be enrolled in the course to review it");

    const now = Date.now();

    // Check for existing review (upsert)
    const existing = await ctx.db
      .query("courseReviews")
      .withIndex("by_user_course", (q) =>
        q.eq("userId", user._id).eq("courseId", args.courseId)
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        rating: args.rating,
        title: trimmedTitle,
        content: trimmedContent,
        wouldRecommend: args.wouldRecommend,
        updatedAt: now,
      });
      return existing._id;
    }

    return await ctx.db.insert("courseReviews", {
      userId: user._id,
      courseId: args.courseId,
      rating: args.rating,
      title: trimmedTitle,
      content: trimmedContent,
      wouldRecommend: args.wouldRecommend,
      helpful: 0,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// יצירת / עדכון ביקורת (upsert) - backward compat alias
export const createReview = mutation({
  args: {
    courseId: v.id("courses"),
    rating: v.number(),
    title: v.string(),
    content: v.string(),
    wouldRecommend: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    if (args.rating < 1 || args.rating > 5 || !Number.isInteger(args.rating)) {
      throw new Error("Rating must be an integer between 1 and 5");
    }

    const trimmedTitle = args.title.trim();
    if (trimmedTitle.length === 0) throw new Error("Title cannot be empty");
    if (trimmedTitle.length > 200)
      throw new Error("Title too long (max 200 characters)");

    const trimmedContent = args.content.trim();
    if (trimmedContent.length === 0) throw new Error("Content cannot be empty");
    if (trimmedContent.length > 2000)
      throw new Error("Content too long (max 2000 characters)");

    const enrollment = await ctx.db
      .query("enrollments")
      .withIndex("by_user_course", (q) =>
        q.eq("userId", user._id).eq("courseId", args.courseId)
      )
      .unique();
    if (!enrollment)
      throw new Error("You must be enrolled in the course to review it");

    const now = Date.now();

    const existing = await ctx.db
      .query("courseReviews")
      .withIndex("by_user_course", (q) =>
        q.eq("userId", user._id).eq("courseId", args.courseId)
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        rating: args.rating,
        title: trimmedTitle,
        content: trimmedContent,
        wouldRecommend: args.wouldRecommend,
        updatedAt: now,
      });
      return existing._id;
    }

    return await ctx.db.insert("courseReviews", {
      userId: user._id,
      courseId: args.courseId,
      rating: args.rating,
      title: trimmedTitle,
      content: trimmedContent,
      wouldRecommend: args.wouldRecommend,
      helpful: 0,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// עדכון ביקורת קיימת
export const updateReview = mutation({
  args: {
    reviewId: v.id("courseReviews"),
    rating: v.number(),
    title: v.string(),
    content: v.string(),
    wouldRecommend: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    const review = await ctx.db.get(args.reviewId);
    if (!review) throw new Error("Review not found");

    if (review.userId !== user._id) {
      throw new Error("Not authorized to edit this review");
    }

    if (args.rating < 1 || args.rating > 5 || !Number.isInteger(args.rating)) {
      throw new Error("Rating must be an integer between 1 and 5");
    }

    const trimmedTitle = args.title.trim();
    if (trimmedTitle.length === 0) throw new Error("Title cannot be empty");

    const trimmedContent = args.content.trim();
    if (trimmedContent.length === 0) throw new Error("Content cannot be empty");

    await ctx.db.patch(args.reviewId, {
      rating: args.rating,
      title: trimmedTitle,
      content: trimmedContent,
      wouldRecommend: args.wouldRecommend,
      updatedAt: Date.now(),
    });
  },
});

// מחיקת ביקורת (רק הכותב או admin)
export const deleteReview = mutation({
  args: { reviewId: v.id("courseReviews") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    const review = await ctx.db.get(args.reviewId);
    if (!review) throw new Error("Review not found");

    if (review.userId !== user._id && user.role !== "admin") {
      throw new Error("Not authorized to delete this review");
    }

    // Delete all votes for this review
    const votes = await ctx.db
      .query("reviewVotes")
      .withIndex("by_review", (q) => q.eq("reviewId", args.reviewId))
      .collect();
    for (const vote of votes) {
      await ctx.db.delete(vote._id);
    }

    await ctx.db.delete(args.reviewId);
  },
});

// הצבעה "מועיל" על ביקורת (toggle)
export const markReviewHelpful = mutation({
  args: { reviewId: v.id("courseReviews") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    const review = await ctx.db.get(args.reviewId);
    if (!review) throw new Error("Review not found");

    const existingVote = await ctx.db
      .query("reviewVotes")
      .withIndex("by_user_review", (q) =>
        q.eq("userId", user._id).eq("reviewId", args.reviewId)
      )
      .unique();

    if (existingVote) {
      await ctx.db.delete(existingVote._id);
      await ctx.db.patch(args.reviewId, {
        helpful: Math.max(0, review.helpful - 1),
      });
      return { voted: false };
    }

    await ctx.db.insert("reviewVotes", {
      reviewId: args.reviewId,
      userId: user._id,
      createdAt: Date.now(),
    });
    await ctx.db.patch(args.reviewId, {
      helpful: review.helpful + 1,
    });
    return { voted: true };
  },
});

// backward compat alias
export const voteHelpful = mutation({
  args: { reviewId: v.id("courseReviews") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    const review = await ctx.db.get(args.reviewId);
    if (!review) throw new Error("Review not found");

    const existingVote = await ctx.db
      .query("reviewVotes")
      .withIndex("by_user_review", (q) =>
        q.eq("userId", user._id).eq("reviewId", args.reviewId)
      )
      .unique();

    if (existingVote) {
      await ctx.db.delete(existingVote._id);
      await ctx.db.patch(args.reviewId, {
        helpful: Math.max(0, review.helpful - 1),
      });
      return { voted: false };
    }

    await ctx.db.insert("reviewVotes", {
      reviewId: args.reviewId,
      userId: user._id,
      createdAt: Date.now(),
    });
    await ctx.db.patch(args.reviewId, {
      helpful: review.helpful + 1,
    });
    return { voted: true };
  },
});
