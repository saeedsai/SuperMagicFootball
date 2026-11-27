# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-27

## Mission
Prioritize responsive football gameplay, intelligent passing/tackling and counterable Magic Tricks, then existing-player graphics, goalkeeper animation, Player Studio and Career/Cup. Preserve canonical data, four actions, compatible saves and offline play.

## Current checkpoint
- **0.12.81.353 — KEEPER-CONTROL-AWARE-OUTLET-01:** CPU goalkeeper short throws now use existing Dribbling (70%) and Agility (30%) as a bounded control-quality tie-breaker among similarly safe, similarly facing receivers. The penalty/bonus is capped at ±8 score units; materially safer lanes still win. Point-only roll targets remain neutral; legacy roster records use the existing STATS-derived Dribbling/Agility values.
- **Feature files:** `src/modules/engine.js`, `tests/keeper_outlet_pressure.test.cjs`, `tests/keeper_outlet_lane_browser_qa.py`; release metadata, backlog and this checkpoint updated.
- **Pre-change exact heads:** dev `81db378a5fb3a48630a0e9d0175ffa9f85c0503d` (.352); main `f83d578e597703eee7ff2f958b0d971aa92e81a6` (.349).
- **.352 CI visibility:** combined commit status returned no status entries and the connected workflow-runs helper returned no results because it only exposes PR-triggered runs. The unfiltered Actions REST `actions/runs` listing is not exposed by the available connector; .352 is not claimed green or certified.
- **.353 implementation commits:** feature source, focused Node and desktop/simulated-touch browser acceptance, release metadata and backlog were committed on existing dev. The initial implementation batch ended at `725cbe6490477cc43d350d90e914b117d23d0c9e`; the subsequent STATS-fallback wording correction is `4d9ca010150a4205306bc3f0fd98f70756db7c8c`.

## Next smallest action
Inspect exact .353 Modular QA and Full Regression Census results using the unfiltered Actions REST run list when available. Fix any confirmed failure without weakening assertions. Only allow a fully green exact dev head through the existing QA-gated main pipeline; independently verify main Census, Pages deployment and hosted bytes. Then continue to the next independent gameplay improvement.

## Ownership and exclusions
Preserve 223 team and 2,676 player identities/order and 12-player ratios, six formations, exactly four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept-hero creation or copied art. Keep #48 physical acceptance, #86 Render drift and #87 main protection unresolved until independently verified. Do not claim physical-device certification or authenticated online hosting.

## Evidence
- .352 exact-head combined status: no entries; PR-filtered workflow run lookup: empty. No .352 Modular QA/Census pass is asserted.
- Main SHA `f83d578e597703eee7ff2f958b0d971aa92e81a6`; previous checkpoint records .349 Pages #45932990259 and independent main Census #45932996471 as successful.
- #87 remains open; main/dev protection must not be claimed. #48 and #86 remain open.

## Cleanup
No roster/data, save-schema, LAN/P2P, new art assets, concept-art or online-hosting changes.
