/**
 * Target-pinned runner for the STG-1 synthetic fixture package.
 * Offline by default; never pushes functions and never selects Production.
 */

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  STG1_TARGET,
  validateStg1TargetFile,
} from "./lib/stg1-target-guard.mjs";

const moduleDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(moduleDir, "..");
const require = createRequire(import.meta.url);
const convexEntry = path.join(
  path.dirname(require.resolve("convex/package.json")),
  "bin",
  "main.js",
);
const localIdentityRoot = path.resolve(projectRoot, ".stg1");
const argv = process.argv.slice(2);
const FIXTURE_VERSION = "stg1-v1";
const FIXTURE_CONFIRMATION = "STG1_CONTENT_DOG_757_V1";
const AUTHENTICATED_ALIASES = [
  "U0",
  "A",
  "B",
  "E",
  "X",
  "ADMIN",
  "IMPOSTOR",
];

function fail(message) {
  process.stderr.write(`${message}\n`);
  process.exit(1);
}

function valueAfter(flag) {
  const at = argv.indexOf(flag);
  if (at >= 0) return argv[at + 1];
  const inline = argv.find((value) => value.startsWith(`${flag}=`));
  return inline?.slice(flag.length + 1);
}

if (argv.includes("--prod") || argv.includes("--production")) {
  fail("Production is not supported by the STG-1 fixture runner.");
}
if (argv.includes("--push")) {
  fail("The fixture runner never uses convex run --push.");
}

const modes = [
  ["--inspect-state", "inspect-state"],
  ["--preview-course", "preview-course"],
  ["--seed-course", "seed-course"],
  ["--preview-identities", "preview-identities"],
  ["--seed-identities", "seed-identities"],
  ["--preview-access", "preview-access"],
  ["--preview-containment", "preview-containment"],
].filter(([flag]) => argv.includes(flag));
if (modes.length > 1) fail("Choose exactly one STG-1 fixture mode.");
const mode = modes[0]?.[1] ?? "offline-dry-run";
const needsBackend = mode !== "offline-dry-run";
const writeModes = new Set([
  "seed-course",
  "seed-identities",
]);
const identityModes = new Set([
  "preview-identities",
  "seed-identities",
  "preview-access",
  "preview-containment",
]);

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.resolve(projectRoot, relativePath), "utf8"));
}

const targetManifest = readJson("docs/staging/stg1-target-manifest.json");
const identityManifest = readJson("docs/staging/stg1-identity-manifest.json");
const fixtureManifest = readJson("docs/staging/stg1-fixture-manifest.json");
const evidenceChecklist = readJson("docs/staging/stg1-evidence-checklist.json");
for (const [name, manifest] of Object.entries({
  targetManifest,
  identityManifest,
  fixtureManifest,
  evidenceChecklist,
})) {
  if (manifest.deploymentName !== STG1_TARGET.deploymentName) {
    fail(`STG1_MANIFEST_TARGET_MISMATCH:${name}`);
  }
}
if (
  identityManifest.fixtureVersion !== FIXTURE_VERSION ||
  fixtureManifest.fixtureVersion !== FIXTURE_VERSION ||
  evidenceChecklist.fixtureVersion !== FIXTURE_VERSION
) {
  fail("STG1_MANIFEST_FIXTURE_VERSION_MISMATCH");
}
if (
  JSON.stringify(identityManifest.identities.map((row) => row.alias)) !==
  JSON.stringify(["ANON", ...AUTHENTICATED_ALIASES])
) {
  fail("STG1_IDENTITY_MANIFEST_ALIAS_DRIFT");
}

let identities;
if (identityModes.has(mode)) {
  const identityFile = valueAfter("--identity-map");
  if (!identityFile) fail(`${mode} requires --identity-map <local-binding-file>.`);
  const resolved = path.resolve(projectRoot, identityFile);
  const relative = path.relative(localIdentityRoot, resolved);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    fail("STG1_IDENTITY_MAP_MUST_BE_UNDER_LOCAL_IGNORED_DIRECTORY");
  }
  const binding = JSON.parse(fs.readFileSync(resolved, "utf8"));
  if (
    binding.deploymentName !== STG1_TARGET.deploymentName ||
    binding.fixtureVersion !== FIXTURE_VERSION
  ) {
    fail("STG1_IDENTITY_MAP_TARGET_OR_VERSION_MISMATCH");
  }
  const keys = Object.keys(binding.identities ?? {}).sort();
  if (JSON.stringify(keys) !== JSON.stringify([...AUTHENTICATED_ALIASES].sort())) {
    fail("STG1_IDENTITY_MAP_KEYS_MISMATCH");
  }
  const ids = AUTHENTICATED_ALIASES.map((alias) => binding.identities[alias]);
  if (ids.some((id) => typeof id !== "string" || !/^user_[A-Za-z0-9]+$/u.test(id))) {
    fail("STG1_IDENTITY_MAP_PROVIDER_ID_INVALID");
  }
  if (new Set(ids).size !== ids.length) {
    fail("STG1_IDENTITY_MAP_PROVIDER_ID_DUPLICATE");
  }
  identities = binding.identities;
}

const envFile = valueAfter("--env-file");
if (needsBackend) {
  if (!envFile) fail(`${mode} requires --env-file <isolated-staging-env-file>.`);
  try {
    const target = validateStg1TargetFile(envFile, STG1_TARGET.deploymentName);
    process.stdout.write(
      `${JSON.stringify({ mode, fixtureVersion: FIXTURE_VERSION, ...target }, null, 2)}\n`,
    );
  } catch (error) {
    fail(error instanceof Error ? error.message : "STG1_TARGET_GUARD:UNKNOWN_ERROR");
  }
}

if (!needsBackend) {
  process.stdout.write(
    `${JSON.stringify(
      {
        mode,
        fixtureVersion: FIXTURE_VERSION,
        deploymentName: STG1_TARGET.deploymentName,
        manifestsVerified: 4,
        identities: { anonymous: 1, authenticated: 7 },
        expectedLegacyCourse: { courses: 1, requiredLessons: 75, optionalLessons: 0 },
        backendInspected: false,
        writes: 0,
      },
      null,
      2,
    )}\n`,
  );
  process.stdout.write(
    "Offline fixture check passed; it makes no deployment-state or Preview claim.\n",
  );
  process.exit(0);
}

const baseArgs = [
  convexEntry,
  "run",
  "--env-file",
  envFile,
  "--deployment-name",
  STG1_TARGET.deploymentName,
];

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
      // Convex CLI may print a prefix; try the next object boundary.
    }
  }
  fail("Convex CLI did not return a parseable JSON result.");
}

function run(functionName, args) {
  const command = [...baseArgs, functionName];
  if (args) command.push(JSON.stringify(args));
  const result = spawnSync(process.execPath, command, {
    cwd: projectRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"],
  });
  if (result.error) fail(`Could not start Convex CLI: ${result.error.message}`);
  if (result.status !== 0) process.exit(result.status ?? 1);
  process.stdout.write(result.stdout);
  return extractJson(result.stdout);
}

const previewByMode = {
  "seed-course": ["stg1Fixtures:previewLegacyCourseBaseline", undefined],
  "seed-identities": ["stg1Fixtures:previewSyntheticIdentityRows", { identities }],
};
const readByMode = {
  "inspect-state": ["stg1Fixtures:inspectStg1FixtureState", undefined],
  "preview-course": ["stg1Fixtures:previewLegacyCourseBaseline", undefined],
  "preview-identities": ["stg1Fixtures:previewSyntheticIdentityRows", { identities }],
  "preview-access": ["stg1Fixtures:previewSyntheticAccessFixtures", { identities }],
  "preview-containment": ["stg1Fixtures:previewSyntheticAccessContainment", { identities }],
};
if (!writeModes.has(mode)) {
  const [fn, args] = readByMode[mode];
  run(fn, args);
  process.exit(0);
}

const [previewFunction, previewArgs] = previewByMode[mode];
const plan = run(previewFunction, previewArgs);
if (!argv.includes("--confirm-isolated-staging")) {
  fail("Refusing a write without --confirm-isolated-staging.");
}
if (valueAfter("--confirm-fixture") !== FIXTURE_CONFIRMATION) {
  fail(`Write requires --confirm-fixture ${FIXTURE_CONFIRMATION}.`);
}
if (valueAfter("--confirm-plan-hash") !== plan.planHash) {
  fail(`Stale or missing plan confirmation. Pass --confirm-plan-hash ${plan.planHash}.`);
}

const commonWriteArgs = {
  confirmFixture: FIXTURE_CONFIRMATION,
  confirmPlanHash: plan.planHash,
};
if (mode === "seed-course") {
  run("stg1Fixtures:seedLegacyCourseBaseline", commonWriteArgs);
} else if (mode === "seed-identities") {
  run("stg1Fixtures:seedSyntheticIdentityRows", {
    identities,
    ...commonWriteArgs,
  });
} else {
  fail("Unsupported STG-1 fixture write mode.");
}
