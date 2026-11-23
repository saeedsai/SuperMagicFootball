# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-23

## Mission
Deliver bounded player-facing gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup. Never substitute audits or test-only iterations. Preserve four actions, canonical rosters, compatible saves and offline play.

## Current checkpoint
- **0.12.81.221 candidate — AI-APPROACH-POKE-WINDOW-01:** ordinary CPU defenders may use the existing short PASS poke earlier only when a grounded carrier is closing directly into their forward arc. The prediction mirrors the production poke's 55 ms/12-unit-per-axis lead and 16-unit step, and requires a predicted post-step gap below 62 units. Retreating/lateral, protected, aerial and out-of-window carriers retain existing timing; primary-press first-touch reads and SHOOT-slide logic are unchanged.
- Added mirrored Node and desktop/simulated-touch Chromium regressions for closing versus retreating/lateral motion, forward arc, active-target gates, exact contact boundary, 223 canonical teams and four controls.
- **.220 Census:** Modular QA #45140199480 passed 2,791/2,791. Full Regression Census #45140199458 failed only browser shard 2's historical `lan_auto_two_browser_qa.py` 10-second guest-movement wait (68 other scripts passed); companion `lan_two_client_browser_qa.py` passed. No LAN production change or regression is established; failed-job-only retry requested.
- **Current .221 feature commit:** `ffd74273ff9d4243b65f3d5b4dd1629c57372025`; checkpoint follow-up is being committed separately.

## Next smallest action
Run exact-head Modular QA and four-Node/four-Chromium Census for .221. Fix confirmed gameplay or harness failures; do not alter LAN code for an unproven historical automation timeout. Continue with a distinct attacking/defensive gameplay increment while gates run.

## Ownership and exclusions
Only this checkpoint. Preserve 223 teams, 2,676 players, exact ordering and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept heroes or copied art. Physical two-phone #48 stays open. Render #86 and main protection #87 stay open. Authenticated online hosting needs owner resources. Never expose Git SHA in player UI.

## Evidence
- .220 Modular QA: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45140199480
- .220 Full Regression Census: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45140199458
- .220 failed browser job retry: pending
- .218 Pages: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45131091490

## Cleanup
Keep this file below 4 KiB. Read and edit only this assigned checkpoint. Never bypass required CI, security or QA promotion.
