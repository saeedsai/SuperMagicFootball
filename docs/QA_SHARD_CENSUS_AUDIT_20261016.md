# QA-SHARD-AUDIT — complete full-regression shard coverage checkpoint

**Date:** 2026-10-16  
**Owner:** `qa-shard-audit-20261016-1357-gpt6`  
**Exclusive lock:** `qa-framework`; claim at [docs/agent_coordination/claims/qa-framework.json](../docs/agent_coordination/claims/qa-framework.json)  
**Base head immediately before claim:** `b8a38d975d667b4bd2fb0df5fbd30b087fa0ff71`  
**Area:** Quality tooling only; do not alter shared engine, graphics, UI, roster/players, release-infrastructure workflows, or the existing shard runner.

## Why this feature is necessary

The earlier [QA-EMPTY-SHARD](QA_EMPTY_SHARD_20261016.md) checkpoint made individual shard runs fail rather than reporting green after executing zero tests. It also wrote ordered `discovered_scripts` and `selected_scripts` fields to each result. **There was not yet a cross-shard verification step.** A collection of individually green artifacts could omit a shard, include a stale rerun, duplicate an execution or conceal an inconsistent full-census manifest.

This bounded new feature implements an opt-in, **read-only post-run auditor**, `tests/audit_regression_shards.py`, which validates a complete downloaded set of JSON reports for one GitHub workflow run.

## What is implemented

- Discover nested `node_shard_N_of_M.json` and `browser_shard_N_of_M.json` reports. Require all shard indices in each category and reject duplicate report filenames across directories (including original + rerun artifacts).
- Require identical ordered discovered-test inventories across shards, unique nonblank script names, a complete modulo/round-robin selected-test partition, and executed script identities in the expected order, without duplication or gaps.
- Independently check `discovered`, `requested`, PASS/FAIL/TIMEOUT/ERROR/NOT_RUN counters, successful return codes and zero missing/failed cases. Do not treat a job's existing summary as proof.
- Require the configured shard count (four in the current GitHub workflow; customizable with `--expected-shards`), a single commit identity across included categories; optional `--expected-commit <SHA>` refuses stale evidence.
- Print a machine-readable JSON PASS report, and optionally save it with `--out`. No PASS report is written on validation failure.
- Add **14 negative/positive Python unit tests** and a `*.test.cjs` Node bridge so this QA contract is exercised by the existing `node --test tests/*.test.cjs` discovery without modifying another agent's CI workflows.

This does **not** change browser scripts, runtime match behavior, or the GitHub deployment. The auditor validates script-level census coverage; it does not certify physical devices, saved-game restart persistence or the entire requirements catalog.

## Running the new verification

First download and extract the **eight JSON shard artifact ZIPs from one** [Full Regression Census workflow run](https://github.com/saeedsai/SuperMagicFootball/actions/workflows/full-regression-census.yml) into one directory with no older reruns mixed in. The existing runner emits four Node and four Chromium shard reports in the current workflow.

```sh
python3 tests/audit_regression_shards.py \
  --reports /path/to/one-run-unpacked-artifacts \
  --expected-commit <EXACT_DEV_SHA> \
  --expected-shards 4 \
  --out /tmp/supermagic-full-regression-audit.json
```

By default, both categories are required. Use `--category node` or `--category browser` **only to troubleshoot an incomplete download**, not to certify the complete workflow. Exit code 0 means verified; exit code 1 means evidence is missing or invalid. Report directories may be nested, but must contain no duplicate attempts for the same shard. Older archived shards without `discovered_scripts` cannot be audited by this newer contract; rerun the current census instead.

### Tests and current evidence

| Verification | Result | Evidence |
|---|---|---|
| Local isolated Python contract tests | **14/14 PASS** | `python3 -m unittest discover -s tests -p test_audit_regression_shards.py -v`, executed on identical isolated source |
| Local Node bridge | **1/1 PASS** | `node --test tests/audit_regression_shards.test.cjs` |
| Integrated Modular Game Dev QA on feature source commit | **PASS** | [GitHub Actions run 38897872200](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38897872200) on documented feature commit `250d6cb21100041dcf6c4310726585492b91362d`; the later expected-shard-count guard requires its own exact-code CI confirmation |
| Eight-shard full historical census on this exact source commit | **NOT VERIFIED YET** | Must run/download the actual complete latest-code workflow artifacts; do not inherit historical green runs |
| Physical Android/iOS gameplay, actual-PC browser interaction and Pages hosting on this exact source commit | **NOT EXECUTED** | No game runtime source or deployment configuration was changed by this feature |

**Issue and risk register:** Full Regression Census is triggered on selected runtime/CI paths rather than this new opt-in QA audit file. A new exact-code full census therefore may not start solely from this feature. Do not misrepresent a passing Modular QA preflight as eight-shard browser certification. The audit is intentionally manual/opt-in until the release-infrastructure owner can approve an artifact aggregation job. Avoid touching that owner's workflow files.

## Scope, cleanup and handover

**New files:** `tests/audit_regression_shards.py`, `tests/test_audit_regression_shards.py`, `tests/audit_regression_shards.test.cjs`, and this document. No historical evidence was deleted, no generated test fixture was committed, and no other agent's claim or source files were changed.

**Next QA-focused action:** After a full regression run completes on a fresh exact integration SHA, download all eight artifacts and execute the audit command above. If a script fails in an engine/UI/art path, notify its owner rather than modifying their code under this QA claim. If the release-infrastructure key becomes free, a later separately claimed task could add this auditor as a workflow aggregation gate.

### Overall next five small iterations (subject to exclusive ownership)

1. **Goalkeeper fairness:** analyze paired seeded physical-lunge intent, actual save and corner goal outcomes; change physics only with gameplay lock and evidence.
2. **Goalkeeper holding visuals:** complete eight-direction glove grip, catch/release/recovery art under the graphics lock.
3. **First touch and passing:** refine reception and follow-through pose with desktop/touch regression under relevant graphics and gameplay locks.
4. **Parallel source provenance:** extend roster/graphics conflict review without breaking current ID-aware merge safeguards under the integration-tooling lock.
5. **Career/half-time feedback:** ship a bounded tactics/squad usability improvement while preserving existing saves and menu/button contracts under UI ownership.

Additional gaps remain: historical roster-source verification, full requirements parity, exhaustive physical mobile/offline PWA/real-origin restart tests and online multiplayer. They are not closed by this QA-only batch. No unrelated cleanup was performed because older QA artifacts remain live reference evidence and other agents are active.

## Final exact-source integration QA and checkpoint

- Source feature commits: `1a0c5a74` (auditor), `cf3af30a` (Python contract), `83feb48b` (Node discovery bridge), `b48fd86d` / `ad71af76` / `949d8231` (explicit shard-count guard, 14th contract and bridge adjustment). Intermediate red CI jobs occurred while that three-commit test-count change was incomplete; final tests passed.
- **Full active QA success** on `5d72f049145c06f5f9bf975b6c7723593b7c827a`: [Modular Game Dev QA run #38898186310](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38898186310). The archived GitHub job log confirms **97/97 Node tests PASS**, including the new auditor's Python bridge; 17/17 Python parallel-merge contracts PASS; 8/8 feature-claim contracts PASS; 165-club roster validation, JSON validation, fixture build and Python compile steps PASS.
- **Four Node + four Chromium historical shard integration run:** not yet certified on the final audit-source SHA. Contemporaneous full census runs may belong to earlier or concurrent commits; do not count them as passing this release until their exact SHA/artifacts match. A future full-run result should also be independently audited with `--expected-commit` and `--expected-shards 4`.
- **GitHub Pages:** the earlier successful hosted desktop/simulated-touch smoke run [#38885745096](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38885745096) documents playability on its own earlier SHA only. This QA-only source does not modify the runtime, but actual interactive verification of the final source and physical-device input is not yet established. The public URL remains https://saeedsai.github.io/SuperMagicFootball/.
- **Release:** after writing this checkpoint, release `qa-framework` only; do not transfer a claim that belongs to other active specialists.
