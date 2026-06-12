import { QueryCtx, MutationCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";

/**
 * Verifies that the current user is authenticated and has admin role.
 * Throws an error if not authenticated or not an admin.
 * Returns the user document for further use.
 */
export async function requireAdmin(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .unique();

  if (!user) {
    throw new Error("User not found in database");
  }

  if (user.role !== "admin") {
    throw new Error("Admin access required");
  }

  return user;
}

/**
 * Verifies that the current user is authenticated.
 * Throws if not authenticated or the user record is missing.
 * Returns the user document.
 */
export async function requireUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .unique();

  if (!user) {
    throw new Error("User not found in database");
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
  if (user._id !== userId && user.role !== "admin") {
    throw new Error("Not authorized to act on behalf of this user");
  }
  return user;
}
