# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
Updated: 2026-11-27

## Mission
Prioritize responsive football gameplay, intelligent passing/tackling and counterable tricks, then existing-player graphics, goalkeeper, Player Studio and Career/Cup. Preserve 223 teams, 2,676 players/order/ratios, six formations, four actions, saves and offline play.

## Current checkpoint
- 0.12.81.378 — AI-GOALMOUTH-PASS-TURN-LEAD-01.
- CPU final-third square passes now lead a receiver through the existing Agility-limited turn projection when both live movement axes are available. High-Agility cuts toward goal receive a more forward-angled point; low Agility retains more cross-lane momentum.
- The existing 0.12-second horizon and ±24-unit per-axis cap remain. Neutral/invalid steering and incomplete movement axes retain the prior linear target. Defender safety, pass launch, four actions, saves, rosters, persistence and offline play remain unchanged.
- Production: `src/modules/ai.js`; focused Node and actual-engine desktop/simulated-touch Chromium regressions added to `ai_goalmouth_pass`.

## Next smallest action
- Verify exact-head Modular QA and all four Node/four Chromium Full Regression Census shards for .378; repair only confirmed failures without weakening production assertions.
- If the exact dev head is green, allow the existing QA-gated promotion pipeline to advance main; independently verify main Census, Pages deployment and hosted bytes.
- Then continue the gameplay backlog with defensive through-ball interception and counterable Magic Trick reads.

## Ownership and exclusions
Update only this checkpoint. No new branches, force-push, history rewrite, security bypass, unapproved concept heroes, copied graphics, roster/stat edits, save-schema changes or fifth action. #87 main protection, #86 Render drift and #48 physical two-phone acceptance remain open. No physical LAN certification or authenticated online-hosting claim.

## Evidence
- Previous dev/main head: `e90088c3a54947095a9770fea80b30e844e1e8fc`; .377 dev Census #46051721276 passed all eight shards and promotion succeeded.
- Main .377 Census #46052845948 passed preflight, preview, all four Node/four Chromium shards and hosted Pages smoke; Pages deployment #46052836671 succeeded.
- GitHub REST reports `main.protected=false` and `dev.protected=false`.

## Cleanup
Keep this checkpoint below 4 KiB. Update only this file for this agent; leave other checkpoints untouched.
