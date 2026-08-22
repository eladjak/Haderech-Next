import { mutation, query, type MutationCtx } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { requireCommunityAccess } from "./lib/communityAccessGuard";
import {
  appealError,
  blockTargetError,
  reportTargetError,
  safeEvidenceSnapshot,
  selectActiveDuplicate,
} from "./lib/communityModerationPolicy";

const REPORT_RATE_CAP = 8;
const REPORT_WINDOW_MS = 24 * 60 * 60 * 1000;

async function resolveTarget(
  ctx: MutationCtx,
  args: {
    targetType: "topic" | "reply";
    topicId?: Id<"communityTopics">;
    replyId?: Id<"communityReplies">;
  },
) {
  if (
    args.targetType === "topic" &&
    args.topicId &&
    !args.replyId
  ) {
    const topic = await ctx.db.get(args.topicId);
    return topic
      ? {
          targetKey: `topic:${args.topicId}`,
          subjectUserId: topic.userId,
          topicId: args.topicId,
          targetTitleSnapshot: safeEvidenceSnapshot(topic.title, 160),
          targetExcerptSnapshot: safeEvidenceSnapshot(topic.content, 500),
        }
      : null;
  }
  if (
    args.targetType === "reply" &&
    args.replyId &&
    !args.topicId
  ) {
    const reply = await ctx.db.get(args.replyId);
    const topic = reply ? await ctx.db.get(reply.topicId) : null;
    return reply && topic
      ? {
          targetKey: `reply:${args.replyId}`,
          subjectUserId: reply.userId,
          topicId: reply.topicId,
          replyId: args.replyId,
          targetTitleSnapshot: safeEvidenceSnapshot(topic.title, 160),
          targetExcerptSnapshot: safeEvidenceSnapshot(reply.content, 500),
        }
      : null;
  }
  return null;
}

export const reportTarget = mutation({
  args: {
    targetType: v.union(v.literal("topic"), v.literal("reply")),
    topicId: v.optional(v.id("communityTopics")),
    replyId: v.optional(v.id("communityReplies")),
    reason: v.union(
      v.literal("harassment"),
      v.literal("privacy"),
      v.literal("spam"),
      v.literal("unsafe_content"),
      v.literal("other"),
    ),
    details: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const reporter = await requireCommunityAccess(ctx);
    const target = await resolveTarget(ctx, args);
    const details = args.details?.trim();
    if (details && details.length > 1500) {
      throw new Error("COMMUNITY_REPORT_DETAILS_TOO_LONG");
    }

    if (target) {
      const existingRows = await ctx.db
        .query("communityReports")
        .withIndex("by_reporter_target", (q) =>
          q
            .eq("reporterUserId", reporter._id)
            .eq("targetKey", target.targetKey),
        )
        .collect();
      const existing = selectActiveDuplicate(existingRows);
      if (existing) return { reportId: existing._id, duplicate: true };
    }

    const since = Date.now() - REPORT_WINDOW_MS;
    const recent = await ctx.db
      .query("communityReports")
      .withIndex("by_reporter_created", (q) =>
        q.eq("reporterUserId", reporter._id).gte("createdAt", since),
      )
      .take(REPORT_RATE_CAP);
    const error = reportTargetError({
      reporterUserId: String(reporter._id),
      subjectUserId: target ? String(target.subjectUserId) : "missing",
      targetExists: target !== null,
      reportsInWindow: recent.length,
      rateCap: REPORT_RATE_CAP,
    });
    if (error || !target) throw new Error(error ?? "COMMUNITY_REPORT_TARGET_INVALID");

    const now = Date.now();
    const reportId = await ctx.db.insert("communityReports", {
      reporterUserId: reporter._id,
      subjectUserId: target.subjectUserId,
      targetType: args.targetType,
      targetKey: target.targetKey,
      ...(target.topicId ? { topicId: target.topicId } : {}),
      ...(target.replyId ? { replyId: target.replyId } : {}),
      targetTitleSnapshot: target.targetTitleSnapshot,
      targetExcerptSnapshot: target.targetExcerptSnapshot,
      reason: args.reason,
      ...(details ? { details } : {}),
      status: "open",
      createdAt: now,
      updatedAt: now,
    });
    return { reportId, duplicate: false };
  },
});

export const blockUser = mutation({
  args: {
    targetType: v.union(v.literal("topic"), v.literal("reply")),
    topicId: v.optional(v.id("communityTopics")),
    replyId: v.optional(v.id("communityReplies")),
  },
  handler: async (ctx, args) => {
    const blocker = await requireCommunityAccess(ctx);
    const context = await resolveTarget(ctx, args);
    const target = context ? await ctx.db.get(context.subjectUserId) : null;
    if (!target) throw new Error("COMMUNITY_BLOCK_TARGET_INVALID");
    const error = blockTargetError(String(blocker._id), String(target._id));
    if (error) throw new Error(error);

    const existing = await ctx.db
      .query("communityBlocks")
      .withIndex("by_blocker_blocked", (q) =>
        q
          .eq("blockerUserId", blocker._id)
          .eq("blockedUserId", target._id),
      )
      .unique();
    const now = Date.now();
    if (existing) {
      if (existing.status !== "active") {
        await ctx.db.patch(existing._id, {
          status: "active",
          updatedAt: now,
          releasedAt: undefined,
        });
      }
      return { blocked: true, duplicate: existing.status === "active" };
    }
    await ctx.db.insert("communityBlocks", {
      blockerUserId: blocker._id,
      blockedUserId: target._id,
      status: "active",
      createdAt: now,
      updatedAt: now,
    });
    return { blocked: true, duplicate: false };
  },
});

export const unblockUser = mutation({
  args: { targetUserId: v.id("users") },
  handler: async (ctx, args) => {
    const blocker = await requireCommunityAccess(ctx);
    const existing = await ctx.db
      .query("communityBlocks")
      .withIndex("by_blocker_blocked", (q) =>
        q
          .eq("blockerUserId", blocker._id)
          .eq("blockedUserId", args.targetUserId),
      )
      .unique();
    if (!existing || existing.status !== "active") return { blocked: false };
    const now = Date.now();
    await ctx.db.patch(existing._id, {
      status: "released",
      releasedAt: now,
      updatedAt: now,
    });
    return { blocked: false };
  },
});

export const listMyBlocks = query({
  args: {},
  handler: async (ctx) => {
    const blocker = await requireCommunityAccess(ctx);
    const blocks = await ctx.db
      .query("communityBlocks")
      .withIndex("by_blocker_status", (q) =>
        q.eq("blockerUserId", blocker._id).eq("status", "active"),
      )
      .collect();
    return Promise.all(
      blocks.map(async (block) => {
        const blockedUser = await ctx.db.get(block.blockedUserId);
        return {
          blockedUserId: block.blockedUserId,
          displayName: blockedUser?.name ?? "משתמש/ת בקהילה",
          blockedAt: block.createdAt,
        };
      }),
    );
  },
});

export const getAppealableActions = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireCommunityAccess(ctx);
    const events = await ctx.db
      .query("communityModerationEvents")
      .withIndex("by_subject", (q) => q.eq("subjectUserId", user._id))
      .collect();
    return events
      .filter((event) => event.appealable)
      .map((event) => ({
        moderationEventId: event._id,
        eventType: event.eventType,
        createdAt: event.createdAt,
      }));
  },
});

export const submitAppeal = mutation({
  args: {
    moderationEventId: v.id("communityModerationEvents"),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const requester = await requireCommunityAccess(ctx);
    const event = await ctx.db.get(args.moderationEventId);
    if (!event) throw new Error("COMMUNITY_APPEAL_NOT_AVAILABLE");
    const error = appealError({
      requesterUserId: String(requester._id),
      subjectUserId: String(event.subjectUserId),
      appealable: event.appealable,
    });
    if (error) throw new Error(error);
    const reason = args.reason.trim();
    if (!reason || reason.length > 2000) {
      throw new Error("COMMUNITY_APPEAL_REASON_INVALID");
    }
    const existing = await ctx.db
      .query("communityAppeals")
      .withIndex("by_requester_event", (q) =>
        q
          .eq("requesterUserId", requester._id)
          .eq("moderationEventId", event._id),
      )
      .unique();
    if (existing) return { appealId: existing._id, duplicate: true };
    const now = Date.now();
    const appealId = await ctx.db.insert("communityAppeals", {
      requesterUserId: requester._id,
      moderationEventId: event._id,
      reason,
      status: "submitted",
      createdAt: now,
      updatedAt: now,
    });
    return { appealId, duplicate: false };
  },
});
