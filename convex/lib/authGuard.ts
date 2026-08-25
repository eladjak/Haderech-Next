import type { QueryCtx, MutationCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import {
  AUTHORIZATION_ERRORS,
  courseDecisionError,
  decideCourseContentAccess,
  isClerkResourceOwner,
  isSelfOrAdmin,
} from "./authorizationPolicy";

type DatabaseCtx = QueryCtx | MutationCtx;
type AuthCtx = Pick<QueryCtx, "auth"> | Pick<MutationCtx, "auth">;

export async function requireIdentity(ctx: AuthCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error(AUTHORIZATION_ERRORS.authenticationRequired);
  }
  return identity;
}

export async function getOptionalUser(ctx: DatabaseCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
  return await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .unique();
}

/**
 * Verifies that the current user is authenticated and has admin role.
 * Throws an error if not authenticated or not an admin.
 * Returns the user document for further use.
 */
export async function requireAdmin(ctx: QueryCtx | MutationCtx) {
  const user = await requireUser(ctx);

  if (user.role !== "admin") {
    throw new Error(AUTHORIZATION_ERRORS.adminRequired);
  }

  return user;
}

/**
 * Verifies that the current user is authenticated.
 * Throws if not authenticated or the user record is missing.
 * Returns the user document.
 */
export async function requireUser(ctx: QueryCtx | MutationCtx) {
  const identity = await requireIdentity(ctx);

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .unique();

  if (!user) {
    throw new Error(AUTHORIZATION_ERRORS.userRecordRequired);
  }

  return user;
}

/**
 * Verifies that the current user is authenticated AND is either the user
 * identified by `userId` or an admin. Prevents userId spoofing on
 * user-scoped mutations that accept a userId argument.
 * Returns the calling user's document.
 */
export async function requireSelfOrAdmin(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">
) {
  const user = await requireUser(ctx);
  if (!isSelfOrAdmin(user._id, userId, user.role)) {
    throw new Error(AUTHORIZATION_ERRORS.selfOrAdminRequired);
  }
  return user;
}

export async function requireClerkSubject(ctx: AuthCtx, subject: string) {
  const identity = await requireIdentity(ctx);
  if (!isClerkResourceOwner(identity.subject, subject)) {
    throw new Error(AUTHORIZATION_ERRORS.ownershipRequired);
  }
  return identity;
}

export async function requireOwnedClerkResource(
  ctx: AuthCtx,
  ownerSubject: string
) {
  return await requireClerkSubject(ctx, ownerSubject);
}

/**
 * Fail-closed course-content gate.
 *
 * Admin is the only currently proven grant. Student enrollment rows remain
 * untrusted because their issuer/provenance is not represented in the schema.
 */
export async function requireCourseContentAccess(
  ctx: DatabaseCtx,
  courseId: Id<"courses">
) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error(AUTHORIZATION_ERRORS.authenticationRequired);
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .unique();
  const enrollment = user
    ? await ctx.db
        .query("enrollments")
        .withIndex("by_user_course", (q) =>
          q.eq("userId", user._id).eq("courseId", courseId)
        )
        .unique()
    : null;
  const now = Date.now();
  const entitlementRows = user
    ? await ctx.db
        .query("courseEntitlements")
        .withIndex("by_user_course", (q) =>
          q.eq("userId", user._id).eq("courseId", courseId)
        )
        .collect()
    : [];
  const trustedEntitlement = entitlementRows.some(
    (entitlement) =>
      entitlement.status === "active" &&
      (entitlement.validUntil === undefined || entitlement.validUntil > now)
  );

  const decision = decideCourseContentAccess({
    authenticated: true,
    userRole: user?.role ?? null,
    hasEnrollment: enrollment !== null,
    hasTrustedEntitlement: trustedEntitlement,
  });
  const error = courseDecisionError(decision);
  if (error) throw new Error(error);
  if (!user) throw new Error(AUTHORIZATION_ERRORS.userRecordRequired);
  return user;
}

export async function requireLessonCourseAccess(
  ctx: DatabaseCtx,
  lessonId: Id<"lessons">,
  courseId: Id<"courses">
) {
  const lesson = await ctx.db.get(lessonId);
  if (!lesson) throw new Error("LESSON_NOT_FOUND");
  if (lesson.courseId !== courseId) {
    throw new Error("LESSON_COURSE_MISMATCH");
  }
  const user = await requireCourseContentAccess(ctx, courseId);
  return { user, lesson };
}
