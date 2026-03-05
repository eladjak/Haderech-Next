import { action, internalMutation } from "./_generated/server";
import { v } from "convex/values";

// Create checkout session
export const createCheckoutSession = action({
  args: {
    plan: v.union(v.literal("basic"), v.literal("premium")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // In production, this would call Stripe API
    // For now, return a placeholder
    return {
      url: `/pricing?checkout=pending&plan=${args.plan}`,
      message: "Stripe integration pending - set STRIPE_SECRET_KEY to enable",
    };
  },
});

// Handle subscription update from webhook
export const handleSubscriptionUpdate = internalMutation({
  args: {
    clerkId: v.string(),
    plan: v.union(
      v.literal("free"),
      v.literal("basic"),
      v.literal("premium"),
      v.literal("vip")
    ),
    status: v.union(
      v.literal("active"),
      v.literal("cancelled"),
      v.literal("past_due"),
      v.literal("trialing")
    ),
    stripeCustomerId: v.optional(v.string()),
    stripeSubscriptionId: v.optional(v.string()),
    currentPeriodEnd: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!user) throw new Error("User not found");

    // Check for existing subscription
    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        plan: args.plan,
        status: args.status,
        stripeCustomerId: args.stripeCustomerId,
        stripeSubscriptionId: args.stripeSubscriptionId,
        currentPeriodEnd: args.currentPeriodEnd,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("subscriptions", {
        userId: user._id,
        plan: args.plan,
        status: args.status,
        stripeCustomerId: args.stripeCustomerId,
        stripeSubscriptionId: args.stripeSubscriptionId,
        currentPeriodStart: now,
        currentPeriodEnd: args.currentPeriodEnd,
        cancelAtPeriodEnd: false,
        createdAt: now,
        updatedAt: now,
      });
    }

    return { success: true };
  },
});

// Record a payment
export const recordPayment = internalMutation({
  args: {
    userId: v.id("users"),
    amount: v.number(),
    description: v.string(),
    stripePaymentIntentId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("payments", {
      userId: args.userId,
      amount: args.amount,
      currency: "ILS",
      status: "succeeded",
      stripePaymentIntentId: args.stripePaymentIntentId,
      description: args.description,
      createdAt: Date.now(),
    });
    return { success: true };
  },
});
