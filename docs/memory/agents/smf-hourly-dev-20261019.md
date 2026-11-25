# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-25

## Mission
Deliver player-facing football gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup improvements. Preserve canonical data, four match actions, compatible saves and offline play.

## Current checkpoint
- **0.12.81.301 — KEEPER-ACTIVE-JUMP-ARRIVAL-READ-01:** high-cross challengers still in the first/last 18 units of a jump now use their live vertical velocity over the 120 ms arrival horizon. Rising low-altitude jumpers can contest when projected feet plus the 45-unit body reach meets the cross; descending jumpers cannot reuse a fresh-jump estimate. Grounded players retain Jumping-based first-jump reach; higher airborne players retain the 126-unit body envelope.
- Parent .299 SHA 25da96aa2ddf1ba5d188da936f097c649f657e4f passed dev Modular QA #45642933090 and Full Regression Census #45642931875; promotion, Pages #45644606856 and main Census #45644621966 all passed.
- .300 SHA 3656d6833ff3eb6632c0bba1b2ba7f39c80f09c1: Modular QA #45652286880 passed. Census #45652287428 attempt 1 had one online-account deferred-request timeout; failed-job-only attempt 2 passed all four Node and four Chromium shards. QA-gated promotion advanced main to .300. Pages #45655829969 is queued; independent main Census and hosted-byte verification remain pending.
- .301 adds mirrored Node and actual-engine desktop/simulated-touch Chromium coverage for both goals, rising/descending early jumps and grounded baseline.

## Next smallest action
Correct the own-checkpoint identity marker required by project_memory_contract, then rerun exact-head .301 Modular QA and four-Node/four-Chromium Census. The first .301 Modular QA and Census preflight each found only that checkpoint contract failure (2,907/2,908 Node tests passed); feature regressions were not reported. Promote only through the existing QA-gated pipeline and independently verify main Census, Pages and hosted bytes.

## Ownership and exclusions
Preserve 223 teams, 2,676 player identities/order and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept heroes or copied graphics. Studio art requires provenance, game-scale QA and owner acceptance. Keep #48 physical acceptance, #86 Render drift and #87 branch-protection security open. No authenticated online-hosting claim.

## Evidence
- Parent dev/main .299 SHA: 25da96aa2ddf1ba5d188da936f097c649f657e4f; parent Modular QA #45642933090, dev Census #45642931875, Pages #45644606856 and main Census #45644621966 passed.
- .300 Modular QA #45652286880 passed; Census #45652287428 first attempt failed only online-account deferred-request timeout in browser shard 0; failed-job retry requested.
- Current parent dev SHA before .301: 3656d6833ff3eb6632c0bba1b2ba7f39c80f09c1; main SHA: 25da96aa2ddf1ba5d188da936f097c649f657e4f. Both branches report unprotected; #87 remains open.
- No local Node/Chromium run because container github.com DNS is unavailable; connected GitHub Actions is the validation path.

## Cleanup
Keep this file below 4 KiB with these headings and exact Agent ID. Never bypass CI, security or QA promotion.