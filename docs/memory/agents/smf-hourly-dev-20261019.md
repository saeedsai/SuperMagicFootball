# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-25

## Mission
Deliver player-facing football gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup improvements. Preserve canonical data, four match actions, compatible saves and offline play.

## Current checkpoint
- **0.12.81.290 — AI-DEFENSIVE-SLIDE-AGILITY-CUT-READ-01:** CPU slide-versus-PASS-poke selection now uses the defender's Agility only for the lateral-cut branch. Agility 50 retains the 105-unit crossing baseline; Agility 100 lowers it to 95 and Agility 1 raises it to 114.8. The straight-escape branch, run-up, facing/momentum arc, exposed-ball gate, slide probability and physical contact are unchanged.
- Production change: `src/modules/ai.js`. Focused mirrored Node and actual-engine desktop/simulated-touch Chromium regressions cover both directions, skill boundaries, missing/invalid fallback and straight-escape invariance.
- **Parent dev:** `04ab8400fa3bfb1262e63055d6093079c9924395`; main remains `76426e1492c75b8280151e986cdfa20a2a50efe7` (.287).
- **.289 Modular QA #45576342614:** passed. Census #45576342687: preflight/preview passed; Node shards 0,2,3 and Chromium shards 2,3 passed; browser shard 1 failed only historical `lan_auto_two_browser_qa.py` timeout (71 other browser scripts passed); Node shard 1 and browser shard 0 were still running at last inspection. Retry the failed job after workflow completion; no LAN source change absent a confirmed regression.
- .290 exact-head Modular QA and Full Regression Census are triggered by the new dev commit and must be observed before promotion.

## Next smallest action
Complete exact .290 Node/Chromium gates; repair only confirmed failures. Then allow only the existing green exact-head QA-gated pipeline to promote. Verify main Census, Pages deployment and hosted-byte smoke independently.

## Ownership and exclusions
Preserve 223 original teams, 2,676 player identities/order and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept heroes or copied graphics. Studio art requires provenance, game-scale QA and owner acceptance. Keep #48 physical acceptance, #86 Render drift and #87 branch-protection security open. No authenticated online-hosting claim.

## Evidence
- .289 Modular QA #45576342614 green; Census #45576342687 has the stated historical LAN browser timeout and incomplete remaining shards.
- Main and dev are not protected according to GitHub branch metadata; #87 remains open. Physical two-phone acceptance #48 remains open.

## Cleanup
Keep this file below 4 KiB with these headings and exact Agent ID. Never bypass CI, security or QA promotion.
