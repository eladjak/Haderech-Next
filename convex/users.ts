import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";

// שליפת משתמש לפי Clerk ID
export const getByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();
  },
});

// שליפת משתמש לפי ID
export const getById = query({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// יצירת או עדכון משתמש (מ-Clerk webhook)
export const upsertFromClerk = internalMutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (existing) {
      return await ctx.db.patch(existing._id, {
        email: args.email,
        name: args.name,
        imageUrl: args.imageUrl,
        updatedAt: now,
      });
    }

    return await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      name: args.name,
      imageUrl: args.imageUrl,
      role: "student",
      createdAt: now,
      updatedAt: now,
    });
  },
});

// בדיקה אם המשתמש הוא מנהל
export const isAdmin = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    return user?.role === "admin";
  },
});

// שליפת המשתמש הנוכחי דרך auth context
export const getMe = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    return user;
  },
});

// יצירת משתמש אוטומטית מ-auth context (אם לא קיים)
export const ensureUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (existing) return existing;

    const now = Date.now();
    const id = await ctx.db.insert("users", {
      clerkId: identity.subject,
      email: identity.email ?? "",
      name: identity.name,
      imageUrl: identity.pictureUrl,
      role: "student",
      createdAt: now,
      updatedAt: now,
    });

    return await ctx.db.get(id);
  },
});

// קידום ראשוני ל-admin מה-CLI (ללא auth - רק כשאין admins)
export const seedAdmin = internalMutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const admins = await ctx.db
      .query("users")
      .collect()
      .then((users) => users.filter((u) => u.role === "admin"));

    if (admins.length > 0) {
      throw new Error("Admin already exists. Use promoteToAdmin instead.");
    }

    const target = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    if (!target) throw new Error(`User with email ${args.email} not found`);

    await ctx.db.patch(target._id, {
      role: "admin",
      updatedAt: Date.now(),
    });

    return { success: true, email: args.email };
  },
});

// קידום משתמש ל-admin (לפי email)
export const promoteToAdmin = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // רק admin קיים יכול לקדם (או המשתמש הראשון)
    const allUsers = await ctx.db.query("users").collect();
    const caller = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    const isFirstUser = allUsers.length <= 1;
    const callerIsAdmin = caller?.role === "admin";

    if (!isFirstUser && !callerIsAdmin) {
      throw new Error("Only admins can promote users");
    }

    const target = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    if (!target) throw new Error("User not found");

    await ctx.db.patch(target._id, {
      role: "admin",
      updatedAt: Date.now(),
    });

    return { success: true, email: args.email };
  },
});
