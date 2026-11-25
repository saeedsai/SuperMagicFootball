# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-25

## Mission
Deliver player-facing football gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup improvements. Preserve canonical data, four match actions, compatible saves and offline play.

## Current checkpoint
- **0.12.81.298 — AI-FIRST-TOUCH-CARRY-INPUT-SCREEN-01:** after a pressured receiver's settling touch, the second CPU defender screens the carrier's live forward-diagonal input when no safe outlet/contest/cutback assignment has priority. Neutral input falls back to residual movement; backward input cancels the forward screen.
- Initial Modular QA #45637478379 exposed one new Node fixture issue (2,902/2,903 passed): the 0.50 forward-input component produced only 29.55 units of forward target, inside the existing 34-unit guard. The corrected 0.56 fixture and >83-unit along-input distinction are committed without changing production thresholds.
- .297 is fully certified and promoted: dev Census #45622688439 passed all four Node and all four Chromium shards plus preview; main Census #45632852684 and Pages deployment #45632838906 succeeded on SHA 4e66fc54cbb65c1fd6afe38b53c399a8ec575c48.

## Next smallest action
Run fresh exact-head Modular QA and the full four-Node/four-Chromium Census for the corrected .298 head. Repair confirmed failures, then permit only a green exact head through the existing QA-gated promotion pipeline and independently verify main Census, Pages deployment and hosted bytes.

## Ownership and exclusions
Preserve 223 teams, 2,676 player identities/order and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept heroes or copied graphics. Studio art requires provenance, game-scale QA and owner acceptance. Keep #48 physical acceptance, #86 Render drift and #87 branch-protection security open. No authenticated online-hosting claim.

## Evidence
- .298 initial Modular QA #45637478379: 2,902 passed, 1 failed (fixture boundary); correction committed, rerun pending.
- .297 dev Full Regression Census #45622688439: preflight, preview, all four Node shards and all four Chromium shards passed; QA-gated promotion succeeded.
- .297 main Full Regression Census #45632852684: preflight, preview, all four Node shards, all four Chromium shards and hosted Pages smoke passed; Pages #45632838906 succeeded.
- GitHub REST: .297 main/dev SHA 4e66fc54cbb65c1fd6afe38b53c399a8ec575c48; both branches unprotected; #87 remains open.

## Cleanup
Keep this file below 4 KiB with these headings and exact Agent ID. Never bypass CI, security or QA promotion.