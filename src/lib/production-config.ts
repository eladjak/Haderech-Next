export type ProductionConfigEnv = {
  NODE_ENV?: string;
  VERCEL_ENV?: string;
  NEXT_PUBLIC_DEMO_MODE?: string;
  ALLOW_DEMO_MODE?: string;
};

function enabled(value: string | undefined): boolean {
  return value?.trim().toLowerCase() === "true";
}

/**
 * Demo auth is a local-development capability, not a deployment mode. Both the
 * public request flag and an independent server-side opt-in are required.
 */
export function isDemoModeExplicitlyEnabled(
  env: ProductionConfigEnv = process.env
): boolean {
  return (
    env.NODE_ENV === "development" &&
    (env.VERCEL_ENV === undefined || env.VERCEL_ENV === "development") &&
    enabled(env.NEXT_PUBLIC_DEMO_MODE) &&
    enabled(env.ALLOW_DEMO_MODE)
  );
}

/**
 * Demo mode intentionally bypasses route protection for local demos. It must
 * never be present in a production build or production runtime.
 */
export function assertDemoModeConfiguration(
  env: ProductionConfigEnv = process.env
): boolean {
  const isDemoModeRequested = enabled(env.NEXT_PUBLIC_DEMO_MODE);
  if (!isDemoModeRequested) return false;

  if (!enabled(env.ALLOW_DEMO_MODE)) {
    throw new Error(
      "Refusing demo mode without the independent ALLOW_DEMO_MODE=true opt-in."
    );
  }
  if (!isDemoModeExplicitlyEnabled(env)) {
    throw new Error(
      "Refusing demo mode outside an explicit local development runtime."
    );
  }
  return true;
}

/** Backwards-compatible name retained for existing callers/tests. */
export const assertDemoModeDisabledInProduction = assertDemoModeConfiguration;
