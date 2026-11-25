# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-25

## Mission
Deliver player-facing football gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup improvements. Preserve canonical data, four match actions, compatible saves and offline play.

## Current checkpoint
- **0.12.81.308 — AI-SLIDE-AGILITY-EVASION-LEAD-01:** CPU SHOOT slides with a validated exposed carried ball scale their short lead by the selected carrier's Agility. Average 50 preserves 85 ms; high 100 shortens to 70 ms; low 1 extends to 99.7 ms, bounded 70–100 ms. The existing 22-unit cap and slide/contact physics remain.
- The .307 attempt failed one new Node assertion because it read Agility from the ball object rather than its carrier. .308 corrects the source and explicitly asserts live-ball exposure in Node and Chromium.
- Human/contextual slides, ordinary PASS pokes and Magic Trick counter slides without live-ball context retain their prior lead.

## Branches and release
- Parent dev/main head before .307: `ebcba574a2ba7c9e210fe7da9909a66ab13ad8f7` (.306).
- .306 passed all four Node and Chromium Census shards; QA-gated promotion, Pages deployment and independent main Census/hosted smoke succeeded.
- .307 commit `11918cb986b4f516536cd6fd930557c26dad5560` is an uncertified failed candidate.
- .308 is the corrected dev candidate; exact-head Modular QA and Full Regression Census are pending.

## Ownership and exclusions
Preserve 223 teams, 2,676 player identities/order and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept heroes or copied graphics. Studio art requires provenance, game-scale QA and owner acceptance. Keep #48 physical acceptance, #86 Render drift and #87 branch-protection security open. No authenticated online-hosting claim.

## Next smallest action
Run exact-head Modular QA and four-Node/four-Chromium Census for .308. Fix confirmed failures only. Promote only a green exact head through the existing QA-gated pipeline; independently verify main Census, Pages and hosted bytes.

## Evidence
- .306 Modular QA #45693591404 passed 2,915/2,915.
- .306 Census #45693591814 passed all four Node and four Chromium shards; promotion succeeded.
- .306 Pages #45695498198 and independent main Census #45695508898 passed, including hosted-pages smoke.
- .307 Node preflight #45702213164 failed the new slide-lead assertion; .308 focused regressions pending.

## Cleanup
Keep this file below 4 KiB with these headings and exact Agent ID. Never bypass CI, security or QA promotion.
