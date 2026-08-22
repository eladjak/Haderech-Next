import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (path: string) => readFileSync(join(root, path), "utf8");

describe("community moderation wiring", () => {
  const member = read("convex/communityModeration.ts");
  const admin = read("convex/adminCommunityModeration.ts");
  const schema = read("convex/schema.ts");
  const privacy = read("convex/lib/privacyExport.ts");
  const community = read("convex/community.ts");
  const forum = read("convex/forum.ts");

  it("keeps every member moderation operation behind community access", () => {
    const exportedOperations = member.match(/export const \w+ = (?:query|mutation)\(/g) ?? [];
    expect(exportedOperations.length).toBe(6);
    expect(member.match(/requireCommunityAccess\(ctx\)/g)?.length).toBe(
      exportedOperations.length,
    );
  });

  it("keeps every moderation queue operation admin-only", () => {
    const exportedOperations = admin.match(/export const \w+ = (?:query|mutation)\(/g) ?? [];
    expect(exportedOperations.length).toBeGreaterThanOrEqual(4);
    expect(admin.match(/requireAdmin\(ctx\)/g)?.length).toBe(
      exportedOperations.length,
    );
  });

  it("has target existence, idempotency, rate-cap, and ownership controls", () => {
    expect(member).toContain("resolveTarget");
    expect(member).toContain('withIndex("by_reporter_target"');
    expect(member).toContain('withIndex("by_reporter_created"');
    expect(member).toContain("REPORT_RATE_CAP = 8");
    expect(member).toContain("targetExcerptSnapshot");
    expect(member).toContain("safeEvidenceSnapshot");
    expect(member).toContain("blockTargetError");
    expect(member).toContain("appealError");
  });

  it("does not expose arbitrary user reporting or blocking", () => {
    expect(member).not.toContain('v.literal("user")');
    expect(member).not.toContain('targetKey: `user:');
    expect(member).toContain("const context = await resolveTarget(ctx, args)");
  });

  it("models human triage without an automatic sanction path", () => {
    expect(admin).toContain("requireAdmin");
    expect(admin).toContain("appealable: false");
    expect(admin).not.toMatch(/openai|anthropic|gemini|grok|generateText|chatCompletion/i);
    expect(admin).not.toMatch(/banUser|suspendUser|deleteUser/);
  });

  it("filters blocked authors on both community read models", () => {
    for (const source of [community, forum]) {
      expect(source).toContain("blockedUserIdsFor");
      expect(source).toContain("blockedUserIds.has");
    }
  });

  it("uses bounded overfetch and validates the parent before forum replies", () => {
    expect(community).toContain("const scanLimit = Math.min(limit * 3, 300)");
    expect(forum).toContain("const scanLimit = Math.min(limit * 3, 300)");
    expect(forum).toContain("const post = await ctx.db.get(args.postId)");
    expect(forum).toContain("return []");
  });

  it("defaults the admin queue to actionable states with deterministic merge", () => {
    expect(admin).toContain('q.eq("status", "open")');
    expect(admin).toContain('q.eq("status", "under_review")');
    expect(admin).toContain("mergeActionableReportQueue");
  });

  it("guards and de-duplicates appeal status transitions", () => {
    expect(admin).toContain("canTransitionAppeal");
    expect(admin).toContain("appeal.status === args.status");
  });

  it("adds only dedicated moderation stores and no community entitlement writer", () => {
    for (const table of [
      "communityReports",
      "communityBlocks",
      "communityModerationEvents",
      "communityAppeals",
    ]) {
      expect(schema).toContain(`${table}: defineTable`);
    }
    expect(member).not.toMatch(/insert\("communityEntitlements"/);
    expect(admin).not.toMatch(/insert\("communityEntitlements"/);
  });

  it("exports only member-safe moderation projections", () => {
    const projectionStart = privacy.indexOf("communityReports: communityReports.map");
    expect(projectionStart).toBeGreaterThan(-1);
    const projection = privacy.slice(projectionStart);
    expect(projection).not.toContain("internalModeratorNote:");
    expect(projection).not.toContain("reporterUserId:");
    expect(projection).not.toContain("actorAdminUserId:");
  });
});
