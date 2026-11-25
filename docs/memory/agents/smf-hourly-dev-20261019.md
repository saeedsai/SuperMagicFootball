# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-25

## Mission
Deliver player-facing football gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup improvements. Preserve canonical data, four match actions, compatible saves and offline play.

## Current checkpoint
- **0.12.81.302 — KEEPER-SHOT-LANE-BRAKING-READ-01:** CPU shot-lane prediction now models bounded lateral braking. Existing 0.10–0.34 s horizon and ±65-unit cap remain; Agility/GK Skill improve braking and fatigue reduces it. Human aim and actual keeper/ball physics are unchanged.
- Initial .302 implementation SHA: `f5b4faa4c655fbca8e6f9530c1de792e7cffc325`. Full Regression Census #45662539555 failed only preflight release-contract assertions for the current README project heading and service-worker release comment still saying .301. The top release banner, package/About version and cache suffix were already .302. Metadata correction is in the follow-up commit; no gameplay failure was established.
- Parent .301 SHA `96262c75ac24ce38851a4e5614fe705cc7acebc9` passed dev Modular QA #45656208839 and Full Regression Census #45656208630; QA-gated promotion advanced main to the same SHA. Pages deployment #45658428453 succeeded. Independent main Census #45658441307 passed on failed-job-only attempt 2.

## Next smallest action
Validate the corrected exact .302 head with Modular QA and all four Node/four Chromium Census shards. Fix confirmed failures without weakening gameplay thresholds, then allow only the green exact head through the existing QA-gated promotion pipeline. Independently verify main Census, Pages deployment and hosted bytes.

## Ownership and exclusions
Preserve 223 teams, 2,676 player identities/order and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept heroes or copied graphics. Studio art requires provenance, game-scale QA and owner acceptance. Keep #48 physical acceptance, #86 Render drift and #87 branch-protection security open. No authenticated online-hosting claim.

## Evidence
- Main .301 independent Census #45658441307 attempt 2 passed preflight, preview, hosted-pages smoke, all four Node and all four Chromium shards; promotion correctly skipped because main was already at the tested SHA.
- Initial .302 Full Regression Census #45662539555 failed preflight in release metadata assertions; feature regression results require fresh exact-head validation after the metadata correction.
- Main branch protection #87 remains unresolved; #48 and #86 remain open.

## Cleanup
Keep this file below 4 KiB with these headings and exact Agent ID. Never bypass CI, security or QA promotion.