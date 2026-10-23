# SuperMagicFootball — hourly developer checkpoint
**Agent ID:** `smf-hourly-dev-20261019` · **Updated:** 2026-10-23

## Mission
Continue small tested features on existing `dev` every hourly run, independently of pending CI, main promotion or Pages deployment. Never bypass GitHub/OpenAI safety checks, branch protections, permissions or force-push; only `dev` and `main` branches.

## Current checkpoint
- Last verified heads at start of this run: `dev=425c13e761880b0b801bf4b3b36ab7218a1277da`, `main=3c3e6a5d9d1549f1256adea08ad7293e2ab4eb36`. Always refetch before writes.
- 2026-10-23 CI root cause: checkpoint had `**Agent:**` instead of mandatory `**Agent ID:**`, and lacked six required headings. Node suites: 478 pass, 1 fail; Full Census #39918616667 and Modular QA #39918616639 failed on memory contract. This checkpoint repairs the contract without weakening QA.
- LAN modules: host/guest protocol, bounded input timeline, disconnect safety and lifecycle packets. No actual cross-device transport or playable LAN match yet.
- Owner's reference screenshot: premium blue/neon Player Studio and Team Management UI roadmap. Earnable in-game coins/unlocks are backlog only, not implemented. Source of truth: docs/NEXT_MILESTONES.md.
- Current player-facing release `0.9.17.1`; keep four-field version About-only and synchronized for later player-facing updates. Docs/tests/non-bundled modules do not imply a release.


- 2026-10-23 LAN wire step: `src/modules/lan-wire.js` in `518024cb` + ID hardening `91890db3` + `tests/lan-wire.test.cjs` in `11fb71bd`. Bounded 512-byte JSON hello/leave/input codec with host-compatible four-button validation. Transport not wired; version unchanged. Exact-head CI pending.

## Next smallest action
1. Fix exact-head CI memory contract; add a bounded, tested LAN transport/wire increment on `dev`.
2. Verify Node and Chromium Full Regression 4+4 and Modular QA for exact head, diagnose failures.
3. Add incremental Player Studio visuals with coordinated release bump and save compatibility.
4. Add wallet ledger foundation and anti-duplicate tests before any coin UI/unlocks.
5. Promote only fully green exact `dev` via protected pipeline; verify main SHA, Pages bytes and mobile/PC smoke.

## Ownership and exclusions
Only update this registered checkpoint and central logs, not another agent's memory. Preserve 223 team IDs, 2676 player IDs, 2GK/3DF/4MF/3FW, six formations, exactly four action buttons, Career/Cup ten save slots, SD09 and offline behavior. Do not create new branches. Do not promise unimplemented multiplayer or paid currencies.

## Evidence
CI #39918616667 and #39918616639 show `tests/project_memory_contract.test.cjs` identity assertion; logs report 478/479 Node tests passed. Previous `main` Pages run #39917009157 passed. The current run must record new exact commit SHA and check results.

## Cleanup
Keep checkpoint under 4096 bytes, required headings and exact identity marker. Preserve relevant history in Git; do not remove useful source/test files merely to silence CI. Next run must refresh heads, issues, workflows and source inventory.

## 2026-10-23 LAN host wire adapter
Added transport-neutral `createLanHostAdapter` in `3ea8ce3b` connecting bounded wire validation, guest input timeline, timeout and disconnect; three Node tests in `085482f3`. No real WebRTC channel or match sync yet, no player-facing version change. Await exact-head 4+4 and Modular QA; promote only green dev via protected workflow.
