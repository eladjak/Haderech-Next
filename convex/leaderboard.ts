import {
  query,
  mutation,
  type QueryCtx,
} from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { requireCommunityAccess } from "./lib/communityAccessGuard";

// ==========================================
// Leaderboard, Weekly Challenges & Rewards
// Phase 74 - Advanced Gamification
// ==========================================

// --- Helper: compute XP for a user from xpEvents table ---
async function getUserTotalXP(
  db: QueryCtx["db"],
  userId: Id<"users">
): Promise<number> {
  const events = await db
    .query("xpEvents")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect();
  return events.reduce((sum, event) => sum + event.points, 0);
}

// --- Helper: level from XP ---
function levelFromXP(xp: number): number {
  return Math.floor(xp / 100) + 1;
}

// --- Helper: start of this week (Sunday 00:00 UTC) ---
function startOfWeekTs(): number {
  const now = new Date();
  const day = now.getUTCDay(); // 0=Sun
  const startOfDay = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );
  startOfDay.setUTCDate(startOfDay.getUTCDate() - day);
  return startOfDay.getTime();
}

// --- Helper: start of this month ---
function startOfMonthTs(): number {
  const now = new Date();
  return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1);
}

// ==========================================
// Leaderboard Queries
// ==========================================

export const getWeeklyLeaderboard = query({
  args: {},
  handler: async (ctx) => {
    await requireCommunityAccess(ctx);
    // A truthful social ranking needs a bounded, consent-aware aggregate.
    // Until that exists, keep this compatibility endpoint fail-closed instead
    // of scanning every learner and exposing an improvised comparison table.
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
    const user = await requireCommunityAccess(ctx);

    const weekFromTs = startOfWeekTs();
    const monthFromTs = startOfMonthTs();

    const events = await ctx.db
      .query("xpEvents")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    const totalXp = events.reduce((sum, event) => sum + event.points, 0);
    const weekXp = events
      .filter((event) => event.createdAt >= weekFromTs)
      .reduce((sum, event) => sum + event.points, 0);
    const monthXp = events
      .filter((event) => event.createdAt >= monthFromTs)
      .reduce((sum, event) => sum + event.points, 0);

    return {
      userId: user._id,
      name: user.name ?? "סטודנט",
      imageUrl: user.imageUrl ?? null,
      totalXp,
      weekXp,
      monthXp,
      level: levelFromXP(totalXp),
      comparisonStatus: "unavailable" as const,
      weekRank: null,
      monthRank: null,
      allTimeRank: null,
      weekTotal: null,
      monthTotal: null,
      allTimeTotal: null,
    };
  },
});

// ==========================================
// Weekly Challenges
// ==========================================

const WEEKLY_CHALLENGE_DEFINITIONS = [
  {
    slug: "complete_5_lessons",
    title: "השלם 5 שיעורים השבוע",
    description: "למד 5 שיעורים חדשים במהלך השבוע הנוכחי",
    icon: "📚",
    xpReward: 50,
    targetCount: 5,
    trackingType: "lessons_this_week" as const,
  },
  {
    slug: "write_3_community_replies",
    title: "כתוב 3 תגובות בקהילה",
    description: "שתף ידע ועזור לחברים על ידי כתיבת 3 תגובות בפורום",
    icon: "💬",
    xpReward: 30,
    targetCount: 3,
    trackingType: "community_replies_this_week" as const,
  },
  {
    slug: "quiz_above_80",
    title: "השלם חידון בציון מעל 80",
    description: "עבור חידון עם ציון גבוה מ-80 השבוע",
    icon: "📝",
    xpReward: 40,
    targetCount: 1,
    trackingType: "quiz_above_80_this_week" as const,
  },
  {
    slug: "watch_2_hours",
    title: "צפה ב-2 שעות של תוכן",
    description: "צבור 2 שעות של צפייה בשיעורים השבוע",
    icon: "🎬",
    xpReward: 35,
    targetCount: 120,
    trackingType: "watch_minutes_this_week" as const,
  },
  {
    slug: "daily_challenge_5_days",
    title: "השלם את האתגר היומי 5 ימים",
    description: "היכנס ולמד 5 ימים שונים במהלך השבוע",
    icon: "🎯",
    xpReward: 60,
    targetCount: 5,
    trackingType: "active_days_this_week" as const,
  },
  {
    slug: "share_success_story",
    title: "שתף סיפור הצלחה",
    description: "פרסם פוסט בקטגוריית 'שיתופים מהדרך' בקהילה",
    icon: "🌟",
    xpReward: 25,
    targetCount: 1,
    trackingType: "success_story_this_week" as const,
  },
  {
    slug: "simulator_grade_a",
    title: "סיים סימולציה עם ציון A",
    description: "קבל ציון A בסימולציית שיחה השבוע",
    icon: "🎭",
    xpReward: 45,
    targetCount: 1,
    trackingType: "simulator_grade_a_this_week" as const,
  },
  {
    slug: "download_3_resources",
    title: "הורד 3 משאבים",
    description: "הורד 3 חומרי לימוד ממאגר המשאבים",
    icon: "📥",
    xpReward: 20,
    targetCount: 3,
    trackingType: "downloads_this_week" as const,
  },
  {
    slug: "help_in_forum",
    title: "עזור לחבר בפורום",
    description: "ענה על שאלה של חבר בקטגוריית 'שאלות' בפורום",
    icon: "🤝",
    xpReward: 35,
    targetCount: 1,
    trackingType: "forum_help_this_week" as const,
  },
  {
    slug: "streak_7_days",
    title: "סיים שבוע עם streak של 7 ימים",
    description: "למד כל יום של השבוע ללא הפסקה",
    icon: "🔥",
    xpReward: 75,
    targetCount: 7,
    trackingType: "streak_days_this_week" as const,
  },
] as const;

export const getWeeklyChallenges = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireCommunityAccess(ctx);

    // Get completed challenges for this user this week
    const weekFromTs = startOfWeekTs();
    let completedSlugs = new Set<string>();

    const completions = await ctx.db
      .query("weeklyChallengCompletions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    const thisWeekCompletions = (
      completions as Array<{ challengeSlug: string; completedAt: number }>
    ).filter((c) => c.completedAt >= weekFromTs);
    completedSlugs = new Set(thisWeekCompletions.map((c) => c.challengeSlug));

    // Calculate days remaining in week
    const now = Date.now();
    const nextWeekStart = weekFromTs + 7 * 24 * 60 * 60 * 1000;
    const msRemaining = nextWeekStart - now;
    const daysRemaining = Math.ceil(msRemaining / (24 * 60 * 60 * 1000));

    return WEEKLY_CHALLENGE_DEFINITIONS.map((c) => ({
      slug: c.slug,
      title: c.title,
      description: c.description,
      icon: c.icon,
      xpReward: c.xpReward,
      targetCount: c.targetCount,
      completed: completedSlugs.has(c.slug),
      daysRemaining: Math.max(0, daysRemaining),
    }));
  },
});

export const completeWeeklyChallenge = mutation({
  args: {
    challengeSlug: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireCommunityAccess(ctx);
    const weekFromTs = startOfWeekTs();

    // Check if already completed this week
    const existing = await ctx.db
      .query("weeklyChallengCompletions")
      .withIndex("by_user_slug", (q) =>
        q.eq("userId", user._id).eq("challengeSlug", args.challengeSlug)
      )
      .first();

    if (existing && existing.completedAt >= weekFromTs) {
      throw new Error("אתגר זה כבר הושלם השבוע");
    }

    const challenge = WEEKLY_CHALLENGE_DEFINITIONS.find(
      (c) => c.slug === args.challengeSlug
    );
    if (!challenge) throw new Error("אתגר לא נמצא");

    // Record completion
    await ctx.db.insert("weeklyChallengCompletions", {
      userId: user._id,
      challengeSlug: args.challengeSlug,
      completedAt: Date.now(),
    });

    // Award XP
    await ctx.db.insert("xpEvents", {
      userId: user._id,
      type: "weekly_challenge",
      points: challenge.xpReward,
      description: `השלמת אתגר שבועי: ${challenge.title}`,
      createdAt: Date.now(),
    });

    return { success: true, xpAwarded: challenge.xpReward };
  },
});

// ==========================================
// Rewards Shop
// ==========================================

const REWARD_DEFINITIONS = [
  {
    slug: "premium_badge",
    title: "תג פרימיום",
    description: "קבל תג פרימיום מיוחד שיוצג בפרופיל שלך",
    icon: "💎",
    xpCost: 500,
    category: "badge" as const,
    available: true,
  },
  {
    slug: "bonus_lesson_access",
    title: "גישה לשיעור בונוס",
    description: "פתח גישה לשיעור בונוס בלעדי לא זמין לכלל הציבור",
    icon: "🎁",
    xpCost: 300,
    category: "content" as const,
    available: true,
  },
  {
    slug: "coach_call_15min",
    title: "ייעוץ 15 דקות עם מאמן",
    description: "שיחת ייעוץ אישית של 15 דקות עם אחד המאמנים המוסמכים שלנו",
    icon: "📞",
    xpCost: 1000,
    category: "coaching" as const,
    available: true,
  },
  {
    slug: "excellence_certificate",
    title: "תעודת הצטיינות",
    description: "תעודת הצטיינות מיוחדת המאשרת את הישגיך בלמידה",
    icon: "🏆",
    xpCost: 750,
    category: "certificate" as const,
    available: true,
  },
  {
    slug: "custom_emoji",
    title: "אימוג'י מותאם אישית",
    description: "בחר אימוג'י ייחודי שיופיע ליד שמך בפורום הקהילה",
    icon: "😎",
    xpCost: 200,
    category: "cosmetic" as const,
    available: true,
  },
  {
    slug: "special_title",
    title: "כותרת מיוחדת",
    description: "קבל כותרת ייחודית שתוצג בפרופיל הקהילה שלך",
    icon: "👑",
    xpCost: 400,
    category: "cosmetic" as const,
    available: true,
  },
  {
    slug: "early_content_access",
    title: "גישה מוקדמת לתוכן",
    description: "קבל גישה לתוכן חדש שבוע לפני כלל המשתמשים",
    icon: "⚡",
    xpCost: 600,
    category: "content" as const,
    available: true,
  },
  {
    slug: "course_discount_10",
    title: "הנחה 10% על קורס",
    description: "קבל קוד הנחה של 10% לרכישת כל קורס בחנות",
    icon: "🎟️",
    xpCost: 800,
    category: "discount" as const,
    available: true,
  },
] as const;

export const getRewardsShop = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireCommunityAccess(ctx);
    let userXP = 0;
    let redeemedSlugs = new Set<string>();
    userXP = await getUserTotalXP(ctx.db, user._id);
    const redemptions = await ctx.db
      .query("rewardRedemptions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    redeemedSlugs = new Set(
      redemptions.map((redemption) => redemption.rewardSlug)
    );

    return {
      userXP,
      rewards: REWARD_DEFINITIONS.map((r) => ({
        slug: r.slug,
        title: r.title,
        description: r.description,
        icon: r.icon,
        xpCost: r.xpCost,
        category: r.category,
        available: r.available,
        redeemed: redeemedSlugs.has(r.slug),
        canAfford: userXP >= r.xpCost,
      })),
    };
  },
});

export const redeemReward = mutation({
  args: {
    rewardSlug: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireCommunityAccess(ctx);

    const reward = REWARD_DEFINITIONS.find((r) => r.slug === args.rewardSlug);
    if (!reward) throw new Error("פרס לא נמצא");
    if (!reward.available) throw new Error("פרס זה אינו זמין כרגע");

    // Check not already redeemed
    const existingRedemption = await ctx.db
      .query("rewardRedemptions")
      .withIndex("by_user_reward", (q) =>
        q.eq("userId", user._id).eq("rewardSlug", args.rewardSlug)
      )
      .first();
    if (existingRedemption) throw new Error("כבר מימשת פרס זה");

    // Check user has enough XP
    const userXP = await getUserTotalXP(ctx.db, user._id);
    if (userXP < reward.xpCost) {
      throw new Error(
        `אין מספיק XP. יש לך ${userXP} XP אך הפרס עולה ${reward.xpCost} XP`
      );
    }

    // Deduct XP (insert negative XP event)
    await ctx.db.insert("xpEvents", {
      userId: user._id,
      type: "reward_redemption",
      points: -reward.xpCost,
      description: `מימוש פרס: ${reward.title}`,
      createdAt: Date.now(),
    });

    // Record redemption
    await ctx.db.insert("rewardRedemptions", {
      userId: user._id,
      rewardSlug: args.rewardSlug,
      rewardTitle: reward.title,
      xpSpent: reward.xpCost,
      redeemedAt: Date.now(),
    });

    return { success: true, xpSpent: reward.xpCost };
  },
});

// --- Get user's redeemed rewards ---
export const getMyRewards = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireCommunityAccess(ctx);

    const redemptions = await ctx.db
      .query("rewardRedemptions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    return redemptions
      .map((r) => {
        const def = REWARD_DEFINITIONS.find((d) => d.slug === r.rewardSlug);
        return {
          slug: r.rewardSlug,
          title: r.rewardTitle,
          icon: def?.icon ?? "🎁",
          xpSpent: r.xpSpent,
          redeemedAt: r.redeemedAt,
        };
      })
      .sort((a, b) => b.redeemedAt - a.redeemedAt);
  },
});
