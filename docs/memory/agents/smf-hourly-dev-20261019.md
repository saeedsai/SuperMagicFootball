# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-25

## Mission
Deliver player-facing football gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup improvements. Preserve canonical data, four match actions, compatible saves and offline play.

## Current checkpoint
- **0.12.81.307 — AI-SLIDE-AGILITY-EVASION-LEAD-01:** CPU SHOOT slides that have validated an exposed carried ball now scale their short lead by the carrier's Agility. Average 50 preserves 85 ms; high 100 shortens to 70 ms; low 1 extends to 99.7 ms, bounded 70–100 ms. The existing 22-unit per-axis cap and slide/contact physics remain.
- The adjustment is restricted to CPU slide calls with a validated live-ball context. Human/contextual slides, ordinary PASS pokes and Magic Trick counter slides without that context retain their prior lead.
- Focused Node and actual-engine desktop/simulated-touch Chromium regressions cover both goals, rating fallback, cap and unchanged baseline paths.

## Branches and release
- Parent dev/main head before this candidate: `ebcba574a2ba7c9e210fe7da9909a66ab13ad8f7` (.306).
- .306 has now passed all four Node and all four Chromium Census shards; QA-gated promotion, Pages deployment and independent main Census/hosted-pages smoke succeeded on the same SHA.
- .307 is a new dev candidate; exact-head Modular QA and Full Regression Census are pending.

## Ownership and exclusions
Preserve 223 teams, 2,676 player identities/order and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept heroes or copied graphics. Studio art requires provenance, game-scale QA and owner acceptance. Keep #48 physical acceptance, #86 Render drift and #87 branch-protection security open. No authenticated online-hosting claim.

## Next smallest action
Run exact-head Modular QA and four-Node/four-Chromium Full Regression Census for .307. Fix only confirmed failures. Promote only a green exact head through the existing QA-gated pipeline; independently verify main Census, Pages and hosted bytes.

## Evidence
- .306 Modular QA #45693591404: 2,915/2,915 passed.
- .306 Full Regression Census #45693591814: preflight, preview, all four Node and all four Chromium shards passed; QA-gated promotion succeeded.
- .306 Pages deployment #45695498198 and independent main Census #45695508898 passed, including hosted-pages smoke.
- .307 focused Node and Chromium regressions are included; CI results pending.

## Cleanup
Keep this file below 4 KiB with these headings and exact Agent ID. Never bypass CI, security or QA promotion.
