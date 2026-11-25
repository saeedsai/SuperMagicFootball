# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-25

## Mission
Deliver player-facing football gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup improvements. Preserve canonical data, four match actions, compatible saves and offline play.

## Current checkpoint
- **0.12.81.302 — KEEPER-SHOT-LANE-BRAKING-READ-01:** CPU shot-lane prediction now includes bounded goalkeeper lateral braking. Existing 0.10–0.34 s horizon and ±65-unit cap remain; Agility/GK Skill improve braking and fatigue reduces it. Human shot aim and actual keeper/ball physics are unchanged.
- Parent .301 SHA `96262c75ac24ce38851a4e5614fe705cc7acebc9` passed dev Modular QA #45656208839 and Full Regression Census #45656208630; QA-gated promotion advanced main to the same SHA. Pages deployment #45658428453 succeeded.
- Independent main Census #45658441307 attempt 1 passed preflight, preview, hosted smoke and all four Node shards plus browser shards 0/2/3. Browser shard 1 exposed third-man actual-engine marking and historical LAN timeout; failed-job-only attempt 2 was started.

## Next smallest action
Validate the exact .302 head with Modular QA and all four Node/four Chromium Census shards. Fix confirmed failures without weakening gameplay thresholds, then allow only the green exact head through the existing QA-gated promotion pipeline. Independently verify main Census, Pages deployment and hosted bytes.

## Ownership and exclusions
Preserve 223 teams, 2,676 player identities/order and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept heroes or copied graphics. Studio art requires provenance, game-scale QA and owner acceptance. Keep #48 physical acceptance, #86 Render drift and #87 branch-protection security open. No authenticated online-hosting claim.

## Evidence
- Parent dev/main .301 SHA: `96262c75ac24ce38851a4e5614fe705cc7acebc9`; dev Modular QA #45656208839 and Full Regression Census #45656208630 passed; Pages #45658428453 succeeded.
- Main Census #45658441307 attempt 1: preflight, preview, hosted-pages smoke, Node shards 0–3 and browser shards 0/2/3 passed. Browser shard 1 failed `ai_defensive_third_man_runner_cover_browser_qa.py` plus `lan_auto_two_browser_qa.py` (10-second Playwright timeout); failed-job-only attempt 2 is pending.
- Main branch protection #87 remains unresolved; #48 and #86 remain open.

## Cleanup
Keep this file below 4 KiB with these headings and exact Agent ID. Never bypass CI, security or QA promotion.