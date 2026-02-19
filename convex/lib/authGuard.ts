import { QueryCtx, MutationCtx } from "../_generated/server";

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
