# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-26

## Mission
Prioritize player-facing football gameplay, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup depth. Preserve canonical data, four actions, compatible saves and offline play.

## Current checkpoint
- **0.12.81.328 — AI-CUTBACK-DEFENDER-TURN-INTERCEPT-READ-01:** CPU cutback safety now predicts active defenders through the existing Agility-limited turn response. High-Agility markers who can turn into the central pocket close the low PASS; low-Agility markers carrying momentum away do not falsely block it.
- Preserved the 100–240 ms arrival window, 55-unit per-axis cap, 74-unit pocket, pass-lane pressure, receiver choice, low pass trajectory, possession, four actions, saves, rosters and offline behavior.
- Node and actual-engine desktop/simulated-touch Chromium regressions cover both teams, high/low Agility, neutral fallback and the real CPU cutback decision.
- Parent .327 Modular QA passed 2,952/2,952 Node tests and Python browser-script compilation. Its exact-head four-Node/four-Chromium Census was running when .328 began; .328 has its own exact-head gates pending.

## Next smallest action
Finish .328 Modular QA and Full Regression Census on its exact SHA. Fix confirmed failures, then allow only a green exact head through the QA-gated main pipeline. Independently verify main Census, Pages deployment and hosted bytes.

## Ownership and exclusions
Preserve 223 teams, 2,676 player identities/order and 12-player ratios, six formations, exactly four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept-hero creation or copied art. Keep #48 physical acceptance, #86 Render drift and #87 main protection open. No authenticated online-hosting claim.

## Evidence
- .326 Node suite: 2,951/2,952 passed; the only failure was the About-only label missing from the new version-policy banner. .327 corrected that contract.
- .327 Modular QA #45790082172: 2,952/2,952 passed; Python compile passed.
- .327 Census #45790082137: preflight and preview passed; Node shards 2 and 3 passed; remaining two Node and four Chromium shards were in progress when .328 started.
- Main .325 SHA `da3146d83113f82835a6095d0ed814d75d0dbc4c`; Pages deployment #45782390375 and independent main Census #45782401424 passed including hosted-pages smoke.
- GitHub REST reports `main.protected=false`; #87 remains unresolved. #48 remains open; no physical two-phone certification.

## Cleanup
Only this agent checkpoint was read/updated. No LAN/P2P, roster, art, save-schema or online-hosting changes.
