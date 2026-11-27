# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-27

## Mission
Prioritize responsive football gameplay, intelligent passing/tackling and counterable Magic Tricks, then existing-player graphics, goalkeeper animation, Player Studio and Career/Cup. Preserve canonical data, four actions, compatible saves and offline play.

## Current checkpoint
- **0.12.81.354 — KEEPER-UNSETTLED-OUTLET-GUARD-01:** automatic keeper throws and manual short rolls now exclude teammates with an active firstTouchControlTimer. Missing/null/zero/expired timers remain eligible; malformed timers fail closed. If no ready receiver exists, automatic keeper distribution retains its safe empty-turf long-clearance fallback. The readiness predicate is inlined to keep extracted legacy VM tests self-contained.
- **Feature files:** src/modules/engine.js, tests/keeper_outlet_pressure.test.cjs, tests/keeper_outlet_lane_browser_qa.py; release metadata, backlog and this checkpoint updated.
- **.353 release-gate repair:** exact-head .353 QA/Census exposed stale renderer assertions for the .352 eased keeper-catch pose. The tackle animation test now checks the timer-driven hand position; keeper arm reach test now strips the module export correctly before VM evaluation. Test-only commits: c2fabca31e6199fdd645b0490ab55f9837c145d1 and 7a6f533fca8b9a037ac74c61b9f405ebd55d30f5.
- **Pre-change exact heads:** dev 210b703ab4bac0055848b76bb89ed8b9aae4bb16 (.353); main f83d578e597703eee7ff2f958b0d971aa92e81a6 (.349).

## Next smallest action
Inspect exact .354 Modular QA and Full Regression Census on the final dev SHA. Fix confirmed failures without weakening assertions. Only allow a fully green exact head through the existing QA-gated main pipeline; independently verify main Census, Pages deployment and hosted bytes. Then continue the next unblocked gameplay or existing-player animation item.

## Ownership and exclusions
Preserve 223 team and 2,676 player identities/order and 12-player ratios, six formations, exactly four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept-hero creation or copied art. Keep #48 physical acceptance, #86 Render drift and #87 main protection unresolved until independently verified. Do not claim physical-device certification or authenticated online hosting.

## Evidence
- .353 exact-head Modular QA #45939841741 and Census #45939841718 failed stale renderer assertions. Test-only fixes landed in c2fabca and 7a6f533; Modular QA #45944552262 passed on 7a6f533.
- .354 first Modular QA #45945192572 exposed isolated VM fixtures that did not include a new shared helper. The predicate is now inline in both extracted methods; rerun exact-head QA/Census.
- Main SHA f83d578e597703eee7ff2f958b0d971aa92e81a6; last recorded successful main .349 Pages #45932990259 and independent Census #45932996471. No .354 release/deployment claim.
- #87 remains open; main/dev protection must not be claimed. #48 and #86 remain open.

## Cleanup
No roster/data, save-schema, LAN/P2P, new art assets, concept-art or online-hosting changes.
