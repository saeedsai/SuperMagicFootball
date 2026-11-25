# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-25

## Mission
Deliver player-facing gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup improvements. Preserve canonical data, four match actions, compatible saves and offline play.

## Current checkpoint
- **0.12.81.285 — AI-STATIC-CARRIER-PRESS-ARRIVAL-READ-01:** CPU primary press selection now uses a bounded 120 ms defender-arrival read even when an opponent carrier is stationary or moving below 75 units/s. A slightly farther closing defender can replace a nearer retreating defender; the ±24-unit delta and 0.55 score weight prevent materially farther promotions. Support selection and loose-ball/landing selection remain unchanged.
- Production change: `src/modules/ai.js`. Focused Node and actual-engine desktop/simulated-touch Chromium regressions extend `ai_defensive_press_arrival` for both teams, stationary/slow carriers, support preservation, zero-velocity and loose-ball baselines, and the bounded far-defender countercase.
- **0.12.81.284 promoted/deployed:** exact dev Census #45546140236 and Modular QA #45546140183 passed; automatic QA-gated promotion advanced main/dev to `d6aa17c741014cb238ba6b2c06bbb78df890a191`. Pages #45547279507 and independent main Census #45547287374 passed, including hosted-pages smoke.

## Next smallest action
Verify exact .285 Modular QA and Full Regression Census: preflight, preview, four Node and four Chromium shards. Fix only confirmed failures, then allow only the green exact dev head through the existing QA-gated promotion. Independently verify main Census, Pages deployment and hosted-byte smoke.

## Ownership and exclusions
Preserve 223 original teams, 2,676 player identities/order and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No new concept heroes or copied graphics. New Studio art requires provenance, game-scale QA and owner acceptance. Keep #48 physical acceptance, #86 Render drift and #87 branch-protection security open. Authenticated online hosting is not live without owner resources.

## Evidence
- Parent dev/main SHA before .285: `d6aa17c741014cb238ba6b2c06bbb78df890a191`; branches were equal, ahead/behind 0/0.
- .284 exact-head Modular QA and all four Node/four Chromium Census shards passed; .284 was automatically promoted, deployed to Pages and passed independent main Census hosted smoke.
- GitHub reports `dev.protected=false` and `main.protected=false`; #87 remains a genuine security issue. #48 remains open and no physical two-phone certification is claimed.

## Cleanup
Keep this file below 4 KiB with all required headings and exact Agent ID. Never bypass CI, security or QA promotion.
