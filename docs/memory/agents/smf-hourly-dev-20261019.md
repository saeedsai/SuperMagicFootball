# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-27

## Mission
Prioritize responsive football gameplay, intelligent passing/tackling and counterable Magic Tricks, then existing-player graphics, goalkeeper animation, Player Studio and Career/Cup. Preserve canonical data, four actions, compatible saves and offline play.

## Current checkpoint
- **0.12.81.352 — KEEPER-CATCH-SETTLE-POSE-01:** grounded keeperCatch now animates the gloves inward and moves the visually held ball from y=-54 to the keeperHold y=-59 anchor over the existing 0.46-second catch timer. Smoothstep is shared between ball grip and procedural eight-view arm pose; physics, ownership, catch events, timers, dive catches and distribution remain unchanged.
- **.351 confirmed gate failure and repair:** Modular QA #45935915612 and Census #45935915652 stopped in preflight at arena_overhaul_visual_contract.test.cjs: docs/VERSIONING_POLICY.md did not contain “About-only 0.12.81.351”. The .352 metadata now explicitly declares About-only for .351 and .352. The separate .350 support-pass browser fixture correction remains in .351.
- **Feature files:** src/modules/artpose.js, src/modules/characterart.js, src/modules/render.js, tests/keeper_arm_reach_pose.test.cjs and tests/keeper_save_event_integrity_browser_qa.py. Release metadata, backlog and this checkpoint updated.
- **Pre-change exact heads:** dev cff3f31b1a49bdabdfde696366d82585130562e8; main f83d578e597703eee7ff2f958b0d971aa92e81a6. Main .349 Pages #45932990259 and Census #45932996471 succeeded; hosted smoke passed.

## Next smallest action
Inspect exact .352 Modular QA, keeper-event workflow and Full Regression Census. Fix any confirmed failure without weakening assertions. Only allow a fully green exact head through the existing QA-gated main pipeline; independently verify main Census, Pages deployment and hosted bytes. Then move to the next independent player-facing feature.

## Ownership and exclusions
Preserve 223 team and 2,676 player identities/order and 12-player ratios, six formations, exactly four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept-hero creation or copied art. Keep #48 physical acceptance, #86 Render drift and #87 main protection unresolved until independently verified. Do not claim physical-device certification or authenticated online hosting.

## Evidence
- .351 Modular QA #45935915612 and Census #45935915652 failed in preflight solely on the missing About-only policy declaration; exact Node/browser shards did not run.
- Main SHA f83d578e597703eee7ff2f958b0d971aa92e81a6; Pages #45932990259 and main Census #45932996471 succeeded.
- GitHub branch metadata reports main.protected=false and dev.protected=false; #87 remains open. #48 and #86 remain open.

## Cleanup
No roster/data, save-schema, LAN/P2P, new art assets, concept-art or online-hosting changes.
