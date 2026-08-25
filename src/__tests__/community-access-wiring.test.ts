import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (relative: string) =>
  fs.readFileSync(path.join(root, relative), "utf8");

const publicModules = [
  "convex/community.ts",
  "convex/forum.ts",
  "convex/leaderboard.ts",
] as const;

function exportedHandlers(source: string) {
  const matches = [...source.matchAll(/^export const (\w+) = (?:query|mutation)\(\{/gmu)];
  return matches.map((match, index) => ({
    name: match[1],
    body: source.slice(
      match.index,
      matches[index + 1]?.index ?? source.length,
    ),
  }));
}

function listFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? listFiles(full) : [full];
  });
}

describe("community access server wiring", () => {
  for (const relative of publicModules) {
    it(`gates every exported read/write in ${relative}`, () => {
      const handlers = exportedHandlers(read(relative));
      expect(handlers.length).toBeGreaterThan(0);
      for (const handler of handlers.filter(
        (handler) =>
          !(relative === "convex/community.ts" && handler.name === "getAccessStatus"),
      )) {
        expect(handler.body, `${relative}:${handler.name}`).toContain(
          "requireCommunityAccess(ctx)",
        );
      }
    });
  }

  it("uses only the dedicated community entitlement at the runtime boundary", () => {
    const guard = read("convex/lib/communityAccessGuard.ts");
    expect(guard).toContain('.query("communityEntitlements")');
    expect(guard).not.toContain('query("courseEntitlements")');
    expect(guard).not.toContain('query("enrollments")');
  });

  it("exposes only a learner-safe access status DTO", () => {
    const community = read("convex/community.ts");
    const status = exportedHandlers(community).find(
      (handler) => handler.name === "getAccessStatus",
    )?.body;
    expect(status).toContain("readCommunityAccess(ctx)");
    expect(status).toContain("canAccess");
    expect(status).toContain('"preparing"');
    expect(status).not.toMatch(/sourceReference|grantedBy|accessBasis|userRole/u);
  });

  it("has no application grant writer", () => {
    const convexFiles = listFiles(path.join(root, "convex")).filter((file) =>
      /\.(?:ts|tsx)$/u.test(file),
    );
    const writerPattern =
      /(?:insert|patch|replace|delete)\s*\(\s*["']communityEntitlements["']/u;
    for (const file of convexFiles) {
      expect(read(path.relative(root, file)), path.relative(root, file)).not.toMatch(
        writerPattern,
      );
    }
  });

  it("maps the new table into privacy export without source references", () => {
    const schema = read("convex/schema.ts");
    const privacyPolicy = read("convex/lib/privacyPolicy.ts");
    const privacyExport = read("convex/lib/privacyExport.ts");
    expect(schema).toContain("communityEntitlements: defineTable");
    expect(privacyPolicy).toContain('table: "communityEntitlements"');
    expect(privacyPolicy).toContain('category: "communityEntitlements"');
    expect(privacyExport).toContain('.query("communityEntitlements")');
    expect(privacyExport).toContain("communityEntitlements.map");

    const projection = privacyExport.slice(
      privacyExport.indexOf("communityEntitlements: communityEntitlements.map"),
      privacyExport.indexOf("dailyChallengeCompletions,"),
    );
    expect(projection).not.toContain("sourceReference");
    expect(projection).not.toContain("grantedBy");
  });
});
