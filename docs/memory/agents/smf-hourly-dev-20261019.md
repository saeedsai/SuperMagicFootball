# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-23

## Mission
Deliver bounded player-facing gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup. Never substitute audits or test-only iterations. Preserve four actions, canonical rosters, compatible saves and offline play.

## Current checkpoint
- **0.12.81.220 candidate — AI-FATIGUE-AWARE-SLIDE-COMMITMENT-01:** CPU defenders now reduce their existing SHOOT-slide commitment probability by up to 7.5 percentage points as match fatigue rises. Rested players retain exact .219 skill/difficulty baselines; existing run-up, facing, relative-motion and range gates remain unchanged, with PASS poke still available. No tackle/contact/slide physics, stamina cost, cooldown, controls, saves, rosters, persistence or offline behavior changed.
- Focused Node and desktop/simulated-touch Chromium regressions cover half/full fatigue, ordinary/primary-presser baselines, invalid/clamped fatigue, 223 canonical teams and four actions.
- **.219 Census diagnosis:** browser shard 3 incorrectly counted two preview-only teams as canonical; `data/teams.json` remains 223. The .220 follow-up now excludes only `concept_demo` and `crown_royals_reference`. Browser shard 2 also had a historical LAN auto-join 10-second timeout; no LAN production regression is established.
- **.219 exact-head QA:** Modular QA #45137789577 passed; Full Regression Census #45137789460 failed browser shards 2 and 3 (LAN auto-join timeout; incorrect 225-vs-223 runtime count). All four Node shards passed; browser shards 0 and 1 passed.
- **.218 promoted:** main SHA `3f605b38b4a43ac7ced0778aefbf5c68b2e27a37`; Pages #45131091490 passed. Independent main Census #45131103562 had one historical LAN auto-join timeout; no LAN source changed.

## Next smallest action
Run focused Node and desktop/simulated-touch Chromium for .220, then exact-head Modular QA and four-Node/four-Chromium Census. Fix observed failures; continue an independent player-facing gameplay increment while gates run.

## Ownership and exclusions
Only this checkpoint. Preserve 223 teams, 2,676 players, exact ordering and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept heroes or copied art. Physical two-phone #48 stays open. Render #86 and main protection #87 stay open. Authenticated online hosting needs owner resources. Never expose Git SHA in player UI.

## Evidence
- .220 Modular QA: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45139698601
- .220 Full Regression Census: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45139698663
- .219 Modular QA: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45137789577
- .219 Full Regression Census: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45137789460
- .218 Pages: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45131091490

## Cleanup
Keep this file below 4 KiB. Read and edit only this assigned checkpoint. Never bypass required CI, security or QA promotion.
