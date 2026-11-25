# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-25

## Mission
Deliver player-facing football gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup improvements. Preserve canonical data, four match actions, compatible saves and offline play.

## Current checkpoint
- **0.12.81.295 — KEEPER-CUTBACK-RETREATING-MARKER-READ-01:** goalkeeper cutback coverage now requires the defender's bounded 120 ms projected gap to remain under 64 units and not open by more than 6 units. A ready defender moving away no longer falsely marks the runner; stationary/closing defenders still suppress the read. Keeper dive/catch/shot physics are unchanged.
- .294 Modular QA #45607252032 passed 2,898/2,898 Node tests. Full Census #45607251921 passed preflight, preview, all four Node shards and browser shards 0/1/3; browser shard 2 failed only the Agility turn-read browser fixture because a stationary carrier was expected to produce a non-zero lead. .295 changes that fixture to a 120-unit/s carrier while retaining the separate stationary baseline.
- Main remains .292 on `faa2fda91f6c34e49c27adf1d9f5c5e4a5f7452b`; dev parent before .295 was `da77e18d95e5c51096da2824c4547c7482649c81`.

## Next smallest action
Run exact-head .295 Modular QA and the full four-Node/four-Chromium Census. Repair confirmed failures, then verify automatic QA-gated promotion, independent main Census, Pages deployment and hosted bytes.

## Ownership and exclusions
Preserve 223 teams, 2,676 player identities/order and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept heroes or copied graphics. Studio art requires provenance, game-scale QA and owner acceptance. Keep #48 physical acceptance, #86 Render drift and #87 branch-protection security open. No authenticated online-hosting claim.

## Evidence
- .294 exact-head Modular QA #45607252032: 2,898 Node passed.
- .294 Full Regression Census #45607251921: preflight/preview, four Node shards and three Chromium shards passed; one Agility turn-read browser fixture failed because stationary carriers intentionally receive no non-zero lead.
- GitHub REST: dev parent `da77e18d95e5c51096da2824c4547c7482649c81`; main `faa2fda91f6c34e49c27adf1d9f5c5e4a5f7452b`; both branches unprotected; #87 remains open.

## Cleanup
Keep this file below 4 KiB with these headings and exact Agent ID. Never bypass CI, security or QA promotion.
