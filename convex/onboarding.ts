import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ==========================================
// Onboarding Module - Phase 42
// Multi-step wizard for new users
// ==========================================

// --- Get onboarding status for current user ---
export const getOnboarding = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const existing = await ctx.db
      .query("userOnboarding")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .first();

    return existing;
  },
});

// --- Save progress for a specific step ---
export const saveStep = mutation({
  args: {
    step: v.number(),
    answers: v.object({
      goals: v.optional(v.array(v.string())),
      experience: v.optional(v.string()),
      preferredTopics: v.optional(v.array(v.string())),
      ageRange: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("userOnboarding")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .first();

    if (existing) {
      // Merge answers: keep existing, overlay new
      const mergedAnswers = {
        ...existing.answers,
        ...Object.fromEntries(
          Object.entries(args.answers).filter(([, v]) => v !== undefined)
        ),
      };

      await ctx.db.patch(existing._id, {
        currentStep: args.step,
        answers: mergedAnswers,
      });

      return { success: true };
    }

    // Create new onboarding record
    await ctx.db.insert("userOnboarding", {
      userId: identity.subject,
      completed: false,
      currentStep: args.step,
      answers: args.answers,
      createdAt: Date.now(),
    });

    return { success: true };
  },
});

// --- Mark onboarding as complete + award XP ---
export const completeOnboarding = mutation({
  args: {
    answers: v.object({
      goals: v.optional(v.array(v.string())),
      experience: v.optional(v.string()),
      preferredTopics: v.optional(v.array(v.string())),
      ageRange: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const now = Date.now();

    const existing = await ctx.db
      .query("userOnboarding")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .first();

    if (existing) {
      const mergedAnswers = {
        ...existing.answers,
        ...Object.fromEntries(
          Object.entries(args.answers).filter(([, v]) => v !== undefined)
        ),
      };

      await ctx.db.patch(existing._id, {
        completed: true,
        currentStep: 4,
        answers: mergedAnswers,
        completedAt: now,
      });
    } else {
      await ctx.db.insert("userOnboarding", {
        userId: identity.subject,
        completed: true,
        currentStep: 4,
        answers: args.answers,
        completedAt: now,
        createdAt: now,
      });
    }

    // Award 50 XP for completing onboarding
    // Find the user in users table by clerkId
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (user) {
      // Check if onboarding XP was already awarded
      const existingXp = await ctx.db
        .query("xpEvents")
        .withIndex("by_user_type", (q) =>
          q.eq("userId", user._id).eq("type", "onboarding_complete")
        )
        .first();

      if (!existingXp) {
        await ctx.db.insert("xpEvents", {
          userId: user._id,
          type: "onboarding_complete",
          points: 50,
          description: "השלמת שאלון היכרות",
          createdAt: now,
        });
      }

      // Also update user preferences with onboarding data
      const currentPrefs = user.preferences ?? {};
      await ctx.db.patch(user._id, {
        preferences: {
          ...currentPrefs,
          onboardingCompleted: true,
          interests: args.answers.preferredTopics ?? currentPrefs.interests,
        },
        updatedAt: now,
      });
    }

    return { success: true };
  },
});
