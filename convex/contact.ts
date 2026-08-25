import {
  mutation,
  query,
  type MutationCtx,
  type QueryCtx,
} from "./_generated/server";
import { v } from "convex/values";

// ─── Helper ────────────────────────────────────────────────────────────────────

async function requireAdmin(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");
  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .unique();
  if (!user) throw new Error("User not found");
  if (user.role !== "admin") throw new Error("Admin access required");
  return user;
}

// ─── Public ────────────────────────────────────────────────────────────────────

/** שמירת פנייה חדשה מהאתר (לא דורשת הזדהות) */
export const submitMessage = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    subject: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    if (!args.name.trim() || !args.email.trim() || !args.message.trim()) {
      throw new Error("שדות חובה חסרים");
    }
    if (args.message.trim().length < 20) {
      throw new Error("ההודעה קצרה מדי (מינימום 20 תווים)");
    }

    const identity = await ctx.auth.getUserIdentity();

    const id = await ctx.db.insert("contactMessages", {
      name: args.name.trim(),
      email: args.email.trim(),
      subject: args.subject,
      message: args.message.trim(),
      status: "new",
      userId: identity?.subject,
      createdAt: Date.now(),
    });

    return id;
  },
});

// ─── Admin ─────────────────────────────────────────────────────────────────────

/** קבלת כל ההודעות (admin בלבד) */
export const listMessages = query({
  args: {
    status: v.optional(
      v.union(v.literal("new"), v.literal("read"), v.literal("replied"))
    ),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const all = await ctx.db
      .query("contactMessages")
      .withIndex("by_created")
      .order("desc")
      .collect();

    if (args.status) {
      return all.filter((message) => message.status === args.status);
    }

    return all;
  },
});

/** עדכון סטטוס הודעה (admin בלבד) */
export const updateStatus = mutation({
  args: {
    messageId: v.id("contactMessages"),
    status: v.union(
      v.literal("new"),
      v.literal("read"),
      v.literal("replied")
    ),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.messageId, { status: args.status });
  },
});

/** קבלת סטטיסטיקות הודעות (admin בלבד) */
export const getStats = query({
  handler: async (ctx) => {
    try {
      await requireAdmin(ctx);
    } catch {
      return null;
    }

    const all = await ctx.db.query("contactMessages").collect();
    return {
      total: all.length,
      new: all.filter((message) => message.status === "new").length,
      read: all.filter((message) => message.status === "read").length,
      replied: all.filter((message) => message.status === "replied").length,
    };
  },
});
