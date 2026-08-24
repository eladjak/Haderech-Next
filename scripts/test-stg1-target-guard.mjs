import assert from "node:assert/strict";
import { STG1_TARGET, validateStg1Target } from "./lib/stg1-target-guard.mjs";

const valid = {
  envFile: ".env.isolated-staging",
  requestedDeployment: "content-dog-757",
  envSource: [
    "# synthetic fixture only",
    "CONVEX_DEPLOYMENT=dev:content-dog-757",
    "CONVEX_DEPLOY_KEY=dev:content-dog-757|synthetic-test-body",
    "NEXT_PUBLIC_CONVEX_URL=https://content-dog-757.convex.cloud",
  ].join("\n"),
};

const result = validateStg1Target(valid);
assert.equal(result.targetVerified, true);
assert.equal(result.deploymentName, STG1_TARGET.deploymentName);
assert.equal(result.secretIncludedInResult, false);
assert.equal(JSON.stringify(result).includes("synthetic-test-body"), false);

const controls = [
  [
    "wrong CLI deployment",
    "STG1_TARGET_GUARD:CLI_DEPLOYMENT_MISMATCH",
    { ...valid, requestedDeployment: "colorless-guanaco-894" },
  ],
  [
    "production CLI deployment",
    "STG1_TARGET_GUARD:CLI_DEPLOYMENT_MISMATCH",
    { ...valid, requestedDeployment: "prod" },
  ],
  [
    "wrong deploy-key scope",
    "STG1_TARGET_GUARD:DEPLOY_KEY_TARGET_MISMATCH",
    { ...valid, envSource: "CONVEX_DEPLOY_KEY=dev:other-target|synthetic" },
  ],
  [
    "missing deploy key",
    "STG1_TARGET_GUARD:MISSING_SCOPED_DEPLOY_KEY",
    { ...valid, envSource: "CONVEX_DEPLOYMENT=dev:content-dog-757" },
  ],
  [
    "production selected in env",
    "STG1_TARGET_GUARD:ENV_DEPLOYMENT_MISMATCH",
    {
      ...valid,
      envSource:
        "CONVEX_DEPLOY_KEY=dev:content-dog-757|synthetic\nCONVEX_DEPLOYMENT=prod",
    },
  ],
  [
    "wrong public URL",
    "STG1_TARGET_GUARD:PUBLIC_URL_MISMATCH",
    {
      ...valid,
      envSource:
        "CONVEX_DEPLOY_KEY=dev:content-dog-757|synthetic\nNEXT_PUBLIC_CONVEX_URL=https://other.convex.cloud",
    },
  ],
  [
    "unsafe env filename",
    "STG1_TARGET_GUARD:ENV_FILENAME_NOT_STAGING",
    { ...valid, envFile: ".env.local" },
  ],
  [
    "duplicate key ambiguity",
    "STG1_TARGET_GUARD:DUPLICATE_ENV_KEY:CONVEX_DEPLOY_KEY",
    {
      ...valid,
      envSource:
        "CONVEX_DEPLOY_KEY=dev:content-dog-757|first\nCONVEX_DEPLOY_KEY=dev:content-dog-757|second",
    },
  ],
];

for (const [name, expected, fixture] of controls) {
  assert.throws(
    () => validateStg1Target(fixture),
    (error) => error instanceof Error && error.message === expected,
    `${name} must fail with ${expected}`,
  );
}

console.log(`STG-1 target guard: PASS (1 positive, ${controls.length}/${controls.length} negative controls)`);
