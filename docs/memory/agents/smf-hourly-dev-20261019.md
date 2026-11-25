# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-25

## Mission
Deliver player-facing gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup improvements. Preserve canonical data, four match actions, compatible saves and offline play.

## Current checkpoint
- **0.12.81.282 — AI-GROUND-PASS-SWEPT-SLIDE-READ-01:** CPU pass-lane scoring now time-aligns the live slide path with the ball path. A fast slide is no longer capped to the ordinary 65-unit movement projection; only a still-active, reachable sweep closes the lane.
- Production change: `src/modules/shotfeel.js`; focused Node tests cover mirrored crossing, retreating, late, expired and malformed slides plus ordinary defender baselines. Actual-engine desktop/simulated-touch Chromium checks mirrored CPU support-pass release versus a live crossing slide.
- **.281 certified and promoted:** Modular QA #45532340534, dev Full Regression Census #45532340656 (all four Node/four Chromium shards and QA-gated promotion), Pages deployment #45533777866, and independent main Census #45533789248 all passed. Dev and main now both point to `0fc6bec3e7ef134bfe66baa5bfc6f4fae812cede`.
- .282 is committed to dev; its focused and exact-head gates are pending.

## Next smallest action
Inspect unfiltered Actions runs for the exact .282 SHA. Verify Modular QA and all four Node/four Chromium Census shards, repair confirmed failures, then allow only the green exact head through the existing QA-gated promotion. Independently verify main Census, Pages deployment and hosted smoke.

## Ownership and exclusions
Preserve 223 original teams, 2,676 player identities/order and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No new concept heroes or copied graphics. New Studio art requires provenance, game-scale QA and owner acceptance. Keep #48 physical two-phone acceptance, #86 Render drift and #87 branch-protection security open. Authenticated online hosting is not live without owner resources.

## Evidence
- REST `GET /actions/runs?per_page=100` confirmed the .281 push runs, not only PR-filtered runs.
- .281 Modular QA and exact-dev Census passed; promotion job succeeded. Pages deployment and independent main Census passed all preflight, preview, hosted smoke, four Node and four Chromium jobs.
- Branch metadata reports `dev.protected=false` and `main.protected=false`; repository rulesets are empty. The dedicated protection endpoint returned 403 for this integration. #87 remains a real security issue.
- Open issues include #87, #86, #48, #12, #10 and #3. No physical-device acceptance, Render auto-deploy or authenticated-hosting claim is made.

## Cleanup
Keep this file below 4 KiB with all required headings and exact Agent ID. Never bypass CI, security or QA promotion.