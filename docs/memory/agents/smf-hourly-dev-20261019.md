# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-25

## Mission
Deliver player-facing football gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup improvements. Preserve canonical data, four match actions, compatible saves and offline play.

## Current checkpoint
- **0.12.81.296 — AI-GROUND-PASS-SUPPORT-LANE-HANDOFF-01:** during a targeted low ground PASS, the nearest CPU defender continues pressing the live ball while the second defender is selected against the projected receiver/interception lane. The existing reach-aware helper still determines the actual support target; pass physics and possession are unchanged.
- .295 Modular QA #45612556193 passed. Full Census #45612556248 passed preflight, preview and all four Node shards; browser shard 2 exposed a mirrored retreating-marker fixture that failed to move away relative to the runner on one wing, and browser shard 1 hit the historical LAN two-browser 10-second wait. .296 corrects the relative fixture and adds the pass-lane handoff feature.
- Main remains .292 on `faa2fda91f6c34e49c27adf1d9f5c5e4a5f7452b`; dev parent before .296 was `d50dd544b5c58f0aec072c5bc92a712a54687fc2`.

## Next smallest action
Run exact-head .296 Modular QA and the full four-Node/four-Chromium Census. Repair confirmed failures, then verify automatic QA-gated promotion, independent main Census, Pages deployment and hosted bytes.

## Ownership and exclusions
Preserve 223 teams, 2,676 player identities/order and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept heroes or copied graphics. Studio art requires provenance, game-scale QA and owner acceptance. Keep #48 physical acceptance, #86 Render drift and #87 branch-protection security open. No authenticated online-hosting claim.

## Evidence
- .295 exact-head Modular QA #45612556193 passed.
- .295 Full Regression Census #45612556248: preflight, preview, all four Node shards and browser shards 0/3 passed; one cutback fixture assertion and one historical LAN browser timeout failed.
- GitHub REST: dev parent `d50dd544b5c58f0aec072c5bc92a712a54687fc2`; main `faa2fda91f6c34e49c27adf1d9f5c5e4a5f7452b`; both branches unprotected; #87 remains open.

## Cleanup
Keep this file below 4 KiB with these headings and exact Agent ID. Never bypass CI, security or QA promotion.
