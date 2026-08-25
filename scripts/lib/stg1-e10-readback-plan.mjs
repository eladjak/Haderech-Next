import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

export function extractJsonObjects(source) {
  const text = String(source);
  const objects = [];
  let start = -1;
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (start < 0) {
      if (character === "{") {
        start = index;
        depth = 1;
        inString = false;
        escaped = false;
      }
      continue;
    }
    if (inString) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === '"') inString = false;
      continue;
    }
    if (character === '"') {
      inString = true;
      continue;
    }
    if (character === "{") depth += 1;
    if (character === "}") depth -= 1;
    if (depth !== 0) continue;
    try {
      const parsed = JSON.parse(text.slice(start, index + 1));
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        objects.push(parsed);
      }
    } catch {
      // Ignore non-JSON braces from tool output and continue scanning.
    }
    start = -1;
  }
  return objects;
}

export function findLastJsonObject(source, predicate) {
  const matches = extractJsonObjects(source).filter(predicate);
  if (matches.length === 0) {
    throw new Error("STG1_E10:EXPECTED_JSON_OBJECT_NOT_FOUND");
  }
  return matches.at(-1);
}

export function sha256Bytes(value) {
  return createHash("sha256").update(value).digest("hex");
}

export function sha256File(filePath) {
  return sha256Bytes(fs.readFileSync(filePath));
}

export function stableDirectoryDigest(root) {
  const files = [];
  const walk = (directory) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const full = path.join(directory, entry.name);
      if (entry.isDirectory()) walk(full);
      else files.push(full);
    }
  };
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

export function validateExternalArtifactPath(projectRoot, input) {
  if (!input || !path.isAbsolute(input)) {
    throw new Error("STG1_E10:ABSOLUTE_ARTIFACT_PATH_REQUIRED");
  }
  const resolved = path.resolve(input);
  const relative = path.relative(projectRoot, resolved);
  if ((!relative.startsWith("..") && !path.isAbsolute(relative)) || !fs.existsSync(resolved)) {
    throw new Error("STG1_E10:ARTIFACT_MUST_EXIST_OUTSIDE_PROJECT");
  }
  if (!fs.statSync(resolved).isFile() || fs.statSync(resolved).size === 0) {
    throw new Error("STG1_E10:ARTIFACT_FILE_EMPTY_OR_INVALID");
  }
  return resolved;
}

export function parseConvexEnvironmentNames(source) {
  const names = [];
  for (const rawLine of String(source).split(/\r?\n/u)) {
    const line = rawLine.trim();
    const match = line.match(/^([A-Z_][A-Z0-9_]*)=/u);
    if (match) names.push(match[1]);
  }
  return new Set(names);
}

export function extractRuntimeConvexHosts(source) {
  const withoutSdkExample = String(source).replace(
    /ConvexReactClient requires a URL like ['"]https:\/\/[a-z0-9-]+\.convex\.cloud['"]/giu,
    "ConvexReactClient requires a URL",
  );
  return new Set(
    [...withoutSdkExample.matchAll(/https:\/\/([a-z0-9-]+\.convex\.cloud)/giu)].map(
      (match) => match[1].toLowerCase(),
    ),
  );
}

function hasAll(source, fragments) {
  return fragments.every((fragment) => String(source).includes(fragment));
}

export function validatePhaseArtifact(id, source) {
  if (id === "E03") {
    return hasAll(source, [
      "# E03 execution evidence",
      "STG1_LEGACY_COURSE:STALE_PLAN_HASH",
      "`status`: `seeded`",
      "75 required lessons, 0 optional lessons",
      "There are no tokens here yet.",
    ]);
  }
  if (id === "E04") {
    return hasAll(source, [
      "## Execution result — completed",
      "RECEIVING_PRACTICE_MIGRATION:STALE_PLAN_HASH",
      "Apply result: `success: true`, `status: applied`",
      "75 required, 1 optional, 76 total",
      "No Production, Vercel, Clerk-user, payment, or public action occurred",
    ]);
  }
  if (id === "E05") {
    try {
      const result = findLastJsonObject(
        source,
        (value) => value?.status === "seeded" || value?.status === "already_seeded",
      );
      return (
        (result.status === "seeded"
          ? result.success === true && result.insertedUsers === 7
          : result.counts?.users === 7) &&
        result.providerIdsIncludedInResult === false &&
        result.personalDataIncludedInResult === false
      );
    } catch {
      return false;
    }
  }
  if (id === "E06" || id === "E08") {
    try {
      const expectedMode = id === "E06" ? "apply-access" : "contain-access";
      const expectedPostcheck = id === "E06" ? "already_applied" : "already_contained";
      const result = findLastJsonObject(source, (value) => value?.mode === expectedMode);
      return (
        result.overlayObservedBefore === false &&
        result.overlayObservedDuring === true &&
        result.overlayObservedAfter === false &&
        result.dataPostcheck === expectedPostcheck &&
        result.baseRestored === true &&
        result.providerIdsIncludedInResult === false &&
        result.personalDataIncludedInResult === false
      );
    } catch {
      return false;
    }
  }
  if (id === "E07") {
    try {
      const result = JSON.parse(String(source));
      return (
        result?.evidenceId === "E07" &&
        result?.summary?.failed === 0 &&
        result?.summary?.terminalFailure === false &&
        Array.isArray(result?.checks) &&
        result.checks.length === 94 &&
        result.checks.every((check) => check?.status === "PASS")
      );
    } catch {
      return false;
    }
  }
  if (id === "E09") {
    try {
      const result = findLastJsonObject(
        source,
        (value) => value?.sameVersionApplyBlocked !== undefined,
      );
      return (
        result.contained === true &&
        result.sameVersionApplyBlocked === true &&
        result.markerState === "rolled_back" &&
        result.requiredLessonCount === 75 &&
        result.optionalLessonCount === 0 &&
        result.totalLessonCount === 75
      );
    } catch {
      return false;
    }
  }
  return false;
}

export function buildPhaseEvidence(artifacts) {
  return Object.entries(artifacts).map(([id, filePath]) => {
    const source = fs.readFileSync(filePath, "utf8");
    return Object.freeze({
      id,
      status: validatePhaseArtifact(id, source) ? "PASS" : "FAIL",
      sha256: sha256File(filePath),
      readBack: validatePhaseArtifact(id, source),
    });
  });
}

export function redactReadbackOutput(value, extra = []) {
  let redacted = String(value)
    .replace(/\bsk_(?:test|live)_[A-Za-z0-9_-]+\b/gu, "[REDACTED_CLERK_SECRET]")
    .replace(/\bpk_(?:test|live)_[A-Za-z0-9_-]+\b/gu, "[REDACTED_CLERK_PUBLIC]")
    .replace(/\buser_[A-Za-z0-9]+\b/gu, "[REDACTED_PROVIDER_ID]")
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/giu, "[REDACTED_EMAIL]");
  for (const valueToHide of extra) {
    if (!valueToHide) continue;
    redacted = redacted.split(String(valueToHide)).join("[REDACTED_VALUE]");
  }
  return redacted;
}
