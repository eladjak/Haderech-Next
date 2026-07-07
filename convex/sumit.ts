import { action, internalMutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Sumit payment integration — Convex actions + webhook mutations.
 * Replaces Stripe (Phase 14, 2026-05-14).
 *
 * Status: credentials pending. Until SUMIT_API_TOKEN + SUMIT_ORG_ID +
 * SUMIT_WEBHOOK_SECRET are set, createCheckoutSession returns a notice.
 */

// Create Sumit hosted-tashlumim checkout
export const createCheckoutSession = action({
  args: {
    plan: v.union(v.literal("basic"), v.literal("premium"), v.literal("vip")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const token = process.env.SUMIT_API_TOKEN;
    const orgId = process.env.SUMIT_ORG_ID;
    const mode = process.env.SUMIT_MODE ?? "sandbox";

    if (!token || !orgId) {
      return {
        url: `/pricing?checkout=pending&plan=${args.plan}`,
        message:
          "Sumit credentials pending — צריך להגדיר SUMIT_API_TOKEN ו-SUMIT_ORG_ID. בינתיים אין מעבד תשלומים פעיל.",
        status: "credentials_pending" as const,
      };
    }

    const SUMIT_API_BASE =
      mode === "production"
        ? "https://api.sumit.co.il"
        : "https://sandbox.sumit.co.il";

    const PRICES: Record<string, { name: string; priceILS: number }> = {
      basic: { name: "משנה - הדרך נקסט", priceILS: 149 },
      premium: { name: "מוביל - הדרך נקסט", priceILS: 299 },
      vip: { name: "VIP - הדרך נקסט", priceILS: 599 },
    };
    const plan = PRICES[args.plan];

    // App URL for success/cancel redirects + webhook
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ?? "https://haderech-next.vercel.app";

    try {
      const response = await fetch(`${SUMIT_API_BASE}/billing/payments/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "X-Org-Id": orgId,
        },
        body: JSON.stringify({
          amount: plan.priceILS,
          currency: "ILS",
          description: plan.name,
          customer: {
            email: identity.email,
            name: identity.name ?? identity.email,
            externalId: identity.subject,
          },
          recurring: { months: 12, interval: "monthly" },
          autoIssueInvoice: true,
          successUrl: `${siteUrl}/billing?status=success`,
          cancelUrl: `${siteUrl}/pricing?status=cancelled`,
          webhookUrl: `${siteUrl}/api/sumit/webhook`,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return {
          url: `/pricing?checkout=error&plan=${args.plan}`,
          message: `שגיאה בהפעלת תשלום: ${response.status}`,
          status: "api_error" as const,
          details: errorText.slice(0, 200),
        };
      }

      const data = (await response.json()) as {
        paymentUrl: string;
        sessionId: string;
      };

      return {
        url: data.paymentUrl,
        sessionId: data.sessionId,
        status: "ok" as const,
      };
    } catch (error) {
      return {
        url: `/pricing?checkout=error&plan=${args.plan}`,
        message:
          error instanceof Error ? error.message : "שגיאה לא צפויה בתשלום",
        status: "api_error" as const,
      };
    }
  },
});

// Handle subscription update from Sumit webhook (called by /api/sumit/webhook)
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
    sumitCustomerId: v.optional(v.string()),
    sumitSubscriptionId: v.optional(v.string()),
    currentPeriodEnd: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!user) throw new Error("User not found");

    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        plan: args.plan,
        status: args.status,
        stripeCustomerId: args.sumitCustomerId, // reuse field for now
        stripeSubscriptionId: args.sumitSubscriptionId,
        currentPeriodEnd: args.currentPeriodEnd,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("subscriptions", {
        userId: user._id,
        plan: args.plan,
        status: args.status,
        stripeCustomerId: args.sumitCustomerId,
        stripeSubscriptionId: args.sumitSubscriptionId,
        currentPeriodStart: now,
        currentPeriodEnd: args.currentPeriodEnd,
        cancelAtPeriodEnd: false,
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});
