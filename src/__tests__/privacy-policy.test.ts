import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  PRIVACY_DATASETS,
  assertPrivacyDatasetMapIsValid,
  isOpenPrivacyRequest,
  latestOpenPrivacyRequest,
  privacyRequestIntakeState,
  toSafePaymentExport,
  toSafePushSubscriptionExport,
  toSafeSubscriptionExport,
} from "../../convex/lib/privacyPolicy";

const root = process.cwd();

function read(relativePath: string): string {
  return fs.readFileSync(path.resolve(root, relativePath), "utf8");
}

function directlyOwnedSchemaTables(schema: string): Set<string> {
  const tables = new Set<string>();
  const tablePattern = /^  ([A-Za-z][A-Za-z0-9_]*): defineTable\(\{([\s\S]*?)^  \}\)/gm;
  for (const match of schema.matchAll(tablePattern)) {
    const [, table, body] = match;
    if (/^    (?:userId|clerkId|authorId|studentId):/m.test(body)) {
      tables.add(table);
    }
  }
  return tables;
}

describe("privacy dataset contract", () => {
  it("has unique table and category mappings", () => {
    expect(() => assertPrivacyDatasetMapIsValid()).not.toThrow();
  });

  it("negative control rejects a duplicate table mapping", () => {
    expect(() =>
      assertPrivacyDatasetMapIsValid([
        PRIVACY_DATASETS[0],
        { ...PRIVACY_DATASETS[0], category: "duplicate-profile" },
      ])
    ).toThrow("DUPLICATE_PRIVACY_TABLE:users");
  });

  it("maps every schema table with a direct user ownership field", () => {
    const schemaOwned = directlyOwnedSchemaTables(read("convex/schema.ts"));
    const mapped = new Set(PRIVACY_DATASETS.map((dataset) => dataset.table));
    const missing = [...schemaOwned].filter((table) => !mapped.has(table));
    expect(missing).toEqual([]);
  });

  it("queries every mapped dataset, including indirect message tables", () => {
    const exportSource = read("convex/lib/privacyExport.ts");
    const missing = PRIVACY_DATASETS.filter(
      (dataset) =>
        dataset.table !== "users" &&
        !exportSource.includes(`.query("${dataset.table}")`)
    ).map((dataset) => dataset.table);
    expect(missing).toEqual([]);
  });
});

describe("privacy export projections", () => {
  it("keeps instant quiz export learner-safe and reserves raw grading data for manual DSAR", () => {
    const exportSource = read("convex/lib/privacyExport.ts");
    const settingsSource = read("src/app/settings/page.tsx");
    const quizDataset = PRIVACY_DATASETS.find(
      (dataset) => dataset.table === "quizAttempts"
    );

    expect(quizDataset?.exportMode).toBe("filtered");
    expect(exportSource).toContain(
      "quizAttempts: quizAttempts.map(toQuizAttemptSummary)"
    );
    expect(exportSource).toContain("דורשים בקשת גישה מלאה, אימות זהות");
    expect(settingsSource).toContain("זהו ייצוא עצמי מסונן");
    expect(settingsSource).toContain("ללא התשובות");
    expect(settingsSource).toContain("טיפול ידני");
  });

  it("omits push endpoint and credential material", () => {
    const raw = {
      endpoint: "https://push.invalid/device-secret",
      p256dh: "public-key",
      auth: "auth-secret",
      active: true,
      userAgent: "Browser",
      createdAt: 1,
      updatedAt: 2,
    };
    const projected = toSafePushSubscriptionExport(raw);
    expect(projected).not.toHaveProperty("endpoint");
    expect(projected).not.toHaveProperty("p256dh");
    expect(projected).not.toHaveProperty("auth");
    expect(projected.credentialMaterialOmitted).toBe(true);
  });

  it("omits external payment and subscription provider identifiers", () => {
    const subscription = toSafeSubscriptionExport({
      plan: "premium",
      status: "active",
      currentPeriodStart: 1,
      currentPeriodEnd: 2,
      cancelAtPeriodEnd: false,
      createdAt: 1,
      updatedAt: 2,
    });
    const payment = toSafePaymentExport({
      amount: 14900,
      currency: "ILS",
      status: "succeeded",
      description: "Course",
      createdAt: 1,
    });
    expect(subscription).not.toHaveProperty("stripeCustomerId");
    expect(subscription).not.toHaveProperty("stripeSubscriptionId");
    expect(payment).not.toHaveProperty("stripePaymentIntentId");
  });
});

describe("privacy request states", () => {
  it("treats only intake and review states as open", () => {
    expect(isOpenPrivacyRequest("received")).toBe(true);
    expect(isOpenPrivacyRequest("identity_verification_required")).toBe(true);
    expect(isOpenPrivacyRequest("in_review")).toBe(true);
    expect(isOpenPrivacyRequest("completed")).toBe(false);
    expect(isOpenPrivacyRequest("rejected")).toBe(false);
    expect(isOpenPrivacyRequest("cancelled")).toBe(false);
  });

  it("requires manual verification before deletion and access work", () => {
    expect(privacyRequestIntakeState("deletion")).toEqual({
      status: "identity_verification_required",
      identityVerification: "manual_verification_required",
    });
    expect(privacyRequestIntakeState("access")).toEqual({
      status: "identity_verification_required",
      identityVerification: "manual_verification_required",
    });
    expect(privacyRequestIntakeState("marketing_objection")).toEqual({
      status: "received",
      identityVerification: "authenticated_session_only",
    });
  });

  it("deduplicates against the newest open request, not a completed one", () => {
    const selected = latestOpenPrivacyRequest([
      { status: "completed" as const, requestedAt: 30, id: "completed" },
      { status: "received" as const, requestedAt: 10, id: "older" },
      { status: "in_review" as const, requestedAt: 20, id: "newer" },
    ]);
    expect(selected?.id).toBe("newer");
    expect(
      latestOpenPrivacyRequest([
        { status: "completed" as const, requestedAt: 30 },
      ])
    ).toBeNull();
  });

  it("does not implement deletion inside the request mutation", () => {
    const users = read("convex/users.ts");
    const start = users.indexOf("export const requestAccountDeletion =");
    const end = users.indexOf("\nexport const ", start + 1);
    const requestFunction = users.slice(start, end);
    expect(requestFunction).toContain("createOrReturnPrivacyRequest");
    expect(requestFunction).not.toContain("ctx.db.delete");
    expect(requestFunction).not.toContain("deletionRequested: true");
  });
});

describe("course entitlement boundary", () => {
  it("has no public or internal writer for trusted course entitlements", () => {
    const files = fs
      .readdirSync(path.resolve(root, "convex"))
      .filter((file) => file.endsWith(".ts") && file !== "schema.ts");
    const writers = files.filter((file) =>
      read(path.join("convex", file)).includes('insert("courseEntitlements"')
    );
    expect(writers).toEqual([]);
  });
});
