# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-25

## Mission
Deliver player-facing football gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup improvements. Preserve canonical data, four match actions, compatible saves and offline play.

## Current checkpoint
- **0.12.81.299 — AI-SUPPORT-COVER-FORWARD-ARRIVAL-READ-01:** second-defender cover now projects the grounded carrier's bounded forward and lateral movement over the existing 120 ms horizon. The goal-side screen follows forward/retreating and diagonal runs; each axis is capped at 36 units and existing field clamps remain.
- Exact parent dev .298 `972c2f8a9924d8cbadab1f48c1f0c225984a05ca` passed dev Modular QA #45638949427 and Full Regression Census #45638949561; the existing QA-gated promotion advanced main to .298. Main independent Census #45641254411 is in progress; browser shard 0 failed before tests while downloading Playwright (6.3/53.5 MB, network timeout), so hosted-byte smoke passed but final main 4+4 Census is not certified.
- .299 adds mirrored Node helper cases for forward/retreat/diagonal movement, per-axis caps, field-edge clamps and legacy vx fallback, plus actual-engine desktop/simulated-touch Chromium driveAI rows in both directions.
- The first .299 edge fixture expected unclamped goal-side offsets outside the field; corrected expected values to the existing 122/1978 target clamps. Production geometry is unchanged.

## Next smallest action
Run exact-head Modular QA and four-Node/four-Chromium Census for .299. Diagnose only observed failures; if green, allow the existing QA-gated pipeline to promote and independently verify main Census, Pages deployment and hosted bytes.

## Ownership and exclusions
Preserve 223 teams, 2,676 player identities/order and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept heroes or copied graphics. Studio art requires provenance, game-scale QA and owner acceptance. Keep #48 physical acceptance, #86 Render drift and #87 branch-protection security open. No authenticated online-hosting claim.

## Evidence
- Parent .298 dev Modular QA #45638949427: passed; Full Regression Census #45638949561: passed all four Node and four Chromium shards; promotion job succeeded.
- Main .298 independent Census #45641254411: preflight, hosted-pages smoke, preview and Node shards 2/3 passed; browser shard 0 stopped before tests on a Playwright wheel download timeout; other jobs were still running at last observation.
- Parent dev HEAD: 972c2f8a9924d8cbadab1f48c1f0c225984a05ca. Parent main HEAD: same SHA. Both branches currently unprotected; #87 remains open.

## Cleanup
Keep this file below 4 KiB with these headings and exact Agent ID. Never bypass CI, security or QA promotion.
