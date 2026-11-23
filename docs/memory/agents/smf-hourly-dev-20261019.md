# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-23

## Mission
Deliver bounded player-facing gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup. Never substitute audits or test-only iterations. Preserve four actions, canonical rosters, compatible saves and offline play.

## Current checkpoint
- **0.12.81.229 candidate:** AI-SUPPORT-PASS-ARRIVAL-READ-01 evaluates support-run passes at the same bounded receiver lead used by the actual PASS. Projected corridor/collection defenders cancel the preference; a rejected primary runner is excluded from ordinary fallback so another teammate can be used or possession retained. Mirrored Node and real-engine desktop/simulated-touch browser acceptance added.
- **.228 failure:** Modular QA #45190963622 and Census #45190963681 each found one stale through-ball test comparing Euclidean distance with longitudinal lead after .228 added lateral projection (2,808 pass, 1 fail). .229 changes the assertion to longitudinal projection and keeps separate lateral/cap/edge tests. No production failure established; .228 not certified/promoted.
- **.227 failure:** Modular QA #45180992658 passed 2,807/2,807. Census #45180992547 failed only the new browser fixture's nonexistent lineup slot 6 (valid slots 0–5); other 68 scripts passed. .228 repaired it using slot 1. .227 not certified/promoted.
- **.226 retry:** Census #45172577337 attempt 2 passed all four Node and four Chromium shards; promotion correctly skipped because dev had moved. .226 not deployed.
- **.225 main:** Pages #45165193079 and independent main Census #45165206483 passed on `91adea9bad06524c3022e7ee60a8ece58fb16142`.

## Next smallest action
Verify focused Node and actual-engine Chromium acceptance, then run exact-head Modular QA and full four-Node/four-Chromium Census on .229. Fix confirmed failures, allow only the green exact head through the existing QA-gated promotion pipeline, then verify Pages, main Census and hosted-byte smoke separately.

## Ownership and exclusions
Only this checkpoint. Preserve 223 teams, 2,676 players, exact ordering and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept heroes or copied art. Physical two-phone #48 stays open. Render #86 and main protection #87 stay open. Authenticated online hosting needs owner resources. Never expose Git SHA in player UI.

## Evidence
- .228 Modular QA: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45190963622
- .228 Census: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45190963681
- .227 Modular QA: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45180992658
- .227 Census: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45180992547
- .226 successful retry: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45172577337
- .225 Pages: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45165193079
- .225 main Census: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45165206483

## Cleanup
Keep this file below 4 KiB. Read and edit only this assigned checkpoint. Never bypass required CI, security or QA promotion.
