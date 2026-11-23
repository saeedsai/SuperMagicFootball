# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-23

## Mission
Deliver bounded player-facing gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup. Never substitute audits or test-only iterations. Preserve four actions, canonical rosters, compatible saves and offline play.

## Current checkpoint
- **0.12.81.215 — AI-THROUGH-BALL-ARRIVAL-LEAD-01:** CPU through-ball lead now scales with estimated pass flight time (0.12–0.35s), rather than a fixed 0.28s. Short passes avoid over-leading; longer passes give the runner a proportionally larger lead within the existing 48–100-unit cap. GK collection reach, defender safety, PASS trajectory, four actions, saves, rosters, persistence and offline play remain unchanged.
- Added mirrored Node coverage for short/long arrival windows and updated desktop/simulated-touch real-engine keeper acceptance to use the same bounded estimate. Exact-head gates pending; no local Node/Chromium result is claimed.
- **.214 gate diagnosis:** Modular QA #45116568036 and Full Census #45116568001 failed at the Node contract because this checkpoint lacked the required `## Current checkpoint` heading. Source/data prechecks passed; no production gameplay failure was established. The required headings are restored here.

## Next smallest action
Inspect .215 exact-head Modular QA and all four Node/four Chromium Census shards. Fix only confirmed failures, then continue with first-touch/defensive interception intelligence or another unblocked player-facing backlog item.

## Ownership and exclusions
Only this checkpoint. Preserve 223 teams, 2,676 players, exact ordering and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept heroes or copied art. Do not change routine LAN/P2P; physical two-phone #48 stays open. Render #86 and main protection #87 stay open. Authenticated online hosting needs owner resources. Never expose Git SHA in player UI.

## Evidence
- .214 Modular QA failure: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45116568036
- .214 Full Census failure: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45116568001
- .213 verified baseline: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45109382674
- .213 Pages deployment: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45110298723

## Cleanup
Keep this file below 4 KiB. Read and edit only this assigned checkpoint. Never bypass required CI, security or QA promotion.
