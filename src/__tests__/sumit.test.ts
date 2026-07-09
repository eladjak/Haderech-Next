import { describe, it, expect, beforeEach, afterAll } from "vitest";
import {
  isSumitConfigured,
  SUMIT_PLANS,
  verifySumitWebhook,
} from "@/lib/sumit";

describe("isSumitConfigured", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    delete process.env.SUMIT_API_TOKEN;
    delete process.env.SUMIT_ORG_ID;
    delete process.env.SUMIT_WEBHOOK_SECRET;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("returns false when no env vars are set", () => {
    expect(isSumitConfigured()).toBe(false);
  });

  it("returns false when only some env vars are set", () => {
    process.env.SUMIT_API_TOKEN = "token";
    expect(isSumitConfigured()).toBe(false);
    process.env.SUMIT_ORG_ID = "org";
    expect(isSumitConfigured()).toBe(false);
  });

  it("returns true when all three env vars are set", () => {
    process.env.SUMIT_API_TOKEN = "token";
    process.env.SUMIT_ORG_ID = "org";
    process.env.SUMIT_WEBHOOK_SECRET = "secret";
    expect(isSumitConfigured()).toBe(true);
  });
});

describe("SUMIT_PLANS", () => {
  it("has correct Israeli pricing in ILS shekel units (not agorot)", () => {
    expect(SUMIT_PLANS.basic.priceILS).toBe(149);
    expect(SUMIT_PLANS.premium.priceILS).toBe(299);
    expect(SUMIT_PLANS.vip.priceILS).toBe(599);
  });

  it("has Hebrew plan names", () => {
    expect(SUMIT_PLANS.basic.name).toBe("משנה");
    expect(SUMIT_PLANS.premium.name).toBe("מוביל");
    expect(SUMIT_PLANS.vip.name).toBe("VIP");
  });

  it("includes 12-month recurring commitment", () => {
    expect(SUMIT_PLANS.basic.recurringMonths).toBe(12);
    expect(SUMIT_PLANS.premium.recurringMonths).toBe(12);
    expect(SUMIT_PLANS.vip.recurringMonths).toBe(12);
  });
});

describe("verifySumitWebhook", () => {
  it("returns false when SUMIT_WEBHOOK_SECRET is not set", async () => {
    delete process.env.SUMIT_WEBHOOK_SECRET;
    const ok = await verifySumitWebhook("body", "deadbeef");
    expect(ok).toBe(false);
  });

  it("rejects an obviously wrong signature", async () => {
    process.env.SUMIT_WEBHOOK_SECRET = "test-secret";
    const ok = await verifySumitWebhook("body", "0000000000");
    expect(ok).toBe(false);
  });

  it("accepts a correctly-signed body", async () => {
    process.env.SUMIT_WEBHOOK_SECRET = "test-secret";
    const body = '{"event":"payment.succeeded"}';
    // Compute expected HMAC manually using Web Crypto
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode("test-secret"),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const sigBuffer = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(body)
    );
    const sigHex = Array.from(new Uint8Array(sigBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const ok = await verifySumitWebhook(body, sigHex);
    expect(ok).toBe(true);
  });
});

