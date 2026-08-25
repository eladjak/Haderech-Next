/**
 * Preview-only Vercel launcher for STG-1.
 *
 * Secrets are read from the exact local Development env file and are sent to
 * Vercel only through SSH stdin. They never appear in process arguments,
 * stdout, evidence, the Git archive or the remote source directory.
 */

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseDotEnvForTargetGuard } from "./lib/stg1-target-guard.mjs";
import {
  STG1_PREVIEW,
  assertPreviewOnlyArguments,
  assertSafeRemoteRoot,
  buildVercelDeployArgs,
  buildVercelEnvUpdateArgs,
  parseDeploymentUrl,
  parseInspectDeploymentUrl,
  redactPreviewOutput,
  summarizePreviewEnvironment,
  validateCommitSha,
  validatePreviewEnvironment,
  validatePreviewEnvironmentReadback,
  validateVercelProjectContract,
} from "./lib/stg1-preview-plan.mjs";

const moduleDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(moduleDir, "..");
const argv = process.argv.slice(2);
const maxBuffer = 64 * 1024 * 1024;
const processTimeout = 15 * 60 * 1000;

function fail(message) {
  process.stderr.write(`${redactPreviewOutput(message)}\n`);
  process.exit(1);
}

function valueAfter(flag) {
  const at = argv.indexOf(flag);
  if (at >= 0) return argv[at + 1];
  const inline = argv.find((value) => value.startsWith(`${flag}=`));
  return inline?.slice(flag.length + 1);
}

function safePrint(value) {
  const serialized = JSON.stringify(value, null, 2);
  if (
    /\b(?:sk|pk)_(?:test|live)_/u.test(serialized) ||
    /\buser_[A-Za-z0-9]+\b/u.test(serialized) ||
    /@/u.test(serialized)
  ) {
    fail("STG1_PREVIEW:SAFE_OUTPUT_GUARD_REJECTED_RESULT");
  }
  process.stdout.write(`${serialized}\n`);
}

function runProcess(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd ?? projectRoot,
    encoding: "utf8",
    input: options.input,
    timeout: options.timeout ?? processTimeout,
    maxBuffer,
    windowsHide: true,
  });
  const redactions = options.redactions ?? [];
  if (result.error) {
    throw new Error(
      `STG1_PREVIEW:PROCESS_START_FAILED:${path.basename(command)}:${redactPreviewOutput(result.error.message, redactions)}`,
    );
  }
  if (result.status !== 0) {
    const detail = redactPreviewOutput(
      `${result.stderr ?? ""}\n${result.stdout ?? ""}`.trim(),
      redactions,
    ).slice(0, 8_000);
    throw new Error(
      `STG1_PREVIEW:PROCESS_FAILED:${path.basename(command)}:${result.status}:${detail}`,
    );
  }
  return {
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
  };
}

function runGit(args) {
  return runProcess("git", args).stdout.trim();
}

function posixQuote(value) {
  return `'${String(value).replaceAll("'", `'"'"'`)}'`;
}

function remoteCommand(tokens) {
  return tokens.map(posixQuote).join(" ");
}

function runRemote(tokens, options = {}) {
  return runProcess(
    "ssh",
    ["-T", STG1_PREVIEW.remoteHost, remoteCommand(tokens)],
    options,
  );
}

function runRemoteVercel(args, options = {}) {
  assertPreviewOnlyArguments(args);
  // Vercel CLI 59 forwards its global flags to the underlying system curl.
  // Project and org are already pinned through environment variables, so the
  // protected-deployment curl invocation must contain only curl arguments.
  const globalArgs =
    args[0] === "curl"
      ? []
      : [
          "--non-interactive",
          "--scope",
          STG1_PREVIEW.scope,
          "--no-color",
        ];
  const tokens = [
    "env",
    `PATH=${STG1_PREVIEW.remoteNodePath}`,
    `VERCEL_ORG_ID=${STG1_PREVIEW.orgId}`,
    `VERCEL_PROJECT_ID=${STG1_PREVIEW.projectId}`,
    "NO_COLOR=1",
    "/tmp/node22/bin/node",
    `${STG1_PREVIEW.remoteRoot}/scripts/stg1-vercel-cli.mjs`,
    ...globalArgs,
    ...args,
  ];
  return runRemote(tokens, options);
}

function validateLocalEnvPath(input) {
  const resolved = path.resolve(projectRoot, input ?? ".env.local");
  if (resolved !== path.join(projectRoot, ".env.local")) {
    throw new Error("STG1_PREVIEW:EXACT_LOCAL_ENV_FILE_REQUIRED");
  }
  return resolved;
}

function validateEvidencePath(input) {
  if (!input || !path.isAbsolute(input)) {
    throw new Error("STG1_PREVIEW:ABSOLUTE_EVIDENCE_FILE_REQUIRED");
  }
  const resolved = path.resolve(input);
  const relative = path.relative(projectRoot, resolved);
  if (
    path.basename(resolved) !== "e06-preview-deploy.json" ||
    (!relative.startsWith("..") && !path.isAbsolute(relative))
  ) {
    throw new Error("STG1_PREVIEW:EVIDENCE_FILE_MUST_BE_OUTSIDE_PROJECT");
  }
  return resolved;
}

function validateRepository({ requireClean }) {
  const branch = runGit(["rev-parse", "--abbrev-ref", "HEAD"]);
  if (branch !== STG1_PREVIEW.branch) {
    throw new Error("STG1_PREVIEW:GIT_BRANCH_MISMATCH");
  }
  const origin = runGit(["remote", "get-url", "origin"]);
  if (origin !== STG1_PREVIEW.originUrl) {
    throw new Error("STG1_PREVIEW:GIT_ORIGIN_MISMATCH");
  }
  const commitSha = validateCommitSha(runGit(["rev-parse", "HEAD"]));
  const trackedCodex = runGit(["ls-files", ".Codex"]);
  if (trackedCodex) {
    throw new Error("STG1_PREVIEW:CODEX_LOCAL_STATE_TRACKED");
  }
  const archivedCodex = runGit([
    "ls-tree",
    "-r",
    "--name-only",
    "HEAD",
    ".Codex",
  ]);
  if (archivedCodex) {
    throw new Error("STG1_PREVIEW:CODEX_LOCAL_STATE_IN_ARCHIVE");
  }

  const statusLines = runGit([
    "status",
    "--porcelain=v1",
    "--untracked-files=all",
  ])
    .split(/\r?\n/u)
    .filter(Boolean);
  const disallowed = statusLines.filter(
    (line) => !line.startsWith("?? .Codex/"),
  );
  if (requireClean && disallowed.length > 0) {
    throw new Error("STG1_PREVIEW:SOURCE_TREE_NOT_COMMITTED");
  }
  return Object.freeze({
    branch,
    commitSha,
    originVerified: true,
    trackedCodexFiles: 0,
    nonCodexWorktreeChanges: disallowed.length,
  });
}

function writeEvidence(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const temporary = `${filePath}.tmp`;
  fs.writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`, {
    encoding: "utf8",
    mode: 0o600,
  });
  fs.renameSync(temporary, filePath);
}

function assertHealthPayload(source) {
  let payload;
  try {
    payload = JSON.parse(String(source).trim());
  } catch {
    throw new Error("STG1_PREVIEW:HEALTH_RESPONSE_NOT_JSON");
  }
  if (
    payload?.status !== "ok" ||
    payload?.checks?.convex !== true ||
    payload?.checks?.clerk !== true ||
    payload?.checks?.app_url !== true
  ) {
    throw new Error("STG1_PREVIEW:HEALTH_RESPONSE_DEGRADED");
  }
  return Object.freeze({ status: "ok", checks: 3 });
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

async function verifyLiveAlias() {
  let finalError = "STG1_PREVIEW:ALIAS_READBACK_FAILED";
  for (let attempt = 1; attempt <= 12; attempt += 1) {
    try {
      const root = await fetchWithTimeout(
        `${STG1_PREVIEW.baseUrl}/?stg1_readback=${Date.now()}`,
      );
      if (!root.ok || !root.headers.get("x-vercel-id")) {
        throw new Error("STG1_PREVIEW:ALIAS_ROOT_NOT_VERCEL_READY");
      }
      const health = await fetchWithTimeout(
        `${STG1_PREVIEW.baseUrl}/api/health?stg1_readback=${Date.now()}`,
      );
      if (!health.ok || !health.headers.get("x-vercel-id")) {
        throw new Error("STG1_PREVIEW:ALIAS_HEALTH_NOT_VERCEL_READY");
      }
      assertHealthPayload(await health.text());
      return Object.freeze({
        rootStatus: root.status,
        healthStatus: health.status,
        vercelHeader: true,
      });
    } catch (error) {
      finalError = error instanceof Error ? error.message : finalError;
      if (attempt < 12) {
        await new Promise((resolve) => setTimeout(resolve, 2_000));
      }
    }
  }
  throw new Error(finalError);
}

if (argv.includes("--prod") || argv.includes("--production")) {
  fail("STG1_PREVIEW:PRODUCTION_ARGUMENT_FORBIDDEN");
}
const modes = ["preflight", "execute"].filter((mode) =>
  argv.includes(`--${mode}`),
);
if (modes.length !== 1) {
  fail("STG1_PREVIEW:CHOOSE_EXACTLY_ONE_MODE");
}
const mode = modes[0];

try {
  const envFile = validateLocalEnvPath(valueAfter("--env-file"));
  const envValues = parseDotEnvForTargetGuard(fs.readFileSync(envFile, "utf8"));
  const environmentEntries = validatePreviewEnvironment(envValues);
  const vercelConfig = JSON.parse(
    fs.readFileSync(path.join(projectRoot, "vercel.json"), "utf8"),
  );
  const vercelContract = validateVercelProjectContract(vercelConfig);
  const repository = validateRepository({ requireClean: mode === "execute" });

  if (mode === "preflight") {
    safePrint({
      mode,
      target: "vercel-preview",
      branch: repository.branch,
      commitSha: repository.commitSha,
      aliasHost: STG1_PREVIEW.aliasHost,
      convexDeployment: "content-dog-757",
      clerkEnvironment: "development",
      environment: summarizePreviewEnvironment(environmentEntries),
      vercelContract,
      repository,
      externalWrites: 0,
      productionWrites: 0,
      secretsReturned: false,
    });
    process.exit(0);
  }

  if (valueAfter("--confirm") !== STG1_PREVIEW.confirmation) {
    throw new Error(
      `STG1_PREVIEW:CONFIRMATION_REQUIRED:${STG1_PREVIEW.confirmation}`,
    );
  }
  const expectedCommit = validateCommitSha(valueAfter("--expected-commit"));
  if (expectedCommit !== repository.commitSha) {
    throw new Error("STG1_PREVIEW:EXPECTED_COMMIT_MISMATCH");
  }
  const evidenceFile = validateEvidencePath(valueAfter("--evidence-file"));
  const remoteRoot = assertSafeRemoteRoot(STG1_PREVIEW.remoteRoot);
  const localArchive = path.join(projectRoot, ".stg1", "preview-source.tar");
  const secretValues = environmentEntries.map((entry) => entry.value);
  let previousAliasTarget = null;
  let deploymentUrl = null;
  let aliasChanged = false;
  let remotePrepared = false;
  let localArchiveCreated = false;
  let phase = "initializing";

  safePrint({
    mode,
    target: "vercel-preview",
    branch: repository.branch,
    commitSha: repository.commitSha,
    aliasHost: STG1_PREVIEW.aliasHost,
    environment: summarizePreviewEnvironment(environmentEntries),
    externalWritesAuthorizedByLiteral: true,
    productionWrites: 0,
    secretsReturned: false,
  });

  try {
    phase = "archive-source";
    fs.mkdirSync(path.dirname(localArchive), { recursive: true });
    fs.rmSync(localArchive, { force: true });
    runProcess("git", [
      "archive",
      "--format=tar",
      `--output=${localArchive}`,
      repository.commitSha,
    ]);
    localArchiveCreated = true;

    phase = "prepare-remote";
    runRemote(["test", "-d", "/tmp"]);
    runRemote(["rm", "-rf", "--", remoteRoot]);
    runRemote(["mkdir", "-p", "--", remoteRoot]);
    remotePrepared = true;
    runProcess("scp", [
      "-q",
      localArchive,
      `${STG1_PREVIEW.remoteHost}:${STG1_PREVIEW.remoteArchive}`,
    ]);
    runRemote([
      "tar",
      "-xf",
      STG1_PREVIEW.remoteArchive,
      "-C",
      remoteRoot,
    ]);
    runRemote(["rm", "-f", "--", STG1_PREVIEW.remoteArchive]);

    phase = "prepare-vercel-cli";
    runRemote([
      "env",
      `PATH=${STG1_PREVIEW.remoteNodePath}`,
      "NO_COLOR=1",
      "/tmp/node22/bin/npx",
      "--yes",
      "vercel@latest",
      "--version",
    ]);
    runRemoteVercel(["--version"]);

    phase = "write-preview-environment";
    for (const entry of environmentEntries) {
      runRemoteVercel(buildVercelEnvUpdateArgs(entry), {
        // Vercel CLI 59+ reads non-interactive env values as a line from stdin.
        // Keep the value out of argv while providing the required delimiter.
        input: `${entry.value}\n`,
        redactions: secretValues,
      });
    }

    phase = "readback-preview-environment";
    runRemoteVercel([
      "env",
      "pull",
      STG1_PREVIEW.remoteReadback,
      "--environment=preview",
      "--git-branch",
      STG1_PREVIEW.branch,
      "--yes",
      "--project",
      STG1_PREVIEW.projectId,
    ]);
    const pulledEnvironment = runRemote([
      "cat",
      "--",
      STG1_PREVIEW.remoteReadback,
    ]).stdout;
    validatePreviewEnvironmentReadback(
      parseDotEnvForTargetGuard(pulledEnvironment),
      environmentEntries,
    );
    runRemote(["rm", "-f", "--", STG1_PREVIEW.remoteReadback]);

    phase = "capture-alias-undo";
    const previousInspect = runRemoteVercel([
      "inspect",
      STG1_PREVIEW.aliasHost,
    ]);
    previousAliasTarget = parseInspectDeploymentUrl(
      `${previousInspect.stdout}\n${previousInspect.stderr}`,
    );

    phase = "deploy-preview";
    const deployed = runRemoteVercel(buildVercelDeployArgs(repository.commitSha), {
      redactions: secretValues,
    });
    deploymentUrl = parseDeploymentUrl(deployed.stdout);
    const deploymentInspect = runRemoteVercel([
      "inspect",
      deploymentUrl,
      "--wait",
      "--timeout=10m",
    ]);
    const inspected = `${deploymentInspect.stdout}\n${deploymentInspect.stderr}`;
    if (!/^target\s+preview\s*$/imu.test(inspected) || !/status\s+.*Ready/iu.test(inspected)) {
      throw new Error("STG1_PREVIEW:DEPLOYMENT_NOT_READY_PREVIEW");
    }

    phase = "verify-deployment-before-alias";
    const health = runRemoteVercel([
      "curl",
      "/api/health",
      "--deployment",
      deploymentUrl,
    ]);
    assertHealthPayload(health.stdout);

    phase = "assign-preview-alias";
    runRemoteVercel([
      "alias",
      "set",
      deploymentUrl,
      STG1_PREVIEW.aliasHost,
    ]);
    aliasChanged = true;

    phase = "readback-preview-alias";
    const aliasInspect = runRemoteVercel([
      "inspect",
      STG1_PREVIEW.aliasHost,
    ]);
    const aliasTarget = parseInspectDeploymentUrl(
      `${aliasInspect.stdout}\n${aliasInspect.stderr}`,
    );
    if (aliasTarget !== deploymentUrl) {
      throw new Error("STG1_PREVIEW:ALIAS_TARGET_READBACK_MISMATCH");
    }
    const liveReadback = await verifyLiveAlias();

    phase = "cleanup-temporary-files";
    runRemote(["rm", "-rf", "--", remoteRoot]);
    remotePrepared = false;
    fs.rmSync(localArchive, { force: true });
    localArchiveCreated = false;

    writeEvidence(evidenceFile, {
      schemaVersion: 1,
      evidenceId: "E06-preview",
      status: "PASS",
      branch: repository.branch,
      commitSha: repository.commitSha,
      target: "preview",
      aliasHost: STG1_PREVIEW.aliasHost,
      previousAliasTarget,
      deploymentUrl,
      convexDeployment: "content-dog-757",
      clerkEnvironment: "development",
      environmentReadback: {
        variablesChecked: environmentEntries.length,
        sensitiveValuesReturned: false,
      },
      liveReadback,
      productionWrites: 0,
      sourceArchiveIncludedGitState: false,
      sourceArchiveIncludedEnvFiles: false,
      temporaryRemoteFilesRemaining: 0,
      secretsReturned: false,
    });
    safePrint({
      mode,
      status: "PASS",
      target: "preview",
      aliasHost: STG1_PREVIEW.aliasHost,
      branch: repository.branch,
      commitSha: repository.commitSha,
      deploymentUrl,
      aliasReadback: true,
      healthReadback: true,
      aliasUndoCaptured: true,
      productionWrites: 0,
      secretsReturned: false,
      evidenceFile,
    });
  } catch (error) {
    const failedPhase = phase;
    let rollback = "not-needed";
    if (aliasChanged && previousAliasTarget) {
      try {
        phase = "rollback-preview-alias";
        runRemoteVercel([
          "alias",
          "set",
          previousAliasTarget,
          STG1_PREVIEW.aliasHost,
        ]);
        const rollbackInspect = runRemoteVercel([
          "inspect",
          STG1_PREVIEW.aliasHost,
        ]);
        const restored = parseInspectDeploymentUrl(
          `${rollbackInspect.stdout}\n${rollbackInspect.stderr}`,
        );
        rollback = restored === previousAliasTarget ? "restored" : "mismatch";
      } catch {
        rollback = "failed";
      }
    }
    const errorCode = redactPreviewOutput(
      error instanceof Error ? error.message : "STG1_PREVIEW:UNKNOWN_ERROR",
      secretValues,
    ).split(/\r?\n/u)[0];
    writeEvidence(evidenceFile, {
      schemaVersion: 1,
      evidenceId: "E06-preview",
      status: "FAIL",
      phase: failedPhase,
      branch: repository.branch,
      commitSha: repository.commitSha,
      target: "preview",
      aliasHost: STG1_PREVIEW.aliasHost,
      aliasRollback: rollback,
      errorCode,
      productionWrites: 0,
      secretsReturned: false,
    });
    throw error;
  } finally {
    if (remotePrepared) {
      try {
        runRemote(["rm", "-rf", "--", remoteRoot]);
      } catch {
        // The failing evidence already marks the run incomplete.
      }
    }
    if (localArchiveCreated) {
      fs.rmSync(localArchive, { force: true });
    }
  }
} catch (error) {
  fail(error instanceof Error ? error.message : "STG1_PREVIEW:UNKNOWN_ERROR");
}
