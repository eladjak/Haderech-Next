import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const moduleDir = path.dirname(fileURLToPath(import.meta.url));
const manifestPath = path.resolve(
  moduleDir,
  "..",
  "..",
  "docs",
  "staging",
  "stg1-target-manifest.json",
);

export const STG1_TARGET = Object.freeze(
  JSON.parse(fs.readFileSync(manifestPath, "utf8")),
);

function unquote(value) {
  if (
    value.length >= 2 &&
    ((value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'")))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

export function parseDotEnvForTargetGuard(source) {
  const values = new Map();
  for (const [index, rawLine] of String(source).split(/\r?\n/u).entries()) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const normalized = line.startsWith("export ") ? line.slice(7).trim() : line;
    const separator = normalized.indexOf("=");
    if (separator <= 0) {
      throw new Error(`STG1_TARGET_GUARD:INVALID_ENV_LINE:${index + 1}`);
    }
    const key = normalized.slice(0, separator).trim();
    const value = unquote(normalized.slice(separator + 1).trim());
    if (!/^[A-Z_][A-Z0-9_]*$/u.test(key)) {
      throw new Error(`STG1_TARGET_GUARD:INVALID_ENV_KEY:${index + 1}`);
    }
    if (values.has(key)) {
      throw new Error(`STG1_TARGET_GUARD:DUPLICATE_ENV_KEY:${key}`);
    }
    values.set(key, value);
  }
  return values;
}

export function validateStg1Target({ envFile, envSource, requestedDeployment }) {
  const envBase = path.basename(envFile).toLowerCase();
  if (!envBase.includes("staging") || envBase === ".env.local") {
    throw new Error("STG1_TARGET_GUARD:ENV_FILENAME_NOT_STAGING");
  }
  if (requestedDeployment !== STG1_TARGET.deploymentName) {
    throw new Error("STG1_TARGET_GUARD:CLI_DEPLOYMENT_MISMATCH");
  }

  const values = parseDotEnvForTargetGuard(envSource);
  const deployKey = values.get("CONVEX_DEPLOY_KEY");
  if (!deployKey) {
    throw new Error("STG1_TARGET_GUARD:MISSING_SCOPED_DEPLOY_KEY");
  }
  if (!deployKey.startsWith(STG1_TARGET.deployKeyPrefix)) {
    throw new Error("STG1_TARGET_GUARD:DEPLOY_KEY_TARGET_MISMATCH");
  }
  if (deployKey.length <= STG1_TARGET.deployKeyPrefix.length) {
    throw new Error("STG1_TARGET_GUARD:EMPTY_DEPLOY_KEY_BODY");
  }

  const selectedDeployment = values.get("CONVEX_DEPLOYMENT");
  const acceptedSelections = new Set([
    undefined,
    `dev:${STG1_TARGET.deploymentName}`,
    STG1_TARGET.deploymentName,
    STG1_TARGET.deploymentReference,
  ]);
  if (!acceptedSelections.has(selectedDeployment)) {
    throw new Error("STG1_TARGET_GUARD:ENV_DEPLOYMENT_MISMATCH");
  }

  const publicUrl = values.get("NEXT_PUBLIC_CONVEX_URL");
  if (publicUrl !== undefined && publicUrl !== STG1_TARGET.cloudUrl) {
    throw new Error("STG1_TARGET_GUARD:PUBLIC_URL_MISMATCH");
  }

  return Object.freeze({
    targetVerified: true,
    deploymentName: STG1_TARGET.deploymentName,
    deploymentReference: STG1_TARGET.deploymentReference,
    cloudUrl: STG1_TARGET.cloudUrl,
    deployKeyPrefixVerified: true,
    secretIncludedInResult: false,
  });
}

export function validateStg1TargetFile(envFile, requestedDeployment) {
  const envSource = fs.readFileSync(envFile, "utf8");
  return validateStg1Target({ envFile, envSource, requestedDeployment });
}
