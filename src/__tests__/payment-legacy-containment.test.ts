import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const read = (relativePath: string) =>
  fs.readFileSync(path.resolve(process.cwd(), relativePath), "utf8");

const legacyConvex = read("convex/stripe.ts");
const legacyClient = read("src/lib/stripe.ts");
const subscriptions = read("convex/subscriptions.ts");

describe("legacy payment containment", () => {
  it("keeps every Stripe path fail-closed", () => {
    expect(legacyConvex).toContain("LEGACY_STRIPE_AVAILABLE: boolean = false");
    expect(legacyConvex).toContain("Legacy Stripe integration is disabled");
    expect(legacyConvex).toContain('status: "unavailable"');
    expect(legacyConvex).toContain("url: null");
    expect(legacyClient).toContain("STRIPE_LEGACY_AVAILABLE: boolean = false");
    expect(legacyClient).not.toMatch(/STRIPE_SECRET_KEY|import\("stripe"\)|14900|29900/);
  });

  it("requires admin for aggregate billing statistics", () => {
    expect(subscriptions).toContain("await requireAdmin(ctx)");
    expect(subscriptions).toMatch(/export const getStats[\s\S]*await requireAdmin\(ctx\)/u);
  });

  it("projects self-service billing records without provider identifiers", () => {
    const publicQueries = subscriptions.slice(
      0,
      subscriptions.indexOf("// Create free subscription")
    );
    expect(publicQueries).toContain(".map((payment) => ({");
    expect(publicQueries).not.toContain("stripePaymentIntentId:");
    expect(publicQueries).not.toContain("stripeCustomerId:");
    expect(publicQueries).not.toContain("stripeSubscriptionId:");
  });
});
