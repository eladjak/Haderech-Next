import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  STG1_CLERK,
  accountMatchesAlias,
  assertDevelopmentClerkKeys,
  classifyUsers,
  createUserPayload,
  createShortLivedSignInToken,
  expectedStg1Email,
  expectedStg1ExternalId,
  expectedStg1PrivateMetadata,
  identityMapFromAccountMap,
  makeEmptyAccountMap,
  validateAccountMap,
  validateStg1PreviewUrl,
} from "../../scripts/lib/stg1-clerk-plan.mjs";

const projectRoot = process.cwd();
const read = (relative: string) =>
  fs.readFileSync(path.resolve(projectRoot, relative), "utf8");

function syntheticUser(alias: string, providerId: string) {
  const emailId = `id_${alias.toLowerCase()}`;
  return {
    id: providerId,
    external_id: expectedStg1ExternalId(alias),
    primary_email_address_id: emailId,
    email_addresses: [
      { id: emailId, email_address: expectedStg1Email(alias) },
    ],
    private_metadata: expectedStg1PrivateMetadata(alias),
    banned: false,
  };
}

describe("STG-1 Clerk Development lifecycle contract", () => {
  it("accepts only paired Development keys", () => {
    expect(
      assertDevelopmentClerkKeys(
        new Map([
          ["CLERK_SECRET_KEY", "sk_test_fixture"],
          ["NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", "pk_test_fixture"],
        ]),
      ).developmentSecretVerified,
    ).toBe(true);
    expect(() =>
      assertDevelopmentClerkKeys(
        new Map([
          ["CLERK_SECRET_KEY", "sk_live_forbidden"],
          ["NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", "pk_live_forbidden"],
        ]),
      ),
    ).toThrow("STG1_CLERK:DEVELOPMENT_SECRET_KEY_REQUIRED");
  });

  it("pins E07 to the dedicated Preview alias", () => {
    expect(validateStg1PreviewUrl("https://haderech-preview.vercel.app")).toBe(
      "https://haderech-preview.vercel.app",
    );
    for (const forbidden of [
      "https://haderech-next.vercel.app",
      "https://haderech.co.il",
      "http://haderech-preview.vercel.app",
      "https://haderech-preview.vercel.app/path",
    ]) {
      expect(() => validateStg1PreviewUrl(forbidden)).toThrow(
        "STG1_E07:PREVIEW_URL_NOT_ALLOWLISTED",
      );
    }
  });

  it("validates seven exact, unique synthetic account bindings", () => {
    const accountMap = makeEmptyAccountMap() as ReturnType<
      typeof makeEmptyAccountMap
    > & {
      accounts: Record<
        string,
        { providerId: string; email: string; externalId: string }
      >;
    };
    for (const [index, alias] of STG1_CLERK.aliases.entries()) {
      accountMap.accounts[alias] = {
        providerId: `user_fixture${index}`,
        email: expectedStg1Email(alias),
        externalId: expectedStg1ExternalId(alias),
      };
    }
    expect(validateAccountMap(accountMap)).toBe(accountMap);
    expect(identityMapFromAccountMap(accountMap).identities).toEqual(
      Object.fromEntries(
        STG1_CLERK.aliases.map((alias, index) => [alias, `user_fixture${index}`]),
      ),
    );
    accountMap.accounts.A.providerId = accountMap.accounts.U0.providerId;
    expect(() => validateAccountMap(accountMap)).toThrow(
      "STG1_CLERK:ACCOUNT_MAP_PROVIDER_ID_DUPLICATE",
    );
  });

  it("classifies exact ownership markers and rejects lookalikes", () => {
    const exact = syntheticUser("A", "user_fixtureA");
    const lookalike = {
      ...syntheticUser("B", "user_fixtureB"),
      private_metadata: {},
    };
    expect(accountMatchesAlias(exact, "A")).toBe(true);
    const result = classifyUsers([exact, lookalike, { id: "user_unrelated" }]);
    expect(result.matchedCount).toBe(1);
    expect(result.collisionCount).toBe(1);
    expect(result.nonFixtureCount).toBe(2);
  });

  it("issues only a 120-second token and returns no response metadata", async () => {
    let capturedBody: unknown;
    const fetchImpl: typeof fetch = async (_input, init) => {
      capturedBody = JSON.parse(String(init?.body));
      return new Response(
        JSON.stringify({
          id: "sit_fixture",
          token: "one-time-ticket",
          user_id: "user_fixtureA",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    };
    await expect(
      createShortLivedSignInToken(
        "sk_test_fixture",
        "user_fixtureA",
        fetchImpl,
      ),
    ).resolves.toBe("one-time-ticket");
    expect(capturedBody).toEqual({
      user_id: "user_fixtureA",
      expires_in_seconds: 120,
    });
  });

  it("creates passwordless fixtures with reserved synthetic identifiers", () => {
    expect(createUserPayload("A")).toEqual({
      email_address: ["stg1+clerk_test_a@example.com"],
      email_address_identification_status: ["reserved"],
      external_id: "stg1:content-dog-757:stg1-v1:A",
      private_metadata: {
        stg1: {
          deploymentName: "content-dog-757",
          fixtureVersion: "stg1-v1",
          alias: "A",
        },
      },
      skip_password_requirement: true,
    });
  });

  it("fails before network access when a Production key is supplied", () => {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "stg1-clerk-test-"));
    const envFile = path.join(tempRoot, "production.env");
    fs.writeFileSync(
      envFile,
      "CLERK_SECRET_KEY=sk_live_forbidden\nNEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_forbidden\n",
      "utf8",
    );
    const result = spawnSync(
      process.execPath,
      [
        path.resolve(projectRoot, "scripts/stg1-clerk-users.mjs"),
        "--inspect",
        "--env-file",
        envFile,
      ],
      { cwd: projectRoot, encoding: "utf8" },
    );
    expect(result.status).toBe(1);
    expect(result.stderr).toContain(
      "STG1_CLERK:DEVELOPMENT_SECRET_KEY_REQUIRED",
    );
    expect(result.stdout).toBe("");
  });

  it("has no delete mode and keeps E07 traces, screenshots and secrets off", () => {
    const lifecycle = read("scripts/stg1-clerk-users.mjs");
    const matrix = read("stg1-e2e/access-matrix.spec.ts");
    const config = read("playwright.stg1.config.ts");
    expect(lifecycle).toContain("STG1_CLERK:ACCOUNT_DELETION_NOT_IMPLEMENTED");
    expect(lifecycle).toContain("nonFixtureAccountsUnchanged");
    expect(lifecycle).not.toContain('pathname: `/users/${providerId}/delete`');
    expect(matrix).toContain("persistentDataWritesByMatrix: 0");
    expect(matrix).toContain("paymentProviderCalls: 0");
    expect(config).toContain('trace: "off"');
    expect(config).toContain('screenshot: "off"');
    expect(config).toContain('video: "off"');
  });
});
