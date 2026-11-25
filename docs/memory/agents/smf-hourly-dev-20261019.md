# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** smf-hourly-dev-20261019
**Updated:** 2026-11-25

## Mission
Deliver player-facing football gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup improvements. Preserve canonical data, four match actions, compatible saves and offline play.

## Current checkpoint
- **0.12.81.301 — KEEPER-ACTIVE-JUMP-ARRIVAL-READ-01:** high-cross challengers still in the first/last 18 units of a jump now use their live vertical velocity over the 120 ms arrival horizon. Rising low-altitude jumpers can contest when projected feet plus the 45-unit body reach meets the cross; descending jumpers cannot reuse a fresh-jump estimate. Grounded players retain Jumping-based first-jump reach; higher airborne players retain the 126-unit body envelope.
- Parent .299 SHA 25da96aa2ddf1ba5d188da936f097c649f657e4f passed dev Modular QA #45642933090 and Full Regression Census #45642931875; promotion, Pages #45644606856 and main Census #45644621966 all passed.
- .300 SHA 3656d6833ff3eb6632c0bba1b2ba7f39c80f09c1: Modular QA #45652286880 passed. First Census #45652287428 passed preflight, preview, all Node shards and three Chromium shards; one browser shard failed online_account_ui_browser_qa.py on a deferred Online Career 10-second timeout. Failed-job-only retry attempt 2 was requested; inspect before promotion.
- .301 adds mirrored Node and actual-engine desktop/simulated-touch Chromium coverage for both goals, rising/descending early jumps and grounded baseline.

## Next smallest action
Validate exact .301 Modular QA and complete four-Node/four-Chromium Full Regression Census. Resolve only confirmed failures; inspect the .300 failed-job retry separately. Promote only through the existing QA-gated pipeline and independently verify main Census, Pages and hosted bytes.

## Ownership and exclusions
Preserve 223 teams, 2,676 player identities/order and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept heroes or copied graphics. Studio art requires provenance, game-scale QA and owner acceptance. Keep #48 physical acceptance, #86 Render drift and #87 branch-protection security open. No authenticated online-hosting claim.

## Evidence
- Parent dev/main .299 SHA: 25da96aa2ddf1ba5d188da936f097c649f657e4f; parent Modular QA #45642933090, dev Census #45642931875, Pages #45644606856 and main Census #45644621966 passed.
- .300 Modular QA #45652286880 passed; Census #45652287428 first attempt failed only online-account deferred-request timeout in browser shard 0; failed-job retry requested.
- Current parent dev SHA before .301: 3656d6833ff3eb6632c0bba1b2ba7f39c80f09c1; main SHA: 25da96aa2ddf1ba5d188da936f097c649f657e4f. Both branches report unprotected; #87 remains open.
- No local Node/Chromium run because container github.com DNS is unavailable; connected GitHub Actions is the validation path.

## Cleanup
Keep this file below 4 KiB with these headings and exact Agent ID. Never bypass CI, security or QA promotion.