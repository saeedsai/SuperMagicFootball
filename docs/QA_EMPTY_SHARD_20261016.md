# Full Regression Census — empty-shard correctness (QA-EMPTY-SHARD)

**Owner session:** `qa-empty-shard-20261016-1255-gpt6`  
**Lock:** `qa-framework` (exclusive live claim; released after verification).  
**Initial base:** `c7db1aba2a15edeee62603e16af04762c3c362f8`; always use the live `dev` head on integration.

## Requirement and bug fixed

The script-level regression census previously finished with exit code zero, a JSON report with `PASS: 0`, `NOT_RUN: 0`, and the misleading assertion of success if discovery found **no runnable scripts**, or a shard index was assigned no scripts because `--shard-count` exceeded the number of discovered scripts. A green GitHub job could therefore imply historical coverage even when its script loop ran zero cases. Also, each browser shard rewrote old version expectations in **all discovered test files**, not just the files assigned to that shard.

The runner now exits **2 with a specific diagnostic** *before creating green result artifacts* if no scripts are discovered, too many shards are requested, the shard index is invalid, or timeout is non-positive. It migrates archived version readiness strings **only in its assigned shard**, leaving other tests unchanged. The regular 4-shard test census and valid single-shard invocations retain their original result file format, command line, logs, pass/fail accounting and test order. No actual playable game, engine, graphics, roster, CI workflow or service worker code is changed.

## Acceptance / regression

- `python3 -m unittest discover -s tests -p 'test_full_regression_runner.py' -v` — six new isolated tests: missing Node/browser discovery, overshard, argument bounds, real non-empty PASS report, and shard-specific legacy migration.
- `python3 scripts/validate_data.py` and `python3 scripts/build.py` — current roster validity and game fixture.
- `node --test tests/*.test.cjs` — active Node suite.
- `python3 -m unittest discover -s tests -p 'test_parallel_data_merge.py' -v` — parallel player/graphics data safeguards.
- [Full Regression Census](https://github.com/saeedsai/SuperMagicFootball/actions/workflows/full-regression-census.yml) on the exact feature commit, including 4 Node and 4 Chromium shards.
- [Pages](https://saeedsai.github.io/SuperMagicFootball/) remains unaffected by this QA-only change; hosted browser playability must be checked separately.

**Checkpoint:** CI results and final dev SHA to be appended when runs complete. Past 156/156 full-census successes remain historical baselines rather than this commit's outcome.

## Safe ownership, cleanup and next work

Scope contains only `tests/full_regression_runner.py`, `tests/test_full_regression_runner.py` and this QA-specific documentation/handover. Do not edit concurrent graphics, release-infra, integration-tooling, player data, engine or shared roadmap files while those locks are held. No historical QA logs or archived tests are deleted: all remain relevant coverage. Existing `.gitignore` already ignores generated fixture/output paths.

Next five overall iterations: (1) evaluate seeded in-engine goalkeeper corner/save fairness after the settled lunge and save-event fixes; (2) eight-direction goalkeeper glove holding/release art (requires graphics lock); (3) first-touch/pass animations with appropriate owner; (4) reviewed roster/graphics merge provenance; (5) tactics/squad/career UX with save compatibility. The runner itself can next add a cross-shard manifest auditor only after a fresh QA-framework claim.

## CI discovery bridge

The existing active `node --test tests/*.test.cjs` and historic Node regression census do not directly discover `unittest` Python files. Added `tests/full_regression_runner_safety.test.cjs` to invoke the six Python safety contracts through the existing Node test discovery path, so they run on each normal Modular Game Dev QA preflight and the historical four-shard Node regression without touching the claimed `release-infra` CI workflows. The bridge enforces exit code, timeout and six-case test count. Run `node --test tests/full_regression_runner_safety.test.cjs` to reproduce; it needs only Python 3 and Node. Both source and bridge are QA-framework-only files. Check the exact integrated commit and logs before reporting final counts.

### Integrated checkpoint and next regression step

A separately scheduled exact-source Modular QA check on commit `e29c766c` proved the **six-case safety suite passes** through the Node bridge (`ok ... regression census rejects empty shards ...`). That same integrated run had **two unrelated graphics contract failures** while another agent was editing illustrated character layers. This was not a false-green regression or a new runner failure. Once the graphics agent's subsequent Modular QA became green, a seventh negative-path test was added to explicitly check a failing executable script is recorded as `FAIL` with exit code 1, never as `PASS`; the Node bridge now expects seven tests. A new full regression census on the final code commit must complete before calling this release certified. Do not change any graphics/CI source while separate locks are held.

### Auditable shard manifest addition

The report now includes `discovered_scripts` (the complete ordered list per category) and `selected_scripts` (the ordered list actually assigned to the current shard). Existing `discovered`, `requested`, `tests` and `summary` properties remain compatible. This lets a post-run auditor verify the union of all shards and detect silent gaps, rather than relying solely on counters. The isolated seven-case Python suite checks both the single-shard manifest and two-shard assignment; its Node bridge executes in regular Modular QA. CI status on final commit must be checked separately.


## Integrated QA checkpoint and developer handover — 16 October 2026

**Feature code checkpoint:** [`709eeec167daf1a201dcba5bec6afee571623279`](https://github.com/saeedsai/SuperMagicFootball/commit/709eeec167daf1a201dcba5bec6afee571623279). The release is entirely QA-side (no runtime/player/graphics/CI workflow edits). It adds runner safety on empty discovery, impossible shard counts and bad arguments; migration of legacy browser version assertions only within the current shard; and optional audit lists `discovered_scripts`/`selected_scripts` in JSON results. The existing per-shard pass/fail evidence format is backward compatible.

**Isolated safety tests:** **7/7 Python unittest scenarios PASS**, via the new discovered Node bridge `tests/full_regression_runner_safety.test.cjs`. [Exact-code Modular QA #38891827540](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38891827540) completed **SUCCESS**: **82/82 active Node contracts** (bridge included), zero failures.

**Complete census:** [#38891827523](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38891827523) ran on the exact feature SHA: preflight and all **105/105 Node scripts** PASS. Its browser shard 0 initially failed only `substitution_advice_browser_qa.py` (ambiguous UI Back selector); its owner separately fixed that later. The [later integrated full census #38892003186](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38892003186) includes the same unmodified QA runner plus the independent UI selector correction. At first inspection: **105/105 Node PASS**, browser shards 0, 1 and 3 green (**43 PASS**) and shard 2 **13 PASS / 1 FAIL** on `control_reliability_browser_qa.py`, simulated Android `switch` assertion (selected index remained 3, zero switch events, no manual grace). A targeted rerun of that shard was requested. **Do not call full Chromium census green until exact rerun results have been inspected**. The browser issue is in another feature's controls acceptance, not the QA runner.

**Hosted site:** https://saeedsai.github.io/SuperMagicFootball/ . The fresh [hosted live smoke rerun #38885745096](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38885745096) finished **SUCCESS**: desktop and simulated touch received HTTP 200, opened menus/selected teams, kicked off and entered active play. GitHub Pages deployed multiple descendant docs/agent commits successfully. No physical phone was tested.

**Cleanup:** verified zero tracked scratch browser fixtures, Python bytecode/cache, `node_modules`, `.tmp` or `.bak` candidates. Keep historical QA logs/screenshot evidence and other active agents' graphics/roster files; deletion would be unrelated and unsafe.

**Coordination handover:** exclusive `qa-framework` claim owner `qa-empty-shard-20261016-1255-gpt6`. Release claim after this report and status are saved. If a full-browser rerun continues failing, the next owner should claim the relevant UI/gameplay scope before changing controls. No further change to the runner should be made under this finished claim; check current `dev` and reservations first.

**Next five recommended small iterations:** (1) stabilize and seed-reproduce the Android player-switch regression under a fresh `ui-controls`/gameplay ownership claim; (2) quantify goalkeeper side/corner save fairness with the already delivered lunge and fixed save accounting; (3) finish eight-direction keeper held-ball/release art once the graphics lock is free; (4) audit parallel source-backed roster and graphics merge provenance with the integration-tooling owner; (5) career/lineup/tactics feedback with save compatibility.
