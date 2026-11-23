# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-23

## Mission
Deliver bounded player-facing gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup. Never substitute audits or test-only iterations. Preserve four actions, canonical rosters, compatible saves and offline play.

## Current checkpoint
- **0.12.81.220 candidate — AI-FATIGUE-AWARE-SLIDE-COMMITMENT-01:** CPU defenders now reduce their existing SHOOT-slide commitment probability by up to 7.5 percentage points as match fatigue rises. Rested players retain exact .219 skill/difficulty baselines; existing run-up, facing, relative-motion and range gates remain unchanged, with PASS poke still available. No tackle/contact/slide physics, stamina cost, cooldown, controls, saves, rosters, persistence or offline behavior changed.
- Focused Node and desktop/simulated-touch Chromium regressions cover half/full fatigue, ordinary/primary-presser baselines, invalid/clamped fatigue, 223 teams and four actions.
- **.219 exact-head QA:** Modular QA #45137789577 passed; Full Regression Census #45137789460 passed preflight, preview, all four Node shards and browser shard 1. Browser shards 0/2/3 were still running at last inspection; .219 is not yet Census-certified.
- **.218 promoted:** main SHA `3f605b38b4a43ac7ced0778aefbf5c68b2e27a37`; Pages #45131091490 passed. Independent main Census #45131103562 had one historical `lan_auto_two_browser_qa.py` guest-movement timeout; companion two-client test passed. Retry status needs recheck.

## Next smallest action
Run focused Node and desktop/simulated-touch Chromium for .220, then exact-head Modular QA and four-Node/four-Chromium Census. Fix observed failures; continue an independent player-facing gameplay increment while gates run.

## Ownership and exclusions
Only this checkpoint. Preserve 223 teams, 2,676 players, exact ordering and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept heroes or copied art. Physical two-phone #48 stays open. Render #86 and main protection #87 stay open. Authenticated online hosting needs owner resources. Never expose Git SHA in player UI.

## Evidence
- .219 Modular QA: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45137789577
- .219 Full Regression Census: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45137789460
- .218 Pages: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45131091490
- .218 independent main Census: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45131103562

## Cleanup
Keep this file below 4 KiB. Read and edit only this assigned checkpoint. Never bypass required CI, security or QA promotion.
