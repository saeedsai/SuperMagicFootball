# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
Updated: 2026-11-28

## Mission
Prioritize responsive football gameplay, intelligent passing/tackling and counterable tricks, then existing-player graphics, goalkeeper, Player Studio and Career/Cup. Preserve 223 teams, 2,676 players/order/ratios, six formations, four actions, saves and offline play.

## Current checkpoint
- Candidate **0.12.81.400** adds `KEEPER-PARRY-REBOUND-FUTURE-ARRIVAL-01`: parry-rebound races now compare the keeper and active outfielders at a bounded future horizon. The horizon cannot outlive the parry collection window, and the keeper's own projected turn is capped by its actual speed. A moving keeper no longer yields to a closer stationary teammate; a teammate projected to arrive first still receives the handoff, and the existing conservative opponent veto remains.
- Production scope: `src/modules/ai.js`; focused Node and actual-GameEngine desktop/simulated-touch regressions in `tests/keeper_parry_rebound_chase.test.cjs` and `tests/keeper_parry_rebound_chase_browser_qa.py`.
- Release surfaces: About-only .400, package, root README banner/heading, version policy, service-worker cache identity and master backlog updated together.
- Run-start dev/main SHA: `664d6a59d3445100a96c2ae4a2f9f3fd715bd131`. Candidate .400 exact-head validation pending at checkpoint creation.

## Next smallest action
- Verify .400 Modular QA and exact-head Full Regression Census. Fix any confirmed failure without weakening the future-arrival, keeper reach, opponent-safety or teammate-handoff assertions.
- Continue through-ball/interception and remaining Magic Trick counterplay, then existing-player Studio graphics, goalkeeper decisions, Player Studio and Career/Cup.

## Ownership and exclusions
Update only this checkpoint. No new branch, force-push, history rewrite, security bypass, unapproved concept heroes, copied graphics, roster/stat edits, save-schema changes or fifth action. Keep #87 main protection, #86 Render drift and #48 physical two-phone acceptance open. No physical LAN certification or authenticated online-hosting claim.

## Repository heads
- Run start: dev/main `664d6a59d3445100a96c2ae4a2f9f3fd715bd131`.
- Candidate head: current `dev` branch after the .400 feature commit; verify exact SHA from GitHub Actions.

## Evidence
- Prior .399 exact-head Full Regression Census #46110457825 passed preflight, preview, all four Node and all four Chromium shards; QA-gated promotion job succeeded.
- Main .399 Full Regression Census #46111294768 and Pages deployment #46111289090 completed successfully at the same SHA, including hosted-pages smoke.
- Local git clone/test execution remains unavailable in this runtime; use connected GitHub source and exact-head Actions diagnostics, and report local tests as not run.

## Cleanup
Keep this checkpoint below 4 KiB. Update only this file for this agent; leave all other agent checkpoints untouched.
