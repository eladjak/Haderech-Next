import { describe, expect, it } from "vitest";
import {
  COMMUNITY_MODERATION_ERRORS,
  appealError,
  blockTargetError,
  canTransitionAppeal,
  canTransitionReport,
  mergeActionableReportQueue,
  reportTargetError,
  safeEvidenceSnapshot,
  selectActiveDuplicate,
} from "../../convex/lib/communityModerationPolicy";

describe("community moderation policy", () => {
  it("rejects a missing target before considering a report", () => {
    expect(
      reportTargetError({
        reporterUserId: "a",
        subjectUserId: "b",
        targetExists: false,
        reportsInWindow: 0,
        rateCap: 8,
      }),
    ).toBe(COMMUNITY_MODERATION_ERRORS.invalidTarget);
  });

  it("rejects self-reporting", () => {
    expect(
      reportTargetError({
        reporterUserId: "a",
        subjectUserId: "a",
        targetExists: true,
        reportsInWindow: 0,
        rateCap: 8,
      }),
    ).toBe(COMMUNITY_MODERATION_ERRORS.selfReport);
  });

  it("enforces the report cap at the exact boundary", () => {
    const input = {
      reporterUserId: "a",
      subjectUserId: "b",
      targetExists: true,
      rateCap: 8,
    };
    expect(reportTargetError({ ...input, reportsInWindow: 7 })).toBeNull();
    expect(reportTargetError({ ...input, reportsInWindow: 8 })).toBe(
      COMMUNITY_MODERATION_ERRORS.rateLimited,
    );
  });

  it("rejects self-blocking", () => {
    expect(blockTargetError("a", "a")).toBe(
      COMMUNITY_MODERATION_ERRORS.selfBlock,
    );
    expect(blockTargetError("a", "b")).toBeNull();
  });

  it("allows an appeal only for the subject of an explicitly appealable event", () => {
    expect(
      appealError({ requesterUserId: "a", subjectUserId: "b", appealable: true }),
    ).toBe(COMMUNITY_MODERATION_ERRORS.appealNotOwned);
    expect(
      appealError({ requesterUserId: "a", subjectUserId: "a", appealable: false }),
    ).toBe(COMMUNITY_MODERATION_ERRORS.appealNotAvailable);
    expect(
      appealError({ requesterUserId: "a", subjectUserId: "a", appealable: true }),
    ).toBeNull();
  });

  it("does not reopen terminal report decisions", () => {
    expect(canTransitionReport("open", "under_review")).toBe(true);
    expect(canTransitionReport("under_review", "resolved_no_action")).toBe(true);
    expect(canTransitionReport("dismissed", "under_review")).toBe(false);
    expect(canTransitionReport("resolved_no_action", "open")).toBe(false);
  });

  it("makes appeal transitions idempotent but never reopens a terminal appeal", () => {
    expect(canTransitionAppeal("submitted", "under_review")).toBe(true);
    expect(canTransitionAppeal("under_review", "resolved")).toBe(true);
    expect(canTransitionAppeal("resolved", "resolved")).toBe(true);
    expect(canTransitionAppeal("resolved", "under_review")).toBe(false);
    expect(canTransitionAppeal("dismissed", "submitted")).toBe(false);
  });

  it("caps and minimizes immutable evidence snapshots", () => {
    const snapshot = safeEvidenceSnapshot(
      "  reach me at person@example.com or 050-123-4567   hello world  ",
      45,
    );
    expect(snapshot).not.toContain("person@example.com");
    expect(snapshot).not.toContain("050-123-4567");
    expect(snapshot.length).toBeLessThanOrEqual(45);
    expect(snapshot).not.toMatch(/\s{2,}/);
  });

  it("selects only an actionable duplicate", () => {
    expect(selectActiveDuplicate([{ status: "dismissed", id: 1 }])).toBeNull();
    expect(
      selectActiveDuplicate([
        { status: "resolved_no_action", id: 1 },
        { status: "under_review", id: 2 },
      ]),
    ).toEqual({ status: "under_review", id: 2 });
  });

  it("merges only actionable reports oldest-first with a deterministic tie-break", () => {
    const rows = mergeActionableReportQueue(
      [
        { _id: "b", createdAt: 10, status: "open" as const },
        { _id: "terminal", createdAt: 1, status: "dismissed" as const },
        { _id: "a", createdAt: 10, status: "under_review" as const },
        { _id: "old", createdAt: 2, status: "open" as const },
      ],
      2,
    );
    expect(rows.map((row) => row._id)).toEqual(["old", "a"]);
  });
});
