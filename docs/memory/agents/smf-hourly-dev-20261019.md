# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-26

## Mission
Prioritize responsive football gameplay and intelligent passing/tackling, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup. Preserve canonical data, four actions, compatible saves and offline play.

## Current checkpoint
- **0.12.81.335 — KEEPER-PARRY-TURN-AWARE-LANE-READ-01:** the keeper now evaluates parry corridors using the existing Agility-limited turn response of active attackers. Elite runners turning into the preferred rebound lane can make the goalkeeper choose the clearer opposite side; low-Agility runners retaining momentum away do not falsely block the original side.
- Preserved the 0.24/0.48 s samples, 0.18 s turn phase, ±150-unit lead cap, exact linear fallback, recovery filters, rebound magnitude, catch threshold and dive physics. Added mirrored Node and actual-engine desktop/simulated-touch regressions.
- Start dev/main SHA: 22a8a127b10e3e39e00a78d45c096d738cb87a72. Candidate .334 Modular QA #45827103578 and Full Regression Census #45827103275 passed; QA-gated promotion advanced main/dev to .334. Pages #45829183907 succeeded. Independent main Census #45829195148 was in progress at start.
- .335 feature commit triggered exact-head Modular QA and Full Regression Census; inspect those runs before any promotion.

## Next smallest action
Inspect exact-head Modular QA and all four Node/four Chromium Census jobs. Fix confirmed failures, then allow only a fully green exact head through the existing QA-gated main pipeline. Independently verify main Census, Pages deployment and hosted bytes. Continue to the next distinct gameplay or existing-player visual item.

## Ownership and exclusions
Preserve 223 teams, 2,676 player identities/order and 12-player ratios, six formations, exactly four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept-hero creation or copied art. Keep #48 physical acceptance, #86 Render drift and #87 main protection unresolved until independently verified. Main currently reports protected=false; do not claim protection. No authenticated online-hosting claim.

## Evidence
- .334 Modular QA #45827103578 and Full Regression Census #45827103275 passed on 22a8a127b10e3e39e00a78d45c096d738cb87a72; Pages #45829183907 succeeded.
- Main independent Census #45829195148 was in progress at start of this increment.
- GitHub REST reported dev/main protected=false; #87, #48 and #86 remain open. No physical-device certification.

## Cleanup
Only this agent checkpoint was updated. No LAN/P2P, roster, concept art, save-schema or online-hosting changes.
