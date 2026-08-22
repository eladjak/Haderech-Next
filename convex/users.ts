import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import {
  requireClerkSubject,
  requireSelfOrAdmin,
  requireUser,
} from "./lib/authGuard";
import {
  PRIVACY_CONSENT_PURPOSES,
  PRIVACY_POLICY_VERSION,
  isOpenPrivacyRequest,
} from "./lib/privacyPolicy";
import { collectUserDataExport } from "./lib/privacyExport";
import { createOrReturnPrivacyRequest } from "./lib/privacyRequests";

// שליפת משתמש לפי Clerk ID
export const getByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    await requireClerkSubject(ctx, args.clerkId);
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
    await requireSelfOrAdmin(ctx, args.id);
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
    await requireClerkSubject(ctx, args.clerkId);
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

// אימיילים שתמיד יהיו admin
const ADMIN_EMAILS = ["eladjak@gmail.com"];

// יצירת משתמש אוטומטית מ-auth context (אם לא קיים)
export const ensureUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const email = identity.email ?? "";
    const isAutoAdmin = ADMIN_EMAILS.includes(email.toLowerCase());

    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (existing) {
      // Auto-promote to admin if in ADMIN_EMAILS list and not already admin
      if (isAutoAdmin && existing.role !== "admin") {
        await ctx.db.patch(existing._id, {
          role: "admin",
          updatedAt: Date.now(),
        });
        return await ctx.db.get(existing._id);
      }
      return existing;
    }

    const now = Date.now();
    const id = await ctx.db.insert("users", {
      clerkId: identity.subject,
      email,
      name: identity.name,
      imageUrl: identity.pictureUrl,
      role: isAutoAdmin ? "admin" : "student",
      createdAt: now,
      updatedAt: now,
    });

    return await ctx.db.get(id);
  },
});

// בדיקה אם יש admin כלשהו במערכת
export const hasAnyAdmin = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    return users.some((u) => u.role === "admin");
  },
});

// קידום עצמי ל-admin (רק כשאין admins במערכת)
export const promoteSelfToAdmin = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const allUsers = await ctx.db.query("users").collect();
    const hasAdmin = allUsers.some((u) => u.role === "admin");
    if (hasAdmin) {
      throw new Error("Admin already exists. Contact existing admin for access.");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      const now = Date.now();
      await ctx.db.insert("users", {
        clerkId: identity.subject,
        email: identity.email ?? "",
        name: identity.name,
        imageUrl: identity.pictureUrl,
        role: "admin",
        createdAt: now,
        updatedAt: now,
      });
      return { success: true };
    }

    await ctx.db.patch(user._id, { role: "admin", updatedAt: Date.now() });
    return { success: true };
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

// עדכון העדפות משתמש (תחומי עניין ומטרות)
export const updatePreferences = mutation({
  args: {
    interests: v.optional(v.array(v.string())),
    onboardingCompleted: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");

    const currentPrefs = user.preferences ?? {};
    await ctx.db.patch(user._id, {
      preferences: {
        ...currentPrefs,
        ...(args.interests !== undefined ? { interests: args.interests } : {}),
        ...(args.onboardingCompleted !== undefined
          ? { onboardingCompleted: args.onboardingCompleted }
          : {}),
      },
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// שליפת העדפות משתמש
export const getPreferences = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    return user?.preferences ?? null;
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

// עדכון העדפות התראות
export const updateNotificationPreferences = mutation({
  args: {
    email: v.optional(v.boolean()),
    dailyReminder: v.optional(v.boolean()),
    community: v.optional(v.boolean()),
    dailyTip: v.optional(v.boolean()),
    courseUpdates: v.optional(v.boolean()),
    promotions: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");

    const currentPrefs = user.preferences ?? {};
    const currentNotifications = currentPrefs.notifications ?? {};

    await ctx.db.patch(user._id, {
      preferences: {
        ...currentPrefs,
        notifications: {
          ...currentNotifications,
          ...(args.email !== undefined ? { email: args.email } : {}),
          ...(args.dailyReminder !== undefined
            ? { dailyReminder: args.dailyReminder }
            : {}),
          ...(args.community !== undefined
            ? { community: args.community }
            : {}),
          ...(args.dailyTip !== undefined ? { dailyTip: args.dailyTip } : {}),
          ...(args.courseUpdates !== undefined
            ? { courseUpdates: args.courseUpdates }
            : {}),
          ...(args.promotions !== undefined
            ? { promotions: args.promotions }
            : {}),
        },
      },
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// עדכון העדפות תצוגה
export const updateDisplayPreferences = mutation({
  args: {
    theme: v.optional(
      v.union(v.literal("light"), v.literal("dark"), v.literal("system"))
    ),
    fontSize: v.optional(
      v.union(v.literal("small"), v.literal("normal"), v.literal("large"))
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");

    const currentPrefs = user.preferences ?? {};
    const currentDisplay = currentPrefs.display ?? {};

    await ctx.db.patch(user._id, {
      preferences: {
        ...currentPrefs,
        display: {
          ...currentDisplay,
          ...(args.theme !== undefined ? { theme: args.theme } : {}),
          ...(args.fontSize !== undefined ? { fontSize: args.fontSize } : {}),
        },
      },
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// עדכון העדפות למידה
export const updateLearningPreferences = mutation({
  args: {
    weeklyGoal: v.optional(v.number()),
    preferredTime: v.optional(
      v.union(
        v.literal("morning"),
        v.literal("afternoon"),
        v.literal("evening")
      )
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");

    const currentPrefs = user.preferences ?? {};
    const currentLearning = currentPrefs.learning ?? {};

    await ctx.db.patch(user._id, {
      preferences: {
        ...currentPrefs,
        learning: {
          ...currentLearning,
          ...(args.weeklyGoal !== undefined
            ? { weeklyGoal: args.weeklyGoal }
            : {}),
          ...(args.preferredTime !== undefined
            ? { preferredTime: args.preferredTime }
            : {}),
        },
      },
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// ייצוא נתוני משתמש
export const exportUserData = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    return await collectUserDataExport(ctx, user);
  },
});

// בקשת מחיקת חשבון
export const requestAccountDeletion = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    return await createOrReturnPrivacyRequest(ctx, user, "deletion");
  },
});

export const getAccountDeletionRequest = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    const requests = await ctx.db
      .query("privacyRequests")
      .withIndex("by_user_type", (q) =>
        q.eq("userId", user._id).eq("requestType", "deletion")
      )
      .collect();
    const request = requests.sort((a, b) => b.requestedAt - a.requestedAt)[0];

    if (request) {
      return {
        requestId: request._id,
        status: request.status,
        identityVerification: request.identityVerification,
        requestedAt: request.requestedAt,
        updatedAt: request.updatedAt,
        completedAt: request.completedAt,
        open: isOpenPrivacyRequest(request.status),
        legacy: false,
      };
    }

    // Preserve visibility of requests recorded by the old preference flag.
    // This is not treated as proof that deletion occurred.
    if (user.preferences?.deletionRequested) {
      return {
        requestId: null,
        status: "identity_verification_required" as const,
        identityVerification: "manual_verification_required" as const,
        requestedAt: user.preferences.deletionRequestedAt ?? user.updatedAt,
        updatedAt: user.updatedAt,
        completedAt: undefined,
        open: true,
        legacy: true,
      };
    }

    return null;
  },
});

export const requestPrivacyAction = mutation({
  args: {
    requestType: v.union(
      v.literal("access"),
      v.literal("correction"),
      v.literal("deletion"),
      v.literal("marketing_objection")
    ),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    return await createOrReturnPrivacyRequest(ctx, user, args.requestType);
  },
});

export const getPrivacyConsents = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    const [analytics, marketing] = await Promise.all(
      (["analytics", "marketing"] as const).map(async (consentType) => {
        const record = await ctx.db
          .query("privacyConsents")
          .withIndex("by_user_type", (q) =>
            q.eq("userId", user._id).eq("consentType", consentType)
          )
          .order("desc")
          .first();
        return record
          ? {
              consentType: record.consentType,
              decision: record.decision,
              purpose: record.purpose,
              policyVersion: record.policyVersion,
              decidedAt: record.decidedAt,
            }
          : null;
      })
    );
    return { analytics, marketing };
  },
});

export const recordPrivacyConsent = mutation({
  args: {
    consentType: v.union(v.literal("analytics"), v.literal("marketing")),
    granted: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const decidedAt = Date.now();
    const decision = args.granted
      ? ("granted" as const)
      : ("withdrawn" as const);
    const consentId = await ctx.db.insert("privacyConsents", {
      userId: user._id,
      clerkId: user.clerkId,
      consentType: args.consentType,
      decision,
      purpose: PRIVACY_CONSENT_PURPOSES[args.consentType],
      policyVersion: PRIVACY_POLICY_VERSION,
      source: "authenticated_api",
      decidedAt,
    });
    return {
      consentId,
      consentType: args.consentType,
      decision,
      policyVersion: PRIVACY_POLICY_VERSION,
      decidedAt,
    };
  },
});
