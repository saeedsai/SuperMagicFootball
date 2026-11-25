# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-25

## Mission
Deliver player-facing football gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup improvements. Preserve canonical data, four match actions, compatible saves and offline play.

## Current checkpoint
- **0.12.81.291 — AI-SUPPORT-COVER-PROJECTED-FLANK-01:** CPU second-defender selection now evaluates the carrier's bounded 120 ms lateral arrival lane. The support target stays on the defender's actual side of the projected carrier, so a cut crossing the current y-line no longer sends the support through the carrier to the opposite flank.
- Production: `src/modules/ai.js`; focused Node and actual-engine desktop/simulated-touch Chromium regressions extend `ai_support_carrier_lateral_cover`.
- **Parent dev:** `d795f1c724374effc0eea85995d2931c48cdfb5a`; .291 exact-head Modular QA and Full Regression Census are triggered by this commit. No .291 test result or deployment is claimed.
- .290 advanced through the existing QA-gated pipeline to main/dev; Pages deployment #45580452060 succeeded. Independent main Census #45580461016 passed hosted smoke/preflight/preview and Node shards 0,2,3; Node shard 1 and all four Chromium shards were still running at last inspection.

## Next smallest action
Observe .291 Modular QA and all four Node/four Chromium Census shards on the exact new SHA. Fix confirmed failures, then allow only a green exact head through the existing promotion pipeline; verify main Census, Pages and hosted bytes independently.

## Ownership and exclusions
Preserve 223 original teams, 2,676 player identities/order and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept heroes or copied graphics. Studio art requires provenance, game-scale QA and owner acceptance. Keep #48 physical acceptance, #86 Render drift and #87 branch-protection security open. No authenticated online-hosting claim.

## Evidence
- .290 exact-head Modular QA #45578845899 and Full Regression Census #45578845866 passed; .290 was automatically promoted to main.
- .290 Pages deployment #45580452060 succeeded. Independent main Census #45580461016 was incomplete at last inspection.
- GitHub REST reported both branches unprotected; #87 remains open.

## Cleanup
Keep this file below 4 KiB with these headings and exact Agent ID. Never bypass CI, security or QA promotion.
