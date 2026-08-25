/**
 * Remote stdin-preserving Vercel CLI launcher for STG-1.
 *
 * `npx` consumes piped stdin before Vercel CLI 59 can read environment values.
 * This launcher resolves only an already-cached official `vercel` package under
 * npm's `_npx` cache and executes its entry point with inherited stdio.
 */

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const cacheRoot = "/root/.npm/_npx";
const expectedSuffix = path.join("node_modules", "vercel", "dist", "index.js");

function fail(message) {
  process.stderr.write(`${message}\n`);
  process.exit(1);
}

if (process.platform !== "linux" || !fs.existsSync(cacheRoot)) {
  fail("STG1_VERCEL_LAUNCHER:CACHE_ROOT_MISSING");
}

const candidates = fs
  .readdirSync(cacheRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && /^[a-f0-9]+$/u.test(entry.name))
  .map((entry) => path.resolve(cacheRoot, entry.name, expectedSuffix))
  .filter(
    (entry) =>
      entry.startsWith(`${path.resolve(cacheRoot)}${path.sep}`) &&
      fs.existsSync(entry),
  )
  .sort(
    (left, right) =>
      fs.statSync(right).mtimeMs - fs.statSync(left).mtimeMs,
  );

if (candidates.length === 0) {
  fail("STG1_VERCEL_LAUNCHER:CACHED_CLI_MISSING");
}

const result = spawnSync(process.execPath, [candidates[0], ...process.argv.slice(2)], {
  stdio: "inherit",
});
if (result.error) fail(`STG1_VERCEL_LAUNCHER:START_FAILED:${result.error.message}`);
process.exit(result.status ?? 1);
