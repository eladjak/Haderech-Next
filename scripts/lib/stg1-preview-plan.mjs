import { assertDevelopmentClerkKeys } from "./stg1-clerk-plan.mjs";

export const STG1_PREVIEW = Object.freeze({
  branch: "codex/omanut-integration-2026-08-22",
  confirmation: "DEPLOY_STG1_PREVIEW_CONTENT_DOG_757",
  baseUrl: "https://haderech-preview.vercel.app",
  aliasHost: "haderech-preview.vercel.app",
  convexUrl: "https://content-dog-757.convex.cloud",
  remoteHost: "root@144.91.93.223",
  remoteRoot: "/tmp/codex-haderech-stg1-preview",
  remoteArchive: "/tmp/codex-haderech-stg1-preview/source.tar",
  remoteReadback: "/tmp/codex-haderech-stg1-preview/preview-readback.env",
  remoteNodePath:
    "/tmp/node22/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin",
  projectId: "prj_xSpLffGWUveGwS6TQFVkumZX26jg",
  projectName: "haderech-next",
  orgId: "team_T6dJ4LNsyZ8LDt9uU9Po1exz",
  scope: "eladjaks-projects",
  githubOrg: "eladjak",
  githubRepo: "haderech-next",
  originUrl: "https://github.com/eladjak/haderech-next.git",
});

const REQUIRED_LOCAL_VALUES = Object.freeze({
  NEXT_PUBLIC_CONVEX_URL: STG1_PREVIEW.convexUrl,
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: "/sign-in",
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: "/sign-up",
  NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: "/dashboard",
  NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: "/dashboard",
});

function requireExact(values, name, expected) {
  if (values.get(name) !== expected) {
    throw new Error(`STG1_PREVIEW:LOCAL_ENV_MISMATCH:${name}`);
  }
  return expected;
}

export function validatePreviewEnvironment(values) {
  if (!(values instanceof Map)) {
    throw new Error("STG1_PREVIEW:ENV_MAP_REQUIRED");
  }
  const { secretKey, publishableKey } = assertDevelopmentClerkKeys(values);
  for (const [name, expected] of Object.entries(REQUIRED_LOCAL_VALUES)) {
    requireExact(values, name, expected);
  }
  const configuredAppUrl = values.get("NEXT_PUBLIC_APP_URL");
  if (configuredAppUrl !== undefined && configuredAppUrl !== STG1_PREVIEW.baseUrl) {
    throw new Error("STG1_PREVIEW:LOCAL_ENV_MISMATCH:NEXT_PUBLIC_APP_URL");
  }

  return Object.freeze([
    Object.freeze({
      name: "NEXT_PUBLIC_CONVEX_URL",
      value: STG1_PREVIEW.convexUrl,
      sensitive: false,
    }),
    Object.freeze({
      name: "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
      value: publishableKey,
      sensitive: false,
    }),
    Object.freeze({
      name: "CLERK_SECRET_KEY",
      value: secretKey,
      sensitive: true,
    }),
    ...Object.entries(REQUIRED_LOCAL_VALUES)
      .filter(([name]) => name !== "NEXT_PUBLIC_CONVEX_URL")
      .map(([name, value]) => Object.freeze({ name, value, sensitive: false })),
    Object.freeze({
      name: "NEXT_PUBLIC_APP_URL",
      value: STG1_PREVIEW.baseUrl,
      sensitive: false,
    }),
    Object.freeze({
      name: "NEXT_PUBLIC_DEMO_MODE",
      value: "false",
      sensitive: false,
    }),
    Object.freeze({
      name: "ALLOW_DEMO_MODE",
      value: "false",
      sensitive: false,
    }),
  ]);
}

export function summarizePreviewEnvironment(entries) {
  return Object.freeze({
    names: entries.map((entry) => entry.name),
    count: entries.length,
    sensitiveNames: entries
      .filter((entry) => entry.sensitive)
      .map((entry) => entry.name),
    valuesReturned: false,
  });
}

export function validatePreviewEnvironmentReadback(values, entries) {
  if (!(values instanceof Map)) {
    throw new Error("STG1_PREVIEW:READBACK_ENV_MAP_REQUIRED");
  }
  for (const entry of entries) {
    const actual = values.get(entry.name);
    if (entry.sensitive) {
      if (actual !== "[SENSITIVE]" && actual !== entry.value) {
        throw new Error(`STG1_PREVIEW:READBACK_MISMATCH:${entry.name}`);
      }
      continue;
    }
    if (actual !== entry.value) {
      throw new Error(`STG1_PREVIEW:READBACK_MISMATCH:${entry.name}`);
    }
  }
  return Object.freeze({
    checked: entries.length,
    exactNonSensitiveValues: entries.filter((entry) => !entry.sensitive).length,
    sensitivePresenceChecked: entries.filter((entry) => entry.sensitive).length,
    secretValuesReturned: false,
  });
}

export function validateVercelProjectContract(vercelConfig) {
  if (
    vercelConfig?.framework !== "nextjs" ||
    vercelConfig?.buildCommand !== "next build"
  ) {
    throw new Error("STG1_PREVIEW:VERCEL_BUILD_CONTRACT_MISMATCH");
  }
  const serialized = JSON.stringify(vercelConfig);
  if (/convex\s+deploy/iu.test(serialized) || /--prod(?:uction)?\b/iu.test(serialized)) {
    throw new Error("STG1_PREVIEW:VERCEL_FORBIDDEN_BUILD_OR_TARGET");
  }
  return Object.freeze({
    framework: "nextjs",
    buildCommand: "next build",
    convexDeploys: 0,
    productionTargets: 0,
  });
}

export function validateCommitSha(value) {
  if (!/^[a-f0-9]{40}$/u.test(String(value))) {
    throw new Error("STG1_PREVIEW:FULL_COMMIT_SHA_REQUIRED");
  }
  return String(value);
}

export function assertSafeRemoteRoot(value) {
  if (value !== STG1_PREVIEW.remoteRoot) {
    throw new Error("STG1_PREVIEW:REMOTE_ROOT_REJECTED");
  }
  return value;
}

export function assertPreviewOnlyArguments(args) {
  const normalized = args.map((value) => String(value).toLowerCase());
  for (let index = 0; index < normalized.length; index += 1) {
    const value = normalized[index];
    if (
      value === "--prod" ||
      value === "--production" ||
      value === "production" ||
      value === "--target=production" ||
      (value === "--target" && normalized[index + 1] === "production")
    ) {
      throw new Error("STG1_PREVIEW:PRODUCTION_ARGUMENT_FORBIDDEN");
    }
  }
  return args;
}

export function buildVercelEnvUpdateArgs(entry) {
  if (!/^[A-Z_][A-Z0-9_]*$/u.test(entry?.name ?? "")) {
    throw new Error("STG1_PREVIEW:INVALID_ENV_NAME");
  }
  const args = [
    "env",
    "update",
    entry.name,
    "preview",
    STG1_PREVIEW.branch,
    "--yes",
    "--project",
    STG1_PREVIEW.projectId,
  ];
  if (args.includes(entry.value)) {
    throw new Error("STG1_PREVIEW:ENV_VALUE_LEAKED_TO_ARGUMENTS");
  }
  return assertPreviewOnlyArguments(args);
}

export function buildVercelDeployArgs(commitSha) {
  const exactSha = validateCommitSha(commitSha);
  return assertPreviewOnlyArguments([
    "deploy",
    STG1_PREVIEW.remoteRoot,
    "--yes",
    "--target=preview",
    "--archive=tgz",
    "--project",
    STG1_PREVIEW.projectId,
    "--meta",
    "githubDeployment=1",
    "--meta",
    `githubCommitRef=${STG1_PREVIEW.branch}`,
    "--meta",
    `githubCommitSha=${exactSha}`,
    "--meta",
    `githubCommitOrg=${STG1_PREVIEW.githubOrg}`,
    "--meta",
    `githubCommitRepo=${STG1_PREVIEW.githubRepo}`,
    "--meta",
    `githubOrg=${STG1_PREVIEW.githubOrg}`,
    "--meta",
    `githubRepo=${STG1_PREVIEW.githubRepo}`,
  ]);
}

export function parseDeploymentUrl(stdout) {
  const candidates = String(stdout).match(/https:\/\/[a-z0-9-]+\.vercel\.app/giu) ?? [];
  const unique = [...new Set(candidates)];
  if (unique.length !== 1) {
    throw new Error("STG1_PREVIEW:DEPLOYMENT_URL_READBACK_AMBIGUOUS");
  }
  const url = new URL(unique[0]);
  if (
    url.protocol !== "https:" ||
    !url.hostname.endsWith(".vercel.app") ||
    url.hostname === STG1_PREVIEW.aliasHost ||
    url.hostname === `${STG1_PREVIEW.projectName}.vercel.app`
  ) {
    throw new Error("STG1_PREVIEW:DEPLOYMENT_URL_REJECTED");
  }
  return url.toString().replace(/\/$/u, "");
}

export function parseInspectDeploymentUrl(output) {
  const match = String(output).match(
    /^url\s+(https:\/\/[a-z0-9-]+\.vercel\.app)\s*$/imu,
  );
  if (!match) {
    throw new Error("STG1_PREVIEW:PREVIOUS_ALIAS_TARGET_NOT_FOUND");
  }
  return parseDeploymentUrl(match[1]);
}

export function redactPreviewOutput(value, additionalSecrets = []) {
  let redacted = String(value)
    .replace(/\bsk_(?:test|live)_[A-Za-z0-9_-]+\b/gu, "[REDACTED_CLERK_SECRET]")
    .replace(/\bpk_(?:test|live)_[A-Za-z0-9_-]+\b/gu, "[REDACTED_CLERK_PUBLIC]")
    .replace(/\buser_[A-Za-z0-9]+\b/gu, "[REDACTED_PROVIDER_ID]")
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/giu, "[REDACTED_EMAIL]");
  for (const secret of additionalSecrets) {
    if (!secret) continue;
    redacted = redacted.split(String(secret)).join("[REDACTED_VALUE]");
  }
  return redacted;
}
