import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

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

// יצירת / עדכון ביקורת (upsert)
export const createReview = mutation({
  args: {
    courseId: v.id("courses"),
    rating: v.number(),
    title: v.string(),
    content: v.string(),
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

    // Validate title
    const trimmedTitle = args.title.trim();
    if (trimmedTitle.length === 0) throw new Error("Title cannot be empty");
    if (trimmedTitle.length > 200)
      throw new Error("Title too long (max 200 characters)");

    // Validate content
    const trimmedContent = args.content.trim();
    if (trimmedContent.length === 0)
      throw new Error("Content cannot be empty");
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

    // Check if user already reviewed this course (upsert)
    const existing = await ctx.db
      .query("courseReviews")
      .withIndex("by_user_course", (q) =>
        q.eq("userId", user._id).eq("courseId", args.courseId)
      )
      .unique();

    if (existing) {
      // Update existing review
      await ctx.db.patch(existing._id, {
        rating: args.rating,
        title: trimmedTitle,
        content: trimmedContent,
        updatedAt: now,
      });
      return existing._id;
    }

    // Create new review
    return await ctx.db.insert("courseReviews", {
      userId: user._id,
      courseId: args.courseId,
      rating: args.rating,
      title: trimmedTitle,
      content: trimmedContent,
      helpful: 0,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// הצבעה "מועיל" על ביקורת (toggle)
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

    // Check if user already voted
    const existingVote = await ctx.db
      .query("reviewVotes")
      .withIndex("by_user_review", (q) =>
        q.eq("userId", user._id).eq("reviewId", args.reviewId)
      )
      .unique();

    if (existingVote) {
      // Remove vote
      await ctx.db.delete(existingVote._id);
      await ctx.db.patch(args.reviewId, {
        helpful: Math.max(0, review.helpful - 1),
      });
      return { voted: false };
    }

    // Add vote
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

    // Only author or admin can delete
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

    // Delete the review
    await ctx.db.delete(args.reviewId);
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
