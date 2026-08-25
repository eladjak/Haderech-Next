# STG-1 synthetic fixture package

This package is only for Convex Development deployment `content-dog-757` and
fixture version `stg1-v1`. It does not authorize Production, real users,
commerce, a real AI provider, DNS changes or publication.

## What it creates

- One canonical legacy course baseline with exactly 75 progress-bearing lessons
  and without lesson `5.3.2`. This deliberately exercises the insertion branch
  of the reviewed receiving-practice migration.
- Seven synthetic Convex user rows mapped to separately created Clerk Development
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
   `--deployment-name content-dog-757` to every `convex run`.

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
9. `--inspect-state`, sanitized rollback verification, Clerk verification and
   provider-side revision/function/table read-back
10. assemble the sanitized evidence bundle and run the exact E10 adjudicator

Every write mode also requires `--confirm-isolated-staging`,
`--confirm-fixture STG1_CONTENT_DOG_757_V1`, and
`--confirm-plan-hash <hash-from-that-preview>`. Containment additionally requires
`--confirm-containment CONTAIN_STG1_SYNTHETIC_ACCESS`.

## Clerk Development lifecycle

`node scripts/stg1-clerk-users.mjs --inspect --env-file .env.local` is the
read-only collision check. It reports counts only and never returns email
addresses, Clerk IDs or keys. Account creation is allowed only with literal
confirmation `CREATE_STG1_CLERK_USERS_CONTENT_DOG_757`. The runner creates exactly
the seven aliases above using Clerk Development test addresses matching
`stg1+clerk_test_<alias>@example.com`, exact
external/private ownership markers and no passwords. The identifiers are created
with Clerk's `reserved` status and `skip_password_requirement`; no legal-check or
password-strength bypass is used. It refuses Clerk Production keys and refuses
account deletion.

The two binding files are local-only:

- `.stg1/clerk-accounts.local.json`
- `.stg1/identities.local.json`

Each authenticated E07 browser context receives a one-use Clerk sign-in ticket
that expires after 120 seconds. No ticket is written to disk or evidence. After
the matrix and Convex containment pass, the exact seven owned accounts are banned
with confirmation `BAN_STG1_CLERK_USERS_CONTENT_DOG_757`. Banning revokes their
sessions and is reversible with the separately guarded unban mode. It never
changes pre-existing non-fixture Clerk users.

## Vercel Preview boundary

The only allowed browser target is
`https://haderech-preview.vercel.app`. The launcher
`scripts/stg1-preview-deploy.mjs` pins all of the following before it can write:

- Git branch `codex/omanut-integration-2026-08-22` and an exact 40-character
  commit SHA.
- Vercel project `haderech-next`, target `preview`, and GitHub branch metadata.
- Convex URL `https://content-dog-757.convex.cloud`.
- Clerk Development keys, disabled demo mode, application URL and the four
  Clerk routing URLs.
- `vercel.json` build command `next build`; a hidden `convex deploy` or
  Production target fails closed.

The ten branch-scoped values are sent through SSH stdin, never command-line
arguments. `CLERK_SECRET_KEY` is stored as a sensitive Vercel value. The runner
reads back all nine non-secret values exactly and checks sensitive-value presence
without returning it. It then deploys a Preview with branch metadata, verifies
the unique deployment before aliasing, captures the previous alias target as a
complete undo, assigns the dedicated alias, and verifies the alias live. A failed
post-alias read-back automatically restores the prior target.

Read-only local preflight:

```text
node scripts/stg1-preview-deploy.mjs --preflight --env-file .env.local
```

Execution additionally requires literal confirmation
`DEPLOY_STG1_PREVIEW_CONTENT_DOG_757`, the exact committed SHA and an absolute
evidence path outside the repository. There is no Production execution mode.

## E07 evidence boundary

Run the matrix only after identities and synthetic access are present:

```text
node scripts/stg1-access-matrix.mjs \
  --env-file .env.local \
  --base-url https://haderech-preview.vercel.app \
  --evidence-file <absolute-path>/e07-access-matrix.json \
  --confirm RUN_STG1_E07_CONTENT_DOG_757
```

The Playwright configuration uses one Chromium worker with traces, screenshots
and video disabled. The JSON report contains only stable check IDs, PASS/FAIL
states and aggregate counts. It contains no page content, personal data,
provider IDs, credentials or one-time tickets. The complete role and containment
expectations are documented in `stg1-e07-matrix.md`.

## E10 adjudication

`inspectStg1FixtureState` distinguishes applied from rolled-back migration
markers and active from revoked course/community grants. The E09 wrapper also
runs `verifyReceivingPracticeRollback`, which returns no document IDs or content
and passes only for the exact `75 required / 0 optional / rolled_back` state plus
the same-version conflict `MIGRATION_VERSION_ALREADY_ROLLED_BACK`.

The final sanitized bundle is adjudicated locally with:

```text
node scripts/stg1-final-audit.mjs \
  --input <absolute-path>/e10-final-input.json \
  --output <absolute-path>/e10-final-matrix.json \
  --confirm AUDIT_STG1_E10_CONTENT_DOG_757
```

The adjudicator performs no provider or Git operation. It has 18 independent
predicates covering scope, Production non-contact, E03-E09 artifact hashes,
Convex counts, exact containment, rollback, Clerk banning, live Preview, all 94
E07 checks, both overlay lifecycles, provider function/revision metadata, remote
Git SHA and cleanup. Missing evidence is `FAIL`; it never becomes PASS by
omission. It rejects a bundle containing Clerk keys, provider user IDs or email
addresses before writing the final matrix.

The input bundle is assembled by the read-only collector after E09, cleanup and
the final branch push:

```text
node scripts/stg1-e10-readback.mjs \
  --convex-env-file .stg1/e10-isolated-staging.env \
  --clerk-env-file .env.local \
  --identity-map .stg1/identities.local.json \
  --e03-file <absolute-evidence-path> \
  --e04-file <absolute-evidence-path> \
  --e05-file <absolute-evidence-path> \
  --e06-file <absolute-evidence-path> \
  --e07-file <absolute-evidence-path>/e07-access-matrix.json \
  --e08-file <absolute-evidence-path> \
  --e09-file <absolute-evidence-path> \
  --preview-file <absolute-evidence-path>/e06-preview-deploy.json \
  --provider-cleanup-file <absolute-evidence-path>/e10-provider-cleanup.json \
  --input-output <absolute-evidence-path>/e10-final-input.json \
  --matrix-output <absolute-evidence-path>/e10-final-matrix.json \
  --confirm READBACK_STG1_E10_CONTENT_DOG_757
```

The collector performs only Convex queries/function metadata/environment-name
listing, Clerk GETs, Preview HTTP GETs, `git ls-remote`, and an SSH existence
check for the fixed Preview temp directory. It has no mutation, deploy, env
write, account write, alias write or push path. The environment-list instrument
must observe the pre-existing `CLERK_JWT_ISSUER_DOMAIN` positive control before
it can claim the three temporary write flags are absent. Preview read-back must
find exactly `content-dog-757.convex.cloud` and a Clerk `pk_test_` frontend in the
live HTML/JavaScript surface after the final push.

`e10-provider-cleanup.json` is a sanitized provider-management projection. It
must contain `schemaVersion: 1`, the exact deployment name,
`providerManagementReadBack: true`, `temporaryConvexDeployKeys: 0`,
`backupRecorded: true`, `productionInspectedOrWritten: false`, zero account
deletion/broad database deletion counts, and the four zero-valued Production
action counters required by the adjudicator. It must never contain a key value,
provider ID, email address or document content.

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
Clerk Development accounts are banned separately after the browser matrix and
Convex containment. The course content is restored by the versioned
receiving-practice rollback. Any
broader database reset is a separate provider action, not an implicit cleanup.
