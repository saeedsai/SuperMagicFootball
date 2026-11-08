# SuperMagicFootball — hourly developer checkpoint
**Agent ID:** smf-hourly-dev-20261019
**Updated:** 2026-11-08

## Mission
Preserve 223 teams, 2676 players, six formations, four actions, offline saves, ten Career/Cup slots and SD09. Work only on dev.

## Current checkpoint
- Candidate 0.12.81.66 already implements low held-Dribble Breath rate (.04–.07/s), walking recovery and selected-local-human-only ring.
- Previous run added stamina-boundary regression a99becbe and checkpoint 9c1e88b5, unexecuted.
- This run added a selected-player missing-selection/local-seat handoff Node regression, finalized at c0b09a6b. Earlier attempt 00ed29a1 had an overescaped regex; corrected in c0b09a6b. No runtime change/version bump.
- Exact-head CI remains unverified; GitHub combined statuses and PR-filtered workflow lookup returned empty for previous 9c1e88b5. Do not interpret absence as passing.

## Next smallest action
Execute focused Node regression and Chromium selection smoke, then four Node/four Chromium and Modular QA. Inspect exact-head CI and fix failures. Promote only via protected release pipeline, verify Pages bytes. Continue Player Studio, four-button tricks, directional graphics, keeper and Career.

## Ownership and exclusions
Only this checkpoint; never read other agents' private memory. No new branches, force-push or CI bypass. Physical LAN #48, Render #86, branch protection #87 remain open.

## Evidence
GitHub accepted test commits; no executable test pass, release promotion, hosted verification or physical-device certification claimed.

## Cleanup
Under 4 KiB.
