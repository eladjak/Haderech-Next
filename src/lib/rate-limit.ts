/**
 * Simple in-memory rate limiter for Next.js API routes (Phase 14 hardening).
 *
 * Limits:
 * - Per-IP request count within a sliding window.
 * - Default: 20 requests / 60s for write endpoints, 100 / 60s for webhooks.
 *
 * Limitations:
 * - Map is per-isolate. On Vercel serverless, multiple isolates means an
 *   attacker with distributed IPs can scale by N isolates. For production
 *   abuse-resistance, swap for Upstash Redis or Vercel KV. Good enough for
 *   first deploy + bot mitigation.
 *
 * Usage:
 *   import { rateLimit } from "@/lib/rate-limit";
 *   const allowed = rateLimit(getClientIp(req), { max: 5, windowMs: 60_000 });
 *   if (!allowed) return new Response("rate_limited", { status: 429 });
 */

type Entry = { count: number; resetAt: number };

const buckets = new Map<string, Entry>();
const MAX_BUCKET_SIZE = 10_000; // soft cap to prevent unbounded memory growth

export type RateLimitOptions = {
  max?: number; // default 20
  windowMs?: number; // default 60_000
};

export function rateLimit(
  key: string,
  options: RateLimitOptions = {}
): boolean {
  const max = options.max ?? 20;
  const windowMs = options.windowMs ?? 60_000;
  const now = Date.now();

  // Periodic cleanup of expired entries when bucket grows
  if (buckets.size > MAX_BUCKET_SIZE) {
    for (const [k, v] of buckets) {
      if (v.resetAt < now) buckets.delete(k);
    }
  }

  const entry = buckets.get(key);
  if (!entry || entry.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= max) return false;
  entry.count++;
  return true;
}

/**
 * Extract a stable client identifier from request headers.
 * Vercel sets x-forwarded-for; falls back to x-real-ip then "unknown".
 */
export function getClientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const xri = req.headers.get("x-real-ip");
  if (xri) return xri.trim();
  return "unknown";
}

/**
 * Test-only helper to reset state between tests.
 */
export function __resetRateLimit(): void {
  buckets.clear();
}
