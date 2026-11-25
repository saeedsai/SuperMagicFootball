# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-25

## Mission
Deliver player-facing gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup improvements. Preserve canonical data, four match actions, compatible saves and offline play.

## Current checkpoint
- **0.12.81.284 — AI-DIRECT-PASS-SHOT-IMPACT-RECOVERY-LANE-READ-01:** generic directional ground PASS now ignores defenders with active shot-impact knockdown-pending, knockdown or get-up recovery timers when scoring the flight corridor and a moving receiver's collection pocket. Clearing the timers restores normal defensive pressure.
- Production change: `src/modules/shotfeel.js`; focused Node and actual-engine desktop/simulated-touch Chromium regressions cover both pass directions, all three impact phases and recovery completion. The browser fixture's expected-target selector was corrected in follow-ups to use valid Python syntax outside the embedded engine JavaScript. A separate historical third-man marking fixture now places its primary and support defenders close enough to the carrier to prevent role ambiguity.
- Prior .283 Modular QA #45541675302 passed 2,883/2,883. Its Full Regression Census #45541675300 failed only the historical third-man runner-cover browser assertion; all four Node shards and three other Chromium shards passed. The same browser assertion failed on .282 main Census #45541162082 but passed on .282 dev Census #45539768615; failed-job-only retries are pending.

## Next smallest action
Verify exact .284 Modular QA and all four Node/four Chromium Census shards. The historical third-man browser fixture was also made deterministic by separating primary/support from the intended third-man candidate. Diagnose any confirmed failure; allow only a green exact dev head through the existing QA-gated promotion. Independently verify main Census, Pages deployment and hosted-byte smoke. Then continue with the next uncompleted player-facing gameplay or existing-player graphics item in the ordered backlog.

## Ownership and exclusions
Preserve 223 original teams, 2,676 player identities/order and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No new concept heroes or copied graphics. New Studio art requires provenance, game-scale QA and owner acceptance. Keep #48 physical acceptance, #86 Render drift and #87 branch-protection security open. Authenticated online hosting is not live without owner resources.

## Evidence
- Parent dev SHA: `9d836fba032e202f72c8280c7c9022dad454e17e`; main SHA at integration: `ddb9144bd77a275ca88b62888aa3fd2e7d13651b`; dev was two commits ahead, zero behind.
- Main Pages deployment #45541154638 and hosted-pages smoke passed for .282. Main Census #45541162082 had the same third-man browser failure as .283 dev; no main Census pass is claimed.
- Both branch protection flags were false; repository rulesets were empty. .284 is not certified, promoted or deployed until exact-head gates complete.

## Cleanup
Keep this file below 4 KiB with all required headings and exact Agent ID. Never bypass CI, security or QA promotion.
