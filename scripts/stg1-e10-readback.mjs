/**
 * Read-only live collector for the final STG-1 evidence bundle.
 *
 * Provider calls are limited to Convex queries/metadata/env-list, Clerk GETs,
 * HTTP GETs, Git remote read-back and an SSH existence check. It contains no
 * mutation, deploy, env write, account write, alias write, push or Production
 * mode.
 */

import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { evaluateStg1FinalBundle } from "./lib/stg1-final-audit.mjs";
import {
  buildPhaseEvidence,
  findLastJsonObject,
  parseConvexEnvironmentNames,
  redactReadbackOutput,
  stableDirectoryDigest,
  validateExternalArtifactPath,
} from "./lib/stg1-e10-readback-plan.mjs";
import {
  STG1_TARGET,
  parseDotEnvForTargetGuard,
  validateStg1TargetFile,
} from "./lib/stg1-target-guard.mjs";

const moduleDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(moduleDir, "..");
const localStg1Root = path.join(projectRoot, ".stg1");
const argv = process.argv.slice(2);
const confirmation = "READBACK_STG1_E10_CONTENT_DOG_757";
const branch = "codex/omanut-integration-2026-08-22";
const previewHost = "haderech-preview.vercel.app";
const previewUrl = `https://${previewHost}`;
const convexHost = "content-dog-757.convex.cloud";
const remotePreviewRoot = "/tmp/codex-haderech-stg1-preview";
const maxBuffer = 64 * 1024 * 1024;

function fail(message, redactions = []) {
  process.stderr.write(`${redactReadbackOutput(message, redactions)}\n`);
  process.exit(1);
}

function valueAfter(flag) {
  const at = argv.indexOf(flag);
  if (at >= 0) return argv[at + 1];
  const inline = argv.find((value) => value.startsWith(`${flag}=`));
  return inline?.slice(flag.length + 1);
}

function validateIgnoredStg1Path(input, label) {
  if (!input) throw new Error(`STG1_E10:${label}_REQUIRED`);
  const resolved = path.resolve(projectRoot, input);
  const relative = path.relative(localStg1Root, resolved);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`STG1_E10:${label}_MUST_BE_UNDER_IGNORED_STG1`);
  }
  return resolved;
}

function validateOutputPath(input, expectedName) {
  if (!input || !path.isAbsolute(input)) {
    throw new Error("STG1_E10:ABSOLUTE_OUTPUT_PATH_REQUIRED");
  }
  const resolved = path.resolve(input);
  const relative = path.relative(projectRoot, resolved);
  if (
    path.basename(resolved) !== expectedName ||
    (!relative.startsWith("..") && !path.isAbsolute(relative))
  ) {
    throw new Error("STG1_E10:OUTPUT_MUST_BE_OUTSIDE_PROJECT");
  }
  return resolved;
}

function runProcess(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd ?? projectRoot,
    encoding: "utf8",
    timeout: options.timeout ?? 5 * 60 * 1000,
    maxBuffer,
    windowsHide: true,
  });
  if (result.error) {
    throw new Error(
      `STG1_E10:PROCESS_START_FAILED:${path.basename(command)}:${result.error.message}`,
    );
  }
  if (result.status !== 0) {
    const detail = redactReadbackOutput(
      `${result.stderr ?? ""}\n${result.stdout ?? ""}`.trim(),
      options.redactions ?? [],
    ).slice(0, 8_000);
    throw new Error(
      `STG1_E10:READ_ONLY_PROCESS_FAILED:${path.basename(command)}:${result.status}:${detail}`,
    );
  }
  return { stdout: result.stdout ?? "", stderr: result.stderr ?? "" };
}

function runGit(args) {
  return runProcess("git", args).stdout.trim();
}

function writeJsonAtomic(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const temporary = `${filePath}.tmp`;
  fs.writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`, {
    encoding: "utf8",
    mode: 0o600,
  });
  fs.renameSync(temporary, filePath);
}

function projectObject(value, keys) {
  return Object.fromEntries(keys.map((key) => [key, value?.[key]]));
}

async function fetchWithTimeout(url, timeoutMs = 15_000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      redirect: "follow",
      cache: "no-store",
      headers: { "Cache-Control": "no-cache" },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

async function inspectLivePreviewSurface() {
  const root = await fetchWithTimeout(`${previewUrl}/?e10=${Date.now()}`);
  if (!root.ok || !root.headers.get("x-vercel-id")) {
    throw new Error("STG1_E10:PREVIEW_ROOT_READBACK_FAILED");
  }
  const html = await root.text();
  const scriptPaths = [...html.matchAll(/<script[^>]+src=["']([^"']+\.js[^"']*)["']/giu)]
    .map((match) => match[1])
    .slice(0, 128);
  if (scriptPaths.length === 0) {
    throw new Error("STG1_E10:PREVIEW_SCRIPT_POSITIVE_CONTROL_MISSING");
  }
  const bodies = [html];
  for (const scriptPath of scriptPaths) {
    const scriptUrl = new URL(scriptPath, previewUrl).toString();
    const response = await fetchWithTimeout(scriptUrl);
    if (response.ok) bodies.push(await response.text());
  }
  const surface = bodies.join("\n");
  const convexHosts = new Set(
    [...surface.matchAll(/https:\/\/([a-z0-9-]+\.convex\.cloud)/giu)].map(
      (match) => match[1].toLowerCase(),
    ),
  );
  if (convexHosts.size !== 1 || !convexHosts.has(convexHost)) {
    throw new Error("STG1_E10:PREVIEW_CONVEX_RUNTIME_TARGET_MISMATCH");
  }
  if (!/\bpk_test_[A-Za-z0-9_-]+\b/u.test(surface)) {
    throw new Error("STG1_E10:PREVIEW_CLERK_DEVELOPMENT_CONTROL_MISSING");
  }
  const health = await fetchWithTimeout(`${previewUrl}/api/health?e10=${Date.now()}`);
  if (!health.ok || !health.headers.get("x-vercel-id")) {
    throw new Error("STG1_E10:PREVIEW_HEALTH_READBACK_FAILED");
  }
  const payload = await health.json();
  if (
    payload?.status !== "ok" ||
    payload?.checks?.convex !== true ||
    payload?.checks?.clerk !== true ||
    payload?.checks?.app_url !== true
  ) {
    throw new Error("STG1_E10:PREVIEW_HEALTH_NOT_EXACT");
  }
  return Object.freeze({
    aliasReadback: true,
    healthReadback: true,
    browserRuntimeReadback: true,
  });
}

if (argv.includes("--prod") || argv.includes("--production")) {
  fail("STG1_E10:PRODUCTION_FORBIDDEN");
}
if (valueAfter("--confirm") !== confirmation) {
  fail(`STG1_E10:CONFIRMATION_REQUIRED:${confirmation}`);
}

try {
  const convexEnvFile = validateIgnoredStg1Path(
    valueAfter("--convex-env-file"),
    "CONVEX_ENV_FILE",
  );
  const identityMap = validateIgnoredStg1Path(
    valueAfter("--identity-map"),
    "IDENTITY_MAP",
  );
  validateStg1TargetFile(convexEnvFile, STG1_TARGET.deploymentName);
  const clerkEnvFile = path.resolve(
    projectRoot,
    valueAfter("--clerk-env-file") ?? ".env.local",
  );
  if (clerkEnvFile !== path.join(projectRoot, ".env.local")) {
    throw new Error("STG1_E10:EXACT_CLERK_ENV_FILE_REQUIRED");
  }
  const clerkValues = parseDotEnvForTargetGuard(
    fs.readFileSync(clerkEnvFile, "utf8"),
  );
  const redactions = [
    clerkValues.get("CLERK_SECRET_KEY"),
    clerkValues.get("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"),
  ];

  const phaseFiles = Object.fromEntries(
    ["E03", "E04", "E05", "E06", "E07", "E08", "E09"].map((id) => [
      id,
      validateExternalArtifactPath(projectRoot, valueAfter(`--${id.toLowerCase()}-file`)),
    ]),
  );
  const previewEvidenceFile = validateExternalArtifactPath(
    projectRoot,
    valueAfter("--preview-file"),
  );
  const providerCleanupFile = validateExternalArtifactPath(
    projectRoot,
    valueAfter("--provider-cleanup-file"),
  );
  const inputOutput = validateOutputPath(
    valueAfter("--input-output"),
    "e10-final-input.json",
  );
  const matrixOutput = validateOutputPath(
    valueAfter("--matrix-output"),
    "e10-final-matrix.json",
  );

  const currentBranch = runGit(["rev-parse", "--abbrev-ref", "HEAD"]);
  const headSha = runGit(["rev-parse", "HEAD"]);
  if (currentBranch !== branch || !/^[a-f0-9]{40}$/u.test(headSha)) {
    throw new Error("STG1_E10:GIT_HEAD_TARGET_MISMATCH");
  }
  const remoteLine = runGit([
    "ls-remote",
    "origin",
    `refs/heads/${branch}`,
  ]);
  const remoteSha = remoteLine.split(/\s+/u)[0] ?? "";
  const statusLines = runGit([
    "status",
    "--porcelain=v1",
    "--untracked-files=all",
  ])
    .split(/\r?\n/u)
    .filter(Boolean);
  const disallowedWorktreeState = statusLines.filter(
    (line) => !line.startsWith("?? .Codex/"),
  );
  const trackedFiles = runGit(["ls-files"]).split(/\r?\n/u).filter(Boolean);
  const codexTracked = trackedFiles.some((file) => file.startsWith(".Codex/"));
  const stg1Tracked = trackedFiles.some((file) => file.startsWith(".stg1/"));
  const evidenceTracked = trackedFiles.some(
    (file) =>
      /(?:e07-access-matrix|e10-final-(?:input|matrix)|clerk-accounts\.local|identities\.local)/u.test(
        file,
      ),
  );

  const convexStateOutput = runProcess(process.execPath, [
    path.join(projectRoot, "scripts", "stg1-fixtures.mjs"),
    "--inspect-state",
    "--env-file",
    convexEnvFile,
  ]);
  const convexFinal = findLastJsonObject(
    convexStateOutput.stdout,
    (value) => value?.backendInspected === true && value?.counts !== undefined,
  );

  const containmentOutput = runProcess(process.execPath, [
    path.join(projectRoot, "scripts", "stg1-fixtures.mjs"),
    "--preview-containment",
    "--env-file",
    convexEnvFile,
    "--identity-map",
    identityMap,
  ]);
  const rawContainment = findLastJsonObject(
    containmentOutput.stdout,
    (value) => value?.activeFixtureGrants !== undefined,
  );
  const containmentFinal = {
    ...projectObject(rawContainment, [
      "status",
      "conflicts",
      "deploymentName",
      "fixtureVersion",
      "backendInspected",
      "activeFixtureGrants",
      "adminRoleActive",
      "expectedPostCounts",
      "deletes",
      "providerIdsIncludedInResult",
      "personalDataIncludedInResult",
      "writes",
    ]),
  };

  const migrationOutput = runProcess(process.execPath, [
    path.join(projectRoot, "scripts", "receiving-practice-staging.mjs"),
    "--verify-rollback",
    "--env-file",
    convexEnvFile,
  ]);
  const rawMigration = findLastJsonObject(
    migrationOutput.stdout,
    (value) => value?.sameVersionApplyBlocked !== undefined,
  );
  const migrationFinal = projectObject(rawMigration, [
    "migrationVersion",
    "sourceDigest",
    "backendInspected",
    "status",
    "conflicts",
    "markerState",
    "requiredLessonCount",
    "optionalLessonCount",
    "totalLessonCount",
    "sameVersionApplyBlocked",
    "contained",
    "contentIncludedInResult",
    "documentIdsIncludedInResult",
    "personalDataIncludedInResult",
  ]);

  const clerkOutput = runProcess(
    process.execPath,
    [
      path.join(projectRoot, "scripts", "stg1-clerk-users.mjs"),
      "--verify",
      "--env-file",
      clerkEnvFile,
    ],
    { redactions },
  );
  const clerkFinal = findLastJsonObject(
    clerkOutput.stdout,
    (value) => value?.mode === "verify" && value?.accountsChecked === 7,
  );

  const functionSpec = runProcess(process.execPath, [
    path.join(projectRoot, "node_modules", "convex", "bin", "main.js"),
    "function-spec",
    "--env-file",
    convexEnvFile,
    "--deployment-name",
    STG1_TARGET.deploymentName,
  ]).stdout;
  const functionSpecPositive =
    functionSpec.includes("stg1Fixtures") &&
    functionSpec.includes("receivingPracticeMigration");
  const ephemeralWriterPresent = functionSpec.includes("stg1AccessWriter");
  if (!functionSpecPositive) {
    throw new Error("STG1_E10:FUNCTION_SPEC_POSITIVE_CONTROL_MISSING");
  }
  const functionSpecSha256 = createHash("sha256")
    .update(functionSpec)
    .digest("hex");

  const environmentList = runProcess(process.execPath, [
    path.join(projectRoot, "node_modules", "convex", "bin", "main.js"),
    "env",
    "list",
    "--env-file",
    convexEnvFile,
    "--deployment-name",
    STG1_TARGET.deploymentName,
  ]).stdout;
  const environmentNames = parseConvexEnvironmentNames(environmentList);
  if (!environmentNames.has("CLERK_JWT_ISSUER_DOMAIN")) {
    throw new Error("STG1_E10:ENV_LIST_POSITIVE_CONTROL_MISSING");
  }

  const previewEvidence = JSON.parse(
    fs.readFileSync(previewEvidenceFile, "utf8"),
  );
  const e07 = JSON.parse(fs.readFileSync(phaseFiles.E07, "utf8"));
  const overlayApplySource = fs.readFileSync(phaseFiles.E06, "utf8");
  const overlayContainSource = fs.readFileSync(phaseFiles.E08, "utf8");
  const rawOverlayApply = findLastJsonObject(
    overlayApplySource,
    (value) => value?.mode === "apply-access",
  );
  const rawOverlayContain = findLastJsonObject(
    overlayContainSource,
    (value) => value?.mode === "contain-access",
  );
  const overlayKeys = [
    "mode",
    "deploymentName",
    "fixtureVersion",
    "overlayObservedBefore",
    "overlayObservedDuring",
    "overlayObservedAfter",
    "dataPostcheck",
    "baseRestored",
    "providerIdsIncludedInResult",
    "personalDataIncludedInResult",
  ];
  const overlayApply = projectObject(rawOverlayApply, overlayKeys);
  const overlayContain = projectObject(rawOverlayContain, overlayKeys);
  const localConvexDigest = stableDirectoryDigest(path.join(projectRoot, "convex"));
  const revisionMatchedCommittedSource =
    rawOverlayContain.baseSourceDigest === localConvexDigest &&
    disallowedWorktreeState.length === 0 &&
    !ephemeralWriterPresent;

  const livePreview = await inspectLivePreviewSurface();
  const previewFinal = {
    status:
      previewEvidence?.status === "PASS" &&
      previewEvidence?.target === "preview" &&
      previewEvidence?.branch === branch &&
      previewEvidence?.commitSha === headSha &&
      previewEvidence?.productionWrites === 0 &&
      previewEvidence?.secretsReturned === false
        ? "PASS"
        : "FAIL",
    target: "preview",
    branch,
    commitSha: headSha,
    aliasHost: previewHost,
    convexHost,
    clerkEnvironment: "development",
    ...livePreview,
    productionWrites: previewEvidence?.productionWrites,
    secretsReturned: false,
  };

  const providerCleanup = JSON.parse(
    fs.readFileSync(providerCleanupFile, "utf8"),
  );
  if (
    providerCleanup?.schemaVersion !== 1 ||
    providerCleanup?.deploymentName !== STG1_TARGET.deploymentName ||
    providerCleanup?.providerManagementReadBack !== true
  ) {
    throw new Error("STG1_E10:PROVIDER_CLEANUP_EVIDENCE_INVALID");
  }
  runProcess("ssh", [
    "-T",
    "root@144.91.93.223",
    `test ! -e '${remotePreviewRoot}'`,
  ]);
  const localOverlayTemps = fs
    .readdirSync(os.tmpdir(), { withFileTypes: true })
    .filter(
      (entry) => entry.isDirectory() && entry.name.startsWith("haderech-stg1-overlay-"),
    ).length;
  const localPreviewArchivePresent = fs.existsSync(
    path.join(localStg1Root, "preview-source.tar"),
  );

  const phaseEvidence = buildPhaseEvidence(phaseFiles);
  const bundle = {
    schemaVersion: 1,
    deploymentName: STG1_TARGET.deploymentName,
    fixtureVersion: "stg1-v1",
    branch,
    commitSha: headSha,
    production: providerCleanup.production,
    phaseEvidence,
    convexFinal,
    containmentFinal,
    migrationFinal,
    clerkFinal,
    previewFinal,
    e07,
    overlayApply,
    overlayContain,
    providerFinal: {
      deploymentName: STG1_TARGET.deploymentName,
      cloudHost: convexHost,
      functionSpecReadBack: true,
      functionSpecSha256,
      baseFixtureModulePresent: functionSpec.includes("stg1Fixtures"),
      ephemeralWriterPresent,
      revisionMatchedCommittedSource,
      backupRecorded: providerCleanup.backupRecorded === true,
      productionInspectedOrWritten:
        providerCleanup.productionInspectedOrWritten,
    },
    gitFinal: {
      branch,
      headSha,
      remoteSha,
      trackedTreeClean: disallowedWorktreeState.length === 0,
      codexLocalStateTracked: codexTracked,
      stg1LocalStateTracked: stg1Tracked,
      evidenceTracked,
      pushReadBack: remoteSha === headSha,
    },
    cleanup: {
      temporaryConvexDeployKeys: providerCleanup.temporaryConvexDeployKeys,
      seedEnabledPresent: environmentNames.has("SEED_ENABLED"),
      stg1FixturesEnabledPresent: environmentNames.has("STG1_FIXTURES_ENABLED"),
      stg1DeploymentNamePresent: environmentNames.has("STG1_DEPLOYMENT_NAME"),
      ephemeralWriterPresent,
      remoteTemporaryDirectories: 0,
      localOverlayTemporaryDirectories: localOverlayTemps,
      localPreviewArchives: localPreviewArchivePresent ? 1 : 0,
      localSecretFilesOutsideIgnoredStg1:
        providerCleanup.localSecretFilesOutsideIgnoredStg1,
      accountDeletionCalls: providerCleanup.accountDeletionCalls,
      broadDatabaseDeletes: providerCleanup.broadDatabaseDeletes,
    },
  };
  const matrix = evaluateStg1FinalBundle(bundle);
  writeJsonAtomic(inputOutput, bundle);
  writeJsonAtomic(matrixOutput, matrix);
  process.stdout.write(
    `${JSON.stringify(
      {
        evidenceId: "E10",
        status: matrix.status,
        deploymentName: STG1_TARGET.deploymentName,
        branch,
        commitSha: headSha,
        summary: matrix.summary,
        providerReads: {
          convex: true,
          clerk: true,
          preview: true,
          gitRemote: true,
          functionSpec: true,
          environmentNamesOnly: true,
        },
        writes: {
          providers: 0,
          git: 0,
          localEvidenceFiles: 2,
        },
        productionTouched: matrix.productionTouched,
        secretsReturned: false,
        providerIdsReturned: false,
        personalDataReturned: false,
        contentReturned: false,
        inputOutput,
        matrixOutput,
      },
      null,
      2,
    )}\n`,
  );
  if (matrix.status !== "PASS") process.exit(1);
} catch (error) {
  fail(
    error instanceof Error ? error.message : "STG1_E10:UNKNOWN_ERROR",
  );
}
