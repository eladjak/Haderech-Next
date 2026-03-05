import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ברירות מחדל להעדפות
const DEFAULT_PREFERENCES = {
  emailNotifications: true,
  pushNotifications: false,
  weeklyDigest: true,
  theme: "system" as const,
  language: "he" as const,
  displayDensity: "comfortable" as const,
  courseReminders: true,
  achievementAlerts: true,
};

// שליפת העדפות משתמש (או ברירות מחדל)
export const getPreferences = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const prefs = await ctx.db
      .query("userPreferences")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .unique();

    if (!prefs) {
      return { ...DEFAULT_PREFERENCES, _isDefault: true as const };
    }

    return {
      emailNotifications: prefs.emailNotifications,
      pushNotifications: prefs.pushNotifications,
      weeklyDigest: prefs.weeklyDigest,
      theme: prefs.theme,
      language: prefs.language,
      displayDensity: prefs.displayDensity,
      courseReminders: prefs.courseReminders,
      achievementAlerts: prefs.achievementAlerts,
      _isDefault: false as const,
    };
  },
});

// עדכון חלקי של העדפות
export const updatePreferences = mutation({
  args: {
    emailNotifications: v.optional(v.boolean()),
    pushNotifications: v.optional(v.boolean()),
    weeklyDigest: v.optional(v.boolean()),
    theme: v.optional(
      v.union(v.literal("light"), v.literal("dark"), v.literal("system"))
    ),
    language: v.optional(v.union(v.literal("he"), v.literal("en"))),
    displayDensity: v.optional(
      v.union(v.literal("comfortable"), v.literal("compact"))
    ),
    courseReminders: v.optional(v.boolean()),
    achievementAlerts: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("userPreferences")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .unique();

    const now = Date.now();

    // בניית אובייקט העדכון - רק שדות שנשלחו
    const updates: Record<string, unknown> = { updatedAt: now };
    if (args.emailNotifications !== undefined)
      updates.emailNotifications = args.emailNotifications;
    if (args.pushNotifications !== undefined)
      updates.pushNotifications = args.pushNotifications;
    if (args.weeklyDigest !== undefined)
      updates.weeklyDigest = args.weeklyDigest;
    if (args.theme !== undefined) updates.theme = args.theme;
    if (args.language !== undefined) updates.language = args.language;
    if (args.displayDensity !== undefined)
      updates.displayDensity = args.displayDensity;
    if (args.courseReminders !== undefined)
      updates.courseReminders = args.courseReminders;
    if (args.achievementAlerts !== undefined)
      updates.achievementAlerts = args.achievementAlerts;

    if (existing) {
      await ctx.db.patch(existing._id, updates);
    } else {
      // יצירה ראשונה - ברירות מחדל + עדכונים
      await ctx.db.insert("userPreferences", {
        userId: identity.subject,
        ...DEFAULT_PREFERENCES,
        ...updates,
        updatedAt: now,
      });
    }

    return { success: true };
  },
});
