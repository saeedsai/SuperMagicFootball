# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** smf-hourly-dev-20261019
**Updated:** 2026-11-27

## Mission
Prioritize responsive football gameplay, intelligent passing/tackling and counterable Magic Tricks, then existing-player graphics, goalkeeper animation, Player Studio and Career/Cup. Preserve canonical data, four actions, compatible saves and offline play.

## Current checkpoint
- **0.12.81.350 — SUPPORT-RUN-AGILITY-TURN-LEAD-01:** CPU support-run PASS uses the same bounded Agility-limited receiver turn projection for safety selection and actual pass aim. High-Agility cutters receive a more lateral lead; low-Agility runners retain more residual momentum. Existing ±65-unit axis cap and 0.12–0.35-second flight estimate remain.
- **Feature files:** src/modules/ai.js, src/modules/engine.js, tests/ai_support_run_pass.test.cjs, tests/ai_support_pass_arrival_browser_qa.py; release metadata and backlog updated. Candidate commit is the current .350 dev head; exact-head CI pending.
- **Prior .349 gate:** Modular QA #45930460009 passed 2,988/2,988. Census #45930460018 failed only browser shard 1 on magic_scream_ai_counter_browser_qa.py; failed-job-only retry was requested and was still running at last inspection. This is separate from the .350 support-pass change and must be checked before promotion.
- **Main:** .348 SHA 632c8e10c0b3f6f7acac3a1d226dd3abdfdf6642; Pages #45929850343 succeeded; main Census #45929857232 passed all shards and hosted smoke.

## Next smallest action
Inspect .349 failed-job retry and .350 exact-head Modular QA/Census. Fix any confirmed failure without weakening assertions; allow only a fully green exact head through the existing QA-gated main pipeline. Independently verify main Census, Pages deployment and hosted bytes. Continue with the next gameplay increment.

## Ownership and exclusions
Preserve 223 team and 2,676 player identities/order and 12-player ratios, six formations, exactly four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept-hero creation or copied art. Keep #48 physical acceptance, #86 Render drift and #87 main protection unresolved until independently verified. Do not claim physical-device certification or authenticated online hosting.

## Evidence
- Base dev SHA f83d578e597703eee7ff2f958b0d971aa92e81a6; .349 Modular QA #45930460009 passed 2,988/2,988; .349 Census #45930460018 had one browser failure, with failed-job-only retry pending.
- Main SHA 632c8e10c0b3f6f7acac3a1d226dd3abdfdf6642; Pages #45929850343 successful; main Census #45929857232 successful.
- GitHub branch metadata reports main.protected=false and dev.protected=false; #87 remains open. #48 and #86 remain open.

## Cleanup
No roster/data, save-schema, LAN/P2P, concept-art or online-hosting changes.
