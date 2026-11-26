# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-26

## Mission
Prioritize player-facing football gameplay, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup depth. Preserve canonical data, four actions, compatible saves and offline play.

## Current checkpoint
- **0.12.81.331 — KEEPER-CROSS-FUTURE-CONTEST-READ-01:** CPU goalkeeper contested high-cross decisions now compare active attackers against the bounded 120 ms future ball point, matching the existing descending-height prediction. A runner moving into the cross can now trigger the existing punch before it is currently within the pressure threshold; a runner moving away from a cross travelling toward the keeper no longer forces an unnecessary punch. Current keeper contact, jump eligibility, skill/fatigue pressure, punch/rebound and catch rules remain unchanged.
- Added mirrored Node and actual-engine desktop/simulated-touch Chromium regressions for both goals and approaching/retreating cross flight.
- Repaired the confirmed .330 Scream browser fixture: updatePlayers reset the selected-human caster's synthetic hold to .35 on each frame; the fixture now advances the hold after each physics step while retaining the real CPU jump and unchanged resolver assertions.
- Release metadata, About-only version, README banner/headings, version policy, service-worker cache identity, master backlog and this checkpoint are aligned to .331.

## Next smallest action
Run exact-head Modular QA and the full four-Node/four-Chromium Census on .331. Fix confirmed failures, then allow only a fully green exact head through the existing QA-gated main pipeline. Independently verify main Census, Pages deployment and hosted bytes. Continue to the next uncompleted football gameplay or existing-player visual item rather than repeating Agility-only work.

## Ownership and exclusions
Preserve 223 teams, 2,676 player identities/order and 12-player ratios, six formations, exactly four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept-hero creation or copied art. Keep #48 physical acceptance, #86 Render drift and #87 main protection unresolved until independently verified. No authenticated online-hosting claim.

## Evidence
- Parent .330 dev HEAD: 4520c33cf8dda92d3fa673d7f2e914e990a5a5d9.
- .330 Modular QA #45799935397 passed; Full Regression Census #45799935262 passed preflight, preview and all four Node shards plus browser shards 0, 1 and 3. Browser shard 2 failed only the Scream fixture because the synthetic selected-human caster hold stayed at .35; .331 advances that hold explicitly after each physics frame.
- Main .325 HEAD: da3146d83113f82835a6095d0ed814d75d0dbc4c; Pages #45782390375 and independent main Census #45782401424 passed.
- GitHub reports main protection #87 unresolved; #48 physical two-phone acceptance and #86 Render drift remain open. No physical-device certification.

## Cleanup
Only this agent checkpoint was updated. No LAN/P2P, roster, concept art, save-schema or online-hosting changes.
