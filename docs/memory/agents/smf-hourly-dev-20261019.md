# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-26

## Mission
Deliver real player-facing gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup improvements. Preserve canonical data, four actions, compatible saves and offline play.

## Current checkpoint
- **0.12.81.312 — KEEPER-OUTLET-AGILITY-TURN-READ-01:** goalkeeper short/long outlet safety integrates the existing Agility-limited turn response over the bounded pass-flight read. High-Agility defenders turning toward the flight corridor can invalidate a seemingly safe outlet; low-Agility defenders retain more residual momentum. Existing projection caps, flight horizon, safety thresholds and pass physics remain unchanged.
- .312 feature source and mirrored Node/desktop/simulated-touch Chromium acceptance are committed on the existing dev branch. First Modular QA #45735221379 exposed legacy VM-extracted keeper helpers that lack the shared turn function; the live engine itself was not the source of the ReferenceError. A local equivalent fallback now keeps those isolated fixtures compatible while production still uses the shared helper. Exact-head reruns are pending.
- **.311 promoted to main** at `d6f8f925a921a3ee3eeb1f6c55c24a8db5a4eb7b`: Modular QA #45722554272 and dev Census #45722554366 passed; Pages #45724068937 and independent main Census #45724077445 succeeded.
- Main and dev were identical at .311 start. GitHub still reports `main.protected=false`, `dev.protected=false`, and no rulesets; #87 remains open.

## Next smallest action
Finish .312 exact-head Modular QA and four-Node/four-Chromium Full Regression Census. Fix any confirmed source or fixture failures, then permit only a green exact head through the existing QA-gated main pipeline. Independently verify the resulting main Census, Pages deployment and hosted bytes.

## Ownership and exclusions
Preserve 223 teams, 2,676 player identities/order and 12-player ratios, six formations, exactly four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept heroes or copied graphics. Studio art requires provenance and game-scale QA. Keep #48 physical acceptance, #86 Render drift and #87 branch-protection security open. No authenticated online-hosting claim.

## Evidence
- .312 adds turn-aware opponent path integration only to keeper outlet safety; player movement, pass trajectory and distribution physics are unchanged.
- .311 Modular QA #45722554272 and Full Regression Census #45722554366: success.
- .311 Pages deployment #45724068937 and independent main Census #45724077445: success.
- Initial .312 Modular QA #45735221379: failed on isolated-test helper scope (`carrierTurnAwareVelocity` missing); corrected in the next dev commit, exact-head reruns pending.

## Cleanup
Keep this file below 4 KiB with these headings and exact Agent ID. Never bypass CI, security or QA promotion.
