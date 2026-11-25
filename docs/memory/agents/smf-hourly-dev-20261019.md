# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-25

## Mission
Deliver player-facing football gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup improvements. Preserve canonical data, four match actions, compatible saves and offline play.

## Current checkpoint
- **0.12.81.297 — AI-GROUND-PASS-SUPPORT-OVERLAP-AVOIDANCE-01:** the second CPU defender yields a targeted ground-pass lane when the primary's bounded 120 ms projected position already covers that same pocket within 44 units. Retreating/distant primary movement still hands the lane to support; descending lofted passes remain on dedicated high-pass cover.
- .296 release-note syntax blocker fixed in b44e42209037602a869bb084329f9dffd9858a45; Modular QA #45620539636 passed. Full Regression Census #45620539513: preflight, preview and Node shards 2/3 passed; Node shards 0/1 and all four Chromium shards were still running when .297 began.
- Main remains .292 on faa2fda91f6c34e49c27adf1d9f5c5e4a5f7452b.

## Next smallest action
Run exact-head .297 Modular QA and full four-Node/four-Chromium Census. Repair confirmed failures, then allow only a green exact head through the QA-gated promotion pipeline and independently verify main Census, Pages deployment and hosted bytes.

## Ownership and exclusions
Preserve 223 teams, 2,676 player identities/order and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept heroes or copied graphics. Studio art requires provenance, game-scale QA and owner acceptance. Keep #48 physical acceptance, #86 Render drift and #87 branch-protection security open. No authenticated online-hosting claim.

## Evidence
- .296 Modular QA #45620539636: passed.
- .296 Full Regression Census #45620539513: preflight/preview and Node shards 2/3 passed; other Node/browser shards were in progress at .297 integration.
- GitHub REST: dev parent b44e42209037602a869bb084329f9dffd9858a45; main faa2fda91f6c34e49c27adf1d9f5c5e4a5f7452b; both branches report unprotected; #87 remains open.

## Cleanup
Keep this file below 4 KiB with these headings and exact Agent ID. Never bypass CI, security or QA promotion.
