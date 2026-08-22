export const COMMUNITY_ACCESS_ERROR = "COMMUNITY_ACCESS_REQUIRED" as const;

export type CommunityAccessBasis =
  | "book"
  | "course"
  | "guidance"
  | "ecosystem";

export type CommunityEntitlementFact = {
  granteeUserId: string;
  status: "active" | "revoked";
  accessBasis: CommunityAccessBasis;
  validUntil?: number;
};

export type CommunityAccessDecision =
  | "allow-admin"
  | "allow-dedicated-entitlement"
  | "deny-unauthenticated"
  | "deny-user-record-missing"
  | "deny-entitlement-missing"
  | "deny-entitlement-cross-user"
  | "deny-entitlement-inactive"
  | "deny-entitlement-expired";

/**
 * Pure, fail-closed policy for the single Omanut HaKesher community.
 *
 * A course enrollment or course entitlement is deliberately not accepted as
 * a semantic substitute. Community access may originate in the book, course,
 * guidance, or a verified ecosystem bundle, so it requires its own grant.
 * The application currently has no grant writer: until a verified fulfilment
 * or owner-approved administrative issuer exists, only admins can pass the
 * server guard.
 */
export function decideCommunityAccess(input: {
  authenticated: boolean;
  callerUserId: string | null;
  callerRole: "student" | "admin" | null;
  entitlement: CommunityEntitlementFact | null;
  now: number;
}): CommunityAccessDecision {
  if (!input.authenticated) return "deny-unauthenticated";
  if (input.callerUserId === null || input.callerRole === null) {
    return "deny-user-record-missing";
  }
  if (input.callerRole === "admin") return "allow-admin";
  if (input.entitlement === null) return "deny-entitlement-missing";
  if (input.entitlement.granteeUserId !== input.callerUserId) {
    return "deny-entitlement-cross-user";
  }
  if (input.entitlement.status !== "active") {
    return "deny-entitlement-inactive";
  }
  if (
    input.entitlement.validUntil !== undefined &&
    input.entitlement.validUntil <= input.now
  ) {
    return "deny-entitlement-expired";
  }
  return "allow-dedicated-entitlement";
}

export function communityDecisionError(
  decision: CommunityAccessDecision
): typeof COMMUNITY_ACCESS_ERROR | null {
  switch (decision) {
    case "allow-admin":
    case "allow-dedicated-entitlement":
      return null;
    case "deny-unauthenticated":
    case "deny-user-record-missing":
    case "deny-entitlement-missing":
    case "deny-entitlement-cross-user":
    case "deny-entitlement-inactive":
    case "deny-entitlement-expired":
      return COMMUNITY_ACCESS_ERROR;
    default: {
      const exhaustive: never = decision;
      return exhaustive;
    }
  }
}
