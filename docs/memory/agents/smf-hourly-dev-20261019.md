# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-26

## Mission
Prioritize responsive football gameplay and intelligent passing/tackling, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup. Preserve canonical data, four actions, compatible saves and offline play.

## Current checkpoint
- **0.12.81.332 — AI-FIRST-TOUCH-OUTLET-ARRIVAL-LEAD-PARITY-01:** pressured CPU first-touch outlet selection now projects a receiver to the same 0.12–0.35 s, ±65-unit lead used by actual support-pass dispatch, including the legacy directional-input fallback. The safety check no longer approves a stale short point when the actual release point is covered.
- Added mirrored Node helper tests and actual-engine desktop/simulated-touch Chromium acceptance for both attack directions. Existing safe-outlet and ordinary post-read pass paths remain covered.
- .331 exact-head Census #45809608218 passed preflight, preview and all four Node shards plus three Chromium shards; browser shard 2 failed only the historical LAN auto-discovery wait (10-second Playwright timeout). Failed-job-only retry requested; no LAN/P2P source change or physical-device regression established.
- Release metadata, About-only version, README banner/headings, version policy, service-worker cache identity, master backlog and this checkpoint are aligned to .332.

## Next smallest action
Run exact-head Modular QA and the full four-Node/four-Chromium Census on .332. Fix confirmed failures, then allow only a fully green exact head through the existing QA-gated main pipeline. Independently verify main Census, Pages deployment and hosted bytes. Continue to the next unfinished football gameplay or existing-player visual item.

## Ownership and exclusions
Preserve 223 teams, 2,676 player identities/order and 12-player ratios, six formations, exactly four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept-hero creation or copied art. Keep #48 physical acceptance, #86 Render drift and #87 main protection unresolved until independently verified. No authenticated online-hosting claim.

## Evidence
- Parent .331 dev HEAD: `f5e65fc8d47a91d98e2783e649c348bab6a947bf`.
- Modular Game Dev QA #45809608194 passed on .331.
- Full Regression Census #45809608218: preflight, preview and all four Node shards passed; browser shards 0, 2 and 3 passed; browser shard 1 failed only `lan_auto_two_browser_qa.py` with a 10-second wait timeout. Failed-job-only retry requested.
- Main HEAD at session start: `da3146d83113f82835a6095d0ed814d75d0dbc4c`; main release/deployment must be independently rechecked after any future promotion.
- #87 main protection remains unresolved; #48 physical two-phone acceptance and #86 Render drift remain open. No physical-device certification.

## Cleanup
Only this agent checkpoint was updated. No LAN/P2P, roster, concept art, save-schema or online-hosting changes.
