import type { Id } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";

export async function blockedUserIdsFor(
  ctx: QueryCtx,
  blockerUserId: Id<"users">,
): Promise<Set<string>> {
  const rows = await ctx.db
    .query("communityBlocks")
    .withIndex("by_blocker_status", (q) =>
      q.eq("blockerUserId", blockerUserId).eq("status", "active"),
    )
    .collect();
  return new Set(rows.map((row) => String(row.blockedUserId)));
}
