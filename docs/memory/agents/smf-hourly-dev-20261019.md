# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-27

## Mission
Prioritize responsive football gameplay, intelligent passing/tackling and counterable Magic Tricks, then existing-player graphics, goalkeeper animation, Player Studio and Career/Cup. Preserve canonical data, four actions, compatible saves and offline play.

## Current checkpoint
- **0.12.81.351 — KEEPER-RECEIVING-FACING-OUTLET-01:** CPU goalkeeper short throws prefer a similarly safe teammate facing the incoming ball. Live dx/dy input overrides stale face; neutral input falls back to face. The maximum 43.2-point penalty only breaks close outlet ties; interception safety and pressure remain stronger. Long clearance and point-only keeper roll ranking are unchanged.
- **.350 exact-head finding and correction:** Modular QA #45933958505 passed 2,990/2,990 Node tests. Full Regression Census #45933958527 confirmed browser shard 3 failed in ai_support_pass_arrival_browser_qa.py: team-1 fixture moved right and moving-away/moving-into shared the same steering. The fixture now mirrors velocity by team and matches dy to the movement case; original assertions remain intact. Other Census shards were still running at last inspection.
- **Feature files:** src/modules/engine.js, tests/keeper_outlet_pressure.test.cjs, tests/keeper_outlet_lane_browser_qa.py. Same commit repairs tests/ai_support_pass_arrival_browser_qa.py and updates release metadata/backlog.
- **Pre-change exact heads:** dev 44fbad2a8038d8bedd8433dcbf54bfecda304b60; main f83d578e597703eee7ff2f958b0d971aa92e81a6. Main .349 Pages #45932990259 and Census #45932996471 succeeded; hosted smoke passed.

## Next smallest action
Inspect exact .351 Modular QA and Full Regression Census. Fix confirmed failures without weakening assertions. Only allow a fully green exact head through the existing QA-gated main pipeline; independently verify main Census, Pages deployment and hosted bytes. Then move to the next independent player-facing feature.

## Ownership and exclusions
Preserve 223 team and 2,676 player identities/order and 12-player ratios, six formations, exactly four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept-hero creation or copied art. Keep #48 physical acceptance, #86 Render drift and #87 main protection unresolved until independently verified. Do not claim physical-device certification or authenticated online hosting.

## Evidence
- Pre-change dev SHA 44fbad2a8038d8bedd8433dcbf54bfecda304b60; .350 Modular QA #45933958505 passed 2,990/2,990; .350 Census #45933958527 had a confirmed browser-shard-3 fixture failure.
- Main SHA f83d578e597703eee7ff2f958b0d971aa92e81a6; Pages #45932990259 and main Census #45932996471 succeeded.
- GitHub branch metadata reports main.protected=false and dev.protected=false; #87 remains open. #48 and #86 remain open.

## Cleanup
No roster/data, save-schema, LAN/P2P, concept-art or online-hosting changes.
