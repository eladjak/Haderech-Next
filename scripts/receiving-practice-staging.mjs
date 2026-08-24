/**
 * Guarded wrapper for the receiving-practice staging migration.
 *
 * Offline by default. It never selects production and requires an explicitly
 * named staging env file for every backend read or write.
 */

import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  STG1_TARGET,
  validateStg1TargetFile,
} from "./lib/stg1-target-guard.mjs";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, "..");
const dataPath = path.join(projectRoot, "convex", "receivingPracticeMigrationData.json");
const argv = process.argv.slice(2);
const expectedDigest = "sha256:160d45adaf1d2c3fd83db048c4e871c0b3653e1ad29d1078029ae280b34fce5a";

function stableStringify(value) {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }
  return `{${Object.keys(value)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
    .join(",")}}`;
}

function valueAfter(flag) {
  const at = argv.indexOf(flag);
  if (at >= 0) return argv[at + 1];
  const inline = argv.find((value) => value.startsWith(`${flag}=`));
  return inline?.slice(flag.length + 1);
}

function fail(message) {
  process.stderr.write(`${message}\n`);
  process.exit(1);
}

if (argv.includes("--prod") || argv.includes("--production")) {
  fail("Production is not supported by this staging-only wrapper.");
}

const sourceBytes = fs.readFileSync(dataPath);
const data = JSON.parse(sourceBytes.toString("utf8"));
const canonicalPayload = stableStringify(data);
const actualDigest = `sha256:${createHash("sha256").update(canonicalPayload).digest("hex")}`;
if (actualDigest !== expectedDigest) {
  fail(`Canonical migration payload drift: expected ${expectedDigest}, got ${actualDigest}.`);
}
const mode = argv.includes("--apply")
  ? "staging-apply"
  : argv.includes("--rollback")
    ? "staging-rollback"
    : argv.includes("--inspect-staging")
      ? "staging-preview"
      : "offline-dry-run";
const needsBackend = mode !== "offline-dry-run";
const envFile = valueAfter("--env-file");

if (needsBackend) {
  if (!envFile) fail(`${mode} requires --env-file <isolated-staging-env-file>.`);
  try {
    const target = validateStg1TargetFile(envFile, STG1_TARGET.deploymentName);
    process.stdout.write(`${JSON.stringify({ mode, ...target }, null, 2)}\n`);
  } catch (error) {
    fail(error instanceof Error ? error.message : "STG1_TARGET_GUARD:UNKNOWN_ERROR");
  }
}
if (argv.filter((arg) => ["--apply", "--rollback", "--inspect-staging"].includes(arg)).length > 1) {
  fail("Choose exactly one of --inspect-staging, --apply, or --rollback.");
}

const plan = {
  mode,
  migrationKey: data.migrationKey,
  migrationVersion: data.migrationVersion,
  sourceDigest: actualDigest,
  targetCourse: data.courseTitle,
  targetScriptIndex: data.lesson.scriptIndex,
  backendInspected: false,
  invariants:
    "fail on duplicate course/lesson/version identities or quiz attempts; preserve progress rows; shift only lesson order; write a reversible version marker",
};
process.stdout.write(`${JSON.stringify(plan, null, 2)}\n`);
if (!needsBackend) {
  process.stdout.write("Offline dry run verified source bytes only; it makes no deployment-state claim.\n");
  process.exit(0);
}

const npx = process.platform === "win32" ? "npx.cmd" : "npx";
const baseArgs = [
  "convex",
  "run",
  "--env-file",
  envFile,
  "--deployment",
  STG1_TARGET.deploymentName,
];
function extractJson(output) {
  const end = output.lastIndexOf("}");
  for (let start = output.indexOf("{"); start >= 0 && end > start; start = output.indexOf("{", start + 1)) {
    try {
      return JSON.parse(output.slice(start, end + 1));
    } catch {
      // Convex CLI may print a prefix; try the next object boundary.
    }
  }
  fail("Convex CLI did not return a parseable JSON result.");
}

function run(functionName, args, capture = false) {
  const command = [...baseArgs, functionName];
  if (args) command.push(JSON.stringify(args));
  const result = spawnSync(npx, command, {
    cwd: projectRoot,
    encoding: capture ? "utf8" : undefined,
    stdio: capture ? ["ignore", "pipe", "inherit"] : "inherit",
  });
  if (result.error) fail(`Could not start Convex CLI: ${result.error.message}`);
  if (result.status !== 0) process.exit(result.status ?? 1);
  if (capture) {
    process.stdout.write(result.stdout);
    return extractJson(result.stdout);
  }
}

const inspectedPlan = run(
  "receivingPracticeMigration:previewReceivingPracticeMigration",
  undefined,
  true,
);
if (mode === "staging-preview") process.exit(0);

const confirmedVersion = valueAfter("--confirm-version");
const confirmedDigest = valueAfter("--confirm-source-digest");
if (confirmedVersion !== data.migrationVersion || confirmedDigest !== actualDigest) {
  fail(
    `Confirmation mismatch. Pass --confirm-version ${data.migrationVersion} --confirm-source-digest ${actualDigest}.`,
  );
}
if (!argv.includes("--confirm-isolated-staging")) {
  fail("Refusing a write without --confirm-isolated-staging.");
}
if (mode === "staging-apply") {
  const confirmedPlanHash = valueAfter("--confirm-plan-hash");
  if (!confirmedPlanHash || confirmedPlanHash !== inspectedPlan.planHash) {
    fail(
      `Stale or missing plan confirmation. Pass --confirm-plan-hash ${inspectedPlan.planHash} from this preview.`,
    );
  }
  run("receivingPracticeMigration:applyReceivingPracticeMigration", {
    confirmMigrationVersion: data.migrationVersion,
    confirmSourceDigest: actualDigest,
    confirmPlanHash: inspectedPlan.planHash,
  });
  const postcheck = run(
    "receivingPracticeMigration:verifyReceivingPracticeMigration",
    undefined,
    true,
  );
  if (!postcheck.contained) {
    fail("Postcheck did not prove 75 required + 1 optional in the versioned state.");
  }
} else {
  if (valueAfter("--confirm-rollback") !== "ROLLBACK_RECEIVING_PRACTICE") {
    fail("Rollback additionally requires --confirm-rollback ROLLBACK_RECEIVING_PRACTICE.");
  }
  run("receivingPracticeMigration:rollbackReceivingPracticeMigration", {
    confirmMigrationVersion: data.migrationVersion,
    confirmSourceDigest: actualDigest,
    confirmRollback: "ROLLBACK_RECEIVING_PRACTICE",
  });
}
