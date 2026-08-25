/**
 * Deterministic E10 adjudicator.
 *
 * It performs no provider calls and no Git operations. It reads a sanitized
 * evidence bundle assembled from live read-backs, writes the exact PASS/FAIL
 * matrix outside the repository, and exits non-zero unless every predicate is
 * proved.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { evaluateStg1FinalBundle } from "./lib/stg1-final-audit.mjs";

const moduleDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(moduleDir, "..");
const argv = process.argv.slice(2);
const confirmation = "AUDIT_STG1_E10_CONTENT_DOG_757";

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

function validateExternalJsonPath(input, expectedName) {
  if (!input || !path.isAbsolute(input)) {
    throw new Error("STG1_E10:ABSOLUTE_EXTERNAL_JSON_PATH_REQUIRED");
  }
  const resolved = path.resolve(input);
  const relative = path.relative(projectRoot, resolved);
  if (
    path.basename(resolved) !== expectedName ||
    (!relative.startsWith("..") && !path.isAbsolute(relative))
  ) {
    throw new Error("STG1_E10:EVIDENCE_PATH_MUST_BE_OUTSIDE_PROJECT");
  }
  return resolved;
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

if (argv.includes("--prod") || argv.includes("--production")) {
  fail("STG1_E10:PRODUCTION_FORBIDDEN");
}
if (valueAfter("--confirm") !== confirmation) {
  fail(`STG1_E10:CONFIRMATION_REQUIRED:${confirmation}`);
}

try {
  const inputFile = validateExternalJsonPath(
    valueAfter("--input"),
    "e10-final-input.json",
  );
  const outputFile = validateExternalJsonPath(
    valueAfter("--output"),
    "e10-final-matrix.json",
  );
  const bundle = JSON.parse(fs.readFileSync(inputFile, "utf8"));
  const result = evaluateStg1FinalBundle(bundle);
  writeJsonAtomic(outputFile, result);
  process.stdout.write(
    `${JSON.stringify(
      {
        evidenceId: result.evidenceId,
        status: result.status,
        deploymentName: result.deploymentName,
        fixtureVersion: result.fixtureVersion,
        branch: result.branch,
        commitSha: result.commitSha,
        summary: result.summary,
        productionTouched: result.productionTouched,
        secretsIncluded: result.secretsIncluded,
        providerIdsIncluded: result.providerIdsIncluded,
        personalDataIncluded: result.personalDataIncluded,
        contentIncluded: result.contentIncluded,
        outputFile,
      },
      null,
      2,
    )}\n`,
  );
  if (result.status !== "PASS") process.exit(1);
} catch (error) {
  fail(error instanceof Error ? error.message : "STG1_E10:UNKNOWN_ERROR");
}
