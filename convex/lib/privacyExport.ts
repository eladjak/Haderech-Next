import type { Doc } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";
import {
  PRIVACY_DATASETS,
  toSafePaymentExport,
  toSafePushSubscriptionExport,
  toSafeSubscriptionExport,
} from "./privacyPolicy";
import { toQuizAttemptSummary } from "./authorizationPolicy";

/**
 * Collects only rows that can be tied to the authenticated user's Convex ID or
 * Clerk subject. Email equality is deliberately not treated as ownership.
 */
export async function collectUserDataExport(
  ctx: QueryCtx,
  user: Doc<"users">
) {
  const clerkId = user.clerkId;
  const [
    privacyRequests,
    privacyConsents,
    enrollments,
    courseEntitlements,
    progress,
    quizAttempts,
    notifications,
    notes,
    comments,
    certificates,
    chatSessions,
    simulatorSessions,
    simulatorTrialUsage,
    dialogueSessions,
    communityTopics,
    communityReplies,
    communityTopicLikes,
    communityReplyLikes,
    communityEntitlements,
    dailyChallengeCompletions,
    contactMessages,
    xpEvents,
    userBadges,
    courseReviews,
    reviewVotes,
    mentorProfiles,
    mentoringSessionsAsStudent,
    authoredBlogPosts,
    subscriptions,
    payments,
    successStories,
    onboarding,
    extendedPreferences,
    bookmarks,
    resourceBookmarks,
    pushSubscriptions,
    weeklyChallengeCompletions,
    rewardRedemptions,
    datingProfile,
  ] = await Promise.all([
    ctx.db
      .query("privacyRequests")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect(),
    ctx.db
      .query("privacyConsents")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect(),
    ctx.db
      .query("enrollments")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect(),
    ctx.db
      .query("courseEntitlements")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect(),
    ctx.db
      .query("progress")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect(),
    ctx.db
      .query("quizAttempts")
      .withIndex("by_user_quiz", (q) => q.eq("userId", user._id))
      .collect(),
    ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect(),
    ctx.db
      .query("notes")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect(),
    ctx.db
      .query("comments")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect(),
    ctx.db
      .query("certificates")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect(),
    ctx.db
      .query("chatSessions")
      .withIndex("by_user", (q) => q.eq("userId", clerkId))
      .collect(),
    ctx.db
      .query("simulatorSessions")
      .withIndex("by_user", (q) => q.eq("userId", clerkId))
      .collect(),
    ctx.db
      .query("simulatorTrialUsage")
      .withIndex("by_user", (q) => q.eq("userId", clerkId))
      .collect(),
    ctx.db
      .query("dialogueSessions")
      .withIndex("by_user", (q) => q.eq("userId", clerkId))
      .collect(),
    ctx.db
      .query("communityTopics")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect(),
    ctx.db
      .query("communityReplies")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect(),
    ctx.db
      .query("communityTopicLikes")
      .withIndex("by_user_topic", (q) => q.eq("userId", user._id))
      .collect(),
    ctx.db
      .query("communityReplyLikes")
      .withIndex("by_user_reply", (q) => q.eq("userId", user._id))
      .collect(),
    ctx.db
      .query("communityEntitlements")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect(),
    ctx.db
      .query("dailyChallengeCompletions")
      .withIndex("by_user", (q) => q.eq("userId", clerkId))
      .collect(),
    ctx.db
      .query("contactMessages")
      .withIndex("by_user", (q) => q.eq("userId", clerkId))
      .collect(),
    ctx.db
      .query("xpEvents")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect(),
    ctx.db
      .query("userBadges")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect(),
    ctx.db
      .query("courseReviews")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect(),
    ctx.db
      .query("reviewVotes")
      .withIndex("by_user_review", (q) => q.eq("userId", user._id))
      .collect(),
    ctx.db
      .query("mentors")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect(),
    ctx.db
      .query("mentoringSessions")
      .withIndex("by_student", (q) => q.eq("studentId", user._id))
      .collect(),
    ctx.db
      .query("blogPosts")
      .withIndex("by_author", (q) => q.eq("authorId", user._id))
      .collect(),
    ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect(),
    ctx.db
      .query("payments")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect(),
    ctx.db
      .query("successStories")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect(),
    ctx.db
      .query("userOnboarding")
      .withIndex("by_user", (q) => q.eq("userId", clerkId))
      .collect(),
    ctx.db
      .query("userPreferences")
      .withIndex("by_user", (q) => q.eq("userId", clerkId))
      .collect(),
    ctx.db
      .query("bookmarks")
      .withIndex("by_user", (q) => q.eq("userId", clerkId))
      .collect(),
    ctx.db
      .query("resourceBookmarks")
      .withIndex("by_user", (q) => q.eq("userId", clerkId))
      .collect(),
    ctx.db
      .query("pushSubscriptions")
      .withIndex("by_user", (q) => q.eq("userId", clerkId))
      .collect(),
    ctx.db
      .query("weeklyChallengCompletions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect(),
    ctx.db
      .query("rewardRedemptions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect(),
    ctx.db
      .query("datingProfiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .unique(),
  ]);

  const [chatMessages, simulatorMessages] = await Promise.all([
    Promise.all(
      chatSessions.map((session) =>
        ctx.db
          .query("chatMessages")
          .withIndex("by_session", (q) => q.eq("sessionId", session._id))
          .collect()
      )
    ).then((groups) => groups.flat()),
    Promise.all(
      simulatorSessions.map((session) =>
        ctx.db
          .query("simulatorMessages")
          .withIndex("by_session", (q) => q.eq("sessionId", session._id))
          .collect()
      )
    ).then((groups) => groups.flat()),
  ]);

  return {
    format: "haderech-user-data-export",
    formatVersion: 2,
    coverage: {
      mappedDatasets: PRIVACY_DATASETS.length,
      categories: PRIVACY_DATASETS.map((dataset) => dataset.category),
    },
    profile: {
      externalAuthSubject: user.clerkId,
      name: user.name,
      email: user.email,
      imageUrl: user.imageUrl,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      preferences: user.preferences,
    },
    privacyRequests,
    privacyConsents,
    enrollments,
    courseEntitlements,
    progress,
    // The instant self-service file is intentionally a learner-safe summary.
    // Raw answers and failed numeric scores require a verified/manual DSAR;
    // otherwise this endpoint bypasses the graded-quiz anti-oracle policy.
    quizAttempts: quizAttempts.map(toQuizAttemptSummary),
    notifications,
    notes,
    comments,
    certificates,
    chatSessions,
    chatMessages,
    simulatorSessions,
    simulatorTrialUsage: simulatorTrialUsage.map((usage) => ({
      consumedUnits: usage.consumedUnits,
      updatedAt: usage.updatedAt,
    })),
    simulatorMessages,
    dialogueSessions,
    communityTopics,
    communityReplies,
    communityTopicLikes,
    communityReplyLikes,
    communityEntitlements: communityEntitlements.map((entitlement) => ({
      accessBasis: entitlement.accessBasis,
      status: entitlement.status,
      source: entitlement.source,
      grantedAt: entitlement.grantedAt,
      validUntil: entitlement.validUntil,
      revokedAt: entitlement.revokedAt,
    })),
    dailyChallengeCompletions,
    contactMessages,
    xpEvents,
    userBadges,
    courseReviews,
    reviewVotes,
    mentorProfiles,
    mentoringSessionsAsStudent: mentoringSessionsAsStudent.map((session) => ({
      mentorId: session.mentorId,
      status: session.status,
      scheduledAt: session.scheduledAt,
      duration: session.duration,
      notes: session.notes,
      rating: session.rating,
      createdAt: session.createdAt,
    })),
    authoredBlogPosts,
    subscriptions: subscriptions.map((subscription) =>
      toSafeSubscriptionExport({
        plan: subscription.plan,
        status: subscription.status,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        createdAt: subscription.createdAt,
        updatedAt: subscription.updatedAt,
      })
    ),
    payments: payments.map((payment) =>
      toSafePaymentExport({
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        description: payment.description,
        createdAt: payment.createdAt,
      })
    ),
    successStories,
    onboarding,
    extendedPreferences,
    bookmarks,
    resourceBookmarks,
    pushSubscriptions: pushSubscriptions.map(toSafePushSubscriptionExport),
    weeklyChallengeCompletions,
    rewardRedemptions,
    datingProfile,
    manualReviewNotes: [
      "פרטי אימות של הרשמות Push הושמטו מהקובץ מטעמי אבטחה.",
      "הערות פנימיות של מנטור אינן נכללות בייצוא העצמי ודורשות בדיקה ידנית המגינה גם על זכויות צדדים אחרים.",
      "הייצוא העצמי המיידי כולל סיכום בחנים בלבד. תשובות שנבחרו וציון מספרי של ניסיון שלא עבר דורשים בקשת גישה מלאה, אימות זהות ובדיקה ידנית שאינה חושפת את מפתח הבוחן.",
      "פניות קשר שלא נשמר להן מזהה משתמש מאומת אינן משויכות אוטומטית לפי כתובת אימייל בלבד.",
    ],
    exportedAt: Date.now(),
  };
}
