# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-24

## Mission
Deliver player-facing football gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup. Preserve four actions, canonical rosters, compatible saves and offline play.

## Current checkpoint
- **0.12.81.269 — KEEPER-PARRY-REBOUND-REACTION-SKILL-FATIGUE-01:** the CPU keeper's acceleration-limited second-ball chase now adjusts turning response by GK Skill and fatigue; neutral skill preserves the prior baseline, elite skill improves reorientation, and low skill/heavy fatigue slow it.
- Implementation in `src/modules/ai.js`; mirrored helper and actual-engine desktop/simulated-touch Chromium regressions cover both goals, low/neutral/elite GK Skill and fatigue. Existing parry physics, movement-speed caps, opponent/teammate arrival priority and four actions remain unchanged.

## Next smallest action
Verify .269 exact-head Modular QA and four-Node/four-Chromium Full Regression Census, including keeper skill/fatigue response and the repaired third-man browser fixture. Fix confirmed failures only; promote only a fully green exact head through the existing QA-gated pipeline and independently verify Pages, main Census and hosted bytes.

## Ownership and exclusions
Preserve 223 original teams, 2,676 player identities/order and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No new concept heroes or copied graphics. New Studio art requires provenance, game-scale QA and owner acceptance. Physical two-phone #48 and Render drift #86 remain open; do not claim device or hosting acceptance.

## Evidence
- .268 Modular QA #45423934976 passed 2,856/2,856. Census #45423934902 passed preflight, preview, all four Node shards and browser shards 0/2/3; only browser shard 1's third-man fixture failed, now isolated from the support-selection window.
- .269 adds GK Skill/fatigue to rebound turn response only; focused Node and Chromium regressions are included. Exact-head Actions pending.
- Main .266 SHA `b0b5641b88b56b7d8915e5944a2edc2455e37c53`: Pages deployment #45414997006 and independent main Census #45415010070 passed, including hosted-pages smoke and all four Node/four Chromium shards.
- REST reports `dev.protected=false` and `main.protected=false`; #87 remains open. No protection bypass or manual promotion.
- Local GitHub DNS is unavailable; connected GitHub source/API is used. Local Node/Chromium execution is not claimed; exact-head Actions are the verification gate.

## Cleanup
Keep this file below 4 KiB with all required headings and exact Agent ID. Never bypass CI, security or QA promotion.
