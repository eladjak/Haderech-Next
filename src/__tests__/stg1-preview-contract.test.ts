import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  STG1_PREVIEW,
  assertPreviewOnlyArguments,
  assertSafeRemoteRoot,
  buildVercelDeployArgs,
  buildVercelEnvUpdateArgs,
  parseDeploymentUrl,
  parseInspectDeploymentUrl,
  redactPreviewOutput,
  validatePreviewEnvironment,
  validatePreviewEnvironmentReadback,
  validateVercelProjectContract,
} from "../../scripts/lib/stg1-preview-plan.mjs";

const projectRoot = process.cwd();

function validEnvironment() {
  return new Map([
    ["CLERK_SECRET_KEY", "sk_test_fixture"],
    ["NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", "pk_test_fixture"],
    ["NEXT_PUBLIC_CONVEX_URL", "https://content-dog-757.convex.cloud"],
    ["NEXT_PUBLIC_CLERK_SIGN_IN_URL", "/sign-in"],
    ["NEXT_PUBLIC_CLERK_SIGN_UP_URL", "/sign-up"],
    ["NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL", "/dashboard"],
    ["NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL", "/dashboard"],
  ]);
}

describe("STG-1 Vercel Preview deployment contract", () => {
  it("builds ten exact branch variables and keeps the secret out of arguments", () => {
    const entries = validatePreviewEnvironment(validEnvironment());
    expect(entries).toHaveLength(10);
    expect(entries.filter((entry) => entry.sensitive).map((entry) => entry.name)).toEqual([
      "CLERK_SECRET_KEY",
    ]);
    expect(
      entries.find((entry) => entry.name === "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY")
        ?.value,
    ).toBe("pk_test_fixture");
    for (const entry of entries) {
      const args = buildVercelEnvUpdateArgs(entry);
      expect(args).toContain("preview");
      expect(args).toContain(STG1_PREVIEW.branch);
      expect(args).toContain("update");
      expect(args).not.toContain(entry.value);
      expect(args).not.toContain("--value");
    }
  });

  it("requires exact public values and Development Clerk keys", () => {
    const wrongConvex = validEnvironment();
    wrongConvex.set(
      "NEXT_PUBLIC_CONVEX_URL",
      "https://colorless-guanaco-894.convex.cloud",
    );
    expect(() => validatePreviewEnvironment(wrongConvex)).toThrow(
      "STG1_PREVIEW:LOCAL_ENV_MISMATCH:NEXT_PUBLIC_CONVEX_URL",
    );

    const productionClerk = validEnvironment();
    productionClerk.set("CLERK_SECRET_KEY", "sk_live_forbidden");
    expect(() => validatePreviewEnvironment(productionClerk)).toThrow(
      "STG1_CLERK:DEVELOPMENT_SECRET_KEY_REQUIRED",
    );
  });

  it("accepts exact non-secret readback and only a hidden sensitive value", () => {
    const entries = validatePreviewEnvironment(validEnvironment());
    const readback = new Map(
      entries.map((entry) => [
        entry.name,
        entry.sensitive ? "[SENSITIVE]" : entry.value,
      ]),
    );
    expect(validatePreviewEnvironmentReadback(readback, entries)).toEqual({
      checked: 10,
      exactNonSensitiveValues: 9,
      sensitivePresenceChecked: 1,
      secretValuesReturned: false,
    });
    readback.set("NEXT_PUBLIC_APP_URL", "https://haderech-next.vercel.app");
    expect(() => validatePreviewEnvironmentReadback(readback, entries)).toThrow(
      "STG1_PREVIEW:READBACK_MISMATCH:NEXT_PUBLIC_APP_URL",
    );
  });

  it("pins deployment metadata to one full SHA and Preview only", () => {
    const sha = "a".repeat(40);
    const args = buildVercelDeployArgs(sha);
    expect(args).toContain("--target=preview");
    expect(args).toContain(`githubCommitRef=${STG1_PREVIEW.branch}`);
    expect(args).toContain(`githubCommitSha=${sha}`);
    expect(args).toContain("githubDeployment=1");
    expect(args).not.toContain("--prod");
    expect(args).not.toContain("--target=production");
    expect(() => assertPreviewOnlyArguments(["deploy", "--prod"])).toThrow(
      "STG1_PREVIEW:PRODUCTION_ARGUMENT_FORBIDDEN",
    );
    expect(() => buildVercelDeployArgs("short")).toThrow(
      "STG1_PREVIEW:FULL_COMMIT_SHA_REQUIRED",
    );
  });

  it("accepts only the fixed remote cleanup root", () => {
    expect(assertSafeRemoteRoot(STG1_PREVIEW.remoteRoot)).toBe(
      "/tmp/codex-haderech-stg1-preview",
    );
    for (const forbidden of ["/tmp", "/", "/root", ""]) {
      expect(() => assertSafeRemoteRoot(forbidden)).toThrow(
        "STG1_PREVIEW:REMOTE_ROOT_REJECTED",
      );
    }
  });

  it("parses only unique Preview deployment URLs and captures an undo target", () => {
    const unique =
      "https://haderech-next-abc123xyz-eladjaks-projects.vercel.app";
    expect(parseDeploymentUrl(`${unique}\n`)).toBe(unique);
    expect(
      parseInspectDeploymentUrl(`target\tpreview\nurl\t\t${unique}\nstatus\tReady\n`),
    ).toBe(unique);
    expect(() => parseDeploymentUrl(STG1_PREVIEW.baseUrl)).toThrow(
      "STG1_PREVIEW:DEPLOYMENT_URL_REJECTED",
    );
    expect(() =>
      parseDeploymentUrl(`${unique}\nhttps://other-abc.vercel.app`),
    ).toThrow("STG1_PREVIEW:DEPLOYMENT_URL_READBACK_AMBIGUOUS");
  });

  it("requires a direct Next build and forbids a hidden Convex deploy", () => {
    expect(
      validateVercelProjectContract({
        framework: "nextjs",
        buildCommand: "next build",
      }),
    ).toEqual({
      framework: "nextjs",
      buildCommand: "next build",
      convexDeploys: 0,
      productionTargets: 0,
    });
    expect(() =>
      validateVercelProjectContract({
        framework: "nextjs",
        buildCommand: "npx convex deploy --cmd 'next build'",
      }),
    ).toThrow("STG1_PREVIEW:VERCEL_BUILD_CONTRACT_MISMATCH");
  });

  it("redacts provider material and rejects the production CLI arm", () => {
    expect(
      redactPreviewOutput(
        "sk_test_abc pk_test_def user_fixture somebody@example.com",
      ),
    ).not.toMatch(/sk_test|pk_test|user_fixture|@/u);

    const result = spawnSync(
      process.execPath,
      [
        path.resolve(projectRoot, "scripts/stg1-preview-deploy.mjs"),
        "--preflight",
        "--prod",
      ],
      { cwd: projectRoot, encoding: "utf8" },
    );
    expect(result.status).toBe(1);
    expect(result.stderr).toContain(
      "STG1_PREVIEW:PRODUCTION_ARGUMENT_FORBIDDEN",
    );
    expect(result.stdout).toBe("");
  });

  it("keeps env values on stdin and records automatic alias rollback", () => {
    const source = fs.readFileSync(
      path.resolve(projectRoot, "scripts/stg1-preview-deploy.mjs"),
      "utf8",
    );
    expect(source).toContain("input: `${entry.value}\\n`");
    expect(source).toContain("scripts/stg1-vercel-cli.mjs");
    expect(source).toContain('args[0] === "curl"');
    expect(source).toContain('phase = "rollback-preview-alias"');
    expect(source).toContain("previousAliasTarget");
    expect(source).toContain("temporaryRemoteFilesRemaining: 0");
  });
});
