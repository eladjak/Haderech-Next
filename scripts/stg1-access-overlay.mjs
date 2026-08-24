/**
 * Ephemeral writer lifecycle for STG-1 access fixtures.
 *
 * Default mode is local validation only. A cloud write requires an exact
 * target-scoped env file, identity binding, fresh preview hash, and explicit
 * overlay-cycle confirmation. The writer is uploaded to the isolated
 * Development deployment, executed once, then removed by re-uploading the
 * base tree. Function metadata is checked before, during and after the cycle.
 */

import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  STG1_TARGET,
  validateStg1TargetFile,
} from "./lib/stg1-target-guard.mjs";

const moduleDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(moduleDir, "..");
const localIdentityRoot = path.resolve(projectRoot, ".stg1");
const templatePath = path.resolve(
  projectRoot,
  "ops",
  "stg1-access-overlay",
  "stg1AccessWriter.template",
);
const tempRoot = path.resolve(os.tmpdir());
const argv = process.argv.slice(2);
const FIXTURE_VERSION = "stg1-v1";
const FIXTURE_CONFIRMATION = "STG1_CONTENT_DOG_757_V1";
const OVERLAY_CONFIRMATION =
  "STG1_EPHEMERAL_WRITER_UPLOAD_EXECUTE_REMOVE";
const AUTHENTICATED_ALIASES = [
  "U0",
  "A",
  "B",
  "E",
  "X",
  "ADMIN",
  "IMPOSTOR",
];

function abort(message) {
  throw new Error(message);
}

function valueAfter(flag) {
  const at = argv.indexOf(flag);
  if (at >= 0) return argv[at + 1];
  const inline = argv.find((value) => value.startsWith(`${flag}=`));
  return inline?.slice(flag.length + 1);
}

function stableFileDigest(root) {
  const files = [];
  function walk(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const full = path.join(directory, entry.name);
      if (entry.isDirectory()) walk(full);
      else files.push(full);
    }
  }
  walk(root);
  const hash = createHash("sha256");
  for (const file of files.sort()) {
    hash.update(path.relative(root, file).replaceAll("\\", "/"));
    hash.update("\0");
    hash.update(fs.readFileSync(file));
    hash.update("\0");
  }
  return `sha256:${hash.digest("hex")}`;
}

function assertReleaseTreeHasNoGrantWriter() {
  const files = [];
  function walk(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const full = path.join(directory, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/\.(?:ts|tsx)$/u.test(entry.name)) files.push(full);
    }
  }
  walk(path.resolve(projectRoot, "convex"));
  const communityWriter =
    /(?:insert|patch|replace|delete)\s*\(\s*["']communityEntitlements["']/u;
  const courseWriter =
    /(?:insert|patch|replace|delete)\s*\(\s*["']courseEntitlements["']/u;
  const offenders = files.filter((file) => {
    const source = fs.readFileSync(file, "utf8");
    return communityWriter.test(source) || courseWriter.test(source);
  });
  if (offenders.length > 0) {
    abort(
      `STG1_RELEASE_TREE_GRANT_WRITER_PRESENT:${offenders
        .map((file) => path.relative(projectRoot, file))
        .join("|")}`,
    );
  }
}

function createCandidate() {
  const candidate = fs.mkdtempSync(
    path.join(tempRoot, "haderech-stg1-overlay-"),
  );
  fs.cpSync(path.resolve(projectRoot, "convex"), path.join(candidate, "convex"), {
    recursive: true,
  });
  for (const file of ["convex.json", "package.json", "tsconfig.json"]) {
    fs.copyFileSync(path.resolve(projectRoot, file), path.join(candidate, file));
  }
  const nextEnv = path.resolve(projectRoot, "next-env.d.ts");
  if (fs.existsSync(nextEnv)) {
    fs.copyFileSync(nextEnv, path.join(candidate, "next-env.d.ts"));
  }
  fs.copyFileSync(
    templatePath,
    path.join(candidate, "convex", "stg1AccessWriter.ts"),
  );
  fs.symlinkSync(
    path.resolve(projectRoot, "node_modules"),
    path.join(candidate, "node_modules"),
    "junction",
  );
  return candidate;
}

function safeRemoveCandidate(candidate) {
  const resolved = path.resolve(candidate);
  const relative = path.relative(tempRoot, resolved);
  if (
    relative.startsWith("..") ||
    path.isAbsolute(relative) ||
    !path.basename(resolved).startsWith("haderech-stg1-overlay-")
  ) {
    abort("STG1_TEMP_CLEANUP_TARGET_REJECTED");
  }
  fs.rmSync(resolved, { recursive: true, force: true });
}

function runProcess(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd ?? projectRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  if (result.error) abort(`STG1_PROCESS_START_FAILED:${result.error.message}`);
  if (options.print !== false) {
    if (result.stdout) process.stdout.write(result.stdout);
    if (result.stderr) process.stderr.write(result.stderr);
  }
  if (result.status !== 0 && !options.allowFailure) {
    abort(`STG1_PROCESS_FAILED:${path.basename(command)}:${result.status ?? "null"}`);
  }
  return result;
}

function extractJson(output) {
  const end = output.lastIndexOf("}");
  for (
    let start = output.indexOf("{");
    start >= 0 && end > start;
    start = output.indexOf("{", start + 1)
  ) {
    try {
      return JSON.parse(output.slice(start, end + 1));
    } catch {
      // Try the next opening brace if the CLI printed a prefix.
    }
  }
  abort("STG1_CONVEX_RESULT_NOT_JSON");
}

function readIdentityBinding(identityFile) {
  if (!identityFile) abort("STG1_IDENTITY_MAP_REQUIRED");
  const resolved = path.resolve(projectRoot, identityFile);
  const relative = path.relative(localIdentityRoot, resolved);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    abort("STG1_IDENTITY_MAP_MUST_BE_UNDER_LOCAL_IGNORED_DIRECTORY");
  }
  const binding = JSON.parse(fs.readFileSync(resolved, "utf8"));
  if (
    binding.deploymentName !== STG1_TARGET.deploymentName ||
    binding.fixtureVersion !== FIXTURE_VERSION
  ) {
    abort("STG1_IDENTITY_MAP_TARGET_OR_VERSION_MISMATCH");
  }
  const keys = Object.keys(binding.identities ?? {}).sort();
  if (JSON.stringify(keys) !== JSON.stringify([...AUTHENTICATED_ALIASES].sort())) {
    abort("STG1_IDENTITY_MAP_KEYS_MISMATCH");
  }
  const ids = AUTHENTICATED_ALIASES.map((alias) => binding.identities[alias]);
  if (ids.some((id) => typeof id !== "string" || !/^user_[A-Za-z0-9]+$/u.test(id))) {
    abort("STG1_IDENTITY_MAP_PROVIDER_ID_INVALID");
  }
  if (new Set(ids).size !== ids.length) {
    abort("STG1_IDENTITY_MAP_PROVIDER_ID_DUPLICATE");
  }
  return binding.identities;
}

function validateCandidate(candidate) {
  const tscEntry = path.resolve(
    projectRoot,
    "node_modules",
    "typescript",
    "bin",
    "tsc",
  );
  runProcess(process.execPath, [tscEntry, "--noEmit", "--incremental", "false"], {
    cwd: candidate,
  });
}

assertReleaseTreeHasNoGrantWriter();
if (!fs.existsSync(templatePath)) abort("STG1_OVERLAY_TEMPLATE_MISSING");
const templateSource = fs.readFileSync(templatePath, "utf8");
if (
  !templateSource.includes('insert("communityEntitlements"') ||
  !templateSource.includes('insert("courseEntitlements"') ||
  !templateSource.includes("internalMutation") ||
  templateSource.includes("export const applySyntheticAccess = mutation")
) {
  abort("STG1_OVERLAY_TEMPLATE_CONTRACT_DRIFT");
}

let candidate;
try {
  candidate = createCandidate();
  validateCandidate(candidate);
  const baseDigest = stableFileDigest(path.resolve(projectRoot, "convex"));
  const overlayDigest = stableFileDigest(path.join(candidate, "convex"));

  const applyMode = argv.includes("--apply-access");
  const containMode = argv.includes("--contain-access");
  if (applyMode && containMode) abort("Choose one overlay write mode.");
  if (!applyMode && !containMode) {
    process.stdout.write(
      `${JSON.stringify(
        {
          mode: "local-overlay-validation",
          deploymentName: STG1_TARGET.deploymentName,
          fixtureVersion: FIXTURE_VERSION,
          baseReleaseTreeGrantWriterPresent: false,
          overlayTypecheck: "PASS",
          baseSourceDigest: baseDigest,
          overlaySourceDigest: overlayDigest,
          backendInspected: false,
          writes: 0,
        },
        null,
        2,
      )}\n`,
    );
    process.exitCode = 0;
  } else {
    if (argv.includes("--prod") || argv.includes("--production")) {
      abort("Production is not supported by the STG-1 overlay runner.");
    }
    const envFileInput = valueAfter("--env-file");
    if (!envFileInput) abort("STG1_OVERLAY_ENV_FILE_REQUIRED");
    const envFile = path.resolve(projectRoot, envFileInput);
    validateStg1TargetFile(envFile, STG1_TARGET.deploymentName);
    const identities = readIdentityBinding(valueAfter("--identity-map"));
    if (!argv.includes("--confirm-isolated-staging")) {
      abort("STG1_OVERLAY_ISOLATED_STAGING_CONFIRMATION_REQUIRED");
    }
    if (valueAfter("--confirm-fixture") !== FIXTURE_CONFIRMATION) {
      abort("STG1_OVERLAY_FIXTURE_CONFIRMATION_MISMATCH");
    }
    if (valueAfter("--confirm-overlay-cycle") !== OVERLAY_CONFIRMATION) {
      abort("STG1_OVERLAY_LIFECYCLE_CONFIRMATION_MISMATCH");
    }
    if (
      containMode &&
      valueAfter("--confirm-containment") !==
        "CONTAIN_STG1_SYNTHETIC_ACCESS"
    ) {
      abort("STG1_OVERLAY_CONTAINMENT_CONFIRMATION_MISMATCH");
    }

    const convexEntry = path.resolve(
      projectRoot,
      "node_modules",
      "convex",
      "bin",
      "main.js",
    );
    const baseRunArgs = [
      "run",
      "--env-file",
      envFile,
      "--deployment",
      STG1_TARGET.deploymentName,
    ];
    const previewFunction = applyMode
      ? "stg1Fixtures:previewSyntheticAccessFixtures"
      : "stg1Fixtures:previewSyntheticAccessContainment";
    const previewResult = runProcess(
      process.execPath,
      [convexEntry, ...baseRunArgs, previewFunction, JSON.stringify({ identities })],
      { print: false },
    );
    const plan = extractJson(previewResult.stdout);
    if (valueAfter("--confirm-plan-hash") !== plan.planHash) {
      abort(`STG1_OVERLAY_STALE_PLAN_HASH:${plan.planHash}`);
    }

    const specArgs = [
      "function-spec",
      "--env-file",
      envFile,
      "--deployment-name",
      STG1_TARGET.deploymentName,
    ];
    const beforeSpec = runProcess(process.execPath, [convexEntry, ...specArgs], {
      print: false,
    }).stdout;
    if (beforeSpec.includes("stg1AccessWriter")) {
      abort("STG1_OVERLAY_ALREADY_PRESENT_BEFORE_UPLOAD");
    }
    if (!beforeSpec.includes("stg1Fixtures")) {
      abort("STG1_BASE_FIXTURE_MODULE_NOT_DEPLOYED");
    }

    const devArgs = [
      "dev",
      "--once",
      "--typecheck",
      "enable",
      "--codegen",
      "disable",
      "--tail-logs",
      "disable",
      "--env-file",
      envFile,
    ];
    let overlayUploaded = false;
    let baseRestored = false;
    try {
      runProcess(process.execPath, [convexEntry, ...devArgs], { cwd: candidate });
      overlayUploaded = true;
      const duringSpec = runProcess(
        process.execPath,
        [convexEntry, ...specArgs],
        { print: false },
      ).stdout;
      if (!duringSpec.includes("stg1AccessWriter")) {
        abort("STG1_OVERLAY_NOT_VISIBLE_AFTER_UPLOAD");
      }

      const writerFunction = applyMode
        ? "stg1AccessWriter:applySyntheticAccess"
        : "stg1AccessWriter:containSyntheticAccess";
      const writerArgs = {
        identities,
        confirmFixture: FIXTURE_CONFIRMATION,
        confirmPlanHash: plan.planHash,
        ...(containMode
          ? { confirmContainment: "CONTAIN_STG1_SYNTHETIC_ACCESS" }
          : {}),
      };
      runProcess(process.execPath, [
        convexEntry,
        ...baseRunArgs,
        writerFunction,
        JSON.stringify(writerArgs),
      ]);

      const postPreview = runProcess(
        process.execPath,
        [convexEntry, ...baseRunArgs, previewFunction, JSON.stringify({ identities })],
        { print: false },
      );
      const postPlan = extractJson(postPreview.stdout);
      const expectedStatus = applyMode ? "already_applied" : "already_contained";
      if (postPlan.status !== expectedStatus) {
        abort(`STG1_OVERLAY_POSTCHECK_FAILED:${postPlan.status}`);
      }

      const overlayFile = path.resolve(candidate, "convex", "stg1AccessWriter.ts");
      if (!overlayFile.startsWith(path.resolve(candidate, "convex") + path.sep)) {
        abort("STG1_OVERLAY_REMOVE_TARGET_REJECTED");
      }
      fs.rmSync(overlayFile);
      runProcess(process.execPath, [convexEntry, ...devArgs], { cwd: candidate });
      baseRestored = true;
      const afterSpec = runProcess(
        process.execPath,
        [convexEntry, ...specArgs],
        { print: false },
      ).stdout;
      if (afterSpec.includes("stg1AccessWriter")) {
        abort("STG1_OVERLAY_STILL_VISIBLE_AFTER_RESTORE");
      }
      if (!afterSpec.includes("stg1Fixtures")) {
        abort("STG1_BASE_MODULE_MISSING_AFTER_RESTORE");
      }
      process.stdout.write(
        `${JSON.stringify(
          {
            mode: applyMode ? "apply-access" : "contain-access",
            deploymentName: STG1_TARGET.deploymentName,
            fixtureVersion: FIXTURE_VERSION,
            baseSourceDigest: baseDigest,
            overlaySourceDigest: overlayDigest,
            overlayObservedBefore: false,
            overlayObservedDuring: true,
            overlayObservedAfter: false,
            dataPostcheck: expectedStatus,
            baseRestored: true,
            providerIdsIncludedInResult: false,
            personalDataIncludedInResult: false,
          },
          null,
          2,
        )}\n`,
      );
    } finally {
      if (overlayUploaded && !baseRestored) {
        const overlayFile = path.resolve(
          candidate,
          "convex",
          "stg1AccessWriter.ts",
        );
        if (fs.existsSync(overlayFile)) fs.rmSync(overlayFile);
        const restore = runProcess(process.execPath, [convexEntry, ...devArgs], {
          cwd: candidate,
          allowFailure: true,
        });
        if (restore.status !== 0) {
          process.stderr.write(
            "STG1_OVERLAY_RESTORE_FAILED: ephemeral writer may still be deployed; stop all testing and inspect function metadata.\n",
          );
          process.exitCode = 2;
        }
      }
    }
  }
} catch (error) {
  process.stderr.write(
    `${error instanceof Error ? error.message : "STG1_OVERLAY_UNKNOWN_ERROR"}\n`,
  );
  if (!process.exitCode) process.exitCode = 1;
} finally {
  if (candidate && fs.existsSync(candidate)) safeRemoveCandidate(candidate);
}
