import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import {
  latestOpenPrivacyRequest,
  privacyRequestIntakeState,
  type PrivacyRequestType,
} from "./privacyPolicy";

export async function createOrReturnPrivacyRequest(
  ctx: MutationCtx,
  user: { _id: Id<"users">; clerkId: string },
  requestType: PrivacyRequestType
) {
  const existingRequests = await ctx.db
    .query("privacyRequests")
    .withIndex("by_user_type", (q) =>
      q.eq("userId", user._id).eq("requestType", requestType)
    )
    .collect();
  const existing = latestOpenPrivacyRequest(existingRequests);

  if (existing) {
    return {
      success: true,
      duplicate: true,
      requestId: existing._id,
      status: existing.status,
      identityVerification: existing.identityVerification,
      requestedAt: existing.requestedAt,
    };
  }

  const now = Date.now();
  const { status, identityVerification } =
    privacyRequestIntakeState(requestType);
  const requestId = await ctx.db.insert("privacyRequests", {
    userId: user._id,
    clerkId: user.clerkId,
    requestType,
    status,
    identityVerification,
    requestedAt: now,
    updatedAt: now,
  });

  return {
    success: true,
    duplicate: false,
    requestId,
    status,
    identityVerification,
    requestedAt: now,
  };
}
