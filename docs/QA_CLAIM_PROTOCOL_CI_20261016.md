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
