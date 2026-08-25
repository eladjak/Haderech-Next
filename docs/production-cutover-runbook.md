# Haderech production cutover runbook

Status: **blocked from production changes until the two provider gates below are explicitly approved and completed.**

Measured on 2026-08-25:

- Vercel Production currently has `NEXT_PUBLIC_CONVEX_URL` and Clerk key variables, but does not have the independent `PRODUCTION_CONVEX_URL` guard or the modern Clerk fallback redirect variables.
- Convex project `haderech-next-staging` currently has only `dev/l-d-y-qvbvbyts` (`content-dog-757`). The dashboard offers **Create a production deployment**; no Production deployment exists yet.
- The local Convex CLI cannot read the project Production target and reports that the account lacks access to the selected project.
- Clerk Dashboard requires a fresh interactive sign-in before a Production instance can be verified or created.

## Gate 1 — Convex Production

This gate changes external provider state and must not be executed as part of an ordinary build.

1. Create one Production deployment inside the existing `haderech-next-staging` project.
2. Record its exact `https://<deployment>.convex.cloud` URL without whitespace.
3. Deploy the reviewed Convex functions to that Production deployment once, using a Production-scoped deploy key. Do not reuse a Development key.
4. Verify function metadata with `npx convex function-spec --prod` and compare the expected public/internal function surface.
5. Verify schema/table presence and bounded record counts. Do not export or print user content for this check.
6. Run one intentional unauthenticated negative control against a protected query and one authenticated positive control against the same boundary.
7. Set both Vercel Production variables to the exact same URL:
   - `NEXT_PUBLIC_CONVEX_URL`
   - `PRODUCTION_CONVEX_URL` (server-side guard; do not expose it to the browser)

The build must fail if either value is missing, contains trailing whitespace, points outside `*.convex.cloud`, or differs from the other.

## Gate 2 — Clerk Production

1. Sign in interactively to Clerk Dashboard.
2. Verify whether a Production instance already exists. If not, create one for the approved live root domain.
3. Restrict allowed origins/subdomains to the surfaces actually used by Haderech.
4. Configure the approved OAuth providers with their own Production credentials and callback URLs.
5. Configure and verify the Clerk-to-Convex JWT template/issuer used by the application.
6. Replace Vercel Production keys with the matching instance pair:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...`
   - `CLERK_SECRET_KEY=sk_live_...`
7. Keep these route variables:
   - `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in`
   - `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up`
8. Replace deprecated `AFTER_SIGN_*` settings with:
   - `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard`
   - `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/dashboard`
9. Remove deprecated redirect variables only after the new variables pass a positive sign-in/sign-up test and a deliberately invalid redirect is rejected.

## Vercel deployment gate

Before any Production redeploy:

1. `npm ci`
2. `npm run lint -- --max-warnings=0`
3. `npm run typecheck`
4. `npm test`
5. `npm run test:e2e`
6. `npm audit --audit-level=high`
7. `npm run build:local` with `VERCEL_ENV=production` and the intended Production environment values.

After deploy, verify:

- `/api/health` and `/healthz` return HTTP 200 with every named check `ok` and without provider URLs or secrets in the response.
- A broken dependency produces HTTP 503 (`degraded`), proving the health instrument can fail.
- Sign-in, sign-up, sign-out, session refresh and a protected Convex query work on the live domain.
- An unauthenticated request cannot read protected data.
- Canonicals, legal pages, sitemap, robots, Axe and keyboard checks pass on the deployed surface.

## Rollback

- Roll back the Vercel deployment first if frontend configuration is wrong.
- Keep the previous Convex deployment code available in deployment history; do not delete data or deployments during rollback.
- Restore the previous Clerk keys only if they belong to the same approved live instance. Never restore Development keys to Production.
- Treat the cutover as incomplete until the live positive and negative controls both pass.
