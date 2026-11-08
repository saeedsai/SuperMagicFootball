# SuperMagicFootball — hourly developer checkpoint
**Agent ID:** smf-hourly-dev-20261019
**Updated:** 2026-11-08

## Mission
Small regression-backed dev increments. Preserve 223 teams, 2676 players, six formations, four controls, offline saves, Career/Cup ten slots and SD09.

## Current checkpoint
- Candidate 0.12.81.66 already contains the low held-Dribble Breath drain (.04–.07/s), walking recovery and selected-local-human-only ring.
- Previous run committed minimum-Stamina two-second carry test a7be2245 and checkpoint abca7279; execution unverified.
- This run committed a99becbe: Node boundary regression across four Stamina levels covering walking recovery through analog magnitude .55, and sprint-vs-ordinary contrast at .56/.75/1.
- No player-facing code changed; version stays 0.12.81.66.
- GitHub repo main was 828a4549 and dev was two commits ahead before a99becbe. Container cannot resolve github.com for checkout, so Node, Chromium and Modular QA were not executed locally.

## Next smallest action
Verify exact dev SHA and CI for a99becbe; run focused Node, four Node and four Chromium shards and Modular QA. Correct failures before release; verify protected promotion and hosted Pages bytes. Then advance Player Studio, four-button Magic Tricks, eight-view art, keeper and Career.

## Ownership and exclusions
Only this checkpoint; no other agent memories. No new branches, force-push or CI bypass. Physical two-phone LAN #48 remains unverified; Render #86 and protection #87 remain open.

## Evidence
GitHub contents API accepted a99becbe. Test is committed, NOT yet executed. No new deployment or physical acceptance claim.

## Cleanup
Under 4 KiB.
