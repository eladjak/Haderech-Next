import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireCommunityAccess } from "./lib/communityAccessGuard";

// The course keeps private lesson progress and bounded mastery feedback.
// Social ranking, XP challenges and reward redemption are intentionally
// unavailable: relationship/community participation is not a score or a
// currency, and no coaching/content/discount promise is created here.
export const GAMIFICATION_CONTAINMENT = Object.freeze({
  publicRanking: false,
  xpStatus: false,
  weeklyChallenges: false,
  rewardShop: false,
  privateLessonProgress: true,
  privateMasteryFeedback: true,
});

export const getWeeklyLeaderboard = query({
  args: {},
  handler: async (ctx) => {
    await requireCommunityAccess(ctx);
    return [];
  },
});

export const getMonthlyLeaderboard = query({
  args: {},
  handler: async (ctx) => {
    await requireCommunityAccess(ctx);
    return [];
  },
});

export const getAllTimeLeaderboard = query({
  args: {},
  handler: async (ctx) => {
    await requireCommunityAccess(ctx);
    return [];
  },
});

export const getUserRank = query({
  args: {},
  handler: async (ctx) => {
    await requireCommunityAccess(ctx);
    return { comparisonStatus: "disabled" as const };
  },
});

export const getWeeklyChallenges = query({
  args: {},
  handler: async (ctx) => {
    await requireCommunityAccess(ctx);
    return [];
  },
});

export const completeWeeklyChallenge = mutation({
  args: { challengeSlug: v.string() },
  handler: async (ctx) => {
    await requireCommunityAccess(ctx);
    throw new Error("WEEKLY_XP_CHALLENGES_DISABLED");
  },
});

export const getRewardsShop = query({
  args: {},
  handler: async (ctx) => {
    await requireCommunityAccess(ctx);
    return { status: "disabled" as const, rewards: [] };
  },
});

export const redeemReward = mutation({
  args: { rewardSlug: v.string() },
  handler: async (ctx) => {
    await requireCommunityAccess(ctx);
    throw new Error("XP_REWARD_REDEMPTION_DISABLED");
  },
});

export const getMyRewards = query({
  args: {},
  handler: async (ctx) => {
    await requireCommunityAccess(ctx);
    return [];
  },
});
