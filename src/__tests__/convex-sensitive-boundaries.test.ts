import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const convexRoot = path.resolve(process.cwd(), "convex");

function readConvex(file: string): string {
  return fs.readFileSync(path.join(convexRoot, file), "utf8");
}

function exportedFunction(file: string, name: string): string {
  const source = readConvex(file);
  const start = source.indexOf(`export const ${name} =`);
  expect(start, `${file}:${name} must exist`).toBeGreaterThanOrEqual(0);
  const next = source.indexOf("\nexport const ", start + 1);
  return source.slice(start, next === -1 ? source.length : next);
}

describe("sensitive Convex read boundaries", () => {
  const guardedReads: Array<[string, string, string]> = [
    ["adminCommunity.ts", "listAllTopics", "requireAdmin(ctx)"],
    ["adminCommunity.ts", "getCommunityStats", "requireAdmin(ctx)"],
    ["comments.ts", "listByLesson", "requireCourseContentAccess(ctx"],
    ["comments.ts", "countByLesson", "requireCourseContentAccess(ctx"],
    ["community.ts", "listTopics", "requireUser(ctx)"],
    ["community.ts", "getTopic", "requireUser(ctx)"],
    ["forum.ts", "listPosts", "requireUser(ctx)"],
    ["forum.ts", "getPost", "requireUser(ctx)"],
    ["forum.ts", "listReplies", "requireUser(ctx)"],
    ["forum.ts", "getForumStats", "requireUser(ctx)"],
    ["leaderboard.ts", "getWeeklyLeaderboard", "requireUser(ctx)"],
    ["leaderboard.ts", "getMonthlyLeaderboard", "requireUser(ctx)"],
    ["leaderboard.ts", "getAllTimeLeaderboard", "requireUser(ctx)"],
    ["mentoring.ts", "listMentors", "requireUser(ctx)"],
    ["mentoring.ts", "getMentor", "requireUser(ctx)"],
    ["reviews.ts", "getCourseReviews", "requireCourseContentAccess(ctx"],
    ["reviews.ts", "getReviewsByCourse", "requireCourseContentAccess(ctx"],
    ["reviews.ts", "getReviewStats", "requireCourseContentAccess(ctx"],
    ["reviews.ts", "getCourseRating", "requireCourseContentAccess(ctx"],
  ];

  it.each(guardedReads)("%s:%s includes %s", (file, name, guard) => {
    expect(exportedFunction(file, name)).toContain(guard);
  });

  it("does not serialize mentor account email from directory reads", () => {
    expect(exportedFunction("mentoring.ts", "listMentors")).not.toContain(
      "userEmail"
    );
    expect(exportedFunction("mentoring.ts", "getMentor")).not.toContain(
      "userEmail"
    );
  });

  it.each(["getFeaturedTestimonials", "getGlobalStats"])(
    "reviews.ts:%s fails closed before any public review read",
    (name) => {
      const fn = exportedFunction("reviews.ts", name);
      const gate = fn.indexOf("if (!VERIFIED_PUBLIC_TESTIMONIALS_AVAILABLE)");
      const firstDatabaseRead = fn.indexOf("ctx.db");

      expect(gate).toBeGreaterThanOrEqual(0);
      expect(firstDatabaseRead).toBeGreaterThan(gate);
    }
  );

  it("binds new comments to a proven lesson/course context", () => {
    const create = exportedFunction("comments.ts", "create");
    expect(create).toContain("requireLessonCourseAccess(");
    expect(create).toContain("PARENT_COMMENT_CONTEXT_MISMATCH");
  });

  it("derives contact identity from auth instead of trusting caller metadata", () => {
    const submit = exportedFunction("contact.ts", "submitMessage");
    expect(submit).not.toContain("userId: v.optional");
    expect(submit).not.toContain("args.userId");
    expect(submit).toContain("ctx.auth.getUserIdentity()");
    expect(submit).toContain("userId: identity?.subject");
  });
});
