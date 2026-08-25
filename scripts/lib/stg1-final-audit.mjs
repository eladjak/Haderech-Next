export const STG1_FINAL = Object.freeze({
  deploymentName: "content-dog-757",
  fixtureVersion: "stg1-v1",
  branch: "codex/omanut-integration-2026-08-22",
  previewHost: "haderech-preview.vercel.app",
  convexHost: "content-dog-757.convex.cloud",
  aliases: Object.freeze(["U0", "A", "B", "E", "X", "ADMIN", "IMPOSTOR"]),
  evidenceIds: Object.freeze(["E03", "E04", "E05", "E06", "E07", "E08", "E09"]),
});

function expectedE07CheckIds() {
  const ids = [
    "browser.preview.vercel-readback",
    "browser.clerk.development-instance",
    "browser.anon.protected-route-redirect",
    "browser.anon.convex-target",
  ];
  for (const alias of STG1_FINAL.aliases) {
    ids.push(
      `browser.${alias}.ticket-sign-in`,
      `browser.${alias}.dashboard-authenticated`,
      `browser.${alias}.convex-target`,
      `api.${alias}.convex-jwt`,
      `api.${alias}.identity-binding`,
    );
  }
  ids.push(
    "api.course.canonical-public-course",
    "browser.student.admin-denied",
    "browser.admin.admin-allowed",
    "browser.A.community-allowed",
    "browser.B.community-allowed",
    "api.anon.community-safe-status",
    "api.anon.simulator-and-privacy-denied",
    "api.anon.course-content-denied",
  );
  for (const alias of STG1_FINAL.aliases) {
    ids.push(`api.${alias}.community-policy`);
  }
  for (const alias of STG1_FINAL.aliases) {
    ids.push(`api.${alias}.simulator-policy`);
  }
  for (const alias of STG1_FINAL.aliases) {
    ids.push(`api.${alias}.course-policy`);
  }
  for (const alias of STG1_FINAL.aliases) {
    ids.push(`api.${alias}.privacy-self-only`);
  }
  ids.push(
    "api.impostor.cross-user-no-oracle",
    "api.admin.cross-user-authorized",
  );
  for (const alias of ["U0", "A", "B", "E", "X", "IMPOSTOR"]) {
    ids.push(`api.${alias}.admin-denied`);
  }
  ids.push("api.admin.role-positive");
  for (const alias of STG1_FINAL.aliases) {
    ids.push(`api.${alias}.payment-read-model-empty`);
  }
  ids.push(
    "api.payment.checkout-fails-closed",
    "api.payment.admin-counts-zero",
    "browser.payment-webhook-fixed-containment",
  );
  return Object.freeze(ids);
}

export const STG1_E07_EXPECTED_CHECK_IDS = expectedE07CheckIds();

function exactObjectValues(actual, expected) {
  return Object.entries(expected).every(([key, value]) => actual?.[key] === value);
}

function exactStringSet(actual, expected) {
  if (!Array.isArray(actual) || actual.some((value) => typeof value !== "string")) {
    return false;
  }
  const actualSet = new Set(actual);
  const expectedSet = new Set(expected);
  return (
    actual.length === actualSet.size &&
    actualSet.size === expectedSet.size &&
    [...expectedSet].every((value) => actualSet.has(value))
  );
}

function artifactEvidenceIsExact(phaseEvidence) {
  if (!Array.isArray(phaseEvidence)) return false;
  const ids = phaseEvidence.map((entry) => entry?.id);
  if (!exactStringSet(ids, STG1_FINAL.evidenceIds)) return false;
  return phaseEvidence.every(
    (entry) =>
      entry?.status === "PASS" &&
      /^[a-f0-9]{64}$/u.test(entry?.sha256 ?? "") &&
      entry?.readBack === true,
  );
}

function e07IsExact(e07) {
  if (
    e07?.schemaVersion !== 1 ||
    e07?.evidenceId !== "E07" ||
    e07?.deploymentName !== STG1_FINAL.deploymentName ||
    e07?.fixtureVersion !== STG1_FINAL.fixtureVersion ||
    e07?.previewHost !== STG1_FINAL.previewHost ||
    e07?.clerkEnvironment !== "development" ||
    e07?.browser !== "chromium" ||
    e07?.authenticatedIdentities !== 7 ||
    e07?.accountsCreatedByMatrix !== 0 ||
    e07?.persistentDataWritesByMatrix !== 0 ||
    e07?.realAiProviderCalls !== 0 ||
    e07?.paymentProviderCalls !== 0 ||
    e07?.traces !== false ||
    e07?.screenshots !== false ||
    e07?.providerIdsIncluded !== false ||
    e07?.credentialsIncluded !== false ||
    e07?.personalDataIncluded !== false ||
    e07?.contentIncluded !== false
  ) {
    return false;
  }
  const checks = e07.checks;
  if (!Array.isArray(checks)) return false;
  const ids = checks.map((check) => check?.id);
  if (!exactStringSet(ids, STG1_E07_EXPECTED_CHECK_IDS)) return false;
  if (!checks.every((check) => check?.status === "PASS")) return false;
  return (
    e07.summary?.passed === STG1_E07_EXPECTED_CHECK_IDS.length &&
    e07.summary?.failed === 0 &&
    e07.summary?.terminalFailure === false
  );
}

function overlayIsExact(overlay, mode, postcheck) {
  return exactObjectValues(overlay, {
    mode,
    deploymentName: STG1_FINAL.deploymentName,
    fixtureVersion: STG1_FINAL.fixtureVersion,
    overlayObservedBefore: false,
    overlayObservedDuring: true,
    overlayObservedAfter: false,
    dataPostcheck: postcheck,
    baseRestored: true,
    providerIdsIncludedInResult: false,
    personalDataIncludedInResult: false,
  });
}

export function assertFinalBundleContainsNoSensitiveMaterial(bundle) {
  const serialized = JSON.stringify(bundle);
  const forbiddenKeys = new Set([
    "_id",
    "providerId",
    "clerkId",
    "courseId",
    "lessonId",
    "markerId",
    "targetLessonId",
  ]);
  const containsForbiddenKey = (value) => {
    if (Array.isArray(value)) return value.some(containsForbiddenKey);
    if (!value || typeof value !== "object") return false;
    return Object.entries(value).some(
      ([key, nested]) => forbiddenKeys.has(key) || containsForbiddenKey(nested),
    );
  };
  if (
    /\b(?:sk|pk)_(?:test|live)_/u.test(serialized) ||
    /\buser_[A-Za-z0-9]+\b/u.test(serialized) ||
    /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/iu.test(serialized) ||
    containsForbiddenKey(bundle)
  ) {
    throw new Error("STG1_E10:SENSITIVE_OR_PROVIDER_MATERIAL_IN_BUNDLE");
  }
  return true;
}

export function evaluateStg1FinalBundle(bundle) {
  assertFinalBundleContainsNoSensitiveMaterial(bundle);
  const checks = [];
  const add = (id, passed) => {
    checks.push(Object.freeze({ id, status: passed ? "PASS" : "FAIL" }));
  };

  const commitSha = bundle?.commitSha ?? "";
  add(
    "scope.exact-target",
    bundle?.schemaVersion === 1 &&
      bundle?.deploymentName === STG1_FINAL.deploymentName &&
      bundle?.fixtureVersion === STG1_FINAL.fixtureVersion &&
      bundle?.branch === STG1_FINAL.branch &&
      /^[a-f0-9]{40}$/u.test(commitSha),
  );
  const productionUntouched =
    bundle?.production?.convexWrites === 0 &&
      bundle?.production?.clerkWrites === 0 &&
      bundle?.production?.vercelDeployments === 0 &&
      bundle?.production?.messagesOrPublications === 0;
  add("scope.production-untouched", productionUntouched);
  add("evidence.E03-E09-artifacts", artifactEvidenceIsExact(bundle?.phaseEvidence));

  const convex = bundle?.convexFinal;
  add(
    "convex.identity-and-output-boundary",
    exactObjectValues(convex, {
      deploymentName: STG1_FINAL.deploymentName,
      fixtureVersion: STG1_FINAL.fixtureVersion,
      backendInspected: true,
      contentIncludedInResult: false,
      personalDataIncludedInResult: false,
    }),
  );
  add(
    "convex.course-and-rollback-counts",
    exactObjectValues(convex?.counts, {
      courses: 1,
      canonicalCourses: 1,
      lessons: 75,
      requiredLessons: 75,
      optionalLessons: 0,
      migrationMarkers: 1,
      appliedMigrationMarkers: 0,
      rolledBackMigrationMarkers: 1,
    }),
  );
  add(
    "convex.synthetic-identities-contained",
    exactObjectValues(convex?.counts, {
      users: 7,
      admins: 0,
      courseEntitlements: 2,
      activeCourseEntitlements: 0,
      revokedCourseEntitlements: 2,
      communityEntitlements: 2,
      activeCommunityEntitlements: 0,
      revokedCommunityEntitlements: 2,
    }),
  );
  add(
    "convex.no-user-generated-state",
    exactObjectValues(convex?.counts, {
      simulatorTrialUsage: 0,
      communityTopics: 0,
      communityReplies: 0,
      communityReports: 0,
      communityBlocks: 0,
      communityModerationEvents: 0,
      communityAppeals: 0,
    }),
  );
  add(
    "convex.payment-state-empty",
    exactObjectValues(convex?.counts, { payments: 0, subscriptions: 0 }),
  );

  const containment = bundle?.containmentFinal;
  add(
    "containment.exact-owned-state",
    exactObjectValues(containment, {
      status: "already_contained",
      deploymentName: STG1_FINAL.deploymentName,
      fixtureVersion: STG1_FINAL.fixtureVersion,
      backendInspected: true,
      activeFixtureGrants: 0,
      adminRoleActive: false,
      deletes: 0,
      providerIdsIncludedInResult: false,
      personalDataIncludedInResult: false,
      writes: 0,
    }) &&
      Array.isArray(containment?.conflicts) &&
      containment.conflicts.length === 0 &&
      exactObjectValues(containment?.expectedPostCounts, {
        activeFixtureGrants: 0,
        syntheticAdmins: 0,
        rowsRetainedForAudit: 4,
        usersRetainedAsSyntheticNonPii: 7,
      }),
  );

  add(
    "rollback.versioned-fail-closed-readback",
    exactObjectValues(bundle?.migrationFinal, {
      migrationVersion: "2026-08-23.v1",
      sourceDigest:
        "sha256:160d45adaf1d2c3fd83db048c4e871c0b3653e1ad29d1078029ae280b34fce5a",
      backendInspected: true,
      status: "conflict",
      markerState: "rolled_back",
      requiredLessonCount: 75,
      optionalLessonCount: 0,
      totalLessonCount: 75,
      sameVersionApplyBlocked: true,
      contained: true,
      contentIncludedInResult: false,
      documentIdsIncludedInResult: false,
      personalDataIncludedInResult: false,
    }) &&
      exactStringSet(bundle?.migrationFinal?.conflicts, [
        "MIGRATION_VERSION_ALREADY_ROLLED_BACK",
      ]),
  );

  add(
    "clerk.exact-seven-banned",
    exactObjectValues(bundle?.clerkFinal, {
      mode: "verify",
      deploymentName: STG1_FINAL.deploymentName,
      fixtureVersion: STG1_FINAL.fixtureVersion,
      clerkEnvironment: "development",
      accountsChecked: 7,
      active: 0,
      banned: 7,
      providerIdsReturned: false,
      personalDataReturned: false,
      writes: 0,
    }) &&
      bundle?.clerkFinal?.nonFixtureAccountsUnchanged === 2,
  );

  add(
    "preview.exact-live-target",
    exactObjectValues(bundle?.previewFinal, {
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
    }),
  );
  add("E07.complete-exact-matrix", e07IsExact(bundle?.e07));
  add(
    "overlay.E06-absent-present-absent",
    overlayIsExact(bundle?.overlayApply, "apply-access", "already_applied"),
  );
  add(
    "overlay.E08-absent-present-absent",
    overlayIsExact(bundle?.overlayContain, "contain-access", "already_contained"),
  );

  add(
    "provider.function-and-revision-readback",
    exactObjectValues(bundle?.providerFinal, {
      deploymentName: STG1_FINAL.deploymentName,
      cloudHost: STG1_FINAL.convexHost,
      functionSpecReadBack: true,
      baseFixtureModulePresent: true,
      ephemeralWriterPresent: false,
      revisionMatchedCommittedSource: true,
      backupRecorded: true,
      productionInspectedOrWritten: false,
    }) && /^[a-f0-9]{64}$/u.test(bundle?.providerFinal?.functionSpecSha256 ?? ""),
  );
  add(
    "git.exact-branch-pushed",
    exactObjectValues(bundle?.gitFinal, {
      branch: STG1_FINAL.branch,
      headSha: commitSha,
      remoteSha: commitSha,
      trackedTreeClean: true,
      codexLocalStateTracked: false,
      stg1LocalStateTracked: false,
      evidenceTracked: false,
      pushReadBack: true,
    }),
  );
  add(
    "cleanup.no-temporary-authority-or-artifacts",
    exactObjectValues(bundle?.cleanup, {
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
    }),
  );

  const failed = checks.filter((check) => check.status === "FAIL").length;
  return Object.freeze({
    schemaVersion: 1,
    evidenceId: "E10",
    status: failed === 0 ? "PASS" : "FAIL",
    deploymentName: STG1_FINAL.deploymentName,
    fixtureVersion: STG1_FINAL.fixtureVersion,
    branch: STG1_FINAL.branch,
    commitSha: /^[a-f0-9]{40}$/u.test(commitSha) ? commitSha : null,
    checks,
    summary: {
      passed: checks.length - failed,
      failed,
      total: checks.length,
    },
    productionTouched: productionUntouched ? false : null,
    secretsIncluded: false,
    providerIdsIncluded: false,
    personalDataIncluded: false,
    contentIncluded: false,
  });
}
