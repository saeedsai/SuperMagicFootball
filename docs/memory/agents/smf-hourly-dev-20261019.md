# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-22

## Mission
Deliver player-facing gameplay, presentation and Career/Cup improvements while preserving four actions, canonical rosters, saves and offline play.

## Current checkpoint
- 0.12.81.198 KEEPER-HIGH-CROSS-CLAIM-RETURN-01: a CPU goalkeeper revalidates its temporary high-cross claim while committed. A catch, punch or unsafe/expired landing immediately releases the stale claim; an eligible parry rebound keeps priority, otherwise the keeper replans its goal-line/shot-lane position without waiting for another AI reaction tick.
- Implemented on existing `dev`; mirrored real-engine Node and desktop/simulated-touch Chromium regressions cover both goal directions and post-catch return. Exact-head QA/Census pending.
- .197 is main-promoted on SHA `734090056af345d76e5d25079b2e2f8c1798ba65`: Modular QA #45044723093 and dev Census #45044723094 passed; Pages #45045555988 succeeded. Independent main Census #45045564160 has one historical `lan_auto_two_browser_qa.py` timeout in browser shard 3; failed-job-only retry requested, result pending.

## Next smallest action
Verify .198 exact-head Modular QA and all four Node/four Chromium Census shards. Inspect the #45045564160 failed-job retry; do not claim independent main Census green until it passes. Then continue an unblocked gameplay increment.

## Next five product improvements
1. Improve CPU counterplay when a pressured carrier rejects the screened outlet and attempts a Magic Trick.
2. Improve goalkeeper second-ball reaction and return-to-line behavior after catches, punches and rebounds.
3. Continue source-faithful existing-player eight-view Studio work with game-scale screenshots and owner review.
4. Improve Player Studio live preview and directional customization usability.
5. Deepen Career/Cup season progression and match presentation.

## Ownership and exclusions
Only this checkpoint. No concept heroes or copied art. Preserve 223 teams, 2,676 players, exact ordering and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No physical-device or visual approval claims; no routine LAN/P2P work. #48 stays open; #87 protection and #86 Render drift remain unresolved.

## Evidence
- .197 Modular QA: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45044723093
- .197 dev Census: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45044723094
- .197 Pages: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45045555988
- .197 main Census/retry: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45045564160

## Cleanup
Keep this checkpoint below 4 KiB; never bypass required CI, branch protection or QA promotion.
