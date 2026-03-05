import { query, mutation, action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

// ─── Queries ─────────────────────────────────────────────────

// שליפת ה-subscriptions של המשתמש הנוכחי
export const getSubscriptions = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    return await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .filter((q) => q.eq(q.field("active"), true))
      .collect();
  },
});

// שליפת subscriptions לפי userId (לשימוש פנימי ב-action)
export const getSubscriptionsByUserId = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("active"), true))
      .collect();
  },
});

// שליפת כל ה-subscriptions (למנהל - לשליחה כללית)
export const listAllSubscriptions = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // בדיקת הרשאות מנהל
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || user.role !== "admin") {
      throw new Error("Admin access required");
    }

    return await ctx.db
      .query("pushSubscriptions")
      .filter((q) => q.eq(q.field("active"), true))
      .collect();
  },
});

// ─── Mutations ───────────────────────────────────────────────

// שמירת subscription של push notification
export const saveSubscription = mutation({
  args: {
    endpoint: v.string(),
    p256dh: v.string(),
    auth: v.string(),
    userAgent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const userId = identity.subject;
    const now = Date.now();

    // בדוק אם כבר קיים subscription לאותו endpoint
    const existing = await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_endpoint", (q) => q.eq("endpoint", args.endpoint))
      .unique();

    if (existing) {
      // עדכן את הרשומה הקיימת
      await ctx.db.patch(existing._id, {
        p256dh: args.p256dh,
        auth: args.auth,
        userAgent: args.userAgent,
        updatedAt: now,
      });
      return existing._id;
    }

    // הוסף subscription חדש
    return await ctx.db.insert("pushSubscriptions", {
      userId,
      endpoint: args.endpoint,
      p256dh: args.p256dh,
      auth: args.auth,
      userAgent: args.userAgent,
      active: true,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// הסרת subscription
export const removeSubscription = mutation({
  args: {
    endpoint: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const subscription = await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_endpoint", (q) => q.eq("endpoint", args.endpoint))
      .unique();

    if (!subscription) return { success: false as const, reason: "not_found" };

    // ודא שהמשתמש הוא הבעלים
    if (subscription.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    await ctx.db.delete(subscription._id);
    return { success: true as const };
  },
});

// ─── Actions ─────────────────────────────────────────────────

/**
 * שליחת push notification למשתמש ספציפי.
 *
 * NOTE: כדי לשלוח push notifications אמיתיות, יש להוסיף:
 * 1. npm install web-push
 * 2. Generate VAPID keys: npx web-push generate-vapid-keys
 * 3. Set environment variables: VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_EMAIL
 * 4. Uncomment the web-push code below
 *
 * כרגע הפונקציה מחזירה מבנה נתונים נכון ומוכן לשימוש עם web-push.
 */
type PushSubscriptionRow = {
  _id: string;
  userId: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  userAgent?: string;
  active: boolean;
  createdAt: number;
  updatedAt: number;
};

export const sendNotification = action({
  args: {
    userId: v.string(),
    title: v.string(),
    body: v.string(),
    icon: v.optional(v.string()),
    url: v.optional(v.string()),
    tag: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{ sent: number; reason?: string; payload?: string; subscriptions?: { endpoint: string }[] }> => {
    // שליפת subscriptions של המשתמש
    const subscriptions = (await ctx.runQuery(
      api.pushNotifications.getSubscriptionsByUserId,
      { userId: args.userId }
    )) as PushSubscriptionRow[];

    if (subscriptions.length === 0) {
      return { sent: 0, reason: "no_subscriptions" };
    }

    const payload = JSON.stringify({
      title: args.title,
      body: args.body,
      icon: args.icon ?? "/images/haderech-icon.jpg",
      badge: "/images/haderech-icon.jpg",
      url: args.url ?? "/dashboard",
      tag: args.tag ?? "haderech-notification",
      timestamp: Date.now(),
    });

    /**
     * TODO: הוסף את הקוד הבא כשמוסיפים את web-push:
     *
     * import webpush from "web-push";
     *
     * webpush.setVapidDetails(
     *   process.env.VAPID_EMAIL!,
     *   process.env.VAPID_PUBLIC_KEY!,
     *   process.env.VAPID_PRIVATE_KEY!
     * );
     *
     * const results = await Promise.allSettled(
     *   subscriptions.map((sub) =>
     *     webpush.sendNotification(
     *       { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
     *       payload
     *     )
     *   )
     * );
     *
     * const failed = results.filter(r => r.status === "rejected");
     * // Mark expired subscriptions as inactive
     * ...
     */

    // מוחזר: כמות subscriptions שנשלחו (כש-web-push מוגדר)
    return {
      sent: subscriptions.length,
      payload,
      subscriptions: subscriptions.map((sub: PushSubscriptionRow) => ({
        endpoint: sub.endpoint.substring(0, 50) + "...",
      })),
    };
  },
});

// שליחת push notification לכל המשתמשים (broadcast)
export const broadcastNotification = action({
  args: {
    title: v.string(),
    body: v.string(),
    icon: v.optional(v.string()),
    url: v.optional(v.string()),
    tag: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{ sent: number; reason?: string; payload?: string }> => {
    // שליפת כל ה-subscriptions הפעילים
    const allSubscriptions = (await ctx.runQuery(
      api.pushNotifications.listAllSubscriptions,
      {}
    )) as PushSubscriptionRow[];

    if (allSubscriptions.length === 0) {
      return { sent: 0, reason: "no_subscriptions" };
    }

    const payload = JSON.stringify({
      title: args.title,
      body: args.body,
      icon: args.icon ?? "/images/haderech-icon.jpg",
      badge: "/images/haderech-icon.jpg",
      url: args.url ?? "/",
      tag: args.tag ?? "haderech-broadcast",
      timestamp: Date.now(),
    });

    /**
     * TODO: הוסף web-push send לכל subscription כאן
     * (ראה הערות ב-sendNotification)
     */

    return {
      sent: allSubscriptions.length,
      payload,
    };
  },
});
