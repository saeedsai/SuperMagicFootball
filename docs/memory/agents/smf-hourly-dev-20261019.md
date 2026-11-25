# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-25

## Mission
Deliver player-facing football gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup improvements. Preserve canonical data, four match actions, compatible saves and offline play.

## Current checkpoint
- **0.12.81.298 — AI-FIRST-TOUCH-CARRY-INPUT-SCREEN-01:** the second CPU defender follows a pressured carrier's live forward-diagonal input after the settling touch when no safe outlet/contest/cutback assignment has priority. Input release falls back to actual movement; backward input cancels the forward screen. Direction and 120 ms position projection now use separate input/velocity sources.
- Initial Modular QA #45637478379 and Census #45637478935 each found one Node fixture failure (2,902/2,903 passed). The first .50 input fixture was inside the 34-unit forward guard; the .56 follow-up exposed normalized input being reused as projection velocity. Source now uses live input for direction and moveVX/moveVY for bounded projection; thresholds are unchanged.
- .297 is fully certified and promoted: dev Census #45622688439 passed all four Node and all four Chromium shards; main Census #45632852684 and Pages deployment #45632838906 succeeded on SHA 4e66fc54cbb65c1fd6afe38b53c399a8ec575c48.

## Next smallest action
Run fresh exact-head Modular QA and full four-Node/four-Chromium Census for the corrected .298 source. Repair confirmed failures, then allow only a green exact head through the QA-gated promotion pipeline and independently verify main Census, Pages deployment and hosted bytes.

## Ownership and exclusions
Preserve 223 teams, 2,676 player identities/order and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept heroes or copied graphics. Studio art requires provenance, game-scale QA and owner acceptance. Keep #48 physical acceptance, #86 Render drift and #87 branch-protection security open. No authenticated online-hosting claim.

## Evidence
- .298 initial QA #45637478379: 2,902 passed, 1 failed (fixture/target geometry); second exact-head Census #45638068321: same Node failure, preflight stopped before Chromium.
- .297 dev Census #45622688439: all four Node and all four Chromium shards plus preview passed; automatic promotion succeeded.
- .297 main Census #45632852684: all four Node and all four Chromium shards, preview and hosted Pages smoke passed; Pages #45632838906 succeeded.
- GitHub REST: .297 main SHA 4e66fc54cbb65c1fd6afe38b53c399a8ec575c48; dev .298; both branches unprotected; #87 remains open.

## Cleanup
Keep this file below 4 KiB with these headings and exact Agent ID. Never bypass CI, security or QA promotion.