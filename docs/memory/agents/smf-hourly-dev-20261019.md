# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-25

## Mission
Deliver player-facing gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup improvements. Preserve canonical data, four match actions, compatible saves and offline play.

## Current checkpoint
- **0.12.81.286 — AI-EXPOSED-BALL-PASS-POKE-AIM-01:** CPU ordinary PASS pokes now aim through the validated live-ball position when the grounded, owner-matched ball is exposed on the defender-facing side. Shielded, stale, mismatched, airborne or missing-ball contexts retain body aim. Existing 55 ms carrier lead, 16-unit approach, contact range, tackle chance, cooldown, stamina cost and impulse magnitude remain unchanged; SHOOT slides and human calls retain their prior paths.
- Production change: `src/modules/engine.js`. Focused Node and actual-engine desktop/simulated-touch Chromium regressions cover both teams, exposed-ball direction and shielded body fallback.
- **0.12.81.285 dev gate passed:** Modular QA #45551705826 and Full Regression Census #45551705887 passed on exact SHA `ae45e649c2d1c6d017b5bdf78c1d5899b2b41ad6`. Pages #45552907980 succeeded. Independent main Census #45552914519 failed only `lan_auto_two_browser_qa.py` with a 10-second Playwright timeout; failed-job-only retry was requested. This is not evidence of a LAN gameplay regression.

## Next smallest action
Run exact .286 Modular QA and Full Regression Census; fix only confirmed failures. Then verify QA-gated promotion, Pages deployment, independent main Census and hosted-byte smoke. Continue with a distinct gameplay/keeper improvement or existing-player Studio art after the gates.

## Ownership and exclusions
Preserve 223 original teams, 2,676 player identities/order and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No new concept heroes or copied graphics. New Studio art requires provenance, game-scale QA and owner acceptance. Keep #48 physical acceptance, #86 Render drift and #87 branch-protection security open. Authenticated online hosting is not live without owner resources.

## Evidence
- Parent dev/main SHA before .286: `ae45e649c2d1c6d017b5bdf78c1d5899b2b41ad6`; branches were equal.
- .285 exact-head dev Modular QA and all four Node/four Chromium Census shards passed. Pages deployment succeeded; main hosted smoke passed, while independent main Census hit the historical LAN browser timeout and a failed-job retry was requested.
- GitHub reports `dev.protected=false` and `main.protected=false`; #87 remains a genuine security issue. #48 remains open and no physical two-phone certification is claimed.

## Cleanup
Keep this file below 4 KiB with all required headings and exact Agent ID. Never bypass CI, security or QA promotion.
