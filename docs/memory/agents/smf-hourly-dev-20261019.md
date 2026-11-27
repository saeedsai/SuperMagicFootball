# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-27

## Mission
Prioritize responsive football gameplay, intelligent passing/tackling and counterable Magic Tricks, then existing-player graphics, goalkeeper, Player Studio and Career/Cup. Preserve 223 teams, 2,676 players, exact ordering/ratios, six formations, four actions, saves and offline play.

## Current checkpoint
- **0.12.81.357 — HUMAN-EXPOSED-BALL-SLIDE-AIM-01:** Human Pass and Shoot defensive slides now use the existing exposed-ball-side read when the opponent's low live ball is on the defender-facing foot. Shielded, airborne, stale and invalid balls retain body aim. No new controls or physics.
- **Production:** `src/modules/engine.js`; the human command paths pass the current ball to the existing `tackle` method.
- **Regression:** `tests/human_exposed_ball_slide.test.cjs` and extended `tests/ai_defensive_poke_commit_browser_qa.py` cover both teams, both actions and shielded fallback.
- **.357 first exact-head gate repair:** Modular QA #45957012780 and Census #45957012809 stopped at Node preflight with 2,998/2,999 passing. The only failure was the existing keeper-roll VM extractor swallowing two `//` comments placed immediately before `command(p,a){`; changed them to a closed block comment. No gameplay assertion failed; exact-head reruns required.
- **.356 gate repair:** Full Regression Census #45950271414 failed only `player_carry_shield_pose_browser_qa.py`: its 180×190 screenshot canvas drew the player at world coordinates (900,420), entirely off-canvas. The fixture now offsets world coordinates to the local player center; no production renderer defect was established.

## Next smallest action
Run .357 exact-head Modular QA and all four Node/four Chromium Census shards. Fix confirmed failures without weakening assertions. If green, allow the existing QA-gated main pipeline; independently verify main Census, Pages deployment and hosted bytes. Then choose a distinct tackling or Magic Trick counterplay increment.

## Ownership and exclusions
Read and update only this checkpoint. No new branches, force-push, history rewrite, security bypass, unapproved concept heroes, copied graphics, roster/stat edits, save-schema changes or fifth action. #87 main protection, #86 Render drift and #48 physical two-phone acceptance remain open. No physical LAN certification or authenticated online-hosting claim.

## Evidence
- .356 Modular QA #45950271405 passed 3,008/3,008 Node tests.
- .356 Full Regression Census #45950271414: all four Node shards and three Chromium shards passed; browser shard 2 failed only the off-canvas carry-shield fixture.
- .357 first exact-head Node preflight: 2,998 passed, 1 existing extraction-harness syntax failure; the harness boundary comment is repaired, reruns pending. No promotion or deployment claimed.

## Cleanup
Keep this checkpoint below 4 KiB. Update only this file for this agent's handover; leave other checkpoints untouched.
