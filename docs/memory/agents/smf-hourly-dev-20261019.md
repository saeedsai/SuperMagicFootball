# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
Updated: 2026-11-27

## Mission
Prioritize responsive football gameplay, intelligent passing/tackling and counterable Magic Tricks, then existing-player graphics, goalkeeper, Player Studio and Career/Cup. Preserve 223 teams, 2,676 players, exact ordering/ratios, six formations, four actions, saves and offline play.

## Current checkpoint
- 0.12.81.364 — KEEPER-PARRY-AGILITY-RECOVERY-01: existing Agility adjusts the next-save scramble after a parried shot or contested-cross punch by up to 35 ms around neutral 50. High-Agility keepers recover sooner; low-Agility keepers need slightly longer. Existing dive/get-up floor, clean-catch recovery, save/contact outcomes, rebound physics and four actions remain unchanged.
- Production: `src/modules/engine.js`, `keeperParryRecoverySeconds`; adjustment is bounded by the existing 0.12–0.30-second reduction and the dive-animation + 400 ms get-up floor.
- Regressions: mirrored actual-GameEngine Node and desktop/simulated-touch Chromium checks for both goals, low/neutral/high and missing/invalid STATS-inferred Agility fallback, get-up floor, and unchanged clean catches.
- .363 Modular QA #45990951305 passed on SHA `dd14cc030669b9d24f589c176e58c3c22af41ca9`. Census #45990951348 failed only browser shard 1: the artifact isolated `ai_defensive_poke_commit_browser_qa.py` instance-stub leakage into `firstTouchSlide20`. The .364 follow-up restores prototype methods in each stubbed scenario; the Agility fixture now applies controlled GK stats and tests missing/invalid values against the existing STATS-inferred fallback rather than assuming neutral 50. No production poke thresholds or STATS inference changed.

## Next smallest action
Inspect .364 exact-head Modular QA and all four Node/four Chromium Census shards. Fix confirmed failures without weakening assertions. If green, allow the existing QA-gated main pipeline; independently verify main Census, Pages deployment and hosted bytes. Then advance the next distinct gameplay or existing-player animation improvement.

## Ownership and exclusions
Read and update only this checkpoint. No new branches, force-push, history rewrite, security bypass, unapproved concept heroes, copied graphics, roster/stat edits, save-schema changes or fifth action. #87 main protection, #86 Render drift and #48 physical two-phone acceptance remain open. No physical LAN certification or authenticated online-hosting claim.

## Evidence
- Feature base dev: `dd14cc030669b9d24f589c176e58c3c22af41ca9`; main: `f5c473c799589a34798dc29c24bdcdc554ab6791`.
- .363 Modular QA #45990951305: success. .363 Census #45990951348: in progress at last inspection; exact-head result pending.
- Initial .364 exact-head runs exposed the Node fixture's ignored Agility profile and the poke-browser stub leak; both test-only defects are corrected in the follow-up. .364 remains a candidate until fresh exact-head QA/Census and independently verified main deployment/hosted bytes.

## Cleanup
Keep this checkpoint below 4 KiB. Update only this file for this agent's handover; leave other checkpoints untouched.
