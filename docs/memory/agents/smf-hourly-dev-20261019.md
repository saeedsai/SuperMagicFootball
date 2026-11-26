# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-26

## Mission
Deliver player-facing football gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup improvements. Preserve canonical data, four actions, compatible saves and offline play.

## Current checkpoint
- **0.12.81.326 — AI-CUTBACK-PASS-RECEIVER-TURN-READ-01:** CPU byline cutback passes now lead the central receiver through the existing Agility-limited turn response over the existing 100 ms window. High-Agility runners cutting centrally receive the low PASS farther into the new lane; low-Agility runners retain more forward momentum.
- The existing 24-unit per-axis cap, receiver eligibility, defender lane/collection checks, low pass trajectory, possession, four actions, saves, rosters and offline behavior remain unchanged.
- Added mirrored Node coverage for both teams, high/low Agility and neutral-input fallback; extended actual-engine desktop/simulated-touch Chromium to verify real CPU cutback PASS dispatch, receiver identity and pass vector.
- Exact-head Modular QA and four-Node/four-Chromium Census are pending for this candidate.

## Next smallest action
Inspect exact-head .326 Modular QA and Full Regression Census. Fix confirmed failures on existing dev, then allow only a fully green exact head through the QA-gated main pipeline. Independently verify main Census, Pages deployment and hosted bytes.

## Ownership and exclusions
Preserve 223 teams, 2,676 player identities/order and 12-player ratios, six formations, exactly four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept-hero creation or copied art. Keep #48 physical acceptance, #86 Render drift and #87 main protection open. No authenticated online-hosting claim.

## Evidence
- Parent .325 exact-head Modular QA #45780877857: passed (2,951/2,951 Node).
- Parent .325 Full Regression Census #45780878017: all four Node and all four Chromium shards passed; QA-gated promotion succeeded.
- Main .325 SHA `da3146d83113f82835a6095d0ed814d75d0dbc4c`; Pages deployment #45782390375 passed and independent main Census #45782401424 passed including hosted-pages smoke.
- GitHub REST reports `main.protected=false`; #87 remains unresolved. #48 remains open; no physical two-phone certification.

## Cleanup
Read only this agent's checkpoint. No LAN/P2P, roster, art, save-schema or online-hosting changes in this increment.
