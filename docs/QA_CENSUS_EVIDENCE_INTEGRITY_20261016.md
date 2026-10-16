# QA-CENSUS-EVIDENCE-INTEGRITY — full-regression report integrity

**16 October 2026.** Exclusive lock `qa-framework`, session `qa-evidence-shape-20261016-gpt6-chat10`.

## Delivered

The eight-shard census auditor previously confirmed complete ordered script coverage and zero status failures, but allowed missing, negative, nonnumeric or nonfinite execution durations, and missing/nonstring stdout/stderr evidence. It could therefore issue PASS for malformed per-script evidence. The auditor now additionally requires each successful test to have a finite nonnegative numeric `seconds` value (rejecting booleans) and an explicit string `output_tail` (empty is valid for a silent successful test). The source runner already emits both fields; its output and game behavior are unchanged.

Four new Python tests reject absent duration, negative/NaN/infinite/string/bool duration, missing output and nonstring output. Existing fake shard fixtures now contain real-shaped `seconds` and `output_tail`. The existing Node bridge asserts **18 Python tests**, up from 14, so active CI and the historical Node census cover these cases.

## Acceptance and regression

**Changed:** `tests/audit_regression_shards.py`, `tests/test_audit_regression_shards.py`, `tests/audit_regression_shards.test.cjs`. **No** game source, UI, graphics, player data, workflow, memory registry, build or save-format changes.

[Modular Game Dev QA #38946385367](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38946385367) on complete code SHA `e9268919711dc6714f4cbc4c968df2de2bda8816`: **197/197 Node tests PASS**, including 18 offline auditor contracts, no failures. Earlier intermediate [run #38946374265](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38946374265) had failures while source/tests were not yet jointly integrated, plus an independent in-flight memory-index contract issue; later completed test code is green. Full eight-shard regression on this exact feature SHA has not been verified by this report; do not infer it from active tests. Previous historical census result also must not be substituted for current code.

**Test commands:** `python3 -m unittest discover -s tests -p test_audit_regression_shards.py -v`; `node --test tests/audit_regression_shards.test.cjs`; `node --test tests/*.test.cjs`; `python3 scripts/validate_data.py`; `python3 scripts/build.py`. The CI preflight includes data validation, build and active tests.

## Cleanup, remaining gaps and next five batches

No generated caches or old archived QA evidence were deliberately deleted; other agents own shared memory, artwork, roster, gameplay and CI. Validate the latest git tree before removing any artifact. Once the report is committed, release `qa-framework` to let others work.

1. Certify a fresh complete eight-shard full regression with the added evidence checks and resolve actual run failures under each affected owner's claim.
2. Address open human-controlled penalty goalkeeper and gesture-control issues under exclusive engine/UI ownership.
3. Add longer-seed, opponent/club-spread goalkeeper fairness cohorts using the existing live-AI calibration harness.
4. Continue directional keeper glove / first-touch / pass-follow-through graphics without touching gameplay constants.
5. Audit documented FC27/fallback player metadata and certify physical-phone/offline-PWA restart and saved-game compatibility.

The playable Pages URL remains https://saeedsai.github.io/SuperMagicFootball/ ; this QA-only patch does not alter the deployed runtime. Hosted smoke and real-device acceptance are separate gates.
