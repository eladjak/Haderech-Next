/**
 * Legacy Stripe tombstone.
 *
 * The application has no approved Stripe checkout, durable order store or
 * fulfillment path. Keep this module fail-closed so an environment variable
 * or an old import cannot silently revive a draft payment catalog.
 */

export const STRIPE_LEGACY_AVAILABLE: boolean = false;

export async function getStripe(): Promise<never> {
  throw new Error("Legacy Stripe integration is disabled");
}

export const PLANS = {} as const;

export type PlanKey = never;
