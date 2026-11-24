# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-24

## Mission
Deliver real player-facing football gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup. Preserve four actions, canonical rosters, compatible saves and offline play.

## Current checkpoint
- **0.12.81.259 — AI-LOOSE-BALL-LANDING-ARRIVAL-ASSIGNMENT-01:** for validated descending high loose balls and fresh low ground spills, CPU press roles are selected against the shared predicted landing point. The best-positioned available defender becomes primary; the next eligible defender can hold the existing 26-unit goal-side cover. Passes, shots, stale/invalid balls and concealed positions retain the existing live/known-ball fallback.
- First exact-head Modular QA/Census preflight exposed three test-contract issues: an old high-ball fixture still assumed live-ball-nearest primary, the new spill fixture had an undefined `F`, and Hide Ball's source regex expected the old inline `owner||b` call. Test fixtures/contracts corrected without weakening gameplay; exact-head reruns pending.
- **0.12.81.258 main-promoted and Pages deployed:** Modular QA #45362849733 passed 2,846/2,846; dev Census #45362849673 passed all eight shards on `6b6d839399699341f23a11a07cc20be4d95d2553`; QA-gated promotion and Pages #45364600064 succeeded. Independent main Census #45364610881 failed attempt 2 only in `lan_render_hosted_browser_qa.py` (browser shard 0, 45-second wait); all other shards and hosted-pages smoke passed. This remains a hosted-browser issue; no LAN source changed.
- Main protection #87 remains open; REST reports `protected=false`. Physical #48 and Render drift #86 remain open. No physical-device or authenticated-online-hosting claim.

## Next smallest action
Verify corrected .259 exact-head Modular QA and Full Regression Census. Fix only confirmed failures; then allow only the green exact dev head through the existing QA-gated promotion pipeline and independently verify Pages/main Census/hosted bytes.

## Ownership and exclusions
Preserve 223 teams, 2,676 players, ordering and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept heroes or copied graphics. Do not read/edit another agent's checkpoint or claim unverified art, device or hosting acceptance.

## Evidence
- .258 dev Modular QA and Full Regression Census passed; .258 promotion and Pages deployment succeeded.
- .258 independent main Census attempt 2 failed only the hosted LAN browser script; #86 remains open and no LAN source changed.
- .259 gameplay source and focused Node/desktop/simulated-touch regressions committed on dev; exact-head reruns pending.

## Cleanup
Keep this file below 4 KiB with all required headings and exact Agent ID. Never bypass CI, security or QA promotion.
