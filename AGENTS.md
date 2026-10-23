# SuperMagicFootball — single-developer operating policy

## Highest-priority hourly development mandate (owner directive 2026-10-22)
**"NEVER STOP HOURLY DEVELOPMENT FOR ANY REASON"**
**"RESOLVE ANY BLOCKER AND CONTINUE DEVELOPMENT"**

Keep the hourly development automation enabled and the work cadence recurring. On any code, write, permission, CI, deployment, or tool blocker, investigate the actual root cause, attempt all authorized safe repairs, document concrete evidence, and resume the next useful development increment. Do not disable or pause the hourly schedule merely because an individual operation failed. If a blocker cannot be lawfully or technically cleared in the current run, preserve progress, pursue a safe alternative task on existing `dev`, and retry diagnosis next run. Do not bypass OpenAI safety checks, GitHub permissions, branch protections, required green CI, or force-push to satisfy this mandate.


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

On **every commit**, including documentation-only changes, preserve and verify the owner-approved **About-only four-part installed bundle version**. `src/modules/release.js` is the authoritative source for the current four-field release candidate, release date and player-friendly notes; home, title and other menus must not show the version, raw SHA or remote dev commit. `package.json` must agree. Run `node --test tests/about_revision.test.cjs tests/versioning_policy_contract.test.cjs` and full 4+4 exact-head regression. Keep full immutable Git SHAs **internally** in CI GitHub history and release audit; Pages hosted hash verification and actual deployment remain prerequisites for release claims. **Every player-facing deployment must advance the four-field version once** according to major feature, enhancement, or bug-fix scope. A documentation-only commit does **not** bump the player version. **Mandatory README release gate:** on every player-facing game update, update root `README.md` in the same release increment: set the current `x.y.z.a` in its release banner and project heading, add a dated, concise summary of all actually shipped changes (new features, enhancements, fixes and relevant compatibility notes), and keep the live-game link accurate. README, `src/modules/release.js`, `package.json`, service-worker cache, tests and release notes must agree. Never promote or claim deployment if README is stale. Documentation-only changes do not bump the installed game version. Follow `docs/VERSIONING_POLICY.md`.

## Policy scope

Single-developer mode removes **repository-created ownership blockers only**; it cannot prevent technical API errors or waive actual CI and security checks. Legacy `scripts/claim_feature.py` and claim-test fixtures remain for historical compatibility, not for gating new features. Refer to `docs/agent_coordination/README.md` for the migration record.

## Owner directive — persistent blocker-removal and completion mandate (2026-10-21)

The owner authorizes the designated sole developer to perform **all legitimate development, diagnosis, testing, documentation, CI repair and release operations** necessary to deliver the complete game roadmap, without waiting for routine approvals. Treat blockers as engineering work, **not as stopping points**. On every run, read this policy and `docs/DEVELOPER_BLOCKER_PLAYBOOK.md`, along with the mandatory context above.

When blocked: capture the exact failing command, job, stack trace or API response; reproduce or narrow it; determine root cause; implement the smallest safe correction; add a regression test; use current blob SHAs to commit to `dev`; rerun focused and exact-head full CI; repeat until resolved. If an authorized write is rejected, inspect permissions, stale SHAs, content policy and API schema, refresh and retry a legitimate route. In parallel, continue non-conflicting tasks and prepare a tested patch. Do **not** merely report a blocker and stop; record what was tried, the evidence and the next executable action. Never claim a blocker was removed until verified.

This authority **does not** permit circumventing platform security, overriding branch protections, force-pushing, erasing concurrent work, weakening tests, inventing test results or promoting red builds. Where external access genuinely prevents a fix, preserve a reproducible handover and advance independent work. Continue hourly iterations while the automation is enabled, until the roadmap is completed and verified, rather than implying a single run can finish everything.

## Permanent two-branch restriction (owner directive 2026-10-22)
**Never create any additional branch**, including temporary `work/`, feature, bugfix or release branches. Perform all development, tests, fixes, documentation changes and commits **directly on `dev` only**, using fresh file blob SHAs and respecting concurrent changes. `main` is reserved solely for existing protected green-CI promotion and production; never manually develop or push game changes to `main`. The repository must ultimately contain only `dev` and `main`. This rule supersedes historical instructions suggesting feature branches or new branch creation.

## Continuous dev despite unreleased features (owner directive 2026-10-22)
**Continue developing and committing the next roadmap feature directly to `dev` even when earlier features remain unmerged, uncertified or undeployed on `main`.** Multiple completed increments may accumulate on `dev` and be verified, fixed and released together in a later protected `dev` → `main` promotion. Investigate and fix blocking defects in parallel; never treat pending deployment as a reason to stop hourly feature development. Preserve source compatibility and truthful candidate/released version labeling. Release only the exact green combined dev head after full required CI and smoke tests; never bypass protections or force-push. Do not create additional branches.
