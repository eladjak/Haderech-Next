# STG-1 synthetic fixture package

This package is only for Convex Development deployment `content-dog-757` and
fixture version `stg1-v1`. It does not authorize Production, real users,
commerce, a real AI provider, DNS changes or publication.

## What it creates

- One canonical legacy course baseline with exactly 75 progress-bearing lessons
  and without lesson `5.3.2`. This deliberately exercises the insertion branch
  of the reviewed receiving-practice migration.
- Seven synthetic Convex user rows mapped to separately created Clerk Staging
  accounts: `U0`, `A`, `B`, `E`, `X`, `ADMIN`, and `IMPOSTOR`. `ANON` has no
  account or row.
- Two dedicated community grants (`A`, `B`), one active course grant (`E`), one
  expired course grant (`X`), and one temporary admin role (`ADMIN`).

Committed manifests contain no provider user IDs, credentials or personal
email addresses. The Convex rows use reserved `example.invalid` addresses. Put
the actual provider-ID binding at `.stg1/identities.local.json`; that directory
is ignored by Git. Copy the shape from `stg1-identities.example.json`, but never
edit the example with real IDs.

## Write guard

Every persistent fixture mutation is internal and requires all of the following:

1. `SEED_ENABLED=true` on the isolated Development deployment.
2. `STG1_FIXTURES_ENABLED=content-dog-757:stg1-v1` on that deployment.
3. `STG1_DEPLOYMENT_NAME=content-dog-757` on that deployment.
4. Literal confirmation `STG1_CONTENT_DOG_757_V1`.
5. The fresh `planHash` returned by the immediately preceding preview.
6. The local runner validates a deployment-scoped key prefix and passes
   `--deployment content-dog-757` to every `convex run`.

The write environment flags must be removed or disabled after the rehearsal.
Their presence is not proof of the target; the CLI target guard and provider
read-back remain required.

## Sequence

Use `node scripts/stg1-fixtures.mjs` for an offline manifest check. Backend modes
require `--env-file <isolated-staging-env>`; identity modes additionally require
`--identity-map .stg1/identities.local.json`.

The required sequence is:

1. `--inspect-state`
2. `--preview-course`, then `--seed-course` with the displayed plan hash
3. receiving-practice preview → apply → verify using the separate guarded runner
4. `--preview-identities`, then `--seed-identities`
5. `--preview-access`, then run the separately validated ephemeral overlay with
   `node scripts/stg1-access-overlay.mjs --apply-access ...`
6. Run the role, privacy, community, simulator and payment-negative matrix
7. `--preview-containment`, then run
   `node scripts/stg1-access-overlay.mjs --contain-access ...`
8. receiving-practice rollback, followed by a read-only re-preview
9. `--inspect-state` and provider-side revision/function/table read-back

Every write mode also requires `--confirm-isolated-staging`,
`--confirm-fixture STG1_CONTENT_DOG_757_V1`, and
`--confirm-plan-hash <hash-from-that-preview>`. Containment additionally requires
`--confirm-containment CONTAIN_STG1_SYNTHETIC_ACCESS`.

The application release tree deliberately contains no writer for
`communityEntitlements` or `courseEntitlements`. Access apply/contain therefore
uses a disposable source tree containing `stg1AccessWriter`, uploads it only to
the isolated Development deployment, runs one internal mutation, and immediately
re-uploads the base tree. Function metadata must prove the overlay absent before,
present during, and absent after. The overlay runner also requires
`--confirm-overlay-cycle STG1_EPHEMERAL_WRITER_UPLOAD_EXECUTE_REMOVE`. If base
restoration fails, all testing stops and the deployment is treated as unsafe
until provider metadata proves the writer absent.

## Cleanup boundary

Containment revokes only the four rows owned by exact STG-1 source references
and demotes only the mapped synthetic admin. It performs no deletes. The seven
Convex rows are already non-PII and remain as staging evidence; the corresponding
Clerk Staging accounts are disabled separately after the browser matrix. The
course content is restored by the versioned receiving-practice rollback. Any
broader database reset is a separate provider action, not an implicit cleanup.
