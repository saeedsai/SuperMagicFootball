# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-26

## Mission
Prioritize responsive football gameplay, intelligent passing/tackling and counterable Magic Tricks, then existing-player graphics, goalkeeper, Player Studio and Career/Cup. Preserve canonical data, four actions, compatible saves and offline play.

## Current checkpoint
- **0.12.81.339 — PASS-POKE-STRIKE-DIRECTION-STATE-01:** normal PASS pokes now record their actual target vector in live dx/dy and horizontal face before the existing 16-unit advance. The punch pose and follow-up counter reads therefore use the same direction as the selected target; range/arc, lead, contact, cooldown/stamina, slide physics and possession remain unchanged.
- .338's new Spin/Sand selected-human backup and Hide Ball backup behavior remains in production. Exact-head Census #45875058667 exposed two browser failures: the existing-human Spin Bump JUMP acceptance and Hide Ball backup poke resolver acceptance. .339 adjusts the Spin resolver fixture isolation and aligns punch facing with its actual target vector; the Hide Ball browser check now asserts the real facing direction.
- No new control, auto-tackle, save field, roster, formation, save-schema or online protocol change.

## Next smallest action
Inspect exact-head .339 Modular QA and all four Node/four Chromium Census jobs. Fix confirmed failures, then allow only a fully green exact head through the existing QA-gated main pipeline. Independently verify main Census, Pages deployment and hosted bytes. Continue with a distinct responsive football/AI or Player Studio improvement.

## Ownership and exclusions
Preserve 223 team and 2,676 player identities/order and 12-player ratios, six formations, exactly four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept-hero creation or copied art. Keep #48 physical acceptance, #86 Render drift and #87 main protection unresolved until independently verified. Do not claim physical-device certification or authenticated online hosting.

## Evidence
- Starting dev SHA: `ba53a12b4849cbe5293827fcfedfee7dc88d2552`; main SHA: `a8edae04834d16a11292617e8d0d52abbd66eb4f`.
- .338 Modular QA #45875058696 passed; .338 Full Regression Census #45875058667 had two observed browser failures and remaining shards were still running at inspection.
- Main .336 exact-head Census #45846445829 and Pages deployment #45846426105 passed; hosted Pages smoke passed.
- GitHub REST reports `main.protected=false` and `dev.protected=false`; #87 remains open. #48 and #86 remain open.

## Cleanup
Only this agent's checkpoint was replaced. No LAN/P2P, roster, concept art, save-schema or online-hosting changes.
