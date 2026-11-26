# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-26

## Mission
Prioritize responsive football gameplay and intelligent passing/tackling, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup. Preserve canonical data, four actions, compatible saves and offline play.

## Current checkpoint
- **0.12.81.336 — KEEPER-PARRY-REACHABLE-RUNNER-READ-01:** parry-lane selection now includes a runner who begins outside the 360-unit scan but can enter a rebound corridor within the existing ±150-unit-per-axis projection. The broad phase is 360 + √(150² + 150²); farther runners remain excluded.
- Preserved Agility-aware turn projection, both 230-unit corridors, 24-unit margin, recovery exclusions, catch/parry physics, four actions, saves and offline play. Added mirrored Node and actual-engine desktop/simulated-touch regressions.
- .335 exact-head Modular QA #45830932238 passed 2,960/2,960 and Keeper Save Event Integrity #45830932035 passed. Census #45830932184 failed only browser shard 1: the elite-turn browser fixture expected the opposite lane but its 120-unit placement did not retain the 24-unit clearance margin after the keeper's real 24-unit contact repositioning. .336 increases that fixture separation and adds a real late-arriving-runner scenario.
- Start dev/main SHA: `bf7edbab1597599241e83aeee32c8429a79a650f` / `22a8a127b10e3e39e00a78d45c096d738cb87a72`. Main .334 predecessor is deployed; Pages #45829183907 and independent main Census #45829195148 passed, including hosted smoke.

## Next smallest action
Inspect exact-head .336 Modular QA and all four Node/four Chromium Census jobs. Fix confirmed failures, then allow only a fully green exact head through the existing QA-gated main pipeline. Independently verify main Census, Pages deployment and hosted bytes. Continue with a distinct responsive football or goalkeeper improvement, avoiding repeated Agility-only variants.

## Ownership and exclusions
Preserve 223 teams, 2,676 player identities/order and 12-player ratios, six formations, exactly four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept-hero creation or copied art. Keep #48 physical acceptance, #86 Render drift and #87 main protection unresolved until independently verified. Main currently reports protected=false; do not claim protection. No authenticated online-hosting claim.

## Evidence
- .335 Modular QA #45830932238: 2,960/2,960 passed.
- .335 Keeper Save Event Integrity #45830932035: passed.
- .335 Census #45830932184: preflight, preview, four Node shards and three Chromium shards passed; browser shard 1 failed the keeper parry lane fixture described above.
- Main .334 Pages #45829183907 and independent Census #45829195148 passed, including hosted-pages smoke.
- GitHub REST reported dev/main protected=false; #87, #48 and #86 remain open. No physical-device certification.

## Cleanup
Only this agent checkpoint was replaced. No LAN/P2P, roster, concept art, save-schema or online-hosting changes.
