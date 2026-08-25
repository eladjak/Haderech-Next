import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./lib/authGuard";
import {
  COMMUNITY_MODERATION_ERRORS,
  canTransitionAppeal,
  canTransitionReport,
  mergeActionableReportQueue,
} from "./lib/communityModerationPolicy";

const reportStatus = v.union(
  v.literal("open"),
  v.literal("under_review"),
  v.literal("resolved_no_action"),
  v.literal("dismissed"),
);

export const listReportQueue = query({
  args: { status: v.optional(reportStatus), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const limit = Math.min(Math.max(args.limit ?? 100, 1), 200);
    const reports = args.status
      ? await ctx.db
          .query("communityReports")
          .withIndex("by_status_created", (q) => q.eq("status", args.status!))
          .order("asc")
          .take(limit)
      : mergeActionableReportQueue(
          (
            await Promise.all([
            ctx.db
              .query("communityReports")
              .withIndex("by_status_created", (q) => q.eq("status", "open"))
              .order("asc")
              .take(limit),
            ctx.db
              .query("communityReports")
              .withIndex("by_status_created", (q) =>
                q.eq("status", "under_review"),
              )
              .order("asc")
              .take(limit),
            ])
          ).flat(),
          limit,
        );
    return Promise.all(
      reports.map(async (report) => {
        const [reporter, subject] = await Promise.all([
          ctx.db.get(report.reporterUserId),
          ctx.db.get(report.subjectUserId),
        ]);
        return {
          ...report,
          reporterName: reporter?.name ?? reporter?.email ?? "משתמש",
          subjectName: subject?.name ?? subject?.email ?? "משתמש",
        };
      }),
    );
  },
});

export const updateReportStatus = mutation({
  args: {
    reportId: v.id("communityReports"),
    status: reportStatus,
    internalNote: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const report = await ctx.db.get(args.reportId);
    if (!report) throw new Error("COMMUNITY_REPORT_NOT_FOUND");
    if (report.status === args.status) {
      return { reportId: report._id, unchanged: true };
    }
    if (!canTransitionReport(report.status, args.status)) {
      throw new Error(COMMUNITY_MODERATION_ERRORS.transitionInvalid);
    }
    const note = args.internalNote?.trim();
    if (note && note.length > 3000) {
      throw new Error("COMMUNITY_MODERATOR_NOTE_TOO_LONG");
    }
    const eventType =
      args.status === "under_review"
        ? ("report_under_review" as const)
        : args.status === "dismissed"
          ? ("report_dismissed" as const)
          : args.status === "resolved_no_action"
            ? ("report_resolved_no_action" as const)
            : null;
    if (!eventType) return { reportId: report._id, unchanged: true };
    const now = Date.now();
    await ctx.db.patch(report._id, {
      status: args.status,
      ...(note ? { internalModeratorNote: note } : {}),
      updatedAt: now,
    });
    const eventId = await ctx.db.insert("communityModerationEvents", {
      actorAdminUserId: admin._id,
      subjectUserId: report.subjectUserId,
      reportId: report._id,
      eventType,
      // Triage and no-action resolution are not sanctions. Future sanctions
      // require a separate owner-approved model before they can be appealed.
      appealable: false,
      ...(note ? { internalNote: note } : {}),
      createdAt: now,
    });
    return { reportId: report._id, eventId, unchanged: false };
  },
});

export const listAppealQueue = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const limit = Math.min(Math.max(args.limit ?? 100, 1), 200);
    return await ctx.db
      .query("communityAppeals")
      .withIndex("by_status_created", (q) => q.eq("status", "submitted"))
      .order("asc")
      .take(limit);
  },
});

export const updateAppealStatus = mutation({
  args: {
    appealId: v.id("communityAppeals"),
    status: v.union(
      v.literal("under_review"),
      v.literal("resolved"),
      v.literal("dismissed"),
    ),
    internalNote: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const appeal = await ctx.db.get(args.appealId);
    if (!appeal) throw new Error("COMMUNITY_APPEAL_NOT_FOUND");
    if (appeal.status === args.status) {
      return { appealId: appeal._id, unchanged: true };
    }
    if (!canTransitionAppeal(appeal.status, args.status)) {
      throw new Error(COMMUNITY_MODERATION_ERRORS.transitionInvalid);
    }
    const note = args.internalNote?.trim();
    if (note && note.length > 3000) {
      throw new Error("COMMUNITY_MODERATOR_NOTE_TOO_LONG");
    }
    const event = await ctx.db.get(appeal.moderationEventId);
    if (!event || event.subjectUserId !== appeal.requesterUserId) {
      throw new Error(COMMUNITY_MODERATION_ERRORS.appealNotOwned);
    }
    const now = Date.now();
    await ctx.db.patch(appeal._id, {
      status: args.status,
      ...(note ? { internalModeratorNote: note } : {}),
      updatedAt: now,
    });
    const eventType =
      args.status === "under_review"
        ? ("appeal_under_review" as const)
        : args.status === "resolved"
          ? ("appeal_resolved" as const)
          : ("appeal_dismissed" as const);
    const eventId = await ctx.db.insert("communityModerationEvents", {
      actorAdminUserId: admin._id,
      subjectUserId: appeal.requesterUserId,
      appealId: appeal._id,
      eventType,
      appealable: false,
      ...(note ? { internalNote: note } : {}),
      createdAt: now,
    });
    return { appealId: appeal._id, eventId, unchanged: false };
  },
});
