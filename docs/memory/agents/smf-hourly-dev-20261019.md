# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-26

## Mission
Prioritize responsive football gameplay, intelligent passing/tackling and counterable Magic Tricks, then existing-player graphics, goalkeeper, Player Studio and Career/Cup. Preserve canonical data, four actions, compatible saves and offline play.

## Current checkpoint
- **0.12.81.337 — HIDE-BALL-HUMAN-MARKER-BACKUP-COUNTER-01:** when the nearest ready Hide Ball marker is the selected human and has not started a valid grounded PASS poke, one ready CPU teammate within the existing 70-unit facing cone backs them up using the normal difficulty reaction delay. The human retains control. A valid active human/teammate poke prevents duplication; a misaligned backup cannot cancel the trick.
- Production changes are in `src/modules/engine.js`: the Hide Ball AI reaction selects the eligible backup and the actual resolver accepts its grounded PASS poke from any ready in-range defender. No new control, auto-tackle, possession, physics, save, roster or offline contract was changed.
- Focused Node regressions cover both sides, successful handoff, human no-duplicate and misaligned backup. New actual-engine desktop/simulated-touch browser acceptance covers `driveAI`, `tryMagicTrick`, possession, human selection and exactly four actions.
- First exact-head Census #45871629435 exposed two release-contract assertions, not a gameplay assertion: Studio playbook expected the resolver's local `rival` name, and version policy requires the service-worker first line to match .337. Both are corrected in the follow-up commit; fresh gates are required.

## Next smallest action
Inspect exact-head .337 follow-up Modular QA and all four Node/four Chromium Census jobs. Fix confirmed failures, then allow only a fully green exact head through the existing QA-gated main pipeline. Independently verify main Census, Pages deployment and hosted bytes. Continue with a distinct responsive football/AI or Player Studio improvement; avoid repetitive Agility-only reads.

## Ownership and exclusions
Preserve 223 team and 2,676 player identities/order and 12-player ratios, six formations, exactly four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept-hero creation or copied art. Keep #48 physical acceptance, #86 Render drift and #87 main protection unresolved until independently verified. Do not claim physical-device certification or authenticated online hosting.

## Evidence
- Starting dev/main SHA: `a8edae04834d16a11292617e8d0d52abbd66eb4f`; .336 exact-head dev Census #45836851049 passed all four Node and four Chromium shards and its QA-gated promotion succeeded.
- Main .336 independent Census #45846445829 passed preflight, preview, hosted-pages smoke, all four Node shards and all four Chromium shards.
- Pages deployment #45846426105 completed successfully.
- GitHub REST reports `main.protected=false` and `dev.protected=false`; #87 remains open. #48 and #86 remain open.

## Cleanup
Only this agent's checkpoint was replaced. No LAN/P2P, roster, concept art, save-schema or online-hosting changes.
