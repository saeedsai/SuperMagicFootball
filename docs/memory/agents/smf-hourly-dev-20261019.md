# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
Updated: 2026-11-28

## Mission
Prioritize responsive football gameplay, intelligent passing/tackling and counterable tricks, then existing-player graphics, goalkeeper, Player Studio and Career/Cup. Preserve 223 teams, 2,676 players/order/ratios, six formations, four actions, saves and offline play.

## Current checkpoint
- Candidate **0.12.81.401** adds `KEEPER-HIGH-CROSS-TURN-THREAT-READ-01`: the CPU goalkeeper now projects an active cross attacker through its bounded 120 ms Agility-limited turn before deciding whether a contested high cross needs a punch. High-Agility turn-in remains a threat; high-Agility turn-away no longer creates a false punch. Low-Agility and neutral/aligned fallback retain the prior per-axis 36-unit projection.
- Production scope: `src/modules/ai.js`; focused Node and actual-GameEngine desktop/simulated-touch regressions in `tests/keeper_contested_cross_punch.test.cjs` and `tests/keeper_contested_cross_punch_browser_qa.py`.
- Release surfaces: About-only .401, package, root README banner/heading, version policy, service-worker cache identity and master backlog updated together.

## Next smallest action
- Verify .401 Modular QA and exact-head Full Regression Census; fix any confirmed turn-in/turn-away, keeper punch or browser fixture failure without weakening the arrival or safety checks.
- Continue responsive ground/through-ball interception and counterable Magic Tricks, then Studio-backed existing-player graphics, goalkeeper dive/catch, Player Studio and Career/Cup.

## Ownership and exclusions
Update only this checkpoint. No new branch, force-push, history rewrite, security bypass, unapproved concept heroes, copied graphics, roster/stat edits, save-schema changes or fifth action. Keep #87 main protection, #86 Render drift and #48 physical two-phone acceptance open. No physical LAN certification or authenticated online-hosting claim.

## Repository heads
- Run start dev/main: `6aeb1e2bee4afde0f2f933a1c0a4d5318c333946`.
- Candidate head: pending .401 commit; verify exact SHA from GitHub Actions.

## Evidence
- .400 Full Regression Census #46116083516 passed preflight, preview, all four Node and all four Chromium shards; QA-gated promotion succeeded.
- Main Census #46116895720 passed all eight shards and hosted-pages smoke; Pages deployment #46116889123 succeeded on the same .400 SHA.
- .401 exact-head gates pending; local tests not run in this connected-source runtime.

## Cleanup
Keep this checkpoint below 4 KiB. Update only this file for this agent; leave all other agent checkpoints untouched.
