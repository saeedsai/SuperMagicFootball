# Single-developer coordination — owner directive of 2026-10-20

## Lean-memory protocol
Read `AGENTS.md`, `docs/memory/README.md`, `docs/memory/SHARED.md` and **only your own** `docs/memory/agents/smf-hourly-dev-20261019.md`. Other agents' memory files remain private by convention. Current plans and source supersede stale handovers.

## Sole developer and retired locks
The project owner designated `smf-hourly-dev-20261019` as the sole ongoing coding maintainer. All old `docs/agent_coordination/claims/*.json` entries are **retired historical records**: their `feature_id`, `owner`, `status` and `lock_key` no longer gate development. Do not claim, renew, verify or release a lock when starting work. The lock catalog and `scripts/claim_feature.py` are retained for history/tests only. Old chats must stop pushing unless the owner reauthorizes them; GitHub does not technically enforce chat-specific rights.

Previous active entries were explicitly retired with a handover; retirement **does not mean** their features passed tests, that another session completed work, or that its uncommitted changes exist in Git. In-flight unrelated commits must still be reconciled using the latest head and current blob SHA. Do not overwrite them.

## Every development increment
1. Read exact `dev` and `main` SHAs, relevant source/tests, open issues/PRs and the 30+15 owner roadmaps. Choose one useful, manageable feature.
2. Edit latest files; use SHA-checked GitHub Contents updates or commit to an up-to-date tree with a non-forced fast-forward. If rejected, collect exact error details; only retry after legitimately addressing the cause. Never bypass security checks or GitHub permissions.
3. Write focused tests, run local checks where possible, and wait for the exact-code-head full Node+Chromium 4+4 CI before promotion. Confirm Pages deployment and smoke separately. Never claim a deployed release from a `dev` commit alone.
4. Keep `docs/DEVELOPMENT_LOG_SINGLE_OWNER.md` plus your own small agent-memory checkpoint current. Do not change other agents' memory. Preserve rosters, IDs, squad ratios, saves, four controls, six formations and playable offline source.

## About revision on every commit
Preserve GitHub `dev` SHA lookup in About and the separate Game bundle version **on every commit** until the owner-requested `0.9.0.0` four-part version migration is implemented across runtime, tests and release manifest. Follow [`docs/VERSIONING_POLICY.md`](../VERSIONING_POLICY.md) and its contracts. A remote dev SHA is never proof that the deployed game has changed.

## Historical references
The old per-feature claim README, registry keys and tests remain as compatibility records, not workflow policy. Do not silently delete historical audit evidence or invent successful test results.
