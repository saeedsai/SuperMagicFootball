# FIX-TOUCH-DRIBBLE-TAP-HOLD — rapid re-press regression (2026-10-20)

**Source:** `src/modules/input.js` commit `61732fee50dba0e4fd631441a10c283cb2a50650`.
**Tests:** `tests/touch_dribble_pulse.test.cjs` commit `506fe32b36e09e31c7288ec971f7d4e737142df0`.
**Owner:** central single developer `smf-hourly-dev-20261019`; no feature claim required.

## Reported defect
On emulated-phone input, a completed DRIBBLE tap followed by a new touch still being held can occur within one render/poll interval. The existing pulse backlog delivers the completed first tap, but without a retained second input edge the game sees a continuously held DRIBBLE state and may miss the double-tap rainbow/Trick gesture.

## Bounded correction
- Preserve one deferred second press for a distinct still-held DRIBBLE touch while the first completed tap is consumed.
- Replay that edge on the next available poll, but never auto-repeat the continued hold.
- If the second touch ended before replay, provide one short press/release with its measured duration. Cancellation discards the edge.
- Keep two-finger co-holds from generating independent taps; preserve existing queued completed-tap cap, keyboard input, four actions and mapped gamepads.
- Never edit engine physics, UI menus, team/player IDs or stored saves for this fix.

## QA acceptance
Focused source-level `node --test tests/touch_dribble_pulse.test.cjs`: original four cases plus three additional variants (completed tap → held second touch; completed tap → released second touch; deferred second touch cancelled). Existing desktop and simulated-Android Chromium `tests/dribble_styles_browser_qa.py` remains in the full regression census.

**Evidence at writing:** GitHub Modular Game Dev QA #39504673228 PASSED at source/test commit `506fe32b36e0`. Full Regression Census #39504673124 and Pages promotion/deployment must be observed on the final integrated SHA; don't call those passed or deployed from this note alone.

## Follow-up
The owner's 10 Career save slots are next, then 10 Tournament save slots. Keep handover and exact CI links in `docs/DEVELOPMENT_LOG_SINGLE_OWNER.md`.
