/**
 * Target-pinned launcher for the authenticated STG-1 browser/API matrix.
 * It passes the Clerk Development secret only through the child environment.
 */

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseDotEnvForTargetGuard } from "./lib/stg1-target-guard.mjs";
import {
  STG1_CLERK,
  assertDevelopmentClerkKeys,
  validateAccountMap,
  validateLocalStg1Path,
  validateStg1PreviewUrl,
} from "./lib/stg1-clerk-plan.mjs";

const moduleDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(moduleDir, "..");
const require = createRequire(import.meta.url);
const playwrightEntry = path.join(
  path.dirname(require.resolve("@playwright/test/package.json")),
  "cli.js",
);
const argv = process.argv.slice(2);

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
  fail("STG1_E07:PRODUCTION_FORBIDDEN");
}
if (valueAfter("--confirm") !== STG1_CLERK.e07Confirmation) {
  fail(`STG1_E07:CONFIRMATION_REQUIRED:${STG1_CLERK.e07Confirmation}`);
}

const envInput = valueAfter("--env-file");
const baseUrlInput = valueAfter("--base-url");
const evidenceInput = valueAfter("--evidence-file");
if (!envInput || !baseUrlInput || !evidenceInput) {
  fail("STG1_E07:ENV_BASE_URL_AND_EVIDENCE_FILE_REQUIRED");
}
const envFile = path.resolve(projectRoot, envInput);
const values = parseDotEnvForTargetGuard(fs.readFileSync(envFile, "utf8"));
const { secretKey } = assertDevelopmentClerkKeys(values);
const baseUrl = validateStg1PreviewUrl(baseUrlInput);

const accountMapPath = validateLocalStg1Path(
  projectRoot,
  valueAfter("--account-map") ?? ".stg1/clerk-accounts.local.json",
);
const identityMapPath = validateLocalStg1Path(
  projectRoot,
  valueAfter("--identity-map") ?? ".stg1/identities.local.json",
);
validateAccountMap(JSON.parse(fs.readFileSync(accountMapPath, "utf8")));
if (!fs.existsSync(identityMapPath)) {
  fail("STG1_E07:IDENTITY_MAP_MISSING");
}

const evidenceFile = path.resolve(evidenceInput);
if (
  !path.isAbsolute(evidenceInput) ||
  path.extname(evidenceFile).toLowerCase() !== ".json" ||
  path.basename(evidenceFile) !== "e07-access-matrix.json" ||
  path.relative(projectRoot, evidenceFile).startsWith("..") === false
) {
  fail("STG1_E07:EVIDENCE_FILE_MUST_BE_ABSOLUTE_JSON_OUTSIDE_PROJECT");
}
fs.mkdirSync(path.dirname(evidenceFile), { recursive: true });

process.stdout.write(
  `${JSON.stringify(
    {
      mode: "stg1-e07-browser-api-matrix",
      deploymentName: STG1_CLERK.deploymentName,
      fixtureVersion: STG1_CLERK.fixtureVersion,
      previewHost: new URL(baseUrl).hostname,
      clerkEnvironment: "development",
      authenticatedIdentities: STG1_CLERK.aliases.length,
      traces: false,
      screenshots: false,
      credentialsStored: false,
      providerIdsReturned: false,
    },
    null,
    2,
  )}\n`,
);

const result = spawnSync(
  process.execPath,
  [playwrightEntry, "test", "--config", "playwright.stg1.config.ts"],
  {
    cwd: projectRoot,
    encoding: "utf8",
    stdio: "inherit",
    env: {
      ...process.env,
      CLERK_SECRET_KEY: secretKey,
      STG1_BASE_URL: baseUrl,
      STG1_ACCOUNT_MAP: accountMapPath,
      STG1_IDENTITY_MAP: identityMapPath,
      STG1_EVIDENCE_FILE: evidenceFile,
      STG1_E07_CONFIRMATION: STG1_CLERK.e07Confirmation,
    },
  },
);
if (result.error) fail("STG1_E07:PLAYWRIGHT_PROCESS_START_FAILED");
process.exit(result.status ?? 1);
