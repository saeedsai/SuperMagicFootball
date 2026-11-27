# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-27

## Mission
Prioritize responsive football gameplay, intelligent passing/tackling and counterable Magic Tricks, then existing-player graphics, goalkeeper, Player Studio and Career/Cup. Preserve 223 teams, 2,676 players, exact ordering/ratios, six formations, four actions, saves and offline play.

## Current checkpoint
- **0.12.81.360 — HUMAN-DRIBBLE-SECOND-MARKER-READ-01:** a human DRIBBLE feint now has a bounded counter read when a second ready defender is actively closing the requested escape lane during a 120 ms projection. Penalty is capped at 16 percentage points; stationary, retreating, airborne, downed, protected and recovering markers add none. CPU safer-side selection is unchanged.
- **Production:** `src/modules/engine.js`, `GameEngine.tryDribbleTrick`; no new action, save field, rating or ball-physics change.
- **Regression:** mirrored actual-GameEngine Node and desktop/simulated-touch Chromium coverage for both teams and closing/retreating/stationary/downed/recovering second defenders.

## Next smallest action
Inspect .360 exact-head Modular QA and all four Node/four Chromium Census shards. Fix confirmed failures without weakening assertions. If green, allow the existing QA-gated main pipeline; independently verify main Census, Pages deployment and hosted bytes. Then advance a distinct tackling/ball-control or counterable-trick behavior; keep existing-player graphics Studio-backed and owner-reviewed.

## Ownership and exclusions
Read and update only this checkpoint. No new branches, force-push, history rewrite, security bypass, unapproved concept heroes, copied graphics, roster/stat edits, save-schema changes or fifth action. #87 main protection, #86 Render drift and #48 physical two-phone acceptance remain open. No physical LAN certification or authenticated online-hosting claim.

## Evidence
- .359 dev head `786be4d18f2dfa32222b830fdeaba845f013c797`: Modular QA #45964358759 failed four Node contracts (About-only policy header, two stale target-selection source contracts, isolated `slideBall` parameter); Census #45964358737 stopped at preflight. These are being corrected without relaxing gameplay assertions.
- .360 is a new dev candidate; exact-head Modular QA/Census results are pending.
- Main remains `f5c473c799589a34798dc29c24bdcdc554ab6791`; dev was 10 commits ahead before .360.

## Cleanup
Keep this checkpoint below 4 KiB. Update only this file for this agent's handover; leave other checkpoints untouched.
