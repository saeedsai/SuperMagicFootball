# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-26

## Mission
Deliver player-facing football gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup improvements. Preserve canonical data, four actions, compatible saves and offline play.

## Current checkpoint
- **0.12.81.325 — AI-CUTBACK-RECEIVER-AGILITY-TURN-READ-01:** defensive cutback cover now predicts the central receiver through the existing Agility-limited turn response. High-Agility runners cutting centrally draw the second defender farther into their reachable lane; low-Agility runners retain more existing momentum. The primary still presses the carrier.
- Added mirrored Node and actual-engine desktop/simulated-touch Chromium regressions for both attack directions, high/low Agility and neutral-input fallback. Existing ±18-unit per-axis projection, receiver eligibility, cover bounds, possession and four actions remain.
- Parent .324 exact dev SHA: `ca975d1b3723edc9333b771c11240f82fb122ef3`. Modular QA #45778461528 passed. Full Census #45778461585 was still running at last observation: preflight and preview passed; Node shards 0/2/3 passed, Node shard 1 running; Chromium shards 0/1/2/3 passed. .325 exact-head gates are triggered by the current commit.

## Next smallest action
Inspect exact-head .325 Modular QA and all four Node/four Chromium Census jobs. Fix confirmed failures on existing dev, then allow only a fully green exact head through the QA-gated main pipeline. Independently verify main Census, Pages deployment and hosted bytes.

## Ownership and exclusions
Preserve 223 teams, 2,676 player identities/order and 12-player ratios, six formations, exactly four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept-hero creation or copied art. Keep #48 physical acceptance, #86 Render drift and #87 main protection open. No authenticated online-hosting claim.

## Evidence
- Parent .324 Modular QA #45778461528: passed on its exact dev head.
- Parent .324 Full Regression Census #45778461585: preflight, preview and three Node shards plus all four Chromium shards passed; Node shard 1 was still running. No full pass claimed.
- Main SHA: `e1720386be42b69c068afa0c193148f21abaefe7`; previous .314 Pages/Census evidence is historical and does not certify newer dev candidates.
- Main branch-protection API returned 403; #87 remains unresolved. #48 remains open; no physical two-phone certification.

## Cleanup
Read only this agent's checkpoint. No LAN/P2P, roster, art, save-schema or online-hosting changes in this increment.
