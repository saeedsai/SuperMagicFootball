# SuperMagicFootball — single-developer operating policy

**Effective 2026-10-20: owner-directed single-developer mode.** The owner has designated the central `smf-hourly-dev-20261019` development process as the sole ongoing implementer and maintainer. Existing multi-agent feature-lock requirements are **retired as a blocking gate**. The old `docs/agent_coordination/claims/*.json` entries are historical handover records, **not reservations**. Previous independent development chats must stop committing to this repository unless the owner explicitly reauthorizes them. GitHub permissions cannot technically enforce this rule against other credential holders.

## Mandatory context and priorities

Read `docs/memory/README.md`, `docs/memory/SHARED.md` and **only your own** `docs/memory/agents/smf-hourly-dev-20261019.md`. Read `docs/agent_coordination/README.md`, `docs/agent_coordination/FEATURE_REGISTRY.json`, the latest `dev` HEAD, open issues/PRs, the owner's 30-feature audit and 15-item UI/art/saves/version backlog and the relevant feature handover. Do not read or alter other agents' private-by-convention memory. Historical claims and old task-owner assignments require no claim/create/renew/release operations before coding.

## Working process (one accountable developer)

1. Before every edit, fetch the latest exact `dev` SHA and current file contents. Prefer one small, useful feature or defect fix per increment.
2. For each changed path, use the current GitHub Contents blob SHA or a non-force fast-forward commit based on the latest head. If GitHub rejects a write, record the **actual status/error**, fetch fresh content, assess conflicts, and retry only a corrected, legitimate operation. Never defeat authentication, branch protection, or rejected security validation.
3. Keep a dated handover in `docs/DEVELOPMENT_LOG_SINGLE_OWNER.md` and a compact checkpoint in your own memory. No feature-lock acquisition is required. Reconcile any independently committed work before editing the same path; never overwrite new unrelated work.
4. Run affected unit/regression tests, then the full Node and Chromium 4+4 suites before promotion. CI is authoritative for GitHub-hosted tests; do not claim tests ran if not observed. Release to `main` only after green exact-head checks; confirm GitHub Pages deployment and hosted smoke separately.
5. Preserve game behavior, all team/player IDs and ordering (223 teams / 2676 players), 2 GK / 3 DF / 4 MF / 3 FW squads, six formations, four action buttons, saved-game compatibility, offline play and accessible PC/mobile controls. Never force-push, replace an unrelated commit or falsify deployment/test results.

## About / release identification

Until a coordinated migration, preserve the existing current-dev Git SHA and separate bundle version in Credits/About. Run `node --test tests/about_revision.test.cjs tests/versioning_policy_contract.test.cjs` on source changes and report exact commits and deployment evidence. The owner wants a user-facing four-number `0.9.0.0` only in About; implement that in a separate atomic UI/release/tests migration without breaking existing verification or showing a remote SHA as proof of deployed assets. See `docs/VERSIONING_POLICY.md`.

## Policy scope

Single-developer mode removes **repository-created ownership blockers only**; it cannot prevent technical API errors or waive actual CI and security checks. Legacy `scripts/claim_feature.py` and claim-test fixtures remain for historical compatibility, not for gating new features. Refer to `docs/agent_coordination/README.md` for the migration record.
