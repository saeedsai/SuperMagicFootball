# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-27

## Mission
Prioritize responsive football gameplay, intelligent passing/tackling and counterable Magic Tricks, then existing-player graphics, goalkeeper animation, Player Studio and Career/Cup. Preserve canonical data, four actions, compatible saves and offline play.

## Current checkpoint
- **0.12.81.346 — AI-FIRST-TOUCH-OUTLET-CONTROL-READ-01:** pressured CPU first-touch outlet selection now uses receiver Dribbling (70%) and Agility (30%) as a bounded ±10 score-unit tie-breaker. Spatial safety and forward value remain dominant; missing/invalid ratings fall back to neutral 50. Mirrored helper/actual-engine Node and desktop/simulated-touch Chromium regressions cover both attack directions, fallback, safer-outlet precedence and the actual pass target.
- **.345 gate:** Modular QA #45909591327 passed 2,980/2,980. Full Regression Census #45909591318 is still running on exact SHA cf90f9b723a9397c0302538f6ec14f367b0f96f5, retry attempt 2; preflight, preview, three Node shards and three Chromium shards passed, with browser shard 0 still running at last inspection. Do not claim certification until the final shard and job conclude.
- **.344 certification:** Census #45903575975 passed all four Node and four Chromium shards; QA-gated promotion, Pages #45904941174 and main Census #45904948243 succeeded. Main remains .344.

## Next smallest action
Check exact-head .346 Modular QA and Full Regression Census. Fix any confirmed failure, then allow only a fully green exact head through the existing QA-gated main pipeline. Independently verify main Census, Pages deployment and hosted bytes. Continue with the next unblocked gameplay or graphics item.

## Ownership and exclusions
Preserve 223 team and 2,676 player identities/order and 12-player ratios, six formations, exactly four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept-hero creation or copied art. Keep #48 physical acceptance, #86 Render drift and #87 main protection unresolved until independently verified. Do not claim physical-device certification or authenticated online hosting.

## Evidence
- Parent dev SHA cf90f9b723a9397c0302538f6ec14f367b0f96f5; main SHA e9868a839c6d3494c39cb2966fd39a665b111ce0.
- .345 Modular QA #45909591327; Census #45909591318 attempt 2; .344 Pages #45904941174 and main Census #45904948243.
- GitHub REST reports main.protected=false and dev.protected=false; #87 remains open. #48 and #86 remain open.

## Cleanup
No roster/data, save-schema, LAN/P2P, concept-art or online-hosting changes.
