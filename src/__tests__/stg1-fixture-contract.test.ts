import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const read = (relative: string) =>
  fs.readFileSync(path.resolve(process.cwd(), relative), "utf8");

describe("STG-1 fixture containment contract", () => {
  const fixtureSource = read("convex/stg1Fixtures.ts");
  const runnerSource = read("scripts/stg1-fixtures.mjs");
  const overlayRunner = read("scripts/stg1-access-overlay.mjs");
  const overlayTemplate = read(
    "ops/stg1-access-overlay/stg1AccessWriter.template",
  );

  it("exposes fixture operations only as internal Convex functions", () => {
    expect(fixtureSource).toContain("internalQuery");
    expect(fixtureSource).toContain("internalMutation");
    expect(fixtureSource).not.toMatch(/=\s*query\s*\(/u);
    expect(fixtureSource).not.toMatch(/=\s*mutation\s*\(/u);
  });

  it("requires target-scoped environment predicates and a fresh plan hash", () => {
    expect(fixtureSource).toContain("STG1_FIXTURES_ENABLED");
    expect(fixtureSource).toContain("STG1_DEPLOYMENT_NAME");
    expect(fixtureSource).toContain("SEED_ENABLED");
    expect(fixtureSource).toContain("STALE_PLAN_HASH");
    expect(runnerSource).toContain('"--deployment-name"');
    expect(runnerSource).not.toMatch(/"--deployment",/u);
    expect(runnerSource).toContain('require.resolve("convex/package.json")');
    expect(runnerSource).toContain("spawnSync(process.execPath");
    expect(runnerSource).not.toContain('"npx.cmd"');
    expect(overlayRunner).toContain('"--deployment-name"');
    expect(overlayRunner).not.toMatch(/"--deployment",/u);
    expect(runnerSource).toContain("STG1_TARGET.deploymentName");
    expect(runnerSource).not.toContain('command.push("--push")');
  });

  it("keeps grant writers out of the application release tree", () => {
    expect(fixtureSource).not.toMatch(
      /(?:insert|patch|replace|delete)\s*\(\s*["']communityEntitlements["']/u,
    );
    expect(fixtureSource).not.toContain('insert("courseEntitlements"');
    expect(overlayTemplate).toContain('insert("communityEntitlements"');
    expect(overlayTemplate).toContain('insert("courseEntitlements"');
  });

  it("contains access through a measured ephemeral overlay lifecycle", () => {
    expect(overlayTemplate).not.toContain("ctx.db.delete(");
    expect(overlayTemplate).toContain('status: "revoked"');
    expect(overlayTemplate).toContain('role: "student"');
    expect(overlayTemplate).toContain("deletes: 0");
    expect(overlayRunner).toContain("STG1_OVERLAY_ALREADY_PRESENT_BEFORE_UPLOAD");
    expect(overlayRunner).toContain("STG1_OVERLAY_STILL_VISIBLE_AFTER_RESTORE");
    expect(overlayRunner).toContain("STG1_OVERLAY_RESTORE_FAILED");
  });

  it("keeps actual identity bindings in the ignored local directory", () => {
    expect(read(".gitignore")).toContain("/.stg1/");
    expect(runnerSource).toContain("STG1_IDENTITY_MAP_MUST_BE_UNDER_LOCAL_IGNORED_DIRECTORY");
    expect(read("docs/staging/stg1-identity-manifest.json")).not.toContain(
      '"clerkId"',
    );
  });
});
