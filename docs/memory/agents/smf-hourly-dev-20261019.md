# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-26

## Mission
Prioritize responsive football gameplay and intelligent passing/tackling, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup. Preserve canonical data, four actions, compatible saves and offline play.

## Current checkpoint
- **0.12.81.332 — AI-FIRST-TOUCH-OUTLET-ARRIVAL-LEAD-PARITY-01:** pressured CPU first-touch outlet selection now projects the receiver to the same 0.12–0.35 s, ±65-unit support-pass lead used by actual dispatch, including the legacy directional-input fallback. The safety check no longer approves a stale short point when the actual release pocket is covered.
- Feature implementation/fix commit: `aa8c3a227a5bd4ac2c29fe0d2c0d9107d51aa3bf`. The subsequent commit updates only this checkpoint; resolve the live dev ref before any next edit.
- Modular QA #45818104226 passed **2,956/2,956** Node tests on the feature commit; Python browser regression compilation passed. Concept Hero QA #45818104197 passed; no concept-hero work/art was performed.
- Full Regression Census #45818104127 on the feature commit: preflight and preview passed; Node shards 2/3 passed, Node shards 0/1 and all four Chromium shards were running at last check. The checkpoint-only descendant requires its own exact-head gate.
- .331 Census #45809608218 had one historical `lan_auto_two_browser_qa.py` 10-second wait timeout; a failed-job-only retry (attempt 3) is still running. No LAN/P2P source changed and no physical regression/certification is claimed.
- Release metadata, About-only version, README banner, version policy, cache identity, master backlog and this checkpoint align to .332.

## Next smallest action
Finish the latest exact-head Modular QA and four-Node/four-Chromium Census. Fix confirmed failures, then allow only a fully green exact head through the existing QA-gated main pipeline. Independently verify main Census, Pages deployment and hosted bytes. Continue to the next unfinished football gameplay or existing-player visual item.

## Ownership and exclusions
Preserve 223 teams, 2,676 player identities/order and 12-player ratios, six formations, exactly four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept-hero creation or copied art. Keep #48 physical acceptance, #86 Render drift and #87 main protection unresolved until independently verified. Main currently reports `protected=false`; do not claim protection. No authenticated online-hosting claim.

## Evidence
- Feature head: `aa8c3a227a5bd4ac2c29fe0d2c0d9107d51aa3bf`; main HEAD: `da3146d83113f82835a6095d0ed814d75d0dbc4c`. Feature head was 10 ahead / 0 behind main; refresh comparison after checkpoint-only commit.
- Modular Game Dev QA #45818104226: 2,956 passed, 0 failed on feature head.
- Full Regression Census #45818104127: preflight/preview passed; Node shards 2/3 passed; Node shards 0/1 and all four Chromium shards running at last check.
- Main .325 Pages deployment #45782390375 and independent Census #45782401424 passed; hosted-pages smoke passed.
- #87 main protection remains open/unprotected; #48 physical two-phone acceptance and #86 Render drift remain open. No physical-device certification.

## Cleanup
Only this agent checkpoint was updated. No LAN/P2P, roster, concept art, save-schema or online-hosting changes.
