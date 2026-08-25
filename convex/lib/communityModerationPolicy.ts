export const COMMUNITY_MODERATION_ERRORS = {
  invalidTarget: "COMMUNITY_REPORT_TARGET_INVALID",
  selfReport: "COMMUNITY_SELF_REPORT_NOT_ALLOWED",
  selfBlock: "COMMUNITY_SELF_BLOCK_NOT_ALLOWED",
  rateLimited: "COMMUNITY_REPORT_RATE_LIMITED",
  appealNotOwned: "COMMUNITY_APPEAL_NOT_OWNED",
  appealNotAvailable: "COMMUNITY_APPEAL_NOT_AVAILABLE",
  transitionInvalid: "COMMUNITY_MODERATION_TRANSITION_INVALID",
} as const;

export type CommunityTargetType = "topic" | "reply";
export type CommunityReportStatus =
  | "open"
  | "under_review"
  | "resolved_no_action"
  | "dismissed";

export function reportTargetError(input: {
  reporterUserId: string;
  subjectUserId: string;
  targetExists: boolean;
  reportsInWindow: number;
  rateCap: number;
}): string | null {
  if (!input.targetExists) return COMMUNITY_MODERATION_ERRORS.invalidTarget;
  if (input.reporterUserId === input.subjectUserId) {
    return COMMUNITY_MODERATION_ERRORS.selfReport;
  }
  if (input.reportsInWindow >= input.rateCap) {
    return COMMUNITY_MODERATION_ERRORS.rateLimited;
  }
  return null;
}

export function blockTargetError(
  blockerUserId: string,
  blockedUserId: string,
): string | null {
  return blockerUserId === blockedUserId
    ? COMMUNITY_MODERATION_ERRORS.selfBlock
    : null;
}

export function appealError(input: {
  requesterUserId: string;
  subjectUserId: string;
  appealable: boolean;
}): string | null {
  if (input.requesterUserId !== input.subjectUserId) {
    return COMMUNITY_MODERATION_ERRORS.appealNotOwned;
  }
  return input.appealable
    ? null
    : COMMUNITY_MODERATION_ERRORS.appealNotAvailable;
}

export function canTransitionReport(
  from: CommunityReportStatus,
  to: CommunityReportStatus,
): boolean {
  if (from === to) return true;
  if (from === "open") {
    return ["under_review", "resolved_no_action", "dismissed"].includes(to);
  }
  if (from === "under_review") {
    return ["resolved_no_action", "dismissed"].includes(to);
  }
  return false;
}

export function isActionableReportStatus(status: CommunityReportStatus): boolean {
  return status === "open" || status === "under_review";
}

export function selectActiveDuplicate<T extends { status: CommunityReportStatus }>(
  rows: T[],
): T | null {
  return rows.find((row) => isActionableReportStatus(row.status)) ?? null;
}

export function mergeActionableReportQueue<
  T extends { _id: string; createdAt: number; status: CommunityReportStatus },
>(rows: T[], limit: number): T[] {
  return rows
    .filter((row) => isActionableReportStatus(row.status))
    .sort(
      (a, b) =>
        a.createdAt - b.createdAt || String(a._id).localeCompare(String(b._id)),
    )
    .slice(0, limit);
}

export type CommunityAppealStatus =
  | "submitted"
  | "under_review"
  | "resolved"
  | "dismissed";

export function canTransitionAppeal(
  from: CommunityAppealStatus,
  to: CommunityAppealStatus,
): boolean {
  if (from === to) return true;
  if (from === "submitted") {
    return ["under_review", "resolved", "dismissed"].includes(to);
  }
  if (from === "under_review") {
    return ["resolved", "dismissed"].includes(to);
  }
  return false;
}

export function safeEvidenceSnapshot(value: string, maxLength: number): string {
  return value
    .replace(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g, "[email removed]")
    .replace(/(?:\+?972|0)[-\s]?(?:\d[-\s]?){8,9}/g, "[phone removed]")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}
