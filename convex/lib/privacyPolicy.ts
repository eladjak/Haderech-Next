export const PRIVACY_POLICY_VERSION = "2026-08-14.1";

export const PRIVACY_CONSENT_PURPOSES = {
  analytics:
    "מדידת שימוש ושיפור חוויית הלמידה באמצעות שירותי אנליטיקה שאינם חיוניים להפעלת השירות",
  marketing:
    "שליחת עדכונים והצעות שיווקיות שאינם חיוניים להפעלת השירות",
} as const;

export type PrivacyRequestType =
  | "access"
  | "correction"
  | "deletion"
  | "marketing_objection";

export type PrivacyRequestStatus =
  | "received"
  | "identity_verification_required"
  | "in_review"
  | "completed"
  | "rejected"
  | "cancelled";

export const OPEN_PRIVACY_REQUEST_STATUSES = new Set<PrivacyRequestStatus>([
  "received",
  "identity_verification_required",
  "in_review",
]);

export function isOpenPrivacyRequest(status: PrivacyRequestStatus): boolean {
  return OPEN_PRIVACY_REQUEST_STATUSES.has(status);
}

export function privacyRequestIntakeState(requestType: PrivacyRequestType) {
  const requiresManualVerification = requestType !== "marketing_objection";
  return {
    status: requiresManualVerification
      ? ("identity_verification_required" as const)
      : ("received" as const),
    identityVerification: requiresManualVerification
      ? ("manual_verification_required" as const)
      : ("authenticated_session_only" as const),
  };
}

export function latestOpenPrivacyRequest<
  T extends { status: PrivacyRequestStatus; requestedAt: number },
>(requests: readonly T[]): T | null {
  return (
    requests
      .filter((request) => isOpenPrivacyRequest(request.status))
      .sort((a, b) => b.requestedAt - a.requestedAt)[0] ?? null
  );
}

export type PrivacyDataset = {
  table: string;
  category: string;
  ownership:
    | "convex_user_id"
    | "clerk_subject"
    | "optional_convex_user_id"
    | "optional_clerk_subject"
    | "indirect_session"
    | "student_user_id";
  exportMode: "self_service" | "filtered";
};

/**
 * Canonical map of data that is directly or indirectly associated with a user.
 * It is intentionally explicit so schema additions cannot silently disappear
 * from export/DSAR review.
 */
export const PRIVACY_DATASETS: readonly PrivacyDataset[] = [
  { table: "users", category: "profile", ownership: "convex_user_id", exportMode: "filtered" },
  { table: "privacyRequests", category: "privacyRequests", ownership: "convex_user_id", exportMode: "self_service" },
  { table: "privacyConsents", category: "privacyConsents", ownership: "convex_user_id", exportMode: "self_service" },
  { table: "enrollments", category: "enrollments", ownership: "convex_user_id", exportMode: "self_service" },
  { table: "courseEntitlements", category: "courseEntitlements", ownership: "convex_user_id", exportMode: "filtered" },
  { table: "progress", category: "progress", ownership: "convex_user_id", exportMode: "self_service" },
  { table: "quizAttempts", category: "quizAttempts", ownership: "convex_user_id", exportMode: "filtered" },
  { table: "notifications", category: "notifications", ownership: "convex_user_id", exportMode: "self_service" },
  { table: "notes", category: "notes", ownership: "convex_user_id", exportMode: "self_service" },
  { table: "comments", category: "comments", ownership: "convex_user_id", exportMode: "self_service" },
  { table: "certificates", category: "certificates", ownership: "convex_user_id", exportMode: "self_service" },
  { table: "chatSessions", category: "chatSessions", ownership: "clerk_subject", exportMode: "self_service" },
  { table: "chatMessages", category: "chatMessages", ownership: "indirect_session", exportMode: "self_service" },
  { table: "simulatorSessions", category: "simulatorSessions", ownership: "clerk_subject", exportMode: "self_service" },
  { table: "simulatorMessages", category: "simulatorMessages", ownership: "indirect_session", exportMode: "self_service" },
  { table: "dialogueSessions", category: "dialogueSessions", ownership: "clerk_subject", exportMode: "self_service" },
  { table: "communityTopics", category: "communityTopics", ownership: "convex_user_id", exportMode: "self_service" },
  { table: "communityReplies", category: "communityReplies", ownership: "convex_user_id", exportMode: "self_service" },
  { table: "communityTopicLikes", category: "communityTopicLikes", ownership: "convex_user_id", exportMode: "self_service" },
  { table: "communityReplyLikes", category: "communityReplyLikes", ownership: "convex_user_id", exportMode: "self_service" },
  { table: "dailyChallengeCompletions", category: "dailyChallengeCompletions", ownership: "clerk_subject", exportMode: "self_service" },
  { table: "contactMessages", category: "contactMessages", ownership: "optional_clerk_subject", exportMode: "self_service" },
  { table: "xpEvents", category: "xpEvents", ownership: "convex_user_id", exportMode: "self_service" },
  { table: "userBadges", category: "userBadges", ownership: "convex_user_id", exportMode: "self_service" },
  { table: "courseReviews", category: "courseReviews", ownership: "convex_user_id", exportMode: "self_service" },
  { table: "reviewVotes", category: "reviewVotes", ownership: "convex_user_id", exportMode: "self_service" },
  { table: "mentors", category: "mentorProfile", ownership: "convex_user_id", exportMode: "self_service" },
  { table: "mentoringSessions", category: "mentoringSessionsAsStudent", ownership: "student_user_id", exportMode: "filtered" },
  { table: "blogPosts", category: "authoredBlogPosts", ownership: "convex_user_id", exportMode: "self_service" },
  { table: "subscriptions", category: "subscriptions", ownership: "convex_user_id", exportMode: "filtered" },
  { table: "payments", category: "payments", ownership: "convex_user_id", exportMode: "filtered" },
  { table: "successStories", category: "successStories", ownership: "optional_convex_user_id", exportMode: "self_service" },
  { table: "userOnboarding", category: "onboarding", ownership: "clerk_subject", exportMode: "self_service" },
  { table: "userPreferences", category: "extendedPreferences", ownership: "clerk_subject", exportMode: "self_service" },
  { table: "bookmarks", category: "bookmarks", ownership: "clerk_subject", exportMode: "self_service" },
  { table: "resourceBookmarks", category: "resourceBookmarks", ownership: "clerk_subject", exportMode: "self_service" },
  { table: "pushSubscriptions", category: "pushSubscriptions", ownership: "clerk_subject", exportMode: "filtered" },
  { table: "weeklyChallengCompletions", category: "weeklyChallengeCompletions", ownership: "convex_user_id", exportMode: "self_service" },
  { table: "rewardRedemptions", category: "rewardRedemptions", ownership: "convex_user_id", exportMode: "self_service" },
  { table: "datingProfiles", category: "datingProfile", ownership: "clerk_subject", exportMode: "self_service" },
] as const;

export function assertPrivacyDatasetMapIsValid(
  datasets: readonly PrivacyDataset[] = PRIVACY_DATASETS
): void {
  const tables = new Set<string>();
  const categories = new Set<string>();
  for (const dataset of datasets) {
    if (tables.has(dataset.table)) {
      throw new Error(`DUPLICATE_PRIVACY_TABLE:${dataset.table}`);
    }
    if (categories.has(dataset.category)) {
      throw new Error(`DUPLICATE_PRIVACY_CATEGORY:${dataset.category}`);
    }
    tables.add(dataset.table);
    categories.add(dataset.category);
  }
}

export function toSafeSubscriptionExport(subscription: {
  plan: string;
  status: string;
  currentPeriodStart?: number;
  currentPeriodEnd?: number;
  cancelAtPeriodEnd: boolean;
  createdAt: number;
  updatedAt: number;
}) {
  return { ...subscription };
}

export function toSafePaymentExport(payment: {
  amount: number;
  currency: string;
  status: string;
  description: string;
  createdAt: number;
}) {
  return { ...payment };
}

export function toSafePushSubscriptionExport(subscription: {
  active: boolean;
  userAgent?: string;
  createdAt: number;
  updatedAt: number;
}) {
  return {
    active: subscription.active,
    userAgent: subscription.userAgent,
    createdAt: subscription.createdAt,
    updatedAt: subscription.updatedAt,
    credentialMaterialOmitted: true,
  };
}
