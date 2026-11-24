# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-24

## Mission
Deliver real player-facing football gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup. Preserve four actions, canonical rosters, compatible saves and offline play.

## Current checkpoint
- **0.12.81.260 — AI-LOOSE-BALL-LANDING-MOMENTUM-READ-01:** validated high loose-ball and fresh ground-spill primary selection now uses a bounded 0.12-second defender velocity projection. A closing defender can beat a slightly nearer retreating defender; each score adjustment is capped at 13.2 units. The second defender retains geometric goal-side cover; ordinary/stale/hidden fallback remains distance-first.
- Mirrored Node and actual-engine desktop/simulated-touch Chromium regressions cover both teams, momentum direction, landing-versus-live-ball distance, fallback, four actions and 223 teams. Exact-head QA/Census pending.
- .259 follow-up #45373310802/#45373310806 exposed one remaining fixture typo `xMax:field.x+F.w-24`; this correction uses `field.w`. The earlier high-ball fixture and Hide Ball contract corrections are included. No production gameplay failure was reported.
- **0.258 main-promoted and Pages deployed:** dev QA #45362849733 passed 2,846/2,846; dev Census #45362849673 passed all eight shards on `6b6d839399699341f23a11a07cc20be4d95d2553`; promotion and Pages #45364600064 succeeded. Independent main Census #45364610881 failed attempt 2 only in `lan_render_hosted_browser_qa.py` (browser shard 0, 45-second Playwright wait); all other shards and hosted-pages smoke passed. No LAN source changed.
- Main protection #87 remains open; REST reports `protected=false`. Physical #48 and Render drift #86 remain open. No physical-device or authenticated-online-hosting claim.

## Next smallest action
Inspect .260 exact-head Modular QA and Full Regression Census after the fixture correction; fix only confirmed failures. Promote only the exact green dev head through the existing QA-gated pipeline and independently verify Pages/main Census/hosted bytes.

## Ownership and exclusions
Preserve 223 teams, 2,676 players, ordering and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. Graphics issue #10 still has an active renderer lock; do not edit art until released. No concept heroes or copied graphics. Do not claim unverified art, device or hosting acceptance.

## Evidence
- .258 dev Modular QA and Full Regression Census passed; .258 promotion and Pages deployment succeeded.
- .258 independent main Census attempt 2 failed only the hosted LAN browser script; #86 remains open and no LAN source changed.
- .260 gameplay source and focused Node/desktop/simulated-touch regressions committed on dev; exact-head CI pending.

## Cleanup
Keep this file below 4 KiB with all required headings and exact Agent ID. Never bypass CI, security or QA promotion.
