import type { Doc } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import {
  COMMUNITY_ACCESS_ERROR,
  communityDecisionError,
  decideCommunityAccess,
  type CommunityEntitlementFact,
} from "./communityAccessPolicy";

type CommunityAuthCtx = QueryCtx | MutationCtx;

/**
 * Server-authoritative gate for every learner-facing community operation.
 *
 * There is intentionally no application writer for community entitlements.
 * Until a verified fulfilment/eligibility writer is approved, admins are the
 * only callers who can pass this guard in a fresh database.
 */
export async function readCommunityAccess(
  ctx: CommunityAuthCtx,
): Promise<{
  user: Doc<"users"> | null;
  decision: ReturnType<typeof decideCommunityAccess>;
}> {
  const identity = await ctx.auth.getUserIdentity();
  const user = identity
    ? await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
        .unique()
    : null;

  const entitlementRows = user
    ? await ctx.db
        .query("communityEntitlements")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .collect()
    : [];
  const now = Date.now();
  const selected =
    entitlementRows.find(
      (row) =>
        row.status === "active" &&
        (row.validUntil === undefined || row.validUntil > now),
    ) ??
    entitlementRows[0] ??
    null;
  const entitlement: CommunityEntitlementFact | null = selected
    ? {
        granteeUserId: String(selected.userId),
        status: selected.status,
        accessBasis: selected.accessBasis,
        validUntil: selected.validUntil,
      }
    : null;

  const decision = decideCommunityAccess({
    authenticated: identity !== null,
    callerUserId: user ? String(user._id) : null,
    callerRole: user?.role ?? null,
    entitlement,
    now,
  });
  return { user, decision };
}

export async function requireCommunityAccess(
  ctx: CommunityAuthCtx,
): Promise<Doc<"users">> {
  const { user, decision } = await readCommunityAccess(ctx);
  const error = communityDecisionError(decision);
  if (error || !user) throw new Error(error ?? COMMUNITY_ACCESS_ERROR);
  return user;
}
