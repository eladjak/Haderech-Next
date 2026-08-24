# Receiving-practice staging migration v1

This package synchronizes `5.3.2` into an **isolated staging deployment only**.
It is local/offline by default and does not authorize deployment, production,
or a database write merely because local tests pass.

## Frozen identity

- Migration key: `oh.course.migration.receiving-practice`
- Version: `2026-08-23.v1`
- Canonical parsed-JSON digest: `sha256:160d45adaf1d2c3fd83db048c4e871c0b3653e1ad29d1078029ae280b34fce5a`
- Course: `הדרך - אומנות הקשר`
- Lesson: `5.3.2` / `oh.course.lesson.receiving-practice`

## Local dry run (no backend)

```powershell
node scripts/receiving-practice-staging.mjs --dry-run
```

This verifies the frozen payload bytes and prints the contract. It deliberately
reports `backendInspected: false`.

The digest is computed after parsing JSON and recursively sorting object keys.
Whitespace and LF/CRLF checkout conversion therefore cannot change it. Arrays
retain their authored order, so semantically meaningful list reordering still
changes the digest.

## Reproducible release notes

- `convex/_generated/api.d.ts` contains the migration module in the same sorted
  import/module map format as the existing generated file. It was updated and
  reviewed offline; no Convex CLI, provider, deployment, or codegen command was
  run to produce it.
- npm is the canonical package manager for this release candidate: the repository
  began with `package-lock.json`, CI uses `npm ci`, and `vercel.json` uses
  `npm install`. The later `pnpm-lock.yaml` remains tracked historical input but
  is not a release authority. This remediation deliberately does not rewrite or
  remove either lockfile and does not pin a new npm version.
- The release archive exclusions are declared in
  [`ap3-release-manifest.json`](./ap3-release-manifest.json). Tracked browser and
  test-result artifacts remain untouched in Git and in the user's worktree.

## Isolated staging runbook

Prerequisites: use a dedicated staging deployment and a dedicated env file whose
filename contains `staging`; make a provider-side staging backup/export and record
its identifier before applying. Do not use `.env.local` or a production deployment.

Read-only preview:

```powershell
node scripts/receiving-practice-staging.mjs --inspect-staging --env-file .env.isolated-staging
```

Proceed only when preview returns `status: "ready"` (or `already_applied` for a
verified rerun), has no conflicts, and the reported digest/version match this file.
Copy its `planHash`. That SHA-256 binds the course/target IDs, candidate SHA-256,
all relevant pre-state rows, progress/quiz/attempt counts, and the expected
`75 required + 1 optional` post-state. Any concurrent state change causes apply
to abort with `STALE_PLAN_HASH`; the Convex mutation then re-evaluates atomically.

Apply exactly once (the mutation re-runs the same checks atomically):

```powershell
$planHash = "<PLAN_HASH_FROM_THE_IMMEDIATELY_PRECEDING_PREVIEW>"
node scripts/receiving-practice-staging.mjs --apply --env-file .env.isolated-staging --confirm-isolated-staging --confirm-version 2026-08-23.v1 --confirm-source-digest sha256:160d45adaf1d2c3fd83db048c4e871c0b3653e1ad29d1078029ae280b34fce5a --confirm-plan-hash $planHash
```

Then repeat the read-only preview. It must return `already_applied`, `writes: 0`,
the same target lesson ID, and the same version marker.
The wrapper also runs `verifyReceivingPracticeMigration` immediately after apply
and exits non-zero unless it returns `contained: true`, 75 required lessons,
one optional lesson, and 76 total lessons.

## Invariants and conflicts

- Exactly one canonical course, predecessor, and successor must exist.
- Duplicate `scriptIndex`, duplicate `contentKey`, split identities, duplicate
  version markers, or anchor-order drift stop the migration before writes.
- Existing progress rows are counted and preserved; the lesson ID is never
  replaced when adopting an existing row.
- Any quiz or quiz attempt on an existing `5.3.2` row is a hard conflict because
  this practice is explicitly unscored.
- A fresh insert shifts later lesson orders once, from highest to lowest, and
  records every prior order for rollback.
- Existing duplicate lesson-order values stop the migration instead of being
  normalized implicitly.

## Rollback

Rollback is version-specific. It restores the exact metadata snapshot when the
target pre-existed, or deletes a newly inserted target only if it has no progress.
It restores each shifted order only if no post-migration order drift is detected.

```powershell
node scripts/receiving-practice-staging.mjs --rollback --env-file .env.isolated-staging --confirm-isolated-staging --confirm-version 2026-08-23.v1 --confirm-source-digest sha256:160d45adaf1d2c3fd83db048c4e871c0b3653e1ad29d1078029ae280b34fce5a --confirm-rollback ROLLBACK_RECEIVING_PRACTICE
```

If rollback fails closed because the new lesson already has progress or another
lesson's order drifted, stop. Preserve the marker and data, compare with the
recorded staging backup/export, and prepare a new reviewed migration; do not
manually delete rows.
