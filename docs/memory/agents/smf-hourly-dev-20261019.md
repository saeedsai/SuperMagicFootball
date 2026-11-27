# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-27

## Mission
Prioritize responsive football gameplay, intelligent passing/tackling and counterable Magic Tricks, then existing-player graphics, goalkeeper, Player Studio and Career/Cup. Preserve 223 teams, 2,676 players, exact ordering/ratios, six formations, four actions, saves and offline play.

## Current checkpoint
- **0.12.81.358 — DIRECTIONAL-DRIBBLE-FEINT-01:** a clear up/down stick direction now chooses the lateral exit of a human Dribble trick; neutral/ambiguous input retains the defender-away choice. CPU trick escape and counter reads are unchanged.
- **Production:** `src/modules/engine.js`, `tryDribbleTrick`; no new action, save field, player rating or ball-physics change.
- **Regression:** `tests/dribble_directional_escape.test.cjs` and `tests/dribble_directional_escape_browser_qa.py` cover both teams, up/down/neutral input, CPU fallback, desktop/simulated-touch, four actions and 223 teams.
- **.357 gate repair:** the carry-shield browser fixture now supplies harmless local optional Home resources; the defensive-poke fixture isolates trick/hazard state and compares stable roster identity. These repairs are pending exact-head .358 Census confirmation.
- **.358 is a dev candidate; do not call it released until exact-head Census, Modular QA, gated promotion, main Census, Pages and hosted-byte smoke are independently green.

## Next smallest action
Inspect .358 exact-head Modular QA and all four Node/four Chromium Census shards. Fix confirmed failures without weakening assertions. If green, allow the existing QA-gated main pipeline; independently verify main Census, Pages deployment and hosted bytes. Then choose a distinct tackling/ball-control increment or proceed to existing-player graphics with Studio provenance and game-scale screenshot QA.

## Ownership and exclusions
Read and update only this checkpoint. No new branches, force-push, history rewrite, security bypass, unapproved concept heroes, copied graphics, roster/stat edits, save-schema changes or fifth action. #87 main protection, #86 Render drift and #48 physical two-phone acceptance remain open. No physical LAN certification or authenticated online-hosting claim.

## Evidence
- .357 Modular QA #45957012780 and first Census #45957012809 stopped at Node preflight on a keeper-roll source-extraction comment boundary; repaired on .357 follow-up.
- .357 exact-head Census #45957438349 failed browser shard 1 (`ai_defensive_poke_commit_browser_qa.py`) and shard 2 (`player_carry_shield_pose_browser_qa.py`). The latter reported missing optional file:// Home resources. .358 fixture repairs and exact-head reruns required.
- .358 first Modular QA and Census preflight both found one new test expectation error: CPU vertical movement was incorrectly asserted as world-up rather than defender-away relative to its diagonal forward axis. Human up/down/neutral assertions passed; the CPU regression now checks the lateral projection. No production code defect was established. Exact-head reruns required.

## Cleanup
Keep this checkpoint below 4 KiB. Update only this file for this agent's handover; leave other checkpoints untouched.
