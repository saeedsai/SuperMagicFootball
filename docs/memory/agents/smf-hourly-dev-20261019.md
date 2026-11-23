# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-23

## Mission
Deliver bounded player-facing gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup. Never substitute audits or test-only iterations. Preserve four actions, canonical rosters, compatible saves and offline play.

## Current checkpoint
- **0.12.81.223 candidate:** AI-POKE-BALL-SIDE-READ-01 uses the live carried-ball position in the ordinary CPU early PASS-poke read. The 68–94-unit anticipation window opens only when the ball is exposed toward the approaching defender; far-side shielding retains the existing pursuit. The close-contact window and tackle physics are unchanged.
- .223 adds mirrored Node and actual-renderer desktop/simulated-touch Chromium regressions for exposed/far-side ball position, invalid/stale ball data, both directions, 223 canonical teams and four controls.
- **.222 exact-head Modular QA:** #45150540827 passed 2,798/2,798 Node tests.
- **.222 exact-head Full Regression Census:** #45150540887 was in progress when .223 began. Preflight, preview, Node shards 0/2/3 and browser shard 0 had passed; Node shard 1 and browser shards 1–3 were still running. .222 was not certified/promoted at that point.

## Next smallest action
Run exact-head Modular QA and Full Regression Census for .223. Inspect desktop and simulated-touch ball-exposure acceptance. Fix any confirmed failure, then continue the next independent gameplay improvement while gates run.

## Ownership and exclusions
Only this checkpoint. Preserve 223 teams, 2,676 players, exact ordering and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept heroes or copied art. Physical two-phone #48 stays open. Render #86 and main protection #87 stay open. Authenticated online hosting needs owner resources. Never expose Git SHA in player UI.

## Evidence
- .222 Modular QA: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45150540827
- .222 Full Regression Census: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45150540887

## Cleanup
Keep this file below 4 KiB. Read and edit only this assigned checkpoint. Never bypass required CI, security or QA promotion.
