# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-27

## Mission
Prioritize responsive football gameplay, intelligent passing/tackling and counterable Magic Tricks, then existing-player graphics, goalkeeper, Player Studio and Career/Cup. Preserve 223 teams, 2,676 players, exact ordering/ratios, six formations, four actions, saves and offline play.

## Current checkpoint
- **0.12.81.359 — HUMAN-EXPOSED-BALL-ARC-SLIDE-READ-01:** a validated low/exposed live ball may bring its carrier into the existing forward slide arc before the carrier's body center does. Pass/Shoot slides can now contest that ball without broadening slide travel or accepting shielded/off-arc balls.
- **Production:** src/modules/engine.js, GameEngine.tackle; no new action, save field, player rating or ball-physics change.
- **Regression:** extended tests/human_exposed_ball_slide.test.cjs and tests/ai_defensive_poke_commit_browser_qa.py for actual-GameEngine desktop/simulated-touch behavior, both teams/actions, shielded fallback, four actions and 223 teams.
- **.358 gate repair:** ai_defensive_poke_commit_browser_qa.py now clears first-touch, trick and hazard state in the isolated contact-boundary fixture. .358 Census #45961088679 had four Node shards and three Chromium shards pass; browser shard 1 failed this fixture. .358 is not certified.
- **.359 is a dev candidate; do not call it released until exact-head Census, Modular QA, gated promotion, main Census, Pages and hosted-byte smoke are independently green.

## Next smallest action
Inspect .359 exact-head Modular QA and all four Node/four Chromium Census shards. Fix confirmed failures without weakening assertions. If green, allow the existing QA-gated main pipeline; independently verify main Census, Pages deployment and hosted bytes. Then advance a distinct ball-control/tackling or counterable-trick behavior; keep existing-player graphics Studio-backed and owner-reviewed.

## Ownership and exclusions
Read and update only this checkpoint. No new branches, force-push, history rewrite, security bypass, unapproved concept heroes, copied graphics, roster/stat edits, save-schema changes or fifth action. #87 main protection, #86 Render drift and #48 physical two-phone acceptance remain open. No physical LAN certification or authenticated online-hosting claim.

## Evidence
- .358 Modular QA #45961088748 passed source/data checks.
- .358 Full Regression Census #45961088679: preflight/preview and all four Node shards passed; browser shards 0, 2 and 3 passed; browser shard 1 failed ai_defensive_poke_commit_browser_qa.py at contact-boundary. The fixture reset and .359 actual-slide regression are committed for exact-head revalidation.
- Current pre-.359 dev head: 872bfd7382d87ec4c7781508519456fe25350764; main: f5c473c799589a34798dc29c24bdcdc554ab6791. Both branches are reported unprotected; #87 remains open.

## Cleanup
Keep this checkpoint below 4 KiB. Update only this file for this agent's handover; leave other checkpoints untouched.
