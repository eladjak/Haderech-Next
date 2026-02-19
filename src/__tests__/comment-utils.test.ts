import { describe, it, expect } from "vitest";
import {
  formatCommentTime,
  validateComment,
  countTotalComments,
  countTopLevelComments,
  countUserComments,
  isEdited,
  type CommentRecord,
} from "../lib/comment-utils";

// ─── formatCommentTime ──────────────────────────────────────────────────────

describe("formatCommentTime", () => {
  const now = 1700000000000;

  it("returns 'עכשיו' for less than 60 seconds", () => {
    expect(formatCommentTime(now - 30000, now)).toBe("עכשיו");
  });

  it("returns minutes for < 60 minutes", () => {
    expect(formatCommentTime(now - 5 * 60 * 1000, now)).toBe("לפני 5 דקות");
  });

  it("returns hours for < 24 hours", () => {
    expect(formatCommentTime(now - 3 * 60 * 60 * 1000, now)).toBe(
      "לפני 3 שעות"
    );
  });

  it("returns days for < 7 days", () => {
    expect(formatCommentTime(now - 2 * 24 * 60 * 60 * 1000, now)).toBe(
      "לפני 2 ימים"
    );
  });

  it("returns weeks for < 30 days", () => {
    expect(formatCommentTime(now - 14 * 24 * 60 * 60 * 1000, now)).toBe(
      "לפני 2 שבועות"
    );
  });

  it("returns formatted date for > 30 days", () => {
    const result = formatCommentTime(now - 60 * 24 * 60 * 60 * 1000, now);
    expect(result).toMatch(/\d+/); // contains digits (date format)
  });
});

// ─── validateComment ────────────────────────────────────────────────────────

describe("validateComment", () => {
  it("returns valid for normal content", () => {
    expect(validateComment("תגובה טובה")).toEqual({ valid: true });
  });

  it("returns invalid for empty string", () => {
    expect(validateComment("")).toEqual({
      valid: false,
      error: "תגובה ריקה",
    });
  });

  it("returns invalid for whitespace-only", () => {
    expect(validateComment("   ")).toEqual({
      valid: false,
      error: "תגובה ריקה",
    });
  });

  it("returns invalid for too long content", () => {
    const longContent = "א".repeat(2001);
    expect(validateComment(longContent)).toEqual({
      valid: false,
      error: "תגובה ארוכה מדי (מקסימום 2000 תווים)",
    });
  });

  it("returns valid for exactly 2000 chars", () => {
    const content = "א".repeat(2000);
    expect(validateComment(content)).toEqual({ valid: true });
  });
});

// ─── countTotalComments ─────────────────────────────────────────────────────

describe("countTotalComments", () => {
  const comments: CommentRecord[] = [
    {
      _id: "1",
      userId: "u1",
      content: "hello",
      createdAt: 1000,
    },
    {
      _id: "2",
      userId: "u2",
      content: "reply",
      createdAt: 2000,
      parentId: "1",
    },
    {
      _id: "3",
      userId: "u1",
      content: "another",
      createdAt: 3000,
    },
  ];

  it("counts all comments including replies", () => {
    expect(countTotalComments(comments)).toBe(3);
  });

  it("returns 0 for empty array", () => {
    expect(countTotalComments([])).toBe(0);
  });
});

// ─── countTopLevelComments ──────────────────────────────────────────────────

describe("countTopLevelComments", () => {
  const comments: CommentRecord[] = [
    { _id: "1", userId: "u1", content: "top", createdAt: 1000 },
    {
      _id: "2",
      userId: "u2",
      content: "reply",
      createdAt: 2000,
      parentId: "1",
    },
    { _id: "3", userId: "u1", content: "top2", createdAt: 3000 },
  ];

  it("counts only top-level comments", () => {
    expect(countTopLevelComments(comments)).toBe(2);
  });

  it("returns 0 for empty array", () => {
    expect(countTopLevelComments([])).toBe(0);
  });
});

// ─── countUserComments ──────────────────────────────────────────────────────

describe("countUserComments", () => {
  const comments: CommentRecord[] = [
    { _id: "1", userId: "u1", content: "a", createdAt: 1000 },
    { _id: "2", userId: "u2", content: "b", createdAt: 2000 },
    { _id: "3", userId: "u1", content: "c", createdAt: 3000 },
  ];

  it("counts comments by specific user", () => {
    expect(countUserComments(comments, "u1")).toBe(2);
  });

  it("returns 0 for user with no comments", () => {
    expect(countUserComments(comments, "u99")).toBe(0);
  });
});

// ─── isEdited ───────────────────────────────────────────────────────────────

describe("isEdited", () => {
  it("returns false if updated at same time as created", () => {
    expect(isEdited(1000, 1000)).toBe(false);
  });

  it("returns false if difference is < 1 second", () => {
    expect(isEdited(1000, 1500)).toBe(false);
  });

  it("returns true if difference is > 1 second", () => {
    expect(isEdited(1000, 5000)).toBe(true);
  });
});
