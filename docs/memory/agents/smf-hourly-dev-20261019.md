# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-25

## Mission
Deliver player-facing gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup improvements. Preserve canonical data, four match actions, compatible saves and offline play.

## Current checkpoint
- **0.12.81.280 — AI-GROUND-PASS-KEEPER-RECOVERY-READ-01:** CPU support, cutback, goalmouth and give-and-go ground-pass evaluators now share the existing through-ball rule: keepers in dive-catch/recovery/hold/catch states cannot falsely close a ground-pass corridor or collection pocket. An idle or committed keeperDive still blocks; first-touch outlet creation still requires a real active press.
- Production change: `src/modules/ai.js`. Focused mirrored Node and actual-engine desktop/simulated-touch Chromium regressions cover both directions and support/cutback/goalmouth routes. Tests are committed but their CI execution is not yet observed.
- **.279 branch sync:** GitHub compare confirms dev and main both point to `b7df700e3d55337efa23dc13675ee63b3c1ce628`; this proves branch equality only, not Census, Pages deployment or hosted-byte certification.
- Current candidate .280 is committed to existing dev only; promotion/deployment not verified.

## Next smallest action
Inspect unfiltered GitHub REST Actions runs for the exact .280 SHA; verify Modular QA and the full four-Node/four-Chromium Census. Fix any confirmed failures, then allow only a green exact dev head through the existing QA-gated promotion. Verify main Census, Pages deployment and hosted-byte smoke independently.

## Ownership and exclusions
Preserve 223 original teams, 2,676 player identities/order and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No new concept heroes or copied graphics. New Studio art requires provenance, game-scale QA and owner acceptance. Keep #48 physical two-phone acceptance and #86 Render drift open; authenticated online hosting is not live without owner resources. Keep #87 a real security issue; do not assume branch protection.

## Evidence
- Prior .278 exact dev Census #45508184667 and Modular QA #45508184835 passed.
- Prior .278 main Census #45511050749 and Pages deployment #45511038995 passed.
- .279 main/dev equality confirmed by GitHub compare at `b7df700e3d55337efa23dc13675ee63b3c1ce628`.
- Current unfiltered Actions REST run listing was not exposed by the connected GitHub integration; no current Census or deployment result is claimed.

## Cleanup
Keep this file below 4 KiB with all required headings and exact Agent ID. Never bypass CI, security or QA promotion.
