import { NextRequest, NextResponse } from "next/server";
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
 * Containment mode: even a correctly signed event is rejected with 503 until
 * durable idempotency, pending-order matching and fulfillment are implemented.
 */

function paymentFulfillmentUnavailable() {
  return NextResponse.json(
    { error: "payment_fulfillment_unavailable" },
    { status: 503, headers: { "Cache-Control": "no-store" } }
  );
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  if (!rateLimit(`sumit-webhook:${ip}`, { max: 100, windowMs: 60_000 })) {
    return NextResponse.json(
      { error: "rate_limited" },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }

  // Fulfillment does not exist, so do not parse provider input or branch on
  // secret/signature state. Every non-rate-limited probe receives one fixed
  // containment response and cannot use this endpoint as a config oracle.
  return paymentFulfillmentUnavailable();
}

// Fixed containment response. Do not expose whether provider secrets exist;
// deployment health belongs behind authenticated infrastructure monitoring.
export async function GET() {
  return paymentFulfillmentUnavailable();
}
