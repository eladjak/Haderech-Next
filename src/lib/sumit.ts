/**
 * Sumit payment integration for HaDerech (Phase 14).
 *
 * Sumit (sumit.co.il) is an Israeli payment processor that also generates
 * legal tax invoices (חשבוניות מס) automatically per Israeli law.
 *
 * Replaces Stripe — Israeli market needs:
 *   - ILS-native processing (no FX margin)
 *   - Automatic legal invoice issuance
 *   - "Hora'ot Keva" (recurring billing) compliant with Israeli regulation
 *
 * Status (2026-05-14): credentials pending from Sumit.
 * Required env vars before this becomes functional:
 *   SUMIT_API_TOKEN      — provided by Sumit at onboarding
 *   SUMIT_ORG_ID         — organization ID in Sumit
 *   SUMIT_WEBHOOK_SECRET — for signature verification on /api/sumit/webhook
 *   SUMIT_MODE           — "sandbox" or "production"
 *
 * Until then, createCheckoutSession returns a notice indicating setup pending.
 */

const SUMIT_API_BASE =
  process.env.SUMIT_MODE === "production"
    ? "https://api.sumit.co.il"
    : "https://sandbox.sumit.co.il"; // Sumit sandbox endpoint (verify with onboarding docs)

export type SumitPlanKey = "basic" | "premium" | "vip";

export type SumitCheckoutResult =
  | { ok: true; url: string; sessionId: string }
  | { ok: false; reason: "credentials_pending" | "api_error"; message: string };

export type SumitPlanConfig = {
  name: string;
  priceILS: number; // shekels (NOT agorot — Sumit uses shekel units in API)
  description: string;
  recurringMonths: number | null; // null = one-time, otherwise recurring
};

export const SUMIT_PLANS: Record<SumitPlanKey, SumitPlanConfig> = {
  basic: {
    name: "משנה",
    priceILS: 149,
    description: "מנוי חודשי - תכנית משנה - הדרך נקסט",
    recurringMonths: 12, // bill monthly, 12-month commitment per Israeli norms
  },
  premium: {
    name: "מוביל",
    priceILS: 299,
    description: "מנוי חודשי - תכנית מוביל - הדרך נקסט",
    recurringMonths: 12,
  },
  vip: {
    name: "VIP",
    priceILS: 599,
    description: "מנוי VIP - הדרך נקסט",
    recurringMonths: 12,
  },
};

/**
 * Returns true if Sumit credentials are configured.
 * UI uses this to enable/disable the checkout button.
 */
export function isSumitConfigured(): boolean {
  return Boolean(
    process.env.SUMIT_API_TOKEN &&
      process.env.SUMIT_ORG_ID &&
      process.env.SUMIT_WEBHOOK_SECRET
  );
}

/**
 * Create a Sumit hosted-tashlumim checkout session.
 * Returns a redirect URL that takes the user to Sumit's hosted payment page.
 *
 * Endpoint reference (Sumit REST API v11):
 *   POST /billing/payments/create
 *   POST /accounting/documents/create  (for the legal invoice post-payment)
 *
 * NOTE: exact endpoint paths must be verified against Sumit onboarding docs.
 */
export async function createSumitCheckout(args: {
  plan: SumitPlanKey;
  clerkUserId: string;
  customerEmail: string;
  customerName: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<SumitCheckoutResult> {
  if (!isSumitConfigured()) {
    return {
      ok: false,
      reason: "credentials_pending",
      message:
        "Sumit credentials not yet configured. Set SUMIT_API_TOKEN, SUMIT_ORG_ID, SUMIT_WEBHOOK_SECRET, SUMIT_MODE.",
    };
  }

  const plan = SUMIT_PLANS[args.plan];

  try {
    const response = await fetch(`${SUMIT_API_BASE}/billing/payments/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.SUMIT_API_TOKEN}`,
        "X-Org-Id": process.env.SUMIT_ORG_ID as string,
      },
      body: JSON.stringify({
        amount: plan.priceILS,
        currency: "ILS",
        description: plan.description,
        customer: {
          email: args.customerEmail,
          name: args.customerName,
          externalId: args.clerkUserId,
        },
        recurring: plan.recurringMonths
          ? {
              months: plan.recurringMonths,
              interval: "monthly",
            }
          : undefined,
        // Generate legal tax invoice automatically on successful payment
        autoIssueInvoice: true,
        successUrl: args.successUrl,
        cancelUrl: args.cancelUrl,
        webhookUrl: `${args.successUrl.split("/")[0]}//${args.successUrl.split("/")[2]}/api/sumit/webhook`,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        ok: false,
        reason: "api_error",
        message: `Sumit API ${response.status}: ${errorText}`,
      };
    }

    const data = (await response.json()) as {
      paymentUrl: string;
      sessionId: string;
    };

    return {
      ok: true,
      url: data.paymentUrl,
      sessionId: data.sessionId,
    };
  } catch (error) {
    return {
      ok: false,
      reason: "api_error",
      message: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Verify a Sumit webhook signature.
 * Sumit signs payloads with HMAC-SHA256 using SUMIT_WEBHOOK_SECRET.
 */
export async function verifySumitWebhook(
  rawBody: string,
  signature: string
): Promise<boolean> {
  const secret = process.env.SUMIT_WEBHOOK_SECRET;
  if (!secret) return false;

  // Use Web Crypto API (available in Edge runtime + Node 19+)
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sigBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(rawBody)
  );
  const sigHex = Array.from(new Uint8Array(sigBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  // Constant-time compare
  if (sigHex.length !== signature.length) return false;
  let mismatch = 0;
  for (let i = 0; i < sigHex.length; i++) {
    mismatch |= sigHex.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return mismatch === 0;
}
