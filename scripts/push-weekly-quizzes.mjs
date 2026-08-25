/**
 * Guarded wrapper for the deterministic weekly-quiz seed.
 *
 * The former implementation called learner/public functions over raw HTTP,
 * skipped every existing quiz, and therefore left stale production content in
 * place. It also coupled quiz sync to an unrelated course-image mutation.
 *
 * This wrapper now verifies the canonical generated artifact and delegates to
 * the single server-side upsert. It is offline by default. This audit does not
 * execute the --apply path.
 *
 * Usage:
 *   node scripts/push-weekly-quizzes.mjs --dry-run
 *   node scripts/push-weekly-quizzes.mjs --apply \
 *     --confirm-source-digest sha256:<digest>
 *
 * Production additionally requires both --prod and --confirm-production.
 * The target deployment must independently opt in with SEED_ENABLED=true.
 */

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(SCRIPT_DIR, "..");
const GENERATED_PATH = path.join(PROJECT_ROOT, "convex", "weeklyQuizData.generated.json");
const argv = process.argv.slice(2);

function valueAfter(flag) {
  const index = argv.indexOf(flag);
  if (index >= 0) return argv[index + 1];
  const inline = argv.find((value) => value.startsWith(`${flag}=`));
  return inline ? inline.slice(flag.length + 1) : undefined;
}

function fail(message) {
  process.stderr.write(`${message}\n`);
  process.exit(1);
}

if (argv.includes("--url") || argv.some((value) => value.startsWith("--url="))) {
  fail(
    "The unauthenticated raw-HTTP push path was removed. Use the guarded Convex seed wrapper instead."
  );
}

const apply = argv.includes("--apply");
const dryRun = argv.includes("--dry-run") || !apply;
const production = argv.includes("--prod");
if (apply && argv.includes("--dry-run")) fail("Choose --apply or --dry-run, not both.");
if (production && !apply) fail("--prod is meaningful only together with --apply.");

const verify = spawnSync(
  process.execPath,
  [path.join(SCRIPT_DIR, "sync-weekly-quizzes.mjs"), "--check"],
  { cwd: PROJECT_ROOT, stdio: "inherit" }
);
if (verify.status !== 0) {
  fail("Canonical weekly-quiz verification failed; no backend command was run.");
}

const generated = JSON.parse(fs.readFileSync(GENERATED_PATH, "utf8"));
const plan = {
  mode: dryRun ? "offline-dry-run" : production ? "production-apply" : "development-apply",
  sourceDigest: generated.sourceDigest,
  weeks: generated.totals.weeks,
  canonicalItems: generated.totals.canonicalItems,
  gradedItemsToUpsert: generated.totals.gradedItems,
  explicitlyExcludedReflections: generated.totals.excludedItems,
  serverBehavior:
    "create or patch only source-owned quizzes; fail atomically on foreign rows, duplicate identity, missing lessons, or historical attempts that require versioned migration",
  backendInspected: false,
};
process.stdout.write(`${JSON.stringify(plan, null, 2)}\n`);

if (dryRun) {
  process.stdout.write(
    "Dry run is offline: it verifies source integrity but does not claim what is currently deployed.\n"
  );
  process.exit(0);
}

const confirmedDigest = valueAfter("--confirm-source-digest");
if (confirmedDigest !== generated.sourceDigest) {
  fail(
    `Refusing to apply: pass --confirm-source-digest ${generated.sourceDigest} after reviewing the generated artifact.`
  );
}
if (production && !argv.includes("--confirm-production")) {
  fail("Refusing production apply without --confirm-production.");
}

process.stdout.write(
  "About to invoke the guarded server-side upsert. Confirm backup/rollback readiness before using this path.\n"
);
const npx = process.platform === "win32" ? "npx.cmd" : "npx";
const convexArgs = ["convex", "run"];
if (production) convexArgs.push("--prod");
convexArgs.push("seedWeeklyQuizzes:seedWeeklyQuizzes");
const result = spawnSync(npx, convexArgs, { cwd: PROJECT_ROOT, stdio: "inherit" });
if (result.error) fail(`Could not start Convex CLI: ${result.error.message}`);
process.exit(result.status ?? 1);
