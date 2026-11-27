# SuperMagicFootball — smf-hourly-dev-20261019
Agent ID: smf-hourly-dev-20261019
Updated: 2026-11-27

## Mission
Prioritize responsive football gameplay, intelligent passing/tackling and counterable Magic Tricks, then existing-player graphics, goalkeeper, Player Studio and Career/Cup. Preserve 223 teams, 2,676 players, exact ordering/ratios, six formations, four actions, saves and offline play.

## Current checkpoint
- 0.12.81.362 — EXPOSED-BALL-POKE-CONTACT-01: a short PASS poke can make a clean ball-only contact when the validated exposed low ball is within 34 units after the existing 16-unit advance, even if the carrier body remains outside 62-unit contact. The ball is released low with the existing contest odds; the carrier is not stunned or displaced.
- Production: src/modules/engine.js, GameEngine.tackle. Body-contact tackles and SHOOT slides retain their existing resolvers; shielded, stale, airborne and missing-ball contexts keep fallback.
- Regression: mirrored actual-GameEngine Node and desktop/simulated-touch Chromium cases for both teams, inside/outside contact boundary, shielding, ball height, collection delay, carrier state, and four-action/223-team contracts.
- Gate repair: .361 Python compile failure came from literal escaped newlines at line 72 of tests/dribble_directional_escape_browser_qa.py; fixed in fbe9f52c973521ddc451d81c3813a681135aeb23. Modular QA #45979036442 passed; Census #45979036453 was still running when .362 began.

## Next smallest action
Inspect .362 exact-head Modular QA and all four Node/four Chromium Census shards. Fix confirmed failures without weakening assertions. If green, allow the existing QA-gated main pipeline; independently verify main Census, Pages deployment and hosted bytes. Then advance the next distinct tackling/counterable-trick behavior; keep existing-player graphics Studio-backed and owner-reviewed.

## Ownership and exclusions
Read and update only this checkpoint. No new branches, force-push, history rewrite, security bypass, unapproved concept heroes, copied graphics, roster/stat edits, save-schema changes or fifth action. #87 main protection, #86 Render drift and #48 physical two-phone acceptance remain open. No physical LAN certification or authenticated online-hosting claim.

## Evidence
- Current base before .362: dev fbe9f52c973521ddc451d81c3813a681135aeb23; main f5c473c799589a34798dc29c24bdcdc554ab6791.
- .361 original head 1a252143a3b56ba985a0a6e54a52050866c52986: Modular QA #45977259080 had 3,014/3,015 passing; the sole new poke test measured carrier geometry after contact. Commit 03f5fde4dbbc77fc42fed33a8a7ab57a13c18246 snapshots geometry before contact.
- .362 full exact-head QA/Census and deployment are pending; no release claim.

## Cleanup
Keep this checkpoint below 4 KiB. Update only this file for this agent's handover; leave other checkpoints untouched.
