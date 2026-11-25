# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-25

## Mission
Deliver real player-facing gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup improvements. Preserve canonical data, four actions, compatible saves and offline play.

## Current checkpoint
- **0.12.81.310 — AI-CARRIER-INPUT-TURN-PRESS-READ-01:** CPU primary/support press scoring and the primary interception lead now project a moving opponent through current 2D input, with turn angle limited by existing Agility. High-Agility carriers reach a cut lane sooner; low-Agility carriers retain more momentum. Actual player movement is unchanged.
- .309 failed-job rerun completed green on all four Node and four Chromium shards; QA-gated promotion succeeded. Main is now exact .309 SHA `165b63464f03f6f85c392134046af288706946f4`. Independent main Census #45719666223 is in progress; Pages deployment for .309 is not yet verified.

## Next smallest action
Complete exact-head Modular QA and four-Node/four-Chromium Full Regression Census for .310; fix confirmed failures, then allow only a green exact head through the existing QA-gated main pipeline. Independently verify main Census, Pages deployment and hosted bytes.

## Ownership and exclusions
Preserve 223 teams, 2,676 player identities/order and 12-player ratios, six formations, exactly four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept heroes or copied graphics. Studio art requires provenance and game-scale QA. Keep #48 physical acceptance, #86 Render drift and #87 branch-protection security open. No authenticated online-hosting claim.

## Evidence
- .310 gameplay commit: `42d71e05f489ddf5b55cbae40ed23d79e65f0b70`; current candidate metadata .310.
- .309 Modular QA #45711535971: 2,918/2,918 passed.
- .309 Census rerun: all four Node/four Chromium shards and promotion passed; promotion log fast-forwarded main to `165b63464f03f6f85c392134046af288706946f4`.
- Main Census #45719666223: preflight, preview, hosted smoke and Node shards 2/3 passed; other six shards were running at last observation.
- .309 Pages deployment not verified. .310 exact-head QA/Census results not yet observed.

## Cleanup
Keep this file below 4 KiB with these headings and exact Agent ID. Never bypass CI, security or QA promotion.
