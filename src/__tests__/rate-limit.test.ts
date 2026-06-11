import { describe, it, expect, beforeEach } from "vitest";
import { rateLimit, getClientIp, __resetRateLimit } from "@/lib/rate-limit";

describe("rateLimit", () => {
  beforeEach(() => {
    __resetRateLimit();
  });

  it("allows requests under the limit", () => {
    expect(rateLimit("ip:1", { max: 3, windowMs: 1000 })).toBe(true);
    expect(rateLimit("ip:1", { max: 3, windowMs: 1000 })).toBe(true);
    expect(rateLimit("ip:1", { max: 3, windowMs: 1000 })).toBe(true);
  });

  it("blocks requests over the limit", () => {
    rateLimit("ip:2", { max: 2, windowMs: 1000 });
    rateLimit("ip:2", { max: 2, windowMs: 1000 });
    expect(rateLimit("ip:2", { max: 2, windowMs: 1000 })).toBe(false);
  });

  it("isolates buckets per key", () => {
    rateLimit("ip:a", { max: 1, windowMs: 1000 });
    expect(rateLimit("ip:a", { max: 1, windowMs: 1000 })).toBe(false);
    expect(rateLimit("ip:b", { max: 1, windowMs: 1000 })).toBe(true);
  });

  it("uses default max=20", () => {
    for (let i = 0; i < 20; i++) {
      expect(rateLimit("ip:def")).toBe(true);
    }
    expect(rateLimit("ip:def")).toBe(false);
  });
});

describe("getClientIp", () => {
  it("returns the first x-forwarded-for entry", () => {
    const req = new Request("http://localhost/", {
      headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8" },
    });
    expect(getClientIp(req)).toBe("1.2.3.4");
  });

  it("falls back to x-real-ip", () => {
    const req = new Request("http://localhost/", {
      headers: { "x-real-ip": "9.10.11.12" },
    });
    expect(getClientIp(req)).toBe("9.10.11.12");
  });

  it("returns 'unknown' when no IP header is present", () => {
    const req = new Request("http://localhost/");
    expect(getClientIp(req)).toBe("unknown");
  });
});
