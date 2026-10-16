# QA-CLAIM-PROTOCOL-CI — protect agent feature ownership in every normal CI run

**Date:** 16 October 2026  
**Exclusive lock:** `qa-framework`  
**Session owner:** `qa-claim-cas-20261016-1421-gpt6`  
**Base dev SHA:** `bfaf9c248269c7afc979835680240a7e59602c2d`  
**Feature:** Include the previously unrun offline lock protocol tests in the existing active and historical Node regression suites.

## Missing coverage and bounded solution

`tests/test_feature_claim.py` already checked exclusive ownership, that expired active reservations cannot be stolen, who can renew/release, and registry consistency. It was only run by a documented manual command; the standard Modular Game Dev QA job runs `node --test tests/*.test.cjs`, not all `test_*.py` files. Consequently a regression in the claim helper could have gone unnoticed while active CI passed.

- New `tests/feature_claim_protocol.test.cjs` invokes exactly `python3 -m unittest discover -s tests -p test_feature_claim.py -v` from the repository root and fails on any nonzero exit, termination, timeout or a missing expected test count. The call uses only an offline `FakeClient` and requires no token/network.
- Extended `tests/test_feature_claim.py` with two tests checking **stale blob SHA** refusal against an active owner and after the previous owner released a reservation. Both assert that the existing reservation is unchanged on failed stale writes, while new claims with fresh SHAs still work.
- No edits to `scripts/claim_feature.py`, `AGENTS.md`, reserved feature keys, CI workflows, art, UI, roster data, gameplay, service worker or build/deployment. No new fifth gameplay button or save-schema changes.

## Test commands and acceptance gates

```sh
python3 -m unittest discover -s tests -p 'test_feature_claim.py' -v
node --test tests/feature_claim_protocol.test.cjs
node --test tests/*.test.cjs
python3 scripts/validate_data.py
python3 scripts/build.py
python3 -m unittest discover -s tests -p 'test_parallel_data_merge.py' -v
```

The Node bridge must report **10/10 Python claim tests**, and the full existing suite and four-shard Node/Chromium census must still pass. The new Node file is discovered by `tests/full_regression_runner.py` (its `*.test.cjs` glob) without altering another owner's workflow. This is a QA-only requirement, so the playable GitHub Pages game remains `https://saeedsai.github.io/SuperMagicFootball/`; hosted PC/simulated-touch checks and real physical devices are separate validation classes.

## Cleanup, work boundaries and release handover

Inspected existing QC infrastructure and preserved all older `test_feature_claim`, shard audit and run reports. The existing `.gitignore` excludes caches/output. Never delete historical regression coverage or edit another owner's live claim. This checkpoint adds one bridge and two focused tests; no tracked deletions.

**Integration evidence:** actual commits, run URLs, counts and exceptions are appended after source push and CI result inspection. Only claim `qa-framework` and release it with this document at the end. Do not infer complete regression green from one passing preflight.

## Next five small iterations

1. Certify a complete exact-SHA Full Regression Census and triage any graphics/UI/player-input exceptions with their owners; keep the eight-shard audit independent.
2. Add real-AI keeper normal/nonlinear Super shot outcome fairness sampling under a newly available `gameplay-engine` claim.
3. Finish illustrated keeper glove hold/release and direction-safe animations under exclusive graphics ownership.
4. Audit source-backed roster/graphic provenance and missing CI path triggers with their owners.
5. Expand halftime and career coaching/substitution accessibility, save compatibility and physical-device/PWA verification.


## Verified CI checkpoint and handover — 16 October 2026

**Feature commits on dev:** stale-SHA Python tests [`ccabbdcea4`](https://github.com/saeedsai/SuperMagicFootball/commit/ccabbdcea4c0fc069e7cc36c8f762df7e59a2f22), Node discovery bridge [`3e923e884`](https://github.com/saeedsai/SuperMagicFootball/commit/3e923e884d806847148c5966bab9b1612604ddd6), and documentation [`32eef332d`](https://github.com/saeedsai/SuperMagicFootball/commit/32eef332da6917b67a88060fce27ab33fe46891c). All edits were SHA-checked against latest `dev`, with unrelated engine, graphics and UI commits preserved. GraphQL ref updates raced or failed, so the source was committed via GitHub Contents API with verified blob SHAs instead of force-pushing.

- [**Modular Game Dev QA #38900942712**](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38900942712) on exact final QA/docs SHA `32eef332d` **SUCCESS**: **105/105 active Node cases PASS**, 0 fail/skip, and **17/17 Python merge tests PASS**. Its log explicitly contains both new tests `test_stale_blob_sha_cannot_replace_an_active_owner` and `test_released_claim_requires_fresh_blob_sha_before_reuse` as **OK**, `Ran 10 tests` and `ok 26 - exclusive feature locks reject stale SHA, takeover, and invalid handover`. The feature test never contacts GitHub.
- [**Most recent verified previous Full Regression Census #38900429370**](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38900429370) finished **SUCCESS**: **113/113 Node scripts and 62/62 Chromium scripts** (175/175 total), all eight shards green. **It ran on older SHA `78b48056e`, before this QA feature.** There was no triggered eight-shard full census on `32eef332d` by this checkpoint because the current workflow's selective paths omit the new bridge and offline-claim test paths. Therefore **complete historical regression on this exact feature commit is NOT VERIFIED**, despite the green active QA. Do not conflate these results.
- Public game: https://saeedsai.github.io/SuperMagicFootball/ . A fresh live desktop and simulated-touch site smoke was requested against [existing smoke workflow #38891468528](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38891468528). This source-only QA feature does not alter the game bundle; check that smoke's newest job for its final result. Physical handsets are unverified.

**Repository cleanup:** The tracked tree was inspected; **zero tracked generated `__pycache__`, `.pyc`, `node_modules`, `.generated`, `.tmp`, `.bak` or `.DS_Store` files** were found. Existing logs and archived tests are regression evidence, not disposable clutter. No deletion was made.

**Release and next owner:** Release `qa-framework` after committing this handover. An independently claimed `release-infra` workstream should later add the new QA-bridge path to `.github/workflows/full-regression-census.yml` push filters (the lock is currently owned by the art pipeline), and run an exact-SHA full census; do not edit that workflow under `qa-framework`. Future QA scope may check all four existing Python `test_*.py` collections for unbridged contracts. All changes herein are QA-only and preserve full gameplay, historical player data and save formats.

### Live hosted-site verification completed

[Hosted desktop and touch smoke #38891468528, latest rerun](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38891468528) **COMPLETED SUCCESS** after this feature's source push. Its newest job `116973927657` loaded the published Pages URL with HTTP 200, version `0.8.25.32-integrated`, **224 teams**, menus, Quick Match team selection, kickoff, extended pitch and active play, on both desktop Chromium and simulated mobile touch. This certifies the public site's browser flow, **not** a physical iPhone/Android device. This QA-only feature did not modify playable runtime/source assets.
