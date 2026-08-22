import fs from "node:fs";
import path from "node:path";
import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { PAID_PURCHASES_AVAILABLE } from "@/lib/pricing";
import {
  GET as getSumitWebhookStatus,
  POST as postSumitWebhook,
} from "@/app/api/sumit/webhook/route";

function read(relativePath: string): string {
  return fs.readFileSync(path.resolve(process.cwd(), relativePath), "utf8");
}

describe("local payment containment", () => {
  it("keeps paid offers unavailable in the learner UI", () => {
    expect(PAID_PURCHASES_AVAILABLE).toBe(false);
    expect(read("src/app/pricing/page.tsx")).toContain(
      "if (!PAID_PURCHASES_AVAILABLE)"
    );
    expect(read("src/app/billing/page.tsx")).toContain(
      "!PAID_PURCHASES_AVAILABLE"
    );
  });

  it("blocks checkout before any provider request", () => {
    const source = read("convex/sumit.ts");
    expect(source).toContain("PAYMENT_FULFILLMENT_IMPLEMENTED: boolean = false");
    expect(source).toContain("DURABLE_PAYMENT_STORE_IMPLEMENTED: boolean = false");
    expect(source.indexOf('status: "unavailable"')).toBeGreaterThan(-1);
    expect(source.indexOf('status: "unavailable"')).toBeLessThan(
      source.indexOf("await fetch(")
    );
  });

  it("does not acknowledge even a valid webhook while fulfillment is absent", () => {
    const source = read("src/app/api/sumit/webhook/route.ts");
    expect(source).toContain('status: 503');
    expect(source).toContain('payment_fulfillment_unavailable');
    expect(source).not.toContain('webhook_not_configured');
    expect(source).not.toContain('received: true');
    expect(source).not.toContain('console.log("[sumit-webhook]"');
  });

  it("does not reveal webhook configuration through GET or POST", async () => {
    const original = process.env.SUMIT_WEBHOOK_SECRET;
    try {
      delete process.env.SUMIT_WEBHOOK_SECRET;
      const getWithoutSecret = await getSumitWebhookStatus();
      const postWithoutSecret = await postSumitWebhook(
        new NextRequest("http://localhost/api/sumit/webhook", {
          method: "POST",
          headers: {
            "x-forwarded-for": "198.51.100.21",
            "x-sumit-signature": "probe-without-secret",
          },
          body: '{"type":"probe"}',
        })
      );

      process.env.SUMIT_WEBHOOK_SECRET = "test-only-placeholder";
      const getWithSecret = await getSumitWebhookStatus();
      const postWithSecret = await postSumitWebhook(
        new NextRequest("http://localhost/api/sumit/webhook", {
          method: "POST",
          headers: {
            "x-forwarded-for": "198.51.100.22",
            "x-sumit-signature": "probe-with-secret",
          },
          body: '{"type":"probe"}',
        })
      );

      const responses = [
        getWithoutSecret,
        postWithoutSecret,
        getWithSecret,
        postWithSecret,
      ];
      const bodies = await Promise.all(
        responses.map((response) => response.text())
      );

      expect(responses.every((response) => response.status === 503)).toBe(true);
      expect(new Set(bodies)).toEqual(
        new Set(['{"error":"payment_fulfillment_unavailable"}'])
      );
      expect(bodies.every((body) => !body.includes("configured"))).toBe(true);
    } finally {
      if (original === undefined) {
        delete process.env.SUMIT_WEBHOOK_SECRET;
      } else {
        process.env.SUMIT_WEBHOOK_SECRET = original;
      }
    }
  });

  it("keeps the stale 51-lesson seed non-executable", () => {
    const source = read("convex/seedContent.ts");
    expect(source).toContain('code: "LEGACY_SEED_DISABLED"');
    expect(source).toContain("This archived 51-lesson draft cannot be seeded");
    expect(source).not.toMatch(/ctx\.db|db\.(?:insert|delete|patch|replace)\(/);
  });
});
