# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-24

## Mission
Deliver real player-facing football gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup. Preserve four actions, canonical rosters, compatible saves and offline play.

## Current checkpoint
- **0.12.81.254 — AI-MAGIC-TRICK-MOMENTUM-CLOSING-READ-01:** a nearby defender can still counter a named Magic Trick when directional input has returned to neutral but real 2D movement momentum is carrying them toward the carrier. Current dx/dy wins; moveVX/moveVY is the fallback. A stationary face-only defender and a retreating defender cannot claim a closing read.
- Added a movement-only predicate in `src/modules/engine.js`, mirrored GameEngine Node coverage and actual-engine desktop/simulated-touch Chromium coverage for both teams, diagonal approach, retreat and stationary fallback. Existing range/facing/skill/screen-read/cost/cooldown/possession behavior is retained.
- **0.12.81.253 main-promoted:** exact-head Modular QA #45336413881 and Full Regression Census #45336413773 passed on SHA `59dde78350b655f206ed00ee9bcebe6f2d6b4e08`; all four Node and four Chromium shards passed. QA-gated promotion advanced main/dev; Pages #45337591023 succeeded. Independent main Census #45337599476 was still running at last check.

## Next smallest action
Inspect exact-head .254 Modular QA and Full Regression Census; fix any confirmed source or fixture failure. Promote only the green exact dev SHA through the existing QA-gated pipeline, then independently verify main Census, Pages and hosted bytes.

## Ownership and exclusions
Preserve 223 teams, 2,676 players, ordering and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept heroes or copied graphics. Physical #48, Render drift #86 and main protection #87 remain open. Authenticated online hosting requires owner resources. Never expose Git SHA in player UI.

## Evidence
- .253 Modular QA, exact-head four-Node/four-Chromium Census and QA-gated promotion passed; Pages deploy passed.
- .254 gameplay source, focused Node/browser regressions and synchronized About/release/offline metadata are committed; exact-head gates pending.

## Cleanup
Keep this file below 4 KiB with all required headings and exact Agent ID. Do not read/edit another agent's private checkpoint. Never bypass CI, security or QA promotion.
