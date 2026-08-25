import { spawnSync } from "node:child_process";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  STG1_E07_EXPECTED_CHECK_IDS,
  STG1_FINAL,
  assertFinalBundleContainsNoSensitiveMaterial,
  evaluateStg1FinalBundle,
} from "../../scripts/lib/stg1-final-audit.mjs";

const commitSha = "b".repeat(40);

function passingBundle() {
  return {
    schemaVersion: 1,
    deploymentName: STG1_FINAL.deploymentName,
    fixtureVersion: STG1_FINAL.fixtureVersion,
    branch: STG1_FINAL.branch,
    commitSha,
    production: {
      convexWrites: 0,
      clerkWrites: 0,
      vercelDeployments: 0,
      messagesOrPublications: 0,
    },
    phaseEvidence: STG1_FINAL.evidenceIds.map((id, index) => ({
      id,
      status: "PASS",
      sha256: String(index + 1).padStart(64, "0"),
      readBack: true,
    })),
    convexFinal: {
      deploymentName: STG1_FINAL.deploymentName,
      fixtureVersion: STG1_FINAL.fixtureVersion,
      backendInspected: true,
      counts: {
        courses: 1,
        canonicalCourses: 1,
        lessons: 75,
        requiredLessons: 75,
        optionalLessons: 0,
        migrationMarkers: 1,
        appliedMigrationMarkers: 0,
        rolledBackMigrationMarkers: 1,
        users: 7,
        admins: 0,
        courseEntitlements: 2,
        activeCourseEntitlements: 0,
        revokedCourseEntitlements: 2,
        communityEntitlements: 2,
        activeCommunityEntitlements: 0,
        revokedCommunityEntitlements: 2,
        simulatorTrialUsage: 0,
        communityTopics: 0,
        communityReplies: 0,
        communityReports: 0,
        communityBlocks: 0,
        communityModerationEvents: 0,
        communityAppeals: 0,
        payments: 0,
        subscriptions: 0,
      },
      contentIncludedInResult: false,
      personalDataIncludedInResult: false,
    },
    containmentFinal: {
      status: "already_contained",
      conflicts: [],
      deploymentName: STG1_FINAL.deploymentName,
      fixtureVersion: STG1_FINAL.fixtureVersion,
      backendInspected: true,
      activeFixtureGrants: 0,
      adminRoleActive: false,
      expectedPostCounts: {
        activeFixtureGrants: 0,
        syntheticAdmins: 0,
        rowsRetainedForAudit: 4,
        usersRetainedAsSyntheticNonPii: 7,
      },
      deletes: 0,
      providerIdsIncludedInResult: false,
      personalDataIncludedInResult: false,
      writes: 0,
    },
    migrationFinal: {
      migrationVersion: "2026-08-23.v1",
      sourceDigest:
        "sha256:160d45adaf1d2c3fd83db048c4e871c0b3653e1ad29d1078029ae280b34fce5a",
      backendInspected: true,
      status: "conflict",
      conflicts: ["MIGRATION_VERSION_ALREADY_ROLLED_BACK"],
      markerState: "rolled_back",
      requiredLessonCount: 75,
      optionalLessonCount: 0,
      totalLessonCount: 75,
      sameVersionApplyBlocked: true,
      contained: true,
      contentIncludedInResult: false,
      documentIdsIncludedInResult: false,
      personalDataIncludedInResult: false,
    },
    clerkFinal: {
      mode: "verify",
      deploymentName: STG1_FINAL.deploymentName,
      fixtureVersion: STG1_FINAL.fixtureVersion,
      clerkEnvironment: "development",
      accountsChecked: 7,
      active: 0,
      banned: 7,
      nonFixtureAccountsUnchanged: 2,
      providerIdsReturned: false,
      personalDataReturned: false,
      writes: 0,
    },
    previewFinal: {
      status: "PASS",
      target: "preview",
      branch: STG1_FINAL.branch,
      commitSha,
      aliasHost: STG1_FINAL.previewHost,
      convexHost: STG1_FINAL.convexHost,
      clerkEnvironment: "development",
      aliasReadback: true,
      healthReadback: true,
      browserRuntimeReadback: true,
      productionWrites: 0,
      secretsReturned: false,
    },
    e07: {
      schemaVersion: 1,
      evidenceId: "E07",
      deploymentName: STG1_FINAL.deploymentName,
      fixtureVersion: STG1_FINAL.fixtureVersion,
      previewHost: STG1_FINAL.previewHost,
      clerkEnvironment: "development",
      browser: "chromium",
      authenticatedIdentities: 7,
      accountsCreatedByMatrix: 0,
      persistentDataWritesByMatrix: 0,
      realAiProviderCalls: 0,
      paymentProviderCalls: 0,
      traces: false,
      screenshots: false,
      providerIdsIncluded: false,
      credentialsIncluded: false,
      personalDataIncluded: false,
      contentIncluded: false,
      checks: STG1_E07_EXPECTED_CHECK_IDS.map((id) => ({ id, status: "PASS" })),
      summary: {
        passed: STG1_E07_EXPECTED_CHECK_IDS.length,
        failed: 0,
        terminalFailure: false,
      },
    },
    overlayApply: {
      mode: "apply-access",
      deploymentName: STG1_FINAL.deploymentName,
      fixtureVersion: STG1_FINAL.fixtureVersion,
      overlayObservedBefore: false,
      overlayObservedDuring: true,
      overlayObservedAfter: false,
      dataPostcheck: "already_applied",
      baseRestored: true,
      providerIdsIncludedInResult: false,
      personalDataIncludedInResult: false,
    },
    overlayContain: {
      mode: "contain-access",
      deploymentName: STG1_FINAL.deploymentName,
      fixtureVersion: STG1_FINAL.fixtureVersion,
      overlayObservedBefore: false,
      overlayObservedDuring: true,
      overlayObservedAfter: false,
      dataPostcheck: "already_contained",
      baseRestored: true,
      providerIdsIncludedInResult: false,
      personalDataIncludedInResult: false,
    },
    providerFinal: {
      deploymentName: STG1_FINAL.deploymentName,
      cloudHost: STG1_FINAL.convexHost,
      functionSpecReadBack: true,
      functionSpecSha256: "c".repeat(64),
      baseFixtureModulePresent: true,
      ephemeralWriterPresent: false,
      revisionMatchedCommittedSource: true,
      backupRecorded: true,
      productionInspectedOrWritten: false,
    },
    gitFinal: {
      branch: STG1_FINAL.branch,
      headSha: commitSha,
      remoteSha: commitSha,
      trackedTreeClean: true,
      codexLocalStateTracked: false,
      stg1LocalStateTracked: false,
      evidenceTracked: false,
      pushReadBack: true,
    },
    cleanup: {
      temporaryConvexDeployKeys: 0,
      seedEnabledPresent: false,
      stg1FixturesEnabledPresent: false,
      stg1DeploymentNamePresent: false,
      ephemeralWriterPresent: false,
      remoteTemporaryDirectories: 0,
      localOverlayTemporaryDirectories: 0,
      localPreviewArchives: 0,
      localSecretFilesOutsideIgnoredStg1: 0,
      accountDeletionCalls: 0,
      broadDatabaseDeletes: 0,
    },
  };
}

describe("STG-1 E10 final adjudicator", () => {
  it("requires the exact 94-check E07 matrix", () => {
    expect(STG1_E07_EXPECTED_CHECK_IDS).toHaveLength(94);
    expect(new Set(STG1_E07_EXPECTED_CHECK_IDS).size).toBe(94);
  });

  it("passes only a complete exact final-state bundle", () => {
    const result = evaluateStg1FinalBundle(passingBundle());
    expect(result.status).toBe("PASS");
    expect(result.summary).toEqual({ passed: 18, failed: 0, total: 18 });
    expect(result.productionTouched).toBe(false);
    expect(result.secretsIncluded).toBe(false);
  });

  it.each([
    ["optional lesson remains", (bundle: ReturnType<typeof passingBundle>) => {
      bundle.convexFinal.counts.optionalLessons = 1;
    }],
    ["one E07 check is missing", (bundle: ReturnType<typeof passingBundle>) => {
      bundle.e07.checks.pop();
      bundle.e07.summary.passed -= 1;
    }],
    ["one Clerk fixture remains active", (bundle: ReturnType<typeof passingBundle>) => {
      bundle.clerkFinal.active = 1;
      bundle.clerkFinal.banned = 6;
    }],
    ["Production was deployed", (bundle: ReturnType<typeof passingBundle>) => {
      bundle.production.vercelDeployments = 1;
    }],
    ["ephemeral writer remains", (bundle: ReturnType<typeof passingBundle>) => {
      bundle.providerFinal.ephemeralWriterPresent = true;
    }],
    ["remote SHA is different", (bundle: ReturnType<typeof passingBundle>) => {
      bundle.gitFinal.remoteSha = "d".repeat(40);
    }],
  ])("fails the counter-arm when %s", (_label, mutate) => {
    const bundle = passingBundle();
    mutate(bundle);
    const result = evaluateStg1FinalBundle(bundle);
    expect(result.status).toBe("FAIL");
    expect(result.summary.failed).toBeGreaterThan(0);
  });

  it("rejects keys, provider IDs and email addresses before adjudication", () => {
    for (const forbidden of [
      { leaked: "sk_test_forbidden" },
      { leaked: "pk_test_forbidden" },
      { leaked: "user_forbidden123" },
      { leaked: "person@example.com" },
      { courseId: "document-identifier" },
    ]) {
      expect(() => assertFinalBundleContainsNoSensitiveMaterial(forbidden)).toThrow(
        "STG1_E10:SENSITIVE_OR_PROVIDER_MATERIAL_IN_BUNDLE",
      );
    }
  });

  it("has a production-negative CLI arm before file access", () => {
    const result = spawnSync(
      process.execPath,
      [
        path.resolve(process.cwd(), "scripts/stg1-final-audit.mjs"),
        "--prod",
        "--confirm",
        "AUDIT_STG1_E10_CONTENT_DOG_757",
      ],
      { cwd: process.cwd(), encoding: "utf8" },
    );
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("STG1_E10:PRODUCTION_FORBIDDEN");
    expect(result.stdout).toBe("");
  });
});
