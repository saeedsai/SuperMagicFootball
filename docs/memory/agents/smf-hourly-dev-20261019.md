# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-26

## Mission
Deliver real player-facing gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup improvements. Preserve canonical data, four actions, compatible saves and offline play.

## Current checkpoint
- **0.12.81.311 — AI-AGILITY-AWARE-EARLY-POKE-TURN-READ-01:** early CPU PASS-poke commitment now projects a grounded carrier's current input through the existing Agility-limited turn model over 55 ms, but only after a live carried ball passes ownership, grounding and defender-side exposure checks. It changes commitment timing only; movement and contact physics are unchanged.
- .310 Modular QA #45720332579 passed on SHA `6b29c6ed7507fedc9269fc8e1302647e235c33d1`; Full Regression Census #45720332649 was in progress when .311 began. .310 is not release-certified by that status alone.
- .309 is promoted to main at `165b63464f03f6f85c392134046af288706946f4`; independent main Census #45719666223 and Pages deployment #45719655576 both succeeded, including hosted-pages smoke.

## Next smallest action
Finish .311 exact-head Modular QA and four-Node/four-Chromium Full Regression Census. Fix any confirmed source or fixture failures, then permit only a green exact head through the existing QA-gated main pipeline. Independently verify the new main Census, Pages deployment and hosted bytes.

## Ownership and exclusions
Preserve 223 teams, 2,676 player identities/order and 12-player ratios, six formations, exactly four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept heroes or copied graphics. Studio art requires provenance and game-scale QA. Keep #48 physical acceptance, #86 Render drift and #87 branch-protection security open. No authenticated online-hosting claim.

## Evidence
- .311 feature, focused Node and desktop/simulated-touch Chromium regressions are included in the current dev candidate; exact-head CI results are pending.
- .310 Modular QA #45720332579: success. .310 Full Regression Census #45720332649: in progress at last observation.
- .309 main Census #45719666223: success. .309 Pages deployment #45719655576: success.
- GitHub reports `main.protected=false` and `dev.protected=false`; #87 remains a real security blocker.

## Cleanup
Keep this file below 4 KiB with these headings and exact Agent ID. Never bypass CI, security or QA promotion.
