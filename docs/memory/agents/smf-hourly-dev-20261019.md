# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-25

## Mission
Deliver player-facing gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup improvements. Preserve canonical data, four actions, compatible saves and offline play.

## Current checkpoint
- **0.12.81.309 — LIGHTNING-READY-TARGET-REVALIDATION-01:** Lightning selects the nearest available opponent, skips downed/invulnerable/shot-impact/hurt-recovery decoys, and fizzles without stun if its marked defender becomes unavailable during the 0.32-second warning. Existing JUMP, grounded SHOOT-slide and facing/closing counters remain.
- If no ready target exists, activation is rejected without cooldown or fatigue. Gold+ tier gate, six-second cooldown, .045 fatigue cost, possession and four-button grammar remain unchanged.

## Branches and release
- Starting dev/main SHA: `74cad1b16a1fc408bb89f46a84e57e1e309f8993` (.308); dev and main were identical before this candidate.
- .308 Modular QA #45702609105 passed; .308 Full Regression Census #45702608998 passed all four Node and four Chromium shards. QA-gated promotion was already complete.
- .308 Pages deployment #45704217763 and independent main Census #45704229683 passed, including hosted-pages smoke.
- .309 is committed on dev; exact-head Modular QA and Full Regression Census must pass before promotion. It is not certified or deployed by this checkpoint.

## Ownership and exclusions
Preserve 223 teams, 2,676 player identities/order and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept heroes or copied graphics. Studio art requires provenance, game-scale QA and owner acceptance. Keep #48 physical acceptance, #86 Render drift and #87 branch-protection security open. No authenticated online-hosting claim.

## Next smallest action
Complete exact-head Modular QA and Full Regression Census for the .309 Lightning counterplay candidate; fix confirmed failures, then allow only a fully green exact head through the existing QA-gated promotion.

## Next five product improvements
1. Improve CPU primary/support tackle timing using ball exposure, carrier momentum and approach angle.
2. Continue counterable Magic Trick reads with readable windups and skill-appropriate response windows.
3. Advance existing-player eight-view running/jump/tackle animation through SuperMagicAssetStudio and game-scale screenshot QA.
4. Improve goalkeeper low-cross dive/catch transitions and second-ball recovery.
5. Improve Player Studio live preview and Career/Cup fixture-history/standings depth without changing ten save slots.

## Evidence
- .308 Modular QA #45702609105: passed.
- .308 Full Regression Census #45702608998: all four Node and four Chromium shards passed.
- .308 Pages #45704217763 and main Census #45704229683: passed.
- .309 focused and exact-head CI: pending.

## Cleanup
Keep this file below 4 KiB with these headings and exact Agent ID. Never bypass CI, security or QA promotion.
