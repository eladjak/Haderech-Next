import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// שליפת כל הסימניות של המשתמש (עם סינון אופציונלי לפי סוג)
export const getUserBookmarks = query({
  args: {
    itemType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const userId = identity.subject;

    let bookmarks;
    if (args.itemType) {
      // Filter by type - use by_user index and filter in memory
      bookmarks = await ctx.db
        .query("bookmarks")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect();
      bookmarks = bookmarks.filter((b) => b.itemType === args.itemType);
    } else {
      bookmarks = await ctx.db
        .query("bookmarks")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect();
    }

    return bookmarks.sort((a, b) => b.createdAt - a.createdAt);
  },
});

// בדיקה אם פריט מסומן כמועדף
export const isBookmarked = query({
  args: {
    itemType: v.string(),
    itemId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return false;

    const userId = identity.subject;

    const existing = await ctx.db
      .query("bookmarks")
      .withIndex("by_user_item", (q) =>
        q
          .eq("userId", userId)
          .eq("itemType", args.itemType)
          .eq("itemId", args.itemId)
      )
      .first();

    return !!existing;
  },
});

// הוספה/הסרה של סימנייה (toggle)
export const toggleBookmark = mutation({
  args: {
    itemType: v.string(),
    itemId: v.string(),
    itemTitle: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const userId = identity.subject;

    const existing = await ctx.db
      .query("bookmarks")
      .withIndex("by_user_item", (q) =>
        q
          .eq("userId", userId)
          .eq("itemType", args.itemType)
          .eq("itemId", args.itemId)
      )
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
      return { action: "removed" as const };
    }

    await ctx.db.insert("bookmarks", {
      userId,
      itemType: args.itemType,
      itemId: args.itemId,
      itemTitle: args.itemTitle,
      createdAt: Date.now(),
    });

    return { action: "added" as const };
  },
});

// הסרת סימנייה ספציפית
export const removeBookmark = mutation({
  args: {
    id: v.id("bookmarks"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const bookmark = await ctx.db.get(args.id);
    if (!bookmark) throw new Error("Bookmark not found");

    if (bookmark.userId !== identity.subject) {
      throw new Error("Not authorized to remove this bookmark");
    }

    await ctx.db.delete(args.id);
  },
});
