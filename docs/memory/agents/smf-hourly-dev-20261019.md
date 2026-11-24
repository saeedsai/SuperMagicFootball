# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-24

## Mission
Deliver player-facing football gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup. Preserve four actions, canonical rosters, compatible saves and offline play.

## Current checkpoint
- **0.12.81.270 — KEEPER-PARRY-REBOUND-CROSS-TRACK-READ-01:** the CPU keeper now discounts sideways cross-track momentum when deciding whether it can reach its parried rebound. Aligned movement still helps; retreating movement still hurts; cross-track drift consumes up to 18 units of the existing 44-unit arrival margin, retaining at least 26. Ball physics, catch/contact, four actions, saves and roster data remain unchanged.
- Implementation in `src/modules/ai.js`; mirrored Node and actual-engine desktop/simulated-touch Chromium regressions cover both goal directions, stationary baseline, aligned approach and cross-track rejection.

## Next smallest action
Verify .270 exact-head Modular QA and four-Node/four-Chromium Full Regression Census, including mirrored cross-track keeper reach, aligned/retreating momentum and the existing rebound contest cases. Fix confirmed failures only; allow promotion only through the existing QA-gated pipeline, then independently verify Pages, main Census and hosted bytes.

## Ownership and exclusions
Preserve 223 original teams, 2,676 player identities/order and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No new concept heroes or copied graphics. New Studio art requires provenance, game-scale QA and owner acceptance. Physical two-phone #48 and Render drift #86 remain open; do not claim device or hosting acceptance.

## Evidence
- .269 exact-head Modular QA #45435517966 passed; Full Regression Census #45435517668 passed preflight, preview, all four Node shards and all four Chromium shards on SHA `ad80ac5443397eb831d537297514ac8be4bdd83a`. The existing `promote-dev-to-main` job succeeded, so dev and main now share that SHA.
- At the latest inspection, independent main Census #45437896432 and Pages deployment #45437879826 were still running on the promoted .269 SHA; final hosted verification is pending.
- .270 exact-head Modular QA and Full Regression Census are pending; no local Node/Chromium execution is claimed.
- REST reports `dev.protected=false` and `main.protected=false`; #87 remains open. No protection bypass or manual promotion.
- Local GitHub DNS is unavailable; connected GitHub source/API is used. Local Node/Chromium execution is not claimed; exact-head Actions are the verification gate.

## Cleanup
Keep this file below 4 KiB with all required headings and exact Agent ID. Never bypass CI, security or QA promotion.
