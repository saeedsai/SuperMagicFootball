# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-23

## Mission
Deliver bounded player-facing gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup. Never substitute audits or test-only iterations. Preserve four actions, canonical rosters, compatible saves and offline play.

## Current checkpoint
- **0.12.81.228 candidate:** AI-THROUGH-BALL-LATERAL-LEAD-01 projects a committed receiver's perpendicular movement over the bounded pass flight, capped at ±32 units and clamped to the playable pitch. Defender corridor pressure, keeper collection reach, longitudinal lead and the four existing actions remain authoritative. Mirrored Node and real-engine desktop/simulated-touch keeper regressions added.
- **.227 exact-head failure:** Modular QA #45180992658 passed 2,807/2,807. Census #45180992547 passed preflight, preview, four Node shards and browser shards 0–2; shard 3 failed only the new third-man browser fixture because it requested nonexistent lineup index 6 (valid active indices are 0–5). Other 68 browser scripts passed; no production gameplay failure established. .227 was not certified or promoted.
- **.226 retry:** Census #45172577337 attempt 2 passed all four Node and four Chromium shards; promotion correctly skipped because dev had moved. .226 was not deployed.
- **.225 main:** Pages #45165193079 and independent main Census #45165206483 passed on `91adea9bad06524c3022e7ee60a8ece58fb16142`.

## Next smallest action
Verify focused Node and actual-engine Chromium acceptance, then run exact-head Modular QA and the full four-Node/four-Chromium Census on .228. Fix confirmed failures, and permit only the green exact head through the existing QA-gated promotion pipeline. Verify Pages, main Census and hosted-byte smoke separately.

## Ownership and exclusions
Only this checkpoint. Preserve 223 teams, 2,676 players, exact ordering and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept heroes or copied art. Physical two-phone #48 stays open. Render #86 and main protection #87 stay open. Authenticated online hosting needs owner resources. Never expose Git SHA in player UI.

## Evidence
- .227 Modular QA: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45180992658
- .227 Census failure: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45180992547
- .226 successful retry: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45172577337
- .225 Pages: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45165193079
- .225 main Census: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45165206483

## Cleanup
Keep this file below 4 KiB. Read and edit only this assigned checkpoint. Never bypass required CI, security or QA promotion.
