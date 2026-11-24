# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-24

## Mission
Deliver real player-facing football gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup. Preserve four actions, canonical rosters, compatible saves and offline play.

## Current checkpoint
- **0.12.81.254 — AI-MAGIC-TRICK-MOMENTUM-CLOSING-READ-01:** a nearby defender can counter a named Magic Trick after directional input returns to neutral if real 2D movement momentum still carries them toward the carrier. Current dx/dy wins; moveVX/moveVY is the fallback. A stationary face-only defender and a retreating defender cannot claim a closing read.
- The movement-only predicate now lives inside `tryMagicTrick` so existing extracted-resolver VM tests execute it without an undeclared dependency. Mirrored GameEngine Node and actual-engine desktop/simulated-touch Chromium regressions cover both teams, diagonal approach, retreat, stationary facing, unchanged costs and possession.
- First .254 exact-head Modular QA #45338428497 and Census #45338428354 exposed a test-harness integration failure: extracted Magic Trick resolvers could not see a module-level helper. No gameplay assertion failure was established. The predicate has been moved into the resolver scope; fresh exact-head gates are pending.
- **0.12.81.253 main-promoted:** Modular QA #45336413881 and four-Node/four-Chromium Census #45336413773 passed on SHA `59dde78350b655f206ed00ee9bcebe6f2d6b4e08`; Pages #45337591023 succeeded. Independent main Census #45337599476 had hosted smoke and preflight passed, with browser shards still running at last check.

## Next smallest action
Rerun exact-head .254 Modular QA and Full Regression Census; fix any confirmed source or fixture failure. Promote only the green exact dev SHA through the existing QA-gated pipeline, then independently verify main Census, Pages and hosted bytes.

## Ownership and exclusions
Preserve 223 teams, 2,676 players, ordering and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept heroes or copied graphics. Physical #48, Render drift #86 and main protection #87 remain open. Authenticated online hosting requires owner resources. Never expose Git SHA in player UI.

## Evidence
- .253 Modular QA, exact-head four-Node/four-Chromium Census and QA-gated promotion passed; Pages deployment passed.
- .254 gameplay source, focused Node/browser regressions and synchronized About/release/offline metadata are committed; the first exact-head Node preflight failure has a targeted scope correction; reruns pending.

## Cleanup
Keep this file below 4 KiB with all required headings and exact Agent ID. Do not read/edit another agent's private checkpoint. Never bypass CI, security or QA promotion.
