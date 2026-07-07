import { NextRequest, NextResponse } from "next/server";
import { verifySumitWebhook } from "@/lib/sumit";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

/**
 * Sumit webhook handler (Phase 14, 2026-05-14).
 *
 * Receives payment events from Sumit:
 *  - payment.succeeded → activate subscription
 *  - payment.failed    → mark subscription past_due
 *  - subscription.cancelled → mark cancelled
 *  - invoice.issued    → log invoice URL
 *
 * Signature header (verify with Web Crypto HMAC-SHA256):
 *   X-Sumit-Signature: <hex digest>
 *
 * Currently writes to console + ack. Will dispatch to Convex internal mutation
 * once Sumit credentials are configured and event schemas verified.
 */

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  if (!rateLimit(`sumit-webhook:${ip}`, { max: 100, windowMs: 60_000 })) {
    return NextResponse.json(
      { error: "rate_limited" },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }

  const signature = req.headers.get("x-sumit-signature");
  if (!signature) {
    return NextResponse.json({ error: "missing_signature" }, { status: 401 });
  }

  const rawBody = await req.text();

  // Verify signature
  const isValid = await verifySumitWebhook(rawBody, signature);
  if (!isValid) {
    return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
  }

  let event: { type: string; data: Record<string, unknown> };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  // Log the event (will be picked up by Vercel logs)
  console.log("[sumit-webhook]", event.type, JSON.stringify(event.data).slice(0, 200));

  // TODO Phase 14 followup: dispatch to Convex internal mutation.
  // Requires either ConvexHttpClient on Edge (verify compatibility) or
  // running webhook on Node runtime to use the standard Convex client.

  return NextResponse.json({ received: true });
}

// Health check
export async function GET() {
  return NextResponse.json({
    service: "sumit-webhook",
    status: "ready",
    configured: Boolean(process.env.SUMIT_WEBHOOK_SECRET),
  });
}
