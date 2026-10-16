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
