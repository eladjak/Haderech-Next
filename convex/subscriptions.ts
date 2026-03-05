import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get current user's subscription
export const getCurrentSubscription = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return null;

    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    return subscription || { plan: "free" as const, status: "active" as const };
  },
});

// Get user's payment history
export const getPaymentHistory = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return [];

    const payments = await ctx.db
      .query("payments")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    return payments.sort((a, b) => b.createdAt - a.createdAt);
  },
});

// Create free subscription for new user
export const createFreeSubscription = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
    if (existing) return existing._id;

    return await ctx.db.insert("subscriptions", {
      userId: args.userId,
      plan: "free",
      status: "active",
      cancelAtPeriodEnd: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Admin: Get subscription stats
export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const subs = await ctx.db.query("subscriptions").collect();
    const payments = await ctx.db.query("payments").collect();

    const planCounts = { free: 0, basic: 0, premium: 0, vip: 0 };
    for (const sub of subs) {
      if (sub.status === "active") {
        planCounts[sub.plan]++;
      }
    }

    const totalRevenue = payments
      .filter((p) => p.status === "succeeded")
      .reduce((sum, p) => sum + p.amount, 0);

    return {
      totalSubscriptions: subs.length,
      activeSubscriptions: subs.filter((s) => s.status === "active").length,
      planCounts,
      totalRevenue,
      totalPayments: payments.length,
    };
  },
});
