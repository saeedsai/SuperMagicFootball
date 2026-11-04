# Candidate 0.12.81.13 validation — 4 November 2026

## Delivered

- SAVE-103 Cup vault validation now rejects nonempty standings rows unless all seven fields (`p,w,d,l,gf,ga,pts`) are present and valid. Empty `{}` placeholder rows remain compatible. Invalid preview/import leaves persisted bytes untouched.
- Added a real-engine strong ordinary-shot stun input regression. It holds movement, Shoot, Pass, Dribble and Jump during the stun, confirms the player does not move or act, and confirms movement resumes after expiry. Gameplay runtime was unchanged for this test-only addition.
- Updated candidate package/About/root README/service-worker metadata to 0.12.81.13.

## Validation on the current local tree

- `python -X utf8 scripts/build.py`: passed.
- Full Node suite: **1,953/1,953**.
- Focused SAVE-102/103 and gameplay/keeper suites: **41/41**.
- Release/version contracts: **21/21**.
- `python -X utf8 tests/cup_empty_active_restart_browser_qa.py`: passed on desktop and simulated touch, preserving the authoritative vault and legacy mirror behavior.
- The prior candidate .12 four-shard Chromium census remains **227/227** with its independent coverage audit. It was not rerun on .13.

## Limits

This is local validation of a dirty working tree, not immutable commit certification. Exact-head CI, protected promotion, hosted smoke/deployment, owner visual approval, physical-device/accessibility acceptance and real two-device/network checks remain unverified. The owner-directed roster identity and team validation audits were not run. Candidate is not deployed.
