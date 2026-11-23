# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-23

## Mission
Deliver bounded player-facing gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup. Never substitute audits or test-only iterations. Preserve four actions, canonical rosters, compatible saves and offline play.

## Current checkpoint
- **0.12.81.221 candidate — AI-APPROACH-POKE-WINDOW-01:** ordinary CPU defenders may use the existing short PASS poke earlier only when a grounded carrier is closing directly into their forward arc. The prediction mirrors the production poke's 55 ms/12-unit-per-axis lead and 16-unit step, and requires a predicted post-step gap below 62 units. Retreating/lateral, protected, aerial and out-of-window carriers retain existing timing; primary-press first-touch reads and SHOOT-slide logic are unchanged.
- Feature commit `ffd74273ff9d4243b65f3d5b4dd1629c57372025`; follow-up `abf7ac31d2d5543726bbe77f0965cf8008aa1058` aligns invalid-velocity fallback exactly with tackle physics and adds Node/browser regression.
- **.220 Census:** Modular QA #45140199480 passed 2,791/2,791. Full Regression Census #45140199458 initially failed only browser shard 2's historical LAN auto-join timeout; failed-job retry passed all 69 browser scripts. Promotion job skipped because dev had already moved, so main remains .218.
- Exact-head .221 Modular QA/Census were triggered on .220's initial code commit and checkpoint head; the velocity-fallback follow-up has now triggered fresh exact-head runs. No final .221 result is claimed yet.

## Next smallest action
Complete exact-head Modular QA and four-Node/four-Chromium Census for the final .221 head. Fix confirmed gameplay or harness failures; do not alter LAN code for an unproven historical automation timeout. Continue with a distinct attacking/defensive gameplay increment while gates run.

## Ownership and exclusions
Only this checkpoint. Preserve 223 teams, 2,676 players, exact ordering and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept heroes or copied art. Physical two-phone #48 stays open. Render #86 and main protection #87 stay open. Authenticated online hosting needs owner resources. Never expose Git SHA in player UI.

## Evidence
- .220 Modular QA: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45140199480
- .220 Full Regression Census + retry: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45140199458
- .221 initial Modular QA: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45145147646
- .221 initial Full Regression Census: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45145147916
- .218 Pages: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45131091490

## Cleanup
Keep this file below 4 KiB. Read and edit only this assigned checkpoint. Never bypass required CI, security or QA promotion.
