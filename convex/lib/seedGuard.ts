/**
 * Guard for every seed mutation in this project.
 *
 * Seeding is fail-closed: it refuses to run on any deployment (production
 * included) unless that deployment explicitly opts in with the environment
 * variable `SEED_ENABLED=true`.
 *
 * Enable on a dev deployment:   npx convex env set SEED_ENABLED true
 * Disable again:                npx convex env remove SEED_ENABLED
 *
 * Production is expected to never carry this variable. If you genuinely need
 * to seed production, set it, run the seed, and remove it in the same sitting.
 */
export function assertSeedAllowed(seedName: string): void {
  if (process.env.SEED_ENABLED === "true") return;

  throw new Error(
    `Seed "${seedName}" is disabled on this deployment. ` +
      `Seeds only run where SEED_ENABLED=true is set ` +
      `(npx convex env set SEED_ENABLED true). ` +
      `Production is intentionally left without it.`
  );
}
