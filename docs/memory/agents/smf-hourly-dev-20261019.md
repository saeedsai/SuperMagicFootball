# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-26

## Mission
Deliver real player-facing gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup improvements. Preserve canonical data, four actions, compatible saves and offline play.

## Current checkpoint
- **0.12.81.313 — AI-THROUGH-BALL-AGILITY-TURN-LEAD-01:** CPU through-ball receiver lead integrates current directional input through the existing Agility-limited turn response over the 0.12–0.35 s flight estimate. High-Agility runners are met further into sharp cuts; low-Agility runners retain more residual momentum. Existing forward-run gates, lead caps, defender/keeper checks and pass physics remain.
- .313 source plus mirrored Node and actual-engine desktop/simulated-touch Chromium regressions are committed on the existing dev branch. Exact-head Modular QA and Full Regression Census are pending; local clone/testing remains unavailable because github.com DNS does not resolve in the runtime.
- **0.12.81.312 — KEEPER-OUTLET-AGILITY-TURN-READ-01:** exact-head Modular QA #45735628419 and Full Regression Census #45735628479 passed; the existing QA-gated pipeline promoted SHA d393edda4cb62a286b41a79168aa9dc8a1b8779c to main. Pages deployment #45736982837 succeeded; independent main Census #45736990591 was still running at last observation.
- GitHub still reports main.protected=false, dev.protected=false, and no rulesets; #87 remains open.

## Next smallest action
Finish .313 exact-head Modular QA and four-Node/four-Chromium Full Regression Census. Fix any confirmed source or fixture failures, then permit only a green exact head through the existing QA-gated main pipeline. Independently verify main Census, Pages deployment and hosted bytes.

## Ownership and exclusions
Preserve 223 teams, 2,676 player identities/order and 12-player ratios, six formations, exactly four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept heroes or copied graphics. Studio art requires provenance and game-scale QA. Keep #48 physical acceptance, #86 Render drift and #87 branch-protection security open. No authenticated online-hosting claim.

## Evidence
- .313 adds turn-aware receiver projection only to CPU through-ball lead; actual player movement and pass trajectory physics are unchanged.
- .312 Modular QA #45735628419 and dev Census #45735628479 passed; promotion advanced main/dev to d393edda4cb62a286b41a79168aa9dc8a1b8779c. Pages #45736982837 passed; main Census #45736990591 was in progress.
- .311 Modular QA #45722554272, dev Census #45722554366, Pages #45724068937 and independent main Census #45724077445: success.

## Cleanup
Keep this file below 4 KiB with these headings and exact Agent ID. Never bypass CI, security or QA promotion.
