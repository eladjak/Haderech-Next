/**
 * Stripe integration utilities for HaDerech.
 *
 * NOTE: Install the `stripe` package before using getStripe():
 *   npm install stripe
 *
 * The PLANS configuration can be used immediately without the package.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type StripeClient = any;

// Will be initialized when STRIPE_SECRET_KEY is set
let stripeInstance: StripeClient | null = null;

/**
 * Get or create a Stripe server-side client instance.
 * Requires the `stripe` npm package to be installed.
 */
export async function getStripe(): Promise<StripeClient> {
  if (!stripeInstance) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }

    // Dynamic import so the module only needs to be present at runtime.
    // Install with: npm install stripe
    // @ts-expect-error -- stripe package must be installed separately
    const { default: Stripe } = await import("stripe");
    stripeInstance = new Stripe(key, {
      apiVersion: "2024-12-18.acacia",
      typescript: true,
    });
  }
  return stripeInstance;
}

// Plan configuration
export const PLANS = {
  free: {
    name: "טעימה",
    nameEn: "free",
    price: 0,
    stripePriceId: null,
    features: [
      "5 שיעורים ראשונים",
      "מאמן AI - 10 הודעות",
      "2 תרחישי סימולטור",
      "ספריית מאמרים",
    ],
  },
  basic: {
    name: "משנה",
    nameEn: "basic",
    price: 14900, // agorot (149 ILS)
    stripePriceId: process.env.STRIPE_BASIC_PRICE_ID ?? "",
    features: [
      "כל 73 השיעורים",
      "מאמן AI ללא הגבלה",
      "סימולטור קולי + וידאו",
      "קהילה + לוח מובילים",
      "תעודת סיום",
    ],
  },
  premium: {
    name: "מוביל",
    nameEn: "premium",
    price: 29900, // agorot (299 ILS)
    stripePriceId: process.env.STRIPE_PREMIUM_PRICE_ID ?? "",
    features: [
      "הכל במשנה +",
      "קואצ׳ינג קבוצתי עם אלעד",
      "מאסטרקלאסים בלעדיים",
      "דוחות AI מעמיקים",
      "תמיכה בעדיפות",
    ],
  },
} as const;

export type PlanKey = keyof typeof PLANS;
