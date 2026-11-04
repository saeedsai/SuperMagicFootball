# Coordinated development

The project owner requires coordinated multi-agent work by default. This supersedes any earlier single-developer-only rule. Use as much parallel capacity as the active runtime/account allows, without assuming unlimited concurrency; fill freed slots promptly and keep coordinator work moving on disjoint scopes while agents run. The game and Studio use their existing `dev` branches; do not create branches or edit `main`.

The [Lean-memory protocol](../memory/README.md) limits shared context and protects private-by-convention checkpoints. The product version stays About-only under [`VERSIONING_POLICY.md`](../VERSIONING_POLICY.md); immutable commit SHA and hosted bytes are release evidence, not player-facing UI.

## Scope and integration

- The task coordinator owns the integrated backlog and final shared-file changes. Each worker receives a concrete scope and a list of owned files or a read-only audit assignment.
- Parallelize audits and independent implementation work. Continue each worker through successive unblocked scopes when its current scope is complete. Never edit the same source, test, asset manifest or documentation file concurrently. Stop and reconcile only the overlapping scopes if work conflicts or the branch head changes; other independent work continues.
- Use existing `dev` as the source of truth. Check `git status`, branch and exact HEAD before editing and before integration. Preserve unrelated staged/unstaged changes and never force-push or bypass CI/review.
- Legacy entries in `claims/` and `FEATURE_REGISTRY.json` are retained as historical records. They do not reserve code or require a claim. They do not prove a feature was completed or tested.
- Do not read another agent's private-by-convention memory or checkpoint. Shared project guidance is in `AGENTS.md`, `docs/README.md` and `docs/MASTER_BACKLOG.md`.

## Completion evidence

For code work, add focused regressions, run affected and required full suites on the integrated SHA, and report exact results. For artwork, include provenance, real Studio import/render/export evidence, in-game desktop/touch review, and an explicit visual approval status. CI, protected release, hosted deployment, physical-device testing and two-device multiplayer are separate gates; do not infer one from another.

The canonical work sequence and status for every owner request are in [the master backlog](../MASTER_BACKLOG.md). Update that file rather than maintaining competing roadmaps.
