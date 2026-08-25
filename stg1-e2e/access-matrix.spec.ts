import fs from "node:fs";
import path from "node:path";
import { test, type BrowserContext, type Page } from "@playwright/test";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import { expectedStg1IdentityEmail } from "../convex/lib/stg1FixturePlan";
import {
  STG1_CLERK,
  assertDevelopmentClerkKeys,
  createShortLivedSignInToken,
  validateAccountMap,
  validateStg1PreviewUrl,
} from "../scripts/lib/stg1-clerk-plan.mjs";

type Check = { id: string; status: "PASS" | "FAIL" };
type Alias = (typeof STG1_CLERK.aliases)[number];
type RuntimeIdentity = {
  alias: Alias;
  context: BrowserContext;
  page: Page;
  client: ConvexHttpClient;
  convexUserId: string;
  role: "student" | "admin";
};

type BrowserClerk = {
  loaded: boolean;
  isSignedIn: boolean;
  instanceType?: string;
  publishableKey: string;
  client?: {
    signIn: {
      create(args: {
        strategy: "ticket";
        ticket: string;
      }): Promise<{ status: string; createdSessionId: string | null }>;
    };
  };
  session?: {
    getToken(args: { template: "convex" }): Promise<string | null>;
  } | null;
  setActive(args: { session: string }): Promise<void>;
};

function condition(value: unknown) {
  if (!value) throw new Error("STG1_E07:CHECK_CONDITION_FAILED");
}

function errorContains(error: unknown, marker: string) {
  return error instanceof Error && error.message.includes(marker);
}

async function rejectsWith(promise: Promise<unknown>, marker: string) {
  try {
    await promise;
    return false;
  } catch (error) {
    return errorContains(error, marker);
  }
}

function readJson(filePath: string) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function expectedConvexIdentityEmail(alias: Alias) {
  return expectedStg1IdentityEmail(
    alias as Parameters<typeof expectedStg1IdentityEmail>[0],
  );
}

test("E07 role, privacy, course, community, simulator and payment containment", async ({
  browser,
}) => {
  test.setTimeout(240_000);
  const checks: Check[] = [];
  const contexts: BrowserContext[] = [];
  const runtimes = new Map<Alias, RuntimeIdentity>();
  let terminalFailure = false;

  const runCheck = async (id: string, operation: () => Promise<void> | void) => {
    try {
      await operation();
      checks.push({ id, status: "PASS" });
    } catch {
      checks.push({ id, status: "FAIL" });
    }
  };

  const must = async (id: string, operation: () => Promise<void> | void) => {
    await runCheck(id, operation);
    if (checks.at(-1)?.status !== "PASS") {
      terminalFailure = true;
      throw new Error(`STG1_E07:CRITICAL_SETUP_FAILED:${id}`);
    }
  };

  const baseUrl = validateStg1PreviewUrl(process.env.STG1_BASE_URL ?? "");
  condition(process.env.STG1_E07_CONFIRMATION === STG1_CLERK.e07Confirmation);
  const secretKey = process.env.CLERK_SECRET_KEY ?? "";
  assertDevelopmentClerkKeys(
    new Map([
      ["CLERK_SECRET_KEY", secretKey],
      ["NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", "pk_test_runtime_guard"],
    ]),
  );
  const accountMap = validateAccountMap(
    readJson(process.env.STG1_ACCOUNT_MAP ?? ""),
  );
  const identityMap = readJson(process.env.STG1_IDENTITY_MAP ?? "");
  condition(identityMap.deploymentName === STG1_CLERK.deploymentName);
  condition(identityMap.fixtureVersion === STG1_CLERK.fixtureVersion);
  condition(
    STG1_CLERK.aliases.every(
      (alias) =>
        identityMap.identities?.[alias] === accountMap.accounts[alias].providerId,
    ),
  );

  const evidenceFile = process.env.STG1_EVIDENCE_FILE ?? "";
  condition(path.isAbsolute(evidenceFile));
  condition(path.basename(evidenceFile) === "e07-access-matrix.json");

  try {
    const anonContext = await browser.newContext({
      locale: "he-IL",
      timezoneId: "Asia/Jerusalem",
    });
    contexts.push(anonContext);
    const anonPage = await anonContext.newPage();
    const anonymousConvexHosts = new Set<string>();
    anonPage.on("request", (request) => {
      try {
        const host = new URL(request.url()).hostname;
        if (host.endsWith(".convex.cloud")) anonymousConvexHosts.add(host);
      } catch {
        // Ignore non-URL browser internals.
      }
    });
    anonPage.on("websocket", (socket) => {
      try {
        const host = new URL(socket.url()).hostname;
        if (host.endsWith(".convex.cloud")) anonymousConvexHosts.add(host);
      } catch {
        // Ignore malformed browser diagnostics.
      }
    });

    await must("browser.preview.vercel-readback", async () => {
      const response = await anonPage.goto(`${baseUrl}/`, {
        waitUntil: "domcontentloaded",
      });
      condition(response?.ok());
      condition(Boolean(response?.headers()["x-vercel-id"]));
    });
    await must("browser.clerk.development-instance", async () => {
      await anonPage.waitForFunction(
        () =>
          (globalThis as unknown as { Clerk?: BrowserClerk }).Clerk?.loaded ===
          true,
      );
      const classification = await anonPage.evaluate(() => {
        const clerk = (globalThis as unknown as { Clerk?: BrowserClerk }).Clerk;
        return {
          loaded: clerk?.loaded === true,
          development:
            clerk?.instanceType === "development" ||
            clerk?.publishableKey?.startsWith("pk_test_") === true,
        };
      });
      condition(classification.loaded && classification.development);
    });
    await runCheck("browser.anon.protected-route-redirect", async () => {
      await anonPage.goto(`${baseUrl}/dashboard`, { waitUntil: "domcontentloaded" });
      condition(new URL(anonPage.url()).pathname.startsWith("/sign-in"));
    });
    await runCheck("browser.anon.convex-target", async () => {
      await anonPage.waitForTimeout(1_000);
      condition(anonymousConvexHosts.size === 1);
      condition(
        anonymousConvexHosts.has(new URL(STG1_CLERK.convexCloudUrl).hostname),
      );
    });

    for (const alias of STG1_CLERK.aliases) {
      const context = await browser.newContext({
        locale: "he-IL",
        timezoneId: "Asia/Jerusalem",
      });
      contexts.push(context);
      const page = await context.newPage();
      const observedConvexHosts = new Set<string>();
      page.on("request", (request) => {
        try {
          const host = new URL(request.url()).hostname;
          if (host.endsWith(".convex.cloud")) observedConvexHosts.add(host);
        } catch {
          // Ignore non-URL browser internals.
        }
      });
      page.on("websocket", (socket) => {
        try {
          const host = new URL(socket.url()).hostname;
          if (host.endsWith(".convex.cloud")) observedConvexHosts.add(host);
        } catch {
          // Ignore malformed browser diagnostics.
        }
      });

      await must(`browser.${alias}.ticket-sign-in`, async () => {
        const ticket = await createShortLivedSignInToken(
          secretKey,
          accountMap.accounts[alias].providerId,
        );
        await page.goto(`${baseUrl}/`, { waitUntil: "domcontentloaded" });
        await page.waitForFunction(
          () =>
            (globalThis as unknown as { Clerk?: BrowserClerk }).Clerk?.loaded ===
            true,
        );
        const completed = await page.evaluate(async (oneTimeTicket) => {
          const clerk = (globalThis as unknown as { Clerk?: BrowserClerk }).Clerk;
          if (!clerk?.client) return false;
          const signIn = await clerk.client.signIn.create({
            strategy: "ticket",
            ticket: oneTimeTicket,
          });
          if (signIn.status !== "complete" || !signIn.createdSessionId) {
            return false;
          }
          await clerk.setActive({ session: signIn.createdSessionId });
          return true;
        }, ticket);
        condition(completed);
        await page.waitForFunction(
          () =>
            (globalThis as unknown as { Clerk?: BrowserClerk }).Clerk
              ?.isSignedIn === true,
        );
      });
      await must(`browser.${alias}.dashboard-authenticated`, async () => {
        await page.goto(`${baseUrl}/dashboard`, { waitUntil: "domcontentloaded" });
        condition(!new URL(page.url()).pathname.startsWith("/sign-in"));
        await page.waitForSelector("main", { state: "attached" });
      });
      await must(`browser.${alias}.convex-target`, async () => {
        await page.waitForTimeout(1_000);
        condition(observedConvexHosts.size === 1);
        condition(
          observedConvexHosts.has(new URL(STG1_CLERK.convexCloudUrl).hostname),
        );
      });

      const convexToken = await page.evaluate(async () => {
        const session = (globalThis as unknown as { Clerk?: BrowserClerk }).Clerk
          ?.session;
        if (!session) return null;
        for (let attempt = 0; attempt < 6; attempt += 1) {
          const token = await session.getToken({ template: "convex" });
          if (typeof token === "string" && token.length > 100) return token;
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
        return null;
      });
      await must(`api.${alias}.convex-jwt`, () => {
        condition(typeof convexToken === "string" && convexToken.length > 100);
      });
      const client = new ConvexHttpClient(STG1_CLERK.convexCloudUrl);
      client.setAuth(convexToken as string);
      const me = await client.query(api.users.getMe, {});
      await must(`api.${alias}.identity-binding`, () => {
        condition(me !== null);
        condition(me?.clerkId === accountMap.accounts[alias].providerId);
        condition(me?.email === expectedConvexIdentityEmail(alias));
        condition(me?.role === (alias === "ADMIN" ? "admin" : "student"));
      });
      runtimes.set(alias, {
        alias,
        context,
        page,
        client,
        convexUserId: String(me?._id),
        role: me?.role as "student" | "admin",
      });
    }

    const runtime = (alias: Alias) => {
      const value = runtimes.get(alias);
      condition(value);
      return value as RuntimeIdentity;
    };
    const anonymousClient = new ConvexHttpClient(STG1_CLERK.convexCloudUrl);
    const courses = await anonymousClient.query(api.courses.listPublished, {});
    await must("api.course.canonical-public-course", () => {
      condition(courses.length === 1);
    });
    const courseId = courses[0]._id;

    await runCheck("browser.student.admin-denied", async () => {
      const page = runtime("U0").page;
      await page.goto(`${baseUrl}/admin`, { waitUntil: "domcontentloaded" });
      await page.getByText("אין הרשאת גישה", { exact: true }).waitFor();
    });
    await runCheck("browser.admin.admin-allowed", async () => {
      const page = runtime("ADMIN").page;
      await page.goto(`${baseUrl}/admin`, { waitUntil: "domcontentloaded" });
      await page.getByText("לוח ניהול", { exact: true }).waitFor();
      condition((await page.getByText("אין הרשאת גישה", { exact: true }).count()) === 0);
    });
    for (const alias of ["A", "B"] as const) {
      await runCheck(`browser.${alias}.community-allowed`, async () => {
        const page = runtime(alias).page;
        await page.goto(`${baseUrl}/community`, { waitUntil: "domcontentloaded" });
        await page.getByText("הקהילה שלנו", { exact: true }).waitFor();
      });
    }

    await runCheck("api.anon.community-safe-status", async () => {
      const status = await anonymousClient.query(api.community.getAccessStatus, {});
      condition(status.canAccess === false && status.state === "preparing");
      condition(
        await rejectsWith(
          anonymousClient.query(api.community.listTopics, {}),
          "COMMUNITY_ACCESS_REQUIRED",
        ),
      );
    });
    await runCheck("api.anon.simulator-and-privacy-denied", async () => {
      condition(
        await rejectsWith(
          anonymousClient.query(api.simulator.getAccessStatus, {}),
          "AUTHENTICATION_REQUIRED",
        ),
      );
      condition(
        await rejectsWith(
          anonymousClient.query(api.users.exportUserData, {}),
          "AUTHENTICATION_REQUIRED",
        ),
      );
    });
    await runCheck("api.anon.course-content-denied", async () => {
      condition(
        await rejectsWith(
          anonymousClient.query(api.lessons.listByCourse, { courseId }),
          "AUTHENTICATION_REQUIRED",
        ),
      );
    });

    const communityAllowed = new Set<Alias>(["A", "B", "ADMIN"]);
    for (const alias of STG1_CLERK.aliases) {
      await runCheck(`api.${alias}.community-policy`, async () => {
        const client = runtime(alias).client;
        const status = await client.query(api.community.getAccessStatus, {});
        condition(status.canAccess === communityAllowed.has(alias));
        if (communityAllowed.has(alias)) {
          const topics = await client.query(api.community.listTopics, {});
          condition(Array.isArray(topics));
        } else {
          condition(
            await rejectsWith(
              client.query(api.community.listTopics, {}),
              "COMMUNITY_ACCESS_REQUIRED",
            ),
          );
        }
      });
    }

    const simulatorExpectations: Record<
      Alias,
      { mode: "trial" | "entitled" | "admin"; full: boolean }
    > = {
      U0: { mode: "trial", full: false },
      A: { mode: "trial", full: false },
      B: { mode: "trial", full: false },
      E: { mode: "entitled", full: true },
      X: { mode: "trial", full: false },
      ADMIN: { mode: "admin", full: true },
      IMPOSTOR: { mode: "trial", full: false },
    };
    for (const alias of STG1_CLERK.aliases) {
      await runCheck(`api.${alias}.simulator-policy`, async () => {
        const status = await runtime(alias).client.query(
          api.simulator.getAccessStatus,
          {},
        );
        const expected = simulatorExpectations[alias];
        condition(status.mode === expected.mode);
        condition(status.hasFullAccess === expected.full);
        condition(status.commerceAvailable === false);
        if (expected.mode === "trial") {
          condition(status.trialRemaining === 5);
          condition(status.trialUsed === 0 && status.trialReserved === 0);
        }
      });
    }

    const courseAllowed = new Set<Alias>(["E", "ADMIN"]);
    for (const alias of STG1_CLERK.aliases) {
      await runCheck(`api.${alias}.course-policy`, async () => {
        const result = runtime(alias).client.query(api.lessons.listByCourse, {
          courseId,
        });
        if (courseAllowed.has(alias)) {
          const lessons = await result;
          condition(lessons.length === 76);
          condition(lessons.some((lesson) => lesson.scriptIndex === "5.3.2"));
        } else {
          condition(await rejectsWith(result, "COURSE_ENROLLMENT_REQUIRED"));
        }
      });
    }

    for (const alias of STG1_CLERK.aliases) {
      await runCheck(`api.${alias}.privacy-self-only`, async () => {
        const exported = await runtime(alias).client.query(
          api.users.exportUserData,
          {},
        );
        const serialized = JSON.stringify(exported);
        condition(
          exported.profile.externalAuthSubject ===
            accountMap.accounts[alias].providerId,
        );
        for (const other of STG1_CLERK.aliases) {
          if (other === alias) continue;
          condition(!serialized.includes(accountMap.accounts[other].providerId));
          condition(!serialized.includes(expectedConvexIdentityEmail(other)));
        }
      });
    }

    await runCheck("api.impostor.cross-user-no-oracle", async () => {
      const impostor = runtime("IMPOSTOR").client;
      const a = runtime("A");
      condition(
        await rejectsWith(
          impostor.query(api.users.getById, { id: a.convexUserId as never }),
          "SELF_OR_ADMIN_REQUIRED",
        ),
      );
      condition(
        await rejectsWith(
          impostor.query(api.users.getByClerkId, {
            clerkId: accountMap.accounts.A.providerId,
          }),
          "RESOURCE_OWNERSHIP_REQUIRED",
        ),
      );
      condition(
        await rejectsWith(
          impostor.query(api.users.getByClerkId, {
            clerkId: "user_00000000000000000000000000000000",
          }),
          "RESOURCE_OWNERSHIP_REQUIRED",
        ),
      );
    });
    await runCheck("api.admin.cross-user-authorized", async () => {
      const a = runtime("A");
      const row = await runtime("ADMIN").client.query(api.users.getById, {
        id: a.convexUserId as never,
      });
      condition(String(row?._id) === a.convexUserId);
    });

    for (const alias of ["U0", "A", "B", "E", "X", "IMPOSTOR"] as const) {
      await runCheck(`api.${alias}.admin-denied`, async () => {
        condition(
          await rejectsWith(
            runtime(alias).client.query(api.admin.getStats, {}),
            "ADMIN_ACCESS_REQUIRED",
          ),
        );
      });
    }
    await runCheck("api.admin.role-positive", async () => {
      const stats = await runtime("ADMIN").client.query(api.admin.getStats, {});
      condition(stats.totalStudents === 6);
      condition(stats.totalCourses === 1);
      condition(stats.totalEnrollments === 0);
    });

    for (const alias of STG1_CLERK.aliases) {
      await runCheck(`api.${alias}.payment-read-model-empty`, async () => {
        const client = runtime(alias).client;
        const current = await client.query(
          api.subscriptions.getCurrentSubscription,
          {},
        );
        const payments = await client.query(
          api.subscriptions.getPaymentHistory,
          {},
        );
        condition(current?.plan === "free" && current.status === "active");
        condition(payments.length === 0);
      });
    }
    await runCheck("api.payment.checkout-fails-closed", async () => {
      const result = await runtime("U0").client.action(
        api.sumit.createCheckoutSession,
        { plan: "basic" },
      );
      condition(result.status === "unavailable");
      condition(!("url" in result) && !("sessionId" in result));
    });
    await runCheck("api.payment.admin-counts-zero", async () => {
      const stats = await runtime("ADMIN").client.query(
        api.subscriptions.getStats,
        {},
      );
      condition(stats.totalPayments === 0);
      condition(stats.totalSubscriptions === 0);
      condition(stats.activeSubscriptions === 0);
      condition(stats.totalRevenue === 0);
    });
    await runCheck("browser.payment-webhook-fixed-containment", async () => {
      for (const method of ["GET", "POST"] as const) {
        const response = await fetch(`${baseUrl}/api/sumit/webhook`, {
          method,
          headers: method === "POST" ? { "Content-Type": "application/json" } : {},
          ...(method === "POST" ? { body: "{}" } : {}),
        });
        const body = await response.json();
        condition(response.status === 503);
        condition(body?.error === "payment_fulfillment_unavailable");
      }
    });
  } catch {
    terminalFailure = true;
  } finally {
    for (const context of contexts) {
      await context.close().catch(() => undefined);
    }
    const report = {
      schemaVersion: 1,
      evidenceId: "E07",
      deploymentName: STG1_CLERK.deploymentName,
      fixtureVersion: STG1_CLERK.fixtureVersion,
      previewHost: new URL(baseUrl).hostname,
      clerkEnvironment: "development",
      browser: "chromium",
      authenticatedIdentities: STG1_CLERK.aliases.length,
      accountsCreatedByMatrix: 0,
      persistentDataWritesByMatrix: 0,
      realAiProviderCalls: 0,
      paymentProviderCalls: 0,
      traces: false,
      screenshots: false,
      providerIdsIncluded: false,
      credentialsIncluded: false,
      personalDataIncluded: false,
      contentIncluded: false,
      checks,
      summary: {
        passed: checks.filter((check) => check.status === "PASS").length,
        failed: checks.filter((check) => check.status === "FAIL").length,
        terminalFailure,
      },
    };
    const serialized = `${JSON.stringify(report, null, 2)}\n`;
    condition(!/user_[A-Za-z0-9]+/u.test(serialized));
    condition(!/@/u.test(serialized));
    const temporary = `${evidenceFile}.tmp`;
    fs.writeFileSync(temporary, serialized, { encoding: "utf8", mode: 0o600 });
    fs.renameSync(temporary, evidenceFile);
  }

  const failures = checks.filter((check) => check.status === "FAIL");
  if (terminalFailure || failures.length > 0) {
    throw new Error(
      `STG1_E07:MATRIX_FAILED:${failures.map((check) => check.id).join(",") || "SETUP"}`,
    );
  }
});
