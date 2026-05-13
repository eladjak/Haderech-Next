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
 * Returns the current authenticated user's document.
 * Throws if not authenticated or not in DB.
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
 * Verifies that the current user matches the requested userId, or is admin.
 * Prevents impersonation when an endpoint takes a userId as argument.
 * Returns the current user document.
 */
export async function requireSelfOrAdmin(
  ctx: QueryCtx | MutationCtx,
  requestedUserId: Id<"users">
) {
  const user = await requireUser(ctx);
  if (user._id !== requestedUserId && user.role !== "admin") {
    throw new Error("Forbidden: cannot access another user's data");
  }
  return user;
}
