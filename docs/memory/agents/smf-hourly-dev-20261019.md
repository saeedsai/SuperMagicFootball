# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-26

## Mission
Prioritize responsive football gameplay and intelligent passing/tackling, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup. Preserve canonical data, four actions, compatible saves and offline play.

## Current checkpoint
- **0.12.81.334 — AI-FIRST-TOUCH-OUTLET-MARKER-TURN-ARRIVAL-01:** second-defender first-touch outlet coverage now projects ready markers through the existing Agility-limited turn model. High-Agility markers can close a pocket they are actively turning toward; low-Agility markers retain their real turning delay. The existing 0.12–0.35 s arrival horizon, 0.18 s turn phase, ±30-unit per-axis lead cap and 92-unit cover radius remain.
- Added mirrored Node regressions for both attack directions, high/low Agility and neutral/invalid-input fallback. Existing actual-engine desktop/simulated-touch browser acceptance still covers support assignment and possession.
- Exact dev HEAD at start: 6708112c7624674065f208fd9675c2a3862b82f8 (.333); Modular QA #45824024024 and Full Regression Census #45824023966 passed. The .333 candidate completed all four Node and four Chromium shards and QA-gated promotion.
- The first .334 exact-head Node gate (#45826519191) ran 2,959 tests: 2,958 passed; the only failure was this checkpoint's Agent ID missing the required inline-code identity marker. No gameplay regression failed. Corrected the marker; final-head Modular QA and Census reruns are pending.
- Main is now .333 at 6708112c7624674065f208fd9675c2a3862b82f8; Pages #45825962341 succeeded. Independent main Census #45825975203 is in progress.

## Next smallest action
Run exact-head Modular QA and four-Node/four-Chromium Full Regression Census for .334. Fix any confirmed failure, then allow only a fully green exact head through the existing QA-gated main pipeline. Independently verify main Census, Pages deployment and hosted bytes. Continue to the next unfinished gameplay or existing-player visual item.

## Ownership and exclusions
Preserve 223 teams, 2,676 player identities/order and 12-player ratios, six formations, exactly four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept-hero creation or copied art. Keep #48 physical acceptance, #86 Render drift and #87 main protection unresolved until independently verified. Main currently reports protected=false; do not claim protection. No authenticated online-hosting claim.

## Evidence
- .333 Modular QA #45824024024 and Full Regression Census #45824023966 passed on 6708112c7624674065f208fd9675c2a3862b82f8.
- .332 Census #45818956910 passed all four Node and Chromium shards and QA-gated promotion. Pages #45820525545 and main Census #45820537694 passed.
- GitHub REST lists dev unprotected and main unprotected; branch-protection read returns 403. #87, #48 and #86 remain open. No physical-device certification.

## Cleanup
Only this agent checkpoint was updated. No LAN/P2P, roster, concept art, save-schema or online-hosting changes.
