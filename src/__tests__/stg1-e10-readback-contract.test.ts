import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { STG1_E07_EXPECTED_CHECK_IDS } from "../../scripts/lib/stg1-final-audit.mjs";
import {
  extractJsonObjects,
  findLastJsonObject,
  parseConvexEnvironmentNames,
  validatePhaseArtifact,
} from "../../scripts/lib/stg1-e10-readback-plan.mjs";

describe("STG-1 E10 read-only collector contract", () => {
  it("extracts concatenated JSON without being confused by braces in strings", () => {
    const source = [
      "tool prefix",
      JSON.stringify({ mode: "guard", nested: { text: "a { brace } value" } }),
      "another prefix",
      JSON.stringify({ mode: "result", status: "PASS" }),
    ].join("\n");
    expect(extractJsonObjects(source)).toHaveLength(2);
    expect(
      findLastJsonObject(
        source,
        (value: { mode?: string }) => value.mode === "result",
      ),
    ).toEqual({
      mode: "result",
      status: "PASS",
    });
  });

  it("uses a named env positive control while discarding all values", () => {
    const names = parseConvexEnvironmentNames(
      "CLERK_JWT_ISSUER_DOMAIN=https://issuer.example\nOTHER=value\nnoise\n",
    );
    expect([...names].sort()).toEqual(["CLERK_JWT_ISSUER_DOMAIN", "OTHER"]);
    expect(JSON.stringify([...names])).not.toContain("issuer.example");
  });

  it("recognizes exact E03 and E04 execution evidence", () => {
    expect(
      validatePhaseArtifact(
        "E03",
        [
          "# E03 execution evidence",
          "STG1_LEGACY_COURSE:STALE_PLAN_HASH",
          "`status`: `seeded`",
          "75 required lessons, 0 optional lessons",
          "There are no tokens here yet.",
        ].join("\n"),
      ),
    ).toBe(true);
    expect(
      validatePhaseArtifact(
        "E04",
        [
          "## Execution result — completed",
          "RECEIVING_PRACTICE_MIGRATION:STALE_PLAN_HASH",
          "Apply result: `success: true`, `status: applied`",
          "75 required, 1 optional, 76 total",
          "No Production, Vercel, Clerk-user, payment, or public action occurred",
        ].join("\n"),
      ),
    ).toBe(true);
  });

  it("recognizes only exact E05-E09 machine evidence", () => {
    expect(
      validatePhaseArtifact(
        "E05",
        JSON.stringify({
          success: true,
          status: "seeded",
          insertedUsers: 7,
          providerIdsIncludedInResult: false,
          personalDataIncludedInResult: false,
        }),
      ),
    ).toBe(true);
    for (const [id, mode, postcheck] of [
      ["E06", "apply-access", "already_applied"],
      ["E08", "contain-access", "already_contained"],
    ]) {
      expect(
        validatePhaseArtifact(
          id,
          JSON.stringify({
            mode,
            overlayObservedBefore: false,
            overlayObservedDuring: true,
            overlayObservedAfter: false,
            dataPostcheck: postcheck,
            baseRestored: true,
            providerIdsIncludedInResult: false,
            personalDataIncludedInResult: false,
          }),
        ),
      ).toBe(true);
    }
    expect(
      validatePhaseArtifact(
        "E07",
        JSON.stringify({
          evidenceId: "E07",
          checks: STG1_E07_EXPECTED_CHECK_IDS.map((id) => ({ id, status: "PASS" })),
          summary: { failed: 0, terminalFailure: false },
        }),
      ),
    ).toBe(true);
    expect(
      validatePhaseArtifact(
        "E09",
        JSON.stringify({
          sameVersionApplyBlocked: true,
          contained: true,
          markerState: "rolled_back",
          requiredLessonCount: 75,
          optionalLessonCount: 0,
          totalLessonCount: 75,
        }),
      ),
    ).toBe(true);
  });

  it("rejects near-miss phase evidence", () => {
    expect(
      validatePhaseArtifact(
        "E09",
        JSON.stringify({
          sameVersionApplyBlocked: false,
          contained: true,
          markerState: "rolled_back",
          requiredLessonCount: 75,
          optionalLessonCount: 0,
          totalLessonCount: 75,
        }),
      ),
    ).toBe(false);
  });

  it("contains only read operations against providers and Git", () => {
    const source = fs.readFileSync(
      path.resolve(process.cwd(), "scripts/stg1-e10-readback.mjs"),
      "utf8",
    );
    for (const forbidden of [
      '"--apply"',
      '"--rollback"',
      '"--create"',
      '"--ban"',
      '"deploy"',
      '"push"',
      '"alias",\n      "set"',
      '"env",\n    "set"',
    ]) {
      expect(source).not.toContain(forbidden);
    }
    expect(source).toContain('"--inspect-state"');
    expect(source).toContain('"--preview-containment"');
    expect(source).toContain('"--verify-rollback"');
    expect(source).toContain('"--verify"');
    expect(source).toContain("ConvexHttpClient");
    expect(source).toContain("stg1AccessWriter:containSyntheticAccess");
    expect(source).not.toContain('"function-spec"');
    expect(source).toContain('"ls-remote"');
  });

  it("rejects the Production CLI arm before reading any artifact", () => {
    const result = spawnSync(
      process.execPath,
      [
        path.resolve(process.cwd(), "scripts/stg1-e10-readback.mjs"),
        "--prod",
        "--confirm",
        "READBACK_STG1_E10_CONTENT_DOG_757",
      ],
      { cwd: process.cwd(), encoding: "utf8" },
    );
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("STG1_E10:PRODUCTION_FORBIDDEN");
    expect(result.stdout).toBe("");
  });
});
