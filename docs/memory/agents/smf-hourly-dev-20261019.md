# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-27

## Mission
Prioritize responsive football gameplay, intelligent passing/tackling and counterable Magic Tricks, then existing-player graphics, goalkeeper, Player Studio and Career/Cup. Preserve 223 teams, 2,676 players, exact ordering/ratios, six formations, four actions, saves and offline play.

## Current checkpoint
- **0.12.81.361 — HUMAN-EXPOSED-BALL-ARC-POKE-READ-01:** a short PASS poke can select and aim at a carrier when its validated exposed low ball enters the existing forward arc before the carrier's body does. Poke reach remains 130; slide reach remains 220. Shielded, stale, airborne, invalid or unpassed balls retain fallback.
- **Production:** `src/modules/engine.js`, `GameEngine.tackle`; held-PASS release, close chase and Hide Ball counter-pokes now pass the live ball. No new action, save field, player rating or ball-physics rule.
- **Regression:** mirrored actual-GameEngine Node and desktop/simulated-touch Chromium coverage for both teams, exposed/shielded/missing-ball cases and four-action/223-team contracts.
- **.360 release-gate repair:** exact-head Modular QA and Census failed preflight on two stale source-regex assertions in `tests/directed_pass_lane.test.cjs`; 3,011 passed and 2 failed. The current tackle selector now contains a line break and action-specific reach name. The .361 candidate updates only those test locators, preserving their target-priority behavior checks.

## Next smallest action
Inspect .361 exact-head Modular QA and all four Node/four Chromium Census shards. Fix confirmed failures without weakening assertions. If green, allow the existing QA-gated main pipeline; independently verify main Census, Pages deployment and hosted bytes. Then advance the next distinct tackling/ball-control or counterable-trick behavior; keep existing-player graphics Studio-backed and owner-reviewed.

## Ownership and exclusions
Read and update only this checkpoint. No new branches, force-push, history rewrite, security bypass, unapproved concept heroes, copied graphics, roster/stat edits, save-schema changes or fifth action. #87 main protection, #86 Render drift and #48 physical two-phone acceptance remain open. No physical LAN certification or authenticated online-hosting claim.

## Evidence
- .360 dev head `35c5ef5f846e5914614faaea34db215cbd05904c`: Modular QA #45973410327 failed only two stale target-selection regex contracts in `tests/directed_pass_lane.test.cjs` (3,011 pass / 2 fail). Full Regression Census #45973409948 stopped at Node preflight on the same failures; browser shards did not run.
- .361 is a new feature candidate; exact-head Modular QA/Census results are pending.
- Main remains `f5c473c799589a34798dc29c24bdcdc554ab6791`; REST reports both `main.protected=false` and `dev.protected=false`; #87 remains open.

## Cleanup
Keep this checkpoint below 4 KiB. Update only this file for this agent's handover; leave other checkpoints untouched.
