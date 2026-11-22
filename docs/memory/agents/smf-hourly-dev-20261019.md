# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-22

## Mission
Deliver player-facing gameplay, presentation and Career/Cup improvements while preserving four actions, canonical rosters, saves and offline play.

## Current checkpoint
- 0.12.81.191 KEEPER-SAFE-SHORT-OUTLET-UNDER-MODERATE-PRESSURE-01: CPU keepers now evaluate short throws at their actual speed and retain a genuinely clear short outlet under moderate off-lane pressure. A projected immediate challenger inside 155 units during the 0.18-second release window or a blocked lane still forces long clearance; explicit SHOOT long mode is unchanged.
- .190 Modular QA #45021664869 passed at SHA b94738acaf1863b76c73d01b8aaa6a483f272977. Census #45021664887 passed preflight, preview, four Node shards and browser shards 0/1/3; only browser shard 2 failed historical lan_auto_two_browser_qa.py with a 10-second Playwright wait timeout. Failed-job-only retry requested; .190 is not certified.
- .189 is main-promoted on SHA d416c25cb8b96b910161645210cf13292fd4b4ae. Modular QA #45018701798, dev Census #45018701837, Pages #45019509891 and main Census/hosted smoke #45019515666 passed.
- #87 remains open and main is unprotected by branch metadata. #48 physical two-phone acceptance, #86 Render drift and #10 source-faithful graphics review remain open.

## Next smallest action
Run focused Node/Chromium, Modular QA and exact-head four-Node/four-Chromium Census for .191. Fix confirmed failures; retry the .190 failed browser job and promote only through the existing QA-gated pipeline.

## Next five product improvements
1. Improve CPU first-touch outlet choice after pressured low-pass interceptions without redirecting human input.
2. Improve goalkeeper return-to-line and distribution readiness after catches and contested rebounds.
3. Resume existing-player eight-view graphics through SuperMagicAssetStudio with game-scale screenshots and owner review.
4. Improve Player Studio live preview and directional customization usability.
5. Deepen Career/Cup season progression and match presentation.

## Ownership and exclusions
Only this checkpoint. No concept heroes or copied art. Preserve 223 teams, 2,676 players, exact ordering and 12-player ratios, six formations, four actions, existing saves/offline/PWA, ten Career/Cup slots and SD09. No physical-device or visual approval claims; no routine LAN/P2P work.

## Evidence
- .190 Modular QA: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45021664869
- .190 Full Census: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45021664887
- .189 Pages deployment: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45019509891
- .189 main Census: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45019515666

## Cleanup
Keep this checkpoint below 4 KiB; never bypass required CI, branch protection or QA promotion.
