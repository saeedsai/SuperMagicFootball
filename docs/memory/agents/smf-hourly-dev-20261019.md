# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-16 21:59 CET

## Mission
Advance gameplay, Player Studio, four-button Magic Tricks, existing-player art, goalkeeper and Career. Preserve 223 teams, 2676 players, six formations, four actions, offline/saves, ten Career/Cup slots and SD09.

## Current checkpoint
- At start, dev/main both `96c6ba399436f7e6919c5910c78cb36f3e2f5983`. Exact-head Modular QA, dev/main full four-Node/four-Chromium Census, Pages and hosted smoke succeeded.
- Breath carry low-cost, sprint high-cost, idle/walk recovery and selected-local-human-only ring shipped in .66–.68. Existing browser tests cover live renderer, desktop/touch, host/guest, rapid switches, revoked seat, spectator and actual frame drain contrast.
- Added `tests/breath_analog_sprint_contrast.test.cjs` rapid walk (0.55) → held carry (0.56) → sprint (0.56) → idle lifecycle across Stamina 1/35/70/100 and 30/60/120 FPS, checking finite/capped resources and proper drain/recovery. Test-only commit `e0a7ef8`; backlog commit `d22bbfd`. No player-facing version bump: .71.
- New exact-head CI not yet verified; no claim of new test pass, promotion or deployment. GitHub connector source writes succeeded; no local full checkout/test run claimed.

## Next smallest action
1. Inspect exact-head new dev four-Node/four-Chromium Census and Modular QA; fix any failures.
2. Advance one bounded Player Studio usability, four-button Magic Trick, or existing-player animation improvement with source and focused tests.
3. Improve goalkeeper/Career and validate desktop/touch without new action buttons.
4. Verify exact green dev promotion, main Census, Pages and hosted bytes separately.
5. Read-only investigate Render #86 when relevant; never claim physical LAN #48 acceptance.

## Ownership and exclusions
Own checkpoint only. No other agents' private memory, new branches, force-push, CI bypass, concept heroes or roster churn.

## Evidence
Prior `96c6ba3` exact-head gates and hosted deployment green. New test commit and backlog accepted by GitHub; new-head tests/release not verified.

## Cleanup
Under 4 KiB; no temporary branches.
