# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
Updated: 2026-11-27

## Mission
Prioritize responsive football gameplay, intelligent passing/tackling and counterable Magic Tricks, then existing-player graphics, goalkeeper, Player Studio and Career/Cup. Preserve 223 teams, 2,676 players, exact ordering/ratios, six formations, four actions, saves and offline play.

## Current checkpoint
- 0.12.81.363 — HUMAN-DRIBBLE-PRIMARY-MARKER-LANE-READ-01: human DRIBBLE feints now have a bounded counter when the nearest ready defender actively closes the selected escape lane over 120 ms. The nearest-marker penalty is capped at 10 percentage points and requires 20 risk units of closure; stationary, retreating, downed, protected and recovering defenders add none. Existing second-marker counterplay and CPU safer-side selection remain unchanged.
- Production: `src/modules/engine.js`, `tryDribbleTrick`. The lane projection accepts an explicit defender set; the first-marker read is human-only and separate from generic `dribbleOdds`.
- Focused regressions: mirrored actual-GameEngine Node and desktop/simulated-touch Chromium cases for both teams, closing/retreating/stationary/downed/recovering primary markers and CPU fallback.
- .362 gate repair: Census #45984128282 failed one browser script because `runApproachCommit` leaked temporary `game.tackle` and `game.activateDefence` stubs into later scenarios. Both methods are restored in `finally`; production poke behavior/assertions are unchanged.
- .363 metadata repair: Modular QA #45990593577 and Census #45990593636 found three duplicate version-contract failures because the first `sw.js` comment still said .362. The header now matches .363; cache key and assertions remain intact.

## Next smallest action
Inspect the rerun .363 exact-head Modular QA and all four Node/four Chromium Census shards. Fix confirmed failures without weakening assertions. If green, allow the existing QA-gated main pipeline; independently verify main Census, Pages deployment and hosted bytes. Then advance the next distinct gameplay increment; keep graphics Studio-backed and owner-reviewed.

## Ownership and exclusions
Read and update only this checkpoint. No new branches, force-push, history rewrite, security bypass, unapproved concept heroes, copied graphics, roster/stat edits, save-schema changes or fifth action. #87 main protection, #86 Render drift and #48 physical two-phone acceptance remain open. No physical LAN certification or authenticated online-hosting claim.

## Evidence
- Feature base: dev `9f0dcd0fdd6b0e4b62f88d3f2a321b2bb5c050dc`; main `f5c473c799589a34798dc29c24bdcdc554ab6791`.
- .362 Modular QA #45984128297 passed source-and-data; .362 Full Census #45984128282 passed preflight, preview, all four Node shards and browser shards 0/2/3 but failed the leaked-stub browser fixture.
- .363 first Modular QA/Census exposed only the stale service-worker header; corrected in a follow-up commit. Rerun results pending; no release claim.

## Cleanup
Keep this checkpoint below 4 KiB. Update only this file for this agent's handover; leave other checkpoints untouched.
