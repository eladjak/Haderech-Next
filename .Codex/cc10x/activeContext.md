# Active Context

- Task: Fix AP-3 deployment candidate reproducibility failure between Windows worktree and canonical Git archive.
- Current candidate: `c6a218b5677dfbef2adbfb46a33e6af112ccc007` is NO-GO.
- Evidence: worktree payload digest differs from Git archive; archive suite is 513/514; generated Convex API omits receivingPracticeMigration.
- Boundaries: no deploy, codegen against provider, DB, seed, migration, push, merge, or production changes.
